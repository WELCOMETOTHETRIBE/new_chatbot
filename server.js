const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Root Route - Health Check
app.get('/', (req, res) => {
    res.send('✅ Chatbot Backend is Running');
});

// Chatbot API Route
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Call AI Chatbot API (Replace with your actual chatbot API URL)
        const response = await axios.post('https://newchatbot-production.up.railway.app/chat', {
            message: userMessage
        });

        res.json({ reply: response.data.reply });
    } catch (error) {
        console.error("🔥 Chatbot API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch chatbot response" });
    }
});

// Zapier Logging Route
app.post('/log', async (req, res) => {
    try {
        const { userMessage, botResponse } = req.body;

        if (!userMessage || !botResponse) {
            return res.status(400).json({ error: "Missing required data" });
        }

        // Send Data to Zapier Webhook
        await axios.post(process.env.ZAPIER_WEBHOOK, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse
        });

        res.json({ success: true, message: "Logged successfully" });
    } catch (error) {
        console.error("🔥 Zapier Logging Error:", error.message);
        res.status(500).json({ error: "Failed to log data" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
