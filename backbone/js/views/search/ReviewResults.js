define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/search/resultsTemplate.html'
], function ($, _, Backbone, searchTemplate){
	var HomeView = Backbone.View.extend({
		el: $('#page'),
		render: function() {
			$('.menu li').removeClass('active');
			$('.menu li a[href="#"]').parent().addClass('active');
			this.$el.html(searchTemplate);
		}
	});
	return HomeView;
});