const React = require('react');

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

var validate = require("validate.js");

const StdMultiSelect = React.createClass({
	onChange:function(event,index,value){
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


		var selectedValues = [];
		if(s.data[p.name])
		{
			$.each(s.data[p.name], (index, obj)=>{

				if(obj instanceof Array || obj instanceof Object)
				{
					var str = "" + obj.id;
					selectedValues.push(str);
				}
				else {
					selectedValues.push(obj);
				}
			});
		}


		return (
			<span>
                <p>{p.label}</p>
                <select
                    name={p.name + "[]"}
                    ref={p.name}
                    multiple={true}
					defaultValue={selectedValues}
					id={p.id}
                >
                    {Object.keys(p.items.values).map(function(v,i) {
                        return <option
									key={i}
									value={p.items.values[i]}
								>
									{p.items.text[i]}
								</option>
                    })}
                </select>
		    </span>
	);}
});

module.exports = StdMultiSelect;
