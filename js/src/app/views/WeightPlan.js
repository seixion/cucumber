define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $               = require("jquery");
    var app             = require("app");
    var marionette      = require("backbone.marionette");
    var weightPlanT     = require("hbars!templates/weightPlan");
    var moment          = require("moment");
    var weightUnitUtils = require("lib/weightUnitUtils");
    var WeightPlanModel = require("app/models/WeightPlan")
    var self;

    require("jqueryUI");

    return Marionette.ItemView.extend({

        template: weightPlanT,
        className: "create-weight-plan",

        minWeightVelocity: 0.5,
        maxWeightVelocity: 5,
        defaultWeightVelocity: 1,

        ui: {
            weightPlan: ".weight-plan",
            weightPlanHeader: ".weight-plan-header",
            startWeightSt: "#startWeightSt",
            startWeightStRm: "#startWeightStRm",
            startWeightDec: "#startWeightDec",
            endWeightSt: "#endWeightSt",
            endWeightStRm: "#endWeightStRm",
            planDateRange: "#planDateRange",
            weightVelocity: "#weightVelocity",
            planControls: ".plan-date-controls",
            weightPlanVertLabel: ".weight-plan-header > .border-label",
            toggleEditWeightPlan: ".toggleEditWeightPlan",
            resetButton: ".reset"
        },

        events: {
            "click button.update-plan": function (e) {
                this.saveWeightPlan({preview: true});
            },
            "change #weightVelocity": function (e) {
                if (this.model.get("weightPlan").isNew()) {
                    this.saveWeightPlan({preview: true});
                }
            },
            "click button.save-plan": function (e) {
                this.saveWeightPlan();
            },
            "click @ui.toggleEditWeightPlan": function (e) {
                e.preventDefault();
                if ($(e.target).parents(".weight-plan-header.locked").length) {
                    return;
                }
                this.ui.weightPlan.toggleClass("open");
                this.$(e.target).toggleClass("open");
                if (this.ui.weightPlan.hasClass("open")) {
                    this.ui.weightPlanVertLabel.fadeIn(800);
                }else {
                    this.ui.weightPlanVertLabel.fadeOut(300);
                }
            },
            "click .reset": function (e) {
                var self = this;
                $("#confirm-reset-modal").dialog({
                    resizable: false,
                    modal: true,
                    draggable: false,
                    buttons: {
                        Reset: function () {
                            self.model.get("weightPlan").destroy().then(function () {
                                self.model.unset("weightPlan");
                                self.model.fetch();
                            });
                            $(this).dialog("close");
                        },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            }
        },

        modelEvents: {
            sync: "render",
        },

        initialize: function () {
            self = this;
        },

        getFormWeights: function () {

            var startWeightSt = parseFloat(this.ui.startWeightSt.val(), 10);
            var startWeightStRm = parseFloat(this.ui.startWeightStRm.val(), 10) || 0;
            var endWeightSt = parseFloat(this.ui.endWeightSt.val(), 10);
            var endWeightStRm = parseFloat(this.ui.endWeightStRm.val(), 10) || 0;
            var weightVelocity = parseFloat(this.ui.weightVelocity.val() || 1, 10);
            var startWeight = weightUnitUtils.getLbsFromSt(startWeightSt, startWeightStRm);
            startWeight += parseFloat(this.ui.startWeightDec.val(), 10);
            var endWeight = weightUnitUtils.getLbsFromSt(endWeightSt, endWeightStRm);

            if (endWeight >= startWeight || startWeight === 0 || endWeight === 0) {
                // TODO notification
                console.warn("not enough fields complete to calculate weight plan.");
                return false;
            }

            return {
                startWeight: startWeight,
                endWeight: endWeight,
                velocity: weightVelocity
            }

        },

        saveWeightPlan: function (options) {

            options = options || {}

            var creating = false;

            var weights = this.getFormWeights();
            if (!weights) {
                return;
            }

            var startDate = this.startDate || moment([moment().year(), moment().month(), moment().date()]);
            var currentWeight;

            // save to backend:
            if (this.currentWeight) {
                currentWeight = weightUnitUtils.getLbsFromSt(this.currentWeight.st, this.currentWeight.lbs, this.currentWeight.decimalRm);
            }
            if (this.initialWeighin || currentWeight !== weights.startWeight) {
                this.model.set("currentWeight", weights.startWeight);
                this.model.addUserWeight(weights.startWeight, moment());
            }

            if (!this.model.get("weightPlan")) {
                this.model.set("weightPlan", new WeightPlanModel());
            }

            this.model.get("weightPlan").set({
                startDate: startDate,
                endDate: null,
                startWeight: weights.startWeight,
                endWeight: weights.endWeight,
                weightVelocity: weights.velocity
            });

            // preview 
            if (options.preview) {

                // FIXME can this happen on save automatically?
                this.model.get("weightPlan").set("endDate", this.model.get("weightPlan")._calculateEndDate());
                this.render();

            }

            // save
            else {

                this.model.get("weightPlan").save().then( function () {
                    //self.model.trigger("sync");
                    self.model.fetch(); // full fetch to get the weights
                }).fail( function () {
                    // TODO how do I even deal with this and why would it happen?
                    console.error("save weightPlan failed");
                });

            }

        },

        onBeforeRender: function () {

            if (this.model.get("currentWeight")) {
                this.currentWeight = weightUnitUtils.getStFromLbs(this.model.get("currentWeight"));
                this.initialWeighin = false;
            } else {
                this.initialWeighin = true;
                this.currentWeight = weightUnitUtils.getStFromLbs(0);
            }

            if (this.model.get("weightPlan")) {
                this.startDate = this.model.get("weightPlan.startDate");
                this.endDate = this.model.get("weightPlan").get("endDate");
                this.startWeight = weightUnitUtils.getStFromLbs(this.model.get("weightPlan.startWeight"));
                this.endWeight = weightUnitUtils.getStFromLbs(this.model.get("weightPlan.endWeight"));
                this.weightVelocity = this.model.get("weightPlan.weightVelocity");
            }

        },

        onDomRefresh: function () {

            this.$("button").button();

            if (!this.model.get("weightPlan")) {
                this.ui.weightPlanHeader.removeClass("edit");
                this.ui.planControls.hide();
                this.ui.resetButton.hide();
                this.$(".save-plan").hide();
                return;
            }

            if (this.model.get("weightPlan").isNew()) {
                this.ui.resetButton.hide();
            }else {
                this.ui.weightPlanHeader.addClass("edit");
                _.defer( _.bind(function () {
                    this.ui.weightPlan.removeClass("open");
                }, this));
                this.ui.weightPlanVertLabel.hide();
                this.$(".update-plan").hide();
            }

            // display date range display:
            var requiredMonths = Math.abs(this.endDate.month() - this.startDate.month())+1;

            this.ui.planDateRange.data("selectedDates", [this.startDate.toDate(), this.endDate.toDate()]);

            this.ui.planDateRange.datepicker({

                //firstDay: this.startDate.day(),
                numberOfMonths: [1, 5], // rows, cols
                defaultDate: this.startDate.toDate(),

                // TODO make this more intelligent when 2 dates are selected...
                // try to guess which date to update rather then always assuming its the start.
                // for example if I set a date after the goal... probably trying to change goal.
                // (though then I def need a reset button)
                onSelect: function (dateText, inst) {
                    inst.input.datepicker("setDate", "");
                    // var selectedDates = inst.input.data("selectedDates");
                    // if (!selectedDates || !selectedDates.length || selectedDates.length >=2 ) {
                    //     selectedDates = [new Date(dateText)];
                    // } else {
                    //     selectedDates.push(new Date(dateText));
                    //     self.calculateWeightPlan();
                    // }
                    // inst.input.data("selectedDates", selectedDates);
                },

                beforeShowDay: function (date) {
                    var selectedDates = self.ui.planDateRange.data("selectedDates");
                    if (!selectedDates || !selectedDates.length) {
                        return [true, ""];
                    }

                    date = date.getTime();
                        
                    var startDate, endDate;

                    if (selectedDates.length > 1) {
                        startDate = _.min(selectedDates, function (date) {
                            return date.getTime();
                        }).getTime();
                        endDate = _.max(selectedDates, function (date) {
                            return date.getTime();
                        }).getTime();
                    } else {
                        startDate = selectedDates[0].getTime();
                    }

                    if (date === startDate || date === endDate) {
                        return [true, "calendar-highlight-range"];
                    } else if (startDate && endDate && date > startDate && date < endDate ) {
                        return [true, "calendar-highlight-range"];
                    }

                    return [true, ""];
                }
            });

        },

        generateSelectOptions: function (min, max, interval, selected) {

            interval = interval || 1;
            selected = selected || min;

            var i, selectOptions = [];

            for (var i=min; i<max+interval; i+=interval) {
                if (i===selected) {
                    selectOptions.push({
                        value: i,
                        selected: true
                    });
                } else {
                    selectOptions.push({
                        value: i
                    });
                }
            }

            return selectOptions;

        },

        serializeData: function () {
                
            var velocityValues;
            var startWeight;
            var endWeight;
            var startWeightStRmValues;
            var endWeightStRmValues;
            var fraction;
            var startWeightPoundEighths = _.clone(weightUnitUtils.poundEighths);

            // creating
            if (!this.model.get("weightPlan")) {

                velocityValues = this.generateSelectOptions(this.minWeightVelocity, this.maxWeightVelocity, 0.5, this.defaultWeightVelocity);
                startWeightStRmValues = this.generateSelectOptions(0, 13, 1, this.currentWeight.lbs);
                endWeightStRmValues = startWeightStRmValues;
                startWeight = this.currentWeight;
                endWeight = this.currentWeight;
                fraction = this.currentWeight.decimalRm;

            }

            // editing
            else {

                velocityValues = this.generateSelectOptions(this.minWeightVelocity, this.maxWeightVelocity, 0.5, this.weightVelocity);
                startWeightStRmValues = this.generateSelectOptions(0, 13, 1, this.startWeight.lbs);
                endWeightStRmValues = this.generateSelectOptions(0, 13, 1, this.endWeight.lbs);
                startWeight = this.startWeight;
                endWeight = this.endWeight;
                fraction = this.startWeight.decimalRm

            }

            _.each(startWeightPoundEighths, function (each) {
                if (each.real === fraction) {
                    each.selected = true;
                    return false;
                }
            });

            return _.extend({}, this.model.toJSON(), {
                velocityValues: velocityValues,
                startWeightSt: startWeight.st,
                startWeightStRm: startWeight.lbs,
                endWeightSt: endWeight.st,
                endWeightStRm: endWeight.lbs,
                startWeightStRmValues: startWeightStRmValues,
                endWeightStRmValues: endWeightStRmValues,
                startWeightFractionValues: startWeightPoundEighths,                
            });

        }

    });

});