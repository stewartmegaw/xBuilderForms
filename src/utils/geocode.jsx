var React = require('react');

var UrlHelpers = {

    //returns clean value with only alpha numeric characters and hyphens
    clean: function(value) {
        var cleanedValue = value.replace(/[\W_]+/g, "-");
        return cleanedValue;
    }

};

module.exports = UrlHelpers;
import 'whatwg-fetch';
// const AppState = require('xbuilder-core/lib/appState');

// var apiKey = AppState.getProp('config.maps_api_key');
if(!serverSide && apiKey)
    var mapsapi = require( 'google-maps-api' )(apiKey, ['places']);


var Geocode = {

    go: function(o) {
            fetch('//maps.googleapis.com/maps/api/geocode/json?latlng=' + o.lat + ',' + o.lng + '&sensor=false', {
                method:'GET',
            }).then(function(response) {
                if(response.ok)
                  return response.json();
                else
                    throw new Error('Geocoding error');
            }).then(function(r) {
                // if(r.results)
                    if(o.success)
                        o.success(r);
            }).catch(function(err) {
                console.log(err);
            });
    },
    places: function(o){
        mapsapi().then( function( maps ) {
            var placesNode = document.getElementById('placesNode');
            if(!placesNode)
            {
                var placesNode = document.createElement('div');
                placesNode.id = 'placesNode';
            }
            var service = new google.maps.places.PlacesService(placesNode);
            service.getDetails({placeId: o.placeId}, function (place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    if(o.success)
                        o.success(Geocode.getAddressComponents(place.address_components, place.geometry.location.lat(), place.geometry.location.lng()));
                }
                else
                {
                    if(o.fail)
                        o.fail();
                }
            });
        });
    },
    getAddressComponents(address_components, lat, lng){
    	var location = Geocode.emptyLocation();

		for(var i =0; i<address_components.length; i++)
    	{
    		switch(address_components[i].types[0])
    		{
    			case 'street_number':
    				location.street_number = address_components[i].long_name;
    				break;
    			case 'street_address':
    				location.street_address = address_components[i].long_name;
    				break;
				case 'route':
    				location.route = address_components[i].long_name;
    				break;
				case 'locality':
				case 'postal_town':
					if(!location.locale)
        				location.locale = address_components[i].long_name;
    				break;
				case 'country':
    				location.country = address_components[i].long_name;
    				break;
				case 'postal_code':
    				location.postalZip = address_components[i].long_name;
    				break;
    		}	
            location.lat = lat;
            location.lng = lng;
    	}

    	if(location.street_number || location.street_address || location.route)
		{
			location.streetAddress = location.street_number || '';
			if(location.streetAddress && location.street_address)
				location.streetAddress += ' ';
		 	location.streetAddress += location.street_address;
		 	if(location.streetAddress && location.route)
		 		location.streetAddress += ' ';
		 	location.streetAddress += location.route;
		}

		if(location.locale && location.locale == location.country)
			location.locale = '';

		return location;
    },
    emptyLocation() {
    	return {
			streetAddress:'',
			street_address : '',
			route:'',
			postalZip : '',
			country: '',
			locale:'',
			route:'',
			lat:'',
			lng:'',
		};
	},

};

module.exports = Geocode;