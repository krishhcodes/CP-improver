export type VirtualContestStatus = "UPCOMING" | "RUNNING" | "PAUSED" | "COMPLETED";

export type ContestDivision = "DIV1" | "DIV2" | "DIV3" | "DIV4" | "EDUCATIONAL";

export type SubmissionVerdict =
  | "OK"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR";

export interface VirtualContestProblem {
  id: string;
  contestId: number;
  index: string; // "A", "B", "C", "D", "E", "F"
  name: string;
  rating: number;
  tags: string[];
  points: number; // e.g. 500, 1000, 1500
  solvedCount: number;
  expectedSolveMinutes: number;
  statementSummary: string;
  sampleInput: string;
  sampleOutput: string;
}

export interface VirtualSubmission {
  id: string;
  problemIndex: string;
  submittedAtSeconds: number; // Elapsed seconds from contest start
  verdict: SubmissionVerdict;
  testset: string;
  passedCount: number;
  timeConsumedMs: number;
  memoryConsumedBytes: number;
  language: string;
}

export interface ParticipantProblemResult {
  problemIndex: string;
  isSolved: boolean;
  solveTimeMinutes: number | null; // Contest elapsed minutes when solved
  rejectedAttempts: number; // Non-OK submissions prior to AC
  points: number; // CF points scored
  icpcPenaltyMinutes: number; // solveTimeMinutes + 20 * rejectedAttempts
}

export interface BotSolveSchedule {
  problemIndex: string;
  solveElapsedSeconds: number;
  failedAttemptsBeforeAc: number;
}

export interface VirtualParticipant {
  id: string;
  handle: string;
  isUser: boolean;
  rank: number;
  rating: number;
  avatar: string;
  solvedCount: number;
  totalPoints: number;
  totalPenaltyMinutes: number;
  results: Record<string, ParticipantProblemResult>;
  botSchedule?: BotSolveSchedule[];
}

export interface VirtualContestSession {
  id: string;
  contestId: number;
  contestTitle: string;
  division: ContestDivision;
  durationMinutes: number; // default 120
  startedAtSeconds: number; // Wall-clock timestamp when started
  pausedAtSeconds: number | null;
  elapsedSeconds: number; // Virtual contest clock elapsed
  status: VirtualContestStatus;
  scoringMode: "ICPC" | "CF";
  problems: VirtualContestProblem[];
  submissions: VirtualSubmission[];
  participants: VirtualParticipant[];
  userHandle: string;
}
