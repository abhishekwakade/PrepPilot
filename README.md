# PrepPilot — Your AI-Powered Personalized Learning Assistant

**Plan your learning. Practice your knowledge. Improve with feedback.**

PrepPilot is a personalized learning assistant for students. It brings study planning, quiz-based practice, written-answer feedback, and progress tracking into one web application.

## Features

### Study Planner
- Create a study schedule using a subject, topic, daily study hours, and duration.
- View structured day-by-day learning tasks.

### Quiz Generator
- Generate topic-focused multiple-choice practice.
- Choose a difficulty level.
- Review correct answers and explanations after completing a quiz.

### Answer Evaluator
- Submit a written answer to an academic question.
- Receive a score, feedback, and improvement suggestions.

### Progress Dashboard
- Track quiz attempts, average quiz score, study sessions, and recent activity.
- Current browser-side progress is stored in local storage.

## Adaptive learning roadmap

PrepPilot's next milestone is an adaptive learning loop:

1. Capture performance by quiz topic or concept.
2. Identify topics where the learner needs more practice.
3. Recommend targeted revision and follow-up questions.
4. Use later quiz results to show whether understanding improved.

This adaptive workflow is a planned enhancement, not a claim that it is already implemented in the current public repository snapshot.

## Technology

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express
- **AI provider/model:** BharatCode API with Qwen 3.8 27B (tested in the developer's local working copy; repository synchronization pending)

## Project structure

```text
PrepPilot/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── routes/
│   └── ai.js
├── services/
│   └── aiService.js
├── server.js
├── package.json
└── .gitignore
```

## Setup

### Prerequisites
- Node.js with npm
- A BharatCode API key with student API access enabled for live mode

### Install dependencies

```bash
git clone https://github.com/abhishekwakade/PrepPilot.git
cd PrepPilot
npm install
```

### Configure environment

Create a `.env` file in the project root:

```env
AI_MODE=live
BHARATCODE_API_KEY=your_api_key_here
```

Do not commit `.env`, paste API keys into frontend files, or share keys in screenshots.

### Start the server

```bash
node server.js
```

Open `http://localhost:5000` in your browser.

> The setup steps above describe the intended live configuration. Confirm that the latest live-integration code has been pushed before relying on the public repository as a ready-to-run live demo.

## Architecture

```text
Browser (public/)
       |
       v
Express server (server.js)
       |
       v
AI routes (routes/ai.js)
       |
       v
AI service (services/aiService.js)
       |
       v
BharatCode API / Qwen 3.8 27B
```

The API key belongs on the server in an environment variable. Browser code should call the local Express endpoints and must never contain the secret key.

## Planned improvements

- [ ] Adaptive weak-topic detection from quiz attempts
- [ ] Targeted revision recommendations
- [ ] Persistent learner profiles and progress across devices
- [ ] Improved analytics and learning history
- [ ] Demo video and application screenshots

## Developer

**Abhishek Wakade**  
Computer Engineering Student  
Bharati Vidyapeeth College of Engineering, Pune

Built for **BharatCode Build League 2026**.

Repository: https://github.com/abhishekwakade/PrepPilot
