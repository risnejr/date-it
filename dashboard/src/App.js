// @flow
import React, { Component } from "react";
import "./App.css";
import Trend from "./Components/Trend";

class App extends Component<{}> {
  uuid: string | null;

  constructor() {
    super();
    let url: URL = new URL(window.location.href);
    this.uuid = url.searchParams.get("uuid");
  }

  render() {
    return <Trend uuid={this.uuid} />;
  }
}

export default App;
