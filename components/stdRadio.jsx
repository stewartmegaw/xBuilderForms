const React = require('react');

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import MenuItem from 'material-ui/MenuItem';

var Component = require('xbuilder-forms/wrappers/component');
var validate = require("validate.js");

var style = require('xbuilder-forms/style/radio.css');

const StdRadio = Component(React.createClass({
	getValue: function(){
		var p = this.props;
		var s = p.state;

		var valuePresent = s.data[p.name] != null && s.data[p.name] != "undefined";

		return valuePresent && p.valueToString ? s.data[p.name].toString() : s.data[p.name];
	},
	render: function() {
		var p = this.props;
		var s = p.state;
		var _s = this.state;

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
					defaultSelected={this.getValue()}
					onChange={(event, value)=>this.onChange(value)}
                    labelPosition="right"
				>
					{Object.keys(_s.options.valueOptions.values).map(function(v,i) {
						return <RadioButton value={_s.options.valueOptions.values[i]} label={_s.options.valueOptions.text[i]} key={i} style={{marginBottom:5}}/>
					})}
			    </RadioButtonGroup>
			    {s.error_msgs[p.name] ? <div style={{color:'red',fontSize:'12px'}}>{s.error_msgs[p.name][0]}</div> : null}
		    </div>
	);}
}));

module.exports = StdRadio;
