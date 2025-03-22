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
        
        // ✅ Send user message to OpenAI GPT API
        const openAiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 100
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
        );

        const botReply = openAiResponse.data.choices[0].message.content.trim();

        // ✅ Log user interaction to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage: userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error communicating with OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "⚠️ Error: AI response failed." });
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
