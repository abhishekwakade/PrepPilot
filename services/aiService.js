
async function generateAIResponse(prompt) {
    if (process.env.AI_MODE !== "live") {
        return {
            success: true,
            mode: "demo",
            message: "AI service is running in demo mode.",
            prompt
        };
    }

    try {
        const response = await fetch(
            "https://bharatcode.ai/api/model/v1/responses",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.BHARATCODE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "qwen-3.8-27b",
                    input: prompt,
                    store: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || JSON.stringify(data)
            );
        }

        const text = (data.output || [])
            .filter(item => item.type === "message")
            .flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        return {
            success: true,
            mode: "live",
            message: text,
            usage: data.usage
        };

    } catch (error) {
        console.error("BharatCode API Error:", error.message);

        return {
            success: false,
            mode: "live",
            message: error.message
        };
    }
}

module.exports = { generateAIResponse };
