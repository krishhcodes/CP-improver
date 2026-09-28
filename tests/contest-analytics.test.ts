import { describe, it, expect } from "vitest";
import {
  analyzeContestPerformance,
  formatContestSeconds,
} from "@/server/analytics/contest-analytics";

describe("Contest Analytics Engine", () => {
  describe("formatContestSeconds", () => {
    it("formats 0 seconds as 00:00:00", () => {
      expect(formatContestSeconds(0)).toBe("00:00:00");
    });

    it("formats 854 seconds as 00:14:14", () => {
      expect(formatContestSeconds(854)).toBe("00:14:14");
    });

    it("formats 7325 seconds as 02:02:05", () => {
      expect(formatContestSeconds(7325)).toBe("02:02:05");
    });

    it("clamps negative seconds to 00:00:00", () => {
      expect(formatContestSeconds(-100)).toBe("00:00:00");
    });
  });

  describe("analyzeContestPerformance", () => {
    const mockContest = {
      id: 2000,
      name: "Codeforces Round 999 (Div. 2)",
      startTimeSeconds: 1700000000,
      durationSeconds: 7200, // 2 hours
    };

    const mockProblems = [
      { index: "A", name: "Array Minima", rating: 800, tags: ["greedy", "math"] },
      { index: "B", name: "Bitwise Magic", rating: 1200, tags: ["bitmasks"] },
      { index: "C", name: "Counting Trees", rating: 1500, tags: ["dp", "trees"] },
      { index: "D", name: "Divide and Conquer", rating: 1900, tags: ["divide and conquer"] },
      { index: "E", name: "Extreme Shortest Path", rating: 2400, tags: ["graphs", "shortest paths"] },
    ];

    it("correctly classifies SOLVED_DURING_CONTEST, FAILED_DURING_CONTEST, UPSOLVED_LATER, and MISSED", () => {
      const submissions = [
        // Problem A: 1 WA at minute 10 (600s), 1 AC at minute 15 (900s)
        {
          id: "sub-1",
          problemIndex: "A",
          problemName: "Array Minima",
          creationTimeSeconds: 1700000600,
          relativeTimeSeconds: 600,
          verdict: "WRONG_ANSWER",
          passedTestCount: 3,
        },
        {
          id: "sub-2",
          problemIndex: "A",
          problemName: "Array Minima",
          creationTimeSeconds: 1700000900,
          relativeTimeSeconds: 900,
          verdict: "OK",
          passedTestCount: 15,
        },
        // Problem B: 1 AC at minute 45 (2700s) on first attempt
        {
          id: "sub-3",
          problemIndex: "B",
          problemName: "Bitwise Magic",
          creationTimeSeconds: 1700002700,
          relativeTimeSeconds: 2700,
          verdict: "OK",
          passedTestCount: 20,
        },
        // Problem C: 2 WA during contest (minute 70 and 90), 0 AC
        {
          id: "sub-4",
          problemIndex: "C",
          problemName: "Counting Trees",
          creationTimeSeconds: 1700004200,
          relativeTimeSeconds: 4200,
          verdict: "WRONG_ANSWER",
          passedTestCount: 8,
        },
        {
          id: "sub-5",
          problemIndex: "C",
          problemName: "Counting Trees",
          creationTimeSeconds: 1700005400,
          relativeTimeSeconds: 5400,
          verdict: "TIME_LIMIT_EXCEEDED",
          passedTestCount: 12,
        },
        // Problem D: 1 WA during contest (minute 100), 1 AC 3 hours after contest (18000s)
        {
          id: "sub-6",
          problemIndex: "D",
          problemName: "Divide and Conquer",
          creationTimeSeconds: 1700006000,
          relativeTimeSeconds: 6000,
          verdict: "WRONG_ANSWER",
          passedTestCount: 4,
        },
        {
          id: "sub-7",
          problemIndex: "D",
          problemName: "Divide and Conquer",
          creationTimeSeconds: 1700018000,
          relativeTimeSeconds: 18000, // outside duration (7200s)
          verdict: "OK",
          passedTestCount: 35,
        },
        // Problem E: 0 submissions (MISSED)
      ];

      const metrics = analyzeContestPerformance({
        contest: mockContest,
        participation: {
          rank: 421,
          oldRating: 1550,
          newRating: 1610,
          ratingChange: 60,
        },
        contestProblems: mockProblems,
        submissions,
      });

      // Assert counts
      expect(metrics.totalProblemsCount).toBe(5);
      expect(metrics.solvedDuringContestCount).toBe(2); // A and B
      expect(metrics.failedDuringContestCount).toBe(1); // C
      expect(metrics.upsolvedLaterCount).toBe(1); // D
      expect(metrics.missedCount).toBe(1); // E

      // Assert Problem A
      const probA = metrics.problemAnalyses.find((p) => p.index === "A")!;
      expect(probA.status).toBe("SOLVED_DURING_CONTEST");
      expect(probA.attemptsDuringContest).toBe(2);
      expect(probA.acceptedAtRelativeTimeSeconds).toBe(900);
      expect(probA.timeSpentMinutes).toBe(15);

      // Assert Problem B
      const probB = metrics.problemAnalyses.find((p) => p.index === "B")!;
      expect(probB.status).toBe("SOLVED_DURING_CONTEST");
      expect(probB.attemptsDuringContest).toBe(1);
      expect(probB.acceptedAtRelativeTimeSeconds).toBe(2700);
      expect(probB.timeSpentMinutes).toBe(45);

      // Assert Problem C
      const probC = metrics.problemAnalyses.find((p) => p.index === "C")!;
      expect(probC.status).toBe("FAILED_DURING_CONTEST");
      expect(probC.attemptsDuringContest).toBe(2);

      // Assert Problem D
      const probD = metrics.problemAnalyses.find((p) => p.index === "D")!;
      expect(probD.status).toBe("UPSOLVED_LATER");
      expect(probD.attemptsDuringContest).toBe(1);
      expect(probD.attemptsAfterContest).toBe(1);

      // Assert Problem E
      const probE = metrics.problemAnalyses.find((p) => p.index === "E")!;
      expect(probE.status).toBe("MISSED");
      expect(probE.attemptsDuringContest).toBe(0);
      expect(probE.attemptsAfterContest).toBe(0);

      // First AC should be Problem A at 15 minutes
      expect(metrics.timeToFirstAcMinutes).toBe(15);

      // Total penalty time:
      // Prob A: 15 mins + (2 attempts - 1) * 20 = 35 mins
      // Prob B: 45 mins + (1 attempt - 1) * 20 = 45 mins
      // Total = 80 mins
      expect(metrics.totalPenaltyTimeMinutes).toBe(80);

      // Rating and Rank
      expect(metrics.rank).toBe(421);
      expect(metrics.ratingChange).toBe(60);
      expect(metrics.newRating).toBe(1610);
    });

    it("orders official timeline chronologically and excludes post-contest submissions", () => {
      const submissions = [
        {
          id: "sub-after",
          problemIndex: "C",
          problemName: "Counting Trees",
          creationTimeSeconds: 1700010000,
          relativeTimeSeconds: 10000, // Post contest
          verdict: "OK",
          passedTestCount: 20,
        },
        {
          id: "sub-2",
          problemIndex: "A",
          problemName: "Array Minima",
          creationTimeSeconds: 1700001200,
          relativeTimeSeconds: 1200, // minute 20
          verdict: "OK",
          passedTestCount: 10,
        },
        {
          id: "sub-1",
          problemIndex: "A",
          problemName: "Array Minima",
          creationTimeSeconds: 1700000300,
          relativeTimeSeconds: 300, // minute 5
          verdict: "WRONG_ANSWER",
          passedTestCount: 2,
        },
      ];

      const metrics = analyzeContestPerformance({
        contest: mockContest,
        contestProblems: mockProblems.slice(0, 3),
        submissions,
      });

      // Post-contest submission should NOT be in official timeline
      expect(metrics.timeline).toHaveLength(2);
      expect(metrics.timeline[0].submissionId).toBe("sub-1");
      expect(metrics.timeline[0].relativeTimeSeconds).toBe(300);
      expect(metrics.timeline[0].formattedTime).toBe("00:05:00");
      expect(metrics.timeline[0].isAccepted).toBe(false);

      expect(metrics.timeline[1].submissionId).toBe("sub-2");
      expect(metrics.timeline[1].relativeTimeSeconds).toBe(1200);
      expect(metrics.timeline[1].formattedTime).toBe("00:20:00");
      expect(metrics.timeline[1].isAccepted).toBe(true);
    });
  });
});
