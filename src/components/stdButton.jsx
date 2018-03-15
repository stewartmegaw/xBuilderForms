// @flow

import React from "react";
import type { ComponentType } from "react";

import WrapperComponent from "./wrappers/component";

import type { WrapperProps, ComponentProps } from "./types";

// type Props = {
//   id: string,
//   name: string,
//   className: string
// };

type State = {
  stdButtonMUI?: ComponentType<*> | any // TODO: Flow: remove 'any'
};

module.exports = WrapperComponent(
  class StdButton extends React.Component<WrapperProps & ComponentProps, State> {
    constructor(props) {
      super(props);

      this.state = {

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
