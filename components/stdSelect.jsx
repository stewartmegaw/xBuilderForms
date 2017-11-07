const React = require('react');

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

var Component = require('xbuilder-forms/wrappers/component');
var validate = require("validate.js");

const StdSelect = Component(React.createClass({
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
		var _s = this.state;

		var mui_props = {
			name: p.name,
			fullWidth: p.fullWidth,
			floatingLabelText: p.field.label,
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
					onChange={(event,index,value)=>this.onChange(value)}
					errorText={s.error_msgs[p.name] ? s.error_msgs[p.name][0] : null}
				>
					{Object.keys(_s.options.valueOptions.values).map(function(v,i) {
						return <MenuItem
							insetChildren={p.multiple ? true : false}
					        checked={p.multiple ? _value.indexOf(_s.options.valueOptions.values[i]) > -1 : false}
							value={_s.options.valueOptions.values[i]}
							primaryText={_s.options.valueOptions.text[i]}
							key={i}/>
					})}
			    </SelectField>
			    {p.multiple ?
			    	<span>
			    		{_s.options.valueOptions.values.map((v, i)=>{
			    			return _value.indexOf(_s.options.valueOptions.values[i]) == -1 ? null : (
			    				<input type="hidden" name={p.name+"[]"} value={_s.options.valueOptions.values[i]} key={i} />
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
}));

module.exports = StdSelect;