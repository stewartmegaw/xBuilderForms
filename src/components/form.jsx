const React = require("react");

let validate = require("validate.js");

import "whatwg-fetch";

import intersect from "boundless-utils-object-intersection";

// let style = require("../style/form.css");

import formComponentsActions from "../actions/formComponentsActions";

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pointerEvents: "normal" };
    this.validate = this.validate.bind(this);
    /*
    manualSubmit always returns the success/failure boolean via callback
    This is required since the form might be submited via xmlhttprequest asynchronously
    */
    this.manualSubmitCb = null;
    this.submitted = false;
  }

  validate(event) {
    let _this = this;

    let errors = this.props.validate(null, true, true);

    // TODO Hack to validate tag count until https://github.com/ansman/validate.js/pull/184 implemented
    // if(this.props.id == 'form_tripCreateNew' || this.props.id == 'form_tripCreateDraft' || this.props.id == 'form_completeProfileStep1' || this.props.id == 'form_editHomeInterests')
    // {
    //  let tags = document.getElementById(this.props.id).elements["tags[]"];
    //  if(!tags || !tags.length || tags.length < 3)
    //  {
    //    if(!errors)
    //      errors = {};
    //    errors.tags = ['Select 3 tags'];
    //  }
    // }
    // End of Hack

    if (errors) {
      // Prevent form submission
      event.preventDefault();
    }

    if (!errors && this.props.form.requestType === "json") {
      // Prevent form submission
      event.preventDefault();

      let form = document.querySelector("form#" + this.props.id);
      let formData = new FormData(form);

      // Temporarily setting the form.success = true is a quick way to disable any buttons
      // this.props.updated(Object.assign({}, s, { success: 1 }));

      fetch(this.props.action + "?XDEBUG_SESSION_START=netbeans-xdebug", {
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
        method: "POST",
        body: formData,
        credentials: "include"
      })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          }

          throw new Error("Network response error");
        })
        .then(function(r) {
          console.log(r);
          if (r.redirect302) {
            window.location = r.redirect302;
          } else {
            console.log(
              "TODO: Implement success procedure when not a redirect"
            );
            // _this.props.updated(Object.assign({}, s, r.form));
          }
          if (_this.manualSubmitCb) {
            _this.manualSubmitCb(true);
            _this.manualSubmitCb = null;
          }
        })
        .catch(function(err) {
          // TODO handle this error better
          // _this.props.updated(Object.assign({}, s, { success: 0 }));
          console.log(err);
          if (_this.manualSubmitCb) {
            _this.manualSubmitCb(false);
            _this.manualSubmitCb = null;
          }
        });
    } else if (_this.manualSubmitCb) {
      _this.manualSubmitCb(errors ? false : true);
      _this.manualSubmitCb = null;
    }

    return errors ? false : true;
  }

  componentWillReceiveProps(nextProps) {
    // componentsLoaded not used for manual forms
    if (nextProps.componentsLoaded && !this.props.componentsLoaded) {
      this.componentsLoaded();
    }
  }

  componentsLoaded() {
    // Validate any non-empty field immediately
    // Useful if the user is editing a form for example - they
    // will want to see error msgs immediately on page load
    let form = document.querySelector("form#" + this.props.id);

    let data = validate.collectFormValues(form, { trim: true });
    let constraints = Object.assign({}, this.props.form.constraints);

    // Remove non empty fields
    for (let field in data) {
      if (
        data[field] === null ||
        data[field] === "undefined" ||
        data[field] === ""
      ) {
        delete data[field];
      }
    }
    // Now remove constraints not in data
    constraints = intersect(constraints, data);

    let errors = validate(data, constraints);

    if (errors) {
      formComponentsActions.newErrors(errors);
    }
  }

  submit(cb) {
    console.log("Depreciated. Call submit in form builder instead");
    this.manualSubmit(cb);
  }

  manualSubmit(success_cb) {
    this.manualSubmitCb = success_cb;

    this.refs.submitBtn.click();
  }

  render() {
    let _this = this;
    let p = this.props;

    let form_props = {
      id: p.id,
      method: p.method,
      action: p.action,
      style: Object.assign(
        { padding: 0, margin: 0, pointerEvents: this.state.pointerEvents },
        p.style || {}
      ),
      ref: "form",
      className: p.className,
      onClick: p.submitOnClick ? () => this.manualSubmit() : null
    };

    if (p.file) {
      form_props.encType = "multipart/form-data";
    }

    return (
      <form
        {...form_props}
        onSubmit={event => {
          if (p.disableClickOnSubmit && !_this.submitted) {
            // TODO ** There is an issue here when MUI components show error messaging
            // VCGCA contact form for example
            // Perhaps move the disableClickOnSubmit to actual button component

            // Don't submit now or else the user will be able to click again
            // Only submit after a rerender
            _this.submitted = true;
            _this.setState({ pointerEvents: "none" }, () => {
              // timeout required or else the call to
              // manualSubmit click() event will not be triggered
              setTimeout(() => {
                _this.manualSubmit(_this.manualSubmitCb);
              }, 1);
            });
            event.preventDefault();
            return;
          }

          // Set this back to false incase validation fails as
          // the client will likely submit the form again
          this.submitted = false;
          _this.setState({ pointerEvents: "normal" });

          this.validate(event);
        }}
      >
        {p.children}

        {/* This submit button is used for manually submitting the form and is otherwise invisible.
          Submitting this way ensures the onSubmit handler is triggered
         */}
        <input
          style={{ position: "absolute", visibility: "hidden" }}
          type="submit"
          ref="submitBtn"
          value="1"
        />
      </form>
    );
  }
}
