const React = require('react');

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

var validate = require("validate.js");

const StdSelect = React.createClass({
	onChange:function(event,index,value){
		var p = this.props;
		var s = p.state;

	  	var _s = Object.assign({},s);
	  	_s.data[p.name] = value;


	  	if(s.error_msgs[p.name]) 
  		{
  			// Only validate this field
  			var fieldVals = {};
			fieldVals[p.name] = p.multiple ? value : value.trim();
			var constraints = {};
			constraints[p.name] = s.constraints[p.name];
			var errors = validate(fieldVals, constraints);
			var _s = Object.assign({},s);
	  		_s.error_msgs = errors || {};
  		}

	  	this.props.updated(_s);
	},
	getValue: function(){
		var p = this.props;
		var s = p.state;

		var valuePresent = s.data[p.name] != null && s.data[p.name] != "undefined";

		if(p.multiple)
		{
			if(!valuePresent)
				return [];
			else
			{
				if(p.valueToString)
				{
					var vals = [];
					s.data[p.name].map((v)=>{
						vals.push(v.toString());
					});
					return vals;
				}
				else
					return s.data[p.name];
			}
		}
		else
			return valuePresent && p.valueToString ? s.data[p.name].toString() : s.data[p.name];
	},
	render: function() {
		var p = this.props;
		var s = p.state;

		var mui_props = {
			name: p.name,
			fullWidth: p.fullWidth,
			floatingLabelText: p.floatingLabelText,
			id:p.id,
			autoWidth:p.autoWidth,
			style:p.style,
			multiple: p.multiple ? true : false
		};

		var _value = this.getValue();

		return (
			<span>
				<SelectField
					{...mui_props}
					value={_value}
					onChange={this.onChange}
					errorText={s.error_msgs[p.name] ? s.error_msgs[p.name][0] : null}
				>
					{Object.keys(p.items.values).map(function(v,i) {
						return <MenuItem
							insetChildren={p.multiple ? true : false}
					        checked={p.multiple ? _value.indexOf(p.items.values[i]) > -1 : false}
							value={p.items.values[i]}
							primaryText={p.items.text[i]}
							key={i}/>
					})}
			    </SelectField>
			    {p.multiple ?
			    	<span>
			    		{p.items.values.map((v, i)=>{
			    			return _value.indexOf(p.items.values[i]) == -1 ? null : (
			    				<input type="hidden" name={p.name+"[]"} value={p.items.values[i]} key={i} />
		    				)
			    		})}
			    	</span>
		    	:
			    	<input type="hidden" name={p.name} value={s.data[p.name]} />
			    }

			    {!p.linkedFields ? null: p.linkedFields.map(function(_field) {
					return <input key={_field.name} id={s ? s.name+_field.name : null} type="hidden" name={_field.name} value={s &&  s.data ? s.data[_field.name] : ''} />
				})}
		    </span>				  
	);}
});

module.exports = StdSelect;