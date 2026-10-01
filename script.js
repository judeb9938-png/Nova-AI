const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const newChatBtn = document.getElementById("newChatBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");


// Send message
function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    // Hide welcome screen
    welcome.style.display = "none";

    // Add user message
    addMessage(text, "user");

    // Clear input
    messageInput.value = "";

    resizeInput();

    // Temporary frontend response
    setTimeout(() => {

        addMessage(
            "Nova AI is ready. The real AI connection will be added in the next step.",
            "nova"
        );

    }, 700);
}


// Add message to chat
function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className = `message ${sender}`;

    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        sender === "user" ? "W" : "N";

    const content = document.createElement("div");

    content.className = "message-content";

    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent =
        sender === "user" ? "You" : "Nova AI";

    const messageText = document.createElement("div");

    messageText.className = "message-text";

    messageText.textContent = text;

    content.appendChild(name);
    content.appendChild(messageText);

    message.appendChild(avatar);
    message.appendChild(content);

    messages.appendChild(message);

    scrollChat();
}


// Send button
sendBtn.addEventListener(
    "click",
    sendMessage
);


// Enter key
messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


// Auto resize textarea
messageInput.addEventListener(
    "input",
    resizeInput
);


function resizeInput() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


// Scroll chat
function scrollChat() {

    const chatArea =
        document.getElementById("chatArea");

    setTimeout(() => {

        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        });

    }, 50);
}


// New chat
newChatBtn.addEventListener(
    "click",
    function() {

        messages.innerHTML = "";

        welcome.style.display = "block";

        messageInput.value = "";

        resizeInput();
    }
);


// Mobile menu
menuBtn.addEventListener(
    "click",
    function() {

        if (
            sidebar.style.display === "block"
        ) {

            sidebar.style.display = "none";

        } else {

            sidebar.style.display = "block";
        }

    }
);
