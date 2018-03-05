const React = require("react");

const Component = require("../wrappers/component");

const StdSelect = Component(
  React.createClass({
    getInitialState() {
      return {
        stdSelectMUI: null
      };
    },
    componentWillMount() {
      let _this = this;

      if (this.props.muiProps) {
        require.ensure([], require => {
          let component = require("./mui/selectMUI");
          _this.setState({ stdSelectMUI: component });
        });
      }
    },
    getValue: function() {
      let p = this.props;
      let fs = p.formState;
      let s = this.state;

      let valuePresent =
        fs.data[p.name] !== null &&
        fs.data.hasOwnProperty(p.name) &&
        fs.data[p.name] !== "undefined";

      if (p.type === "multiSelect") {
        if (!valuePresent) {
          return [];
        }
        if (s.options.valueCast === "string") {
          let vals = [];
          fs.data[p.name].map(v => {
            vals.push(v.toString());
          });
          return vals;
        }
        return fs.data[p.name];
      }

      return valuePresent && s.options.valueCast === "string"
        ? fs.data[p.name].toString()
        : fs.data[p.name];
    },
    render: function() {
      let p = this.props;
      let fs = p.formState;
      let s = this.state;

      let value = this.getValue();

      let stdProps = {
        id: p.id,
        name: p.name,
        style: p.style || {},
        className: p.className,
        value: value,
        multiple: p.type === "multiSelect" ? true : false
      };

      if (!p.muiProps) {
        stdProps.onChange = e => {
          this.onChange(e.target.value.trim(), e);
        };
        return (
          <select {...stdProps}>
            {Object.keys(s.options.valueOptions.values).map(function(v, i) {
              return (
                <option
                  checked={
                    stdProps.multiple
                      ? value.indexOf(s.options.valueOptions.values[i]) > -1
                      : false
                  }
                  value={s.options.valueOptions.values[i]}
                  key={i}
                >
                  {s.options.valueOptions.text[i]}
                </option>
              );
            })}
          </select>
        );
      }

      if (!s.stdSelectMUI) {
        return null;
      }

      return (
        <s.stdSelectMUI
          state={s}
          formState={fs}
          field={p.field}
          onChange={(v, e) => this.onChange(v, e)}
          stdProps={stdProps}
          muiProps={p.muiProps}
          getValue={this.getValue}
        />
      );
    }
  })
);

module.exports = StdSelect;
