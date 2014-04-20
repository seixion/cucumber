
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Marionette          = require("backbone.marionette");
    var footerT              = require("hbars!templates/footer");
    var self;

    return Backbone.Marionette.ItemView.extend({

        tagName: "div",
        className: "footer-content",
        template: footerT,

    });

});