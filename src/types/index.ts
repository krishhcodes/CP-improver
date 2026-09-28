export interface CFProfile {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  avatar: string;
  contribution: number;
  lastSyncedAt: string;
  globalRankEstimate: number;
  fullName?: string;
  organization?: string;
  country?: string;
  city?: string;
}

export interface RatingPoint {
  contestId: number;
  contestName: string;
  rating: number;
  oldRating: number;
  ratingChange: number;
  rank: number;
  date: string;
  timestampSeconds: number;
}

export interface PerformanceStats {
  contestsCount: number;
  solvedCount: number;
  attemptedCount: number;
  successRate: number; // e.g. 72.4
  avgSolvedRating: number; // e.g. 1560
  upsolveRate: number; // e.g. 68.5%
  bestRank: number;
  avgRank: number;
  currentStreakDays: number;
}

export interface VerdictCount {
  verdict: string;
  count: number;
  percentage: number;
  color: string;
}

export interface UpsolveProblem {
  id: string;
  contestId: number;
  contestName: string;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  failedAttempts: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  url: string;
}

export interface TopicWeakness {
  tag: string;
  proficiencyScore: number; // 0 - 100
  weaknessScore: number; // 0 - 100
  solvedCount: number;
  failedCount: number;
  avgRating: number;
  status: "CRITICAL" | "NEEDS_WORK" | "STABLE" | "STRONG";
  actionRecommendation: string;
}

export interface Submission {
  id: string;
  problemIndex: string;
  problemName: string;
  problemRating: number;
  contestId?: number;
  verdict: string;
  language: string;
  runtimeMs: number;
  memoryKb: number;
  submittedAtSeconds: number;
  tags: string[];
}

export interface ContestAutopsy {
  contestId: number;
  contestName: string;
  date: string;
  rank: number;
  ratingChange: number;
  solvedProblems: string[];
  failedProblems: string[];
  missedProblems: string[];
  insights: {
    wentWell: string[];
    wentWrong: string[];
    actionItems: string[];
  };
}
