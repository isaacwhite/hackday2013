var HD2013 = {};
HD2013.foodItemList = [];

HD2013.getJSONObj = function (url, property) {
	var response = $.get(url, function (data) {
		var jsonObj = response.responseJSON;
		var returnVal = jsonObj[property];
		HD2013.sessionID = returnVal;
		var requestVars = ["url","product_name"];
		HD2013.getFoodInfo();
	});
}

HD2013.getFoodInfo = function () {
	var sessionID = HD2013.sessionID;
	var url = "http://api.foodessentials.com/label_summary?u=016000264601&sid=" + 
		HD2013.sessionID + " &appid=NYT_HackDay&f=json&api_key=6u2qj2wz3rxn769s3mcztz2e";
	var response = $.get(url, function (data) {
		var jsonObj = response.responseJSON;
		var foodName = jsonObj.product_name;
		var productUrl = jsonObj.url;

		var html = $.get(productUrl, function (data) {
			//data is the html response
			HD2013.testData = data;
			var calories = $(data).find("#label_sorting_title .center_text .right_text.tx_3")[0];
			var calorieCount = parseInt($(calories).contents()[0]['data']);
			HD2013.foodItemList.push( new HD2013.FoodItem(foodName,calorieCount,productUrl) );
		})
	});
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

HD2013.getJSONObj("http://api.foodessentials.com/createsession?uid=001&devid=001&appid=NYT_HackDay&f=json&api_key=6u2qj2wz3rxn769s3mcztz2e","session_id");

HD2013.getEvents = function (distanceInMeters,startLat,startLng,start,end) {
	var apiKey = "1f26f178792c1bc75bd269b3af192b86:7:56579220"
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

var map;
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
      var lat_init=position.coords.latitude;
      var lon_init= position.coords.longitude;
      var initial_loc = new google.maps.LatLng(lat_init, lon_init);


      add_event_marker("Your current location",lat_init, lon_init);

      map.setCenter(initial_loc);
      geocode_addr("The New Yorker", "4 Times Square", "New York, NY", lat_init, lon_init);
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
  if (errorFlag) {
   // var content = 'Error: The Geolocation service failed.';
  } else {
   // var content = 'Error: Your browser doesn\'t support geolocation.';
  }
   var lat_init=40.69847032728747;
   var lon_init=73.9514422416687;
   var options = {
     map: map,
     position: new google.maps.LatLng(lat_init, lon_init)
   };
     add_event_marker("Your current location",lat_init, lon_init);
  // var infowindow = new google.maps.InfoWindow(options);
  initial_loc=options.position;
  map.setCenter(initial_loc);
  geocode_addr("The New Yorker", "4 Times Square", "New York, NY", lat_init, lon_init);


}

function geocode_addr(event_title,street_addr, city_state, lat_init, lon_init){
 var geocode_obj= $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?address="+street_addr+","+city_state+"&sensor=true", function(data){
    //var geocode_obj=data;
   //  var lat=data. 
    console.log(data);
    var lat=data.results[0].geometry.location.lat;
    var lon=data.results[0].geometry.location.lng;
    console.log(lat);
    console.log(lon);
    add_event_marker(event_title,lat, lon);
    add_directions_duration(lat,lon, lat_init, lon_init);
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
  function add_directions_duration(lat, lon, lat_init, lon_init) {
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
       // $(".duration").append(response.routes[0].legs[0].duration.text);
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
			var searchString = search;
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

			if (search === "") {
				$("#search-box").val("Please enter something to search");
			} else if (searchString === "Please enter something to search") {
				//do nothing
			} else {
				try {
					//perform a search.
					
				} catch(err) {
					console.warn(err);
					$('.search-contain img').remove();
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
