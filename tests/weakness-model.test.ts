import { describe, it, expect } from "vitest";
import {
  calculateFailureWeight,
  calculateSolveReward,
  calculateRecencyWeight,
  calculateTopicWeakness,
  computeSkillVector,
  TopicSubmission,
} from "@/server/analytics/weakness-model";

describe("Topic Weakness Model & Skill Vector Engine", () => {
  describe("Mathematical Formula Weights", () => {
    it("assigns higher failure penalties to problems below current rating", () => {
      const userRating = 1600;
      const failLow = calculateFailureWeight(1200, userRating); // -400 diff
      const failEqual = calculateFailureWeight(1600, userRating); // 0 diff
      const failHigh = calculateFailureWeight(2200, userRating); // +600 diff

      expect(failLow).toBeGreaterThan(failEqual);
      expect(failEqual).toBeGreaterThan(failHigh);
      expect(failLow).toBeLessThanOrEqual(2.0);
      expect(failHigh).toBeGreaterThanOrEqual(0.5);
    });

    it("assigns higher rewards to solves on problems above current rating", () => {
      const userRating = 1500;
      const solveHigh = calculateSolveReward(1800, userRating);
      const solveEqual = calculateSolveReward(1500, userRating);
      const solveLow = calculateSolveReward(1000, userRating);

      expect(solveHigh).toBeGreaterThan(solveEqual);
      expect(solveEqual).toBeGreaterThan(solveLow);
      expect(solveLow).toBeGreaterThanOrEqual(0.4);
    });

    it("decays recency weights exponentially with a 60-day half life", () => {
      const now = 1700000000;
      const sixtyDaysSeconds = 60 * 86400;

      const weightNow = calculateRecencyWeight(now, now);
      const weight60Days = calculateRecencyWeight(now - sixtyDaysSeconds, now);
      const weight120Days = calculateRecencyWeight(now - 2 * sixtyDaysSeconds, now);

      expect(weightNow).toBeCloseTo(1.0, 4);
      expect(weight60Days).toBeCloseTo(0.5, 2);
      expect(weight120Days).toBeCloseTo(0.25, 2);
    });
  });

  describe("calculateTopicWeakness", () => {
    const now = 1700000000;
    const userRating = 1600;

    it("returns high weakness score when user repeatedly fails problems near/below rating", () => {
      const submissions = [
        { rating: 1400, verdict: "WRONG_ANSWER", creationTimeSeconds: now - 3600 },
        { rating: 1500, verdict: "WRONG_ANSWER", creationTimeSeconds: now - 7200 },
        { rating: 1300, verdict: "TIME_LIMIT_EXCEEDED", creationTimeSeconds: now - 10800 },
        { rating: 1500, verdict: "OK", creationTimeSeconds: now - 14400 },
      ];

      const result = calculateTopicWeakness({
        submissions,
        userRating,
        nowSeconds: now,
      });

      expect(result.failedCount).toBe(3);
      expect(result.solvedCount).toBe(1);
      expect(result.weaknessScore).toBeGreaterThanOrEqual(65);
    });

    it("returns low weakness score when user consistently solves problems at/above rating", () => {
      const submissions = [
        { rating: 1600, verdict: "OK", creationTimeSeconds: now - 3600 },
        { rating: 1700, verdict: "OK", creationTimeSeconds: now - 7200 },
        { rating: 1800, verdict: "OK", creationTimeSeconds: now - 10800 },
        { rating: 1900, verdict: "WRONG_ANSWER", creationTimeSeconds: now - 14400 }, // High-rated failure is forgiven
      ];

      const result = calculateTopicWeakness({
        submissions,
        userRating,
        nowSeconds: now,
      });

      expect(result.solvedCount).toBe(3);
      expect(result.failedCount).toBe(1);
      expect(result.weaknessScore).toBeLessThan(45);
      expect(result.avgSolvedRating).toBe(1700);
      expect(result.maxSolvedRating).toBe(1800);
    });

    it("handles empty submissions cleanly", () => {
      const result = calculateTopicWeakness({
        submissions: [],
        userRating,
        nowSeconds: now,
      });

      expect(result.weaknessScore).toBe(50);
      expect(result.solvedCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });
  });

  describe("computeSkillVector", () => {
    const now = 1700000000;
    const userRating = 1600;

    const mockSubmissions: TopicSubmission[] = [
      // DP: 6 failures on 1400-1500 rating -> CRITICAL_WEAKNESS
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `dp-fail-${i}`,
        problemId: `prob-dp-f-${i}`,
        problemName: `DP Problem ${i}`,
        rating: 1450,
        tags: ["dp"],
        verdict: "WRONG_ANSWER",
        creationTimeSeconds: now - i * 86400,
      })),
      {
        id: "dp-solve-1",
        problemId: "prob-dp-s-1",
        problemName: "DP Problem Solved",
        rating: 1400,
        tags: ["dp"],
        verdict: "OK",
        creationTimeSeconds: now - 1000,
      },

      // Graphs: 8 solves on 1650-1800 rating -> PROFICIENT or MASTERED
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `graph-solve-${i}`,
        problemId: `prob-g-${i}`,
        problemName: `Graph Problem ${i}`,
        rating: 1700,
        tags: ["graphs"],
        verdict: "OK",
        creationTimeSeconds: now - i * 86400,
      })),

      // Strings: only 2 submissions -> NEEDS_DATA
      {
        id: "str-1",
        problemId: "prob-str-1",
        problemName: "String Problem 1",
        rating: 1300,
        tags: ["strings"],
        verdict: "OK",
        creationTimeSeconds: now - 5000,
      },
      {
        id: "str-2",
        problemId: "prob-str-2",
        problemName: "String Problem 2",
        rating: 1500,
        tags: ["strings"],
        verdict: "WRONG_ANSWER",
        creationTimeSeconds: now - 3000,
      },
    ];

    it("correctly groups tags and classifies CRITICAL_WEAKNESS, PROFICIENT, and NEEDS_DATA", () => {
      const { skillVector, summary } = computeSkillVector({
        submissions: mockSubmissions,
        userRating,
        nowSeconds: now,
      });

      expect(skillVector.length).toBe(3);

      const dp = skillVector.find((t) => t.tag === "dp")!;
      expect(dp).toBeDefined();
      expect(dp.status).toBe("CRITICAL_WEAKNESS");
      expect(dp.failedCount).toBe(6);
      expect(dp.solvedCount).toBe(1);
      expect(dp.weaknessScore).toBeGreaterThanOrEqual(65);
      expect(dp.actionRecommendation).toContain("Critical weakness detected in dp");

      const graphs = skillVector.find((t) => t.tag === "graphs")!;
      expect(graphs).toBeDefined();
      expect(graphs.solvedCount).toBe(8);
      expect(graphs.failedCount).toBe(0);
      expect(graphs.successRate).toBe(100);
      expect(graphs.weaknessScore).toBeLessThan(40);
      expect(graphs.status === "PROFICIENT" || graphs.status === "MASTERED").toBe(true);

      const strings = skillVector.find((t) => t.tag === "strings")!;
      expect(strings).toBeDefined();
      expect(strings.status).toBe("NEEDS_DATA");
      expect(strings.totalSubmissions).toBe(2);

      // Verify summary lists
      expect(summary.criticalWeaknesses).toHaveLength(1);
      expect(summary.criticalWeaknesses[0].tag).toBe("dp");
      expect(summary.radarSkills.length).toBeGreaterThan(0);
    });

    it("sorts topics with critical weaknesses first", () => {
      const { skillVector } = computeSkillVector({
        submissions: mockSubmissions,
        userRating,
        nowSeconds: now,
      });

      expect(skillVector[0].status).toBe("CRITICAL_WEAKNESS");
      expect(skillVector[0].tag).toBe("dp");
    });
  });
});
