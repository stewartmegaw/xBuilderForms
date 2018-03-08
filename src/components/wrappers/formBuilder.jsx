// TODO this.prop.msgStyle=="popup" is not implemented yet
// because its not required yet!

const React = require("react");

import Form from "../form";

let validate = require("validate.js");

require("../../style/global.inject.css");

// const AppState = require("xbuilder-core/lib/appState");

const parseUrl = require("parse-url");

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
const muiTheme = getMuiTheme();

import formComponentsStore from "../../stores/formComponentsStore";
import formComponentsActions from "../../actions/formComponentsActions";

export const typeMappings = {
  text: "stdTextField",
  password: "stdTextField",
  textarea: "stdTextField",
  select: "stdSelect",
  multiSelect: "stdSelect",
  date: "stdDatePicker",
  button: "stdButton",
  submit: "stdButton"
};

export default class FormBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.clones = {};

    this.validate = this.validate.bind(this);
    this.getFieldByName = this.getFieldByName.bind(this);
    this.getField = this.getField.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.initialiseFields = this.initialiseFields.bind(this);
    this.fetchComponents = this.fetchComponents.bind(this);

    // Ensure form has defaults
    this.state = {
      components: {},
      filePresent: false,
      componentsLoaded: false
    };

    this.initialiseFields();
  }

  initialiseFields() {
    // Commenting non-critical
    // let parsedUrl = parseUrl(serverSide ? uri : window.location.href);

    let filePresent = false;

    if (!this.props.manual) {
      // Set default values
      let data = {};
      let fields = this.props.form.fields;
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].type == "file") {
          filePresent = true;
        }

        let defaultValue = fields[i].defaultValue;
        if (defaultValue && defaultValue.length != 0) {
          console.log("TODO: Add back default value code");
          // switch (defaultValue.type) {
          //   case "stateProperty":
          //     let prop_path = defaultValue.value;
          //     // Get appState value from prop_path string
          //     console.log(
          //       "TODO stateProperty default value must be implemented without using appState"
          //     );
          //     // let _appState = Object.assign({}, appState);
          //     // for (
          //     //   let j = 0,
          //     //     prop_path = prop_path.split("."),
          //     //     len = prop_path.length;
          //     //   j < len;
          //     //   j++
          //     // ) {
          //     //   _appState = _appState[prop_path[j]];
          //     // }
          //     // data[fields[i].name] = _appState;
          //     break;
          //   case "simple":
          //     data[fields[i].name] = defaultValue.value;
          //     break;
          //   case "fromRouteParam":
          //     console.log(
          //       "TODO fromRouteParam default value must be implemented without using appState"
          //     );
          //     // data[fields[i].name] = AppState.getProp(
          //     //   "routeParams." + defaultValue.param
          //     // );
          //     break;
          //   case "clone":
          //     this.clones[fields[i].name] = defaultValue.value;
          //     break;
          //   case "useQuery":
          //     let query_fieldname = defaultValue.field || fields[i].name;
          //     let queryObject = parsedUrl.search
          //       ? JSON.parse(
          //           '{"' +
          //             decodeURI(parsedUrl.search)
          //               .replace(/"/g, '\\"')
          //               .replace(/&/g, '","')
          //               .replace(/=/g, '":"') +
          //             '"}'
          //         )
          //       : {};
          //     data[fields[i].name] = queryObject[query_fieldname];
          //     break;
          //   case "date":
          //     if (defaultValue.value.indexOf("now") != -1) {
          //       let d = new Date();
          //       d.setHours(0, 0, 0, 0); // No time
          //       data[fields[i].name] = d.getTime();
          //       if (defaultValue.add)
          //         data[fields[i].name] +=
          //           defaultValue.add * 1000 * 60 * 60 * 24;
          //     } else data[fields[i].name] = defaultValue.value;
          //     break;
          //   default:
          //     data[fields[i].name] = defaultValue.value;
          //     break;
          // }
        }
      }

      let store = formComponentsStore.getStore();
      formComponentsActions.valueChanged(
        Object.assign(this.props.data || {}, data, store.data)
      );
    }

    if (filePresent) {
      this.setState({ filePresent: filePresent });
    }

    // Commenting non-critical
    // s.action = this.props.action || s.action || parsedUrl.pathname;

    // If the action does not already have a query string
    // attach the current redirect query param if it exists
    console.log(
      "TODO AppState queryParams.redirect default value must be implemented without using appState"
    );
    // if (AppState.getProp("queryParams.redirect") && s.action.indexOf("?") == -1)
    //   s.action =
    //     s.action + "?redirect=" + AppState.getProp("queryParams.redirect");
  }

  componentDidUpdate() {
    this.initialiseFields();
    this.fetchComponents();
  }

  updateAction(action, cb) {
    this.setState({ action: action }, cb);
  }

  updateData(newData, cb) {
    let store = formComponentsStore.getStore();
    formComponentsActions.valueChanged(
      Object.assign(store.data, newData || {})
    );
    if (cb) cb();
  }

  getFieldValue(field) {
    let store = formComponentsStore.getStore();
    return store.data[field];
  }

  getErrorsMsgs(field) {
    let all_error_msgs = formComponentsStore.getStore().error_msgs;
    
    if (field) {
      return all_error_msgs[field];
    }
    
    return all_error_msgs;
  }

  // isValid is a boolean wrapper for validate()
  isValid(field, highlight, scroll) {
    let errors = this.validate(field, highlight, scroll);
    if (!errors) return true;
    else return false;
  }

  // return error messages or null is valid
  validate(field, highlight, scroll) {
    let s = this.state;
    let p = this.props;
    let store = formComponentsStore.getStore();

    let formValues = {};
    let constraints = {};

    // If field empty validate entire form
    if (!field) {
      let form = document.querySelector("form#" + "form_" + p.form.name);

      formValues = validate.collectFormValues(form, { trim: true });

      constraints = Object.assign({}, p.form.constraints);

      // Before validating we must alter keys in the constraints
      // object that belong to an input with an array value
      for (let key in formValues)
        if (key.indexOf("[]") > -1) {
          constraints[key] = constraints[key.replace("[]", "")];
          delete constraints[key.replace("[]", "")];
        }
    } else {
      // Only validate field
      formValues[field] = store.data[field];
      constraints[field] = p.form.constraints[field];
    }

    let errors = validate(formValues, constraints);

    if (errors) {
      if (highlight) {
         if (field) {
          // Merge these errors with any errors from other fields
          errors = Object.assign({}, store.error_msgs, errors);
         }
        formComponentsActions.newErrors(errors);
      }

      if (scroll) {
        // Scroll to error field with with smallest position
        let smallestIndex = null;
        let errorFieldNames = Object.keys(errors);
        for (let j = 0; j < errorFieldNames.length; j++)
          for (let i = 0; i < this.props.form.fields.length; i++)
            if (this.props.form.fields[i].name == errorFieldNames[j]) {
              if (
                smallestIndex === null ||
                this.props.form.fields[i].position < smallestIndex
              )
                smallestIndex = i;
              break;
            }
        if (smallestIndex !== null) {
          let elm = document.getElementById(
            p.form.name + this.props.form.fields[smallestIndex].name
          );
          if (elm) elm.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    return errors;
  }

  componentDidMount() {
    this.fetchComponents();
  }

  fetchComponents() {
    // Get the components async or we will have a lot of used code
    // TODO: ADD back serverSide code
    // if (!serverSide && !this.props.manual) {
    if (!this.props.manual) {
      let _this = this;
      let s = this.state;
      let components = s.components;

      this.props.form.fields.map(function(field) {
        switch (field.type) {
          case "hidden":
            // Required for componentsLoaded to function properly
            components[field.type] = 1;
            _this.setState({ components: components }, _this.componentsLoaded);
            break;
          default:
            if (!components[typeMappings[field.type]]) {
              import("../" + [typeMappings[field.type]]).then(myMod => {
                components[typeMappings[field.type]] = myMod;
                _this.setState({ components: components }, () => {
                  if (field.type === "date") {
                    // Validatejs requires some initialization when using the date validation
                    // http://validatejs.org/#validators-date
                    //
                    // Before using it we must add the parse and format functions
                    // Here is a sample implementation using moment.js
                    validate.extend(validate.validators.datetime, {
                      // The value is guaranteed not to be null or undefined but otherwise it
                      // could be anything.
                      parse: function(value, options) {
                        return +moment.utc(value);
                      },
                      // Input is a unix timestamp
                      format: function(value, options) {
                        let format = options.dateOnly
                          ? "YYYY-MM-DD"
                          : "YYYY-MM-DD hh:mm:ss";
                        return moment.utc(value).format(format);
                      }
                    });
                  }

                  _this.componentsLoaded();
                });
              });
            }
            break;
        }
      });
    }
  }

  componentsLoaded() {
    let allLoaded = true;

    let components = this.state.components;

    this.props.form.fields.map(function(field) {
      switch (field.type) {
        case "hidden":
          if (!components[field.type]) {
            allLoaded = false;
            return false;
          }
          break;
        default:
          if (!components[typeMappings[field.type]]) {
            allLoaded = false;
            return false;
          }
          break;
      }
    });

    if (allLoaded) {
      let _this = this;
      this.setState({ componentsLoaded: true }, function() {
        if (_this.props.componentsLoaded) _this.props.componentsLoaded();
      });
    }
  }

  submit(success_cb) {
    this.refs.form.manualSubmit(success_cb);
  }

  getAllFields() {
    let fields = [];

    // Sort fields by desired postion
    let orderedFields = this.props.form.fields.slice(0).sort(function(a, b) {
      return a.position - b.position;
    });

    for (let i = 0; i < orderedFields.length; i++)
      fields.push(this.getField(orderedFields[i]));

    return fields;
  }

  getFieldByName(name) {
    for (let i = 0; i < this.props.form.fields.length; i++)
      if (this.props.form.fields[i].name == name)
        return this.getField(this.props.form.fields[i]);
  }

  getField(field) {
    let p = this.props;
    let style =
      p.fieldStyles && p.fieldStyles[field.name]
        ? p.fieldStyles[field.name]
        : {};
    let className =
      p.fieldClassName && p.fieldClassName[field.name]
        ? p.fieldClassName[field.name]
        : null;
    if (p.globalFieldClassName)
      className = [p.globalFieldClassName, className].join(" ");
    let errorClass =
      p.fieldErrorClassName && p.fieldErrorClassName[field.name]
        ? p.fieldErrorClassName[field.name]
        : null;
    if (p.globalErrorClassName)
      errorClass = [p.globalErrorClassName, className].join(" ");
    let events =
      p.fieldEvents && p.fieldEvents[field.name]
        ? p.fieldEvents[field.name]
        : {};

    // Merge fieldProperties passed in via fieldProperties prop with
    // those passed in via form prop
    let fieldProperties = this.props.form.fieldProperties ? this.props.form.fieldProperties[field.name] || null : null;
    fieldProperties =
      p.fieldProperties && p.fieldProperties[field.name]
        ? Object.assign(fieldProperties || {}, p.fieldProperties[field.name])
        : fieldProperties;

    let component = this.getComponent(
      field,
      style,
      className,
      events,
      fieldProperties,
      errorClass
    );
    if (p.fieldWrappers && p.fieldWrappers[field.name])
      return p.fieldWrappers[field.name](component);
    else return component;
  }

  getComponent(field, style, className, events, manualProperties, errorClass) {
    let _this = this;
    let s = this.state;
    let p = this.props;
    let store = formComponentsStore.getStore();

    let component;
    let options = Object.assign({}, field.options);

    switch (field.type) {
      case "hidden":
        component = (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={
              _this.clones[field.name]
                ? store.data[_this.clones[field.name]]
                : store.data[field.name]
            }
          />
        );
        break;
      default:
        if (s.components[typeMappings[field.type]]) {
          let MyComponent = s.components[typeMappings[field.type]];
          // Replaced with flux state management
          // updated={(_f, cb) => _this.setState(_f, cb)}
          // formState={s}
          component = (
            <MyComponent
              key={field.name}
              form={p.form}
              field={field}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              errorClass={errorClass}
              {...manualProperties}
            />
          );
        }
        break;
      // case "radio":
      //   if (s.components.stdRadio) {
      //     component = (
      //       <s.components.stdRadio
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         label={field.label}
      //         autoWidth={style.autoWidth === 1 ? true : false}
      //         fullWidth={style.fullWidth === 1 ? true : false}
      //         style={style.style || {}}
      //         valueToString={options && options.valueCast == "string"}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "placeSuggest":
      //   if (s.components.stdPlaceSuggest) {
      //     component = (
      //       <s.components.stdPlaceSuggest
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         formState={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         className={className}
      //         style={style}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //     {
      //       /*geocode={options.useUserLocation ? AppState.getProp('user.location',false) : false }
      //         placeTypes={['(cities)']}
      //             updateLocationQuery={options.updateLocationQuery || false}
      //     nullOnChange={true}
      //             fullWidth={style === 1 ? true : false}*/
      //     }
      //   }
      //   break;
      // case "videoCapture":
      //   if (s.components.stdVideoCapture) {
      //     component = (
      //       <s.components.stdVideoCapture
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) =>
      //           _this.setState(_f, () => {
      //             if (cb) cb();
      //           })
      //         }
      //         style={style.style || {}}
      //         afterLabel={options.afterLabel}
      //         minDuration={options.minDuration}
      //         maxDuration={options.maxDuration}
      //         fieldId={field.id}
      //         editIcon={options.editIcon}
      //         onSuccess={
      //           options.submitAfterUpload
      //             ? () => _this.refs.form.manualSubmit()
      //             : null
      //         }
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "tagSuggest":
      //   if (s.components.stdTagSuggest) {
      //     component = (
      //       <s.components.stdTagSuggest
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         hintTextStyle={
      //           options.hintTextStyle ? options.hintTextStyle : null
      //         }
      //         headerText={options.headerText ? options.headerText : null}
      //         unique={true}
      //         inputAsTag={true}
      //         viewMode={options.viewMode && !p.edit}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "codeMirror":
      //   if (s.components.stdCodeMirror) {
      //     component = (
      //       <s.components.stdCodeMirror
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "dynamicJson":
      //   if (s.components.stdDynamicJson) {
      //     component = (
      //       <s.components.stdDynamicJson
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "location":
      //   if (s.components.stdLocation) {
      //     component = (
      //       <s.components.stdLocation
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         formState={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         className={className}
      //         style={style}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
      // case "file":
      //   if (s.components.stdFile) {
      //     component = (
      //       <s.components.stdFile
      //         key={field.name}
      //         formName={p.form.name}
      //         field={field}
      //         state={s}
      //         updated={(_f, cb) => _this.setState(_f, cb)}
      //         style={style}
      //         events={events}
      //         onChangeFinished={p.onChangeFinished}
      //         {...manualProperties}
      //       />
      //     );
      //   }
      //   break;
    }
    return component;
  }

  render() {
    let _this = this;
    let s = this.state;
    let p = this.props;

    // Most of the MUI components in switch need an id passed so that server
    // rendering is reusable

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {/*
          We replaced the <Form> "updated" prop with flux state management.
          Must add back a means of displaying success / error msgs.

          updated={_f => {
            this.setState(_f);
            if (
              p.msgStyle == "popup" &&
              (_f.success_msg || _f.global_error_msg)
            )
              emitter.emit("info_msg", _f.success_msg || _f.global_error_msg);
          }}
        */}
        <Form
          ref="form"
          id={"form_" + p.form.name}
          form={p.form}
          method={p.method || "POST"}
          action={s.action}
          componentsLoaded={s.componentsLoaded}
          style={p.style || {}}
          className={(p.manual ? "" : "formDefaults ") + (p.className || "")}
          msgStyle={p.msgStyle}
          file={s.filePresent}
          submitOnClick={p.submitOnClick}
          disableClickOnSubmit={p.disableClickOnSubmit}
          validate={this.validate}
        >
          {p.msgStyle != "popup" && s.global_error_msg ? (
            <div style={{ color: "red" }}>{s.global_error_msg}</div>
          ) : null}
          {p.msgStyle != "popup" && s.success_msg ? (
            <div style={p.successMsgStyle || {}}>{s.success_msg}</div>
          ) : null}
          {p.layout
            ? p.layout(this.getFieldByName, this.getErrorsMsgs())
            : this.getAllFields()}

          <input
            key="hidden_form"
            type="hidden"
            name="formNameUniqueIdentifier"
            value={p.form.name}
          />

          {p.manual ? p.children : null}

          {p.hiddenInputs
            ? Object.keys(p.hiddenInputs).map((prop, i) => {
                return (
                  <input
                    type="hidden"
                    key={i}
                    name={prop}
                    value={p.hiddenInputs[prop]}
                  />
                );
              })
            : null}
        </Form>
      </MuiThemeProvider>
    );
  }
}
