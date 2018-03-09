const React = require("react");

import Component from "./wrappers/component";

module.exports = Component(
  class StdTextField extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        stdTextFieldMUI: null
      };
    }

    componentWillMount() {
      let _this = this;

      if (this.props.manualProperties.muiProps) {
        import("./mui/textFieldMUI").then(component => {
          _this.setState({ stdTextFieldMUI: component });
        });
      }
    }

    render() {
      let p = this.props;
      let s = this.state;

      let commonProps = Object.assign({}, p.stdProps, {
        style: p.style || {},
        className: p.className,
        value: p.stdProps.value || "",
        onChange: e => {
          p.onChange(e.target.value, e);
        },
        onBlur: p.events.onBlur
      });

      if (!p.manualProperties.muiProps) {
        // Only allow extra props that are defined below
        let extraProps = {};
        extraProps.placeholder = p.placeholder || p.label;

        if (p.error_msgs) {
          if (p.errorClass) {
            extraProps.className = [commonProps.className, p.errorClass].join(
              " "
            );
          }
        }

        return commonProps.type === "textarea" ? (
          <textarea {...commonProps} {...extraProps} />
        ) : (
          <input {...commonProps} {...extraProps} />
        );
      }

      if (!s.stdTextFieldMUI) {
        return null;
      }

      return (
        <s.stdTextFieldMUI
          {...p}
          commonProps={commonProps}
        />
      );
    }
  }
);
