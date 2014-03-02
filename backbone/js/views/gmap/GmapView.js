define([
	'jquery',
	'underscore',
	'backbone',
	'gmaps',
	'text!/templates/gmap/gmapTemplate.html'
], function ($, _, Backbone, gmapTemplate){
	var GmapView = Backbone.View.extend({
		// el: $('#page'),
		// render: function() {
		// 	$('.menu li').removeClass('active');
		// 	$('.menu li a[href="#"]').parent().addClass('active');
		// 	this.$el.html(searchTemplate);
		// }
	});
	return GmapView;
});