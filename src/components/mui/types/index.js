// @flow

export type MuiProps = {
  muiProps: {
    label: string,
    floatingLabelText: string,
    fullWidth: boolean,
    formatDate: Function,
    mode: string,
    minDate: Date
  },
  muiButtonType: string,
  stdProps: {
    name: string,
    value: any
  }
};
