export type FindingSeverity = "POSITIVE" | "WARNING" | "CRITICAL";

export type FindingCategory =
  | "TIME_ALLOCATION"
  | "PROBLEM_CHOICE"
  | "PENALTY_DISCIPLINE"
  | "STREAK";

export interface ProblemTimeAllocation {
  problemIndex: string;
  problemName: string;
  rating: number;
  isSolved: boolean;
  minutesSpent: number;
  expectedMinutes: number;
  timeDeltaMinutes: number; // positive = took longer than expected
  isTimeSink: boolean; // spent > 1.8x expected time or failed after > 30 mins
}

export interface StrategicFinding {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  impact: string;
}

export interface OpportunityCostAnalysis {
  detected: boolean;
  overlookedProblemIndex?: string;
  overlookedProblemName?: string;
  overlookedProblemRating?: number;
  stuckOnProblemIndex?: string;
  stuckMinutes?: number;
  explanation: string;
}

export interface AutopsyUpsolveItem {
  problemIndex: string;
  name: string;
  rating: number;
  tags: string[];
  yieldScore: number;
  reason: string;
  curriculumGuide?: {
    slug: string;
    name: string;
    bookCitation: string;
    chapter: string;
  };
}

export interface PostContestAutopsy {
  sessionId: string;
  contestTitle: string;
  finalRank: number;
  totalParticipants: number;
  rankPercentile: number; // e.g. Top 15.4%
  solvedCount: number;
  totalProblems: number;
  totalPenaltyMinutes: number;
  virtualPerformanceRating: number;
  ratingDeltaProjection: number; // projected +/- rating change
  timeAllocations: ProblemTimeAllocation[];
  findings: StrategicFinding[];
  opportunityCost: OpportunityCostAnalysis;
  actionItems: string[];
  recommendedUpsolves: AutopsyUpsolveItem[];
}
