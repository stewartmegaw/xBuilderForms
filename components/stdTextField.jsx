const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

import TextField from 'material-ui/TextField';

const StdTextField = Component(React.createClass({
	render: function() {
		var s = this.props.state;
		var p = this.props;

		var mui_props = {
			id:p.id,
			name: p.name,
			style:p.style || {},
			className:p.className,
			fullWidth: p.fullWidth,
			floatingLabelText: p.field.label,
			floatingLabelStyle: p.floatingLabelStyle||{},
			inputStyle:p.inputStyle || {},
			textareaStyle:p.textareaStyle || {},
			type: p.type,
			multiLine:p.multiLine,
		};

		return (
			<div>
				<TextField
				  {...mui_props}
		          ref={p.name}
		          value={s.data[p.name]}
		          onChange={()=>this.onChange(this.refs[p.name].getValue().trim())}
		          errorText={s.error_msgs[p.name] ? s.error_msgs[p.name][0] : null}
		        />
		        {!p.below ? null :
		        	<p style={{marginTop:10}} dangerouslySetInnerHTML={{__html:p.below}}></p>
		        }
	        </div>

	);}
}));

module.exports = StdTextField;
