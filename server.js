const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Chatbot API Route (Handles User Messages)
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    res.json({ reply: `Hello! You said: ${userMessage}` });  // Replace with AI logic if needed
});

// ✅ Logging Route (Sends Logs to Zapier)
app.post("/log", async (req, res) => {
    try {
        const logData = req.body;
        await axios.post("https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/", logData);
        res.json({ status: "Logged to Zapier" });
    } catch (error) {
        console.error("Logging error:", error);
        res.status(500).json({ error: "Failed to log data" });
    }
});

// ✅ Start Server on Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
