document.addEventListener("DOMContentLoaded", function () {
    // Create Chat Container
    const chatContainer = document.createElement("div");
    chatContainer.id = "chatbot-container";
    chatContainer.innerHTML = `
        <style>
            /* Basic Chatbox Styling */
            #chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                font-family: Arial, sans-serif;
                z-index: 9999;
            }
            #chatbot-button {
                background: #007bff;
                color: white;
                padding: 12px 15px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                font-size: 20px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            }
            #chat-window {
                display: none;
                background: white;
                border-radius: 12px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                flex-direction: column;
            }
            #chat-header {
                background: #007bff;
                color: white;
                padding: 12px;
                text-align: center;
                font-weight: bold;
                cursor: pointer;
            }
            #chat-box {
                height: 300px;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                background: #f4f4f4;
            }
            .message {
                padding: 10px;
                margin: 5px;
                border-radius: 8px;
                max-width: 75%;
            }
            .user-message {
                background: #d1e7dd;
                align-self: flex-end;
            }
            .bot-message {
                background: #f8d7da;
                align-self: flex-start;
            }
            #typing-indicator {
                display: none;
                font-style: italic;
                color: gray;
                padding: 5px;
            }
            #chat-input-area {
                display: flex;
                padding: 10px;
                border-top: 1px solid #ddd;
                background: white;
            }
            #userMessage {
                flex: 1;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 8px;
                font-size: 16px;
            }
            #sendButton {
                padding: 10px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                margin-left: 10px;
                cursor: pointer;
            }
            #sendButton:hover {
                background: #0056b3;
            }
        </style>
        <button id="chatbot-button" onclick="toggleChat()">💬</button>
        <div id="chat-window">
            <div id="chat-header" onclick="toggleChat()">Tribal Shaman Chat ✨</div>
            <div id="chat-box">
                <p class="bot-message">🔮 Ask me anything!</p>
            </div>
            <div id="typing-indicator">🧙 Tribal Shaman is typing...</div>
            <div id="chat-input-area">
                <input type="text" id="userMessage" placeholder="Ask me anything...">
                <button id="sendButton" onclick="sendMessage()">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Toggle Chat Visibility
    window.toggleChat = function () {
        let chatWindow = document.getElementById("chat-window");
        chatWindow.style.display = chatWindow.style.display === "none" || chatWindow.style.display === "" ? "block" : "none";
    };

    // Send Message to Backend
    window.sendMessage = function () {
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

            // ✅ Send interaction data to Zapier via a CORS Proxy
            fetch("https://corsproxy.io/?https://hooks.zapier.com/hooks/catch/17370933/2e1xd58/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    userMessage: userMessage,
                    botResponse: data.reply,
                }),
            }).catch(error => console.error("Zapier Logging Error:", error));

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
    };
});

