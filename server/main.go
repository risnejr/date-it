package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/SKF/go-enlight-sdk/grpc"
	"github.com/SKF/go-enlight-sdk/services/iot"
	"github.com/SKF/go-enlight-sdk/services/pas"
	"github.com/SKF/go-utility/log"
	iotapi "github.com/SKF/proto/iot"
	pasapi "github.com/SKF/proto/pas"
	"google.golang.org/grpc/status"
)

// Config map[functional_location_name]map[asset_name]map[point_name]point_id
type Config map[string]map[string]map[string]string

var verbose *bool

// DialIoT returns an IoTClient client
func DialIoT() iot.IoTClient {
	HOST := "grpc.sandbox.iot.enlight.skf.com"
	PORT := "50051"

	CLIENTCRT := "../certs/iot/client.crt"
	CLIENTKEY := "../certs/iot/client.key"
	CACRT := "../certs/iot/ca.crt"

	client := iot.CreateClient()
	transportOption, err := grpc.WithTransportCredentials(
		HOST, CLIENTCRT, CLIENTKEY, CACRT,
	)
	if err != nil {
		log.
			WithError(err).
			WithField("serverName", HOST).
			WithField("clientCrt", CLIENTCRT).
			WithField("clientKey", CLIENTKEY).
			WithField("caCert", CACRT).
			Error("grpc.WithTransportCredentials")
		return nil
	}

	err = client.Dial(
		HOST, PORT,
		transportOption,
		grpc.WithBlock(),
		grpc.FailOnNonTempDialError(true),
	)
	if err != nil {
		log.
			WithError(err).
			WithField("host", HOST).
			WithField("port", PORT).
			Error("client.Dial")
		return nil
	}

	if err = client.DeepPing(); err != nil {
		log.WithError(err).Error("client.DeepPing")
		return nil
	}
	return client
}

// DialPAS returns a PASClient
func DialPAS() pas.PointAlarmStatusClient {
	HOST := "grpc.point-alarm-status.sandbox.hierarchy.enlight.skf.com"
	PORT := "50051"

	CLIENTCRT := "../certs/pas/client.crt"
	CLIENTKEY := "../certs/pas/client.key"
	CACRT := "../certs/pas/ca.crt"

	client := pas.CreateClient()
	transportOption, err := grpc.WithTransportCredentials(
		HOST, CLIENTCRT, CLIENTKEY, CACRT,
	)
	if err != nil {
		log.
			WithError(err).
			WithField("serverName", HOST).
			WithField("clientCrt", CLIENTCRT).
			WithField("clientKey", CLIENTKEY).
			WithField("caCert", CACRT).
			Error("grpc.WithTransportCredentials")
		return nil
	}

	err = client.Dial(
		HOST, PORT,
		transportOption,
		grpc.WithBlock(),
		grpc.FailOnNonTempDialError(true),
	)
	if err != nil {
		log.
			WithError(err).
			WithField("host", HOST).
			WithField("port", PORT).
			Error("client.Dial")
		return nil
	}

	if err = client.DeepPing(); err != nil {
		log.WithError(err).Error("client.DeepPing")
		return nil
	}

	return client
}

// Stream is a handler that sends SSE packages
func Stream(w http.ResponseWriter, r *http.Request) {
	// Get functional location and asset from url parameters
	query := r.URL.Query()
	uuid := query["uuid"][0]

	fmt.Printf("%v request from %v ", r.Method, r.Header.Get("origin"))
	fmt.Printf("is now streaming values from:\n\t* UUID: %v\n\n", uuid)

	// Make sure that streaming is supported
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Dial and defer connection with gRPC server
	iotClient := DialIoT()
	pasClient := DialPAS()
	defer iotClient.Close()
	defer pasClient.Close()

	// Create a channel who signals that the client is gone
	clientGone := w.(http.CloseNotifier).CloseNotify()
	// Make sure to close client if ctrl+c is invoked
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		iotClient.Close()
		pasClient.Close()
		os.Exit(1)
	}()

	var createdAtTmp int64
	createdAtTmp = 0
	id := 0

	// Poll data from UUID every second
	for {
		select {
		case <-clientGone:
			fmt.Printf("Client %v disconnected from the feed...\n\n", r.RemoteAddr)
			return
		default:
			nodeDataInput := iotapi.GetLatestNodeDataInput{NodeId: uuid, ContentType: 1}
			nodeDataOutput, err := iotClient.GetLatestNodeData(nodeDataInput)
			if err != nil {
				log.Error(err)
				st, _ := status.FromError(err)
				// Retry if status code is Unavailable (14)
				// TODO add exponential backoff and retry
				if st.Code() == 14 {
					iotClient = DialIoT()
				}
			}
			pointData := nodeDataOutput.DataPoint
			createdAt := nodeDataOutput.CreatedAt

			alarmStatusInput := pasapi.GetPointAlarmStatusInput{NodeId: uuid}
			alarmStatus, err := pasClient.GetPointAlarmStatus(alarmStatusInput)
			if err != nil {
				log.Error(err)
				st, _ := status.FromError(err)
				// Retry if status code is Unavailable (14)
				// TODO add exponential backoff and retry
				if st.Code() == 14 {
					pasClient = DialPAS()
				}
			}

			alarmThreshold, err := pasClient.GetPointAlarmThreshold(uuid)
			if err != nil {
				log.Error(err)
				st, _ := status.FromError(err)
				// Retry if status code is Unavailable (14)
				// TODO add exponential backoff and retry
				if st.Code() == 14 {
					pasClient = DialPAS()
				}
			}

			jsonData := map[string]interface{}{"node_data": pointData, "alarm_status": alarmStatus, "alarm_threshold": alarmThreshold}
			sseData, _ := json.Marshal(jsonData)
			if createdAt > createdAtTmp {
				if *verbose {
					fmt.Printf("id: %v\ndata: %s\n\n", id, string(sseData))
				}
				fmt.Fprintf(w, "id: %v\ndata: %s\n\n", id, string(sseData))
				flusher.Flush()
				createdAtTmp = createdAt
				id++
			}
			time.Sleep(time.Second)
		}
	}
}

func main() {
	verbose = flag.Bool("v", false, "verbose")
	flag.Parse()

	fmt.Print("Server is now running on port 5000...\n\n")
	http.HandleFunc("/", Stream)
	if err := http.ListenAndServe(":5000", nil); err != nil {
		log.Error(err)
	}

	return
}
