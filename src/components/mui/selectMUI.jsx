// @flow

import React, { Fragment } from "react";

import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import type { MuiProps } from "./types";
import type { ComponentProps } from "../types";

const SelectMUI = (props: ComponentProps & MuiProps) => {
  let options = props.options;

  return (
    <span>
      <SelectField
        fullWidth={props.manualProperties.muiProps.fullWidth === false ? false : true}
        floatingLabelText={props.manualProperties.muiProps.floatingLabelText || props.label}
        {...props.commonProps}
        onChange={(event, index, value) => props.onChange(value, event)}
        errorText={props.error_msgs ? props.error_msgs[0] : null}
      >
        {options.valueOptions ? (
          <Fragment>
            {options.valueOptions.values.map((v, i) => (
              <MenuItem
                insetChildren={props.commonProps.multiple ? true : false}
                checked={
                  props.commonProps.multiple
                    ? props.commonProps.value.indexOf(
                        options.valueOptions.values[i]
                      ) > -1
                    : false
                }
                value={options.valueOptions.values[i]}
                primaryText={options.valueOptions.text[i]}
                key={i}
              />
            ))}
          </Fragment>
        ) : null}
      </SelectField>
      {props.commonProps.multiple ? (
        <span>
          {options.valueOptions ? (
            <Fragment>
              {options.valueOptions.values.map((v, i) => (
                <Fragment>
                  {props.commonProps.value.indexOf(
                    options.valueOptions.values[i]
                  ) === -1 ? null : (
                    <input
                      type="hidden"
                      name={props.commonProps.name + "[]"}
                      value={options.valueOptions.values[i]}
                      key={i}
                    />
                  )}
                </Fragment>
              ))}
            </Fragment>
          ) : null}
        </span>
      ) : (
        <input
          type="hidden"
          name={props.commonProps.name}
          value={props.commonProps.value}
        />
      )}
    </span>
  );
};

module.exports = SelectMUI;
