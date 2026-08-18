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
// Frontend Path
// ==========================================

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);

// IMPORTANT:
// Do NOT automatically serve index.html.
// Our "/" route must run first.
app.use(
    express.static(frontendPath, {
        index: false
    })
);

// ==========================================
// Get Approximate IP Location
// ==========================================

async function getLocation(ip) {

    try {

        // Localhost doesn't have a public geographic location
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
        const cleanIP = ip.replace(
            "::ffff:",
            ""
        );

        const response = await fetch(
            `https://ipapi.co/${encodeURIComponent(cleanIP)}/json/`
        );

        if (!response.ok) {

            console.log(
                "⚠️ Location API request failed:",
                response.status
            );

            return {
                city: "Unknown",
                region: "Unknown",
                country: "Unknown",
                timezone: "Unknown"
            };
        }

        const data = await response.json();

        return {
            city: data.city || "Unknown",
            region: data.region || "Unknown",
            country: data.country_name || "Unknown",
            timezone: data.timezone || "Unknown"
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
    console.log("🔥 HOME ROUTE HIT!");

    const ip = req.ip;

    const userAgent =
        req.get("User-Agent");

    const method =
        req.method;

    const protocol =
        req.protocol;

    const host =
        req.get("Host");

    console.log("----- New Visitor -----");

    console.log("IP:", ip);

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

                ipAddress: ip,

                userAgent: userAgent,

                method: method,

                protocol: protocol,

                host: host,

                location: location

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

        console.error(error);

    }

    // ==========================================
    // Send Reel Page
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