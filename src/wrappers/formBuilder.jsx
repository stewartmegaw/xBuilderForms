// TODO this.prop.msgStyle=="popup" is not implemented yet
// because its not required yet!

const React = require("react");

let _Form = require("../components/form");

let validate = require("validate.js");

require("../style/global.inject.css");

// const AppState = require("xbuilder-core/lib/appState");

const parseUrl = require("parse-url");

const FormBuilder = React.createClass({
  getInitialState: function() {
    // Ensure form has defaults
    let s = Object.assign(
      {
        components: {},
        data: {},
        error_msgs: {},
        constraints: {},
        fields: [],
        sent: false,
        requestType: ""
      },
      this.props.form
    );

    let parsedUrl = parseUrl(serverSide ? uri : window.location.href);

    if (!this.props.manual) {
      // Sort fields by desired postion
      s.fields.sort(function(a, b) {
        return a.position - b.position;
      });

      // Set default values
      let data = {};
      let fields = s.fields;
      let filePresent = false;
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].type == "file") filePresent = true;

        let defaultValue = fields[i].defaultValue;
        if (defaultValue && defaultValue.length != 0) {
          switch (defaultValue.type) {
            case "stateProperty":
              let prop_path = defaultValue.value;
              // Get appState value from prop_path string
              console.log(
                "TODO stateProperty default value must be implemented without using appState"
              );
              // let _appState = Object.assign({}, appState);
              // for (
              //   let j = 0,
              //     prop_path = prop_path.split("."),
              //     len = prop_path.length;
              //   j < len;
              //   j++
              // ) {
              //   _appState = _appState[prop_path[j]];
              // }
              // data[fields[i].name] = _appState;
              break;
            case "simple":
              data[fields[i].name] = defaultValue.value;
              break;
            case "fromRouteParam":
              console.log(
                "TODO fromRouteParam default value must be implemented without using appState"
              );
              // data[fields[i].name] = AppState.getProp(
              //   "routeParams." + defaultValue.param
              // );
              break;
            case "clone":
              this.clones[fields[i].name] = defaultValue.value;
              break;
            case "useQuery":
              let query_fieldname = defaultValue.field || fields[i].name;
              let queryObject = parsedUrl.search
                ? JSON.parse(
                    '{"' +
                      decodeURI(parsedUrl.search)
                        .replace(/"/g, '\\"')
                        .replace(/&/g, '","')
                        .replace(/=/g, '":"') +
                      '"}'
                  )
                : {};
              data[fields[i].name] = queryObject[query_fieldname];
              break;
            case "date":
              if (defaultValue.value.indexOf("now") != -1) {
                let d = new Date();
                d.setHours(0, 0, 0, 0); // No time
                data[fields[i].name] = d.getTime();
                if (defaultValue.add)
                  data[fields[i].name] +=
                    defaultValue.add * 1000 * 60 * 60 * 24;
              } else data[fields[i].name] = defaultValue.value;
              break;
            default:
              data[fields[i].name] = defaultValue.value;
              break;
          }
        }
      }

      s.data = Object.assign(this.props.data || {}, data, s.data);
    }

    if (filePresent) s.filePresent = 1;

    s.action = this.props.action || s.action || parsedUrl.pathname;

    // If the action does not already have a query string
    // attach the current redirect query param if it exists
    console.log(
      "TODO AppState queryParams.redirect default value must be implemented without using appState"
    );
    // if (AppState.getProp("queryParams.redirect") && s.action.indexOf("?") == -1)
    //   s.action =
    //     s.action + "?redirect=" + AppState.getProp("queryParams.redirect");

    return s;
  },
  updateAction(action, cb) {
    this.setState({ action: action }, cb);
  },
  updateData(newData, cb) {
    this.setState({ data: Object.assign(this.state.data, newData || {}) }, cb);
  },
  getFieldValue(field) {
    return this.state.data[field];
  },
  getErrorsMsgs(field) {
    if (field) return this.state.error_msgs[field];
    else return this.state.error_msgs;
  },
  // isValid is a boolean wrapper for validate()
  isValid(field, highlight, scroll) {
    let errors = this.validate(field, highlight, scroll);
    if (!errors) return true;
    else return false;
  },
  // return error messages or null is valid
  validate(field, highlight, scroll) {
    let s = this.state;
    let p = this.props;

    // If field empty validate entire form
    if (!field) {
      let form = document.querySelector("form#" + "form_" + p.form.name);

      let formValues = validate.collectFormValues(form, { trim: true });

      let constraints = Object.assign({}, s.constraints);

      // Before validating we must alter keys in the constraints
      // object that belong to an input with an array value
      for (let key in formValues)
        if (key.indexOf("[]") > -1) {
          constraints[key] = constraints[key.replace("[]", "")];
          delete constraints[key.replace("[]", "")];
        }
    } else {
      // Only validate field
      let formValues = {};
      formValues[field] = s.data[field];
      let constraints = {};
      constraints[field] = s.constraints[field];
    }

    let errors = validate(formValues, constraints);

    if (errors) {
      if (highlight) this.setState({ error_msgs: errors });

      if (scroll) {
        // Scroll to error field with with smallest position
        let smallestIndex = null;
        let errorFieldNames = Object.keys(errors);
        for (let j = 0; j < errorFieldNames.length; j++)
          for (let i = 0; i < s.fields.length; i++)
            if (s.fields[i].name == errorFieldNames[j]) {
              if (
                smallestIndex === null ||
                s.fields[i].position < smallestIndex
              )
                smallestIndex = i;
              break;
            }
        if (smallestIndex !== null) {
          let elm = document.getElementById(
            p.form.name + s.fields[smallestIndex].name
          );
          if (elm) elm.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    return errors;
  },
  componentDidMount() {
    // Get the components async or we will have a lot of used code
    if (!serverSide && !this.props.manual) {
      let _this = this;
      let s = this.state;
      let components = s.components;

      s.fields.map(function(field) {
        switch (field.type) {
          case "text":
          case "password":
          case "textarea":
            if (!components.stdTextField)
              require.ensure([], require => {
                components.stdTextField = require("../components/stdTextField");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "select":
          case "multiSelect":
            if (!components.stdSelect)
              require.ensure([], require => {
                components.stdSelect = require("../components/stdSelect");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "date":
            if (!components.stdDatePicker)
              require.ensure([], require => {
                components.stdDatePicker = require("../components/stdDatePicker");
                _this.setState({ components: components }, () => {
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

                  _this.componentsLoaded;
                });
              });
            break;
          case "placeSuggest":
            if (!components.stdPlaceSuggest)
              require.ensure([], require => {
                components.stdPlaceSuggest = require("../components/stdPlaceSuggest");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "videoCapture":
            if (!components.stdVideoCapture)
              require.ensure([], require => {
                components.stdVideoCapture = require("../components/stdVideoCapture");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "tagSuggest":
            if (!components.stdTagSuggest)
              require.ensure([], require => {
                components.stdTagSuggest = require("../components/stdTagSuggest");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "radio":
            if (!components.stdRadio)
              require.ensure([], require => {
                components.stdRadio = require("../components/stdRadio");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "location":
            if (!components.stdLocation)
              require.ensure([], require => {
                components.stdLocation = require("../components/stdLocation");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "codeMirror":
            if (!components.stdCodeMirror)
              require.ensure([], require => {
                components.stdCodeMirror = require("../components/stdCodeMirror");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "file":
            if (!components.stdFile)
              require.ensure([], require => {
                components.stdFile = require("../components/stdFile");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "dynamicJson":
            if (!components.stdDynamicJson)
              require.ensure([], require => {
                components.stdDynamicJson = require("../components/stdDynamicJson");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          case "button":
          case "submit":
            if (!components.stdButton)
              require.ensure([], require => {
                components.stdButton = require("../components/stdButton");
                _this.setState(
                  { components: components },
                  _this.componentsLoaded
                );
              });
            break;
          default:
            // Required for componentsLoaded to function properly
            components[field.type] = 1;
            _this.setState({ components: components }, _this.componentsLoaded);
            break;
        }
      });
    }
  },
  componentsLoaded() {
    let allLoaded = true;

    let components = this.state.components;

    this.state.fields.map(function(field) {
      switch (field.type) {
        case "text":
        case "password":
        case "textarea":
          if (!components.stdTextField) {
            allLoaded = false;
            return false;
          }
          break;
        case "select":
        case "multiSelect":
          if (!components.stdSelect) {
            allLoaded = false;
            return false;
          }
          break;
        case "radio":
          if (!components.stdRadio) {
            allLoaded = false;
            return false;
          }
          break;
        case "location":
          if (!components.stdLocation) {
            allLoaded = false;
            return false;
          }
          break;
        case "date":
          if (!components.stdDatePicker) {
            allLoaded = false;
            return false;
          }
          break;
        case "placeSuggest":
          if (!components.stdPlaceSuggest) {
            allLoaded = false;
            return false;
          }
          break;
        case "videoCapture":
          if (!components.stdVideoCapture) {
            allLoaded = false;
            return false;
          }
          break;
        case "tagSuggest":
          if (!components.stdTagSuggest) {
            allLoaded = false;
            return false;
          }
          break;
        case "codeMirror":
          if (!components.stdCodeMirror) {
            allLoaded = false;
            return false;
          }
          break;
        case "file":
          if (!components.stdFile) {
            allLoaded = false;
            return false;
          }
          break;
        case "dynamicJson":
          if (!components.stdDynamicJson) {
            allLoaded = false;
            return false;
          }
          break;
        case "button":
        case "submit":
          if (!components.stdButton) {
            allLoaded = false;
            return false;
          }
          break;
        default:
          if (!components[field.type]) {
            allLoaded = false;
            return false;
          }
          break;
      }
    });

    if (allLoaded) {
      let _this = this;
      this.setState({ componentsLoaded: 1 }, function() {
        if (_this.props.componentsLoaded) _this.props.componentsLoaded();
      });
    }
  },
  clones: {},
  submit(success_cb) {
    this.refs.form.manualSubmit(success_cb);
  },
  getAllFields() {
    let fields = [];
    for (let i = 0; i < this.state.fields.length; i++)
      fields.push(this.getField(this.state.fields[i]));

    return fields;
  },
  getFieldByName(name) {
    for (let i = 0; i < this.state.fields.length; i++)
      if (this.state.fields[i].name == name)
        return this.getField(this.state.fields[i]);
  },
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
    let manualProperties =
      p.fieldProperties && p.fieldProperties[field.name]
        ? p.fieldProperties[field.name]
        : null;

    let component = this.getComponent(
      field,
      style,
      className,
      events,
      manualProperties,
      errorClass
    );
    if (p.fieldWrappers && p.fieldWrappers[field.name])
      return p.fieldWrappers[field.name](component);
    else return component;
  },
  getComponent(field, style, className, events, manualProperties, errorClass) {
    let _this = this;
    let s = this.state;
    let p = this.props;

    let component;
    let options = Object.assign({}, field.options);

    switch (field.type) {
      case "text":
      case "password":
      case "textarea":
        if (s.components.stdTextField) {
          component = (
            <s.components.stdTextField
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              type={field.type}
              errorClass={errorClass}
              {...manualProperties}
            />
          );
        }
        break;
      case "date":
        if (s.components.stdDatePicker) {
          component = (
            <s.components.stdDatePicker
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
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
      case "select":
      case "multiSelect":
        if (s.components.stdSelect) {
          component = (
            <s.components.stdSelect
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              type={field.type}
              {...manualProperties}
            />
          );
        }
        break;
      case "submit":
      case "button":
        if (s.components.stdButton) {
          component = (
            <s.components.stdButton
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              type={field.type}
              {...manualProperties}
            />
          );
        }
        break;
      case "radio":
        if (s.components.stdRadio) {
          component = (
            <s.components.stdRadio
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              label={field.label}
              autoWidth={style.autoWidth === 1 ? true : false}
              fullWidth={style.fullWidth === 1 ? true : false}
              style={style.style || {}}
              valueToString={options && options.valueCast == "string"}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "placeSuggest":
        if (s.components.stdPlaceSuggest) {
          component = (
            <s.components.stdPlaceSuggest
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
          {
            /*geocode={options.useUserLocation ? AppState.getProp('user.location',false) : false }
              placeTypes={['(cities)']}
                  updateLocationQuery={options.updateLocationQuery || false}
          nullOnChange={true}
                  fullWidth={style === 1 ? true : false}*/
          }
        }
        break;
      case "videoCapture":
        if (s.components.stdVideoCapture) {
          component = (
            <s.components.stdVideoCapture
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) =>
                _this.setState(_f, () => {
                  if (cb) cb();
                })
              }
              style={style.style || {}}
              afterLabel={options.afterLabel}
              minDuration={options.minDuration}
              maxDuration={options.maxDuration}
              fieldId={field.id}
              editIcon={options.editIcon}
              onSuccess={
                options.submitAfterUpload
                  ? () => _this.refs.form.manualSubmit()
                  : null
              }
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "tagSuggest":
        if (s.components.stdTagSuggest) {
          component = (
            <s.components.stdTagSuggest
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              hintTextStyle={
                options.hintTextStyle ? options.hintTextStyle : null
              }
              headerText={options.headerText ? options.headerText : null}
              unique={true}
              inputAsTag={true}
              viewMode={options.viewMode && !p.edit}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "codeMirror":
        if (s.components.stdCodeMirror) {
          component = (
            <s.components.stdCodeMirror
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "dynamicJson":
        if (s.components.stdDynamicJson) {
          component = (
            <s.components.stdDynamicJson
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "location":
        if (s.components.stdLocation) {
          component = (
            <s.components.stdLocation
              key={field.name}
              formName={p.form.name}
              field={field}
              formState={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              className={className}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "file":
        if (s.components.stdFile) {
          component = (
            <s.components.stdFile
              key={field.name}
              formName={p.form.name}
              field={field}
              state={s}
              updated={(_f, cb) => _this.setState(_f, cb)}
              style={style}
              events={events}
              onChangeFinished={p.onChangeFinished}
              {...manualProperties}
            />
          );
        }
        break;
      case "hidden":
        component = (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={
              _this.clones[field.name]
                ? s.data[_this.clones[field.name]]
                : s.data[field.name]
            }
          />
        );
        break;
    }
    return component;
  },
  render() {
    let _this = this;
    let s = this.state;
    let p = this.props;

    // Most of the MUI components in switch need an id passed so that server
    // rendering is reusable

    return (
      <_Form
        ref="form"
        id={"form_" + p.form.name}
        formName={p.form.name}
        method={p.method || "POST"}
        action={s.action}
        state={s}
        updated={_f => {
          this.setState(_f);
          if (p.msgStyle == "popup" && (_f.success_msg || _f.global_error_msg))
            emitter.emit("info_msg", _f.success_msg || _f.global_error_msg);
        }}
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
      </_Form>
    );
  }
});

module.exports = FormBuilder;
