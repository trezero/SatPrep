import Database from "better-sqlite3";

const SAMPLE_SCHOOLS = [
  // New York area
  { name: "Stuyvesant High School", city: "New York", state: "NY", zip: "10282" },
  { name: "Bronx High School of Science", city: "Bronx", state: "NY", zip: "10468" },
  { name: "Brooklyn Technical High School", city: "Brooklyn", state: "NY", zip: "11217" },
  { name: "Townsend Harris High School", city: "Flushing", state: "NY", zip: "11367" },
  // California
  { name: "Thomas Jefferson High School", city: "Los Angeles", state: "CA", zip: "90011" },
  { name: "Lowell High School", city: "San Francisco", state: "CA", zip: "94132" },
  { name: "Mission San Jose High School", city: "Fremont", state: "CA", zip: "94539" },
  { name: "Palo Alto High School", city: "Palo Alto", state: "CA", zip: "94301" },
  // Texas
  { name: "LASA (Liberal Arts and Science Academy)", city: "Austin", state: "TX", zip: "78721" },
  { name: "School for the Talented and Gifted", city: "Dallas", state: "TX", zip: "75201" },
  { name: "DeBakey High School", city: "Houston", state: "TX", zip: "77030" },
  // Massachusetts
  { name: "Boston Latin School", city: "Boston", state: "MA", zip: "02115" },
  { name: "Lexington High School", city: "Lexington", state: "MA", zip: "02421" },
  // Virginia
  { name: "Thomas Jefferson HS for Science and Technology", city: "Alexandria", state: "VA", zip: "22312" },
  // Illinois
  { name: "Northside College Prep", city: "Chicago", state: "IL", zip: "60625" },
  { name: "Walter Payton College Prep", city: "Chicago", state: "IL", zip: "60610" },
  // New Jersey
  { name: "High Technology High School", city: "Lincroft", state: "NJ", zip: "07738" },
  { name: "Bergen County Academies", city: "Hackensack", state: "NJ", zip: "07601" },
  // Maryland
  { name: "Montgomery Blair High School", city: "Silver Spring", state: "MD", zip: "20901" },
  // Pennsylvania
  { name: "Central High School", city: "Philadelphia", state: "PA", zip: "19141" },
  // Florida
  { name: "Pine View School", city: "Osprey", state: "FL", zip: "34229" },
  { name: "Stanton College Prep", city: "Jacksonville", state: "FL", zip: "32204" },
  // Georgia
  { name: "Gwinnett School of Mathematics", city: "Lawrenceville", state: "GA", zip: "30043" },
  // Ohio
  { name: "Walnut Hills High School", city: "Cincinnati", state: "OH", zip: "45206" },
  // North Carolina
  { name: "NC School of Science and Mathematics", city: "Durham", state: "NC", zip: "27705" },
];

const SAMPLE_USERS = [
  { display_name: "MathWiz2025", xp: 4850, level: 12, streak_days: 15, total_questions_answered: 320, total_correct: 275 },
  { display_name: "SATSlayer", xp: 3200, level: 9, streak_days: 7, total_questions_answered: 210, total_correct: 168 },
  { display_name: "ReadingRocket", xp: 5100, level: 13, streak_days: 22, total_questions_answered: 400, total_correct: 340 },
  { display_name: "BrainStorm99", xp: 2100, level: 6, streak_days: 3, total_questions_answered: 150, total_correct: 105 },
  { display_name: "TestAce", xp: 6200, level: 15, streak_days: 30, total_questions_answered: 500, total_correct: 450 },
  { display_name: "StudyBuddy", xp: 1800, level: 5, streak_days: 1, total_questions_answered: 120, total_correct: 84 },
  { display_name: "QuizKing", xp: 3900, level: 10, streak_days: 11, total_questions_answered: 280, total_correct: 224 },
  { display_name: "PrepPro", xp: 4200, level: 11, streak_days: 14, total_questions_answered: 300, total_correct: 252 },
  { display_name: "ScoreChaser", xp: 2800, level: 8, streak_days: 5, total_questions_answered: 190, total_correct: 143 },
  { display_name: "FuturePerfect", xp: 7500, level: 18, streak_days: 45, total_questions_answered: 600, total_correct: 540 },
];

export function seedDatabase(db: Database.Database) {
  const schoolCount = (db.prepare("SELECT COUNT(*) as count FROM schools").get() as any).count;
  if (schoolCount > 0) return;

  const insertSchool = db.prepare(
    "INSERT INTO schools (name, city, state, zip) VALUES (?, ?, ?, ?)"
  );
  const insertUser = db.prepare(
    `INSERT INTO users (id, display_name, school_id, xp, level, streak_days, last_practice_date, total_questions_answered, total_correct)
     VALUES (?, ?, ?, ?, ?, ?, date('now', ?), ?, ?)`
  );

  const seedTransaction = db.transaction(() => {
    for (const school of SAMPLE_SCHOOLS) {
      insertSchool.run(school.name, school.city, school.state, school.zip);
    }

    const schoolIds = (db.prepare("SELECT id FROM schools").all() as any[]).map(r => r.id);

    for (let i = 0; i < SAMPLE_USERS.length; i++) {
      const user = SAMPLE_USERS[i];
      const schoolId = schoolIds[i % schoolIds.length];
      const userId = `seed-user-${i + 1}`;
      const daysAgo = `-${user.streak_days > 0 ? 0 : Math.floor(Math.random() * 30)} days`;
      insertUser.run(
        userId,
        user.display_name,
        schoolId,
        user.xp,
        user.level,
        user.streak_days,
        daysAgo,
        user.total_questions_answered,
        user.total_correct
      );
    }

    // Spread some extra users across multiple schools for leaderboard variety
    const extraNames = [
      "AlgebraAce", "GrammarGuru", "VocabVictor", "CalcCrusher",
      "LogicLord", "ProofMaster", "EssayExpert", "DataDriven",
      "NumberNinja", "WordWizard", "CritThinker", "AnalyzeThis",
      "TopScorer", "PracticeKing", "SATSurvivor", "TestTamer",
    ];

    for (let i = 0; i < extraNames.length; i++) {
      const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
      const xp = 500 + Math.floor(Math.random() * 5000);
      const level = Math.floor(xp / 400) + 1;
      const streak = Math.floor(Math.random() * 20);
      const totalQ = 50 + Math.floor(Math.random() * 400);
      const correct = Math.floor(totalQ * (0.5 + Math.random() * 0.4));

      insertUser.run(
        `seed-extra-${i + 1}`,
        extraNames[i],
        schoolId,
        xp, level, streak, "-0 days", totalQ, correct
      );
    }
  });

  seedTransaction();
  console.log(`Seeded ${SAMPLE_SCHOOLS.length} schools and ${SAMPLE_USERS.length + 16} users`);
}
