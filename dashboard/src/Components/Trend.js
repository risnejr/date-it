// @flow
import React, { Component } from "react";
import { ResponsiveContainer, LineChart, Line, YAxis, XAxis } from "recharts";
import EventSource from "./EventSource.js";
import { Card } from "@material-ui/core";

type Props = {
  uuid: string | null
};

type Coordinate = {
  x: number,
  y: Date
};

type State = {
  coordinates: Array<Coordinate>
};

class Trend extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      coordinates: []
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
      <ResponsiveContainer width="50%" height="50%">
        <LineChart data={this.state.coordinates}>
          <Line
            strokeWidth={3}
            type="basis"
            dataKey="y"
            stroke="#8884d8"
            animationDuration={2000}
            dot={false}
          />
          <YAxis axisLine={false} type="number" domain={[18, 30]} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

export default Trend;
