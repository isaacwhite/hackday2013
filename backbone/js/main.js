require.config({
	paths: {
		jquery: 'libs/jquery/jquery',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		template: 'templates',
		gmaps: 'libs/gmap/gmaps'
	},
	shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require([
	'app'
], function(App) {
	App.initialize();
	console.log('App initialized.');
});