const React = require('react');

const AppState = require('alpha-client-lib/lib/appState');
var validate = require("validate.js");
import TextField from 'material-ui/TextField';
var StdPlaceSuggest = require('./stdPlaceSuggest');
var Geocode = require('../../lib/geocode');

var apiKey = AppState.getProp('config.maps_api_key');
if(!serverSide && apiKey)
{   
    var mapsapi = require( 'google-maps-api' )(apiKey, ['places']);
}

import {Card, CardText} from 'material-ui/Card';

const StdLocation = React.createClass({
    getInitialState() {
        var p = this.props;
        var _s = p.state;

        return {
            lat: _s.data && _s.data[p.latName || p.name+'Lat'] ? _s.data[p.latName || p.name+'Lat'] : '',
            lng: _s.data && _s.data[p.lngName || p.name+'Lng'] ? _s.data[p.lngName || p.name+'Lng'] : '',
        }
    },
    marker:null,
    googleMap:null,
    setMarker(latLng) {
        if (this.marker) {
            this.marker.setPosition(latLng);
        } else {
            this.marker = new google.maps.Marker({
                position: latLng,
                map: this.googleMap
            });
        }
        this.googleMap.panTo(latLng);
    },
    componentDidMount: function() {
        var p = this.props;
        var _s = p.state;
        var _this = this;

        var plain_map_styles = [
            {"featureType": "administrative.country","elementType": "labels.text", "stylers": [{"visibility": "off"}]},
            {"featureType": "water", "elementType": "labels.text", "stylers": [{"visibility": "off"}]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"}]},
            {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#c3d7ec"}]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{"color": "#efebe2"}]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "landscape", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "administrative.province", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "administrative.neighborhood", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]},
            {"featureType": "road", "stylers": [{"visibility": "off"}]},
            {"featureType": "transit", "stylers": [{"visibility": "off"}]}
        ];

        var country_map_styles = [
            {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "off"}]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{"visibility": "on"}]},
            {"featureType": "administrative"}, {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#c3d7ec"}]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{"color": "#efebe2"}]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "landscape", "elementType": "labels.text.fill", "stylers": [{"color": "#7f6c54"}]},
            {"featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "administrative.province", "elementType": "labels.text", "stylers": [{"visibility": "off"}]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#808080"}]},
            {"featureType": "road", "stylers": [{"visibility": "off"}]},
            {"featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"}]}
        ];

        mapsapi().then( function( maps ) {
            _this.googleMap = new google.maps.Map((_this.refs.map), {
                zoom: 1,
                minZoom: 4,
                center: new google.maps.LatLng(51.5283063, -0.2571552),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: country_map_styles,
                disableDefaultUI: true,
                zoomControl: true
            });

            google.maps.event.addListener(_this.googleMap, 'click', function (event) {
                _this.setMarker(event.latLng);

                _this.setState({lng: event.latLng.lng(), lat: event.latLng.lat()});
                if (!_this.refs.placeSuggest.isUserEdited()) {
                    Geocode.go({
                        lat:event.latLng.lat(),
                        lng:event.latLng.lng(),
                        success(r){
                            if(r.results && r.results.length)
                                _this.refs.placeSuggest.setSearchText(r.results[0].formatted_address);
                            else
                                emitter.emit('info_msg','Could not geocode a textual address');
                        }
                    });
                }

            });

            // Initial marker
            var idleListener = google.maps.event.addListener(_this.googleMap, 'idle', function (event) {
                if(_s.data && _s.data[p.latName || p.name+'Lat'] && _s.data[p.lngName || p.name+'Lng'])
                {
                    var latLng = {lat:Number(_s.data[p.latName || p.name+'Lat']), lng:Number(_s.data[p.lngName || p.name+'Lng'])};
                    _this.setState(latLng);
                    _this.setMarker(latLng);
                }
                google.maps.event.removeListener(idleListener);
            });
        });

        // Initial search text
        if(_s.data && _s.data[p.name])
            this.refs.placeSuggest.setSearchText(_s.data[p.name]);


    },
    render: function() {
        var p = this.props;
        var s = this.state;
        return (
            <div style={{margin:'26px 0'}} id={p.id}>
                <Card>
                    <CardText>
                        <p style={{marginBottom:10}}>{p.label}</p>
                        <div ref="map" style={{'minHeight':'300px','marginBottom':'0'}}></div>
                        <StdPlaceSuggest
                            name={p.name}
                            ref='placeSuggest'
                            floatingLabelText={"Search location"}
                            fullWidth={true}
                            updated={(r)=>{
                                if(r.data && r.data.lat && r.data.lng)
                                {
                                    var latLng = {lat:r.data.lat, lng:r.data.lng};
                                    this.setState(latLng);
                                    this.setMarker(latLng);
                                }
                            }}
                            placeType={'cities'}
                        />
                        <div style={{float:'left',maxWidth:200,marginRight:20}}>
                            <TextField
                                autoComplete={false}
                                name={p.latName || p.name+'Lat'}
                                floatingLabelText={'Latitude'}
                                fullWidth={true}
                                value={s.lat}
                                onChange={(e,v)=>{
                                    this.setState({lat:v});
                                    if(s.lng)
                                        this.setMarker({lat:Number(v),lng:Number(s.lng)});
                                }}                    
                            />
                        </div>
                        <div style={{float:'left',maxWidth:200}}>
                            <TextField
                                autoComplete={false}
                                name={p.lngName || p.name+'Lng'}
                                floatingLabelText={'Longitude'}
                                fullWidth={true}
                                value={s.lng}
                                onChange={(e,v)=>{
                                    this.setState({lng:v});
                                    if(s.lat)
                                        this.setMarker({lat:Number(s.lat),lng:Number(v)});
                                }}
                            />
                        </div>
                        <div style={{clear:'both'}}/>
                    </CardText>
                </Card>
            </div>
        )
    }
});

module.exports = StdLocation;
