// @flow

export type ComponentProps = {
  field: {
    label: string,
    options: {
      valueOptions: {
        values: Array<mixed>,
        text: Array<string>
      }
    }
  },
  error_msgs: Array<string>,
  disabled: boolean,
  events: {
    onFocus: Function,
    onClick: Function,
    onBlur: Function
  },
  onChange: Function
};
