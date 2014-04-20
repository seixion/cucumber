
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var app                     = require("app");
    var DashboardController     = require("app/controllers/Dashboard");
    var AppRouter               = require("app/routers/App");
    var AppLayout               = require("app/views/layouts/App");

    function Main () {

        // setup controllers:
        var dashboardController = new DashboardController();

        // setup routers:
        new AppRouter({
            controller: dashboardController
        });

        // setup regions:
        app.layout = new AppLayout();
        app.getRegion("app").show(app.layout);

        app.start();

    }

    return Main;

});
