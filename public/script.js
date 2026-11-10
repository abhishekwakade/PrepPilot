
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


// TEMPORARY SAMPLE QUIZ GENERATOR

const sampleQuestions = [
    {
        question: "Which data structure follows LIFO?",
        options: ["Queue", "Stack", "Array", "Tree"],
        answer: 1
    },
    {
        question: "Which keyword is used to create an object in Java?",
        options: ["new", "class", "static", "void"],
        answer: 0
    },
    {
        question: "What is the time complexity of accessing an array element by index?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        answer: 2
    }
];

document.getElementById("quiz-btn").addEventListener("click", () => {
    const subject = document.getElementById("quiz-subject").value.trim();
    const topic = document.getElementById("quiz-topic").value.trim();
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !topic) {
        alert("Please enter a subject and topic.");
        return;
    }

    const result = document.getElementById("quiz-result");
    result.classList.remove("hidden");

    result.innerHTML = `
        <h3>${escapeHTML(subject)}: ${escapeHTML(topic)}</h3>
        <p>Difficulty: ${difficulty}</p>
        <p><strong>Sample practice questions</strong></p>
        <form id="quiz-form">
            ${sampleQuestions.map((q, i) => `
                <div style="margin:18px 0">
                    <strong>${i + 1}. ${escapeHTML(q.question)}</strong>
                    ${q.options.map((option, j) => `
                        <label style="display:block;font-weight:normal">
                            <input type="radio" name="q${i}" value="${j}"
                                style="width:auto" required>
                            ${escapeHTML(option)}
                        </label>
                    `).join("")}
                </div>
            `).join("")}
            <button class="primary-btn" type="submit">Submit answers</button>
        </form>
    `;

    document.getElementById("quiz-form").addEventListener("submit", event => {
        event.preventDefault();

        let score = 0;

        sampleQuestions.forEach((q, i) => {
            const selected = document.querySelector(
                `input[name="q${i}"]:checked`
            );

            if (selected && Number(selected.value) === q.answer) {
                score++;
            }
        });

        const percentage = Math.round(
            (score / sampleQuestions.length) * 100
        );

        stats.quizzes++;
        stats.totalScore += percentage;

        saveData();
        updateDashboard();

        addActivity(`Completed ${subject} quiz with ${percentage}%`);

        result.innerHTML += `
            <h3>Quiz completed!</h3>
            <p>Your score: ${score}/${sampleQuestions.length}</p>
            <h2>${percentage}%</h2>
            <button class="primary-btn" onclick="showPage('progress')">
                View progress
            </button>
        `;
    });
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
            <h3>Answer received successfully!</h3>
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
