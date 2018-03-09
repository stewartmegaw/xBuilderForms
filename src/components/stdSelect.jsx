import React, { Fragment } from "react";

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

      if (this.props.manualProperties.muiProps) {
        import("./mui/selectMUI").then(component => {
          _this.setState({ stdSelectMUI: component });
        });
      }
    }

    getValue() {
      let p = this.props;

      let valuePresent = p.stdProps.value !== null && p.stdProps.value !== "undefined";

      if (p.type === "multiSelect") {
        if (!valuePresent) {
          return [];
        }
        if (p.options.valueCast === "string") {
          let vals = [];
          p.stdProps.value.map(v => {
            vals.push(v.toString());
          });
          return vals;
        }
        return p.stdProps.value;
      }

      return valuePresent && p.options.valueCast === "string"
        ? p.stdProps.value.toString()
        : p.stdProps.value;
    }

    render() {
      let p = this.props;
      let s = this.state;

      let value = this.getValue();

      let commonProps = Object.assign({}, p.stdProps, {
        style: p.style || {},
        className: p.className,
        multiple: p.type === "multiSelect" ? true : false
      });

      delete commonProps.value;

      if (!p.manualProperties.muiProps) {
        let options = p.field.options;

        return (
          <select
            {...commonProps}
            onChange={e => p.onChange(e.target.value.trim(), e)}
          >
            {options.valueOptions ? (
              <Fragment>
                {Object.keys(options.valueOptions.values).map((v, i) => (
                  <option
                    checked={
                      commonProps.multiple
                        ? value.indexOf(options.valueOptions.values[i]) > -1
                        : false
                    }
                    value={options.valueOptions.values[i]}
                    key={i}
                  >
                    {options.valueOptions.text[i]}
                  </option>
                ))}
              </Fragment>
            ) : null}
          </select>
        );
      }

      if (!s.stdSelectMUI) {
        return null;
      }

      return <s.stdSelectMUI {...p} commonProps={commonProps} />;
    }
  }
);
