// TODO this.prop.msgStyle=="popup" is not implemented yet
// because its not required yet!

const React = require('react');

var _Form = require('xbuilder-forms/components/form');

require('xbuilder-forms/style/global.gcss');

const AppState = require('xbuilder-core/lib/appState');

const parseUrl = require('parse-url');

const FormBuilder = React.createClass({
	getInitialState:function(){
		// Ensure form has defaults
		var s = Object.assign(
			{
				components:{},
				data:{},
				error_msgs:{},
				constraints:{},
				fields:[],
				sent:false,
				requestType:''
			}, this.props.form);

		if(!this.props.manual)
		{

			// Sort fields by desired postion
			s.fields.sort(function(a,b){
				 return a.position - b.position;
			});

			// Set default values
			var parsedUrl = parseUrl(serverSide ? uri : window.location.href);	
			var data = {};
			var fields = s.fields;
			var filePresent = false;
			for(var i = 0; i < fields.length; i++)
			{
				if(fields[i].type == 'file')
					filePresent = true;

				var defaultValue = fields[i].defaultValue;
				if(defaultValue && defaultValue.length != 0)
				{
					switch(defaultValue.type)
					{
						case "stateProperty":
							var prop_path = defaultValue.value;
							// Get appState value from prop_path string
							var _appState = Object.assign({}, appState);
							for (var j=0, prop_path=prop_path.split('.'), len=prop_path.length; j<len; j++){
						        _appState = _appState[prop_path[j]];
						    };
						    data[fields[i].name] = _appState;
							break;
						case "simple":
							data[fields[i].name] = defaultValue.value;
							break;						
						case "fromRouteParam":
							data[fields[i].name] = AppState.getProp('routeParams.'+defaultValue.param);
							break;
						case "clone":
							this.clones[fields[i].name] = defaultValue.value;
							break;
						case "useQuery":
							var query_fieldname = defaultValue.field || fields[i].name;
							var queryObject = parsedUrl.search ? JSON.parse('{"' + decodeURI(parsedUrl.search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}') : {};
							data[fields[i].name] = queryObject[query_fieldname];
							break;
						case "date":
							if(defaultValue.value.indexOf('now') != -1)
							{
								var d = new Date();
								d.setHours(0,0,0,0); // No time
								data[fields[i].name] = d.getTime();
								if(defaultValue.add)
									data[fields[i].name] += (defaultValue.add * 1000 * 60 * 60 * 24);
							}
							else
								data[fields[i].name] = defaultValue.value;
							break;
						default:
	 						data[fields[i].name] = defaultValue.value;		
	 						break;
					}
				}
			}

			s.data = Object.assign(this.props.data || {}, data, s.data);
		}

		if(filePresent)
			s.filePresent = 1;

		s.action = this.props.action || s.action || parsedUrl.pathname;

		// If the action does not already have a query string
		// attach the current redirect query param if it exists
		if(AppState.getProp('queryParams.redirect') && s.action.indexOf('?') == -1)
			s.action = s.action + '?redirect=' + AppState.getProp('queryParams.redirect');

		return s;
	},
	updateData(newData, cb){
		this.setState({data:Object.assign(this.state.data,newData ||{})}, cb);
	},
	componentDidMount(){
		// Get the components async or we will have a lot of used code
		if(!serverSide && !this.props.manual)
		{
			var _this = this;
			var s = this.state;
			var components = s.components;

			s.fields.map(function(field) {
				switch(field.type)
				{
					case 'text':
					case 'password':
					case 'textarea':
						if(!components.stdTextField)
							require.ensure([], (require) => {
				                  components.stdTextField = require('xbuilder-forms/components/stdTextField');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'select':
					case 'multiSelect':
						if(!components.stdSelect)
							require.ensure([], (require) => {
				                  components.stdSelect = require('xbuilder-forms/components/stdSelect');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					// case 'multiSelect':
					// 	if(!components.stdMultiSelect)
					// 		require.ensure([], (require) => {
				 //                  components.stdMultiSelect = require('xbuilder-forms/components/stdMultiSelect');
				 //                  _this.setState({components:components}, _this.componentsLoaded);
				 //            });
					// 	break;
					case 'date':
						if(!components.stdDatePicker)
							require.ensure([], (require) => {
				                  components.stdDatePicker = require('xbuilder-forms/components/stdDatePicker');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'placeSuggest':
						if(!components.stdPlaceSuggest)
							require.ensure([], (require) => {
				                  components.stdPlaceSuggest = require('xbuilder-forms/components/stdPlaceSuggest');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'videoCapture':
						if(!components.stdVideoCapture)
							require.ensure([], (require) => {
				                  components.stdVideoCapture = require('xbuilder-forms/components/stdVideoCapture');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'tagSuggest':
						if(!components.stdTagSuggest)
							require.ensure([], (require) => {
				                  components.stdTagSuggest = require('xbuilder-forms/components/stdTagSuggest');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'radio':
						if(!components.stdRadio)
							require.ensure([], (require) => {
				                  components.stdRadio = require('xbuilder-forms/components/stdRadio');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'location':
						if(!components.stdLocation)
							require.ensure([], (require) => {
				                  components.stdLocation = require('xbuilder-forms/components/stdLocation');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'codeMirror':
						if(!components.stdCodeMirror)
							require.ensure([], (require) => {
				                  components.stdCodeMirror = require('xbuilder-forms/components/stdCodeMirror');
													_this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'file':
						if(!components.stdFile)
							require.ensure([], (require) => {
				                  components.stdFile = require('xbuilder-forms/components/stdFile');
													_this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'dynamicJson':
						if(!components.stdDynamicJson)
							require.ensure([], (require) => {
				                  components.stdDynamicJson = require('xbuilder-forms/components/stdDynamicJson');
													_this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'button':
					case 'submit':
						if(!components.stdButton)
							require.ensure([], (require) => {
				                  components.stdButton = require('xbuilder-forms/components/stdButton');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					default:
						// Required for componentsLoaded to function properly
						components[field.type] = 1;
						_this.setState({components:components}, _this.componentsLoaded);
					break;

				}
			});
		}
	},
	componentsLoaded(){
		var allLoaded = true;

		var components = this.state.components;

		this.state.fields.map(function(field) {
			switch(field.type)
			{
				case 'text':
				case 'password':
				case 'textarea':
					if(!components.stdTextField)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'select':
				case 'multiSelect':
					if(!components.stdSelect)
					{
						allLoaded = false;
						return false;
					}
					break;
				// case 'multiSelect':
				// 	if(!components.stdMultiSelect)
				// 	{
				// 		allLoaded = false;
				// 		return false;
				// 	}
				// 	break;
				case 'radio':
					if(!components.stdRadio)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'location':
					if(!components.stdLocation)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'date':
					if(!components.stdDatePicker)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'placeSuggest':
					if(!components.stdPlaceSuggest)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'videoCapture':
					if(!components.stdVideoCapture)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'tagSuggest':
					if(!components.stdTagSuggest)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'codeMirror':
					if(!components.stdCodeMirror)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'file':
					if(!components.stdFile)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'dynamicJson':
					if(!components.stdDynamicJson)
					{
						allLoaded = false;
						return false;
					}
					break;
				case 'button':
				case 'submit':
					if(!components.stdButton)
					{
						allLoaded = false;
						return false;
					}
					break;
				default:
					if(!components[field.type])
					{
						allLoaded = false;
						return false;
					}
				break;

			}
		});
		
		if(allLoaded)
		{
			var _this = this;
			this.setState({componentsLoaded:1}, function(){
				if(_this.props.componentsLoaded)
					_this.props.componentsLoaded();
			});
		}
	},
	clones:{},
	submit(success_cb) {
		this.refs.form.manualSubmit(success_cb);
	},
	getAllFields(){
		var fields = [];
		for(var i = 0; i < this.state.fields.length; i++)
			fields.push(this.getField(this.state.fields[i]));

		return fields;
	},
	getFieldByName(name) {
		for(var i = 0; i < this.state.fields.length; i++)
			if(this.state.fields[i].name == name)
				return this.getField(this.state.fields[i]);
	},
	getField(field){
		var p = this.props;
		var style = p.fieldStyles && p.fieldStyles[field.name] ? p.fieldStyles[field.name]  : {};
		var className = p.fieldClassName && p.fieldClassName[field.name] ? p.fieldClassName[field.name]  : null;

		var component = this.getComponent(field, style, className);
		if(p.fieldWrappers && p.fieldWrappers[field.name])
			return p.fieldWrappers[field.name](component);
		else
			return component;
	},
	getComponent(field, style, className){
		let _this = this;
		let s = this.state;
		let p = this.props;

		var component;
		var options = Object.assign({},field.options);

		switch(field.type)
		{
			case 'text':
				if(s.components.stdTextField)
				{
					component = (
						<s.components.stdTextField
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
					        updated={(_f)=>_this.setState(_f)}
							className={className}
							style={style}
							floatingLabelStyle={style.floatingLabelStyle}
							inputStyle={style.inputStyle}
							fullWidth={true}
							below={style.below}
						/>
					);
				}
				break;
			case 'password':
				if(s.components.stdTextField)
				{
					component = (
						<s.components.stdTextField
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
					        updated={(_f)=>_this.setState(_f)}
							floatingLabelStyle={style.floatingLabelStyle}
							inputStyle={style.inputStyle}
							fullWidth={true}
							below={style.below}
							className={style.class}
							type="password"
						/>
					);
				}
				break;
			case 'textarea':
				if(s.components.stdTextField)
				{
					component = (
						<s.components.stdTextField
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
					        updated={(_f)=>_this.setState(_f)}
							floatingLabelStyle={style.floatingLabelStyle}
							textareaStyle={style.textareaStyle}
							fullWidth={true}
							multiLine={true}
							below={style.below}
							className={style.class}
							style={style.style}
						/>
					);
				}
				break;
			case 'date':
				if(s.components.stdDatePicker)
				{
					component = (
						<s.components.stdDatePicker
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
					        updated={(_f)=>_this.setState(_f)}
							floatingLabelText={options && options.floatingLabelText ? options.floatingLabelText : field.label}
					        style={style.style || {}}
					        updateNeighbours={options ? options.updateNeighbours : null}
					        onFocusSetDate={options ? options.onFocusSetDate : null}
						/>
					);
				}
				break;
			case 'select':
			case 'multiSelect':
				if(s.components.stdSelect)
				{
					component = (
						<s.components.stdSelect
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
					        updated={(_f)=>_this.setState(_f)}
							autoWidth={style.autoWidth === 1 ? true : false}
							fullWidth={style.fullWidth === 0 ? false : true}
					        style={style.style || {}}
					        multiple={field.type == "multiSelect"}
					        valueToString={options && options.valueCast == 'string'}
						/>
					);
				}
				break;
			case 'radio':
				if(s.components.stdRadio)
				{
					component = (
						<s.components.stdRadio
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							updated={(_f)=>_this.setState(_f)}
							label={field.label}
							autoWidth={style.autoWidth === 1 ? true : false}
							fullWidth={style.fullWidth === 1 ? true : false}
							style={style.style || {}}
							valueToString={options && options.valueCast == 'string'}
							/>
					);
				}
				break;
			case 'placeSuggest':
				if(s.components.stdPlaceSuggest)
				{
					component = (
						<s.components.stdPlaceSuggest
							key={field.name}
							formName={p.form.name}
							field={field}
			                state={s}
					        updated={(_f)=>_this.setState(_f)}
			                hintText={options.hintText ? options.hintText : null}
			                nullOnChange={true}
			                style={style.style || {}}
			                fullWidth={style === 1 ? true : false}
			                updateLocationQuery={options.updateLocationQuery || false}
					        placeTypes={['(cities)']}
							geocode={options.useUserLocation ? AppState.getProp('user.location',false) : false }
			            />
					);
				}
				break;
			case 'videoCapture':
				if(s.components.stdVideoCapture)
				{
					component = (
						<s.components.stdVideoCapture
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							updated={(_f, cb)=>_this.setState(_f,()=>{if(cb)cb();})}
							style={style.style || {}}
							afterLabel={options.afterLabel}
							minDuration={options.minDuration}
							maxDuration={options.maxDuration}
							fieldId={field.id}
							editIcon={options.editIcon}
							onSuccess={options.submitAfterUpload ? ()=>_this.refs.form.manualSubmit() : null}
			            />
					);
				}
				break;
			case 'tagSuggest':
				if(s.components.stdTagSuggest)
				{
					component = (
						<s.components.stdTagSuggest
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							updated={(_f)=>_this.setState(_f)}
							hintTextStyle={options.hintTextStyle ? options.hintTextStyle : null}
							headerText={options.headerText ? options.headerText : null}
							unique={true}
							inputAsTag={true}
							viewMode={options.viewMode && !p.edit}
			            />
					);
				}
				break;
			case 'codeMirror':
					if(s.components.stdCodeMirror)
					{
						component = (
							<s.components.stdCodeMirror
								key={field.name}
								formName={p.form.name}
								field={field}
								state={s}
								updated={(_f)=>_this.setState(_f)}
				            />
						);
					}
					break;
			case 'dynamicJson':
					if(s.components.stdDynamicJson)
					{
						component = (
							<s.components.stdDynamicJson
								key={field.name}
								formName={p.form.name}
								field={field}
								state={s}
								updated={(_f)=>_this.setState(_f)}
				            />
						);
					}
					break;
			case 'location':
				if(s.components.stdLocation)
				{
					component = (
						<s.components.stdLocation
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							updated={(_f)=>_this.setState(_f)}
							style={style}
							latName={options.latName}
							lngName={options.lngName}
			    		/>
					);
				}
				break;
			case 'file':
				if(s.components.stdFile)
				{
					component = (
						<s.components.stdFile
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							updated={(_f)=>_this.setState(_f)}
							style={style}
							/>
					);
				}
				break;
			case 'hidden':
			 	component = (
			 		<input
			 			key={field.name}
			 			type="hidden"
			 			name={field.name}
			 			value={_this.clones[field.name] ? s.data[_this.clones[field.name]] : s.data[field.name]}
		 			/>
				);
				break;
			case 'submit':
			case 'button':
				if(s.components.stdButton)
				{
					component = (
						<s.components.stdButton
							key={field.name}
							formName={p.form.name}
							field={field}
							state={s}
							muiButton={style.buttonType ? style.buttonType : "FlatButton"}
							label={options.successLabel ? (s.success ? options.successLabel : field.label) : field.label}
						 	disabled={s.success?true:false}
						 	style={style.style || {}}
							headerText={options.headerText ? options.headerText : null}
							hoverColor={style.hoverColor}
							labelStyle={style.labelStyle}
							backgroundColor={style.backgroundColor}
							disableUntilValid={options.disableUntilValid || false}
							topTextWhenValid={options.topTextWhenValid ? options.topTextWhenValid : null}
						/>
					);
				}
				break;
		}
		return component;
	},
	render() {
		let _this = this;
		let s = this.state;
		let p = this.props;

		// Most of the MUI components in switch need an id passed so that server
		// rendering is reusable

		return(
			<_Form
				ref="form"
				id={"form_"+p.form.name}
				formName={p.form.name}
				method={p.method || "POST"}
				action={s.action}
				state={s}
				updated={(_f)=>{
 					this.setState(_f);
 					if(p.msgStyle=='popup' && (_f.success_msg || _f.global_error_msg))
 						emitter.emit('info_msg', _f.success_msg || _f.global_error_msg);
 				}}
				style={p.style || {}}
				msgStyle={p.msgStyle}
				file={s.filePresent}
				submitOnClick={p.submitOnClick}
				disableClickOnSubmit={p.disableClickOnSubmit}
			>
				{p.topChildren || null}
				{p.msgStyle!='popup' && s.global_error_msg ? <div style={{color:"red"}}>{s.global_error_msg}</div> : null}
				{p.msgStyle!='popup' && s.success_msg ? <div style={p.successMsgStyle || {}}>{s.success_msg}</div> : null}
				{p.layout ? p.layout(this.getFieldByName) : this.getAllFields()}

		        <input key="hidden_form" type="hidden" name="formNameUniqueIdentifier" value={p.form.name} />
		        
		        {p.manual ? p.children : null}

		        {p.bottomChildren || null}
		        
		        {p.hiddenInputs ? Object.keys(p.hiddenInputs).map((prop,i)=>{return (<input type="hidden" key={i} name={prop} value={p.hiddenInputs[prop]} />)}):null}
			</_Form>

		);
	}
});

module.exports = FormBuilder;
