// @flow
import React, { Component } from "react";
import "./App.css";
import Trend from "./Components/Trend";

class App extends Component {
  constructor(props) {
    super(props);
    this.url = new URL(window.location.href);
    this.uuid = this.url.searchParams.get("uuid");
  }

  render() {
    return <Trend uuid={this.uuid} />;
  }
}

export default App;
