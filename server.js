const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Allow CORS for Taplink & Other Origins
app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"], // ✅ Allow Taplink
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

// ✅ Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// ✅ Root Route (Optional)
app.get("/", (req, res) => {
    res.send("🔥 Tribal Shaman Chatbot is running!");
});

// ✅ Chatbot Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("📨 User Message:", userMessage);

        // ✅ Send Request to OpenAI Assistant API
        const openAiResponse = await axios.post(
            "https://api.openai.com/v1/threads/runs",
            {
                assistant_id: OPENAI_ASSISTANT_ID,
                thread: { messages: [{ role: "user", content: userMessage }] }
            },
            { 
                headers: { 
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2" // ✅ Required Header!
                } 
            }
        );

        // ✅ Extract AI Response
        const botReply = openAiResponse.data.choices[0].message.content.trim();
        console.log("🤖 AI Response:", botReply);

        // ✅ Log to Zapier to Avoid CORS Errors
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ OpenAI Assistant API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "⚠️ AI response failed. Check logs for details." });
    }
});

// ✅ Proxy Route for Zapier (Prevents CORS Issues)
app.post("/send-to-zapier", async (req, res) => {
    try {
        await axios.post(ZAPIER_WEBHOOK_URL, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Zapier Logging Error:", error);
        res.status(500).json({ error: "Failed to log to Zapier." });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tribal Shaman Chatbot Running on Port ${PORT}`));
