// @flow
import React, { Component } from "react";
import EventSource from "./EventSource";
import { Card, Typography, CircularProgress } from "@material-ui/core";

type Props = {
  uuid: string | null
};

type State = {
  value: number
};

class Live extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      value: 0
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
      this.setState({
        value: data.node_data.coordinate.y
      });
    };
  }

  render() {
    return (
      // <Card>
      //   <Typography variant="headline">{this.state.value}</Typography>
      // </Card>
      <Card>
        {this.state.value !== 0 && (
          <Typography variant="display4">{this.state.value}</Typography>
        )}
        {this.state.value === 0 && <CircularProgress />}
      </Card>
    );
  }
}

export default Live;
