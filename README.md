# CP Intelligence Platform

> **A serious Competitive Programming Intelligence and Learning Platform.**
> Combines Codeforces data synchronization, contest analytics, upsolve queues, topic weakness modeling, explainable recommendations, adaptive training curriculums, and concept dependency graphs.

---

## 🚀 Product Philosophy

> *"Given everything this competitive programmer has done, what should they learn and practice next?"*

Rather than being a simple statistics dashboard, this platform turns historical performance into actionable learning decisions:
- Detects recurring blindspots across Codeforces tags.
- Evaluates difficulty-adjusted weaknesses (failing 1400 DP vs 2400 DP).
- Ranks missed contest problems into an **Upsolve Priority Queue** with explainable reasons.
- Decouples computational analytics and recommendations entirely from UI rendering.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Dark Glassmorphic Theme)
- **Database & ORM**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Stateless signed JWT sessions (`jose`) + `scrypt` password hashing
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Sync Engine**: Throttled Codeforces API Client (Token Bucket <= 1 req/sec)

---

## 📂 Project Architecture

```
cp-intelligence/
├── prisma/
│   ├── schema.prisma              # Normalized PostgreSQL schema (13 models, 5 enums)
│   └── seed.ts                    # Concepts DAG, Demo User, Contest 970, Problems
├── src/
│   ├── app/                       # Next.js App Router Pages & API Routes
│   │   ├── layout.tsx             # Root layout with Sidebar and Navbar
│   │   ├── globals.css            # Dark theme tokens, glassmorphism, scrollbars
│   │   ├── page.tsx               # Main CP Intelligence Dashboard
│   │   ├── login/page.tsx         # Sign In & Register with live CF handle check
│   │   ├── contests/page.tsx      # Contest Intelligence & Historical rounds
│   │   ├── upsolve/page.tsx       # Upsolve Queue & Prioritized backlog
│   │   ├── topics/page.tsx        # Topic Intelligence & Skill Vector matrix
│   │   ├── recommend/page.tsx     # Explainable Recommendations preview
│   │   ├── training/page.tsx      # Adaptive Training Plan
│   │   ├── learn/page.tsx         # CP Knowledge Base & Prerequisite DAG
│   │   ├── revision/page.tsx      # Spaced Revision (SM-2 Algorithm)
│   │   └── api/
│   │       ├── auth/              # Authentication Endpoints
│   │       │   ├── register/route.ts      # Account creation + CF handle link
│   │       │   ├── login/route.ts         # User authentication + JWT cookie
│   │       │   ├── logout/route.ts        # Clear session cookie
│   │       │   ├── me/route.ts            # Active session profile
│   │       │   └── verify-handle/route.ts # Live Codeforces handle verification
│   │       └── sync/route.ts              # Idempotent CF sync trigger
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Navigation with CF rank badge & Account link
│   │   │   └── Navbar.tsx         # Search handle switcher, CF sync button
│   │   └── dashboard/
│   │       ├── ProfileHeader.tsx  # CF rank color glow, avatar, highlights
│   │       ├── RatingGraph.tsx    # Recharts area graph with CF rank bands
│   │       ├── PerformanceCards.tsx # Metrics grid (win rate, upsolve rate...)
│   │       ├── VerdictDistributionChart.tsx # Doughnut breakdown of AC, WA, TLE
│   │       ├── SkillProficiencyOverview.tsx # Topic weakness preview
│   │       ├── UpsolveQueueWidget.tsx # Top priority missed contest problems
│   │       ├── ContestAutopsyWidget.tsx # Latest contest autopsy breakdown
│   │       └── RecentSubmissionsTable.tsx # Submission feed with verdict filters
│   ├── server/
│   │   ├── analytics/             # Decoupled Pure Analytics Engines
│   │   │   ├── contest-analytics.ts # Contest timeline & problem classification
│   │   │   ├── upsolve-detector.ts  # Priority upsolve queue & explainability
│   │   │   └── weakness-model.ts    # Topic weakness & skill vector model
│   │   ├── recommendations/       # Pure Explainable Recommendation Engine
│   │   │   ├── recommendation-engine.ts # Multi-factor scoring & categories
│   │   │   └── training-plan.ts   # Adaptive 7-day curriculum generator
│   │   ├── knowledge/             # Concept DAG, Knowledge Base & Spaced Revision
│   │   │   ├── concept-graph.ts   # Prerequisite DAG & topological sorting
│   │   │   ├── concepts-data.ts   # Structured tutorials & C++ templates
│   │   │   ├── sm2.ts             # SuperMemo-2 (SM-2) pure algorithm
│   │   │   └── revision-service.ts # Active recall queue & card store
│   │   ├── virtual/               # Virtual Contest Simulation & Autopsy
│   │   │   ├── virtual-contest-engine.ts # ICPC/CF scoring & leaderboard simulation
│   │   │   ├── post-contest-autopsy.ts   # Time sink & opportunity cost diagnostician
│   │   │   ├── preset-contests.ts        # Calibrated rounds & competitor bot profiles
│   │   │   └── virtual-contest-service.ts # Active session store & state manager
│   │   ├── mentor/                # AI CP Mentor & Code Review Engine
│   │   │   ├── code-analyzer.ts   # Static & semantic code analysis for CP bugs
│   │   │   ├── progressive-hints.ts # 4-Tier Socratic spoiler-free hinting
│   │   │   └── mentor-service.ts  # Context-aware chat service with Gemini/offline hybrid
│   │   ├── auth/                  # Decoupled Authentication Services
│   │   │   ├── password.ts        # Scrypt hashing & timingSafeEqual check
│   │   │   ├── session.ts         # Jose JWT signing & verification
│   │   │   └── auth-service.ts    # Registration, login, CF handle verification
│   │   ├── codeforces/            # Codeforces Client & Sync Pipeline
│   │   │   ├── cf-client.ts       # Throttled HTTP client (Token Bucket)
│   │   │   ├── cf-schemas.ts      # Zod validation schemas
│   │   │   └── cf-sync-service.ts # Idempotent batch synchronizer
│   │   └── db/
│   │       └── repositories/      # Decoupled database data access layer
│   │           ├── user-repo.ts       # UserRepository (profiles, sync tracking)
│   │           ├── contest-repo.ts    # ContestRepository (rounds & participation)
│   │           ├── problem-repo.ts    # ProblemRepository (problems & tag syncing)
│   │           ├── submission-repo.ts # SubmissionRepository (batch upserts)
│   │           └── knowledge-repo.ts  # KnowledgeRepository (concepts & DAG)
│   ├── lib/
│   │   ├── db.ts                  # Prisma Client singleton
│   │   ├── utils.ts               # CF rank classification, delta & time formatters
│   │   └── mock-data.ts           # Realistic CP datasets (Alex_Algo / Tourist)
│   └── types/
│       └── index.ts               # Strict TypeScript definitions
├── tests/
│   ├── utils.test.ts              # Rank & delta formatter unit tests
│   ├── repositories.test.ts       # Repository & Prisma delegate interface tests
│   ├── cf-client.test.ts          # Rate-limiter & client unit tests
│   ├── cf-schemas.test.ts         # Zod schemas & verdict mapping tests
│   ├── auth.test.ts               # Password hashing, JWT tokens, auth validation
│   ├── contest-analytics.test.ts  # Contest timeline & problem classifications
│   ├── upsolve-detector.test.ts   # Upsolve queue & explainability tests
│   ├── weakness-model.test.ts     # Topic weakness formula & skill vector tests
│   ├── recommendations.test.ts    # Recommendation scoring & training plan tests
│   ├── concept-graph.test.ts      # Concept DAG & prerequisite resolution tests
│   ├── sm2.test.ts                # SuperMemo-2 & active recall queue tests
│   ├── virtual-contest.test.ts    # Virtual arena, ICPC/CF scoring & autopsy tests
│   └── mentor.test.ts             # AI mentor, static code analyzer & progressive hints
├── vitest.config.ts               # Test configuration with @/* aliases
└── package.json
```

---

## 🔒 Authentication & Account Linking

- **Password Security**: Uses cryptographic `scrypt` with random salt per password and `crypto.timingSafeEqual` to eliminate timing attacks.
- **Session Tokens**: Stateless, tamper-proof JSON Web Tokens signed via `jose` and delivered in secure HTTP-only cookies (`cp_session`).
- **Live Handle Verification**: During registration, `/api/auth/verify-handle` queries Codeforces live to ensure handles exist, displaying the user's authentic Codeforces rank badge and avatar in real time.

---

## 💻 Available Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run Vitest test suite (112 tests across 13 test suites)
npm test

# Build production bundle
npm run build

# Generate Prisma Client
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Run seed script (concepts, DAG edges, demo user, contest 970)
npm run db:seed
```

---

## 🎯 Milestones Progress

- [x] **Milestone 1**: UI First & Design System (Dashboard, Sub-routes, Charts, Responsive Shell).
- [x] **Milestone 2**: Database Schema & Core Architecture (Prisma ORM, PostgreSQL schema, 5 Repositories, Seed script).
- [x] **Milestone 3**: Codeforces Synchronization Layer & Resilient API Client (Token Bucket rate limiting, Zod validation, Idempotent sync).
- [x] **Milestone 4**: Authentication & User Profile Management (Scrypt hashing, Jose JWT, live handle check, `/login` page).
- [x] **Milestone 5**: Contest & Upsolve Intelligence (Contest timeline, solved/failed/missed classifier, explainable upsolve priority queue).
- [x] **Milestone 6**: Topic Intelligence & Skill Vector Model (Difficulty-weighted failure penalty, recency decay, skill radar chart).
- [x] **Milestone 7**: Explainable Recommendation Engine & Adaptive Training Plans (5 tactical categories, Gaussian rating fit, 7-day adaptive curriculum).
- [x] **Milestone 8**: CP Knowledge Base & Concept DAG (Topological ordering, cycle detection, C++ templates, prerequisite resolver).
- [x] **Milestone 9**: Spaced Revision System (SM-2 algorithm, active recall drills, retention tracking).
- [x] **Milestone 10**: Virtual Contests & Post-Contest Autopsy (simulation arena, competitor bots, dual ICPC/CF scoring, opportunity cost diagnostician).
- [x] **Milestone 11**: AI CP Mentor Integration (Socratic Progressive Hints, Static Code Analyzer, Multi-Persona Studio, Resilient Hybrid Service).



