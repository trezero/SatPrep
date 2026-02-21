import { Router, Request, Response } from "express";
import Database from "better-sqlite3";
import multer from "multer";
import { analyzePSATPdf } from "../services/claude";
import { checkAchievements, ACHIEVEMENTS } from "../services/gamification";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export function createPsatRoutes(db: Database.Database): Router {
  const router = Router();

  // Upload and analyze PSAT PDF
  router.post("/analyze", upload.single("pdf"), async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "PDF file is required" });
        return;
      }

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Convert to base64 for Claude API
      const pdfBase64 = req.file.buffer.toString("base64");

      // Analyze with Claude
      const analysis = await analyzePSATPdf(pdfBase64);

      // Store analysis
      db.prepare(`
        INSERT INTO psat_analyses (user_id, raw_analysis, weak_areas, strong_areas, overall_score, math_score, reading_writing_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        JSON.stringify(analysis),
        JSON.stringify(analysis.weakAreas),
        JSON.stringify(analysis.strongAreas),
        analysis.overallScore,
        analysis.mathScore,
        analysis.readingWritingScore
      );

      // Check for upload achievement
      const newAchievements = checkAchievements(db, userId);

      res.json({
        analysis,
        newAchievements: newAchievements.map(key => ({
          key,
          ...ACHIEVEMENTS[key],
        })),
      });
    } catch (error) {
      console.error("Error analyzing PSAT:", error);
      res.status(500).json({ error: "Failed to analyze PSAT scores" });
    }
  });

  // Get user's PSAT analysis history
  router.get("/user/:userId", (req: Request, res: Response) => {
    const analyses = db.prepare(
      "SELECT * FROM psat_analyses WHERE user_id = ? ORDER BY created_at DESC"
    ).all(req.params.userId);

    res.json(
      analyses.map((a: any) => ({
        ...a,
        weak_areas: JSON.parse(a.weak_areas),
        strong_areas: JSON.parse(a.strong_areas),
        raw_analysis: JSON.parse(a.raw_analysis),
      }))
    );
  });

  return router;
}
