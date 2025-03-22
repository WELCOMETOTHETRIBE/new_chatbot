document.addEventListener("DOMContentLoaded", function () {
    const chatContainer = document.getElementById("chat-widget");
    
    if (!chatContainer) {
        console.error("Chat widget container not found!");
        return;
    }

    // Inject chat UI into Taplink
    chatContainer.innerHTML = `
        <div id="chat-box" style="height: 300px; overflow-y: auto; padding: 10px; border: 1px solid #ddd;"></div>
        <div id="typing-indicator" style="display: none; font-style: italic;">🧙 Tribal Shaman is typing...</div>
        <input type="text" id="userMessage" placeholder="Ask me anything..." style="width: 80%; padding: 8px;">
        <button id="sendButton" style="padding: 8px;">Send</button>
    `;

    const userInput = document.getElementById("userMessage");
    const sendButton = document.getElementById("sendButton");
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.getElementById("typing-indicator");

    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        chatBox.innerHTML += `<div style="background: #d1e7dd; padding: 5px; margin: 5px;">You: ${userMessage}</div>`;
        userInput.value = "";
        typingIndicator.style.display = "block";

        fetch("https://taplink-chatbot-production.up.railway.app/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = "none";
            chatBox.innerHTML += `<div style="background: #f8d7da; padding: 5px; margin: 5px;">Tribal Shaman: ${data.reply}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;

            // ✅ Send to Zapier Webhook for logging
            fetch("https://hooks.zapier.com/hooks/catch/XXXXXXX/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    userMessage: userMessage,
                    botResponse: data.reply,
                }),
            });
        })
        .catch(error => {
            typingIndicator.style.display = "none";
            chatBox.innerHTML += `<div style="color: red;">⚠️ Error: Unable to connect.</div>`;
        });
    }

    sendButton.addEventListener("click", sendMessage);
});

