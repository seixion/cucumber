define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                       = require("jquery");
    var Marionette              = require("backbone.marionette");
    var dashboardT 	            = require("hbars!templates/layouts/dashboard");
    var GraphView               = require("app/views/Graph");
    var WeignInView             = require("app/views/WeighIn");
    var BaseLayout              = require("app/views/layouts/Base");
    var WeightPlanView          = require("app/views/WeightPlan");
    var LogoutBox               = require("app/views/LogoutBox");
    var self;

    return BaseLayout.extend({

        template: dashboardT,
        className: "dashboard",
        regions: {
            logoutContainer: ".js-region-logout",
            loginContainer: ".js-region-login-container",
            graphContainer: ".js-region-graph-container",
            weighInContainer: ".js-region-weigh-in-container",
            weightPlanContainer: ".js-region-weight-plan-container"
        },

        modelEvents: {
            // FIXME this is bad, is causes all the views to be re-created... why did I need it again?
            sync: function () {

            }
        },

        viewImpls: {
            logoutContainer: {
                view: LogoutBox,
                options: function () {
                    return {
                        model: this.model,
                        facebookUserModel: this.options.facebookUserModel
                    }
                }
            },
            weightPlanContainer: {
                view: WeightPlanView,
                options: function () {
                    return {
                        model: this.model
                    }
                }
            },
            graphContainer: {
                view: GraphView,
                options: function () {
                    return {
                        model: this.model
                    }
                }
            },
            weighInContainer: {
                view: WeignInView,
                options: function () {
                    return {
                        model: this.model
                    }
                }
            },
        },
        
        initialize: function () {
            BaseLayout.prototype.initialize.call(this);
        },

    });

});