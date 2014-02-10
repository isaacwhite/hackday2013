define([
	'jquery',
	'underscore',
	'backbone',
	'text!/templates/home/homeTemplate.html',
	'css!/css/welcome/welcome.css'
], function ($, _, Backbone, homeTemplate){
	function addBloomberg() {
		console.log('Finished animating!');
	}
	var HomeView = Backbone.View.extend({
		el: $('#page'),
		render: function() {
			var contentWidth, leftPos, topDistance;
			topDistance = 8 * 16;
			this.$el.html(homeTemplate);
			//html has been added. Calculate.

			contentWidth = $('.main').outerWidth();
			leftPos = $('.main').offset().left;
			$('.head-image').css({
				left:leftPos,
				top: 16,
				height: topDistance - 16,
				width: 'auto'
			}).animate({
				opacity: 1,
			},750);
			$('#page').animate({
				'padding-top': '8rem'
			},750,addBloomberg);
		}
	});
	return HomeView;
});