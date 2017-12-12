const React = require('react');


var Component = require('xbuilder-forms/wrappers/component');

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var validate = require("validate.js");

var style = require('xbuilder-forms/style/button.css');

const StdButton = Component(React.createClass({
	getInitialState(){
		return {
		};
	},
	render: function() {
		var s = this.props.state;
		var p = this.props;
		var _s = this.state;

		var mui_props = {
			id:p.id,
			label: p.label,
			type: p.type || "submit",
			disabled:p.disabled,
			hoverColor:p.hoverColor,
			backgroundColor:p.backgroundColor,
			labelStyle:p.labelStyle,
		};

		return (
			<div style={p.style|| {}} className={style.container}>
				{p.muiButton == 'FlatButton' ?
					<FlatButton
						{...mui_props}
					/>
			 	:
			 		<RaisedButton
			 			{...mui_props}
			 			primary={p.primary == false ? false : true}
		 			/>
			 	}
			 	{p.disabled ? null :
				 	<input type="hidden" name={p.name} value="1"/>
				}
			</div>
				  
	);}
}));

module.exports = StdButton;