// @flow

import React from "react";
import type { Node } from "react";

import Component from "./wrappers/component";

type Props = {
  id: string,
  name: string,
  className: string
};

type State = {
  stdButtonMUI: Node
};

module.exports = Component(
  class StdButton extends React.Component<Props, State> {
    constructor(props) {
      super(props);

      this.state = {
        stdButtonMUI: null
      };
    }

    componentWillMount() {
      let _this = this;

      if (this.props.manualProperties.muiProps) {
        import("./mui/buttonMUI").then(myMod => {
          _this.setState({ stdButtonMUI: myMod });
        });
      }
    }

    render() {
      let p = this.props;
      let s = this.state;

      let commonProps = Object.assign({}, p.stdProps, { 
        type: p.type,
        style: p.style || {},
        className: p.className,
        value: 1,
        disabled: p.disabled || false,
        onClick: p.events.onClick
      });

      if (!p.manualProperties.muiProps) {
        return <button {...commonProps}>{p.label}</button>;
      }

      if (!s.stdButtonMUI) {
        return null;
      }

      return (
        <s.stdButtonMUI
          {...this.props}
          commonProps={commonProps}
        />
      );
    }
  }
);
