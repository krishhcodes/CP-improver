import { describe, it, expect } from "vitest";
import { parseCodeforcesInput } from "../src/app/api/codeforces/problem/route";
import { getProgressiveHint } from "../src/server/mentor/progressive-hints";

describe("Codeforces Problem Resolver & Parser", () => {
  describe("parseCodeforcesInput", () => {
    it("should parse standard problem keys like 1800E2, 71A, 4A", () => {
      expect(parseCodeforcesInput("1800E2")).toEqual({
        contestId: 1800,
        index: "E2",
      });

      expect(parseCodeforcesInput("71A")).toEqual({
        contestId: 71,
        index: "A",
      });

      expect(parseCodeforcesInput("4A")).toEqual({
        contestId: 4,
        index: "A",
      });
    });

    it("should parse problem keys with separators like 1800/E2, 1800-E, 1800 E2", () => {
      expect(parseCodeforcesInput("1800/E2")).toEqual({
        contestId: 1800,
        index: "E2",
      });

      expect(parseCodeforcesInput("1800-E")).toEqual({
        contestId: 1800,
        index: "E",
      });

      expect(parseCodeforcesInput("1800 E2")).toEqual({
        contestId: 1800,
        index: "E2",
      });
    });

    it("should parse full Codeforces contest URLs", () => {
      const url = "https://codeforces.com/contest/1800/problem/E2";
      expect(parseCodeforcesInput(url)).toEqual({
        contestId: 1800,
        index: "E2",
      });
    });

    it("should parse Codeforces problemset URLs", () => {
      const url = "https://codeforces.com/problemset/problem/1915/C";
      expect(parseCodeforcesInput(url)).toEqual({
        contestId: 1915,
        index: "C",
      });
    });

    it("should parse Codeforces gym URLs", () => {
      const url = "https://codeforces.com/gym/102000/problem/A";
      expect(parseCodeforcesInput(url)).toEqual({
        contestId: 102000,
        index: "A",
      });
    });

    it("should return null for invalid inputs", () => {
      expect(parseCodeforcesInput("")).toBeNull();
      expect(parseCodeforcesInput("not-a-problem")).toBeNull();
      expect(parseCodeforcesInput("https://google.com")).toBeNull();
    });
  });

  describe("Dynamic Progressive Hints for Arbitrary CF Tags", () => {
    it("should generate 4-tier Socratic hint set for dynamic programming problems", () => {
      const tier1 = getProgressiveHint("1900B", 1, ["dp"]);
      const tier2 = getProgressiveHint("1900B", 2, ["dp"]);
      const tier3 = getProgressiveHint("1900B", 3, ["dp"]);
      const tier4 = getProgressiveHint("1900B", 4, ["dp"]);

      expect(tier1.category).toBe("OBSERVATION");
      expect(tier1.content.toLowerCase()).toContain("subproblem");

      expect(tier2.category).toBe("ALGORITHM_PARADIGM");
      expect(tier2.content).toContain("Define your state `DP[i][state]`");

      expect(tier3.category).toBe("INVARIANT_PROOF");
      expect(tier3.textbookCitation?.learnSlug).toBe("1d-dp");

      expect(tier4.category).toBe("EDGE_CASES");
    });

    it("should generate 4-tier Socratic hint set for two-pointer problems", () => {
      const hint = getProgressiveHint("1800D", 2, ["two pointers"]);
      expect(hint.category).toBe("ALGORITHM_PARADIGM");
      expect(hint.title).toBe("Shrinking Condition");
      expect(hint.content.toLowerCase()).toContain("advance `l` in a while-loop");
    });

    it("should generate 4-tier Socratic hint set for graph / DSU problems", () => {
      const hint = getProgressiveHint("1800E2", 3, ["dsu", "graphs"]);
      expect(hint.category).toBe("INVARIANT_PROOF");
      expect(hint.textbookCitation?.learnSlug).toBe("bfs-dfs");
    });
  });
});
