const mongoose = require("mongoose");


// ======================================================
// LOCATION SCHEMA
// ======================================================

const locationSchema =
    new mongoose.Schema(
        {

            city: {

                type: String,

                default: "Unknown"

            },

            region: {

                type: String,

                default: "Unknown"

            },

            country: {

                type: String,

                default: "Unknown"

            },

            timezone: {

                type: String,

                default: "Unknown"

            }

        },

        {
            _id: false
        }
    );


// ======================================================
// VISITOR SCHEMA
// ======================================================

const visitorSchema =
    new mongoose.Schema(
        {

            ipAddress: {

                type: String,

                default: "Unknown"

            },

            userAgent: {

                type: String,

                default: "Unknown"

            },

            browser: {

                type: String,

                default: "Unknown"

            },

            operatingSystem: {

                type: String,

                default: "Unknown"

            },

            deviceType: {

                type: String,

                default: "Unknown"

            },

            method: {

                type: String,

                default: "GET"

            },

            protocol: {

                type: String,

                default: "https"

            },

            host: {

                type: String,

                default: "Unknown"

            },

            referrer: {

                type: String,

                default: "Direct"

            },

            location: {

                type: locationSchema,

                default: () => ({})

            },

            timestamp: {

                type: Date,

                default: Date.now

            }

        }
    );


module.exports =
    mongoose.model(
        "Visitor",
        visitorSchema
    );