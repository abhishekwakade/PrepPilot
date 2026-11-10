
const express = require("express");
const router = express.Router();

const { generateAIResponse } = require("../services/aiService");

// Helper: convert Qwen's JSON text into a JavaScript object
function parseAIJson(text) {
    if (!text || typeof text !== "string") {
        throw new Error("AI returned an empty response.");
    }

    // Remove optional Markdown code fences
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        // Try extracting the first complete JSON object
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
            throw new Error("AI response was not valid JSON.");
        }

        return JSON.parse(cleaned.substring(start, end + 1));
    }
}


// 1. QUIZ GENERATOR

router.post("/generate-quiz", async (req, res) => {
    try {
        const { subject, topic, difficulty } = req.body;

        if (!subject?.trim() || !topic?.trim() || !difficulty?.trim()) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const prompt = `
You are an expert educational quiz creator.

Create exactly 5 multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact correct option",
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- Exactly 5 questions.
- Exactly 4 options per question.
- One correct answer per question.
- Ensure the correctAnswer exactly matches one option.
- No Markdown or text outside JSON.
`;

        const aiResult = await generateAIResponse(prompt);

        if (!aiResult.success || aiResult.mode !== "live") {
            throw new Error(aiResult.message || "Live AI generation failed.");
        }

        const result = parseAIJson(aiResult.message);

        if (
            !Array.isArray(result.questions) ||
            result.questions.length !== 5 ||
            result.questions.some(q =>
                !q.question ||
                !Array.isArray(q.options) ||
                q.options.length !== 4 ||
                !q.options.includes(q.correctAnswer) ||
                !q.explanation
            )
        ) {
            throw new Error("AI returned an invalid quiz structure. Please try again.");
        }

        res.json({
            success: true,
            mode: "live",
            message: "Your AI-generated quiz is ready!",
            subject,
            topic,
            difficulty,
            questions: result.questions,
            usage: aiResult.usage
        });

    } catch (error) {
        console.error("Quiz Error:", error.message);

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

        const dailyHours = Number(hours);
        const totalDays = Number(duration);

        if (
            !subject?.trim() ||
            !topic?.trim() ||
            !Number.isInteger(dailyHours) ||
            !Number.isInteger(totalDays) ||
            dailyHours < 1 ||
            dailyHours > 12 ||
            totalDays < 1 ||
            totalDays > 30
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid study details."
            });
        }

        const prompt = `
You are an expert academic study planner.

Create a personalized ${totalDays}-day study plan.

Subject: ${subject}
Topic: ${topic}
Daily study time: ${dailyHours} hours.

Return ONLY valid JSON in this format:
{
  "plan": [
    {
      "day": 1,
      "topic": "Specific subtopic",
      "task": "Detailed learning activity",
      "hours": ${dailyHours}
    }
  ]
}

Rules:
- Generate exactly ${totalDays} days.
- Each day must have a specific learning task.
- Arrange topics in a logical learning order.
- Include practice and revision where appropriate.
- No Markdown or text outside JSON.
`;

        const aiResult = await generateAIResponse(prompt);

        if (!aiResult.success || aiResult.mode !== "live") {
            throw new Error(aiResult.message || "Live AI generation failed.");
        }

        const result = parseAIJson(aiResult.message);

        if (
            !Array.isArray(result.plan) ||
            result.plan.length !== totalDays ||
            result.plan.some((day, index) =>
                !day.topic ||
                !day.task ||
                Number(day.day) !== index + 1
            )
        ) {
            throw new Error("AI returned an invalid study plan. Please try again.");
        }

        const plan = result.plan.map(day => ({
            day: Number(day.day),
            topic: day.topic,
            task: day.task,
            hours: dailyHours
        }));

        res.json({
            success: true,
            mode: "live",
            message: "Your personalized AI study plan is ready!",
            subject,
            topic,
            totalDays,
            dailyHours,
            plan,
            usage: aiResult.usage
        });

    } catch (error) {
        console.error("Study Plan Error:", error.message);

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
You are a fair and helpful academic answer evaluator.

Evaluate the student's answer.

Question:
${question}

Student's answer:
${answer}

Return ONLY valid JSON in this format:
{
  "score": 8,
  "feedback": "Detailed feedback about the answer.",
  "suggestions": [
    "Suggestion one",
    "Suggestion two",
    "Suggestion three"
  ]
}

Rules:
- Score must be a number between 0 and 10.
- Evaluate correctness and relevance.
- Identify missing important points.
- Give constructive improvement suggestions.
- Be fair. Do not award marks for incorrect information.
- No Markdown or text outside JSON.
`;

        const aiResult = await generateAIResponse(prompt);

        if (!aiResult.success || aiResult.mode !== "live") {
            throw new Error(aiResult.message || "Live AI evaluation failed.");
        }

        const result = parseAIJson(aiResult.message);

        if (
            typeof result.score !== "number" ||
            result.score < 0 ||
            result.score > 10 ||
            !result.feedback ||
            !Array.isArray(result.suggestions)
        ) {
            throw new Error("AI returned an invalid evaluation. Please try again.");
        }

        const wordCount = answer.trim().split(/\s+/).length;

        res.json({
            success: true,
            mode: "live",
            question,
            wordCount,
            score: result.score,
            feedback: result.feedback,
            suggestions: result.suggestions,
            usage: aiResult.usage
        });

    } catch (error) {
        console.error("Evaluation Error:", error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});




// 5. ADAPTIVE REVISION RECOMMENDATIONS
router.post("/recommend-revision", async (req, res) => {
    try {
        const { subject, topic, incorrectAnswers } = req.body;

        if (
            !subject?.trim() ||
            !topic?.trim() ||
            !Array.isArray(incorrectAnswers) ||
            incorrectAnswers.length === 0 ||
            incorrectAnswers.length > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Subject, topic, and 1–5 incorrect answers are required."
            });
        }

        const safeAnswers = incorrectAnswers.map((item, index) => ({
            question: String(item.question || "").slice(0, 500),
            studentAnswer: String(item.studentAnswer || "Not answered").slice(0, 300),
            correctAnswer: String(item.correctAnswer || "").slice(0, 300),
            explanation: String(item.explanation || "").slice(0, 500)
        }));

        const prompt = `
You are an adaptive learning coach.

A student completed a quiz and got some questions wrong.

Subject: ${subject}
Quiz topic: ${topic}
Incorrect answers:
${JSON.stringify(safeAnswers, null, 2)}

Identify the underlying concepts the student should revise.

Return ONLY valid JSON in this format:
{
  "weakConcepts": ["Concept needing revision"],
  "revisionTasks": ["Specific action the student should take"],
  "practiceAdvice": "One short, encouraging next step"
}

Rules:
- Give 1–3 weak concepts.
- Give 2–3 practical revision tasks.
- Base recommendations only on the supplied questions and explanations.
- Keep advice specific to this student's mistakes.
- No Markdown or text outside JSON.
`;

        const aiResult = await generateAIResponse(prompt);

        if (!aiResult.success || aiResult.mode !== "live") {
            throw new Error(aiResult.message || "Revision recommendation failed.");
        }

        const result = parseAIJson(aiResult.message);

        if (
            !Array.isArray(result.weakConcepts) ||
            !Array.isArray(result.revisionTasks) ||
            typeof result.practiceAdvice !== "string"
        ) {
            throw new Error("AI returned an invalid revision recommendation.");
        }

        res.json({
            success: true,
            mode: "live",
            weakConcepts: result.weakConcepts.slice(0, 3),
            revisionTasks: result.revisionTasks.slice(0, 3),
            practiceAdvice: result.practiceAdvice
        });
    } catch (error) {
        console.error("Revision Recommendation Error:", error.message);
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
