// @flow

import React, { Fragment } from "react";

import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import type { MuiProps } from "./types";
import type { ComponentProps } from "../types";

const ButtonMUI = (props: ComponentProps & MuiProps) => {
  let muiProps = Object.assign({}, props.manualProperties.muiProps);
  if (!muiProps.label) {
    muiProps.label = props.label;
  }

  return (
    <Fragment>
      {props.muiButtonType === "FlatButton" ? (
        <FlatButton {...props.commonProps} {...muiProps} />
      ) : (
        <RaisedButton {...props.commonProps} {...muiProps} />
      )}
    </Fragment>
  );
};

module.exports = ButtonMUI;
