require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Visitor = require("./Visitor");

const app = express();

app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);

app.use(express.json());


// ======================================================
// MONGODB
// ======================================================

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


// ======================================================
// IP
// ======================================================

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


// ======================================================
// BROWSER
// ======================================================

function detectBrowser(userAgent) {

    if (!userAgent) return "Unknown";

    if (userAgent.includes("Edg/"))
        return "Microsoft Edge";

    if (userAgent.includes("OPR/"))
        return "Opera";

    if (userAgent.includes("Chrome/"))
        return "Chrome";

    if (userAgent.includes("Firefox/"))
        return "Firefox";

    if (
        userAgent.includes("Safari/") &&
        !userAgent.includes("Chrome/")
    )
        return "Safari";

    return "Unknown";
}


// ======================================================
// OS
// ======================================================

function detectOperatingSystem(userAgent) {

    if (!userAgent) return "Unknown";

    if (userAgent.includes("Windows NT"))
        return "Windows";

    if (userAgent.includes("Android"))
        return "Android";

    if (
        userAgent.includes("iPhone") ||
        userAgent.includes("iPad") ||
        userAgent.includes("iPod")
    )
        return "iOS";

    if (userAgent.includes("Mac OS X"))
        return "macOS";

    if (userAgent.includes("Linux"))
        return "Linux";

    return "Unknown";
}


// ======================================================
// DEVICE
// ======================================================

function detectDeviceType(userAgent) {

    if (!userAgent) return "Unknown";

    if (/iPad|Tablet/i.test(userAgent))
        return "Tablet";

    if (
        /Mobile|Android|iPhone|iPod/i.test(
            userAgent
        )
    )
        return "Mobile";

    return "Desktop";
}


// ======================================================
// BOT
// ======================================================

function isCrawler(userAgent) {

    if (!userAgent) return false;

    const patterns = [

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

    return patterns.some(
        pattern => pattern.test(userAgent)
    );
}


// ======================================================
// UNKNOWN LOCATION
// ======================================================

function unknownLocation() {

    return {

        city: "Unknown",

        region: "Unknown",

        country: "Unknown",

        timezone: "Unknown"

    };

}


// ======================================================
// APPROXIMATE LOCATION
// ======================================================

async function getLocation(ip) {

    try {

        console.log(
            "🌍 Looking up approximate location:",
            ip
        );

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

        const cleanIP =
            ip.replace(
                "::ffff:",
                ""
            );

        const response =
            await fetch(
                `https://ipwho.is/${encodeURIComponent(
                    cleanIP
                )}`
            );

        if (!response.ok) {

            return unknownLocation();

        }

        const data =
            await response.json();

        if (data.success === false) {

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
            "❌ Location lookup failed:",
            error.message
        );

        return unknownLocation();

    }

}


// ======================================================
// HOME ROUTE
// ======================================================

app.get(
    "/",
    async (req, res) => {

        console.log("");
        console.log(
            "🔥 HOME ROUTE HIT!"
        );


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


        // Don't save bots

        if (
            isCrawler(userAgent)
        ) {

            console.log(
                "🤖 Crawler detected"
            );

            return res.sendFile(
                path.join(
                    frontendPath,
                    "index.html"
                )
            );

        }


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


        try {

            // ==================================================
            // CREATE VISITOR
            // ==================================================

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
                        unknownLocation()

                });


            const visitorId =
                visitor._id.toString();


            console.log(
                "💾 Visitor saved!"
            );

            console.log(
                "🆔 Visitor ID:",
                visitorId
            );


            // ==================================================
            // READ HTML
            // ==================================================

            const indexPath =
                path.join(
                    frontendPath,
                    "index.html"
                );


            let html =
                fs.readFileSync(
                    indexPath,
                    "utf8"
                );


            // ==================================================
            // REPLACE PLACEHOLDER
            // ==================================================

            html =
                html.replace(
                    "__VISITOR_ID__",
                    visitorId
                );


            console.log(
                "✅ Visitor ID injected into HTML"
            );


            // ==================================================
            // SEND HTML
            // ==================================================

            res.type("html");

            return res.send(html);

        }
        catch (error) {

            console.error(
                "❌ Visitor save failed:",
                error
            );

            return res.status(500).send(
                "Server error"
            );

        }

    }
);


// ======================================================
// ALLOW APPROXIMATE LOCATION
// ======================================================

app.post(
    "/api/allow-approximate-location",
    async (req, res) => {

        try {

            console.log("");
            console.log(
                "🟢 ALLOW BUTTON CLICKED"
            );


            const visitorId =
                req.body.visitorId;


            console.log(
                "🆔 Received Visitor ID:",
                visitorId
            );


            if (
                !visitorId ||
                visitorId === "__VISITOR_ID__"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Visitor ID is missing."

                });

            }


            const visitor =
                await Visitor.findById(
                    visitorId
                );


            if (!visitor) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Visitor not found."

                });

            }


            const ip =
                getVisitorIP(req);


            const location =
                await getLocation(ip);


            visitor.location =
                location;


            await visitor.save();


            console.log(
                "💾 Approximate location saved to MongoDB!"
            );


            console.log(
                "🆔 Visitor ID:",
                visitor._id
            );


            // IMPORTANT:
            // Do NOT send location to visitor.

            return res.json({

                success: true

            });

        }
        catch (error) {

            console.error(
                "❌ Approximate location failed:",
                error
            );

            return res.status(500).json({

                success: false

            });

        }

    }
);


// ======================================================
// STATIC FILES
//
// IMPORTANT:
// This comes AFTER the "/" route.
// ======================================================

app.use(
    express.static(
        frontendPath,
        {
            index: false
        }
    )
);


// ======================================================
// START
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🌐 NetTrace running on port ${PORT}`
        );

    }
);