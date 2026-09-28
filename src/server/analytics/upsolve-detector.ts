export interface UpsolveCandidate {
  id: string;
  contestId: number;
  contestName: string;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  failedAttempts: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  learningYieldScore: number;
  reason: string;
  url: string;
}

export interface ContestInput {
  id: number;
  name: string;
}

export interface ProblemInput {
  id: string;
  contestId: number;
  index: string;
  name: string;
  rating?: number | null;
  tags: string[];
}

export interface SubmissionInput {
  problemId: string;
  contestId?: number | null;
  problemIndex: string;
  verdict: string;
}

/**
 * Computes a prioritized Upsolve Queue with explainable reasoning
 */
export function generateUpsolveQueue(params: {
  recentContests: ContestInput[];
  contestProblems: ProblemInput[];
  userSubmissions: SubmissionInput[];
  userCurrentRating: number;
  limit?: number;
}): UpsolveCandidate[] {
  const { recentContests, contestProblems, userSubmissions, userCurrentRating, limit = 20 } =
    params;

  // 1. Map solved problem keys
  const solvedProblemKeys = new Set<string>();
  const attemptsByProblemKey = new Map<string, number>();

  for (const sub of userSubmissions) {
    const key = `${sub.contestId ?? 0}-${sub.problemIndex}`;
    if (sub.verdict === "OK") {
      solvedProblemKeys.add(key);
      solvedProblemKeys.add(sub.problemId);
    } else {
      attemptsByProblemKey.set(key, (attemptsByProblemKey.get(key) ?? 0) + 1);
    }
  }

  const contestMap = new Map<number, string>();
  for (const c of recentContests) {
    contestMap.set(c.id, c.name);
  }

  const candidates: UpsolveCandidate[] = [];

  for (const prob of contestProblems) {
    const key = `${prob.contestId}-${prob.index}`;

    // Skip if user already solved this problem
    if (solvedProblemKeys.has(key) || solvedProblemKeys.has(prob.id)) {
      continue;
    }

    const contestName = contestMap.get(prob.contestId) ?? `Contest ${prob.contestId}`;
    const failedAttempts = attemptsByProblemKey.get(key) ?? 0;
    const rating = prob.rating ?? 1400;
    const ratingDiff = rating - userCurrentRating;

    let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let reason = "";
    let yieldScore = 50;

    if (failedAttempts > 0) {
      if (ratingDiff >= -150 && ratingDiff <= 250) {
        priority = "HIGH";
        yieldScore = 95 - Math.abs(ratingDiff) * 0.1 + failedAttempts * 2;
        reason = `Failed ${failedAttempts} time${
          failedAttempts > 1 ? "s" : ""
        } during ${contestName}. High learning impact because rating (${rating}) is near your current skill level (${userCurrentRating}).`;
      } else if (ratingDiff > 250) {
        priority = "MEDIUM";
        yieldScore = 75 - Math.abs(ratingDiff) * 0.05;
        reason = `Attempted ${failedAttempts} time${
          failedAttempts > 1 ? "s" : ""
        } during ${contestName}. Advanced difficulty stretch problem (+${ratingDiff} rating).`;
      } else {
        priority = "HIGH";
        yieldScore = 90 + failedAttempts * 2;
        reason = `Failed ${failedAttempts} time${
          failedAttempts > 1 ? "s" : ""
        } during ${contestName} despite rating being within your comfort zone. Review implementation pitfalls.`;
      }
    } else {
      // Missed / unattempted problem
      if (ratingDiff >= -100 && ratingDiff <= 200) {
        priority = "MEDIUM";
        yieldScore = 70 - Math.max(0, ratingDiff) * 0.1;
        reason = `Unattempted problem (${prob.index}) from ${contestName}. Strong progression candidate (+${ratingDiff} rating).`;
      } else if (ratingDiff > 200 && ratingDiff <= 400) {
        priority = "LOW";
        yieldScore = 45;
        reason = `Advanced problem (${prob.index}) from ${contestName}. Suitable for deep dive study after mastering core tiers.`;
      } else {
        priority = "LOW";
        yieldScore = 30;
        reason = `Missed problem from ${contestName}.`;
      }
    }

    candidates.push({
      id: prob.id,
      contestId: prob.contestId,
      contestName,
      index: prob.index,
      name: prob.name,
      rating,
      tags: prob.tags,
      failedAttempts,
      priority,
      learningYieldScore: Math.round(yieldScore),
      reason,
      url: `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`,
    });
  }

  // Sort by priority weight (HIGH > MEDIUM > LOW), then by learning yield score descending
  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  candidates.sort((a, b) => {
    const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (pDiff !== 0) return pDiff;
    return b.learningYieldScore - a.learningYieldScore;
  });

  return candidates.slice(0, limit);
}
