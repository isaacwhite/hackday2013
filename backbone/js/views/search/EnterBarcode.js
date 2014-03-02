define([
	'jquery',
	'underscore',
	'backbone',
	'text!/templates/partials/header.html',
	'text!/templates/search/barcodeTemplate.html',
	'css!/css/search/barcode.css'
], function ($, _, Backbone, header, searchTemplate){
	var HomeView = Backbone.View.extend({
		el: $('#page'),
		render: function() {
			var totalHtml;
			totalHtml = header + searchTemplate;
			this.$el.css({
				'padding-top':0
			}).html(totalHtml);
		}
	});
	return HomeView;
});