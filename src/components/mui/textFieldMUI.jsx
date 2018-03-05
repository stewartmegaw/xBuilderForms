const React = require('react');

import TextField from 'material-ui/TextField';

const TextFieldMUI = React.createClass({
	render: function() {
		var p = this.props;
		var fs = p.formState;

		var muiProps = Object.assign({},p.muiProps);
		if(!muiProps.hasOwnProperty('fullWidth'))
			muiProps.fullWidth = true;
        if(!muiProps.hasOwnProperty('floatingLabelText'))
            muiProps.floatingLabelText = p.field.label;
                  
      	if(p.commonProps.type == "textarea")
      		muiProps.multiLine = true;

		return (
			<TextField
				{...p.commonProps}
			 	{...muiProps}
		       	onChange={(e)=>p.onChange(this.refs[p.commonProps.name].getValue(), e)}
		       	onBlur={p.events.onBlur}
	          	errorText={fs.error_msgs[p.commonProps.name] ? fs.error_msgs[p.commonProps.name][0] : null}
	        />

	);}
});

module.exports = TextFieldMUI;