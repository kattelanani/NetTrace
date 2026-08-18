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
        console.error("❌ MongoDB connection failed:", error.message);
    });

// ==========================================
// Serve Frontend Files
// ==========================================

const frontendPath = path.join(__dirname, "..", "frontend");

app.use(express.static(frontendPath));

// ==========================================
// NetTrace Home Route
// ==========================================

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

    // ==========================================
    // Save Visitor
    // ==========================================

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

    // ==========================================
    // Send Frontend
    // ==========================================

    res.sendFile(
        path.join(frontendPath, "index.html")
    );

});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(`🌐 NetTrace running on port ${PORT}`);

});