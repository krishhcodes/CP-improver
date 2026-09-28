import { describe, it, expect } from "vitest";
import { analyzeCPCode } from "../src/server/mentor/code-analyzer";
import { getProgressiveHint } from "../src/server/mentor/progressive-hints";
import {
  generateMentorResponse,
  getProblemHint,
  reviewSubmissionCode,
} from "../src/server/mentor/mentor-service";
import { UserMentorContext } from "../src/server/mentor/types";

describe("AI CP Mentor & Code Review Engine", () => {
  describe("analyzeCPCode (Static & Semantic Analyzer)", () => {
    it("should flag missing fast I/O when std::cin is used without sync untying", () => {
      const code = `
        #include <iostream>
        using namespace std;
        int main() {
          int n;
          cin >> n;
          return 0;
        }
      `;

      const report = analyzeCPCode(code);
      const fastIoIssue = report.issues.find((i) => i.category === "FAST_IO");
      expect(fastIoIssue).toBeDefined();
      expect(fastIoIssue?.title).toContain("Missing Fast I/O");
    });

    it("should acknowledge fast I/O when properly configured", () => {
      const code = `
        #include <bits/stdc++.h>
        using namespace std;
        int main() {
          ios::sync_with_stdio(false);
          cin.tie(nullptr);
          int n;
          cin >> n;
          return 0;
        }
      `;

      const report = analyzeCPCode(code);
      expect(report.positiveHighlights.some((h) => h.includes("Fast I/O enabled"))).toBe(true);
    });

    it("should detect 32-bit integer overflow in modulo multiplications", () => {
      const code = `
        int a, b;
        cin >> a >> b;
        int ans = (a * b) % MOD;
      `;

      const report = analyzeCPCode(code);
      const overflowIssue = report.issues.find((i) => i.category === "INTEGER_OVERFLOW");
      expect(overflowIssue).toBeDefined();
      expect(overflowIssue?.severity).toBe("CRITICAL");
      expect(overflowIssue?.suggestedFix).toContain("1LL");
    });

    it("should detect nested O(N^2) loops on large constraints", () => {
      const code = `
        for (int i = 0; i < n; i++) {
          for (int j = 0; j < n; j++) {
            ans++;
          }
        }
      `;

      const report = analyzeCPCode(code, { expectedN: 200000 });
      const complexityIssue = report.issues.find((i) => i.category === "TIME_COMPLEXITY");
      expect(complexityIssue).toBeDefined();
      expect(complexityIssue?.severity).toBe("CRITICAL");
      expect(report.estimatedComplexity).toBe("O(N^2)");
      expect(report.hasCriticalIssues).toBe(true);
    });

    it("should flag std::endl buffer flushes inside code", () => {
      const code = `
        for (int i = 0; i < n; i++) {
          cout << a[i] << endl;
        }
      `;

      const report = analyzeCPCode(code);
      const endlIssue = report.issues.find((i) => i.title.includes("std::endl"));
      expect(endlIssue).toBeDefined();
    });
  });

  describe("Progressive Hinting Engine", () => {
    it("should return progressive tiered hints for curated problem 970E", () => {
      const tier1 = getProgressiveHint("970E", 1);
      const tier2 = getProgressiveHint("970E", 2);
      const tier3 = getProgressiveHint("970E", 3);
      const tier4 = getProgressiveHint("970E", 4);

      expect(tier1.tier).toBe(1);
      expect(tier1.category).toBe("OBSERVATION");
      expect(tier1.content).toContain("parity");

      expect(tier2.tier).toBe(2);
      expect(tier2.category).toBe("ALGORITHM_PARADIGM");

      expect(tier3.tier).toBe(3);
      expect(tier3.category).toBe("INVARIANT_PROOF");
      expect(tier3.content).toContain("prefix");

      expect(tier4.tier).toBe(4);
      expect(tier4.category).toBe("EDGE_CASES");
    });

    it("should return progressive tiered hints for Hamburgers (371C) with overflow warning", () => {
      const tier1 = getProgressiveHint("371C", 1);
      const tier4 = getProgressiveHint("371C", 4);

      expect(tier1.content).toContain("hamburgers");
      expect(tier4.content).toContain("long long");
    });

    it("should provide fallback pattern-based hints for uncurated DP problems", () => {
      const hint = getProgressiveHint("custom-problem", 2, ["dynamic programming"]);
      expect(hint.category).toBe("ALGORITHM_PARADIGM");
      expect(hint.content).toContain("state");
    });
  });

  describe("Mentor Service & Socratic Guidance", () => {
    const mockContext: UserMentorContext = {
      handle: "Alex_Algo",
      rating: 1540,
      weakestTopics: [{ topic: "Dynamic Programming", score: 68 }],
      recentSubmissions: [{ problemName: "970E", verdict: "WRONG_ANSWER", rating: 1400 }],
      currentProblem: {
        name: "Alternating String",
        rating: 1400,
        tags: ["greedy", "strings"],
      },
    };

    it("should generate Socratic advice for TLE queries", async () => {
      const reply = await generateMentorResponse(
        [{ id: "1", role: "user", content: "Why did my solution TLE?", timestampSeconds: 0 }],
        mockContext,
        "SOCRATIC"
      );

      expect(reply).toContain("Time Complexity");
      expect(reply).toContain("Fast I/O");
    });

    it("should generate strict tone when in STRICT_COACH persona", async () => {
      const reply = await generateMentorResponse(
        [{ id: "1", role: "user", content: "Why did my solution TLE?", timestampSeconds: 0 }],
        mockContext,
        "STRICT_COACH"
      );

      expect(reply).toContain("Look at your loop bounds");
    });

    it("should diagnose Wrong Answer and integer overflow traps", async () => {
      const reply = await generateMentorResponse(
        [{ id: "1", role: "user", content: "I got Wrong Answer on test 3", timestampSeconds: 0 }],
        mockContext,
        "SOCRATIC"
      );

      expect(reply).toContain("Wrong Answer");
      expect(reply).toContain("Integer Overflow");
    });

    it("should tailor advice to user's weakest topics", async () => {
      const reply = await generateMentorResponse(
        [{ id: "1", role: "user", content: "How should I train to improve my rating?", timestampSeconds: 0 }],
        mockContext,
        "SOCRATIC"
      );

      expect(reply).toContain("Alex_Algo");
      expect(reply).toContain("Dynamic Programming");
    });
  });
});
