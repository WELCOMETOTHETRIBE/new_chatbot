const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app/chat";  // ✅ Use your backend
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Zapier Logging Route
app.post("/log-to-zapier", async (req, res) => {
    try {
        const { userMessage, botResponse } = req.body;

        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse
        });

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Zapier Logging Error:", error);
        res.status(500).json({ success: false, error: "Failed to log to Zapier" });
    }
});

// ✅ Chatbot Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const botResponse = await axios.post(CHATBOT_API_URL, { message: userMessage });

        // ✅ Now logging is done through the backend
        axios.post("https://newchatbot-production.up.railway.app/log-to-zapier", {
            userMessage,
            botResponse: botResponse.data.reply
        }).catch(err => console.error("❌ Failed to log to Zapier:", err));

        res.json({ reply: botResponse.data.reply });

    } catch (error) {
        console.error("❌ Chatbot API Error:", error);
        res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
