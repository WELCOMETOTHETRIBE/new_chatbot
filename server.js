const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow Taplink & other origins
app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"], // Allow Taplink
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Root route to prevent "Cannot GET /"
app.get("/", (req, res) => {
    res.send("🚀 Jabronis Backend is Running! Ready to handle requests.");
});

// ✅ Proxy Zapier Logging to Avoid CORS Errors
app.post("/send-to-zapier", async (req, res) => {
    try {
        await axios.post(ZAPIER_WEBHOOK_URL, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("Zapier Logging Error:", error);
        res.status(500).json({ error: "Failed to log to Zapier." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Jabronis Backend Running on Port ${PORT}`));
