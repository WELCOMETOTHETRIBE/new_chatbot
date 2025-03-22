const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 New Chatbot Backend is Running!");
});

// Chat Endpoint
app.post("/chat", (req, res) => {
    const userMessage = req.body.message || "Hello";
    res.json({ reply: `Tribal Shaman: ${userMessage}` });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
