
const pageNames = {
    dashboard: "Dashboard",
    planner: "Study Planner",
    quiz: "AI Quiz",
    evaluator: "Answer Evaluator",
    progress: "My Progress"
};

let stats = JSON.parse(localStorage.getItem("prepPilotStats")) || {
    quizzes: 0,
    totalScore: 0,
    sessions: 0
};

let activities = JSON.parse(localStorage.getItem("prepPilotActivities")) || [];

function saveData() {
    localStorage.setItem("prepPilotStats", JSON.stringify(stats));
    localStorage.setItem("prepPilotActivities", JSON.stringify(activities));
}

function addActivity(message) {
    activities.unshift(message);
    activities = activities.slice(0, 5);
    saveData();
    updateDashboard();
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    const nav = document.querySelector(`[data-page="${pageId}"]`);
    if (nav) nav.classList.add("active");

    document.getElementById("page-heading").textContent =
        pageNames[pageId];

    if (pageId === "progress") updateDashboard();
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// DASHBOARD

function updateDashboard() {
    const average = stats.quizzes
        ? Math.round(stats.totalScore / stats.quizzes)
        : 0;

    document.getElementById("quiz-count").textContent = stats.quizzes;
    document.getElementById("average-score").textContent = average + "%";
    document.getElementById("session-count").textContent = stats.sessions;

    document.getElementById("progress-quizzes").textContent =
        stats.quizzes;

    document.getElementById("progress-average").textContent =
        average + "%";

    document.getElementById("quiz-bar").style.width =
        Math.min(stats.quizzes * 10, 100) + "%";

    document.getElementById("score-bar").style.width =
        average + "%";

    const activityBox = document.getElementById("recent-activity");

    if (activities.length) {
        activityBox.innerHTML = activities
            .map(item => `<p>✓ ${escapeHTML(item)}</p>`)
            .join("<br>");
    } else {
        activityBox.innerHTML =
            "<span>🌱</span><p>Your learning journey starts here.</p>";
    }

    document.getElementById("progress-message").textContent =
        stats.quizzes
            ? "Keep practicing and aim for consistent improvement!"
            : "Your progress will appear here as you learn.";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// STUDY PLANNER - BACKEND CONNECTION

document.getElementById("plan-btn").addEventListener("click", async () => {

    const subject = document.getElementById("subject").value.trim();
    const topic = document.getElementById("topic").value.trim();
    const hours = Number(document.getElementById("hours").value);
    const duration = Number(document.getElementById("duration").value);

    if (!subject || !topic || !Number.isInteger(hours) ||
        !Number.isInteger(duration) || hours < 1 ||
        hours > 12 || duration < 1 || duration > 30) {
        alert("Please enter valid study details.");
        return;
    }

    const button = document.getElementById("plan-btn");
    const result = document.getElementById("plan-result");

    button.disabled = true;
    button.textContent = "Generating plan...";

    try {
        const response = await fetch("/api/study-plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject,
                topic,
                hours,
                duration
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to generate plan");
        }

        result.classList.remove("hidden");

        result.innerHTML = `
            <h3>${escapeHTML(data.subject)} Study Plan</h3>
            <p>Topic: ${escapeHTML(data.topic)}</p>
            <p>Duration: ${data.totalDays} days</p>
            <p>Daily study time: ${data.dailyHours} hours</p>
            <hr>
            ${data.plan.map(day => `
                <div style="padding:12px 0;border-bottom:1px solid #ddd">
                    <strong>Day ${day.day}</strong>
                    <p>${escapeHTML(day.task)}</p>
                    <small>${day.hours} hours</small>
                </div>
            `).join("")}
            <p><strong>Mode:</strong> ${escapeHTML(data.mode)}</p>
        `;

        stats.sessions++;
        saveData();
        updateDashboard();
        addActivity(`Created ${duration}-day ${subject} study plan`);

    } catch (error) {
        result.classList.remove("hidden");
        result.textContent = "Error: " + error.message;

    } finally {
        button.disabled = false;
        button.textContent = "Generate study plan ✦";
    }
});



// AI QUIZ GENERATOR - LIVE QWEN API

document.getElementById("quiz-btn").addEventListener("click", async () => {
    const subject = document.getElementById("quiz-subject").value.trim();
    const topic = document.getElementById("quiz-topic").value.trim();
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !topic) {
        alert("Please enter a subject and topic.");
        return;
    }

    const button = document.getElementById("quiz-btn");
    const result = document.getElementById("quiz-result");

    button.disabled = true;
    button.textContent = "Generating AI quiz...";
    result.classList.remove("hidden");
    result.textContent = "Qwen is preparing your questions. Please wait...";

    try {
        const response = await fetch("/api/generate-quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ subject, topic, difficulty })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Quiz generation failed.");
        }

        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error("No structured questions were returned by the AI.");
        }

        const questions = data.questions;

        result.innerHTML = `
            <h3>${escapeHTML(subject)}: ${escapeHTML(topic)}</h3>
            <p>Difficulty: ${escapeHTML(difficulty)}</p>
            <p>${questions.length} AI-generated questions</p>

            <form id="quiz-form">
                ${questions.map((q, i) => `
                    <div class="quiz-question" style="margin:20px 0;padding:15px;border-bottom:1px solid #444">
                        <strong>${i + 1}. ${escapeHTML(q.question)}</strong>

                        <div style="margin-top:12px">
                            ${q.options.map((option, j) => `
                                <label style="display:block;margin:10px 0;font-weight:normal">
                                    <input
                                        type="radio"
                                        name="q${i}"
                                        value="${j}"
                                        style="width:auto"
                                        required
                                    >
                                    ${escapeHTML(option)}
                                </label>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}

                <button class="primary-btn" type="submit">
                    Submit answers
                </button>
            </form>

            <div id="quiz-score"></div>
        `;

        document.getElementById("quiz-form").addEventListener("submit", event => {
            event.preventDefault();

            let score = 0;

            const review = questions.map((q, i) => {
                const selected = document.querySelector(
                    `input[name="q${i}"]:checked`
                );

                const selectedIndex = selected ? Number(selected.value) : -1;

                // Supports numeric index, option text, or A/B/C/D answers
                const correct = String(
                    q.correctAnswer ?? q.answer ?? ""
                ).trim();

                const correctIndex = /^\d+$/.test(correct)
                    ? Number(correct)
                    : /^[A-D]$/i.test(correct)
                        ? correct.toUpperCase().charCodeAt(0) - 65
                        : q.options.findIndex(option =>
                            String(option).trim().toLowerCase() === correct.toLowerCase()
                        );

                const isCorrect = selectedIndex === correctIndex;

                if (isCorrect) score++;

                return `
                    <div style="margin:15px 0;padding:12px;border:1px solid #555;border-radius:8px">
                        <strong>${i + 1}. ${isCorrect ? "Correct ✓" : "Incorrect ✗"}</strong>
                        <p>Your answer: ${selectedIndex >= 0
                            ? escapeHTML(q.options[selectedIndex])
                            : "Not answered"}</p>
                        <p>Correct answer: ${
                            correctIndex >= 0 && correctIndex < q.options.length
                                ? escapeHTML(q.options[correctIndex])
                                : escapeHTML(correct)
                        }</p>
                        ${q.explanation
                            ? `<p>Explanation: ${escapeHTML(q.explanation)}</p>`
                            : ""}
                    </div>
                `;
            });

            const percentage = Math.round((score / questions.length) * 100);

            stats.quizzes++;
            stats.totalScore += percentage;

            saveData();
            updateDashboard();
            addActivity(`Completed ${subject} quiz with ${percentage}%`);

            document.getElementById("quiz-score").innerHTML = `
                <h2>Quiz completed!</h2>
                <h1>${score}/${questions.length}</h1>
                <h2>${percentage}%</h2>
                <h3>Answer Review</h3>
                ${review.join("")}
                <button class="primary-btn" id="progress-btn">
                    View my progress
                </button>
            `;

            document.getElementById("progress-btn").addEventListener("click", () => {
                showPage("progress");
            });

            document.querySelectorAll("#quiz-form input").forEach(input => {
                input.disabled = true;
            });

            document.querySelector("#quiz-form button[type='submit']").disabled = true;
        });

    } catch (error) {
        result.textContent = "Error: " + error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Generate AI quiz ✦";
    }
});


// TEMPORARY SAMPLE ANSWER EVALUATOR

// ANSWER EVALUATOR - BACKEND CONNECTION

document.getElementById("evaluate-btn").addEventListener("click", async () => {

    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (!question || !answer) {
        alert("Please enter both question and answer.");
        return;
    }

    const button = document.getElementById("evaluate-btn");
    const result = document.getElementById("evaluation-result");

    button.disabled = true;
    button.textContent = "Evaluating...";

    try {
        const response = await fetch("/api/evaluate-answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question,
                answer
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Evaluation failed");
        }

        result.classList.remove("hidden");

        result.innerHTML = `
    <h3>AI Evaluation Result</h3>
    <h2>Score: ${data.score}/10</h2>
    <p><strong>Word count:</strong> ${data.wordCount}</p>
            <p><strong>Feedback:</strong> ${escapeHTML(data.feedback)}</p>
            <h4>Suggestions for improvement</h4>
            <ul>
                ${data.suggestions.map(item =>
                    `<li>${escapeHTML(item)}</li>`
                ).join("")}
            </ul>
            <p><strong>Mode:</strong> ${escapeHTML(data.mode)}</p>
        `;

        addActivity("Submitted an answer for evaluation");

    } catch (error) {
        result.classList.remove("hidden");
        result.textContent = "Error: " + error.message;

    } finally {
        button.disabled = false;
        button.textContent = "Evaluate my answer ✦";
    }
});



// INITIALIZE

updateDashboard();
