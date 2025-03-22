const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app//chat";
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Send user message to chatbot API
        const botResponse = await axios.post(CHATBOT_API_URL, { message: userMessage });

        // Send chat log to Zapier
        await axios.post(ZAPIER_WEBHOOK_URL, {
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: botResponse.data.reply
        });

        res.json({ reply: botResponse.data.reply });

    } catch (error) {
        console.error("Error communicating with chatbot API:", error);
        res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
