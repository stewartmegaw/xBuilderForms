// @flow

import React, { Fragment } from "react";
// import type { Node } from "react";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import type { MuiProps } from "./types";
import type { WrapperProps, ComponentProps } from "../types";

type CommonProps = {
  commonProps: {
    type: string,
    style: {},
    className: string,
    value: number,
    disabled: boolean,
    onClick: Function
  }
};

class ButtonMUI extends React.Component<WrapperProps & ComponentProps & MuiProps & CommonProps> {
  render() {
    let muiProps = Object.assign({}, this.props.manualProperties.muiProps);
    if (!muiProps.label) {
      muiProps.label = this.props.label;
    }

    return (
      <Fragment>
        {this.props.muiButtonType === "FlatButton" ? (
          <FlatButton {...this.props.commonProps} {...muiProps} />
        ) : (
          <RaisedButton {...this.props.commonProps} {...muiProps} />
        )}
      </Fragment>
    );
  }
}

module.exports = ButtonMUI;
