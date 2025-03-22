const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app/chat"; // Replace if needed
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Serve a homepage instead of "Cannot GET /"
app.get("/", (req, res) => {
    res.send("<h1>🔥 Tribal Shaman Chatbot is Running! 🔥</h1>");
});

// Chatbot API Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Send user message to chatbot API
        const botResponse = await axios.post(CHATBOT_API_URL, { message: userMessage });

        // Return response to frontend
        res.json({ reply: botResponse.data.reply });

    } catch (error) {
        console.error("Error communicating with chatbot API:", error);
        res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
    }
});

// Proxy Zapier Logging to Avoid CORS
app.post("/log-to-zapier", async (req, res) => {
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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
