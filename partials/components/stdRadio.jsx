const React = require('react');

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import MenuItem from 'material-ui/MenuItem';

var validate = require("validate.js");

var style = require('alpha-client-lib/style/radio.css');

const StdRadio = React.createClass({
	onChange:function(event, value){
		var p = this.props;
		var s = p.state;

	  	var _s = Object.assign({},s);
	  	_s.data[p.name] = value;


	  	if(s.error_msgs[p.name])
  		{
  			// Only validate this field
  			var fieldVals = {};
			fieldVals[p.name] = value.trim();
			var constraints = {};
			constraints[p.name] = s.constraints[p.name];
			var errors = validate(fieldVals, constraints);
			var _s = Object.assign({},s);
	  		_s.error_msgs = errors || {};
  		}

	  	this.props.updated(_s);
	},
	render: function() {
		var p = this.props;
		var s = p.state;

		var mui_props = {
			name: p.name,
			//fullWidth: p.fullWidth,
			//autoWidth:p.autoWidth,
			style:p.style,
		};

		return (
			<div id={p.id}>
				<div className={style.spacer} />
            	<p className={style.label}>{p.label}</p>
				<RadioButtonGroup
					{...mui_props}
					defaultSelected={p.valueToString && s.data[p.name] ? s.data[p.name].toString() : s.data[p.name]}
					onChange={this.onChange}
                    labelPosition="right"
				>
					{Object.keys(p.items.values).map(function(v,i) {
						return <RadioButton value={p.items.values[i]} label={p.items.text[i]} key={i} style={{marginBottom:5}}/>
					})}
			    </RadioButtonGroup>
			    {s.error_msgs[p.name] ? <div style={{color:'red',fontSize:'12px'}}>{s.error_msgs[p.name][0]}</div> : null}
		    </div>
	);}
});

module.exports = StdRadio;
