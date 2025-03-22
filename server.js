const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app/chat";
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// Chatbot API Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Send user message to chatbot API
        const botResponse = await axios.post(CHATBOT_API_URL, { message: userMessage });

        // Respond to frontend
        res.json({ reply: botResponse.data.reply });

    } catch (error) {
        console.error("Error communicating with chatbot API:", error);
        res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
    }
});

// **✅ New Route to Log to Zapier**
app.post("/log-to-zapier", async (req, res) => {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            userMessage: req.body.userMessage,
            botResponse: req.body.botResponse,
        };

        // Send log data to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, logData, {
            headers: { "Content-Type": "application/json" }
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error sending log to Zapier:", error);
        res.status(500).json({ success: false, error: "Failed to send log to Zapier." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
