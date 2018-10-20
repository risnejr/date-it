import React, { Component } from 'react';
import './App.css';

import { VictoryLine, VictoryChart, VictoryTheme } from 'victory';

class App extends Component {
  constructor(props) {
    super(props)
    this.url = new URL(window.location.href)
    this.funcLoc = this.url.searchParams.get("func_loc")
    this.asset = this.url.searchParams.get("asset")

    this.state = {
      coordinates: [],
      lastValue: -1
    }

  }

  componentDidMount() {
    let source = new EventSource("http://localhost:5000?func_loc=" + this.funcLoc + "&asset=" + this.asset)
    let data = {}
    let pointName = ""

    source.onmessage = event => {
      data = JSON.parse(event.data)
      data.node_data.coordinate.x = new Date(data.node_data.coordinate.x)
      pointName = data.point_name

      if (pointName === "temperature") {
        this.setState({coordinates: [...this.state.coordinates, data.node_data.coordinate],
                       lastValue: data.node_data.coordinate.y})
      }
      else if (pointName === "humidity") {
        this.store.dispatch(newHumidity(data))
      }
    }
  }

  render() {
    return (
      <div className="App">
        <VictoryChart width={600} height={470} scale={{ x: "time" }}>
          <VictoryLine data={this.state.coordinates} interpolation="natural" animate={{duration: 500}}
                       domain={{y:[23,26]}}/>
        </VictoryChart>
      </div>
    );
  }
}

export default App;
