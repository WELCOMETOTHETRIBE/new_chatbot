require("dotenv").config();  // ✅ Load environment variables from .env

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

// ✅ Load API Keys from .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// 🚨 Ensure API Key & Assistant ID Exist
if (!OPENAI_API_KEY || !OPENAI_ASSISTANT_ID) {
    console.error("❌ ERROR: Missing OpenAI API Key or Assistant ID! Check your .env file.");
    process.exit(1);
}

// ✅ Handle Chat Requests
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log(`📨 User Message: ${userMessage}`);

        // 🔥 Call OpenAI Assistant API
        const response = await axios.post(
            "https://api.openai.com/v1/threads",
            {
                messages: [{ role: "user", content: userMessage }],
                assistant_id: OPENAI_ASSISTANT_ID
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "OpenAI-Beta": "assistants=v2",
                    "Content-Type": "application/json"
                }
            }
        );

        const botReply = response.data.choices?.[0]?.message?.content || "⚠️ AI did not respond.";

        console.log(`🤖 OpenAI Response: ${botReply}`);

        // ✅ Log to Zapier to track chat interactions
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ OpenAI Assistant API Error:", error);
        res.status(500).json({ reply: "⚠️ Error: AI response failed. Check logs for details." });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tribal Shaman Chatbot Running on Port ${PORT}`));
