
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var _                   = require("underscore");
    var Backbone            = require("backbone");
    var self;

    return Backbone.Model.extend({

        defaults: {
        },

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

                        if (response.status === "connected") {
                            facebook.api("/me", _.bind(function (response) {
                                response.status = "connected";
                                this.set(this.parse(response));
                                this.trigger("sync");
                            }, this));
                        }

                        else {
                            this.set(this.parse(response));
                            this.trigger("sync");
                        }

                    }, this));

                    this.FB.resolve(facebook);

                }, this));


            }, this));

        },

        parse: function (response) {
            
            if (response.status === "connected") {
                return {
                    name: response.name,
                    id: parseInt(response.id, 10)
                }
            } else {
                // returnig blank object isn't enough to clear model
                this.clear().set(this.defaults);
                return {};
            }

        },

        sync: function (method, model, options) {

            var syncDeferred = $.Deferred();

            switch (method) {

                case "read":

                    this.FB.done(function (facebook) {
                        facebook.getLoginStatus( function (response) {

                            if (response.status === "connected") {
                                facebook.api("/me", function (response) {
                                    response.status = "connected";
                                    options.success(response);
                                    syncDeferred.resolve();
                                });
                            }

                            else {
                                options.success(response);
                                syncDeferred.resolve();
                            }

                        });
                    });

                    break;

                case "create":
                    break;

                case "update":
                    break;

                case "delete":
                    break;

            }

            return syncDeferred.promise();

        },

    });

})