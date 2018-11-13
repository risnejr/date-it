// @flow
import React, { Component } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  ReferenceLine
} from "recharts";
import EventSource from "./EventSource.js";
import { Paper, Typography, Divider } from "@material-ui/core";

type Props = {
  uuid: string | null,
  header: string
};

type Coordinate = {
  x: number,
  y: Date
};

type State = {
  coordinates: Array<Coordinate>,
  danger: number,
  warning: number
};

class Trend extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      coordinates: [],
      danger: 0,
      warning: 0
    };
  }

  componentDidMount() {
    if (this.props.uuid === null) {
      return;
    }

    let source: EventSource = new EventSource(
      "http://localhost:5000?uuid=" + this.props.uuid
    );
    let data: Object = {};

    source.onmessage = event => {
      if (!(typeof event.data === "string")) {
        return;
      }
      data = JSON.parse(event.data);
      data.node_data.coordinate.x = new Date(data.node_data.coordinate.x);
      this.setState({
        coordinates: [
          ...this.shiftIfBig(this.state.coordinates),
          data.node_data.coordinate
        ]
      });
      if (
        data.alarm_status !== 0 &&
        typeof data.alarm_threshold.overall === "object"
      ) {
        this.setState({
          danger: data.alarm_threshold.overall.outer_high.value,
          warning: data.alarm_threshold.overall.inner_high.value
        });
      }
    };
  }

  shiftIfBig(array: Array<Coordinate>): Array<Coordinate> {
    if (array.length >= 100) {
      array.shift();
    }
    return array;
  }

  render() {
    return (
      <Paper style={{ paddingRight: "5%" }}>
        <Typography variant="display1" align="center">
          {this.props.header}
        </Typography>
        <ResponsiveContainer height={700}>
          <LineChart data={this.state.coordinates}>
            <Line
              strokeWidth={5}
              type="basis"
              dataKey="y"
              stroke="#222f3e"
              animationDuration={500}
              dot={false}
            />
            <YAxis
              axisLine={false}
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={tick => Math.round(tick * 1000) / 1000}
            />
            {this.state.danger !== -1 && (
              <ReferenceLine
                strokeWidth={3}
                y={this.state.danger}
                stroke="#ff6b6b"
                strokeDasharray="3 3"
              />
            )}
            {this.state.warning !== -1 && (
              <ReferenceLine
                strokeWidth={3}
                y={this.state.warning}
                stroke="#feca57"
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    );
  }
}

export default Trend;
