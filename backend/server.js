const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));

// Serve the frontend
app.use(express.static(path.join(__dirname, "..")));

// =========================
// AI CHAT
// =========================
app.post("/api/chat", async (req, res) => {
    try {
        const { message, messages } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        const conversation = Array.isArray(messages)
            ? messages.slice(-20)
            : [
                {
                    role: "user",
                    content: message
                }
            ];

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "X-Title": "WONDERS POWERFUL AI"
                },

                body: JSON.stringify({
                    model: "openai/gpt-5-mini",

                    max_tokens: 1000,

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are WONDERS POWERFUL AI, a helpful, friendly and intelligent AI assistant. Answer questions clearly and accurately. When explaining difficult topics, make them easy to understand."
                        },
                        ...conversation
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OPENROUTER ERROR:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "The AI provider returned an error."
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "WONDERS POWERFUL AI received an empty response."
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("CHAT SERVER ERROR:", error);

        res.status(500).json({
            error:
                error.message ||
                "Something went wrong connecting to WONDERS POWERFUL AI."
        });
    }
});

// =========================
// IMAGE GENERATION
// =========================
app.post("/api/generate-image", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                error: "Image prompt is required."
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/images",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "X-Title": "WONDERS POWERFUL AI"
                },

                body: JSON.stringify({
                    model: "google/gemini-2.5-flash-image"
                    ,
                    prompt: prompt.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("IMAGE GENERATION ERROR:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Image generation failed."
            });
        }

        /*
         * OpenRouter image responses can contain
         * image data in the message content.
         */
        const message = data?.choices?.[0]?.message;

        let imageData = null;

        if (message?.images?.length) {
            const image = message.images[0];

            if (typeof image === "string") {
                imageData = image;
            } else if (image?.image_url?.url) {
                imageData = image.image_url.url;
            }
        }

        if (!imageData && Array.isArray(message?.content)) {
            const imagePart = message.content.find(
                part =>
                    part?.type === "image_url" ||
                    part?.type === "output_image"
            );

            if (imagePart?.image_url?.url) {
                imageData = imagePart.image_url.url;
            }
        }

        if (!imageData) {
            console.error(
                "IMAGE RESPONSE:",
                JSON.stringify(data, null, 2)
            );

            return res.status(500).json({
                error:
                    "The image provider returned no image."
            });
        }

        res.json({
            image: imageData
        });

    } catch (error) {
        console.error("IMAGE SERVER ERROR:", error);

        res.status(500).json({
            error:
                error.message ||
                "Something went wrong generating the image."
        });
    }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `WONDERS POWERFUL AI running on port ${PORT}`
    );
});
