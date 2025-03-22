const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Chatbot API (Modify if needed)
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message || "";
    const botResponse = `I'm a chatbot! You said: ${userMessage}`;

    res.json({ reply: botResponse });
});

// Logging API - Forward logs to Zapier
app.post("/log", async (req, res) => {
    try {
        const logData = req.body;

        await fetch(process.env.ZAPIER_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logData),
        });

        res.json({ success: true, message: "Log sent to Zapier!" });
    } catch (error) {
        console.error("Error sending log:", error);
        res.status(500).json({ success: false, message: "Failed to send log." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
