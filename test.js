
require("dotenv").config();

async function testBharatCode() {
    console.log("Starting BharatCode API test...");

    try {
        const apiKey = process.env.BHARATCODE_API_KEY;

        if (!apiKey) {
            throw new Error("API key not found in .env file!");
        }

        console.log("API key loaded successfully.");
        console.log("Sending request...");

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
                    input: "Say hello from BharatCode",
                    store: false
                })
            }
        );

        console.log("HTTP Status:", response.status);

        const data = await response.json();

        console.log("AI Response:");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Something went wrong:", error.message);
    }
}

testBharatCode();
