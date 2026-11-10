require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// AI routes
const aiRoutes = require("./routes/ai");
app.use("/api", aiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`PrepPilot server running at http://localhost:${PORT}`);
});
