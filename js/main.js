/*    Neighborhood Map
Insert a search term and it will return a list of search items
puts them on the map and on the side menu.
  */

//set whole script to be strict
'use strict';

//sets cache for true so Timestamp parameter isn't added to ajax query.
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
    if ( options.dataType == 'jsonp' || originalOptions.dataType == 'jsonp' ) {
        options.cache = true;
    }
});



var ViewModel = function() {
    var self = this;
    this.listings = ko.observableArray([]);
     self.searchWord = ko.observable("");
    var geocoder;
    var latlng;
    var address = "Atlanta, Georgia";
    var terms = "diners";

//init globals
var map;
var markers = [];

//make Markers functions - clear, show, add, make

 var clearMarkers = function() {
    setAllMap( null );
    markers = [];
};

var showMarkers = function() {
    setAllMap( map );
};
var setAllMap = function( map ) {
    var len = markers.length;
    for (var i = 0; i < len; i++){
        markers[i].setMap( map );
    }
};
var addMarker = function( marker ) {
    markers.push( marker );
};
var makeMarker = function( coords, info ) {
    var myLatLng = new google.maps.LatLng( coords.latitude, coords.longitude );
    var infowindow = new google.maps.InfoWindow({
        content: info
    });
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        animation: google.maps.Animation.DROP
     //   console.log("Inside of marker");
    });
    

    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map, marker);
    }); 
    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(map, marker);
    });
    return marker;
};
var bounce = function( marker ) {
    marker.setAnimation( google.maps.Animation.BOUNCE );
};
var stopBounce = function( marker ) {
    marker.setAnimation( null );
};


//Listing model
var Listing = function( data ) {
    this.display_phone = ko.observable( data.display_phone );
    this.image_url = ko.observable( data.image_url );
    this.location = ko.observable( data.location.address[0] );
    this.name = ko.observable( data.name );
    this.rating = ko.observable( data.rating );
    this.rating_url = ko.observable( data.rating_img_url );
    this.url = ko.observable( data.url );
    this.snippet_text = ko.observable( data.snippet_text );
    this.review_count = ko.observable( data.review_count );
    this.marker = makeMarker( data.location.coordinate, data.name + "<br>" + data.location.address[0] );
    addMarker( this.marker );
    //animates marker when mouseover Div
    this.show = function() {
        bounce(this.marker);
    };
    this.hide = function() {
        stopBounce(this.marker);
    };
};

    
    self.searchWordSearch = ko.computed( function() {
        return self.searchWord().toLowerCase().split(' ');
    });
    
    self.searchSubmit = function() {
        self.searchWordSearch().forEach(function(word) {
            this.listings().forEach(function(listing) {
                var name = listing.name.toLowerCase();
                (name.indexOf(word) === -1) ? marker.setMap(null) : marker.setMap(self.map);
                (name.indexOf(word) === -1) ? marker.listVisible(false) : marker.listVisible(true);
            });
        });
    };



    //loads map
    var initialize = function() {
        var lat = 33.7550;
        var lng = -84.3900;
       
        latlng = new google.maps.LatLng( lat, lng );//sets to Atlanta, Georgia by default
        var mapOptions = {
          zoom: 12,
          center: latlng
        };
        yelp(terms,address);
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    };
   
    google.maps.event.addDomListener(window, 'load', initialize);
    //search handler function
       

    //moves map to location
/*    var moveMap = function(address) {
        geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
          } else {
              alert('Geocode was not successful for the following reason: ' + status);
          }
        });
    };   */

    //queries yelp api with term and location, returns jsonp with results
    var yelp = function(terms, location){
        var auth = {
            consumerKey : "Mn1Aj3R5cQKlwZveqnu8CQ",
            consumerSecret : "DJWBTfFhvkUeznJE_q3RkLrLJnQ",
            accessToken : "YLBx5vt_-2kf_2WXz6wiqM8qbL6I8R0C",
            accessTokenSecret : "brBVqrs758RW5TDlRrs-7KlOZDQ",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };
        var accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };
        var parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', location]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        var message = {
            'action' : 'http://api.yelp.com/v2/search',
            'method' : 'GET',
            'parameters' : parameters
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var parameterMap = OAuth.getParameterMap(message.parameters);
        $.ajax({
            'url' : message.action,
            'data' : parameterMap,
            'dataType' : 'jsonp',
            'cached' : true,
            'jsonpCallback' : 'cb',
            //empties listings array, then pushes in new results
            'success' : function(data, textStats, XMLHttpRequest) {
            //    clearMarkers();
            //    self.listings.removeAll();
                console.log(data);
                var len = data.businesses.length;
                for (var i = 0; i < len; i++){
                    self.listings.push(new Listing(data.businesses[i]));
                }
                console.log(self.listings());
                showMarkers();
            }
        }).fail(function(e) {
            alert('something went wrong: ');
            alert(e.error());
        });
    };


        
        
     //   moveMap(address);
     //   yelp(terms,address);



         
};

ko.applyBindings(new ViewModel());
