import type {
  User,
  School,
  Question,
  AnswerResult,
  SessionResult,
  LeaderboardEntry,
  PSATAnalysis,
  Achievement,
} from "../types";

// Change this to your server URL
const API_BASE = "http://localhost:3000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// User endpoints
export async function createUser(displayName: string, schoolId?: number): Promise<User> {
  return request("/users", {
    method: "POST",
    body: JSON.stringify({ displayName, schoolId }),
  });
}

export async function getUser(userId: string): Promise<User> {
  return request(`/users/${userId}`);
}

export async function updateUserSchool(userId: string, schoolId: number): Promise<void> {
  return request(`/users/${userId}/school`, {
    method: "PATCH",
    body: JSON.stringify({ schoolId }),
  });
}

export async function checkStreak(userId: string): Promise<{ streak: number; message: string }> {
  return request(`/users/${userId}/check-streak`, { method: "POST" });
}

export async function getUserStats(userId: string) {
  return request(`/users/${userId}/stats`);
}

// School endpoints
export async function searchSchools(zip: string): Promise<School[]> {
  return request(`/schools/search?zip=${encodeURIComponent(zip)}`);
}

export async function getAllSchools(search?: string): Promise<{ schools: School[]; pagination: any }> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/schools${params}`);
}

export async function getSchoolLeaderboard(
  schoolId: number
): Promise<{ school: School; leaderboard: LeaderboardEntry[] }> {
  return request(`/schools/${schoolId}/leaderboard`);
}

export async function getGlobalLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return request("/schools/leaderboard/global");
}

// Practice endpoints
export async function generateQuestions(
  userId: string,
  count?: number
): Promise<{ questions: Question[]; weakAreas: string[]; hasAnalysis: boolean }> {
  return request("/practice/generate", {
    method: "POST",
    body: JSON.stringify({ userId, count }),
  });
}

export async function submitSession(
  userId: string,
  answers: AnswerResult[],
  timeSeconds?: number
): Promise<SessionResult> {
  return request("/practice/submit", {
    method: "POST",
    body: JSON.stringify({ userId, answers, timeSeconds }),
  });
}

export async function getExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<{ explanation: string }> {
  return request("/practice/explain", {
    method: "POST",
    body: JSON.stringify({ question, correctAnswer, userAnswer }),
  });
}

// PSAT endpoints
export async function uploadPSAT(
  userId: string,
  pdfBase64: string
): Promise<{ analysis: PSATAnalysis; newAchievements: Achievement[] }> {
  // For the upload, we use multipart/form-data approach via the JSON endpoint
  return request("/psat/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, pdfBase64 }),
  });
}

export async function getPSATHistory(userId: string) {
  return request(`/psat/user/${userId}`);
}
