
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Backbone            = require("backbone");
    var Associations        = require("backbone.associations");
    var Marionette          = require("backbone.marionette");
    var moment              = require("moment");
    var _                   = require("underscore");
    var self;

    return Backbone.AssociatedModel.extend({

        url: "api/weightPlan",

        defaults: {
            weights: []
        },

        velocityInterval: 7,

        initialize: function () {
            self = this;
        },

        _calculateEndDate: function () {

            var weightVelocity, requiredVelocitySteps, requiredMonths, requiredDays;
            var endDate = moment(this.get("startDate"));
            var weightDiff = this.get("startWeight") - this.get("endWeight");

            requiredVelocitySteps = Math.ceil(weightDiff / this.get("weightVelocity"));
            requiredDays = requiredVelocitySteps * this.velocityInterval;
            endDate.add(requiredDays, "days");

            return endDate;

        },

        isWeightPlanPipeDream: function () {

            var weights = this.get("weights");
            var today = moment.utc([moment().year(), moment().month(), moment().date()]);
            var numWeeks = this.get("endDate").diff(this.get("startDate"), "days") / this.velocityInterval;
            var weeks = [];
            var velocity = this.get("weightVelocity");
            var i = 0;

            for (i=0; i<numWeeks; i++) {
                weeks.push(moment(this.get("startDate")).add(this.velocityInterval*i, "days"));
            }

            var nextWeek;
            var nextWeightTarget;
            _.each(weeks, _.bind(function (each, index) {
                if (each.unix() > today.unix()) { // assuming ASC date order
                    nextWeek = each;
                    nextWeightTarget = this.get("startWeight") - ((nextWeek.diff(this.get("startDate"), "days") / this.velocityInterval) * velocity);
                    return false;
                }
            }, this));

            if (weights.length > 1) {
                if (weights[weights.length-1].weight-velocity > nextWeightTarget) {
                    return true;
                }
            }

            return false;

        },

        autoCorrect: function () {

            if (!this.isWeightPlanPipeDream()) {
                console.warn("weightplan is not a pipedream, autocorrect returning.")
                return;
            }

            var lastWeight = this.get("weights")[this.get("weights").length-1];
            var today = moment.utc([moment().year(), moment().month(), moment().date()]);

            // FIXME ah... when to set watchFromDate is not so easy...
            // if you correct multiple times you will lose weight history...
            // I could just pick the earliest date we have any weights... um. long term that may suck though
            //this.set("watchFromDate", moment(this.get("startDate")));
            this.set("watchFromDate", moment(this.get("weights")[0].date));
            this.set("startDate", today);
            this.set("startWeight", lastWeight.weight);
            this._calculateEndDate();

            this.save();
            this.parents[0].trigger("sync"); // FIXME fragile

        },

        parse: function (response, options) {

            this.set("id", _.uniqueId());

            if (response.startWeight) {
                response.startWeight = parseFloat(response.startWeight, 10);
            }
            if (response.endWeight) {
                response.endWeight = parseFloat(response.endWeight, 10);
            }
            if (response.startDate) {
                response.startDate = moment.utc(response.startDate);
            }
            if (response.endDate) {
                response.endDate = moment.utc(response.endDate);
            }
            if (response.watchFromDate) {
                response.watchFromDate = moment.utc(response.watchFromDate);
            }
            if (response.weights) {
                _.each(response.weights, function (each) {
                    each.date = moment.utc(each.date);
                    each.weight = parseFloat(each.weight);
                });
            }

            // calculate velocity if everything is known:
            // (this is just for convenience really)
            if (response.startDate && response.endDate && response.startWeight && response.endWeight) {
                var weightDiff = Math.ceil(Math.abs(response.startWeight - response.endWeight));
                var weeks = response.endDate.diff(response.startDate, "weeks");
                response.weightVelocity = weightDiff / weeks;
            }

            return response;

        },


        sync: function (method, model, options) {

            switch (method) {

                case "read":
                    break;

                // FIXME create and update here are basically identical

                case "create":

                    var data = {};

                    if (!model.get("endDate")) {
                        model.set("endDate", this._calculateEndDate());
                    }

                    if (model.get("startDate")) {
                        data.startDate = model.get("startDate").format("YYYY-MM-DD");
                    }
                    if (model.get("endDate")) {
                        data.endDate = model.get("endDate").format("YYYY-MM-DD");
                    }
                    if (model.get("watchFromDate")) {
                        data.watchFromDate = model.get("watchFromDate").format("YYYY-MM-DD");
                    }

                    data.userId = model.parents[0].get("id") // FIXME brittle

                    options.data = JSON.stringify(_.extend({}, model.toJSON(options), data));
                    options.contentType = "application/json; charset=utf-8";

                    break;

                case "update":
                    
                    var data = {};

                    if (!model.get("endDate")) {
                        model.set("endDate", this._calculateEndDate());
                    }

                    if (model.get("startDate")) {
                        data.startDate = model.get("startDate").format("YYYY-MM-DD");
                    }
                    if (model.get("endDate")) {
                        data.endDate = model.get("endDate").format("YYYY-MM-DD");
                    }
                    if (model.get("watchFromDate")) {
                        data.watchFromDate = model.get("watchFromDate").format("YYYY-MM-DD");
                    }

                    data.userId = model.parents[0].get("id") // FIXME brittle

                    options.data = JSON.stringify(_.extend({}, model.toJSON(options), data));
                    options.contentType = "application/json; charset=utf-8";

                    break;

                case "delete":
                    options.url = this.url + "/id/" + model.get("id");
                    break;

            }

            return Backbone.sync.call(this, method, model, options);

        },


    });

});