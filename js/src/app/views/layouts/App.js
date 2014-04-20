define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $           = require("jquery");
    var Marionette  = require("backbone.marionette");
    var appT        = require("hbars!templates/layouts/app");
    var app         = require("app");
    var self;

    require("jqueryUI");

    return Marionette.Layout.extend({
        template: appT,
        className: "app",
        regions: {
            heaer: ".js-region-header",
            main: ".js-region-main",
            footer: ".js-region-footer"
        }
    });

});