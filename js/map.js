var map;
var initial_loc;
function initialize() {
  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat=position.coords.latitude;
      var lon= position.coords.longitude;
      var pos = new google.maps.LatLng(lat, lon);


      add_event_marker("Your current location",lat, lon);
      // var infowindow = new google.maps.InfoWindow({
      //   map: map,
      //   position: pos,
      //   content: 'Location found using HTML5.'
      // });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
   // var content = 'Error: The Geolocation service failed.';
  } else {
   // var content = 'Error: Your browser doesn\'t support geolocation.';
  }

   var options = {
     map: map,
     position: new google.maps.LatLng(40.69847032728747, -73.9514422416687),

     //content: content
   };
     add_event_marker("Your current location",40.69847032728747, -73.9514422416687);
  // var infowindow = new google.maps.InfoWindow(options);
  initial_loc=options.position;
  map.setCenter(initial_loc);

}

geocode_addr("The New Yorker", "4 Times Square", "New York, NY");
function geocode_addr(event_title,street_addr, city_state){


 var geocode_obj= $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?address="+street_addr+","+city_state+"&sensor=true", function(data){
    //var geocode_obj=data;
   //  var lat=data. 
    console.log(data);
    var lat=data.results[0].geometry.location.lat;
    var lon=data.results[0].geometry.location.lng;
    console.log(lat);
    console.log(lon);
    add_event_marker(event_title,lat, lon);
    add_directions_duration(lat,lon);
    //  return data;
  });
}


function add_event_marker(event_title, lat, lon){

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    map: map,
    title: event_title
});

  marker.setMap(map);
}
  // add estimated time it takes to get to neighborhood, using Gmaps transit locations
  // appends to .duration class selector div
  function add_directions_duration(lat, lon) {
    var directionsService = new google.maps.DirectionsService();
    var destinationMarker= new google.maps.LatLng(lat, lon);
    var request = {
        origin: initial_loc,
        destination: new google.maps.LatLng(lat,lon),
        travelMode: google.maps.TravelMode.WALKING,
       unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);
        var distance = response.routes[0].legs[0].distance.text;
        console.log(distance);
       // $(".duration").append(response.routes[0].legs[0].duration.text);
      }
    });
  }
  

google.maps.event.addDomListener(window, 'load', initialize);
