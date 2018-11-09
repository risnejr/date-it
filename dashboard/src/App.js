// @flow
import React, { Component } from "react";
import "./App.css";
import Trend from "./Components/Trend";
import Live from "./Components/Live";

class App extends Component<{}> {
  uuid: string | null;

  constructor() {
    super();
    let url: URL = new URL(window.location.href);
    this.uuid = url.searchParams.get("uuid");
  }

  render() {
    return (
      <div className="flex-grid">
        <Trend class="grid-item" uuid={this.uuid} />
        <Trend class="grid-item" uuid={this.uuid} />
        <Live class="grid-item" uuid={this.uuid} />
        <Live class="grid-item" uuid={this.uuid} />
      </div>
    );
  }
}

export default App;
