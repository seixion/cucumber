
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Marionette          = require("backbone.marionette");
    var BaseLayout          = require("app/views/layouts/Base");
    var LoginButtonView     = require("app/views/LoginButton")
    var logoutBoxT          = require("hbars!templates/logoutBox");
    var self;

    return BaseLayout.extend({

        tagName: "div",
        className: "logout",
        template: logoutBoxT,
        regions: {
            loginContainer: ".js-region-login-container"
        },

        modelEvents: {
            sync: "render"
        },

        viewImpls: {
            loginContainer: {
                view: LoginButtonView,
                options: function () {
                    return {
                        model: this.options.facebookUserModel
                    }
                }
            }
        }

    });

});