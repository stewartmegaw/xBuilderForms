const React = require("react");

const Component = require("../wrappers/component");

const StdDatePicker = Component(
  React.createClass({
    getInitialState() {
      return {
        stdDatePickerMUI: null
      };
    },
    componentWillMount() {
      let _this = this;

      if (this.props.muiProps) {
        require.ensure([], require => {
          let component = require("xbuilder-forms/components/stdDatePickerMUI");
          _this.setState({ stdDatePickerMUI: component });
        });
      }
    },
    getLocalTime(time) {
      let d = new Date(Number(time));
      let userOffset = d.getTimezoneOffset() * 60000;
      return d.getTime() - userOffset;
    },
    render() {
      let _this = this;
      let p = this.props;
      let fs = p.formState;
      let s = this.state;

      let stdProps = {
        id: p.id,
        name: "dummy" + p.name,
        style: p.style || {},
        className: p.className,
        "data-ignore": true,
        onFocus: p.events.onFocus,
        value: !fs.data[p.field.name]
          ? ""
          : new Date(this.getLocalTime(fs.data[p.field.name]))
      };

      let picker = null;

      if (p.customRender) {
        let onChange = (d, event) => {
          let date = d;
          // date can be a string like yyyy-mm-dd or a Date object
          if (Object.prototype.toString.call(date) === "[object String]") {
            date = new Date(date);
          }
          _this.onChange(date ? date.getTime() : "", event);
        };
        picker = p.customRender(stdProps, onChange);
      } else {
        if (!p.muiProps) {
          stdProps.onChange = e => {
            this.onChange(
              e.target.value ? new Date(e.target.value).getTime() : "",
              e
            );
          };
          picker = (
            <input
              type="date"
              {...stdProps}
              value={
                stdProps.value
                  ? stdProps.value.toISOString().substring(0, 10)
                  : ""
              }
            />
          );
        }

        if (s.stdDatePickerMUI) {
          picker = (
            <s.stdDatePickerMUI
              formState={fs}
              field={p.field}
              onChange={(v, e) => this.onChange(v, e)}
              stdProps={stdProps}
              muiProps={p.muiProps}
              events={p.events}
              updated={p.updated}
            />
          );
        }
      }

      return (
        <span>
          {picker}
          <input
            type="hidden"
            name={p.name}
            value={!fs.data[p.name] ? "" : this.getLocalTime(fs.data[p.name])}
          />
        </span>
      );
    }
  })
);

module.exports = StdDatePicker;
