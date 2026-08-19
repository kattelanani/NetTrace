const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({

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

    timestamp: {
        type: Date,
        default: Date.now
    }

});


module.exports =
    mongoose.model(
        "Visitor",
        visitorSchema
    );