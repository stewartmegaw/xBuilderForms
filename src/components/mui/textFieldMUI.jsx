const React = require("react");

import TextField from "material-ui/TextField";
import type { MuiProps } from "./types";
import type { ComponentProps } from "../types";

module.exports = (props: ComponentProps & MuiProps) => {
  return (
    <TextField
      {...props.commonProps}
      type={props.type}
      fullWidth={props.manualProperties.muiProps.fullWidth === false ? false : true}
      floatingLabelText={props.manualProperties.muiProps.floatingLabelText || props.label}
      multiLine={props.type === "textarea"}
      errorText={props.error_msgs ? props.error_msgs[0] : null}
    />
  );
};
// }
