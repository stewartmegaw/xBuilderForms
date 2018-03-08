const React = require("react");

import TextField from "material-ui/TextField";

module.exports = props => {
  var muiProps = Object.assign({}, props.muiProps);
  if (!muiProps.hasOwnProperty("fullWidth")) muiProps.fullWidth = true;
  if (!muiProps.hasOwnProperty("floatingLabelText"))
    muiProps.floatingLabelText = props.field.label;

  if (props.commonProps.type == "textarea") muiProps.multiLine = true;
  // return {

  return (
    <TextField
      {...props.commonProps}
      {...muiProps}
      onChange={e =>
        props.onChange(e.target.value, e)
      }
      onBlur={props.events.onBlur}
      errorText={
        props.error_msgs
          ? props.error_msgs[0]
          : null
      }
    />
  );
};
// }
