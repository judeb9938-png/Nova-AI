// =========================
// IMAGE EDITING
// =========================
app.post("/api/edit-image", async (req, res) => {
    try {
        const { image, prompt } = req.body;

        if (!image || !prompt) {
            return res.status(400).json({
                error: "Image and editing prompt are required."
            });
        }

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
                    model: "google/gemini-2.5-flash-image",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: image
                                    }
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("IMAGE EDIT ERROR:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Image editing failed."
            });
        }

        const editedImage =
            data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!editedImage) {
            console.error(
                "IMAGE EDIT RESPONSE:",
                JSON.stringify(data, null, 2)
            );

            return res.status(500).json({
                error:
                    "The image provider returned no edited image."
            });
        }

        res.json({
            image: editedImage
        });

    } catch (error) {
        console.error(
            "IMAGE EDIT SERVER ERROR:",
            error
        );

        res.status(500).json({
            error:
                error.message ||
                "Something went wrong editing the image."
        });
    }
});
