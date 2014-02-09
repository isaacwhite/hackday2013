define([
	'jquery',
	'underscore',
	'backbone',
	'router' //router.js?
], function ($, _, Backbone, Router){
	function initialize() {
		//initialize the router
		console.log(Router);
		Router.initialize();
	}
	return {
		initialize: initialize
	};
});