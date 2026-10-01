document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================= */

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


    /* =========================
       AI TOOLS
    ========================= */

    const attachBtn =
        document.getElementById("attachBtn");

    const toolsMenu =
        document.getElementById("toolsMenu");

    const createImageBtn =
        document.getElementById("createImageBtn");

    const editImageBtn =
        document.getElementById("editImageBtn");

    const uploadFileBtn =
        document.getElementById("uploadFileBtn");


    /* =========================
       IMAGE GENERATOR
    ========================= */

    const imageModal =
        document.getElementById("imageModal");

    const closeImageModal =
        document.getElementById("closeImageModal");

    const imagePrompt =
        document.getElementById("imagePrompt");

    const generateImageBtn =
        document.getElementById("generateImageBtn");

    const imageGenerationStatus =
        document.getElementById("imageGenerationStatus");

    const generatedImageContainer =
        document.getElementById(
            "generatedImageContainer"
        );


    /* =========================
       STATE
    ========================= */

    let conversation = [];

    let chatBusy = false;

    let imageBusy = false;


    /* =========================
       CHAT
    ========================= */

    async function sendMessage() {

        if (chatBusy) return;

        const text =
            messageInput.value.trim();

        if (!text) return;


        chatBusy = true;

        sendBtn.disabled = true;

        welcome.style.display = "none";


        addMessage(
            text,
            "user"
        );


        messageInput.value = "";

        resizeInput();


        conversation.push({
            role: "user",
            content: text
        });


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


            if (
                thinking &&
                thinking.isConnected
            ) {
                thinking.remove();
            }


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
                    "WONDERS POWERFUL AI returned an empty response."
                );

            }


            addMessage(
                reply,
                "nova"
            );


            conversation.push({
                role: "assistant",
                content: reply
            });


            updateHistory(text);


        } catch (error) {

            console.error(
                "CHAT ERROR:",
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

            chatBusy = false;

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
                : "WONDERS POWERFUL AI";


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
       THINKING
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
                    WONDERS POWERFUL AI
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


        /*
         * CODE BLOCKS
         */

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


        /*
         * BOLD
         */

        html =
            html.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        /*
         * ITALIC
         */

        html =
            html.replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            );


        /*
         * NEWLINES
         */

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
                button
                    .parentElement
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

            }

        }
    );


    /* =========================
       TEXTAREA RESIZE
    ========================= */

    function resizeInput() {

        messageInput.style.height =
            "auto";


        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                160
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

    quickCards.forEach(
        card => {

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

        }
    );


    /* =========================
       TOOLS MENU
    ========================= */

    if (
        attachBtn &&
        toolsMenu
    ) {

        attachBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toolsMenu.classList.toggle(
                    "open"
                );

            }
        );


        toolsMenu.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            () => {

                toolsMenu.classList.remove(
                    "open"
                );

            }
        );

    }


    /* =========================
       IMAGE MODAL
    ========================= */

    function openImageModal() {

        if (!imageModal) return;


        imageModal.classList.add(
            "open"
        );


        imagePrompt.value = "";

        imageGenerationStatus.textContent =
            "";

        generatedImageContainer.innerHTML =
            "";


        setTimeout(() => {

            imagePrompt.focus();

        }, 100);

    }


    function closeImageModalWindow() {

        if (!imageModal) return;

        imageModal.classList.remove(
            "open"
        );

    }


    /* =========================
       CREATE IMAGE
    ========================= */

    if (createImageBtn) {

        createImageBtn.addEventListener(
            "click",
            () => {

                toolsMenu.classList.remove(
                    "open"
                );

                openImageModal();

            }
        );

    }


    /* =========================
       CLOSE IMAGE MODAL
    ========================= */

    if (closeImageModal) {

        closeImageModal.addEventListener(
            "click",
            closeImageModalWindow
        );

    }


    if (imageModal) {

        imageModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === imageModal
                ) {

                    closeImageModalWindow();

                }

            }
        );

    }


    /* =========================
       GENERATE IMAGE
    ========================= */

    async function generateImage() {

        if (imageBusy) return;


        const prompt =
            imagePrompt.value.trim();


        if (!prompt) {

            imageGenerationStatus.textContent =
                "Describe the image you want first.";

            imagePrompt.focus();

            return;

        }


        imageBusy = true;

        generateImageBtn.disabled = true;


        imageGenerationStatus.textContent =
            "Creating your image...";


        generatedImageContainer.innerHTML =
            "";


        try {

            const response =
                await fetch(
                    "/api/generate-image",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                prompt
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


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `Image generation failed (${response.status})`
                );

            }


            if (!data.image) {

                throw new Error(
                    "The AI returned no image."
                );

            }


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                data.image;

            image.alt =
                prompt;

            image.className =
                "generated-image";


            generatedImageContainer.appendChild(
                image
            );


            imageGenerationStatus.textContent =
                "Image created successfully.";


        } catch (error) {

            console.error(
                "IMAGE ERROR:",
                error
            );


            imageGenerationStatus.textContent =
                "⚠️ " +
                error.message;


        } finally {

            imageBusy = false;

            generateImageBtn.disabled =
                false;

        }

    }


    if (generateImageBtn) {

        generateImageBtn.addEventListener(
            "click",
            generateImage
        );

    }


    /* =========================
       IMAGE ENTER
    ========================= */

    if (imagePrompt) {

        imagePrompt.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    event.ctrlKey
                ) {

                    event.preventDefault();

                    generateImage();

                }

            }
        );

    }


    /* =========================
       EDIT IMAGE
    ========================= */

    if (editImageBtn) {

        editImageBtn.addEventListener(
            "click",
            () => {

                toolsMenu.classList.remove(
                    "open"
                );


                alert(
                    "Image editing will be connected next."
                );

            }
        );

    }


    /* =========================
       FILE UPLOAD
    ========================= */

    if (uploadFileBtn) {

        uploadFileBtn.addEventListener(
            "click",
            () => {

                toolsMenu.classList.remove(
                    "open"
                );


                alert(
                    "File uploads will be connected next."
                );

            }
        );

    }


    /* =========================
       NEW CHAT
    ========================= */

    function startNewChat() {

        conversation = [];

        messages.innerHTML =
            "";

        welcome.style.display =
            "flex";

        messageInput.value =
            "";

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


    /* =========================
       INITIALIZE
    ========================= */

    resizeInput();

    messageInput.focus();


    console.log(
        "WONDERS POWERFUL AI loaded successfully."
    );

});
