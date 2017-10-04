const React = require('react');

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var validate = require("validate.js");

var style = require('alpha-client-lib/style/button.css');

const StdButton = React.createClass({
	getInitialState(){
		return {
			disableBtnAsFormInvalid: this.props.disableUntilValid ? true : false,
			disableTopTextAsFormValid:this.props.topTextWhenValid ? true : false,
		};
	},
	componentDidMount() {
		this.validateForm();
	},
	componentWillReceiveProps(nextProps) {
		this.validateForm();
	},
	validateForm(){
		if(this.props.disableUntilValid || this.props.topTextWhenValid)
		{

			var form = document.querySelector('form#'+this.props.formId);

			var errors = validate(validate.collectFormValues(form, {trim:true}), this.props.state.constraints);
			
			console.log(errors);
			this.setState({
				disableBtnAsFormInvalid:errors ? true : false,
				disableTopTextAsFormValid:errors ? true : false,
			});
		}
	},
	render: function() {
		var s = this.props.state;
		var p = this.props;
		var _s = this.state;

		var mui_props = {
			id:p.id,
			label: p.label,
			type: p.type,
			disabled:_s.disableBtnAsFormInvalid || p.disabled,
			hoverColor:p.hoverColor,
			backgroundColor:p.backgroundColor,
			labelStyle:p.labelStyle,
		};

		return (
			<div style={p.style|| {}} className={style.container}>
				{p.headerText ? <div style={{marginBottom:8}}>{p.headerText}</div> : null}
				{p.topTextWhenValid && !_s.disableTopTextAsFormValid ? <div style={{marginBottom:8}}>{p.topTextWhenValid}</div> : null}
				{p.muiButton == 'FlatButton' ?
					<FlatButton
						{...mui_props}
					/>
			 	:
			 		<RaisedButton
			 			{...mui_props}
			 			primary={p.primary || false}
		 			/>
			 	}
			 	{p.disabled ? null :
				 	<input type="hidden" name={p.name} value="1"/>
				}
			</div>
				  
	);}
});

module.exports = StdButton;