const mongoose = require("mongoose");


// ==========================================
// Approximate IP Location
// ==========================================

const locationSchema = new mongoose.Schema(
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


// ==========================================
// Precise Location
// Only populated after the visitor
// explicitly allows browser location access.
// ==========================================

const preciseLocationSchema =
    new mongoose.Schema(
        {
            latitude: {
                type: Number
            },

            longitude: {
                type: Number
            },

            locality: {
                type: String,
                default: "Unknown"
            },

            city: {
                type: String,
                default: "Unknown"
            },

            state: {
                type: String,
                default: "Unknown"
            },

            country: {
                type: String,
                default: "Unknown"
            },

            timestamp: {
                type: Date
            }
        },
        {
            _id: false
        }
    );


// ==========================================
// Visitor Schema
// ==========================================

const visitorSchema =
    new mongoose.Schema(
        {

            // ==========================================
            // Basic Visitor Information
            // ==========================================

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


            // ==========================================
            // Request Information
            // ==========================================

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


            // ==========================================
            // Approximate IP Location
            // ==========================================

            location: {
                type: locationSchema,

                default: () => ({})
            },


            // ==========================================
            // Precise Browser Location
            //
            // This is only populated after the
            // visitor explicitly allows location access.
            // ==========================================

            preciseLocation: {
                type: preciseLocationSchema,

                default: undefined
            },


            // ==========================================
            // Timestamp
            // ==========================================

            timestamp: {
                type: Date,

                default: Date.now
            }

        }
    );


// ==========================================
// Export Model
// ==========================================

module.exports =
    mongoose.model(
        "Visitor",
        visitorSchema
    );