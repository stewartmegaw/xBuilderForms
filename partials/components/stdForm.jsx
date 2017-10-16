const React = require('react');

var validate = require("validate.js");

import 'whatwg-fetch';

import intersect from 'boundless-utils-object-intersection';

var style = require('xbuilder-forms/style/form.css');

const StdForm = React.createClass({
	validate:function(json_success_cb, event){
		var _this = this;
		var s = this.props.state;

		var form = document.querySelector('form#'+this.props.id);

		var formValues = validate.collectFormValues(form, {trim:true});
		
		var constraints = Object.assign({},s.constraints);

		// Before validating we must alter keys in the constraints
		// object that belong to an input with an array value
		for(var key in formValues)
			if(key.indexOf('[]') > -1)
			{
				constraints[key] = constraints[key.replace('[]','')];
				delete constraints[key.replace('[]','')];
			}

		// Validate!
		var errors = validate(formValues, constraints);

		// TODO Hack to validate tag count until https://github.com/ansman/validate.js/pull/184 implemented
		if(this.props.id == 'form_tripCreateNew' || this.props.id == 'form_tripCreateDraft' || this.props.id == 'form_completeProfileStep1' || this.props.id == 'form_editHomeInterests')
		{
			var tags = document.getElementById(this.props.id).elements["tags[]"];
			if(!tags || !tags.length || tags.length < 3)
			{
				if(!errors)
					errors = {};
				errors.tags = ['Select 3 tags'];
			}
		}
		// End of Hack

		if(errors)
		{
			var _s = Object.assign({},s);
      		_s.error_msgs = errors;
      		this.props.updated(_s);
      		if(event)
	      		event.preventDefault();

      		// Scroll to error field with with smallest position
      		var smallestIndex = null;
      		var errorFieldNames = Object.keys(errors);
  			for(var j =0;j<errorFieldNames.length;j++)
	      		for(var i =0;i<s.fields.length;i++)
	      			if(s.fields[i].name == errorFieldNames[j])
	      			{
						if(smallestIndex === null || s.fields[i].position < smallestIndex)
							smallestIndex = i;
						break;
	      			}
  			if(smallestIndex !== null)
  			{
  				var elm = document.getElementById(this.props.formName + s.fields[smallestIndex].name);
  				if(elm)
	      			elm.scrollIntoView({behavior: "smooth"});
  			}
		}

		if(!errors && s.requestType == 'json')
		{
			var formData = new FormData(form);
			// Temporarily setting the form.success = true is a quick way to disable any buttons
			this.props.updated(Object.assign({},s,{success:1}));
			if(event)
				event.preventDefault();

			fetch(s.action, {
				headers: {
	                'X-Requested-With': 'XMLHttpRequest'
				},
				method:'POST',
				body: formData,
		        credentials: 'include',
			}).then(function(response) {
				if(response.ok)
					return response.json();
				else
					throw new Error('Network response error');
			}).then(function(r) {
				console.log(r);
				if(r.redirect302)
					window.location = r.redirect302;
				else
	            	_this.props.updated(Object.assign({},s,r.form));
	            if(json_success_cb)
	            	json_success_cb(true);
			}).catch(function(err) {
				// TODO handle this error better
				_this.props.updated(Object.assign({},s,{success:0}));
				console.log(err);
				if(json_success_cb)
	            	json_success_cb(false);
			});
		}

		if(errors && json_success_cb)
			json_success_cb(false);

		return errors ? false : true;

	},
	componentWillReceiveProps(nextProps){
		if(nextProps.state.componentsLoaded && ! this.props.state.componentsLoaded)
			this.componentsLoaded();
	},
	/*
	manualSubmit always returns the success/failure boolean via callback
	This is required since the form might be submited via xmlhttprequest asynchronously
	*/
	manualSubmit(success_cb){
		if(this.props.state.requestType == 'json')
		{
			this.validate(success_cb, null);
		}
		else
		{

			if(this.validate())
			{
				this.refs.form.submit();
				if(success_cb)
					success_cb(true);
			}
			else
			{
				if(success_cb)
					success_cb(false);
			}
		}
	},
	componentsLoaded(){
		// Validate any non-empty field immediately
		// Useful if the user is editing a form for example - they
		// will want to see error msgs immediately on page load
		var s = this.props.state;
		var form = document.querySelector('form#'+this.props.id);

		var data = validate.collectFormValues(form, {trim:true});
		var constraints = Object.assign({},s.constraints);

		// Remove non empty fields
		for (var field in data) {
			if (data[field] === null || data[field] === undefined || data[field] === '') {
				delete data[field];
			}
		}
		// Now remove constraints not in data
		constraints = intersect(constraints, data);

		var errors = validate(data, constraints);

		if(errors)
		{
			var _s = Object.assign({}, s);
      		_s.error_msgs = errors;
      		this.props.updated(_s);
		}
	},
	render: function() {
		var p = this.props;

		var form_props = {
			id:p.id,
			method:p.method,
			action:p.action,
			style:p.style || {},
			ref:"form",
		};

		if(p.file)
			form_props.encType = "multipart/form-data";

		return (
			<form
				{...form_props}
				onSubmit={this.validate.bind(this,false)}
				className={style.form}
			>
				{p.children}
			</form>
	);}
});

module.exports = StdForm;
