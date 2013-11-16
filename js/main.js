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
			// console.log(HD2013.foodItemList);
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
