const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// MONGODB
// =====================================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("🍃 MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error(
            "❌ MongoDB connection failed:",
            error.message
        );
    });

// =====================================================
// VISITOR SCHEMA
// =====================================================

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

    // Precise GPS/reverse-geocoded location
    preciseLocation: {

        latitude: Number,

        longitude: Number,

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
        }

    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

const Visitor = mongoose.model(
    "Visitor",
    visitorSchema
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getVisitorIP(req) {

    const forwarded =
        req.headers["x-forwarded-for"];

    if (forwarded) {

        return forwarded
            .split(",")[0]
            .trim();

    }

    return (
        req.socket.remoteAddress ||
        "Unknown"
    );
}


function detectBrowser(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (/Edg/i.test(userAgent)) {
        return "Edge";
    }

    if (/Chrome/i.test(userAgent)) {
        return "Chrome";
    }

    if (/Firefox/i.test(userAgent)) {
        return "Firefox";
    }

    if (/Safari/i.test(userAgent)) {
        return "Safari";
    }

    return "Unknown";
}


function detectOS(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (/Android/i.test(userAgent)) {
        return "Android";
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return "iOS";
    }

    if (/Windows/i.test(userAgent)) {
        return "Windows";
    }

    if (/Mac OS/i.test(userAgent)) {
        return "macOS";
    }

    if (/Linux/i.test(userAgent)) {
        return "Linux";
    }

    return "Unknown";
}


function detectDevice(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (
        /Mobile|Android|iPhone|iPad|iPod/i
            .test(userAgent)
    ) {
        return "Mobile";
    }

    return "Desktop";
}

// =====================================================
// REVERSE GEOCODING
// =====================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        `&zoom=18` +
        `&addressdetails=1`;

    const response =
        await fetch(url, {

            headers: {

                "User-Agent":
                    "NetTrace/1.0 location-service"

            }

        });

    if (!response.ok) {

        throw new Error(
            `Reverse geocoding failed: ${response.status}`
        );

    }

    const data =
        await response.json();

    const address =
        data.address || {};

    return {

        latitude,
        longitude,

        locality:
            address.suburb ||
            address.village ||
            address.hamlet ||
            address.neighbourhood ||
            "Unknown",

        city:
            address.city ||
            address.town ||
            address.municipality ||
            address.county ||
            "Unknown",

        state:
            address.state ||
            "Unknown",

        country:
            address.country ||
            "Unknown"

    };
}

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", async (req, res) => {

    console.log("");
    console.log("🔥 HOME ROUTE HIT!");

    try {

        const userAgent =
            req.headers["user-agent"] ||
            "Unknown";

        const visitor =
            await Visitor.create({

                ipAddress:
                    getVisitorIP(req),

                userAgent,

                browser:
                    detectBrowser(userAgent),

                operatingSystem:
                    detectOS(userAgent),

                deviceType:
                    detectDevice(userAgent),

                method:
                    req.method,

                protocol:
                    req.protocol,

                host:
                    req.get("host") ||
                    "Unknown",

                referrer:
                    req.get("referer") ||
                    "Direct"

            });

        console.log(
            "💾 Visitor saved to MongoDB!"
        );

        console.log(
            "Visitor ID:",
            visitor._id.toString()
        );

        const frontendPath =
            path.join(
                __dirname,
                "../frontend/index.html"
            );

        let html =
            require("fs")
                .readFileSync(
                    frontendPath,
                    "utf8"
                );

        // Insert visitor ID into HTML
        html =
            html.replace(
                "__VISITOR_ID__",
                visitor._id.toString()
            );

        res.send(html);

    }
    catch (error) {

        console.error(
            "❌ Visitor save failed:",
            error
        );

        res.status(500).send(
            "Server error"
        );

    }

});

// =====================================================
// PRECISE LOCATION
// =====================================================

app.post(
    "/api/save-precise-location",
    async (req, res) => {

        try {

            const {
                visitorId,
                latitude,
                longitude
            } = req.body;

            console.log("");
            console.log(
                "📍 Precise location request received"
            );

            console.log(
                "Visitor ID:",
                visitorId
            );

            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );

            // -----------------------------------------
            // Validate
            // -----------------------------------------

            if (!visitorId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Visitor ID missing."

                });

            }

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid coordinates."

                });

            }

            // -----------------------------------------
            // Reverse geocode
            // -----------------------------------------

            console.log(
                "🌍 Reverse geocoding..."
            );

            const location =
                await reverseGeocode(
                    latitude,
                    longitude
                );

            console.log("");
            console.log(
                "📍 Detailed location found"
            );

            console.log(
                "Locality:",
                location.locality
            );

            console.log(
                "City:",
                location.city
            );

            console.log(
                "State:",
                location.state
            );

            console.log(
                "Country:",
                location.country
            );

            // -----------------------------------------
            // Save to SAME visitor document
            // -----------------------------------------

            const visitor =
                await Visitor.findByIdAndUpdate(

                    visitorId,

                    {
                        $set: {

                            preciseLocation:
                                location

                        }

                    },

                    {
                        returnDocument: "after"
                    }

                );

            if (!visitor) {

                console.log(
                    "❌ Visitor not found"
                );

                return res.status(404).json({

                    success: false,

                    message:
                        "Visitor not found."

                });

            }

            console.log("");
            console.log(
                "💾 Precise location saved to MongoDB!"
            );

            console.log(
                "Visitor ID:",
                visitor._id.toString()
            );

            console.log(
                "-----------------------------"
            );

            // Don't send location back to browser
            res.json({

                success: true

            });

        }
        catch (error) {

            console.error(
                "❌ Precise location failed:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Precise location processing failed."

            });

        }

    }
);

// =====================================================
// STATIC FRONTEND FILES
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        )
    )
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `🌐 NetTrace running on port ${PORT}`
        );

    }
);