import { describe, it, expect } from "vitest";
import { generateUpsolveQueue } from "@/server/analytics/upsolve-detector";

describe("Upsolve Detector Engine", () => {
  const mockContests = [
    { id: 2001, name: "Codeforces Round 1001 (Div. 2)" },
    { id: 2002, name: "Codeforces Round 1002 (Div. 2)" },
  ];

  const mockProblems = [
    {
      id: "prob-1",
      contestId: 2001,
      index: "A",
      name: "String Equalizer",
      rating: 900,
      tags: ["strings"],
    },
    {
      id: "prob-2",
      contestId: 2001,
      index: "B",
      name: "Matrix Game",
      rating: 1300,
      tags: ["games", "matrices"],
    },
    {
      id: "prob-3",
      contestId: 2001,
      index: "C",
      name: "Graph Partition",
      rating: 1650,
      tags: ["graphs", "dfs and similar"],
    },
    {
      id: "prob-4",
      contestId: 2001,
      index: "D",
      name: "Segment Tree Mastery",
      rating: 2100,
      tags: ["data structures"],
    },
    {
      id: "prob-5",
      contestId: 2002,
      index: "C",
      name: "Combinatorics Blast",
      rating: 1550,
      tags: ["combinatorics", "math"],
    },
  ];

  it("filters out problems that have already been solved", () => {
    const userSubmissions = [
      {
        problemId: "prob-1",
        contestId: 2001,
        problemIndex: "A",
        verdict: "OK",
      },
    ];

    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions,
      userCurrentRating: 1500,
    });

    // prob-1 (2001-A) should not be in the queue
    expect(queue.find((p) => p.id === "prob-1")).toBeUndefined();
    expect(queue.find((p) => p.index === "A")).toBeUndefined();
  });

  it("assigns HIGH priority to failed problems near current rating with explainable reasons", () => {
    const userSubmissions = [
      {
        problemId: "prob-3",
        contestId: 2001,
        problemIndex: "C",
        verdict: "WRONG_ANSWER",
      },
      {
        problemId: "prob-3",
        contestId: 2001,
        problemIndex: "C",
        verdict: "TIME_LIMIT_EXCEEDED",
      },
    ];

    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions,
      userCurrentRating: 1550,
    });

    const candidateC = queue.find((p) => p.id === "prob-3");
    expect(candidateC).toBeDefined();
    expect(candidateC?.priority).toBe("HIGH");
    expect(candidateC?.failedAttempts).toBe(2);
    expect(candidateC?.learningYieldScore).toBeGreaterThan(80);
    expect(candidateC?.reason).toContain("Failed 2 times during Codeforces Round 1001 (Div. 2)");
    expect(candidateC?.reason).toContain("High learning impact");
    expect(candidateC?.url).toBe("https://codeforces.com/contest/2001/problem/C");
  });

  it("assigns MEDIUM priority to attempted stretch problems far above user rating", () => {
    const userSubmissions = [
      {
        problemId: "prob-4",
        contestId: 2001,
        problemIndex: "D",
        verdict: "WRONG_ANSWER",
      },
    ];

    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions,
      userCurrentRating: 1500, // problem rating 2100 (+600 diff)
    });

    const candidateD = queue.find((p) => p.id === "prob-4");
    expect(candidateD).toBeDefined();
    expect(candidateD?.priority).toBe("MEDIUM");
    expect(candidateD?.failedAttempts).toBe(1);
    expect(candidateD?.reason).toContain("Advanced difficulty stretch problem (+600 rating)");
  });

  it("assigns MEDIUM priority to unattempted problems within progression range", () => {
    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions: [],
      userCurrentRating: 1500,
    });

    // prob-5 has rating 1550 (+50 diff)
    const candidate5 = queue.find((p) => p.id === "prob-5");
    expect(candidate5).toBeDefined();
    expect(candidate5?.priority).toBe("MEDIUM");
    expect(candidate5?.failedAttempts).toBe(0);
    expect(candidate5?.reason).toContain("Strong progression candidate (+50 rating)");
  });

  it("strictly sorts queue by priority (HIGH before MEDIUM before LOW) then yield score", () => {
    const userSubmissions = [
      // Failed prob-3 (1650 vs 1500 -> diff 150 -> HIGH priority)
      {
        problemId: "prob-3",
        contestId: 2001,
        problemIndex: "C",
        verdict: "WRONG_ANSWER",
      },
      // Failed prob-4 (2100 vs 1500 -> diff 600 -> MEDIUM priority)
      {
        problemId: "prob-4",
        contestId: 2001,
        problemIndex: "D",
        verdict: "WRONG_ANSWER",
      },
    ];

    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions,
      userCurrentRating: 1500,
    });

    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].priority).toBe("HIGH");
    expect(queue[0].id).toBe("prob-3");

    // All HIGH priority candidates must precede MEDIUM, which precede LOW
    let seenMedium = false;
    let seenLow = false;

    for (const item of queue) {
      if (item.priority === "HIGH") {
        expect(seenMedium).toBe(false);
        expect(seenLow).toBe(false);
      } else if (item.priority === "MEDIUM") {
        seenMedium = true;
        expect(seenLow).toBe(false);
      } else if (item.priority === "LOW") {
        seenLow = true;
      }
    }
  });

  it("respects the limit argument", () => {
    const queue = generateUpsolveQueue({
      recentContests: mockContests,
      contestProblems: mockProblems,
      userSubmissions: [],
      userCurrentRating: 1500,
      limit: 2,
    });

    expect(queue.length).toBe(2);
  });
});
