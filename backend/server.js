
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Visitor = require("./Visitor");

const app = express();


// ==========================================
// Render Proxy
// ==========================================

app.set("trust proxy", true);


// ==========================================
// Port
// ==========================================

const PORT = process.env.PORT || 5000;


// ==========================================
// MongoDB Connection
// ==========================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {

        console.log(
            "🍃 MongoDB connected successfully!"
        );

    })
    .catch((error) => {

        console.error(
            "❌ MongoDB connection failed:",
            error.message
        );

    });


// ==========================================
// Frontend Path
// ==========================================

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);


// ==========================================
// Serve Frontend
// ==========================================

app.use(
    express.static(
        frontendPath,
        {
            index: false
        }
    )
);


// ==========================================
// JSON Parser
// ==========================================

app.use(express.json());


// ==========================================
// Browser Detection
// ==========================================

function detectBrowser(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (userAgent.includes("Edg/")) {
        return "Microsoft Edge";
    }

    if (userAgent.includes("OPR/")) {
        return "Opera";
    }

    if (userAgent.includes("Chrome/")) {
        return "Chrome";
    }

    if (
        userAgent.includes("Safari/") &&
        !userAgent.includes("Chrome/")
    ) {
        return "Safari";
    }

    if (userAgent.includes("Firefox/")) {
        return "Firefox";
    }

    return "Unknown";
}


// ==========================================
// Operating System Detection
// ==========================================

function detectOperatingSystem(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (userAgent.includes("Windows NT")) {
        return "Windows";
    }

    if (userAgent.includes("Android")) {
        return "Android";
    }

    if (
        userAgent.includes("iPhone") ||
        userAgent.includes("iPad") ||
        userAgent.includes("iPod")
    ) {
        return "iOS";
    }

    if (userAgent.includes("Mac OS X")) {
        return "macOS";
    }

    if (userAgent.includes("Linux")) {
        return "Linux";
    }

    return "Unknown";
}


// ==========================================
// Device Detection
// ==========================================

function detectDeviceType(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (
        /iPad|Tablet/i.test(userAgent)
    ) {
        return "Tablet";
    }

    if (
        /Mobile|Android|iPhone|iPod/i.test(
            userAgent
        )
    ) {
        return "Mobile";
    }

    return "Desktop";
}


// ==========================================
// Get Visitor IP
// ==========================================

function getVisitorIP(req) {

    const forwardedFor =
        req.headers["x-forwarded-for"];

    if (forwardedFor) {

        return forwardedFor
            .split(",")[0]
            .trim();

    }

    return req.ip;
}


// ==========================================
// Detect Bots / Crawlers
// ==========================================

function isCrawler(userAgent) {

    if (!userAgent) {
        return false;
    }

    const crawlerPatterns = [

        /facebookexternalhit/i,
        /facebot/i,
        /googlebot/i,
        /bingbot/i,
        /twitterbot/i,
        /linkedinbot/i,
        /slackbot/i,
        /telegrambot/i,
        /discordbot/i,
        /whatsapp/i,
        /pinterest/i,
        /crawler/i,
        /spider/i,
        /bot/i,
        /headless/i

    ];

    return crawlerPatterns.some(
        (pattern) =>
            pattern.test(userAgent)
    );
}


// ==========================================
// Unknown Location
// ==========================================

function unknownLocation() {

    return {

        city: "Unknown",

        region: "Unknown",

        country: "Unknown",

        timezone: "Unknown"

    };
}


// ==========================================
// Approximate IP Location
// ==========================================

async function getLocation(ip) {

    try {

        console.log(
            "🌍 Looking up location for IP:",
            ip
        );


        // ==========================================
        // Localhost
        // ==========================================

        if (
            ip === "::1" ||
            ip === "127.0.0.1" ||
            ip === "::ffff:127.0.0.1"
        ) {

            return {

                city: "Localhost",

                region: "Local",

                country: "Local",

                timezone: "Local"

            };

        }


        // ==========================================
        // Clean IPv4 mapped IPv6
        // ==========================================

        const cleanIP =
            ip.replace(
                "::ffff:",
                ""
            );


        // ==========================================
        // IPWho.is
        // ==========================================

        const response =
            await fetch(
                `https://ipwho.is/${encodeURIComponent(
                    cleanIP
                )}`
            );


        if (!response.ok) {

            console.log(
                "⚠️ Location API HTTP error:",
                response.status
            );

            return unknownLocation();

        }


        const data =
            await response.json();


        if (data.success === false) {

            console.log(
                "⚠️ Location lookup failed:",
                data.message
            );

            return unknownLocation();

        }


        return {

            city:
                data.city ||
                "Unknown",

            region:
                data.region ||
                "Unknown",

            country:
                data.country ||
                "Unknown",

            timezone:
                data.timezone?.id ||
                "Unknown"

        };

    }
    catch (error) {

        console.error(
            "❌ IP location lookup failed:",
            error.message
        );

        return unknownLocation();

    }

}


// ==========================================
// DETAILED LOCATION
// Only after visitor explicitly allows
// browser location permission
// ==========================================

app.post(
    "/api/reverse-geocode",
    async (req, res) => {

        try {

            const {
                latitude,
                longitude
            } = req.body;


            // ==========================================
            // Validate Coordinates
            // ==========================================

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


            if (
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Coordinates out of range."

                });

            }


            console.log("");

            console.log(
                "📍 Visitor explicitly allowed location access"
            );


            // ==========================================
            // Reverse Geocoding
            // ==========================================

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
                    {
                        headers: {

                            "User-Agent":
                                "NetTrace/1.0"

                        }
                    }
                );


            if (!response.ok) {

                console.error(
                    "❌ Reverse geocoding API error:",
                    response.status
                );

                return res.status(502).json({

                    success: false

                });

            }


            const data =
                await response.json();


            const address =
                data.address || {};


            // ==========================================
            // Locality / Village
            // ==========================================

            const locality =
                address.village ||
                address.hamlet ||
                address.town ||
                address.suburb ||
                address.neighbourhood ||
                address.city_district ||
                "Unknown";


            // ==========================================
            // City
            // ==========================================

            const city =
                address.city ||
                address.town ||
                address.municipality ||
                address.county ||
                "Unknown";


            // ==========================================
            // State
            // ==========================================

            const state =
                address.state ||
                "Unknown";


            // ==========================================
            // Country
            // ==========================================

            const country =
                address.country ||
                "Unknown";


            console.log(
                "📍 Detailed location found"
            );

            console.log(
                "Locality:",
                locality
            );

            console.log(
                "City:",
                city
            );

            console.log(
                "State:",
                state
            );

            console.log(
                "Country:",
                country
            );


            // ==========================================
            // Find latest visitor from same IP
            // ==========================================

            const ip =
                getVisitorIP(req);


            const updatedVisitor =
                await Visitor.findOneAndUpdate(

                    {
                        ipAddress: ip
                    },

                    {
                        $set: {

                            preciseLocation: {

                                latitude:
                                    latitude,

                                longitude:
                                    longitude,

                                locality:
                                    locality,

                                city:
                                    city,

                                state:
                                    state,

                                country:
                                    country,

                                timestamp:
                                    new Date()

                            }

                        }

                    },

                    {
                        sort: {
                            timestamp: -1
                        },

                        returnDocument:
                            "after"

                    }

                );


            if (updatedVisitor) {

                console.log(
                    "💾 Detailed location saved to MongoDB!"
                );

                console.log(
                    "Visitor ID:",
                    updatedVisitor._id
                );

            }
            else {

                console.log(
                    "⚠️ Visitor record not found."
                );

            }


            // ==========================================
            // IMPORTANT
            //
            // Do NOT send location details
            // back to visitor.
            // ==========================================

            return res.json({

                success: true

            });

        }
        catch (error) {

            console.error(
                "❌ Detailed location failed:",
                error.message
            );


            return res.status(500).json({

                success: false

            });

        }

    }
);


// ==========================================
// HOME ROUTE
// ==========================================

app.get(
    "/",
    async (req, res) => {

        console.log("");

        console.log(
            "🔥 HOME ROUTE HIT!"
        );


        // ==========================================
        // Visitor Information
        // ==========================================

        const ip =
            getVisitorIP(req);

        const userAgent =
            req.get("User-Agent") ||
            "Unknown";

        const method =
            req.method;

        const protocol =
            req.protocol;

        const host =
            req.get("Host") ||
            "Unknown";

        const referrer =
            req.get("Referer") ||
            "Direct";


        // ==========================================
        // Ignore Crawlers
        // ==========================================

        if (
            isCrawler(userAgent)
        ) {

            console.log(
                "🤖 Crawler detected:"
            );

            console.log(
                userAgent
            );

            console.log(
                "🚫 Crawler will NOT be saved."
            );

            console.log(
                "-----------------------"
            );


            return res.sendFile(
                path.join(
                    frontendPath,
                    "index.html"
                )
            );

        }


        // ==========================================
        // Browser
        // ==========================================

        const browser =
            detectBrowser(
                userAgent
            );


        // ==========================================
        // Operating System
        // ==========================================

        const operatingSystem =
            detectOperatingSystem(
                userAgent
            );


        // ==========================================
        // Device
        // ==========================================

        const deviceType =
            detectDeviceType(
                userAgent
            );


        // ==========================================
        // Console
        // ==========================================

        console.log(
            "----- New Visitor -----"
        );

        console.log(
            "IP:",
            ip
        );

        console.log(
            "Browser:",
            browser
        );

        console.log(
            "Operating System:",
            operatingSystem
        );

        console.log(
            "Device Type:",
            deviceType
        );

        console.log(
            "User-Agent:",
            userAgent
        );

        console.log(
            "Method:",
            method
        );

        console.log(
            "Protocol:",
            protocol
        );

        console.log(
            "Host:",
            host
        );

        console.log(
            "Referrer:",
            referrer
        );


        // ==========================================
        // Approximate Location
        // ==========================================

        const location =
            await getLocation(ip);


        console.log(
            "Approximate Location:",
            location
        );

        console.log(
            "-----------------------"
        );


        // ==========================================
        // Save Visitor
        // ==========================================

        try {

            const visitor =
                await Visitor.create({

                    ipAddress:
                        ip,

                    userAgent:
                        userAgent,

                    browser:
                        browser,

                    operatingSystem:
                        operatingSystem,

                    deviceType:
                        deviceType,

                    method:
                        method,

                    protocol:
                        protocol,

                    host:
                        host,

                    referrer:
                        referrer,

                    location:
                        location

                });


            console.log(
                "💾 Visitor saved to MongoDB!"
            );

            console.log(
                "Visitor ID:",
                visitor._id
            );

        }
        catch (error) {

            console.error(
                "❌ Failed to save visitor:"
            );

            console.error(
                error
            );

        }


        // ==========================================
        // Send Reel
        // ==========================================

        return res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );

    }
);


// ==========================================
// Start Server
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🌐 NetTrace running on port ${PORT}`
        );

    }
);