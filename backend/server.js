require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Visitor = require("./Visitor");

const app = express();

app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;


// ==========================================
// MongoDB Connection
// ==========================================

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


// ==========================================
// Frontend
// ==========================================

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);

app.use(
    express.static(frontendPath, {
        index: false
    })
);


// ==========================================
// Detect Browser
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

    if (userAgent.includes("Firefox/")) {
        return "Firefox";
    }

    if (
        userAgent.includes("Safari/") &&
        !userAgent.includes("Chrome/")
    ) {
        return "Safari";
    }

    return "Unknown";
}


// ==========================================
// Detect Operating System
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
// Detect Device Type
// ==========================================

function detectDeviceType(userAgent) {

    if (!userAgent) {
        return "Unknown";
    }

    if (/iPad|Tablet/i.test(userAgent)) {
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
// Get Approximate Location
// ==========================================

async function getLocation(ip) {

    try {

        console.log(
            "🌍 Looking up location for IP:",
            ip
        );

        // Local development
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


        // Remove IPv4-mapped IPv6 prefix

        const cleanIP =
            ip.replace(
                "::ffff:",
                ""
            );


        // ==========================================
        // IPWHO Location API
        // ==========================================

        const response = await fetch(
            `https://ipwho.is/${encodeURIComponent(
                cleanIP
            )}`
        );


        if (!response.ok) {

            console.log(
                "⚠️ Location API HTTP error:",
                response.status
            );

            return {

                city: "Unknown",

                region: "Unknown",

                country: "Unknown",

                timezone: "Unknown"

            };
        }


        const data =
            await response.json();


        console.log(
            "🌍 Location API response:",
            data
        );


        if (data.success === false) {

            console.log(
                "⚠️ Location API could not identify IP:",
                data.message
            );

            return {

                city: "Unknown",

                region: "Unknown",

                country: "Unknown",

                timezone: "Unknown"

            };
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

    } catch (error) {

        console.error(
            "❌ Location lookup failed:",
            error.message
        );

        return {

            city: "Unknown",

            region: "Unknown",

            country: "Unknown",

            timezone: "Unknown"

        };
    }
}


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", async (req, res) => {

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
        req.get("Host");


    const referrer =
        req.get("Referer") ||
        "Direct";


    // ==========================================
    // Detect Browser / OS / Device
    // ==========================================

    const browser =
        detectBrowser(
            userAgent
        );


    const operatingSystem =
        detectOperatingSystem(
            userAgent
        );


    const deviceType =
        detectDeviceType(
            userAgent
        );


    // ==========================================
    // Console Information
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
    // Location
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
    // Save Visitor to MongoDB
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

    } catch (error) {

        console.error(
            "❌ Failed to save visitor:"
        );

        console.error(
            error
        );

    }


    // ==========================================
    // Send Instagram Reel Page
    // ==========================================

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );

});


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