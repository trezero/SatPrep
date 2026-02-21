import { Router, Request, Response } from "express";
import Database from "better-sqlite3";

export function createSchoolRoutes(db: Database.Database): Router {
  const router = Router();

  // Search schools by zip code (returns schools in matching and nearby zips)
  router.get("/search", (req: Request, res: Response) => {
    const { zip } = req.query;
    if (!zip || typeof zip !== "string") {
      res.status(400).json({ error: "zip query parameter is required" });
      return;
    }

    // Match exact zip and nearby (same prefix)
    const zipPrefix = zip.substring(0, 3);
    const schools = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM users WHERE school_id = s.id) as student_count
      FROM schools s
      WHERE s.zip = ? OR s.zip LIKE ?
      ORDER BY
        CASE WHEN s.zip = ? THEN 0 ELSE 1 END,
        s.name
    `).all(zip, `${zipPrefix}%`, zip);

    res.json(schools);
  });

  // Get all schools (paginated)
  router.get("/", (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let query = `
      SELECT s.*,
        (SELECT COUNT(*) FROM users WHERE school_id = s.id) as student_count
      FROM schools s
    `;
    const params: any[] = [];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.city LIKE ? OR s.zip LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY s.name LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const schools = db.prepare(query).all(...params);
    const total = db.prepare(
      `SELECT COUNT(*) as count FROM schools${search ? " WHERE name LIKE ? OR city LIKE ? OR zip LIKE ?" : ""}`
    ).get(...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])) as any;

    res.json({
      schools,
      pagination: { page, limit, total: total.count, pages: Math.ceil(total.count / limit) },
    });
  });

  // Get leaderboard for a specific school
  router.get("/:id/leaderboard", (req: Request, res: Response) => {
    const users = db.prepare(`
      SELECT u.id, u.display_name, u.xp, u.level, u.streak_days,
        u.total_questions_answered, u.total_correct,
        CASE WHEN u.total_questions_answered > 0
          THEN ROUND(CAST(u.total_correct AS FLOAT) / u.total_questions_answered * 100, 1)
          ELSE 0
        END as accuracy
      FROM users u
      WHERE u.school_id = ?
      ORDER BY u.xp DESC
      LIMIT 50
    `).all(req.params.id);

    const school = db.prepare("SELECT * FROM schools WHERE id = ?").get(req.params.id);

    res.json({ school, leaderboard: users });
  });

  // Global leaderboard
  router.get("/leaderboard/global", (req: Request, res: Response) => {
    const users = db.prepare(`
      SELECT u.id, u.display_name, u.xp, u.level, u.streak_days,
        u.total_questions_answered, u.total_correct,
        s.name as school_name,
        CASE WHEN u.total_questions_answered > 0
          THEN ROUND(CAST(u.total_correct AS FLOAT) / u.total_questions_answered * 100, 1)
          ELSE 0
        END as accuracy
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      ORDER BY u.xp DESC
      LIMIT 100
    `).all();

    res.json({ leaderboard: users });
  });

  return router;
}
