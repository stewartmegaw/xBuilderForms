// TODO this.prop.msgStyle=="popup" is not implemented yet
// because its not required yet!

const React = require('react');

var StdForm = require('xbuilder-forms/partials/components/stdForm');

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
				sent:false,
				requestType:''
			}, this.props.form);

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
		if(!serverSide)
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
				                  components.stdTextField = require('xbuilder-forms/partials/components/stdTextField');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'select':
					case 'multiSelect':
						if(!components.stdSelect)
							require.ensure([], (require) => {
				                  components.stdSelect = require('xbuilder-forms/partials/components/stdSelect');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					// case 'multiSelect':
					// 	if(!components.stdMultiSelect)
					// 		require.ensure([], (require) => {
				 //                  components.stdMultiSelect = require('xbuilder-forms/partials/components/stdMultiSelect');
				 //                  _this.setState({components:components}, _this.componentsLoaded);
				 //            });
					// 	break;
					case 'date':
						if(!components.stdDatePicker)
							require.ensure([], (require) => {
				                  components.stdDatePicker = require('xbuilder-forms/partials/components/stdDatePicker');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'placeSuggest':
						if(!components.stdPlaceSuggest)
							require.ensure([], (require) => {
				                  components.stdPlaceSuggest = require('xbuilder-forms/partials/components/stdPlaceSuggest');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'videoCapture':
						if(!components.stdVideoCapture)
							require.ensure([], (require) => {
				                  components.stdVideoCapture = require('xbuilder-forms/partials/components/stdVideoCapture');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'tagSuggest':
						if(!components.stdTagSuggest)
							require.ensure([], (require) => {
				                  components.stdTagSuggest = require('xbuilder-forms/partials/components/stdTagSuggest');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'radio':
						if(!components.stdRadio)
							require.ensure([], (require) => {
				                  components.stdRadio = require('xbuilder-forms/partials/components/stdRadio');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'location':
						if(!components.stdLocation)
							require.ensure([], (require) => {
				                  components.stdLocation = require('xbuilder-forms/partials/components/stdLocation');
				                  _this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'codeMirror':
						if(!components.stdCodeMirror)
							require.ensure([], (require) => {
				                  components.stdCodeMirror = require('xbuilder-forms/partials/components/stdCodeMirror');
													_this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'file':
						if(!components.stdFile)
							require.ensure([], (require) => {
				                  components.stdFile = require('xbuilder-forms/partials/components/stdFile');
													_this.setState({components:components}, _this.componentsLoaded);
				            });
						break;
					case 'button':
					case 'submit':
						if(!components.stdButton)
							require.ensure([], (require) => {
				                  components.stdButton = require('xbuilder-forms/partials/components/stdButton');
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
		var _this = this;
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
	render() {
		let _this = this;
		let s = this.state;
		let p = this.props;

		// Most of the MUI components in switch need an id passed so that server
		// rendering is reusable

		return(
			<StdForm
				ref="form"
				id={"form_"+p.form.name}
				formName={p.form.name}
				method="POST"
				action={s.action}
				state={s}
				updated={(_f)=>{
 					this.setState(_f);
 					if(p.msgStyle=='popup' && (_f.success_msg || _f.global_error_msg))
 						emitter.emit('info_msg', _f.success_msg || _f.global_error_msg);
 				}}
				style={p.style}
				msgStyle={p.msgStyle}
				file={s.filePresent}
			>
				{p.topChildren || null}
				{p.msgStyle!='popup' && s.global_error_msg ? <div style={{color:"red"}}>{s.global_error_msg}</div> : null}
				{p.msgStyle!='popup' && s.success_msg ? <div style={p.successMsgStyle || {}}>{s.success_msg}</div> : null}
				{s.fields.map(function(field) {
					var component;
					var options = Object.assign({},field.options);
					var style = Object.assign({},field.style);

					// Check for linked fields
					var linkedFields = [];
					s.fields.map(function(_field) {
						if(_field.options && _field.options.linkedTo == field.name)
							linkedFields.push(_field);
					});

					switch(field.type)
					{
						case 'text':
							if(s.components.stdTextField)
							{
								component = (
									<s.components.stdTextField
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										floatingLabelText={field.label}
										floatingLabelStyle={style.floatingLabelStyle}
										inputStyle={style.inputStyle}
										fullWidth={true}
										below={style.below}
										className={style.class}
										state={s}
								        updated={(_f)=>_this.setState(_f)}
									/>
								);
							}
							break;
						case 'password':
							if(s.components.stdTextField)
							{
								component = (
									<s.components.stdTextField
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										floatingLabelText={field.label}
										floatingLabelStyle={style.floatingLabelStyle}
										inputStyle={style.inputStyle}
										fullWidth={true}
										below={style.below}
										className={style.class}
										type="password"
										state={s}
								        updated={(_f)=>_this.setState(_f)}
									/>
								);
							}
							break;
						case 'textarea':
							if(s.components.stdTextField)
							{
								component = (
									<s.components.stdTextField
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										floatingLabelText={field.label}
										floatingLabelStyle={style.floatingLabelStyle}
										textareaStyle={style.textareaStyle}
										fullWidth={true}
										multiLine={true}
										below={style.below}
										className={style.class}
										style={style.style}
										state={s}
								        updated={(_f)=>_this.setState(_f)}
									/>
								);
							}
							break;
						case 'date':
							if(s.components.stdDatePicker)
							{
								var minDate = null;
								if(options.minDate)
								{
									if(options.minDate.value && options.minDate.value.indexOf('now') != -1)
									{
										minDate = new Date();
										minDate.setHours(0,0,0,0); // No time
										minDate = minDate.getTime();
										if(options.minDate.add)
											minDate += (options.minDate.add * 1000 * 60 * 60 * 24);
										minDate = new Date(minDate);
									}
									else
										minDate = new Date(options.minDate);	
								}
								// Set to today -2000 years (else its mui default is today-100 years)
								else
								{
									minDate = new Date();
									minDate.setHours(0,0,0,0); // No time
									minDate = minDate.getTime() - (1000 * 60 * 60 * 24 * 365 * 300);
									minDate = new Date(minDate);
								}

								component = (
									<s.components.stdDatePicker
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										floatingLabelText={options && options.floatingLabelText ? options.floatingLabelText : field.label}
										state={s}
								        updated={(_f)=>_this.setState(_f)}
								        style={style.style || {}}
								        updateNeighbours={options ? options.updateNeighbours : null}
								        minDate={minDate}
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
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										floatingLabelText={field.label}
										autoWidth={style.autoWidth === 1 ? true : false}
										fullWidth={style.fullWidth === 0 ? false : true}
										state={s}
								        updated={(_f)=>_this.setState(_f)}
								        items={field.valueOptions}
								        style={style.style || {}}
								        multiple={field.type == "multiSelect"}
								        valueToString={options && options.valueCast == 'string'}
								        linkedFields={linkedFields}
									/>
								);
							}
							break;
						{/*case 'multiSelect':
							if(s.components.stdMultiSelect)
							{
								component = (
									<s.components.stdMultiSelect
										id={p.name + field.name}
										key={field.name}
										name={field.name}
										label={field.label}
										autoWidth={style.autoWidth === 1 ? true : false}
										fullWidth={style.fullWidth === 1 ? true : false}
										state={s}
								        updated={(_f)=>_this.setState(_f)}
								        items={field.valueOptions}
								        style={style.style || {}}
								        valueToString={options && options.valueCast == 'string'}
									/>
								);
							}
							break;*/}
						case 'radio':
							if(s.components.stdRadio)
							{
								component = (
									<s.components.stdRadio
										id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										label={field.label}
										autoWidth={style.autoWidth === 1 ? true : false}
										fullWidth={style.fullWidth === 1 ? true : false}
										state={s}
										updated={(_f)=>_this.setState(_f)}
										items={field.valueOptions}
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
					                    id={p.form.name + field.name}
										key={field.name}
										name={field.name}
						                floatingLabelText={field.label}
						                hintText={options.hintText ? options.hintText : null}
						                nullOnChange={true}
						                style={style.style || {}}
						                fullWidth={style === 1 ? true : false}
						                linkedFields={linkedFields}
						                state={s}
								        updated={(_f)=>_this.setState(_f)}
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
					                    id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										style={style.style || {}}
										label={field.label}
										afterLabel={options.afterLabel}
										minDuration={options.minDuration}
										maxDuration={options.maxDuration}
										state={s}
										updated={(_f, cb)=>_this.setState(_f,()=>{if(cb)cb();})}
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
					                    id={p.form.name + field.name}
										key={field.name}
										name={field.name}
										hintText={field.label}
										hintTextStyle={options.hintTextStyle ? options.hintTextStyle : null}
										unique={true}
										headerText={options.headerText ? options.headerText : null}
										state={s}
										updated={(_f)=>_this.setState(_f)}
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
											id={p.form.name + field.name}
											key={field.name}
											label={field.label}
											name={field.name}
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
										id={p.form.name + field.name}
										label={field.label}
										name={field.name}
										state={s}
										key={field.name}
										style={style}
										updated={(_f)=>_this.setState(_f)}
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
										id={p.form.name + field.name}
										label={field.label}
										name={field.name}
										state={s}
										key={field.name}
										style={style}
										previousFilenameField={linkedFields.length ? linkedFields[0] : null}
										updated={(_f)=>_this.setState(_f)}
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
										id={p.form.name + field.name}
										formId={"form_"+p.form.name}
										key={field.name}
									 	name={field.name}
										muiButton={style.buttonType ? style.buttonType : "FlatButton"}
										label={options.successLabel ? (s.success ? options.successLabel : field.label) : field.label}
									 	type="submit"
									 	disabled={s.success?true:false}
									 	style={style.style || {}}
										primary={true}
										headerText={options.headerText ? options.headerText : null}
										hoverColor={style.hoverColor}
										labelStyle={style.labelStyle}
										backgroundColor={style.backgroundColor}
										disableUntilValid={options.disableUntilValid || false}
										topTextWhenValid={options.topTextWhenValid ? options.topTextWhenValid : null}
										state={s}
									/>
								);
							}
							break;
					}
					return component;
				})}

		        <input key="hidden_form" type="hidden" name="formNameUniqueIdentifier" value={p.form.name} />
		        {p.bottomChildren || null}
		        {p.hiddenInputs ? Object.keys(p.hiddenInputs).map((prop,i)=>{return (<input type="hidden" key={i} name={prop} value={p.hiddenInputs[prop]} />)}):null}
			</StdForm>

		);
	}
});

module.exports = FormBuilder;
