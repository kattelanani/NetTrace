const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({

    ipAddress: {
        type: String
    },

    userAgent: {
        type: String
    },

    browser: {
        type: String
    },

    operatingSystem: {
        type: String
    },

    deviceType: {
        type: String
    },

    method: {
        type: String
    },

    protocol: {
        type: String
    },

    host: {
        type: String
    },

    referrer: {
        type: String
    },

    location: {

        city: {
            type: String
        },

        region: {
            type: String
        },

        country: {
            type: String
        },

        timezone: {
            type: String
        }

    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Visitor",
    visitorSchema
);