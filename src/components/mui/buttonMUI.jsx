const React = require('react');

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const ButtonMUI = (props) => {
		var muiProps = Object.assign({},props.muiProps);
		if(!muiProps.hasOwnProperty('label'))
			muiProps.label = props.field.label;

		muiProps.onClick = props.events.onClick;

		return (
			<span>
				{props.muiButtonType == 'FlatButton' ?
					<FlatButton
						{...props.stdProps}
					 	{...muiProps}
					/>
			 	:
			 		<RaisedButton
						{...props.stdProps}
					 	{...muiProps}
		 			/>
			 	}
			 	{props.disabled ? null :
				 	<input type="hidden" name={props.stdProps.name} value="1"/>
				}
			</span>
				  
	);
}

module.exports = ButtonMUI;
