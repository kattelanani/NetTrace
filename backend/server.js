const express = require("express");

const app = express();
app.set("trust proxy", true);
const PORT = 5000;

app.get("/", (req, res) => {
    const ip = req.ip;
    const userAgent = req.get("User-Agent");
    const method = req.method;
    const protocol = req.protocol;
    const host = req.get("Host");

    // Show visitor information in the terminal
    console.log("----- New Visitor -----");
    console.log("IP:", ip);
    console.log("User-Agent:", userAgent);
    console.log("Method:", method);
    console.log("Protocol:", protocol);
    console.log("Host:", host);
    console.log("-----------------------");

    // Show visitor information in the browser
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>NetTrace Visitor Analyzer</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

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
                        <span class="label">IP Address:</span>
                        ${ip}
                    </p>

                    <p>
                        <span class="label">Request Method:</span>
                        ${method}
                    </p>

                    <p>
                        <span class="label">Protocol:</span>
                        ${protocol}
                    </p>

                    <p>
                        <span class="label">Host:</span>
                        ${host}
                    </p>

                    <p>
                        <span class="label">User-Agent:</span>
                        ${userAgent}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 NetTrace running on port ${PORT}`);
});