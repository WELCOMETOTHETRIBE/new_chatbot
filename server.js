const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load API keys from .env file

const app = express();
app.use(express.json());

// ✅ Allow Taplink & other origins
app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"], // Allow Taplink
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

// ✅ OpenAI API Key (Set this in Railway variables)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Zapier Webhook URL
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Route to handle chatbot messages
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // ✅ Debugging: Log incoming message
        console.log("User message received:", userMessage);

        // ✅ Send user message to OpenAI Assistant API
        const openAiResponse = await axios.post(
            "https://api.openai.com/v1/threads/runs",
            {
                assistant_id: process.env.OPENAI_ASSISTANT_ID, // Uses your Tribal Shaman Assistant
                thread: { messages: [{ role: "user", content: userMessage }] }
            },
            { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" } }
        );

        const botReply = openAiResponse.data.choices[0].message.content.trim();
        console.log("AI Response from Tribal Shaman:", botReply);

        // ✅ Log user interaction to Zapier
        await axios.post(process.env.ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage: userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ OpenAI Assistant API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "⚠️ Error: AI response failed. Check logs for details." });
    }
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

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tribal Shaman Chatbot Running on Port ${PORT}`));
