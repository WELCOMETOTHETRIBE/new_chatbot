document.addEventListener("DOMContentLoaded", function () {
    function sendMessage() {
        const userMessage = document.getElementById("userMessage").value.trim();
        const chatBox = document.getElementById("chat-box");
        const typingIndicator = document.getElementById("typing-indicator");

        if (!userMessage) return;

        const userMsgDiv = document.createElement("div");
        userMsgDiv.classList.add("message", "user-message");
        userMsgDiv.textContent = `You: ${userMessage}`;
        chatBox.appendChild(userMsgDiv);

        document.getElementById("userMessage").value = "";
        typingIndicator.style.display = "block";

        fetch("https://taplink-chatbot-production.up.railway.app/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
            typingIndicator.style.display = "none";

            const botMsgDiv = document.createElement("div");
            botMsgDiv.classList.add("message", "bot-message");
            botMsgDiv.textContent = `Bot: ${data.reply}`;
            chatBox.appendChild(botMsgDiv);
        })
        .catch(error => {
            typingIndicator.style.display = "none";
            console.error("Fetch error:", error);
            const errorMsg = document.createElement("div");
            errorMsg.classList.add("message", "bot-message");
            errorMsg.textContent = "⚠️ Error: Unable to connect.";
            chatBox.appendChild(errorMsg);
        });
    }

    document.getElementById("sendButton").addEventListener("click", sendMessage);
});

