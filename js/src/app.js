
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Backbone            = require("backbone");
    var Marionette          = require("backbone.marionette");

    return (function () {

        var app = new Marionette.Application();

        app.addRegions({
            "app": "body"
        });

        app.on("initialize:after", function () {
            Backbone.history.start();

        });

        return app;

    }());

});
