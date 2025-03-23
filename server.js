require("dotenv").config(); // Load environment variables

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

// ✅ Load API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

if (!OPENAI_API_KEY || !OPENAI_ASSISTANT_ID || !ZAPIER_WEBHOOK_URL) {
    console.error("❌ Missing environment variables! Make sure you set them in Railway.");
    process.exit(1);
}

// ✅ Chatbot Route - Handles messages from frontend
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log(`📨 User Message: ${userMessage}`);

        // ✅ Step 1: Create a Thread
        const threadResponse = await axios.post(
            "https://api.openai.com/v1/threads",
            {}, // Empty body for thread creation
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2" // ✅ Required header
                }
            }
        );

        const threadId = threadResponse.data.id;
        console.log(`🧵 Created Thread ID: ${threadId}`);

        // ✅ Step 2: Run Assistant with user input
        const runResponse = await axios.post(
            `https://api.openai.com/v1/threads/${threadId}/messages`,
            {
                messages: [{ role: "user", content: userMessage }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                }
            }
        );

        console.log("🕒 Waiting for Assistant Response...");
        
        // ✅ Step 3: Retrieve Response
        const runStatus = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/runs`,
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                }
            }
        );

        const runData = runStatus.data.data[0]; // Get first run result

        // ✅ Extract bot response safely
        const botReply = runData && runData.messages && runData.messages.length > 0
            ? runData.messages[0].content
            : "⚠️ Error: No response from AI.";

        console.log(`🤖 AI Response: ${botReply}`);

        // ✅ Proxy Zapier Logging to Avoid CORS Errors
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ OpenAI Assistant API Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "⚠️ Error: AI response failed. Check logs for details." });
    }
});

// ✅ Proxy Zapier Logging Endpoint (Prevents CORS issues)
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
