const React = require('react');

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const ButtonMUI = React.createClass({
	render: function() {
		var p = this.props;

		var muiProps = Object.assign({},p.muiProps);
		if(!muiProps.hasOwnProperty('label'))
			muiProps.label = p.field.label;

		muiProps.onClick = p.events.onClick;

		return (
			<span>
				{p.muiButtonType == 'FlatButton' ?
					<FlatButton
						{...p.stdProps}
					 	{...muiProps}
					/>
			 	:
			 		<RaisedButton
						{...p.stdProps}
					 	{...muiProps}
		 			/>
			 	}
			 	{p.disabled ? null :
				 	<input type="hidden" name={p.stdProps.name} value="1"/>
				}
			</span>
				  
	);}
});

module.exports = ButtonMUI;