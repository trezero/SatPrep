import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { initDb } from "./db/schema";
import { seedDatabase } from "./db/seed";
import { createUserRoutes } from "./routes/users";
import { createSchoolRoutes } from "./routes/schools";
import { createPracticeRoutes } from "./routes/practice";
import { createPsatRoutes } from "./routes/psat";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = initDb();
seedDatabase(db);

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Routes
app.use("/api/users", createUserRoutes(db));
app.use("/api/schools", createSchoolRoutes(db));
app.use("/api/practice", createPracticeRoutes(db));
app.use("/api/psat", createPsatRoutes(db));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🎯 SAT Prep Server Running        ║
  ║   Port: ${PORT}                        ║
  ║   API: http://localhost:${PORT}/api     ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
