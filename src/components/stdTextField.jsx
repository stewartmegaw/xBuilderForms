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
      var _this = this;

      if (this.props.muiProps) {
        require.ensure([], require => {
          var component = require("./mui/textFieldMUI");
          _this.setState({ stdTextFieldMUI: component });
        });
      }
    }

    render() {
      var p = this.props;
      var s = this.state;

      var commonProps = {
        id: p.id,
        name: p.name,
        style: p.style || {},
        className: p.className,
        value: p.value,
        type: p.field.type || "text"
      };

      if (!p.muiProps) {
        // Only allow extra props that are defined below
        var extraProps = {};
        extraProps.onChange = e => {
          p.onChange(e.target.value, e);
        };
        extraProps.onBlur = p.events.onBlur;
        extraProps.placeholder = p.placeholder || p.field.label;

        if (p.error_msgs) {
          if (p.errorClass)
            extraProps.className = [commonProps.className, p.errorClass].join(
              " "
            );
        }

        return commonProps.type == "textarea" ? (
          <textarea {...commonProps} {...extraProps} />
        ) : (
          <input {...commonProps} {...extraProps} />
        );
      }

      if (!s.stdTextFieldMUI) return null;

      return (
        <s.stdTextFieldMUI
          field={p.field}
          onChange={(value, e) => p.onChange(value, e)}
          commonProps={commonProps}
          muiProps={p.muiProps}
          events={p.events}
          error_msgs={p.error_msgs}
        />
      );
    }
  }
);
