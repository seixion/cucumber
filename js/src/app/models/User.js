
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var Backbone            = require("backbone");
    var Associations        = require("backbone.associations");
    var Marionette          = require("backbone.marionette");
    var WeightPlanModel     = require("app/models/WeightPlan");
    var UserWeightModel     = require("app/models/UserWeight");
    var self;

    return Backbone.AssociatedModel.extend({

        url: "api/user",

        relations:[
            {
                key: "weightPlan",
                type: Backbone.One,
                relatedModel: WeightPlanModel,
            }
        ],

        defaults: {
            weightPlan: null
        },

        fetch: function () {
            return Backbone.Model.prototype.fetch.call(this, {
                data: {
                    externalId: this.get("externalId")
                }
            });
        },

        parse: function (response, options) {

            if (response.currentWeight) {
                response.currentWeight = parseFloat(response.currentWeight, 10);
            }
            return response;

        },
        addUserWeight: function (weight, date) {
            var userWeight = new UserWeightModel({
                userId: this.id,
                weight: weight,
                date: date
            });
            var xhr = userWeight.save();
            xhr.then(_.bind(function () {
                this.fetch()
            }, this));
            return xhr;
        },

    });

})