
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var _                   = require("underscore");
    var Backbone            = require("backbone");
    var self;

    return Backbone.Model.extend({

        appId: "593672820710704",

        initialize: function () {

            this.FB = $.Deferred();

            $("#fb-root").ready( _.bind(function () {

                require(["facebook"], _.bind(function (facebook) {

                    facebook.init({
                        appId: this.appId,
                        status: true,
                        cookie: true,
                        xfbml: true
                    });

                    facebook.Event.subscribe("auth.authResponseChange", _.bind(function (response) {
                        this.onAuthResponseChange(facebook, response).then(_.bind(function (response) {
                            this.set(this.parse(response)); 
                        }, this));
                    }, this));
                    
                    this.FB.resolve(facebook);

                }, this));


            }, this));

        },

        onAuthResponseChange: function (facebook, response) {

            var deferred = $.Deferred();

            if (response.status === "connected") {
                facebook.api("/me", _.bind(function (response) {
                    response.status = "connected";
                    deferred.resolve(response);
                }, this));
            }

            else {
                deferred.resolve();
            }

            return deferred.promise();

        },

        parse: function (response) {
            
            if (response && response.status === "connected") {
                return {
                    name: response.name,
                    id: parseInt(response.id, 10)
                }
            } else {
                // returnig blank object isn't enough to clear model
                this.clear();
                if (this.isNew()){
                    // forces a change:
                    // neeed when an initial fetch arrives here, listeners can interpet a change with empty id
                    // as a prompt to show the login page, without this no change happens, defaults is replaced with defaults
                    // and listens don't have a good way of knowing the status request came back 
                    this.set("resetDefaults", Date.now());
                }
                return {};
            }

        },

        sync: function (method, model, options) {

            var deferred = $.Deferred();

            switch (method) {

                case "read":

                    this.FB.done(_.bind(function (facebook) {
                        facebook.getLoginStatus(_.bind(function (response) {
                            this.onAuthResponseChange(facebook, response).then(function (response) {
                                options.success(response);
                                deferred.resolve();
                            });
                        }, this));
                    }, this));

                    break;

                case "create":
                    break;

                case "update":
                    break;

                case "delete":
                    break;

            }

            return deferred.promise();

        },

    });

})