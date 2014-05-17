
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var Marionette          = require("backbone.marionette");
    var WeightPlanView      = require("app/views/WeightPlan");
    var weightUnitUtils     = require("lib/weightUnitUtils");
    var weighInT            = require("hbars!templates/weighIn");
    var moment              = require("moment");
    var self;

    return Backbone.Marionette.ItemView.extend({

        tagName: "div",
        className: "weigh-in-container",
        template: weighInT,

        ui: {
            "toggleWeignIn": ".toggleWeighIn",
            "weighIn": ".weigh-in",
            "header": ".weigh-in-header",
            "weighInSt": "#weighInSt",
            "weighInStRm": "#weighInStRm",
            "weighInDec": "#weighInDec"
        },

        events: {
            "click button": "submitWeight",
            "click @ui.toggleWeignIn": function (e) {
                e.preventDefault();
                if (this.$(e.target).parents(".weight-plan-header.locked").length) {
                    return;
                }
                this.ui.weighIn.toggleClass("open");
                this.$(e.target).toggleClass("open");
            }
        },

        modelEvents: {
            "change": function () {
                if (this.canWeighIn()) {
                    this.ui.header.removeClass("locked");
                } else {
                    this.ui.header.addClass("locked");
                    this.ui.weighIn.removeClass("open");
                }
            }
        },

        initialize: function () {
        },

        submitWeight: function () {
            var today = moment.utc([moment().year(), moment().month(), moment().date()]);
            var weightSt = parseFloat(this.ui.weighInSt.val(), 10);
            var weightStRm = parseFloat(this.ui.weighInStRm.val(), 10) || 0;
            var weightDec = parseFloat(this.ui.weighInDec.val(), 10);
            var newWeight = weightUnitUtils.getLbsFromSt(weightSt, weightStRm, weightDec);
            this.model.addUserWeight(newWeight, today).fail(function () {
                // TODO deal with failure if possible
            });
            this.ui.weighIn.removeClass("open");
        },

        // FIXME is this working properly?
        // could I refactor with some underscore chaining and make it simpler?
        canWeighIn: function () {
            // check weights to see if we have one for today
            var check = true;
            var today = moment.utc([moment().year(), moment().month(), moment().date()]);
            _.each(this.model.get("weightPlan.weights"), _.bind(function (weight) {
                if (weight.date.diff(today, "days") === 0) {
                    check = false;
                    return false; // break
                }
            }, this));
            return check;
        },

        onDomRefresh: function () {
            this.$("button").button();

            if (!this.startDate || !this.endDate || !this.startWeight || !this.endWeight || !this.canWeighIn()) {
                this.ui.header.addClass("locked");
                this.ui.weighIn.removeClass("open");
            }
        },

        serializeData: function () {
            return {
                weighInSt: 0,
                weighInStRmValues: WeightPlanView.prototype.generateSelectOptions.call(this, 0, 13, 1, 0),
                weighInFractionValues: _.clone(weightUnitUtils.poundEighths)
            }
        }

    });

});