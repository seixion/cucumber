
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Marionette          = require("backbone.marionette");
    var loginT              = require("hbars!templates/loginButton");
    var self;

    return Backbone.Marionette.ItemView.extend({

        tagName: "div",
        className: "login-button",
        template: loginT,

        onDomRefresh: function () {

            // re-parse for the facebook button:
            this.model.FB.done(function (facebook) {
                facebook.XFBML.parse();
            });

        },

        serializeData: function () {
            return {
                size: this.options.size || "large"
            }
        }

    });

});