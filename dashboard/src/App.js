// @flow
import React, { Component } from "react";
import Trend from "./Components/Trend";
import Live from "./Components/Live";
import { Grid } from "@material-ui/core";

class App extends Component<{}> {
  render() {
    return (
      <Grid
        style={{ padding: "1%" }}
        container
        direction="row"
        justify="space-around"
        alignItems="center"
        spacing={24}
      >
        <Grid item xs={6}>
          <Trend
            uuid="93c433f0-6a2e-4e4a-bfc3-52a0024b6eff"
            header="Temperature last 30 minutes"
          />
        </Grid>
        <Grid item xs={6}>
          <Trend
            uuid="93c433f0-6a2e-4e4a-bfc3-52a0024b6eff"
            header="Temperature last 30 minutes"
          />
        </Grid>

        <Grid item xs={3}>
          <Live
            uuid="93c433f0-6a2e-4e4a-bfc3-52a0024b6eff"
            header="Temperature"
            unit="°C"
          />
        </Grid>
        <Grid item xs={3}>
          <Live
            uuid="550d7751-e005-4b7e-9dce-3a7b798fec1f"
            header="Humidity"
            unit="%"
          />
        </Grid>

        <Grid item xs={3}>
          <Live
            uuid="93c433f0-6a2e-4e4a-bfc3-52a0024b6eff"
            header="Temperature"
            unit="°C"
          />
        </Grid>
        <Grid item xs={3}>
          <Live
            uuid="550d7751-e005-4b7e-9dce-3a7b798fec1f"
            header="Humidity"
            unit="%"
          />
        </Grid>

        {/* <Grid item xs={3}>
          <Live
            uuid="a218e468-caf1-4ae3-814b-6b09712cff1d"
            header="Pressure"
            unit="hPa"
          />
        </Grid>
        <Grid item xs={3}>
          <Live
            uuid="eb75ddf1-0f09-44dd-a869-83f1d4ce1550"
            header="Volatile Gases"
            unit="Ohm"
          />
        </Grid>

        <Grid item xs={3}>
          <Live
            uuid="a218e468-caf1-4ae3-814b-6b09712cff1d"
            header="Pressure"
            unit="hPa"
          />
        </Grid>
        <Grid item xs={3}>
          <Live
            uuid="eb75ddf1-0f09-44dd-a869-83f1d4ce1550"
            header="Volatile Gases"
            unit="Ohm"
          />
        </Grid> */}
      </Grid>
    );
  }
}

export default App;
