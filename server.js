const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ FIX: Use the real chatbot API (REPLACE WITH YOUR ACTUAL CHATBOT API)
const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app//chat"; 
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Add a Root Route for Debugging
app.get("/", (req, res) => {
    res.send("🚀 Chatbot Backend is Running!");
});

// ✅ Chatbot Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // ✅ Send user message to the real chatbot API
        const botResponse = await axios.post(CHATBOT_API_URL, { message: userMessage });

        // ✅ Log chat interactions to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botResponse.data.reply
        });

        res.json({ reply: botResponse.data.reply });

    } catch (error) {
        console.error("❌ Error communicating with chatbot API:", error);
        res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
