const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow Taplink & other trusted origins
app.use(cors({
    origin: ["https://taplink.cc", "https://www.taplink.cc"], // Allow Taplink
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/";

// ✅ Root route to confirm server is live
app.get("/", (req, res) => {
    res.send("🚀 Jabronis Backend is Running! Ready to handle requests.");
});

// ✅ Proxy Zapier Logging to Avoid CORS Errors
app.post("/send-to-zapier", async (req, res) => {
    try {
        console.log("Received data:", req.body); // Debugging
        await axios.post(ZAPIER_WEBHOOK_URL, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error("Zapier Logging Error:", error);
        res.status(500).json({ error: "Failed to log to Zapier." });
    }
});

// ✅ Chatbot API Proxy Route (Mirroring Jabronis Structure)
const CHATBOT_API_URL = "https://newchatbot-production.up.railway.app/chat"; // Replace with actual chatbot API

app.post("/chat", async (req, res) => {
    try {
        console.log("User message received:", req.body.message); // Debugging
        const botResponse = await axios.post(CHATBOT_API_URL, { message: req.body.message });
        
        res.json({ reply: botResponse.data.reply });
    } catch (error) {
        console.error("Chatbot API Error:", error);
        res.status(500).json({ reply: "⚠️ Error: Unable to connect to chatbot API." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Jabronis Backend Running on Port ${PORT}`));
