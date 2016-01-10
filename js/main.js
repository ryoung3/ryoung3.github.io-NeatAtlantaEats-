
'use strict';

//Creates Google map
       
   // var ATLlatlng = new google.maps.LatLng(33.7550,  -84.3900); //Starting Point is Atlanta, GA
 var map;  
    
function initialize() {
    var mapOptions = {
            zoom: 12,
            center: {lat: 33.7550, lng: -84.3900},
            disableDefaultUI: true
            };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      
      
}



//---View Model---
function MyViewModel() {
    var self = this;
    
    //Calls the Yelp API.
    self.yelpCall = function(searchNear, searchFor) {
    // For use for this class only.
    // You wouldn't actually want to expose your secrets like this in a real application.
        var auth = {
            consumerKey : "BzpesVW-QhQWzYm6iA8SOQ",
            consumerSecret : "5DIG4daEZKngvI6Zrc2wShZeWno",
            accessToken : "Jq7b8HJlTeQOyF5yM6KZOnqG6Jwun_uH",
            accessTokenSecret : "GlcGihVv1GGO9nSJUQEzbWQcefc",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };
    
        //Creates a variable for the OAuth.SignatureMethod
        var accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };
    
        var parameters = [];
        parameters.push(['term', searchFor]);
        parameters.push(['location', searchNear]);
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
                'cache' : true,
                'data' : parameterMap,
                'dataType' : 'jsonp',
                'global' : true,
                'jsonpCallback' : 'cb',
                'success' : function(data){
                    self.makeYelpList(data);
                },
                'timeout': 5000,
                'error' : function (data, t) {
                    if(t==='timeout'){
                        alert("An error has occured!");
                    }
                    else{

                    }   
                }
            });
        
        
        
    };
    
    
    

   
    //self.initialize();  
    //End Map Creation
    
    self.markers = ko.observableArray([]);  
    
    //Yelp List and Marker Generation
    self.makeYelpList = function(data) {
        $.each(data.businesses, function(key, business) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(business.location.coordinate.latitude, business.location.coordinate.longitude),
                map: map,
                listVisible: ko.observable(true),
                animation: google.maps.Animation.DROP,
                name: business.name,
                address: business.location.address,
                image: business.image_url,
                stars: business.rating_img_url,
                phone: business.display_phone,
                numRev: business.review_count + ' Reviews'
            });
                        
            var contentString = '<div class="info_content"><h4>' + business.name + '</h4><p class="review"><img src="' + business.snippet_image_url + '">' + business.snippet_text + '</p></div>';
            self.infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function() {
                map.panTo(marker.getPosition());
                self.infowindow.setContent(contentString);
                self.infowindow.open(map, this);
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
                setTimeout(function(){ marker.setAnimation(null); }, 1500);
                    
            });

            self.markers.push(marker);
        });
        
        google.maps.event.addListener(self.infowindow,'closeclick', function() {
            self.reset();
        });
        self.setActiveLocation = function(marker) {
            google.maps.event.trigger(marker, 'click');
        };
    };
    
    self.reset = function() {
        map.panTo(self.ATLlatlng);
        map.setZoom(12);
    };
    
    //Calls the Yelp function to init map
    self.yelpCall('Atlanta,Georgia', 'hamburgers');
    
    self.searchWord = ko.observable("");
    self.searchWordSearch = ko.computed( function() {
        return self.searchWord().toLowerCase().split(' ');
    });
    
    self.searchSubmit = function() {
        self.searchWordSearch().forEach(function(word) {
            self.markers().forEach(function(marker) {
                var name = marker.name.toLowerCase();
                (name.indexOf(word) === -1) ? marker.setMap(null) : marker.setMap(map);
                (name.indexOf(word) === -1) ? marker.listVisible(false) : marker.listVisible(true);
            });
        });
    };

 
}

 

function initMap(){
    initialize();
    ko.applyBindings(new MyViewModel());
}


//Calls Knockout
