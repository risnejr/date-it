// @flow
import React, { Component } from "react";
import { LineChart, Line, YAxis } from "recharts";

class Trend extends Component {
  constructor() {
    super();
    this.state = {
      coordinates: []
    };
  }

  componentDidMount() {
    let source = new EventSource(
      "http://localhost:5000?uuid=" + this.props.uuid
    );
    let data = {};

    source.onmessage = event => {
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

  shiftIfBig(array) {
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
            type="monotone"
            dataKey="y"
            stroke="#8884d8"
            animationDuration={500}
            dot={false}
          />
          <YAxis type="number" domain={[18, 30]} />
        </LineChart>
      </div>
    );
  }
}

export default Trend;
