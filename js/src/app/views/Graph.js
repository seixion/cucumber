
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                   = require("jquery");
    var Marionette          = require("backbone.marionette");
    var weightPlanGraphT    = require("hbars!templates/graph");
    var Highcharts          = require("vendor/highstock");
    var moment              = require("moment");
    var weightUnitUtils     = require("lib/weightUnitUtils");
    var regression          = require("vendor/regression");
    var self;

    return Backbone.Marionette.ItemView.extend({

        tagName: "div",
        className: "graph-container",
        template: weightPlanGraphT,

        drawTrendLine: false,

        ui: {
            graph: ".graph",
            graphDisplayControls: "#graph-display-control > input[type=radio]",
            autoCorrectBtn: ".auto-correct",
            trendLineSwitch: ".trend-line-display .pretty-switch > input[type=checkbox]",
            header: ".your-progress-header",
            yourProgress: ".your-progress"
        },

        events: {
            "change @ui.graphDisplayControls": function (e) {
                e.preventDefault();
                switch ($(e.target).attr("id")) {
                    case "graph-display-mode-1":
                        this.graphDisplayMode = this.graphDisplayModes.splineBar;
                        break;
                    case "graph-display-mode-2":
                        this.graphDisplayMode = this.graphDisplayModes.bars;
                        break;
                    case "graph-display-mode-3":
                    this.graphDisplayMode = this.graphDisplayModes.lines;
                        break;
                }
                this.drawGraph();
            },
            "change @ui.trendLineSwitch": function (e) {
                this.drawTrendLine = !this.drawTrendLine;
                this.drawGraph();
            },
            "click @ui.autoCorrectBtn": function (e) {
                e.preventDefault();
                this.model.get("weightPlan").autoCorrect();
            }
        },

        modelEvents: {
            sync: "render"
        },

        graphDisplayModes: {
            bars: {
               weightPlanSeries: "column",
               myWeightSeries: "column"
            },
            splineBar: {
                weightPlanSeries: "areaspline",
                myWeightSeries: "column"
            },
            lines: {
                weightPlanSeries: "areaspline",
                myWeightSeries: "areaspline"
            }
        },

        drawGraph: function () {

            var self = this;
            var oneDayMs = 24 * 3600 * 1000;

            // calculate min/max dates for x axis
            var maxRange = 5*7;
            var today = moment([moment().year(), moment().month(), moment().date()]);
            var startDate = this.watchFromDate || this.startDate;
            var min, max;
            if (this.goalDate.diff(startDate, "days") > maxRange) {
                min = Math.max(startDate.valueOf(),today.subtract(maxRange/2, "days").valueOf());
                max = moment(min).add(maxRange, "days").valueOf();
            }

            // setup the data object highcharts requires:

            if (!this.graphDisplayMode) {
                this.graphDisplayMode = this.graphDisplayModes.splineBar;
            }

            this.seriesData = [
                {
                    id: "weightPlanSeries",
                    type: this.graphDisplayMode.weightPlanSeries,
                    data: this.weightPlanSeries,
                    color: "#0078e8"
                },
                {   
                    id: "myWeightSeries",
                    type: this.graphDisplayMode.myWeightSeries,
                    data: this.myWeightsSeries,
                    color: "#eb2383",
                    //allowPointSelect: true,
                    //cursor: "pointer",
                    // TODO why cant I set selected color?
                }
            ];

            if (this.drawTrendLine) {
                this.seriesData.push({
                    type: "line",
                    data: (_.bind(function() {
                        var regressionLine = regression.fitData(this.myWeightsSeries);
                        var data = regressionLine.data;
                        data.push([this.weightPlanSeries[this.weightPlanSeries.length-1].x, regressionLine.y(this.weightPlanSeries[this.weightPlanSeries.length-1].x)]);
                        var condensed = [];
                        condensed.push(data[0]);
                        condensed.push(data[data.length-1]);
                        return condensed;
                    }, this))(),
                    color: "#0078e8"
                });
            }

            // FIXME this can get clipped so it needs to be able to draw itself to the bottom of the
            // target point in these cases
            var drawTargetLine = function () {

                var chart = this;

                // draw a line on the graph to highlight the current week:

                var today = moment.utc([moment().year(), moment().month(), moment().date()]);
                var planSeries = chart.get("weightPlanSeries");
                var todaysPoint;

                _.each(planSeries.points, function (point) {
                    if ((moment(point.x).diff(today,"days")) >1) { // works as long as points are always ASC
                        todaysPoint = point;
                        return false;
                    }
                });

                var x, y;
                
                self.graphTodayLine = self.graphTodayLine || {};

                if (self.graphTodayLine.line) {
                    self.graphTodayLine.line.destroy();
                }
                if (self.graphTodayLine.text) {
                    self.graphTodayLine.text.destroy();
                }
                if (self.graphTodayLine.box) {
                    self.graphTodayLine.box.destroy();
                }
    
                x = todaysPoint.plotX + chart.plotLeft - 52;
                y = todaysPoint.plotY + chart.plotTop - 35;

                // add 'youre here'
                self.graphTodayLine.text = chart.renderer.text("Your next target!", x, y).attr({
                    zIndex: 5,
                }).css({
                    color: "#ffffff",
                    "font-weight": "bold"
                }).add();
            
                var box = self.graphTodayLine.text.getBBox();
                self.graphTodayLine.box = chart.renderer.rect(box.x - 10, box.y - 10, box.width + 20, box.height + 20, 5).attr({
                    fill: "#0078e8",
                    stroke: "#0078e8",
                    "stroke-width": 1,
                    zIndex: 4
                }).add();

                //self.graphTodayLine.line = chart.renderer.path(["M", x, chart.plotTop, "L", x, chart.plotSizeY+chart.plotTop]).attr({
                var triW = 10;
                x = self.graphTodayLine.box.getBBox().x + self.graphTodayLine.box.getBBox().width/2;
                y = self.graphTodayLine.box.getBBox().y + self.graphTodayLine.box.getBBox().height + triW;
                self.graphTodayLine.line = chart.renderer.path(["M", x, y, "L", x - triW, y-triW, "L", x+triW, y-triW, "L", x, y]).attr({    
                    "stroke-width": 1,
                    // stroke: "#EB2383",
                    stroke: "#0078e8",
                    fill: "#0078e8",
                    zIndex: 4
                }).add();

                todaysPoint.select(true);

            }

            // draw chart:

            if (this.ui.graph.outerHeight()) {
                this.ui.graph.css({
                    height: this.ui.graph.outerHeight()
                });
            }

            this.chart = new Highcharts.Chart({

                chart: {
                    renderTo: this.ui.graph.get(0),
                    borderWidth: 0,
                    borderRadius: 0,
                    events: {
                        redraw: drawTargetLine
                    },
                },
                title: {
                    text: null,
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(255, 255, 255, 1.0)",
                    crosshairs: [
                        {
                            color: "#dedddd",
                            dashStyle: "LongDash",
                            //zIndex: 3
                        }
                    ],
                    shadow: false,
                    formatter: function () {
                        var currentWeight = weightUnitUtils.getStFromLbs(this.y);
                        var fraction = _.find(weightUnitUtils.poundEighths, {real: currentWeight.decimalRm});
                        fraction = fraction.value || "";
                        return moment(this.x).format("dddd Do MMM") +"<br><strong>" + currentWeight.st+"st "+currentWeight.lbs+" "+fraction+" lbs.</strong>"
                    }
                },
                xAxis: {
                    lineColor: "#f1f1f1",
                    min: min,
                    max: max,
                    type: "datetime",
                    startOfWeek: this.startDate.day(),
                    //tickInterval: oneDayMs * 7,
                    //minTickInterval: oneDayMs,

                    tickPositioner: function (min, max) {
                        var weekTicks = _.filter(_.pluck(self.weightPlanSeries, function (weight) {
                            return weight.x;
                        }), function (date) {
                            return date > min && date < max;
                        });
                        var weightTicks = _.filter(_.pluck(self.model.get("weightPlan.weights"), function (weight) {
                            return weight.date.toDate().getTime();
                        }), function (date) {
                            return date > min && date < max;
                        });
                        return _.union(weekTicks,weightTicks);
                    },

                    labels: {
                        rotation: 90,
                        formatter: function () {
                            if (_.contains(_(self.weightPlanSeries).pluck("x").valueOf(), this.value)) {
                                return "<b>"+moment(this.value).format("D. MMM")+"</b>";
                            }else{
                                return moment(this.value).format("D. MMM");
                            }
                        }
                    },
                    
                },
                yAxis: {
                    min: Math.min(this.startWeight, this.goalWeight),
                    max: _.max(this.myWeightsSeries, "y").y,
                    title: {
                        text: null
                    },
                    labels: {
                        formatter: function () {
                            var currentWeight = weightUnitUtils.getStFromLbs(this.value);
                            return currentWeight.st+"st "+currentWeight.lbs+ "lbs";
                        }
                    },
                    lineWidth: 1,
                    lineColor: "#f1f1f1",
                    gridLineColor: "#f1f1f1",
                    gridLineDashStyle: "LongDash"
                },
                scrollbar: {
                    enabled: true,
                    barBackgroundColor: "#f1f1f1",
                    barBorderRadius: 7,
                    barBorderWidth: 0,
                    buttonBackgroundColor: "#f1f1f1",
                    buttonBorderWidth: 0,
                    buttonBorderRadius: 7,
                    trackBackgroundColor: "none",
                    trackBorderWidth: 1,
                    trackBorderRadius: 8,
                    trackBorderColor: "#f1f1f1",
                    rifleColor: "#333333",
                    buttonArrowColor: "#333333",
                    liveRedraw: true
                },
                legend: {
                    enabled: false,
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        pointPlacement: 0,
                    },
                    areaspline: {
                        animation: false,
                        //cursor: "pointer"
                    },
                    series: {
                        marker: {
                            states: {
                                select: {
                                    fillColor: "#fff",
                                    lineColor: "#0078e8",
                                    radius: 8,
                                    lineWidth: 2
                                }
                            }
                        }
                    }
                },
                series: this.seriesData

            }, function (chart) {

                drawTargetLine.call(chart);

                self.ui.graph.css({
                    height: "auto"
                });

            });

        },

        onDomRefresh: function () {

            if (this.model.get("weightPlan")) {
                this.startDate = this.model.get("weightPlan.startDate");
                this.goalDate = this.model.get("weightPlan.endDate");
                this.watchFromDate = this.model.get("weightPlan.watchFromDate");
                this.startWeight = this.model.get("weightPlan.startWeight");
                this.goalWeight = this.model.get("weightPlan.endWeight");
                this.weightVelocity = this.model.get("weightPlan.weightVelocity");
            }

            if (!this.startDate || !this.goalDate || !this.startWeight || !this.goalWeight || !this.weightVelocity || !this.ui.graph.length) {
                this.ui.header.addClass("locked");
                this.ui.yourProgress.removeClass("open");
                return;
            }

            this.$(".radioset").buttonset();
            this.$(".button").button();

            if (this.model.get("weightPlan") && this.model.get("weightPlan").isWeightPlanPipeDream()) {
                this.ui.autoCorrectBtn.css({
                    visibility: "visible"
                });
            }

            // create weight plan data:
            this.weightPlanSeries = [];
            var nextDate, nextWeight;
            var planLengthWeeks = Math.abs(Math.ceil(this.startDate.diff(this.goalDate, "days")/7));
            var i;

            // FIXME these are coming up -1 days from the marks on the axis... why?
            for (i=1; i<planLengthWeeks; i++) {
                nextDate = moment(this.startDate).add("w", i);
                nextWeight = this.startWeight - (this.weightVelocity*i);
                // TODO only include points which are 'in the futre' / past the last weigh-in data point?
                this.weightPlanSeries.push(
                    {
                        x: nextDate.toDate().getTime(),
                        y: nextWeight
                    }
                );
            }
            this.weightPlanSeries.unshift({
                id: "startPlan",
                x: this.startDate.toDate().getTime(), 
                y: this.startWeight
            });
            this.weightPlanSeries.push({
                id: "endPlan",
                x: this.goalDate.toDate().getTime(),
                y: this.goalWeight
            });

            // create myweights data:
            this.myWeightsSeries = [];
            _.each(this.model.get("weightPlan.weights"), _.bind(function (each) {
                this.myWeightsSeries.push({
                    x: each.date.toDate().getTime(),
                    y: each.weight
                });
            },this));

            //
            this.drawGraph();

        },

        serializeData: function () {
            var finishDate;
            if (this.model.get("weightPlan.endDate")) {
                finishDate = this.model.get("weightPlan.endDate").format("dddd, MMMM Do YYYY");
            }
            return {
                finishDate: finishDate
            }
        }

    });

});