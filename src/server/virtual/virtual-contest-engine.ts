import {
  ParticipantProblemResult,
  SubmissionVerdict,
  VirtualContestProblem,
  VirtualContestSession,
  VirtualParticipant,
  VirtualSubmission,
} from "./types";
import { PRESET_CONTESTS, PresetContestDefinition } from "./preset-contests";

/**
 * Calculates ICPC-style contest metrics: Solved problem count and penalty time
 * Penalty = solve_minute + 20 * rejected_attempts_prior_to_AC
 */
export function calculateICPCScore(
  results: Record<string, ParticipantProblemResult>
): { solvedCount: number; totalPenaltyMinutes: number } {
  let solvedCount = 0;
  let totalPenaltyMinutes = 0;

  for (const res of Object.values(results)) {
    if (res.isSolved && res.solveTimeMinutes !== null) {
      solvedCount++;
      const penalty = res.solveTimeMinutes + 20 * res.rejectedAttempts;
      totalPenaltyMinutes += penalty;
    }
  }

  return { solvedCount, totalPenaltyMinutes };
}

/**
 * Calculates Codeforces-style decaying points per problem
 * Points = max(0.3 * P, P - floor(decayRate * solveMinutes) - 50 * rejectedAttempts)
 */
export function calculateCFScore(
  results: Record<string, ParticipantProblemResult>,
  problems: VirtualContestProblem[],
  durationMinutes = 120
): { totalPoints: number } {
  let totalPoints = 0;
  const problemMap = new Map(problems.map((p) => [p.index, p]));

  for (const [index, res] of Object.entries(results)) {
    if (res.isSolved && res.solveTimeMinutes !== null) {
      const prob = problemMap.get(index);
      const basePoints = prob ? prob.points : 500;
      const decayPerMinute = (basePoints * 0.7) / durationMinutes;
      const decayed =
        basePoints - Math.floor(decayPerMinute * res.solveTimeMinutes) - 50 * res.rejectedAttempts;
      const finalPoints = Math.max(Math.floor(basePoints * 0.3), decayed);
      totalPoints += finalPoints;
    }
  }

  return { totalPoints };
}

/**
 * Sorts participants and assigns 1-based ranks
 */
export function sortLeaderboard(
  participants: VirtualParticipant[],
  scoringMode: "ICPC" | "CF" = "ICPC"
): VirtualParticipant[] {
  const sorted = [...participants].sort((a, b) => {
    if (scoringMode === "CF") {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.totalPenaltyMinutes - b.totalPenaltyMinutes;
    }

    // Default ICPC sorting
    if (b.solvedCount !== a.solvedCount) {
      return b.solvedCount - a.solvedCount;
    }
    return a.totalPenaltyMinutes - b.totalPenaltyMinutes;
  });

  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Initializes a new Virtual Contest session from presets
 */
export function initVirtualContestSession(
  contestId: number,
  userHandle = "Alex_Algo",
  userRating = 1540,
  scoringMode: "ICPC" | "CF" = "ICPC"
): VirtualContestSession {
  const preset = PRESET_CONTESTS.find((c) => c.id === contestId) || PRESET_CONTESTS[0];

  const nowSeconds = Math.floor(Date.now() / 1000);

  // Initialize empty problem results for the user
  const initialUserResults: Record<string, ParticipantProblemResult> = {};
  for (const prob of preset.problems) {
    initialUserResults[prob.index] = {
      problemIndex: prob.index,
      isSolved: false,
      solveTimeMinutes: null,
      rejectedAttempts: 0,
      points: 0,
      icpcPenaltyMinutes: 0,
    };
  }

  const userParticipant: VirtualParticipant = {
    id: `user-${userHandle.toLowerCase()}`,
    handle: userHandle,
    isUser: true,
    rank: 1,
    rating: userRating,
    avatar: "https://userpic.codeforces.org/no-title.jpg",
    solvedCount: 0,
    totalPoints: 0,
    totalPenaltyMinutes: 0,
    results: initialUserResults,
  };

  // Clone bot competitors with clean initial states (unsolved at elapsed = 0)
  const initialBots: VirtualParticipant[] = preset.botCompetitors.map((bot) => {
    const cleanResults: Record<string, ParticipantProblemResult> = {};
    for (const prob of preset.problems) {
      cleanResults[prob.index] = {
        problemIndex: prob.index,
        isSolved: false,
        solveTimeMinutes: null,
        rejectedAttempts: 0,
        points: 0,
        icpcPenaltyMinutes: 0,
      };
    }

    return {
      ...bot,
      solvedCount: 0,
      totalPoints: 0,
      totalPenaltyMinutes: 0,
      results: cleanResults,
    };
  });

  const allParticipants = sortLeaderboard([userParticipant, ...initialBots], scoringMode);

  return {
    id: `vc-${preset.id}-${Date.now()}`,
    contestId: preset.id,
    contestTitle: preset.title,
    division: preset.division,
    durationMinutes: preset.durationMinutes,
    startedAtSeconds: nowSeconds,
    pausedAtSeconds: null,
    elapsedSeconds: 0,
    status: "RUNNING",
    scoringMode,
    problems: preset.problems,
    submissions: [],
    participants: allParticipants,
    userHandle,
  };
}

/**
 * Advances the virtual contest simulation clock and updates bot solve events
 */
export function advanceContestClock(
  session: VirtualContestSession,
  newElapsedSeconds: number
): VirtualContestSession {
  const maxSeconds = session.durationMinutes * 60;
  const clampedElapsed = Math.min(Math.max(0, newElapsedSeconds), maxSeconds);
  const isFinished = clampedElapsed >= maxSeconds;

  // Update bots based on botSchedule
  const updatedParticipants = session.participants.map((p) => {
    if (p.isUser || !p.botSchedule) {
      return p;
    }

    const updatedResults = { ...p.results };

    for (const sched of p.botSchedule) {
      if (sched.solveElapsedSeconds <= clampedElapsed) {
        const solveMins = Math.floor(sched.solveElapsedSeconds / 60);
        const penalty = solveMins + 20 * sched.failedAttemptsBeforeAc;

        const prob = session.problems.find((pr) => pr.index === sched.problemIndex);
        const basePts = prob ? prob.points : 500;
        const decayPerMin = (basePts * 0.7) / session.durationMinutes;
        const points = Math.max(
          Math.floor(basePts * 0.3),
          basePts - Math.floor(decayPerMin * solveMins) - 50 * sched.failedAttemptsBeforeAc
        );

        updatedResults[sched.problemIndex] = {
          problemIndex: sched.problemIndex,
          isSolved: true,
          solveTimeMinutes: solveMins,
          rejectedAttempts: sched.failedAttemptsBeforeAc,
          points,
          icpcPenaltyMinutes: penalty,
        };
      }
    }

    const { solvedCount, totalPenaltyMinutes } = calculateICPCScore(updatedResults);
    const { totalPoints } = calculateCFScore(updatedResults, session.problems, session.durationMinutes);

    return {
      ...p,
      solvedCount,
      totalPoints,
      totalPenaltyMinutes,
      results: updatedResults,
    };
  });

  const sortedLeaderboard = sortLeaderboard(updatedParticipants, session.scoringMode);

  return {
    ...session,
    elapsedSeconds: clampedElapsed,
    status: isFinished ? "COMPLETED" : session.status === "PAUSED" ? "PAUSED" : "RUNNING",
    participants: sortedLeaderboard,
  };
}

/**
 * Processes an in-contest solution submission
 */
export function submitProblem(
  session: VirtualContestSession,
  submissionInput: {
    problemIndex: string;
    verdict: SubmissionVerdict;
    language?: string;
    testset?: string;
  }
): { session: VirtualContestSession; submission: VirtualSubmission } {
  const { problemIndex, verdict, language = "GNU C++20", testset = "TESTS" } = submissionInput;

  const currentElapsed = session.elapsedSeconds;
  const currentMinute = Math.floor(currentElapsed / 60);

  const newSubmission: VirtualSubmission = {
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    problemIndex,
    submittedAtSeconds: currentElapsed,
    verdict,
    testset,
    passedCount: verdict === "OK" ? 45 : Math.floor(Math.random() * 20) + 1,
    timeConsumedMs: verdict === "TIME_LIMIT_EXCEEDED" ? 2000 : Math.floor(Math.random() * 150) + 30,
    memoryConsumedBytes: Math.floor(Math.random() * 1024 * 1024 * 10) + 1024 * 1024,
    language,
  };

  const updatedSubmissions = [newSubmission, ...session.submissions];

  // Update user's participant result
  const user = session.participants.find((p) => p.isUser);
  if (!user) {
    throw new Error("User participant not found in contest session.");
  }

  const existingRes = user.results[problemIndex] || {
    problemIndex,
    isSolved: false,
    solveTimeMinutes: null,
    rejectedAttempts: 0,
    points: 0,
    icpcPenaltyMinutes: 0,
  };

  let updatedRes: ParticipantProblemResult = { ...existingRes };

  if (!existingRes.isSolved) {
    if (verdict === "OK") {
      const penalty = currentMinute + 20 * existingRes.rejectedAttempts;
      const prob = session.problems.find((p) => p.index === problemIndex);
      const basePts = prob ? prob.points : 500;
      const decayPerMin = (basePts * 0.7) / session.durationMinutes;
      const points = Math.max(
        Math.floor(basePts * 0.3),
        basePts - Math.floor(decayPerMin * currentMinute) - 50 * existingRes.rejectedAttempts
      );

      updatedRes = {
        ...existingRes,
        isSolved: true,
        solveTimeMinutes: currentMinute,
        points,
        icpcPenaltyMinutes: penalty,
      };
    } else {
      // Non-OK increment rejected attempts
      updatedRes = {
        ...existingRes,
        rejectedAttempts: existingRes.rejectedAttempts + 1,
      };
    }
  }

  const updatedUserResults = {
    ...user.results,
    [problemIndex]: updatedRes,
  };

  const { solvedCount, totalPenaltyMinutes } = calculateICPCScore(updatedUserResults);
  const { totalPoints } = calculateCFScore(
    updatedUserResults,
    session.problems,
    session.durationMinutes
  );

  const updatedUser: VirtualParticipant = {
    ...user,
    solvedCount,
    totalPoints,
    totalPenaltyMinutes,
    results: updatedUserResults,
  };

  const updatedParticipants = session.participants.map((p) => (p.isUser ? updatedUser : p));
  const sortedLeaderboard = sortLeaderboard(updatedParticipants, session.scoringMode);

  return {
    session: {
      ...session,
      submissions: updatedSubmissions,
      participants: sortedLeaderboard,
    },
    submission: newSubmission,
  };
}
