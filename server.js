const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"],
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app/chat";
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Add a root route to confirm the server is running
app.get("/", (req, res) => {
    res.send("🚀 Jabronis Backend is Running! Ready to handle requests.");
});

// ✅ Debugging Chat Endpoint
app.post("/chat", async (req, res) => {
    try {
        console.log("📝 Incoming Chat Message:", req.body);

        if (!req.body.message) {
            return res.status(400).json({ error: "No message provided!" });
        }

        // Simulate chatbot response (REMOVE THIS if connecting to real chatbot API)
        const botResponse = { reply: `You said: ${req.body.message}` };

        // Log to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage: req.body.message,
            botResponse: botResponse.reply
        });

        res.json(botResponse);
    } catch (error) {
        console.error("❌ Chatbot API Error:", error.message);
        res.status(500).json({ error: "Chatbot service failed" });
    }
});

// ✅ Proxy Zapier Logging to Avoid CORS Errors
app.post("/send-to-zapier", async (req, res) => {
    try {
        console.log("📡 Sending data to Zapier:", req.body);
        await axios.post(ZAPIER_WEBHOOK_URL, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Zapier Logging Error:", error.message);
        res.status(500).json({ error: "Failed to log to Zapier." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Jabronis Backend Running on Port ${PORT}`));
