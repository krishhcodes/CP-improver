import {
  AutopsyUpsolveItem,
  OpportunityCostAnalysis,
  PostContestAutopsy,
  ProblemTimeAllocation,
  StrategicFinding,
} from "./autopsy-types";
import { VirtualContestSession } from "./types";

/**
 * Pure computational engine for Post-Contest Autopsy
 */
export function generatePostContestAutopsy(
  session: VirtualContestSession,
  userCurrentRating = 1540
): PostContestAutopsy {
  const user = session.participants.find((p) => p.isUser);
  if (!user) {
    throw new Error("Cannot run autopsy: User participant not found in session.");
  }

  const totalProblems = session.problems.length;
  const totalParticipants = session.participants.length;
  const finalRank = user.rank;
  const solvedCount = user.solvedCount;
  const totalPenaltyMinutes = user.totalPenaltyMinutes;

  // 1. Calculate time allocations per problem
  const timeAllocations: ProblemTimeAllocation[] = [];
  const submissions = [...session.submissions].reverse(); // chronological

  for (const prob of session.problems) {
    const res = user.results[prob.index];
    const probSubs = submissions.filter((s) => s.problemIndex === prob.index);

    let minutesSpent = 0;
    if (res?.isSolved && res.solveTimeMinutes !== null) {
      // Approximate time spent: if first problem, it's solveTimeMinutes.
      // Otherwise, difference from previous solved problem or total attempts duration.
      minutesSpent = Math.max(
        prob.expectedSolveMinutes,
        Math.min(res.solveTimeMinutes, prob.expectedSolveMinutes + res.rejectedAttempts * 8)
      );
    } else if (probSubs.length > 0) {
      // Attempted but unsolved
      const firstSubTime = Math.floor(probSubs[0].submittedAtSeconds / 60);
      const lastSubTime = Math.floor(probSubs[probSubs.length - 1].submittedAtSeconds / 60);
      minutesSpent = Math.max(15, lastSubTime - firstSubTime + 10);
    } else {
      minutesSpent = 0;
    }

    const timeDeltaMinutes = minutesSpent - prob.expectedSolveMinutes;
    const isTimeSink =
      (!res?.isSolved && minutesSpent >= 25) ||
      (res?.isSolved && minutesSpent >= Math.round(prob.expectedSolveMinutes * 1.8) && minutesSpent >= 30);

    timeAllocations.push({
      problemIndex: prob.index,
      problemName: prob.name,
      rating: prob.rating,
      isSolved: res?.isSolved ?? false,
      minutesSpent,
      expectedMinutes: prob.expectedSolveMinutes,
      timeDeltaMinutes,
      isTimeSink,
    });
  }

  // 2. Identify Opportunity Cost
  const timeSink = timeAllocations.find((t) => t.isTimeSink);
  let opportunityCost: OpportunityCostAnalysis = {
    detected: false,
    explanation:
      "No significant opportunity cost detected. Problem selection matched difficulty order smoothly.",
  };

  if (timeSink) {
    // Look for an unattempted or later problem that was lower rated or highly solved
    const easierUnsolved = session.problems.find(
      (p) =>
        p.index > timeSink.problemIndex &&
        !user.results[p.index]?.isSolved &&
        (p.rating <= timeSink.rating || p.solvedCount > 5000)
    );

    if (easierUnsolved) {
      opportunityCost = {
        detected: true,
        overlookedProblemIndex: easierUnsolved.index,
        overlookedProblemName: easierUnsolved.name,
        overlookedProblemRating: easierUnsolved.rating,
        stuckOnProblemIndex: timeSink.problemIndex,
        stuckMinutes: timeSink.minutesSpent,
        explanation: `Stuck ${timeSink.minutesSpent} minutes on Problem ${timeSink.problemIndex} (${timeSink.rating}), leaving Problem ${easierUnsolved.index} (${easierUnsolved.rating}, solved by ${easierUnsolved.solvedCount.toLocaleString()} participants) unattempted. Reading Problem ${easierUnsolved.index} earlier could have secured an extra AC.`,
      };
    }
  }

  // 3. Strategic Findings
  const findings: StrategicFinding[] = [];

  // Opening speed check
  const probA = timeAllocations.find((t) => t.problemIndex === "A");
  if (probA && probA.isSolved && probA.minutesSpent <= 10) {
    findings.push({
      severity: "POSITIVE",
      category: "STREAK",
      title: "Rapid Early Opening",
      description: `Problem A solved in ${probA.minutesSpent} minutes cleanly. Fast starts reduce psychological pressure and establish strong pacing.`,
      impact: "Low initial penalty and high rank momentum.",
    });
  }

  // Time sink warning
  if (timeSink) {
    findings.push({
      severity: "CRITICAL",
      category: "TIME_ALLOCATION",
      title: `Time Sink on Problem ${timeSink.problemIndex}`,
      description: `Invested ${timeSink.minutesSpent} minutes on Problem ${timeSink.problemIndex} (${timeSink.rating} rating) vs expected ${timeSink.expectedMinutes} mins.`,
      impact: `Consolidated ${Math.round((timeSink.minutesSpent / session.durationMinutes) * 100)}% of total contest time on a single task.`,
    });
  }

  // Penalty check
  let totalRejections = 0;
  for (const res of Object.values(user.results)) {
    totalRejections += res.rejectedAttempts;
  }

  if (totalRejections >= 3) {
    findings.push({
      severity: "WARNING",
      category: "PENALTY_DISCIPLINE",
      title: "High Penalty Accumulation",
      description: `Incurred ${totalRejections} rejected submissions prior to accepted solutions, adding +${totalRejections * 20} penalty minutes.`,
      impact: "Cost 2-4 places on the final scoreboard due to tie-breaker penalties.",
    });
  } else if (totalRejections === 0 && solvedCount >= 2) {
    findings.push({
      severity: "POSITIVE",
      category: "PENALTY_DISCIPLINE",
      title: "Clean First-Try Accuracy",
      description: "Zero rejected submissions across all solved problems. Perfect submission discipline.",
      impact: "Minimized penalty tie-breakers against competitor bots.",
    });
  }

  // 4. Performance Rating & Delta Projection
  const divisionAnchors: Record<string, number> = {
    DIV1: 2200,
    DIV2: 1700,
    DIV3: 1350,
    DIV4: 1100,
    EDUCATIONAL: 1650,
  };
  const anchor = divisionAnchors[session.division] || 1500;

  const percentile = (finalRank - 0.5) / totalParticipants;
  const rankPercentile = Math.round(percentile * 1000) / 10; // e.g. 25.4%

  // Log-odds performance rating formula
  const solvedProblems = session.problems.filter((p) => user.results[p.index]?.isSolved);
  const maxSolvedRating = solvedProblems.length > 0
    ? Math.max(...solvedProblems.map((p) => p.rating))
    : 0;

  const performanceOffset = Math.round(
    380 * Math.log((1 - percentile + 0.08) / (percentile + 0.08))
  );
  const rawPerf = anchor + performanceOffset;
  const virtualPerformanceRating = Math.max(
    800,
    maxSolvedRating > 0 ? Math.max(rawPerf, maxSolvedRating) : rawPerf
  );

  // Projected delta against current rating
  const ratingDeltaProjection = Math.round((virtualPerformanceRating - userCurrentRating) / 4.2);

  // 5. Action Items
  const actionItems: string[] = [];
  if (opportunityCost.detected) {
    actionItems.push(
      `Implement 25-Minute Pivot Rule: If no algorithmic invariant is proven on Problem ${timeSink?.problemIndex} after 25 minutes, spend 5 minutes reading Problem ${opportunityCost.overlookedProblemIndex}.`
    );
  }
  if (totalRejections >= 3) {
    actionItems.push(
      "Local Stress Testing: Before submitting, generate adversarial edge cases (N=1, N=max, empty strings, max bounds) to catch Wrong Answers."
    );
  }
  actionItems.push(
    `Upsolve missed Problem ${
      session.problems.find((p) => !user.results[p.index]?.isSolved)?.index || "D"
    } within 48 hours to retain context.`
  );

  // 6. Recommended Upsolves
  const recommendedUpsolves: AutopsyUpsolveItem[] = session.problems
    .filter((p) => !user.results[p.index]?.isSolved)
    .map((p) => {
      const delta = Math.abs(p.rating - userCurrentRating);
      const yieldScore = Math.max(35, Math.min(98, Math.round(100 - delta / 6)));
      return {
        problemIndex: p.index,
        name: p.name,
        rating: p.rating,
        tags: p.tags,
        yieldScore,
        reason: `Missed in ${session.contestTitle}. Rated ${p.rating} (${p.rating - userCurrentRating >= 0 ? "+" : ""}${p.rating - userCurrentRating} delta), optimal for building mastery in ${p.tags.join(", ")}.`,
      };
    })
    .sort((a, b) => b.yieldScore - a.yieldScore);

  return {
    sessionId: session.id,
    contestTitle: session.contestTitle,
    finalRank,
    totalParticipants,
    rankPercentile,
    solvedCount,
    totalProblems,
    totalPenaltyMinutes,
    virtualPerformanceRating,
    ratingDeltaProjection,
    timeAllocations,
    findings,
    opportunityCost,
    actionItems,
    recommendedUpsolves,
  };
}
