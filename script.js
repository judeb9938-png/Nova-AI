document.addEventListener("DOMContentLoaded", () => {

    const messageInput =
        document.getElementById("messageInput");

    const sendBtn =
        document.getElementById("sendBtn");

    const messages =
        document.getElementById("messages");

    const welcome =
        document.getElementById("welcome");

    const newChatBtn =
        document.getElementById("newChatBtn");

    const clearBtn =
        document.getElementById("clearBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("overlay");

    const chatHistory =
        document.getElementById("chatHistory");

    const quickCards =
        document.querySelectorAll(".quick-card");


    let conversation = [];
    let busy = false;


    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {

        if (busy) return;

        const text =
            messageInput.value.trim();

        if (!text) return;


        busy = true;

        sendBtn.disabled = true;


        // Hide welcome screen
        welcome.style.display = "none";


        // Add user message
        addMessage(
            text,
            "user"
        );


        // Clear input
        messageInput.value = "";

        resizeInput();


        // Save conversation
        conversation.push({
            role: "user",
            content: text
        });


        // Add thinking message
        const thinking =
            addThinking();


        try {

            const response =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message: text,
                                messages:
                                    conversation
                            })
                    }
                );


            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let data;


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                data = {
                    error:
                        await response.text()
                };

            }


            // Remove thinking
            thinking.remove();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `Server error (${response.status})`
                );

            }


            const reply =
                data.reply;


            if (!reply) {

                throw new Error(
                    "Nova AI returned an empty response."
                );

            }


            // Add Nova response
            addMessage(
                reply,
                "nova"
            );


            // Save Nova response
            conversation.push({
                role: "assistant",
                content: reply
            });


            updateHistory(text);


        } catch (error) {

            console.error(
                "Nova error:",
                error
            );


            if (
                thinking &&
                thinking.isConnected
            ) {
                thinking.remove();
            }


            addMessage(
                "⚠️ " +
                error.message,
                "nova"
            );

        } finally {

            busy = false;

            sendBtn.disabled = false;

            messageInput.focus();

        }

    }


    /* =========================
       ADD MESSAGE
    ========================= */

    function addMessage(
        text,
        sender
    ) {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            `message ${sender}`;


        const avatar =
            document.createElement(
                "div"
            );

        avatar.className =
            "avatar";

        avatar.textContent =
            sender === "user"
                ? "W"
                : "✦";


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "message-content";


        const name =
            document.createElement(
                "div"
            );

        name.className =
            "message-name";

        name.textContent =
            sender === "user"
                ? "You"
                : "Nova AI";


        const messageText =
            document.createElement(
                "div"
            );

        messageText.className =
            "message-text";


        if (sender === "nova") {

            messageText.innerHTML =
                formatAIResponse(text);

        } else {

            messageText.textContent =
                text;

        }


        content.appendChild(name);

        content.appendChild(
            messageText
        );


        message.appendChild(
            avatar
        );

        message.appendChild(
            content
        );


        messages.appendChild(
            message
        );


        scrollChat();


        return message;

    }


    /* =========================
       THINKING INDICATOR
    ========================= */

    function addThinking() {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "message nova";


        message.innerHTML = `
            <div class="avatar">✦</div>

            <div class="message-content">

                <div class="message-name">
                    Nova AI
                </div>

                <div class="message-text">

                    <div class="thinking">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                </div>

            </div>
        `;


        messages.appendChild(
            message
        );


        scrollChat();


        return message;

    }


    /* =========================
       FORMAT AI RESPONSE
    ========================= */

    function formatAIResponse(text) {

        let html =
            escapeHTML(text);


        // Code blocks
        html =
            html.replace(
                /```([\s\S]*?)```/g,
                (match, code) => {

                    const safeCode =
                        code.trim();

                    return `
                        <div class="code-container">

                            <button
                                class="copy-code"
                                type="button"
                            >
                                Copy
                            </button>

                            <pre><code>${safeCode}</code></pre>

                        </div>
                    `;

                }
            );


        // Bold
        html =
            html.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        // Italic
        html =
            html.replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            );


        // Line breaks
        html =
            html.replace(
                /\n/g,
                "<br>"
            );


        return html;

    }


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text;

        return div.innerHTML;

    }


    /* =========================
       COPY CODE
    ========================= */

    document.addEventListener(
        "click",
        async (event) => {

            if (
                !event.target.classList.contains(
                    "copy-code"
                )
            ) {
                return;
            }


            const button =
                event.target;


            const code =
                button.parentElement
                    .querySelector("code")
                    .innerText;


            try {

                await navigator.clipboard
                    .writeText(code);


                button.textContent =
                    "Copied!";


                setTimeout(() => {

                    button.textContent =
                        "Copy";

                }, 1500);


            } catch {

                button.textContent =
                    "Failed";


                setTimeout(() => {

                    button.textContent =
                        "Copy";

                }, 1500);

            }

        }
    );


    /* =========================
       INPUT SIZE
    ========================= */

    function resizeInput() {

        messageInput.style.height =
            "auto";


        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                180
            ) + "px";

    }


    /* =========================
       SCROLL
    ========================= */

    function scrollChat() {

        setTimeout(() => {

            const chat =
                document.getElementById(
                    "chatArea"
                );


            chat.scrollTo({
                top:
                    chat.scrollHeight,
                behavior:
                    "smooth"
            });

        }, 40);

    }


    /* =========================
       ENTER TO SEND
    ========================= */

    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    messageInput.addEventListener(
        "input",
        resizeInput
    );


    sendBtn.addEventListener(
        "click",
        sendMessage
    );


    /* =========================
       QUICK PROMPTS
    ========================= */

    quickCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const prompt =
                    card.dataset.prompt;


                messageInput.value =
                    prompt;


                resizeInput();

                messageInput.focus();

            }
        );

    });


    /* =========================
       NEW CHAT
    ========================= */

    function startNewChat() {

        conversation = [];

        messages.innerHTML = "";

        welcome.style.display =
            "flex";

        messageInput.value = "";

        resizeInput();

        messageInput.focus();

    }


    newChatBtn.addEventListener(
        "click",
        () => {

            startNewChat();

            closeMobileMenu();

        }
    );


    clearBtn.addEventListener(
        "click",
        startNewChat
    );


    /* =========================
       MOBILE MENU
    ========================= */

    function openMobileMenu() {

        sidebar.classList.add(
            "open"
        );

        overlay.classList.add(
            "open"
        );

    }


    function closeMobileMenu() {

        sidebar.classList.remove(
            "open"
        );

        overlay.classList.remove(
            "open"
        );

    }


    menuBtn.addEventListener(
        "click",
        openMobileMenu
    );


    overlay.addEventListener(
        "click",
        closeMobileMenu
    );


    /* =========================
       CHAT HISTORY
    ========================= */

    function updateHistory(text) {

        const empty =
            chatHistory.querySelector(
                ".history-empty"
            );


        if (empty) {
            empty.remove();
        }


        if (
            chatHistory.children.length >= 8
        ) {
            chatHistory.lastElementChild
                .remove();
        }


        const item =
            document.createElement(
                "button"
            );


        item.className =
            "history-item";


        item.textContent =
            text;


        item.title =
            text;


        chatHistory.prepend(
            item
        );

    }


    // Initial focus
    messageInput.focus();


    console.log(
        "Nova AI frontend loaded successfully."
    );

});
