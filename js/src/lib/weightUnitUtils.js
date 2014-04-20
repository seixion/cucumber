
define( function (require) {

    "use strict";
    /*jslint browser: true, nomen: true, vars: true, plusplus: true, white: true */

    var _ = require("underscore");

    return {

        poundEighths: [
            {
                value: "0",
                real: 0
            },
            {
                value: "1/8",
                real: 0.125
            },
            {
                value: "1/4",
                real: 0.25
            },
            {
                value: "3/8",
                real: 0.375
            },
            {
                value: "1/2",
                real: 0.5
            },
            {
                value: "5/8",
                real: 0.625
            },
            {
                value: "3/4",
                real: 0.75
            },
            {
                value: "7/8",
                real: 0.875
            }
        ],

        getStFromLbs: function (lbs) {
            var st = Math.floor(lbs/14);
            var remainder = lbs-(st*14);
            var lbs = Math.floor(remainder);
            var decimal = remainder - lbs;
            // round decimal to lower eighth
            decimal = Math.floor(decimal*8)/8;

            return {
                st: st,
                lbs: lbs,
                decimalRm: decimal
            }
        },

        getLbsFromSt: function (st, lbs, decimalRm) {
            lbs = lbs || 0;
            decimalRm = decimalRm || 0;
            return st*14+lbs+decimalRm;
        },

    }

});