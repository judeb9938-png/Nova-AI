const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));

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
                    "X-Title": "Nova AI"
                },

                body: JSON.stringify({
                    model: "openai/gpt-5-mini",

                    max_tokens: 1000,

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Nova AI, a helpful, friendly and intelligent AI assistant. Answer questions clearly and accurately. When explaining difficult topics, make them easy to understand."
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
                error: "Nova AI received an empty response."
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error:
                error.message ||
                "Something went wrong connecting to Nova AI."
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Nova AI running on http://localhost:${PORT}`
    );
});
