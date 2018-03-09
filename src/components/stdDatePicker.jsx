const React = require("react");

import Component from "./wrappers/component";

module.exports = Component(
  class StdDatePicker extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        stdDatePickerMUI: null
      };
    }

    componentWillMount() {
      let _this = this;

      if (this.props.manualProperties.muiProps) {
        import("./mui/datePickerMUI").then(component => {
          _this.setState({ stdDatePickerMUI: component });
        });
      }
    }

    getLocalTime(time) {
      let d = new Date(Number(time));
      let userOffset = d.getTimezoneOffset() * 60000;
      return d.getTime() - userOffset;
    }

    render() {
      let p = this.props;
      let s = this.state;

      let commonProps = Object.assign({}, p.stdProps, {
        name: "dummy" + p.stdProps.name,
        value: !p.stdProps.value
          ? ""
          : new Date(this.getLocalTime(p.stdProps.value)),
        style: p.style || {},
        className: p.className,
        ["data-ignore"]: true,
        onFocus: p.events.onFocus
      });

      let picker = null;

      // if (p.customRender) {
      //   let onChange = (d, event) => {
      //     let date = d;
      //     // date can be a string like yyyy-mm-dd or a Date object
      //     if (Object.prototype.toString.call(date) === "[object String]") {
      //       date = new Date(date);
      //     }
      //     _this.onChange(date ? date.getTime() : "", event);
      //   };
      //   picker = p.customRender(commonProps, onChange);
      // } else {
      if (!p.manualProperties.muiProps) {
        picker = (
          <input
            type="date"
            onChange={e => {
              p.onChange(
                e.target.value ? new Date(e.target.value).getTime() : "",
                e
              );
            }}
            {...commonProps}
            value={
              commonProps.value
                ? commonProps.value.toISOString().substring(0, 10)
                : ""
            }
          />
        );
      }

      if (s.stdDatePickerMUI) {
        picker = <s.stdDatePickerMUI {...p} commonProps={commonProps} />;
      }
      // }

      return (
        <span>
          {picker}
          <input
            type="hidden"
            name={p.stdProps.name}
            value={!p.stdProps.value ? "" : this.getLocalTime(p.stdProps.value)}
          />
        </span>
      );
    }
  }
);
