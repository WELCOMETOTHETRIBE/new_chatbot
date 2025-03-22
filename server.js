require("dotenv").config();  // ✅ Load environment variables

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow Taplink & other origins
app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"],
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

// ✅ Load API Keys from .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

if (!OPENAI_API_KEY || !OPENAI_ASSISTANT_ID) {
    console.error("❌ ERROR: Missing OpenAI API Key or Assistant ID! Check your .env file.");
    process.exit(1);
}

// ✅ Handle Chat Requests
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log(`📨 User Message: ${userMessage}`);

        // **STEP 1**: Create a Thread
        const threadResponse = await axios.post(
            "https://api.openai.com/v1/threads",
            {},
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "OpenAI-Beta": "assistants=v2", "Content-Type": "application/json" } }
        );

        const threadId = threadResponse.data.id;
        console.log(`🧵 Created Thread ID: ${threadId}`);

        // **STEP 2**: Add User Message to Thread
        await axios.post(
            `https://api.openai.com/v1/threads/${threadId}/messages`,
            { role: "user", content: userMessage },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "OpenAI-Beta": "assistants=v2", "Content-Type": "application/json" } }
        );

        // **STEP 3**: Run Assistant on the Thread
        const runResponse = await axios.post(
            `https://api.openai.com/v1/threads/${threadId}/runs`,
            { assistant_id: OPENAI_ASSISTANT_ID },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "OpenAI-Beta": "assistants=v2", "Content-Type": "application/json" } }
        );

        const runId = runResponse.data.id;
        console.log(`🚀 Run Started with ID: ${runId}`);

        // **STEP 4**: Poll for Assistant's Reply (Wait for completion)
        let botReply = "⚠️ AI is still thinking...";
        let runStatus = "in_progress";

        while (runStatus === "in_progress") {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before checking again

            const statusResponse = await axios.get(
                `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
                { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "OpenAI-Beta": "assistants=v2", "Content-Type": "application/json" } }
            );

            runStatus = statusResponse.data.status;
        }

        // **STEP 5**: Retrieve Assistant's Response
        const messagesResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/messages`,
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "OpenAI-Beta": "assistants=v2", "Content-Type": "application/json" } }
        );

        const messages = messagesResponse.data.data;
        botReply = messages.length > 0 ? messages[messages.length - 1].content[0].text.value : "⚠️ No response received.";

        console.log(`🤖 AI Response: ${botReply}`);

        // ✅ Log to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botReply
        });

        res.json({ reply: botReply });

    } catch (error) {
        console.error("❌ OpenAI Assistant API Error:", error.response ? error.response.data : error);
        res.status(500).json({ reply: "⚠️ Error: AI response failed. Check logs for details." });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Tribal Shaman Chatbot Running on Port ${PORT}`));
