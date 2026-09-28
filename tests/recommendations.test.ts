import { describe, it, expect } from "vitest";
import {
  calculateRatingFit,
  generateExplainableReason,
  generateRecommendations,
  ProblemCandidate,
} from "@/server/recommendations/recommendation-engine";
import { generateAdaptiveTrainingPlan } from "@/server/recommendations/training-plan";

describe("Explainable Recommendation Engine", () => {
  describe("calculateRatingFit", () => {
    it("returns 1.0 when problem rating equals target rating", () => {
      const fit = calculateRatingFit(1600, 1600);
      expect(fit).toBe(1.0);
    });

    it("decays smoothly as distance from target rating increases", () => {
      const target = 1600;
      const fitClose = calculateRatingFit(1650, target);
      const fitFar = calculateRatingFit(1900, target);

      expect(fitClose).toBeLessThan(1.0);
      expect(fitClose).toBeGreaterThan(fitFar);
      expect(fitFar).toBeGreaterThan(0.0);
    });

    it("behaves symmetrically above and below target rating", () => {
      const target = 1600;
      const fitAbove = calculateRatingFit(1700, target);
      const fitBelow = calculateRatingFit(1500, target);

      expect(fitAbove).toBeCloseTo(fitBelow, 5);
    });
  });

  describe("generateExplainableReason", () => {
    it("generates structured explanation for STRENGTHENING category", () => {
      const reason = generateExplainableReason({
        problemName: "Array Description",
        rating: 1500,
        tags: ["dp", "math"],
        category: "STRENGTHENING",
        userRating: 1600,
        weakestTag: "dp",
        weaknessScore: 68,
      });

      expect(reason).toContain("Array Description");
      expect(reason).toContain("dp");
      expect(reason).toContain("32/100"); // 100 - 68 proficiency
      expect(reason).toContain("-100");
    });

    it("generates structured explanation for PROGRESSION category", () => {
      const reason = generateExplainableReason({
        problemName: "Tree Cutting",
        rating: 1800,
        tags: ["trees", "graphs"],
        category: "PROGRESSION",
        userRating: 1600,
      });

      expect(reason).toContain("Tree Cutting");
      expect(reason).toContain("+200");
      expect(reason).toContain("Targeted stretch problem");
    });
  });

  describe("generateRecommendations", () => {
    const mockProblems: ProblemCandidate[] = [
      { id: "p1", contestId: 1001, index: "A", name: "Problem A", rating: 1200, tags: ["greedy"], solvedCount: 5000 },
      { id: "p2", contestId: 1001, index: "B", name: "Problem B", rating: 1500, tags: ["dp"], solvedCount: 4000 },
      { id: "p3", contestId: 1001, index: "C", name: "Problem C", rating: 1650, tags: ["dp", "trees"], solvedCount: 3000 },
      { id: "p4", contestId: 1001, index: "D", name: "Problem D", rating: 1850, tags: ["graphs"], solvedCount: 2000 },
      { id: "p5", contestId: 1001, index: "E", name: "Problem E", rating: 2200, tags: ["data structures"], solvedCount: 1000 },
    ];

    it("filters out problems already solved by user", () => {
      const solvedKeys = new Set(["1001-B", "p1"]);

      const recs = generateRecommendations({
        candidateProblems: mockProblems,
        userSolvedProblemKeys: solvedKeys,
        userRating: 1600,
      });

      expect(recs.find((r) => r.id === "p1")).toBeUndefined();
      expect(recs.find((r) => r.index === "B")).toBeUndefined();
      expect(recs.length).toBe(3); // p3, p4, p5
    });

    it("filters by topic when topicFilter is provided", () => {
      const recs = generateRecommendations({
        candidateProblems: mockProblems,
        userSolvedProblemKeys: new Set(),
        userRating: 1600,
        topicFilter: "dp",
      });

      expect(recs.every((r) => r.tags.includes("dp"))).toBe(true);
      expect(recs.length).toBe(2); // p2 and p3
    });

    it("prioritizes weak topics for STRENGTHENING category", () => {
      const topicWeaknesses = new Map([
        ["dp", 75],
        ["greedy", 20],
        ["graphs", 30],
      ]);

      const recs = generateRecommendations({
        candidateProblems: mockProblems,
        userSolvedProblemKeys: new Set(),
        userRating: 1600,
        topicWeaknesses,
        category: "STRENGTHENING",
      });

      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].tags).toContain("dp");
      expect(recs[0].category).toBe("STRENGTHENING");
      expect(recs[0].score).toBeGreaterThan(60);
    });

    it("sorts recommendations by score descending", () => {
      const recs = generateRecommendations({
        candidateProblems: mockProblems,
        userSolvedProblemKeys: new Set(),
        userRating: 1600,
      });

      for (let i = 0; i < recs.length - 1; i++) {
        expect(recs[i].score).toBeGreaterThanOrEqual(recs[i + 1].score);
      }
    });
  });

  describe("generateAdaptiveTrainingPlan", () => {
    it("generates a complete 7-day adaptive schedule with tasks starting today", () => {
      const plan = generateAdaptiveTrainingPlan({
        userRating: 1650,
        weekNumber: 1,
        startDate: new Date("2026-09-28T00:00:00Z"),
      });

      expect(plan.days).toHaveLength(7);
      expect(plan.days[0].dayName).toContain("Monday");
      expect(plan.days[0].status).toBe("CURRENT");
      expect(plan.days[1].status).toBe("UPCOMING");
      expect(plan.totalTasks).toBeGreaterThan(0);
      expect(plan.completionPercentage).toBe(0);
    });
  });
});
