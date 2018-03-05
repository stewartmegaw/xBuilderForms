const React = require('react');

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const SelectMUI = React.createClass({
	render: function() {
		var p = this.props;
		var fs = p.formState;
		var s = this.props.state;

		var muiProps = Object.assign({},p.muiProps);
		if(!muiProps.hasOwnProperty('fullWidth'))
			muiProps.fullWidth = true;
        if(!muiProps.hasOwnProperty('floatingLabelText'))
            muiProps.floatingLabelText = p.field.label;


		var _value = this.props.getValue();

		return (
			<span>
				<SelectField
					{...muiProps}
					{...p.stdProps}
					onChange={(event,index,value)=>p.onChange(value, event)}
					errorText={fs.error_msgs[p.stdProps.name] ? fs.error_msgs[p.stdProps.name][0] : null}
				>
					{Object.keys(s.options.valueOptions.values).map(function(v,i) {
						return <MenuItem
							insetChildren={p.stdProps.multiple ? true : false}
					        checked={p.stdProps.multiple ? _value.indexOf(s.options.valueOptions.values[i]) > -1 : false}
							value={s.options.valueOptions.values[i]}
							primaryText={s.options.valueOptions.text[i]}
							key={i}/>
					})}
			    </SelectField>
			    {p.stdProps.multiple ?
			    	<span>
			    		{s.options.valueOptions.values.map((v, i)=>{
			    			return _value.indexOf(s.options.valueOptions.values[i]) == -1 ? null : (
			    				<input type="hidden" name={p.stdProps.name+"[]"} value={s.options.valueOptions.values[i]} key={i} />
		    				)
			    		})}
			    	</span>
		    	:
			    	<input type="hidden" name={p.stdProps.name} value={_value} />
			    }
		    </span>				  
	);}
});

module.exports = SelectMUI;