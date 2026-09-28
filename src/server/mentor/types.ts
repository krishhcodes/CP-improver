export type MentorPersona = "SOCRATIC" | "STRICT_COACH" | "DIAGNOSTICIAN";

export type HintTierLevel = 1 | 2 | 3 | 4;

export interface ProgressiveHint {
  tier: HintTierLevel;
  title: string;
  category: "OBSERVATION" | "ALGORITHM_PARADIGM" | "INVARIANT_PROOF" | "EDGE_CASES";
  content: string;
}

export type IssueSeverity = "CRITICAL" | "WARNING" | "INFO";

export type IssueCategory =
  | "INTEGER_OVERFLOW"
  | "TIME_COMPLEXITY"
  | "FAST_IO"
  | "ARRAY_BOUNDS"
  | "RECURSION_DEPTH"
  | "EDGE_CASE"
  | "PRECISION";

export interface CodeAnalysisIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  codeSnippet?: string;
  suggestedFix: string;
}

export interface CodeReviewReport {
  hasCriticalIssues: boolean;
  estimatedComplexity: string;
  verdictRisk: string; // e.g. "High risk of Time Limit Exceeded (TLE) on N >= 2e5"
  issues: CodeAnalysisIssue[];
  positiveHighlights: string[];
  recommendedNextStep: string;
}

export interface MentorChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestampSeconds: number;
  persona?: MentorPersona;
  hintTier?: HintTierLevel;
  codeReview?: CodeReviewReport;
}

export interface UserMentorContext {
  handle: string;
  rating: number;
  weakestTopics: { topic: string; score: number }[];
  recentSubmissions: {
    problemName: string;
    verdict: string;
    rating: number;
  }[];
  currentProblem?: {
    index?: string;
    name: string;
    rating: number;
    tags: string[];
    timeLimitSeconds?: number;
    statementSummary?: string;
  };
}
