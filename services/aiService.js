
const AI_MODE = process.env.AI_MODE || "demo";

async function generateAIResponse(prompt) {

    // Temporary demo mode
    if (AI_MODE === "demo") {
        return {
            success: true,
            mode: "demo",
            message: "AI service is running successfully!",
            prompt
        };
    }

    // BharatCode API mode
    const apiKey = process.env.BHARATCODE_API_KEY;

    if (!apiKey) {
        throw new Error("BharatCode API key is missing.");
    }

    const response = await fetch(
        "https://bharatcode.ai/api/model/v1/responses",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
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
            data.error?.message || "BharatCode API request failed."
        );
    }

    return {
        success: true,
        mode: "live",
        data
    };
}

module.exports = { generateAIResponse };
