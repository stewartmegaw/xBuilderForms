const React = require("react");

import Component from "./wrappers/component";

module.exports = Component(
  class StdSelect extends React.Component {
    constructor(props) {
      super(props);
      this.getValue = this.getValue.bind(this);
      this.state = {
        stdSelectMUI: null
      };
    }

    componentWillMount() {
      let _this = this;

      if (this.props.muiProps) {
        require.ensure([], require => {
          let component = require("./mui/selectMUI");
          _this.setState({ stdSelectMUI: component });
        });
      }
    }

    getValue() {
      let p = this.props;

      let valuePresent =
        p.value !== null &&
        p.value !== "undefined";

      if (p.field.type === "multiSelect") {
        if (!valuePresent) {
          return [];
        }
        if (p.field.options.valueCast === "string") {
          let vals = [];
          p.value.map(v => {
            vals.push(v.toString());
          });
          return vals;
        }
        return p.value;
      }

      return valuePresent && p.field.options.valueCast === "string"
        ? p.value.toString()
        : p.value;
    }

    render() {
      let p = this.props;
      let s = this.state;

      let value = this.getValue();

      let stdProps = {
        id: p.id,
        name: p.name,
        style: p.style || {},
        className: p.className,
        value: value,
        multiple: p.field.type === "multiSelect" ? true : false
      };

      if (!p.muiProps) {
        stdProps.onChange = e => {
          this.onChange(e.target.value.trim(), e);
        };
        return (
          <select {...stdProps}>
            {p.field.options.valueOptions ? Object.keys(p.field.options.valueOptions.values).map(function(v, i) {
              return (
                <option
                  checked={
                    stdProps.multiple
                      ? value.indexOf(p.field.options.valueOptions.values[i]) > -1
                      : false
                  }
                  value={p.field.options.valueOptions.values[i]}
                  key={i}
                >
                  {p.field.options.valueOptions.text[i]}
                </option>
              );
            }):null}
          </select>
        );
      }

      if (!s.stdSelectMUI) {
        return null;
      }

      return (
        <s.stdSelectMUI
          state={s}
          field={p.field}
          onChange={(v, e) => this.onChange(v, e)}
          stdProps={stdProps}
          muiProps={p.muiProps}
          error_msgs={this.props.error_msgs}
        />
      );
    }
  }
)
