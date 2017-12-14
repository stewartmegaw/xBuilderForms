const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

const StdTextField = Component(React.createClass({
	getInitialState(){
		return {
			stdTextFieldMUI:null
		}
	},
	componentWillMount() {
		var _this = this;

		if(this.props.muiProps)
		{	
			require.ensure([], (require) => {
	              var component = require('xbuilder-forms/components/stdTextFieldMUI');
	              _this.setState({stdTextFieldMUI:component});
	        });
		}
	},
	render: function() {
		var p = this.props;
		var fs = p.formState;
		var s = this.state;

		var stdProps = {
			id:p.id,
			name: p.name,
			style:p.style || {},
			className:p.className,
	        ref:p.name,
	        value:fs.data[p.name],
	        type: p.type || "text"
		}

		if(!p.muiProps)
		{
			var extraProps = {};
			extraProps.onChange = (e)=>{this.onChange(e.target.value.trim(), e)};
			extraProps.onBlur = p.events.onBlur;
			return stdProps.type == "textarea" ?  <textarea {...stdProps} {...extraProps}/> : <input {...stdProps} {...extraProps}/>
		}

		if(!s.stdTextFieldMUI)
			return null;

		return (
			<s.stdTextFieldMUI
				formState={fs}
				field={p.field}
				onChange={(value,e)=>this.onChange(value,e)}
				stdProps={stdProps}
				muiProps={p.muiProps}
				events={p.events}
			/>
	);}
}));

module.exports = StdTextField;
