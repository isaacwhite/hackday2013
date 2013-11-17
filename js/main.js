var HD2013 = {};
HD2013.foodItemList = [];
HD2013.loading = 0;

HD2013.getFoodInfo = function (upc) {
	function getDetails(upc) {
		var sessionID = HD2013.sessionID;
		console.log(sessionID);
		http://api.foodessentials.com/label_summary?u=016000264601&sid=9e1f8265-e867-47d9-ab83-e26adf672ee4&appid=demoApp_01&f=json&api_key=6u2qj2wz3rxn769s3mcztz2e
		var url = "http://api.foodessentials.com/label_summary?u=" + upc + "&sid=" + sessionID + "&appid=NYT_HackDay&f=json&api_key=6u2qj2wz3rxn769s3mcztz2e";
		var response = $.get(url, function (data) {
			// console.log(url);
			console.log(url);
			console.log(data);
			var jsonObj = response.responseJSON;
			var foodName = jsonObj.product_name;
			var productUrl = jsonObj.url;
			var html = $.get(productUrl, function (data) {
			//data is the html response
				console.log("requesting http data");
				HD2013.testData = data;
				var calories = $(data).find("#label_sorting_title .center_text .right_text.tx_3")[0];
				var calorieCount = $(calories).contents()[0]['data'];
				if (calorieCount === "n/a") {
					calorieCount = 0;
				} else {
					calorieCount = parseInt(calorieCount);
				}
				HD2013.foodItemList.push( new HD2013.FoodItem(foodName,calorieCount,productUrl) );
			})
		});
	}
	var apiKey = "6u2qj2wz3rxn769s3mcztz2e";
	var url = "http://api.foodessentials.com/createsession?uid=001&devid=001&appid=NYT_HackDay&f=json&api_key=" + apiKey;
	if(!HD2013.sessionID) {
		var response = $.get(url, function (data) {
			var jsonObj = response.responseJSON;
			var returnVal = jsonObj.session_id;
			// console.log(returnVal);
			HD2013.sessionID = returnVal;
			getDetails(upc);
		});
	} else {
		getDetails(upc);
	}
}

HD2013.FoodItem = function (name,calories,url) {
	this.name = name;
	this.calories = calories;
	this.url = url;
}

HD2013.Event = function (name,url,lat,lng,tel,desc) {
	this.name = name;
	this.url = url;
	this.lat = lat;
	this.lng = lng;
	this.tel = tel;
	this.desc = desc;
}

HD2013.calculateDistance = function (calories,type) {
	var distance;
	if (type === "walk") {
		distance = calories / (.57 * 160);
	} else {
		distance = calories / (.72 * 160);
	}
	return distance * 1609.34; //now it's in meters :)
}

HD2013.getEvents = function (distanceInMeters,startLat,startLng,start,end) {
	var apiKey = "1f26f178792c1bc75bd269b3af192b86:7:56579220";
	var dateRange;
	var url = "http://api.nytimes.com/svc/events/v2/listings.json?";
	if (start && end) {
		dateRange = "&date_range" + start + "%3A" + end;
		url += dateRange;
	}
	url += "&ll=" + startLat + "%2C" + startLng + "&radius=" + distanceInMeters + "&api-key=" + apiKey;

	var currentEvents = [];
	var response = $.get(url, function (data) {
		var jsonObj = response.responseJSON;
		var results = jsonObj.results;
		for (var i = 0; i< results.length; i++) {
			var thisResult = results[i];

			var name = thisResult.event_name;
			var url = thisResult.event_detail_url;
			var lat = thisResult.geocode_latitude;
			var lng = thisResult.geocode_longitude;
			var tel = thisResult.telephone;
			var desc = thisResult.web_description;

			var eventObj = new HD2013.Event(name,url,lat,lng,tel,desc);
			currentEvents.push(eventObj);
		}
		HD2013.currentEvents = currentEvents;
	});
}

HD2013.getEvents(1700,40.756146,-73.99021);
var lat_init;
var lon_init;
var map;
HD2013.markerList = [];
directionsDisplay = new google.maps.DirectionsRenderer();

function initialize() {
  var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      lat_init=position.coords.latitude;
      lon_init= position.coords.longitude;
      var initial_loc = new google.maps.LatLng(lat_init, lon_init);
      var marker = new google.maps.Marker({
       position: new google.maps.LatLng(lat_init, lon_init),
       map: map
      });
      HD2013.markerList.push(marker);
      add_event_marker("Your current location",lat_init, lon_init);
      map.setCenter(initial_loc);
      geocode_addr("4 Times Square New York, NY", lat_init, lon_init);
      geocode_addr("10 Columbus Circle New York, NY", lat_init, lon_init);

      console.log(initial_loc);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}
//console.log(initial_loc);
function handleNoGeolocation(errorFlag) {
   var lat_init=40.69847032728747;
   var lon_init=73.9514422416687;
   var options = {
     map: map,
     position: new google.maps.LatLng(lat_init, lon_init)
   };
     add_event_marker(lat_init, lon_init);
  // var infowindow = new google.maps.InfoWindow(options);
  initial_loc=options.position;
  map.setCenter(initial_loc);

  geocode_addr("4 Times Square New York, NY", lat_init, lon_init);
  geocode_addr("10 Columbus Circle New York, NY", lat_init, lon_init);



}
// geocodes the address and adds markers and directions of the locations
function geocode_addr(event_addr){
 var geocode_obj= $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?address="+event_addr+"&sensor=true", function(data){
    //var geocode_obj=data;
   //  var lat=data. 
    console.log(data);
    var lat=data.results[0].geometry.location.lat;
    var lon=data.results[0].geometry.location.lng;
    console.log(lat);
    console.log(lon);
    add_event_marker(lat, lon);
    add_directions(lat,lon, lat_init, lon_init);
    //  return data;
  });
}


function add_event_marker(lat, lon){

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    map: map
});
   google.maps.event.addListener(marker, 'click', function() {
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(map);
    var directionsService = new google.maps.DirectionsService();
    var request = {
        origin: new google.maps.LatLng(lat_init, lon_init),
        destination: new google.maps.LatLng(lat, lon),
        travelMode: google.maps.TravelMode.WALKING,
       unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {

        directionsDisplay.setDirections(response);

      }
    });
   });

  marker.setMap(map);
}
  // add estimated time it takes to get to neighborhood, using Gmaps transit locations
  // appends to .duration class selector div

  function add_directions(lat, lon) {
   // directionsDisplay = new google.maps.DirectionsRenderer();
   // directionsDisplay.setMap(map);
    var directionsService = new google.maps.DirectionsService();
    var destinationMarker= new google.maps.LatLng(lat, lon);
    var request = {
        origin: new google.maps.LatLng(lat_init, lon_init),
        destination: new google.maps.LatLng(lat,lon),
        travelMode: google.maps.TravelMode.WALKING,
       unitSystem: google.maps.UnitSystem.IMPERIAL
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);

        var distance = response.routes[0].legs[0].distance.text;
        console.log(distance);
      //  directionsDisplay.setDirections(response);
      }
    });
  }

google.maps.event.addDomListener(window, 'load', initialize);

$(function() {

	$("#search-box").val("Your location");
	$("#bar-code").val("UPC code");
	$("#bar-code").click(function() {
		if ($(this).val() === "UPC code") { 
			$(this).val(""); 
		} 
	});
	$("#search-box").click(function() {
		if ($(this).val() === "Your location") { 
			$(this).val(""); 
		} 
	});

	$("#submit-button").click( function (e) {
		if (HD2013.loading === 0) {
			var search = $("#search-box").val();
			var upc = $("#bar-code").val();
			var addressString = search;
			var moreOptions = $('.more-options');
			if (moreOptions.hasClass("active")) {
				var startDate = $('#start-date');
				var endDate = $('#end-date');
				var addQuery = "";
				
				if(!(endDate.hasClass('empty'))) {
					var parsedEnd = "" + endDate.val().substr(6);
					parsedEnd += "-" + endDate.val().substr(0,5).replace("/","-");
					addQuery += " until:" + parsedEnd;
					// options.until = parsedEnd;
				}
				if(!(startDate.hasClass('empty'))) {
					var parsedStart = "" + startDate.val().substr(6);
					parsedStart += "-" + startDate.val().substr(0,5).replace("/","-");
					addQuery += " since:" + parsedStart;
					// options.since = parsedStart;
				}

				search += addQuery;

			};//no else
			
			// options.q = search;
			// options.count = 50;

			// console.log(options);

			if (upc === "") {
				alert("Please enter a UPC code.");
			} else if (upc === "UPC code") {
				//do nothing
			} else {
				try {
					//perform a search.
					console.log(upc);
					HD2013.getFoodInfo(upc);
				} catch(err) {
					console.warn(err);
					$('.results-area').html(HD2013.errorText).append("<p>" + err.toString() + "</p>");

				}
			};
			
		} else {
			// console.log("extra click, still loading");
			
		}
		
		e.preventDefault();
	});

	$(".more-options h5.want-more").click(function() {
			var moreOptions = $(".more-options");
		if (!(moreOptions.hasClass("active")) ) {
				var datePickOptions = {
					onSelect: function() {
					$(this).removeClass("empty");
					}
				};
				moreOptions.addClass("active");
				$(this).text("Hide these options");

				$("#start-date").datepicker(datePickOptions).addClass("empty").val("Start date");
				$("#end-date").datepicker(datePickOptions).addClass("empty").val("End date");
			} else {
				moreOptions.removeClass("active");
				$(this).text("Want to use a different date range?");
				$("#start-date").addClass("empty").val("");
				$("#end-date").addClass("empty").val("");
			};
		});
});
