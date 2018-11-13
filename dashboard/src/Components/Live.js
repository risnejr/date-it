// @flow
import React, { Component } from "react";
import EventSource from "./EventSource";
import {
  Paper,
  Typography,
  CircularProgress,
  Divider
} from "@material-ui/core";

type Props = {
  uuid: string | null,
  header: string,
  unit: string
};

type State = {
  value: number,
  alarm: string
};

class Live extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      value: 0,
      alarm: ""
    };
  }

  async componentDidMount() {
    if (this.props.uuid === null) {
      return;
    }

    let source: EventSource = new EventSource(
      "http://localhost:5000?uuid=" + this.props.uuid
    );
    let data: Object;
    let alarm: string;
    source.onmessage = event => {
      if (!(typeof event.data === "string")) {
        return;
      }
      data = JSON.parse(event.data);
      switch (data.alarm_status) {
        case 4:
          alarm = "#ff6b6b";
          break;
        case 3:
          alarm = "#feca57";
          break;
        case 2:
          alarm = "#1dd1a1";
          break;
        default:
          alarm = "#576574";
          break;
      }
      this.setState({
        value: Math.round(data.node_data.coordinate.y * 100) / 100,
        alarm: alarm
      });
    };
  }

  render() {
    return (
      <Paper
        style={{ width: "100%", height: "100%", background: this.state.alarm }}
      >
        <Typography
          variant="display1"
          style={{ color: "white", padding: "0.1em 0.5em" }}
        >
          {this.props.header}
        </Typography>
        <Divider style={{ background: "white" }} />
        {this.state.value !== 0 && (
          <div style={{ padding: "1em" }}>
            <Typography
              variant="display4"
              style={{
                color: "white",
                display: "inline-block"
              }}
            >
              {this.state.value}
            </Typography>
            <Typography
              variant="display1"
              style={{
                color: "white",
                display: "inline-block",
                padding: "0.5em"
              }}
            >
              {this.props.unit}
            </Typography>
          </div>
        )}
        {this.state.value === 0 && <CircularProgress />}
      </Paper>
    );
  }
}

export default Live;
