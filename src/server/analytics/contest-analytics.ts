export type ProblemStatus =
  | "SOLVED_DURING_CONTEST"
  | "FAILED_DURING_CONTEST"
  | "UPSOLVED_LATER"
  | "MISSED";

export interface TimelineEvent {
  submissionId: string;
  problemIndex: string;
  problemName: string;
  relativeTimeSeconds: number;
  formattedTime: string; // "00:24:12"
  verdict: string;
  isAccepted: boolean;
  passedTestCount: number;
}

export interface ProblemContestAnalysis {
  index: string;
  name: string;
  rating?: number | null;
  status: ProblemStatus;
  attemptsDuringContest: number;
  attemptsAfterContest: number;
  acceptedAtRelativeTimeSeconds?: number | null;
  timeSpentMinutes?: number | null;
  tags: string[];
}

export interface ContestMetrics {
  contestId: number;
  contestName: string;
  rank?: number | null;
  oldRating?: number | null;
  newRating?: number | null;
  ratingChange?: number | null;
  totalProblemsCount: number;
  solvedDuringContestCount: number;
  failedDuringContestCount: number;
  upsolvedLaterCount: number;
  missedCount: number;
  timeToFirstAcMinutes?: number | null;
  totalPenaltyTimeMinutes: number;
  timeline: TimelineEvent[];
  problemAnalyses: ProblemContestAnalysis[];
}

export function formatContestSeconds(seconds: number): string {
  const s = Math.max(0, seconds);
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

/**
 * Classifies all problems and builds an accurate timeline for a contest participation.
 */
export function analyzeContestPerformance(params: {
  contest: {
    id: number;
    name: string;
    durationSeconds: number;
    startTimeSeconds: number;
  };
  participation?: {
    rank?: number | null;
    oldRating?: number | null;
    newRating?: number | null;
    ratingChange?: number | null;
  } | null;
  contestProblems: Array<{
    index: string;
    name: string;
    rating?: number | null;
    tags: string[];
  }>;
  submissions: Array<{
    id: string;
    problemIndex: string;
    problemName: string;
    creationTimeSeconds: number;
    relativeTimeSeconds?: number | null;
    verdict: string;
    passedTestCount: number;
  }>;
}): ContestMetrics {
  const { contest, participation, contestProblems, submissions } = params;

  // Group submissions by problem index
  const submissionsByProblem = new Map<string, typeof submissions>();
  for (const prob of contestProblems) {
    submissionsByProblem.set(prob.index, []);
  }

  const timeline: TimelineEvent[] = [];

  for (const sub of submissions) {
    const list = submissionsByProblem.get(sub.problemIndex);
    if (list) {
      list.push(sub);
    }

    // Determine relative contest time
    let relTime = sub.relativeTimeSeconds;
    if (relTime === null || relTime === undefined) {
      relTime = sub.creationTimeSeconds - contest.startTimeSeconds;
    }

    // If within contest duration, include in official contest timeline
    if (relTime >= 0 && relTime <= contest.durationSeconds) {
      timeline.push({
        submissionId: sub.id,
        problemIndex: sub.problemIndex,
        problemName: sub.problemName,
        relativeTimeSeconds: relTime,
        formattedTime: formatContestSeconds(relTime),
        verdict: sub.verdict,
        isAccepted: sub.verdict === "OK",
        passedTestCount: sub.passedTestCount,
      });
    }
  }

  // Sort timeline chronologically
  timeline.sort((a, b) => a.relativeTimeSeconds - b.relativeTimeSeconds);

  const problemAnalyses: ProblemContestAnalysis[] = [];
  let firstAcTime: number | null = null;
  let totalPenaltyMinutes = 0;

  for (const prob of contestProblems) {
    const probSubs = submissionsByProblem.get(prob.index) ?? [];

    let attemptsDuring = 0;
    let attemptsAfter = 0;
    let solvedDuring: number | null = null;
    let solvedAfter: number | null = null;

    for (const sub of probSubs) {
      let relTime = sub.relativeTimeSeconds;
      if (relTime === null || relTime === undefined) {
        relTime = sub.creationTimeSeconds - contest.startTimeSeconds;
      }

      const isContestWindow = relTime >= 0 && relTime <= contest.durationSeconds;

      if (isContestWindow) {
        attemptsDuring++;
        if (sub.verdict === "OK" && solvedDuring === null) {
          solvedDuring = relTime;
        }
      } else {
        attemptsAfter++;
        if (sub.verdict === "OK" && solvedAfter === null) {
          solvedAfter = relTime;
        }
      }
    }

    let status: ProblemStatus = "MISSED";

    if (solvedDuring !== null) {
      status = "SOLVED_DURING_CONTEST";
      if (firstAcTime === null || solvedDuring < firstAcTime) {
        firstAcTime = solvedDuring;
      }
      totalPenaltyMinutes += Math.floor(solvedDuring / 60) + (attemptsDuring - 1) * 20;
    } else if (solvedAfter !== null) {
      status = "UPSOLVED_LATER";
    } else if (attemptsDuring > 0) {
      status = "FAILED_DURING_CONTEST";
    } else {
      status = "MISSED";
    }

    problemAnalyses.push({
      index: prob.index,
      name: prob.name,
      rating: prob.rating,
      status,
      attemptsDuringContest: attemptsDuring,
      attemptsAfterContest: attemptsAfter,
      acceptedAtRelativeTimeSeconds: solvedDuring,
      timeSpentMinutes: solvedDuring ? Math.floor(solvedDuring / 60) : null,
      tags: prob.tags,
    });
  }

  const solvedDuringCount = problemAnalyses.filter(
    (p) => p.status === "SOLVED_DURING_CONTEST"
  ).length;
  const failedDuringCount = problemAnalyses.filter(
    (p) => p.status === "FAILED_DURING_CONTEST"
  ).length;
  const upsolvedLaterCount = problemAnalyses.filter(
    (p) => p.status === "UPSOLVED_LATER"
  ).length;
  const missedCount = problemAnalyses.filter((p) => p.status === "MISSED").length;

  return {
    contestId: contest.id,
    contestName: contest.name,
    rank: participation?.rank ?? null,
    oldRating: participation?.oldRating ?? null,
    newRating: participation?.newRating ?? null,
    ratingChange: participation?.ratingChange ?? null,
    totalProblemsCount: contestProblems.length,
    solvedDuringContestCount: solvedDuringCount,
    failedDuringContestCount: failedDuringCount,
    upsolvedLaterCount,
    missedCount,
    timeToFirstAcMinutes: firstAcTime !== null ? Math.floor(firstAcTime / 60) : null,
    totalPenaltyTimeMinutes: totalPenaltyMinutes,
    timeline,
    problemAnalyses,
  };
}
