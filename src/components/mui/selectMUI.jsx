const React = require('react');

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const SelectMUI = (props) => { 

		var s = props.state;

		var muiProps = Object.assign({},props.muiProps);
		if(!muiProps.hasOwnProperty('fullWidth'))
			muiProps.fullWidth = true;
        if(!muiProps.hasOwnProperty('floatingLabelText'))
            muiProps.floatingLabelText = props.field.label;


		return (
			<span>
				<SelectField
					{...muiProps}
					{...props.stdProps}
					onChange={(event,index,value)=>props.onChange(value, event)}
					errorText={props.error_msgs ? props.error_msgs[0] : null}
				>
					{props.field.options.valueOptions ? Object.keys(props.field.options.valueOptions.values).map(function(v,i) {
            return <MenuItem
							insetChildren={props.stdProps.multiple ? true : false}
					        checked={props.stdProps.multiple ? props.stdProps.value.indexOf(s.options.valueOptions.values[i]) > -1 : false}
							value={props.field.options.valueOptions.values[i]}
							primaryText={props.field.options.valueOptions.text[i]}
							key={i}/>
					}) : null}
			    </SelectField>
			    {props.stdProps.multiple ?
			    	<span>
			    		{props.field.options.valueOptions ? props.field.options.valueOptions.values.map((v, i)=>{
			    			return props.stdProps.value.indexOf(props.field.options.valueOptions.values[i]) == -1 ? null : (
			    				<input type="hidden" name={props.stdProps.name+"[]"} value={props.field.options.valueOptions.values[i]} key={i} />
		    				)
			    		}) : null}
			    	</span>
		    	:
			    	<input type="hidden" name={props.stdProps.name} value={props.stdProps.value} />
			    }
		    </span>				  
	);
}

module.exports = SelectMUI;
