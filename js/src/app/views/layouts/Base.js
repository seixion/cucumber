
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var Marionette = require("backbone.marionette");

    return Marionette.Layout.extend({
        
        initialize: function () {
            this.views = [];
            this.on("dom:refresh", this.renderAll.bind(this));
        },

        buildViews: function () {
            _.each(this.viewImpls, function(view, key) {
                var opts = _.isFunction(view.options) ? view.options.call(this): view.options;
                this.views.push({
                    instance: new view.view(opts),
                    region: this[key]
                });
            }, this);
        },

        showViews: function () {
            _.each(this.views, function (view) {
                view.region.show(view.instance);
            });
        },

        renderAll: function () {
            this.buildViews();
            this.showViews();
        }

    });

});
