const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

const StdSelect = Component(React.createClass({
	getInitialState(){
		return {
			stdSelectMUI:null
		}
	},
	componentWillMount() {
		var _this = this;

		if(this.props.muiProps)
		{	
			require.ensure([], (require) => {
	              var component = require('xbuilder-forms/components/stdSelectMUI');
	              _this.setState({stdSelectMUI:component});
	        });
		}
	},
	getValue: function(){
		var p = this.props;
		var fs = p.formState;
		var s = this.state;

		var valuePresent = fs.data[p.name] !== null && fs.data.hasOwnProperty(p.name) && fs.data[p.name] != "undefined";

		if(p.multiple)
		{
			if(!valuePresent)
				return [];
			else
			{
				if(s.options.valueCast == 'string')
				{
					var vals = [];
					fs.data[p.name].map((v)=>{
						vals.push(v.toString());
					});
					return vals;
				}
				else
					return fs.data[p.name];
			}
		}
		else
			return valuePresent && s.options.valueCast == 'string' ? fs.data[p.name].toString() : fs.data[p.name];
	},
	render: function() {
		var p = this.props;
		var fs = p.formState;
		var s = this.state;

		var _value = this.getValue();

		var stdProps = {
			id:p.id,
			name: p.name,
			style:p.style || {},
			className:p.className,
			value:_value,
			multiple: p.type == "multiSelect" ? true : false
		};


		if(!p.muiProps)
		{
			stdProps.onChange = (e)=>{this.onChange(e.target.value.trim(), e)};
			return (
				<select {...stdProps}>
					{Object.keys(s.options.valueOptions.values).map(function(v,i) {
						return (
							<option
								checked={p.multiple ? _value.indexOf(s.options.valueOptions.values[i]) > -1 : false}
								value={s.options.valueOptions.values[i]}
								key={i}>
								{s.options.valueOptions.text[i]}
							</option>
						)
					})}
				</select>
			)
		}

		if(!s.stdSelectMUI)
			return null;

		return (
			<s.stdSelectMUI
				state={s}
				formState={fs}
				field={p.field}
				onChange={(value,e)=>this.onChange(value,e)}
				stdProps={stdProps}
				muiProps={p.muiProps}
				getValue={this.getValue}
			/>
	);}
}));

module.exports = StdSelect;