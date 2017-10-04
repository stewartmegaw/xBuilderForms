const React = require('react');

const ManualForm = React.createClass({
	getInitialState(){
		return {
			pointerEvents:'normal'
		};
	},
	submit(){
		this.refs.submitBtn.click();
	},
	submitted:false,
	render: function() {
		var _this = this;
		var p = this.props;

		var form_props = {
			method:p.method || 'POST',
			action:p.action,
			style: Object.assign({padding:0,margin:0,pointerEvents:this.state.pointerEvents}, p.style || {}),
			className:p.className
		};

		return (
			<form
				{...form_props}
				ref="form"
				onClick={this.props.submitOnClick ? ()=>this.submit() : null}
				onSubmit={(e)=>{

					if(_this.props.disableClickOnSubmit && !_this.submitted)
					{
						// Don't submit now or else the user will be able to click again
						// Only submit after a rerender
						_this.submitted = true;
						_this.setState({pointerEvents:'none'},()=>{
							_this.submit();
						});
						return;
					}

					var submit = true;
					if(_this.props.onSubmit)
						submit = _this.props.onSubmit();

					if(submit === false)
						e.preventDefault();
				}}
			>
				{p.children}
				{p.formName ? <input type="hidden" name="formNameUniqueIdentifier" value={p.formName}/> : null}

				{/* This submit button is used for manually submitting the form and is otherwise invisible.
					Submitting this way ensures the onSubmit handler is triggered
				 */}
				<input style={{position:'absolute',visibility:"hidden"}} type="submit" ref="submitBtn" value="1"/>
			</form>
	);}
});

module.exports = ManualForm;
