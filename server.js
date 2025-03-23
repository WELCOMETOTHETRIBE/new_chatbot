require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow Taplink & other origins
app.use(
  cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"], // Allow Taplink
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

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
      {},
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const threadId = threadResponse.data.id;
    console.log(`🧵 Created Thread ID: ${threadId}`);

    // ✅ Step 2: Add User Message to the Thread
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        role: "user",
        content: userMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    // ✅ Step 3: Run the Assistant on the Thread
    const runResponse = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        assistant_id: OPENAI_ASSISTANT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    console.log(`▶️ Assistant Run Started: ${runResponse.data.id}`);

    // ✅ Step 4: Wait for Completion & Get Response
    let runStatus = "in_progress";
    let botReply = "⚠️ AI is still processing...";

    while (runStatus === "in_progress" || runStatus === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s

      const checkStatus = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runResponse.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );

      runStatus = checkStatus.data.status;
      console.log(`⌛ Assistant Status: ${runStatus}`);
    }

    // ✅ Step 5: Get Final Assistant Reply
    const messagesResponse = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const assistantMessages = messagesResponse.data.data
      .filter((msg) => msg.role === "assistant")
      .map((msg) => msg.content.text.value);

    botReply = assistantMessages.length > 0 ? assistantMessages[0] : "⚠️ No AI response received.";
    console.log(`🤖 AI Response: ${botReply}`);

    // ✅ Step 6: Log to Zapier
    await axios.post(ZAPIER_WEBHOOK_URL, {
      timestamp: new Date().toISOString(),
      userMessage,
      botResponse: botReply,
    });

    res.json({ reply: botReply });
  } catch (error) {
    console.error("❌ OpenAI Assistant API Error:", error.response?.data || error.message || error);
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
