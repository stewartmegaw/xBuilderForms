const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

import TextField from 'material-ui/TextField';

const StdTextField = Component(React.createClass({
	render: function() {
		var s = this.props.state;
		var p = this.props;

		var mui_props = {
			name: p.name,
			fullWidth: p.fullWidth,
			floatingLabelText: p.floatingLabelText,
			floatingLabelStyle: p.floatingLabelStyle||{},
			inputStyle:p.inputStyle || {},
			textareaStyle:p.textareaStyle || {},
			className:p.className,
			type: p.type,
			multiLine:p.multiLine,
			id:p.id,
			style:p.style || {}
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
