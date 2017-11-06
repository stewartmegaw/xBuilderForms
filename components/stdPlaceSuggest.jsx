const React = require('react');

const AppState = require('xbuilder-core/lib/appState');

var apiKey = AppState.getProp('config.maps_api_key');
if(!serverSide && apiKey)
{   
	var mapsapi = require( 'google-maps-api' )(apiKey, ['places']);
}

var Geocode = require('xbuilder-core/lib/geocode');

const param = require("jquery-param");
const parseUrl = require('parse-url');
import AutoComplete from 'material-ui/AutoComplete';
import SearchSVG from 'material-ui/svg-icons/action/search';
var validate = require("validate.js");

const styles = require('xbuilder-forms/style/placeSuggest.css');

const StdPlaceSuggest = React.createClass({
	getInitialState:function() {
		var p = this.props;

		return {
			predictions:[],
			searchText: p.state && p.state.data ? (p.state.data[p.name] || "") : "",
			types: p.placeTypes || []
		};
	},
	componentDidMount(){
		var p = this.props;
		if(p.geocode && !this.state.searchText)
		{
			var lat = p.geocode.lat || p.geocode.latitude;
			var lng = p.geocode.lng || p.geocode.longitude;
			var _this = this;
			Geocode.go({
                lat:lat,
                lng:lng,
                success(r){
                    var place = Geocode.getAddressComponents(r.results[0].address_components, lat, lng);
                    // We dont want the result if there is no city
                    if(place.locale && place.country)
                		_this.placeUpdated(place, place.locale + ', ' + place.country);
                }
            });
		}
	},
	prediction_ids:[],
	place_changed:function(v){
		var _this = this;

		this.userEdited = true;

		if(this.props.nullOnChange)
        	this.placeUpdated(Geocode.emptyLocation(), v);

        _this.setState({searchText:v}, function(){
        	// TODO - needs reimplemented
	        if(_this.props.saveFreeText)
    	    	_this.placeUpdated(Geocode.emptyLocation(),v);
        });

		if(!v)
			return;


		mapsapi().then( function( maps ) {
			var service = new google.maps.places.AutocompleteService();
			service.getPlacePredictions({input: v, types: _this.state.types}, function (place_array, status) {
				if (status != google.maps.places.PlacesServiceStatus.OK) {
					
				}
				else {
					var predictions = [];
					_this.prediction_ids = []; // Used later get more data from result
					for (var i = 0; i < place_array.length; i++)
					{
						predictions.push(place_array[i].description);
						_this.prediction_ids.push({
							d:place_array[i].description,
							id:place_array[i].place_id
						});
					}
					_this.setState({predictions:predictions});
				}
			});
		});
	},
	place_selected:function(v, index) {
		var _this = this;


		function fail() {
			emitter.emit('info_msg',null);
			_this.placeUpdated(Geocode.emptyLocation(), v);
		}

		
        // 1) Get correct Place ID
		var place_id = null;
		for (var i = 0; i < this.prediction_ids.length; i++)
		{

			if(this.prediction_ids[i].d == v)
			{
				place_id = this.prediction_ids[i].id;
				break;
			}
        }

        // 2) get lat lng from Google api using place id
		if(!place_id)
		{
			if(index != -1) // This is passed by MUI if enter is pressed
				fail();
		}
		else
		{
			Geocode.places({
				placeId:place_id,
				success(place){
					_this.placeUpdated(place, v);
				},
				fail:fail
			});
    	}
    	return false;
	},
	placeUpdated(place, searchText){
		var p = this.props;
		var _s = Object.assign({}, p.state || {});
		var _data = Object.assign({searchText:searchText||""}, _s.data || {}, place);
		_s.data = _data;

		if(this.getErrorMsg() && p.linkedFields) 
  		{
  			// Only validate appropriate fields
  			var fieldVals = {};
			var constraints = {};
			for(var i = 0; i < p.linkedFields.length; i++) {
				var _fieldname = p.linkedFields[i].name;
				fieldVals[_fieldname] = place[_fieldname] + ""; // Forces lat lng to string
				constraints[_fieldname] = _s.constraints[_fieldname];
			}
			var errors = validate(fieldVals, constraints);
	  		_s.error_msgs = errors || {};
  		}

  		if(p.updateLocationQuery)
  		{
  			var new_data = Object.assign({searchText:searchText||""},this.destination, place);
			var subset = (({country,lat,lng,locale,searchText}) => ({country,lat,lng,locale,searchText}))(new_data);
			var parsedUrl = parseUrl(window.location.href);	
			var queryObject = parsedUrl.search ? JSON.parse('{"' + decodeURI(parsedUrl.search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}') : {};
			var q = param(Object.assign({}, queryObject, subset));
			history.replaceState({},"", parsedUrl.protocols[0]+'://'+parsedUrl.resource + parsedUrl.pathname + '?' + q);
  		}

  		this.setSearchText(searchText);
		this.props.updated(_s);
	},
	focus:function(){
		this.refs.autoComplete.focus();
	},
	getErrorMsg(){
		var p = this.props;
		var msg = "";
		if(p.linkedFields && p.state && p.state.error_msgs)
		{
			for(var i = 0; i < p.linkedFields.length; i++) {
				var _field = p.linkedFields[i];
				msg = p.state.error_msgs[_field.name] ? "Problem with " + p.name : "";
				if(msg != "")
					break;
			}
		}
		return msg;
	},
	getSearchText(){
		return this.state.searchText;
	},
	setSearchText(t){
		this.setState({searchText:t});
	},
	userEdited:false,
	isUserEdited(){
		return this.userEdited;
	},
	render:function() {
		var s = this.state;
		var p = this.props;
		var _this = this;

		var mui_props = {
			name: p.name,
			id:p.id,
			floatingLabelText:p.floatingLabelText,
			hintText:p.hintText,
			style:p.style || {},
			fullWidth: p.fullWidth || false,
			hintStyle: p.hintStyle || {},
			listStyle: p.listStyle || {},
			disableFocusRipple: p.disableFocusRipple || false,
			menuStyle: p.menuStyle || {},
			className: p.className,
			textFieldStyle: p.textFieldStyle || {},
		};


		function getErrorMsg() {
			return _this.getErrorMsg();
		}

		return (
			<span>
				{p.leftIcon ? <SearchSVG id={"searchIcon"} className={[styles.search, p.iconClass].join(' ')}/> : null}
				<AutoComplete
					{...mui_props}
					ref="autoComplete"
					filter={AutoComplete.noFilter}
					dataSource={s.predictions}
					onUpdateInput={this.place_changed}
					onNewRequest={this.place_selected}
					searchText={s.searchText}
					errorText={getErrorMsg()}
					onKeyDown={(e)=>{
						if(e.keyCode == 13 && s.predictions.length)
						{
							_this.place_selected(s.predictions[0]);
							_this.setState({searchText:s.predictions[0]});
						}	
					}}
					data-ignored={true}
				/>
				{!p.linkedFields ? null: p.linkedFields.map(function(_field) {
					return <input key={_field.name} id={p.state ? p.state.name+_field.name : null} type="hidden" name={_field.name} value={p.state &&  p.state.data ? p.state.data[_field.name] : ''} />
				})}
			</span>
		);
	}
});

module.exports = StdPlaceSuggest;