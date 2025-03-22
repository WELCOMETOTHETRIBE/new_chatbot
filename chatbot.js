document.addEventListener("DOMContentLoaded", function () {
    // Ensure chat container exists
    let chatContainer = document.getElementById("chatbot-widget");
    if (!chatContainer) {
        console.error("Chatbot container not found!");
        return;
    }

    // Insert Chat UI
    chatContainer.innerHTML = `
        <style>
            #chat-window { display: none; background: white; border-radius: 8px; padding: 15px; }
            #chat-header { background: #007bff; color: white; padding: 12px; text-align: center; font-weight: bold; cursor: pointer; }
            #chat-box { height: 250px; overflow-y: auto; padding: 10px; background: #f4f4f4; }
            .message { padding: 10px; margin: 5px; border-radius: 8px; max-width: 75%; }
            .user-message { background: #d1e7dd; align-self: flex-end; }
            .bot-message { background: #f8d7da; align-self: flex-start; }
            #typing-indicator { display: none; font-style: italic; color: gray; padding: 5px; }
            #chat-input-area { display: flex; padding: 10px; border-top: 1px solid #ddd; background: white; }
            #userMessage { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }
            #sendButton { padding: 10px; background: #007bff; color: white; border: none; border-radius: 8px; margin-left: 10px; cursor: pointer; }
            #sendButton:hover { background: #0056b3; }
        </style>
        <div id="chat-header" onclick="toggleChat()">Tribal Shaman Chat</div>
        <div id="chat-window">
            <div id="chat-box"><p class="bot-message">🔮 Ask me anything!</p></div>
            <div id="typing-indicator">🧙 Tribal Shaman is typing...</div>
            <div id="chat-input-area">
                <input type="text" id="userMessage" placeholder="Ask me anything...">
                <button id="sendButton">Send</button>
            </div>
        </div>
    `;

    // Toggle Chat Visibility
    window.toggleChat = function () {
        let chatWindow = document.getElementById("chat-window");
        chatWindow.style.display = chatWindow.style.display === "none" || chatWindow.style.display === "" ? "block" : "none";
    };

    // Handle Sending Messages
    document.getElementById("sendButton").addEventListener("click", function () {
        const userMessage = document.getElementById("userMessage").value.trim();
        const chatBox = document.getElementById("chat-box");
        const typingIndicator = document.getElementById("typing-indicator");

        if (!userMessage) return;

        const userMsgDiv = document.createElement("p");
        userMsgDiv.classList.add("message", "user-message");
        userMsgDiv.textContent = `You: ${userMessage}`;
        chatBox.appendChild(userMsgDiv);

        document.getElementById("userMessage").value = "";
        typingIndicator.style.display = "block";
        chatBox.scrollTop = chatBox.scrollHeight;

        fetch("https://taplink-chatbot-production.up.railway.app/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = "none";

            const botMsgDiv = document.createElement("p");
            botMsgDiv.classList.add("message", "bot-message");
            botMsgDiv.textContent = `Tribal Shaman: ${data.reply}`;
            chatBox.appendChild(botMsgDiv);

            // Send interaction data to Zapier for logging
            fetch("https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    userMessage: userMessage,
                    botResponse: data.reply,
                }),
            });

            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error("Fetch error:", error);
            typingIndicator.style.display = "none";
            const errorMsg = document.createElement("p");
            errorMsg.classList.add("message", "bot-message");
            errorMsg.textContent = "⚠️ Error: Unable to connect.";
            chatBox.appendChild(errorMsg);
        });
    });
});

