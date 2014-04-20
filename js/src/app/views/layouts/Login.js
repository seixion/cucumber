define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                       = require("jquery");
    var Marionette              = require("backbone.marionette");
    var BaseLayout              = require("app/views/layouts/Base");
    var LoginButtonView         = require("app/views/LoginButton");
    var LoginT                  = require("hbars!templates/layouts/login")
    var self;

    return BaseLayout.extend({

        template: LoginT,
        className: "login",
        regions: {
            loginBtnContainer: ".js-login-btn",
        },

        viewImpls: {
            loginBtnContainer: {
                view: LoginButtonView,
                options: function () {
                    return {
                        model: this.model,
                        size: "xlarge",
                    }
                }
            },
        },

    });

});