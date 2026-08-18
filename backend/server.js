require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Visitor = require("./Visitor");

const app = express();

app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;

// ================================
// MongoDB Connection
// ================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("🍃 MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
    });

// ================================
// Home Route
// ================================

app.get("/", async (req, res) => {

    console.log("🔥 HOME ROUTE HIT!");

    const ip = req.ip;
    const userAgent = req.get("User-Agent");
    const method = req.method;
    const protocol = req.protocol;
    const host = req.get("Host");

    console.log("----- New Visitor -----");
    console.log("IP:", ip);
    console.log("User-Agent:", userAgent);
    console.log("Method:", method);
    console.log("Protocol:", protocol);
    console.log("Host:", host);
    console.log("-----------------------");

    // ================================
    // Save Visitor to MongoDB
    // ================================

    try {

        const visitor = await Visitor.create({
            ipAddress: ip,
            userAgent: userAgent,
            method: method,
            protocol: protocol,
            host: host
        });

        console.log("💾 Visitor saved to MongoDB!");
        console.log("Visitor ID:", visitor._id);

    } catch (error) {

        console.error("❌ Failed to save visitor:");
        console.error(error);

    }

    // ================================
    // NetTrace Web Page
    // ================================

    res.send(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>NetTrace Visitor Analyzer</title>

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <style>

                body {
                    font-family: Arial, sans-serif;
                    background: #f4f4f4;
                    padding: 30px;
                }

                .container {
                    max-width: 700px;
                    margin: auto;
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                h1 {
                    margin-bottom: 5px;
                }

                .info {
                    background: #f8f8f8;
                    padding: 15px;
                    margin-top: 15px;
                    border-radius: 8px;
                }

                .label {
                    font-weight: bold;
                }

                p {
                    word-break: break-word;
                }

            </style>

        </head>

        <body>

            <div class="container">

                <h1>🌐 NetTrace</h1>

                <p>Visitor Information</p>

                <div class="info">

                    <p>
                        <span class="label">
                            IP Address:
                        </span>

                        ${ip}
                    </p>

                    <p>
                        <span class="label">
                            Request Method:
                        </span>

                        ${method}
                    </p>

                    <p>
                        <span class="label">
                            Protocol:
                        </span>

                        ${protocol}
                    </p>

                    <p>
                        <span class="label">
                            Host:
                        </span>

                        ${host}
                    </p>

                    <p>
                        <span class="label">
                            User-Agent:
                        </span>

                        ${userAgent}
                    </p>

                </div>

            </div>

        </body>

        </html>
    `);
});

// ================================
// Start Server
// ================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🌐 NetTrace running on port ${PORT}`);

});