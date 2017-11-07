const React = require('react');

var validate = require("validate.js");

import 'whatwg-fetch';

import intersect from 'boundless-utils-object-intersection';

var style = require('xbuilder-forms/style/form.css');

const _Form = React.createClass({
	getInitialState(){
		return {pointerEvents:'normal'};
	},
	validate:function(event){
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
			// Prevent form submission
      		event.preventDefault();

			var _s = Object.assign({},s);
      		_s.error_msgs = errors;
      		this.props.updated(_s);
      		

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
			// Prevent form submission
			event.preventDefault();

			var formData = new FormData(form);

			// Temporarily setting the form.success = true is a quick way to disable any buttons
			this.props.updated(Object.assign({},s,{success:1}));
			

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
	            if(_this.manualSubmitCb)
	            {
	            	_this.manualSubmitCb(true);
	            	_this.manualSubmitCb = null;
	            }
			}).catch(function(err) {
				// TODO handle this error better
				_this.props.updated(Object.assign({},s,{success:0}));
				console.log(err);
				if(_this.manualSubmitCb)
	            {
	            	_this.manualSubmitCb(false);
	            	_this.manualSubmitCb = null;
	            }
			});
		}
		else if (_this.manualSubmitCb) {
        	_this.manualSubmitCb(errors ? false : true);
        	_this.manualSubmitCb = null;
		}

		return errors ? false : true;

	},
	componentWillReceiveProps(nextProps){
		// componentsLoaded not used for manual forms
		if(nextProps.state.componentsLoaded && ! this.props.state.componentsLoaded)
			this.componentsLoaded();
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
	/*
	manualSubmit always returns the success/failure boolean via callback
	This is required since the form might be submited via xmlhttprequest asynchronously
	*/
	manualSubmitCb:null,
	submit(cb){
		console.log("Depreciated. Call submit in form builder instead");
 		this.manualSubmit(cb);
	},
	manualSubmit(success_cb){
		this.manualSubmitCb = success_cb;

		this.refs.submitBtn.click();
	},
	submitted:false,
	render: function() {
		var _this = this;
		var p = this.props;

		var form_props = {
			id:p.id,
			method:p.method,
			action:p.action,
			style:Object.assign({padding:0,margin:0,pointerEvents:this.state.pointerEvents}, p.style || {}),
			ref:"form",
			className:p.className,
			onClick:p.submitOnClick ? ()=>this.manualSubmit() : null
		};

		if(p.file)
			form_props.encType = "multipart/form-data";

		return (
			<form
				{...form_props}
				onSubmit={(event)=>{
					if(p.disableClickOnSubmit && !_this.submitted)
					{
						// Don't submit now or else the user will be able to click again
						// Only submit after a rerender
						_this.submitted = true;
						_this.setState({pointerEvents:'none'},()=>{
							_this.manualSubmit(_this.manualSubmitCb);
						});
						event.preventDefault();
						return;
					}

					// Set this back to false incase validation fails as
					// the client will likely submit the form again
					this.submitted = false;
					_this.setState({pointerEvents:'normal'});

					this.validate(event);
				}}
			>
				{p.children}

				{/* This submit button is used for manually submitting the form and is otherwise invisible.
					Submitting this way ensures the onSubmit handler is triggered
				 */}
				<input style={{position:'absolute',visibility:"hidden"}} type="submit" ref="submitBtn" value="1"/>
			</form>
	);}
});

module.exports = _Form;
