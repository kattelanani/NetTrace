const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Visitor =
    require("./Visitor");


const app =
    express();


const PORT =
    process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    express.json()
);


// =====================================================
// MONGODB
// =====================================================

mongoose
    .connect(
        process.env.MONGODB_URI
    )
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


// =====================================================
// GET VISITOR IP
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


// =====================================================
// BROWSER
// =====================================================

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


// =====================================================
// OPERATING SYSTEM
// =====================================================

function detectOS(userAgent) {

    if (!userAgent) {

        return "Unknown";

    }


    if (/Android/i.test(userAgent)) {

        return "Android";

    }


    if (
        /iPhone|iPad|iPod/i
            .test(userAgent)
    ) {

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


// =====================================================
// DEVICE
// =====================================================

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
// APPROXIMATE IP LOCATION
// =====================================================

async function getApproxLocation(ip) {

    try {

        // ---------------------------------------------
        // Localhost
        // ---------------------------------------------

        if (
            ip === "127.0.0.1" ||
            ip === "::1" ||
            ip === "::ffff:127.0.0.1"
        ) {

            return {

                city: "Localhost",

                region: "Local",

                country: "Local",

                timezone: "Local"

            };

        }


        console.log(
            "🌍 Looking up approximate location for:",
            ip
        );


        const response =
            await fetch(
                `https://ipwho.is/${encodeURIComponent(ip)}`
            );


        if (!response.ok) {

            throw new Error(
                `Location API returned ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Location lookup unsuccessful"
            );

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
            "⚠️ Approximate location lookup failed:",
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


// =====================================================
// HOME PAGE
// =====================================================

app.get(
    "/",
    async (req, res) => {

        console.log("");
        console.log(
            "🔥 HOME ROUTE HIT!"
        );


        try {

            // -----------------------------------------
            // Basic request information
            // -----------------------------------------

            const ip =
                getVisitorIP(req);


            const userAgent =
                req.headers["user-agent"] ||
                "Unknown";


            // -----------------------------------------
            // Approximate location
            // -----------------------------------------

            const location =
                await getApproxLocation(ip);


            console.log(
                "📍 Approximate location:",
                location
            );


            // -----------------------------------------
            // Save visitor
            // -----------------------------------------

            const visitor =
                await Visitor.create({

                    ipAddress:
                        ip,

                    userAgent:
                        userAgent,

                    browser:
                        detectBrowser(
                            userAgent
                        ),

                    operatingSystem:
                        detectOS(
                            userAgent
                        ),

                    deviceType:
                        detectDevice(
                            userAgent
                        ),

                    method:
                        req.method,

                    protocol:
                        req.protocol,

                    host:
                        req.get("host") ||
                        "Unknown",

                    referrer:
                        req.get("referer") ||
                        "Direct",

                    location:
                        location

                });


            console.log(
                "💾 Visitor saved successfully!"
            );


            console.log(
                "Visitor ID:",
                visitor._id.toString()
            );


            // -----------------------------------------
            // Read frontend
            // -----------------------------------------

            const htmlPath =
                path.join(
                    __dirname,
                    "../frontend/index.html"
                );


            let html =
                fs.readFileSync(
                    htmlPath,
                    "utf8"
                );


            // -----------------------------------------
            // Insert visitor ID
            // -----------------------------------------

            html =
                html.replace(
                    "__VISITOR_ID__",
                    visitor._id.toString()
                );


            // -----------------------------------------
            // Send page
            // -----------------------------------------

            res.send(
                html
            );

        }
        catch (error) {

            console.error(
                "❌ Visitor save failed:",
                error
            );


            // IMPORTANT:
            // Even if analytics/location fails,
            // still show the Reel page.

            try {

                const htmlPath =
                    path.join(
                        __dirname,
                        "../frontend/index.html"
                    );


                let html =
                    fs.readFileSync(
                        htmlPath,
                        "utf8"
                    );


                html =
                    html.replace(
                        "__VISITOR_ID__",
                        ""
                    );


                res.send(
                    html
                );

            }
            catch (frontendError) {

                console.error(
                    "❌ Frontend loading failed:",
                    frontendError
                );


                res.status(500).send(
                    "Server error"
                );

            }

        }

    }
);


// =====================================================
// STATIC FILES
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