const React = require("react");

import Component from "./wrappers/component";

module.exports = Component(
  class StdButton extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        stdButtonMUI: null
      };
    }

    componentWillMount() {
      var _this = this;

      if (this.props.muiProps) {
        import("./mui/buttonMUI").then(myMod => {
          _this.setState({ stdButtonMUI: myMod });
        });
      }
    }

    render() {
      var p = this.props;
      var s = this.state;

      var stdProps = {
        id: p.id,
        name: p.name,
        type: p.field.type,
        style: p.style || {},
        className: p.className,
        value: 1,
        disabled: p.disabled || false,
        onClick: p.events.onClick
      };

      if (!p.muiProps) {
        var extraProps = {};
        extraProps.onClick = p.events.onClick;
        return <button {...stdProps}>{p.field.label}</button>;
      }

      if (!s.stdButtonMUI) return null;

      return (
        <s.stdButtonMUI
          field={p.field}
          stdProps={stdProps}
          muiProps={p.muiProps}
          muiButtonType={p.muiButtonType}
          events={p.events}
        />
      );
    }
  }
);
