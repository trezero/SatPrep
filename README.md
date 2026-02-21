# SAT Prep

A gamified mobile app that helps high school students prepare for the SAT. Upload your PSAT scores, get AI-personalized practice questions, compete on your school's leaderboard, and track your progress.

## Features

- **PSAT Score Analysis** — Upload your PSAT score report PDF and our AI (Claude) analyzes your strengths and weaknesses
- **Personalized Practice** — AI-generated SAT-style questions targeting your specific weak areas
- **Gamification** — XP system, levels, streaks, achievements, and a fun quiz interface
- **School Leaderboard** — Find your school by zip code and compete with classmates
- **Progress Tracking** — Detailed stats, accuracy breakdowns by category, weekly activity

## Architecture

```
SatPrep/
├── app/                    # React Native (Expo) mobile app
│   └── src/
│       ├── app/            # Expo Router screens
│       │   ├── (tabs)/     # Tab navigation (Home, Practice, Leaderboard, Profile)
│       │   ├── quiz.tsx    # Quiz gameplay screen
│       │   ├── results.tsx # Results & XP breakdown
│       │   └── upload-psat.tsx  # PSAT PDF upload & analysis
│       ├── components/     # Reusable UI components
│       ├── constants/      # Theme, colors, spacing
│       ├── hooks/          # Auth & storage hooks
│       ├── services/       # API client
│       └── types/          # TypeScript types
├── server/                 # Express.js API server
│   └── src/
│       ├── db/             # SQLite schema & seed data
│       ├── routes/         # API endpoints
│       └── services/       # Claude AI integration & gamification logic
```

## Tech Stack

- **Mobile**: React Native + Expo + TypeScript + Expo Router
- **Backend**: Express.js + TypeScript + SQLite (better-sqlite3)
- **AI**: Claude API (Anthropic) for PDF analysis and question generation
- **Storage**: AsyncStorage (client), SQLite (server)

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- An [Anthropic API key](https://console.anthropic.com)

### Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

The server starts on `http://localhost:3000` and auto-seeds the database with sample schools and users.

### Mobile App

```bash
cd app
npm install
npx expo start
```

Update `app/src/services/api.ts` with your server URL if not running locally.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users/:id` | Get user profile with stats |
| GET | `/api/users/:id/stats` | Detailed stats & weekly activity |
| POST | `/api/users/:id/check-streak` | Check/update streak status |
| GET | `/api/schools/search?zip=` | Search schools by zip code |
| GET | `/api/schools/:id/leaderboard` | School leaderboard |
| GET | `/api/schools/leaderboard/global` | Global leaderboard |
| POST | `/api/practice/generate` | Generate AI practice questions |
| POST | `/api/practice/submit` | Submit answers & get XP |
| POST | `/api/practice/explain` | Get AI explanation for wrong answers |
| POST | `/api/psat/analyze` | Upload & analyze PSAT PDF |

## Gamification System

- **XP**: 25 per correct answer, 5 per wrong answer (for trying!)
- **Streak Bonus**: +10 XP per streak day
- **Perfect Round**: +100 XP bonus
- **30 Levels** with increasing XP thresholds
- **13 Achievements** including streaks, accuracy milestones, speed runs, and more
