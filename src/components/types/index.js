// @flow

export type ComponentProps = {
  // field: {
  //   label: string,
  //   options: {
  //     valueOptions: {
  //       values: Array<mixed>,
  //       text: Array<string>
  //     }
  //   }
  // },
  error_msgs: Array<string>,
  disabled: boolean,
  // events: {
  //   onFocus: Function,
  //   onClick: Function,
  //   onBlur: Function
  // },
  onChange: Function,
  getLinkedFields: Function
};

export type WrapperProps = {
  type: string,
  label:string,
  style: {},
  className: string | null,
  stdProps: {
    id: string,
    name: string,
    value: mixed
  },
  formScope: {
    form: {
      name: string,
      fields: Array<{}>,
      constraints: {}
    },
    onChangeFinished: Function
  },
  events: {
    onChangeFinished?: Function,
    onClick?: Function
  },
  manualProperties: {
    muiProps?: {

    }
  }
};

export type Field = {
  name: string,
  type: string,
  defaultValue?: Array<{}>,
  position: number,
  label:string,
  options: {}
};

export type Form = {
  name: string,
  fields: Array<Field>,
  constraints: {
    [string]: {}
  },
  fieldProperties?: {},
  action?: string,
  method?: string
};
