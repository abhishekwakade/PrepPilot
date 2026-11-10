const express = require("express");
const router = express.Router();

const { generateAIResponse } = require("../services/aiService");

// 1. QUIZ GENERATOR

router.post("/generate-quiz", async (req, res) => {
    try {
        const { subject, topic, difficulty } = req.body;

        if (!subject?.trim() || !topic?.trim() || !difficulty) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const prompt = `
Create a quiz for the following details:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Generate 5 multiple-choice questions.
Include four options and the correct answer for each question.
`;

        const aiResult = await generateAIResponse(prompt);

        res.json({
            success: true,
            mode: aiResult.mode,
            message: "Quiz request processed successfully!",
            subject,
            topic,
            difficulty,
            aiResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 2. STUDY PLANNER

router.post("/study-plan", async (req, res) => {
    try {
        const { subject, topic, hours, duration } = req.body;

        if (
            !subject?.trim() ||
            !topic?.trim() ||
            !Number.isInteger(Number(hours)) ||
            !Number.isInteger(Number(duration)) ||
            Number(hours) < 1 ||
            Number(hours) > 12 ||
            Number(duration) < 1 ||
            Number(duration) > 30
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid study details."
            });
        }

        const prompt = `
Create a personalized ${duration}-day study plan.

Subject: ${subject}
Topic: ${topic}
Daily study time: ${hours} hours.

Provide a structured daily schedule with specific learning tasks.
`;

        const aiResult = await generateAIResponse(prompt);

        // Temporary schedule for demo mode
        const tasks = [
            "Understand the fundamentals",
            "Study important concepts",
            "Practice basic questions",
            "Solve intermediate problems",
            "Practice advanced problems",
            "Revise important concepts",
            "Take a practice assessment"
        ];

        const plan = [];

        for (let i = 0; i < Number(duration); i++) {
            plan.push({
                day: i + 1,
                topic: topic.trim(),
                task: tasks[i % tasks.length],
                hours: Number(hours)
            });
        }

        res.json({
            success: true,
            mode: aiResult.mode,
            subject,
            topic,
            totalDays: Number(duration),
            dailyHours: Number(hours),
            plan,
            aiResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 3. ANSWER EVALUATOR

router.post("/evaluate-answer", async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question?.trim() || !answer?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question and answer are required."
            });
        }

        const prompt = `
Evaluate the following student's answer.

Question: ${question}

Student's answer: ${answer}

Provide:
1. A score out of 10.
2. Feedback on correctness.
3. Missing important points.
4. Suggestions for improvement.
`;

        const aiResult = await generateAIResponse(prompt);

        // Temporary demo evaluation
        const wordCount = answer.trim().split(/\s+/).length;

        res.json({
            success: true,
            mode: aiResult.mode,
            question,
            wordCount,
            feedback: "Your answer has been received successfully.",
            suggestions: [
                "Use clear and structured explanations.",
                "Include relevant examples.",
                "Cover all important points in the question."
            ],
            aiResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 4. AI SERVICE TEST

router.post("/ai-test", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required."
            });
        }

        const result = await generateAIResponse(prompt);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;