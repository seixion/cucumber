
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var Backbone            = require("backbone");
    var Associations        = require("backbone.associations");
    var Marionette          = require("backbone.marionette");
    var self;

    return Backbone.AssociatedModel.extend({

        url: "api/userWeight",

        defaults: {
        },

        sync: function (method, model, options) {

            switch (method) {

                case "read":
                    break;

                case "create":
                    if (model.get("date")) {
                        model.set("date", model.get("date").format("YYYY-MM-DD"));
                    }
                    break;

                case "update":
                    break;

                case "delete":
                    break;

            }

            return Backbone.sync.call(this, method, model, options);

        },

    });

})