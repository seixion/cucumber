
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $           = require("jquery");
    var Marionette  = require("backbone.marionette");

    return Marionette.AppRouter.extend({
                    
        appRoutes: {
            "dashboard": "load",
            "dashboard/:id": "load"
        },

        routes: {
            "*notFound": "root"
        },

        root: function () {
            this.navigate("dashboard", {
                trigger: true,
                replace: true
            }); 
        }
        
    });

});