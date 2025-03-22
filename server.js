const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Chatbot Route
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Replace with actual chatbot logic
        const botResponse = `🤖 Tribal Shaman: You said, "${userMessage}"`;

        // Send response
        res.json({ reply: botResponse });

        // ✅ Log message to Zapier
        const zapierWebhook = process.env.ZAPIER_WEBHOOK;
        if (zapierWebhook) {
            await axios.post(zapierWebhook, {
                timestamp: new Date().toISOString(),
                userMessage: userMessage,
                botResponse: botResponse
            });
        }
    } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Health Check
app.get("/", (req, res) => {
    res.send("Chatbot Backend is Running! 🚀");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
