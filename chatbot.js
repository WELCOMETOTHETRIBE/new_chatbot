document.addEventListener("DOMContentLoaded", function () {
    const chatContainer = document.createElement("div");
    chatContainer.id = "chatbot-container";
    chatContainer.innerHTML = `
        <button id="chatbot-button" onclick="toggleChat()">💬</button>
        <div id="chat-window">
            <div id="chat-header" onclick="toggleChat()">Tribal Shaman Chat ✨</div>
            <div id="chat-box"><p class="bot-message">🔮 Ask me anything!</p></div>
            <div id="typing-indicator">🧙 Tribal Shaman is typing...</div>
            <div id="chat-input-area">
                <input type="text" id="userMessage" placeholder="Ask me anything...">
                <button id="sendButton" onclick="sendMessage()">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    window.toggleChat = function () {
        let chatWindow = document.getElementById("chat-window");
        chatWindow.style.display = chatWindow.style.display === "none" || chatWindow.style.display === "" ? "block" : "none";
    };

    window.sendMessage = function () {
        const userMessage = document.getElementById("userMessage").value.trim();
        const chatBox = document.getElementById("chat-box");
        const typingIndicator = document.getElementById("typing-indicator");

        if (!userMessage) return;

        chatBox.innerHTML += `<p class="message user-message">You: ${userMessage}</p>`;
        document.getElementById("userMessage").value = "";
        typingIndicator.style.display = "block";
        chatBox.scrollTop = chatBox.scrollHeight;

        fetch("https://newchatbot-production.up.railway.app/chat", {  // ✅ Now calls backend
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = "none";
            chatBox.innerHTML += `<p class="message bot-message">Tribal Shaman: ${data.reply}</p>`;

            // ✅ Send interaction data to backend (which logs to Zapier)
            fetch("https://newchatbot-production.up.railway.app/log-to-zapier", {  // ✅ Now logs via backend
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMessage: userMessage,
                    botResponse: data.reply,
                }),
            }).catch(error => console.error("Zapier Logging Error:", error));

            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error("Fetch error:", error);
            typingIndicator.style.display = "none";
            chatBox.innerHTML += `<p class="message bot-message">⚠️ Error: Unable to connect.</p>`;
        });
    };
});
