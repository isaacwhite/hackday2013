define([
	'jquery',
	'underscore',
	'backbone',
	'views/home/HomeView',
	'views/search/EnterBarcode',
	'views/search/ReviewResults',
	// 'views/main/DisplayMappedResult',
	// 'views/main/FooterView'
], function ($ ,_ , Backbone, HomeView, EnterBarcode, ReviewResults){//, EnterBarcode, ReviewResults, DisplayMappedResult, FooterView){
	var AppRouter, initialize;
	AppRouter = Backbone.Router.extend({
		routes: {
			'barcode-search': 'provideSearch',
			'display-results': 'reviewResults',
			'*actions': 'defaultAction'
		}
	});
	initialize = function() {
		var appRouter = new AppRouter();

		appRouter.on('route:provideSearch', function () {
			var searchView = new EnterBarcode();
			searchView.render();
		});

		appRouter.on('route:reviewResults', function () {
			var resultsView = new ReviewResults();
			resultsView.render();
		});

		appRouter.on('route:defaultAction', function () {
			var homeView = new HomeView();
			homeView.render();
		});

		// var footerView = new FooterView();

		Backbone.history.start();
	};
	return {
		initialize: initialize
	};
});