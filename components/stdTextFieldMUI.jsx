const React = require('react');

import TextField from 'material-ui/TextField';

const StdTextFieldMUI = React.createClass({
	render: function() {
		var p = this.props;
		var fs = p.formState;

		var muiProps = Object.assign({},p.muiProps);
		if(!muiProps.hasOwnProperty('fullWidth'))
			muiProps.fullWidth = true;
        if(!muiProps.hasOwnProperty('floatingLabelText'))
            muiProps.floatingLabelText = p.field.label;
                  
      	if(p.stdProps.type == "textarea")
      		muiProps.multiLine = true;

		return (
			<TextField
				{...p.stdProps}
			 	{...muiProps}
		       	onChange={(e)=>p.onChange(this.refs[p.stdProps.name].getValue(), e)}
	          	errorText={fs.error_msgs[p.stdProps.name] ? fs.error_msgs[p.stdProps.name][0] : null}
	        />

	);}
});

module.exports = StdTextFieldMUI;