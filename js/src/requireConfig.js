
/* ===================================================================
    bootstrap require js and run the app
    http://requirejs.org/docs/api.html
   =================================================================== */

// FIXME work out how to use conflict on underscore, backbone and marionette
// and moment

requirejs.config({

    paths: {
        "templates": "../../templates",
        "config": "../../config",
        "jquery": "vendor/jquery/jquery-1.11.0",
        "text": "vendor/requirejs.text",
        "underscore": "vendor/lodash",
        "backbone": "vendor/backbone",
        "backbone.marionette": "vendor/backbone.marionette",
        "backbone.associations": "vendor/backbone-associations",
        "Handlebars": "vendor/handlebars/handlebars-v1.3.0",
        "hbars": "vendor/hbars",
        "jqueryUI": "vendor/jquery-ui-1.10.4.custom",
        "moment": "vendor/moment-with-langs",
        "facebook": "//connect.facebook.net/en_US/all",
    },
    shim: {
        "vendor/jquery/plugins/jquery.easing.1.3": {
            deps: ["jquery"],
            exports: "jQuery.easing"
        },
        "vendor/jquery/plugins/jquery.imagesloaded": {
            deps: ["jquery"],
            exports: "jQuery.fn.imagesLoaded"
        },
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["jquery", "underscore"],
            exports: "Backbone"
        },
        "backbone.marionette": {
            deps:["backbone"],
            exports: "Backbone.Marionette"
        },
        "backbone.associations": {
            deps: ["backbone"],
            exports: "Backbone.Associations"
        },
        "Handlebars": {
            exports: "Handlebars"
        },
        "vendor/highcharts":{
            exports: "q",
            deps: ["jquery"]
        },
        "vendor/highstock": {
            exports: "Highcharts"
        },
        "jqueryUI": {
            deps: ["jquery"],
            exports: "jQuery"
        },
        "facebook": {
            exports: "FB"
        }
    },
    "hbars": {
        extension: ".hbs",
        compileOptions: {}
    }

});

define([
        "jquery",
        "Main"
        ], function($, Main) {

    $.noConflict(false);
    new Main();
});

