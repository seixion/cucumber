
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var $                       = require("jquery");
    var _                       = require("underscore");
    var Marionette              = require("backbone.marionette");
    var app                     = require("app");
    var DashboardLayout         = require("app/views/layouts/Dashboard");
    var LoginLayout             = require("app/views/layouts/Login");
    var FooterView              = require("app/views/Footer");
    var UserModel               = require("app/models/User");
    var FacebookUserModel       = require("app/models/FacebookUser");
    var self;

    return Marionette.Controller.extend({

        initialize: function (options) {
            self = this;
            this.listenTo(app.vent, "addUserWeight", this.addUserWeight);
        },

        buildModels: function () {

            this.userModel = new UserModel();

            this.facebookUserModel = new FacebookUserModel();
            this.facebookUserModel.fetch();

        },

        doLogin: function (overrideExternalId) {

            this.userModel.set({
                externalId: overrideExternalId || this.facebookUserModel.get("id"),
                name: this.facebookUserModel.get("name")
            });
            this.userModel.fetch().done( _.bind(function () {
                if (this.userModel.isNew()) {
                    this.userModel.save();
                }else{
                    this.userModel.trigger("sync");
                }
            }, this));

        },

        load: function (overrideExternalId) {

            this.buildModels();

            // FIXME this path is just for dev
            if (overrideExternalId) {

                app.layout.main.show(new DashboardLayout({
                    model: this.userModel,
                    facebookUserModel: this.facebookUserModel
                }));

                this.doLogin(overrideExternalId);

                app.layout.footer.show(new FooterView());

                return;

            }

            this.listenTo(this.facebookUserModel, "change", _.bind(function () {
                
                if (this.facebookUserModel.get("id")) {

                    app.layout.main.show(new DashboardLayout({
                        model: this.userModel,
                        facebookUserModel: this.facebookUserModel
                    }));

                    this.doLogin();

                    app.layout.footer.show(new FooterView());

                }

                else {

                    app.layout.main.show(new LoginLayout({
                        model: this.facebookUserModel
                    }));

                }
       

            }, this));


        },

    });

});
