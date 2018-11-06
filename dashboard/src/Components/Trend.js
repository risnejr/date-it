// @flow
import React, { Component } from "react";
import { LineChart, Line, YAxis } from "recharts";
import EventSource from "./EventSource.js";

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
      if (!(typeof event.data === typeof "")) {
        return;
      }
      //$FlowFixMe
      data = JSON.parse(event.data); //
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
      <div className="App">
        <LineChart width={1600} height={850} data={this.state.coordinates}>
          <Line
            strokeWidth={3}
            type="basis"
            dataKey="y"
            stroke="#8884d8"
            animationDuration={2000}
            dot={false}
          />
          <YAxis type="number" domain={[18, 30]} />
        </LineChart>
      </div>
    );
  }
}

export default Trend;
