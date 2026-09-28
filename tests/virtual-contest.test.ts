import { describe, it, expect } from "vitest";
import {
  calculateICPCScore,
  calculateCFScore,
  sortLeaderboard,
  initVirtualContestSession,
  advanceContestClock,
  submitProblem,
} from "../src/server/virtual/virtual-contest-engine";
import { generatePostContestAutopsy } from "../src/server/virtual/post-contest-autopsy";
import {
  ParticipantProblemResult,
  VirtualContestProblem,
  VirtualParticipant,
} from "../src/server/virtual/types";

describe("Virtual Contest Simulation Engine", () => {
  describe("calculateICPCScore", () => {
    it("should calculate correct solved count and penalty time under ICPC rules", () => {
      const results: Record<string, ParticipantProblemResult> = {
        A: {
          problemIndex: "A",
          isSolved: true,
          solveTimeMinutes: 10,
          rejectedAttempts: 0,
          points: 480,
          icpcPenaltyMinutes: 10,
        },
        B: {
          problemIndex: "B",
          isSolved: true,
          solveTimeMinutes: 25,
          rejectedAttempts: 2, // 25 + 2 * 20 = 65
          points: 800,
          icpcPenaltyMinutes: 65,
        },
        C: {
          problemIndex: "C",
          isSolved: false,
          solveTimeMinutes: null,
          rejectedAttempts: 3, // Unsolved: 0 penalty
          points: 0,
          icpcPenaltyMinutes: 0,
        },
      };

      const score = calculateICPCScore(results);
      expect(score.solvedCount).toBe(2);
      expect(score.totalPenaltyMinutes).toBe(10 + 65); // 75
    });

    it("should return zero when no problems are solved", () => {
      const score = calculateICPCScore({});
      expect(score.solvedCount).toBe(0);
      expect(score.totalPenaltyMinutes).toBe(0);
    });
  });

  describe("calculateCFScore", () => {
    it("should calculate decaying points with 50-point penalty per failed attempt", () => {
      const mockProblems: VirtualContestProblem[] = [
        {
          id: "p1",
          contestId: 970,
          index: "A",
          name: "Prob A",
          rating: 800,
          tags: ["math"],
          points: 500,
          solvedCount: 1000,
          expectedSolveMinutes: 5,
          statementSummary: "",
          sampleInput: "",
          sampleOutput: "",
        },
      ];

      const results: Record<string, ParticipantProblemResult> = {
        A: {
          problemIndex: "A",
          isSolved: true,
          solveTimeMinutes: 20,
          rejectedAttempts: 1,
          points: 0,
          icpcPenaltyMinutes: 40,
        },
      };

      const { totalPoints } = calculateCFScore(results, mockProblems, 120);
      // Base: 500. Decay: (500 * 0.7) / 120 = 2.916 pts/min.
      // At 20 mins: 500 - 58 - 50 = 392
      expect(totalPoints).toBeGreaterThanOrEqual(150); // >= 30% floor
      expect(totalPoints).toBeLessThan(500);
    });
  });

  describe("sortLeaderboard", () => {
    it("should sort participants primarily by solved count and secondarily by penalty", () => {
      const participants: VirtualParticipant[] = [
        {
          id: "p1",
          handle: "CoderA",
          isUser: false,
          rank: 0,
          rating: 1500,
          avatar: "",
          solvedCount: 2,
          totalPoints: 1000,
          totalPenaltyMinutes: 120,
          results: {},
        },
        {
          id: "p2",
          handle: "CoderB",
          isUser: false,
          rank: 0,
          rating: 1600,
          avatar: "",
          solvedCount: 3,
          totalPoints: 1500,
          totalPenaltyMinutes: 180,
          results: {},
        },
        {
          id: "p3",
          handle: "CoderC",
          isUser: false,
          rank: 0,
          rating: 1700,
          avatar: "",
          solvedCount: 2,
          totalPoints: 1100,
          totalPenaltyMinutes: 70, // Less penalty than CoderA
          results: {},
        },
      ];

      const sorted = sortLeaderboard(participants, "ICPC");
      expect(sorted[0].handle).toBe("CoderB"); // 3 solves
      expect(sorted[0].rank).toBe(1);
      expect(sorted[1].handle).toBe("CoderC"); // 2 solves, 70m penalty
      expect(sorted[1].rank).toBe(2);
      expect(sorted[2].handle).toBe("CoderA"); // 2 solves, 120m penalty
      expect(sorted[2].rank).toBe(3);
    });
  });

  describe("initVirtualContestSession and advanceContestClock", () => {
    it("should initialize a valid session with user and competitor bots", () => {
      const session = initVirtualContestSession(970, "Alex_Algo", 1540);

      expect(session.contestId).toBe(970);
      expect(session.status).toBe("RUNNING");
      expect(session.elapsedSeconds).toBe(0);
      expect(session.problems.length).toBeGreaterThanOrEqual(5);

      const user = session.participants.find((p) => p.isUser);
      expect(user).toBeDefined();
      expect(user?.solvedCount).toBe(0);
    });

    it("should advance clock and trigger bot solves according to schedule", () => {
      const session = initVirtualContestSession(970, "Alex_Algo", 1540);
      // Advance to 60 minutes
      const updated = advanceContestClock(session, 60 * 60);

      expect(updated.elapsedSeconds).toBe(3600);
      const jiangly = updated.participants.find((p) => p.handle === "jiangly");
      expect(jiangly).toBeDefined();
      // Jiangly has multiple problems scheduled before 3600s
      expect(jiangly?.solvedCount).toBeGreaterThan(0);
    });

    it("should mark contest COMPLETED when elapsed reaches duration", () => {
      const session = initVirtualContestSession(970, "Alex_Algo", 1540);
      const finished = advanceContestClock(session, session.durationMinutes * 60);

      expect(finished.status).toBe("COMPLETED");
      expect(finished.elapsedSeconds).toBe(session.durationMinutes * 60);
    });
  });

  describe("submitProblem", () => {
    it("should record accepted solution and update user scoreboard stats", () => {
      let session = initVirtualContestSession(970, "Alex_Algo", 1540);
      // Advance to 10 mins
      session = advanceContestClock(session, 10 * 60);

      const { session: afterSub, submission } = submitProblem(session, {
        problemIndex: "A",
        verdict: "OK",
      });

      expect(submission.verdict).toBe("OK");
      expect(submission.problemIndex).toBe("A");

      const user = afterSub.participants.find((p) => p.isUser);
      expect(user?.solvedCount).toBe(1);
      expect(user?.results["A"].isSolved).toBe(true);
      expect(user?.results["A"].solveTimeMinutes).toBe(10);
      expect(user?.totalPenaltyMinutes).toBe(10);
    });

    it("should accumulate rejected attempts on non-OK verdicts", () => {
      let session = initVirtualContestSession(970, "Alex_Algo", 1540);
      session = advanceContestClock(session, 15 * 60);

      // Attempt 1: WA
      let res = submitProblem(session, {
        problemIndex: "B",
        verdict: "WRONG_ANSWER",
      });
      // Attempt 2: TLE
      res = submitProblem(res.session, {
        problemIndex: "B",
        verdict: "TIME_LIMIT_EXCEEDED",
      });

      let user = res.session.participants.find((p) => p.isUser);
      expect(user?.solvedCount).toBe(0);
      expect(user?.results["B"].rejectedAttempts).toBe(2);

      // Attempt 3: OK at 20 mins
      res.session = advanceContestClock(res.session, 20 * 60);
      res = submitProblem(res.session, {
        problemIndex: "B",
        verdict: "OK",
      });

      user = res.session.participants.find((p) => p.isUser);
      expect(user?.solvedCount).toBe(1);
      expect(user?.results["B"].isSolved).toBe(true);
      expect(user?.results["B"].rejectedAttempts).toBe(2);
      // Penalty: 20 + 20 * 2 = 60
      expect(user?.totalPenaltyMinutes).toBe(60);
    });
  });

  describe("Post-Contest Autopsy Diagnostician", () => {
    it("should identify time sink traps and opportunity cost when stuck on a problem", () => {
      let session = initVirtualContestSession(970, "Alex_Algo", 1540);

      // Solve Problem A quickly at minute 5
      session = advanceContestClock(session, 5 * 60);
      session = submitProblem(session, { problemIndex: "A", verdict: "OK" }).session;

      // Fail Problem C multiple times between minute 20 and 65 (45 minutes spent)
      session = advanceContestClock(session, 25 * 60);
      session = submitProblem(session, { problemIndex: "C", verdict: "WRONG_ANSWER" }).session;
      session = advanceContestClock(session, 45 * 60);
      session = submitProblem(session, { problemIndex: "C", verdict: "WRONG_ANSWER" }).session;
      session = advanceContestClock(session, 65 * 60);
      session = submitProblem(session, { problemIndex: "C", verdict: "WRONG_ANSWER" }).session;

      // Conclude contest
      session = advanceContestClock(session, session.durationMinutes * 60);

      const autopsy = generatePostContestAutopsy(session, 1540);

      expect(autopsy.solvedCount).toBe(1);
      expect(autopsy.finalRank).toBeGreaterThanOrEqual(1);
      expect(autopsy.virtualPerformanceRating).toBeGreaterThanOrEqual(800);
      expect(autopsy.timeAllocations.length).toBe(session.problems.length);

      // Check time sink on C
      const timeSinkC = autopsy.timeAllocations.find((t) => t.problemIndex === "C");
      expect(timeSinkC?.isTimeSink).toBe(true);

      // Check opportunity cost detected (Problem D had lower rating or high solves)
      expect(autopsy.opportunityCost.detected).toBe(true);
      expect(autopsy.opportunityCost.stuckOnProblemIndex).toBe("C");

      // Check strategic findings
      expect(autopsy.findings.some((f) => f.category === "TIME_ALLOCATION")).toBe(true);
      expect(autopsy.actionItems.length).toBeGreaterThanOrEqual(2);
      expect(autopsy.recommendedUpsolves.length).toBeGreaterThan(0);
    });

    it("should throw error if user participant is missing", () => {
      let session = initVirtualContestSession(970, "Alex_Algo", 1540);
      session.participants = session.participants.filter((p) => !p.isUser);

      expect(() => {
        generatePostContestAutopsy(session, 1540);
      }).toThrow();
    });
  });
});
