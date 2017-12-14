const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

const StdButton = Component(React.createClass({
	getInitialState(){
		return {
			stdButtonMUI:null
		}
	},
	componentWillMount() {
		var _this = this;

		if(this.props.muiProps)
		{	
			require.ensure([], (require) => {
	              var component = require('xbuilder-forms/components/stdButtonMUI');
	              _this.setState({stdButtonMUI:component});
	        });
		}
	},
	render: function() {
		var p = this.props;
		var s = this.state;

		var stdProps = {
			id:p.id,
			name: p.name,
	        type: p.type,
			style:p.style || {},
			className:p.className,
	        ref:p.name,
	        value:1,
	        disabled:p.disabled || false,
	        onClick:p.events.onClick 
		}

		if(!p.muiProps)
		{
			var extraProps = {};
			extraProps.onClick = p.events.onClick;
			return <button {...stdProps}>{p.field.label}</button>
		}

		if(!s.stdButtonMUI)
			return null;

		return (
			<s.stdButtonMUI
				field={p.field}
				stdProps={stdProps}
				muiProps={p.muiProps}
				muiButtonType={p.muiButtonType}
				events={p.events}
			/>
				  
	);}
}));

module.exports = StdButton;