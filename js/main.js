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
	var url = "http://api.foodessentials.com/label_summary?u=016000264601&sid=" + HD2013.sessionID + " &appid=NYT_HackDay&f=json&api_key=6u2qj2wz3rxn769s3mcztz2e";
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

$(function() {
	$("#submit-button").click(function(e) {
		if (HD2013.loading === 0) {
			var search = $("#search-box").val();
			var searchString = search;
			var moreOptions = $('.more-options');
			if (moreOptions.hasClass("active")) {
				var startDate = $('#start-date');
				var endDate = $('#end-date');
				var location = $('#location');
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
				if(!(location.hasClass('empty'))) {
					var geocodeQuery = location.val();
					if(geocodeQuery === "") {
						geocodeQuery = undefined;
					}
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
				if (HD2013.firstSearch === 0 ) {
					$('.tweet').remove();
				};
				try {
					HD2013.getResults(client, options,geocodeQuery);
					HD2013.searches.push(search);
					
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
				$("#location").addClass("empty").val("Search for a location").click(function() {
					$(this).val("").removeClass("empty");
				});
			} else {
				moreOptions.removeClass("active");
				$(this).text("Want to use a different date range?");
				$("#start-date").addClass("empty").val("");
				$("#end-date").addClass("empty").val("");
				$("#location").addClass("empty").val("");
			};
		});
});
