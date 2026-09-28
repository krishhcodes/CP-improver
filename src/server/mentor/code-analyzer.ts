import {
  CodeAnalysisIssue,
  CodeReviewReport,
} from "./types";

/**
 * Pure static and semantic competitive programming code analyzer.
 * Identifies common CP anti-patterns, complexity hazards, and overflow traps.
 */
export function analyzeCPCode(
  sourceCode: string,
  problemContext?: {
    rating?: number;
    timeLimitSeconds?: number;
    expectedN?: number; // e.g. 2e5
  }
): CodeReviewReport {
  const issues: CodeAnalysisIssue[] = [];
  const positiveHighlights: string[] = [];

  const code = sourceCode || "";
  const lines = code.split("\n");
  const maxN = problemContext?.expectedN || 200000;
  const timeLimit = problemContext?.timeLimitSeconds || 2.0;

  // 1. FAST I/O CHECK (C++)
  const hasCin = /\bcin\s*>>/.test(code);
  const hasCout = /\bcout\s*<</.test(code);
  const hasFastIO =
    /sync_with_stdio\s*\(\s*false\s*\)/.test(code) && /cin\.tie\s*\(\s*(nullptr|NULL|0)\s*\)/.test(code);

  if ((hasCin || hasCout) && !hasFastIO) {
    issues.push({
      severity: "WARNING",
      category: "FAST_IO",
      title: "Missing Fast I/O Optimization",
      description:
        "Using standard `std::cin` / `std::cout` without untying streams. For inputs with N >= 10^5, I/O bottlenecks can consume 0.4s to 1.0s, triggering unexpected TLE.",
      suggestedFix:
        "Add `ios::sync_with_stdio(false); cin.tie(nullptr);` at the top of your `main()` function.",
      textbookCitation: {
        book: "Competitive Programmer's Handbook (CPH)",
        chapter: "Chapter 1: Input and Output Efficiency",
        learnSlug: "prefix-sums",
        invariant: "cin.tie(nullptr) unties cin from cout; sync_with_stdio(false) disables C/C++ buffer synchronization.",
      },
    });
  } else if (hasFastIO) {
    positiveHighlights.push("Fast I/O enabled (`ios::sync_with_stdio(false); cin.tie(nullptr);`).");
  }

  // Check for std::endl in loops
  if (/\bendl\b/.test(code)) {
    issues.push({
      severity: "WARNING",
      category: "FAST_IO",
      title: "Buffer Flushing with `std::endl`",
      description:
        "`std::endl` forces a full stream buffer flush on every invocation. In tight loops or large outputs, this adds massive overhead.",
      suggestedFix: "Replace `std::endl` with `'\\n'` to allow stream buffering.",
      textbookCitation: {
        book: "Competitive Programming 4 (CP4)",
        chapter: "Book 1 Section 1.3: Fast I/O in Competitive Programming",
        learnSlug: "prefix-sums",
      },
    });
  }

  // 2. INTEGER OVERFLOW DETECTION
  // Check for (int * int) before modulo or assignment
  const intMultiplyModPattern = /\(([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\)\s*%\s*(mod|MOD|1e9|1000000007)/i;
  if (intMultiplyModPattern.test(code)) {
    issues.push({
      severity: "CRITICAL",
      category: "INTEGER_OVERFLOW",
      title: "Integer Overflow in Modulo Multiplication",
      description:
        "Multiplying two 32-bit signed integers before taking modulo can exceed 2 * 10^9 (overflowing into negative values) before `% MOD` is applied.",
      suggestedFix:
        "Cast to 64-bit: `(1LL * a * b) % MOD` or declare variables directly as `long long`.",
      textbookCitation: {
        book: "CPH by Antti Laaksonen",
        chapter: "Chapter 2: Number Representation & 64-bit Modulo",
        learnSlug: "prefix-sums",
        invariant: "Intermediate product of two 10^9 values is 10^18, requiring 64-bit registers before modulo arithmetic.",
      },
    });
  }

  // Check for 32-bit int accumulator with large bounds
  const intSumPattern = /\bint\s+(sum|total|ans|cost|ans_sum)\s*=\s*0\b/i;
  if (intSumPattern.test(code) && maxN >= 100000) {
    issues.push({
      severity: "CRITICAL",
      category: "INTEGER_OVERFLOW",
      title: "32-bit Accumulator Overflow Risk",
      description:
        "Accumulating array sums or costs using 32-bit signed `int` overflows if sum exceeds ~2 * 10^9. An array of 2 * 10^5 elements with values up to 10^9 sums to 2 * 10^14.",
      suggestedFix: "Change accumulator declaration from `int` to `long long` (`int64_t`).",
      textbookCitation: {
        book: "Competitive Programming 4 (CP4)",
        chapter: "Book 1 Section 1.3: Data Types and Extreme Constraint Invariants",
        learnSlug: "prefix-sums",
        invariant: "Sum over N=2e5 with elements up to 1e9 yields 2e14 > 2^31 - 1; requires 64-bit long long.",
      },
    });
  }

  // Check 32-bit infinity definition (INT_MAX vs 1e18)
  if (/\b(INT_MAX|2147483647|0x3f3f3f3f)\b/.test(code) && /\b(dist|cost|dp|min_val)\b/i.test(code)) {
    issues.push({
      severity: "WARNING",
      category: "INTEGER_OVERFLOW",
      title: "32-Bit Infinity in Graph/DP Distance",
      description:
        "Using 32-bit `INT_MAX` for path distances or DP minimums risks overflow when adding edge weights: `dist[u] + weight` will wrap around to negative numbers.",
      suggestedFix:
        "Use 64-bit infinity: `const long long INF = 1e18;` and guard updates with `if (dist[u] != INF)`.",
      textbookCitation: {
        book: "Introduction to Algorithms (CLRS)",
        chapter: "Chapter 24: Single-Source Shortest Paths & Relaxation Invariants",
        learnSlug: "dijkstra",
        invariant: "Relaxation step d[v] = min(d[v], d[u] + w) will overflow signed 32-bit infinity into negative numbers.",
      },
    });
  }

  // 3. TIME COMPLEXITY & TLE TRAPS
  // Nested for-loops
  let nestedLoopCount = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    const l1 = lines[i];
    const l2 = lines[i + 1];
    if (/\bfor\s*\(/.test(l1) && /\bfor\s*\(/.test(l2)) {
      nestedLoopCount++;
    }
  }

  if (nestedLoopCount >= 1 && maxN >= 100000) {
    issues.push({
      severity: "CRITICAL",
      category: "TIME_COMPLEXITY",
      title: "O(N^2) Nested Loop on Large Constraints",
      description: `Detected adjacent nested \`for\` loops. For N = ${maxN.toLocaleString()}, N^2 is ~${Math.pow(
        maxN / 10000,
        2
      )} * 10^8 operations, which far exceeds the standard ~10^8 ops/sec budget for a ${timeLimit}s time limit.`,
      suggestedFix:
        "Optimize to O(N log N) using sorting/two pointers/binary search, or O(N) using prefix sums, frequency counting, or a monotonic queue.",
      textbookCitation: {
        book: "USACO Guide Silver & CPH",
        chapter: "USACO Guide Silver: Two Pointers / CPH Chapter 8",
        learnSlug: "two-pointers",
        invariant: "Monotonic condition allows both window boundaries to advance in amortized O(N) rather than nested O(N^2).",
      },
    });
  }

  // Unordered map anti-hash trap
  if (/\bunordered_map\s*</.test(code)) {
    issues.push({
      severity: "WARNING",
      category: "TIME_COMPLEXITY",
      title: "Unordered Map Anti-Hash Collision Vulnerability",
      description:
        "Default `std::unordered_map` in GCC is vulnerable to deterministic hash-collision attacks on Codeforces (crafted test cases degrading O(1) lookups to O(N), causing TLE).",
      suggestedFix:
        "Use `std::map` (O(log N)), `gp_hash_table` with `custom_hash` incorporating `chrono::steady_clock`, or direct array lookup if keys are bounded.",
      textbookCitation: {
        book: "Principles of Algorithmic Problem Solving (Sannemo)",
        chapter: "Chapter 3: Hash Tables, Collisions, and Worst-Case Inputs",
        learnSlug: "prefix-sums",
        invariant: "Codeforces tests use anti-hash suites that force std::unordered_map into O(N) single-bucket degeneration.",
      },
    });
  }

  // Vector erase in loop
  if (/\.erase\s*\(/.test(code) && /\bfor\s*\(/.test(code)) {
    issues.push({
      severity: "WARNING",
      category: "TIME_COMPLEXITY",
      title: "Linear Erase Inside Iteration",
      description:
        "Calling `vector::erase()` shifts all subsequent elements in O(N) time. Doing this inside a loop yields O(N^2) complexity.",
      suggestedFix:
        "Use the erase-remove idiom `v.erase(remove(...), v.end())` for bulk removal, or maintain a boolean `deleted` array.",
      textbookCitation: {
        book: "Competitive Programmer's Handbook (CPH)",
        chapter: "Chapter 4: Data Structures & Dynamic Arrays",
        learnSlug: "prefix-sums",
      },
    });
  }

  // 4. RECURSION DEPTH & STACK OVERFLOW
  if (/\bvoid\s+dfs\s*\(/.test(code) && maxN >= 100000) {
    issues.push({
      severity: "INFO",
      category: "RECURSION_DEPTH",
      title: "Deep DFS Recursion Hazard",
      description:
        "Recursive DFS on an unconstrained graph with N >= 2 * 10^5 can generate a line-graph call stack of depth 200,000, risking standard 8MB stack overflow (SIGSEGV / RTE).",
      suggestedFix:
        "For tree algorithms, BFS is stack-safe. If DFS is required, ensure `#pragma comment(linker, \"/STACK:...\")` or use an explicit stack.",
      textbookCitation: {
        book: "USACO Guide Silver & CPH",
        chapter: "USACO Guide Silver: Graph Traversals & Stack Depth Limits",
        learnSlug: "bfs-dfs",
        invariant: "Recursion depth >= 2e5 exceeds default 8MB thread stack size, triggering SIGSEGV on linear tree topologies.",
      },
    });
  }

  // 5. ARRAY BOUNDS & OFF-BY-ONE
  if (/\bvector<[a-zA-Z0-9_]+>\s+[a-zA-Z0-9_]+\s*\(\s*n\s*\)/.test(code) && /\[\s*i\s*\+\s*1\s*\]/.test(code)) {
    issues.push({
      severity: "WARNING",
      category: "ARRAY_BOUNDS",
      title: "Potential Off-By-One with 1-Based Lookahead",
      description:
        "Vector declared with exact size `n`, but access pattern includes `[i + 1]`. On the last iteration `i = n - 1`, `a[i + 1]` triggers out-of-bounds memory access.",
      suggestedFix: "Declare array with padding: `vector<long long> a(n + 2);` or bound loop at `n - 1`.",
      textbookCitation: {
        book: "Principles of Algorithmic Problem Solving (Sannemo)",
        chapter: "Chapter 1: Implementation Bugs & Array Boundaries",
        learnSlug: "prefix-sums",
      },
    });
  }

  // Positive structural check
  if (/#include\s*<bits\/stdc\+\+\.h>/.test(code)) {
    positiveHighlights.push("Precompiled monolithic header `<bits/stdc++.h>` included.");
  }
  if (/\blong\s+long\b/.test(code) || /\bint64_t\b/.test(code)) {
    positiveHighlights.push("Appropriate 64-bit integer types (`long long` / `int64_t`) utilized.");
  }

  // Determine estimated complexity and verdict risk
  let estimatedComplexity = "O(N)";
  let verdictRisk = "Low risk of runtime / complexity failure.";
  const hasCritical = issues.some((i) => i.severity === "CRITICAL");

  if (nestedLoopCount >= 1) {
    estimatedComplexity = "O(N^2)";
    verdictRisk = "CRITICAL: High risk of Time Limit Exceeded (TLE) on large test sets.";
  } else if (/\bsort\s*\(/.test(code) || /\b(priority_queue|map|set)\b/.test(code)) {
    estimatedComplexity = "O(N log N)";
    verdictRisk = hasCritical
      ? "HIGH: Risk of Wrong Answer (WA) due to integer overflow."
      : "LOW: Algorithmic complexity is within the standard ~10^8 operations limit.";
  }

  let recommendedNextStep =
    "Code structure looks solid. Verify adversarial edge cases (N=1, extreme bounds, negative values) before submitting.";
  if (hasCritical) {
    const firstCrit = issues.find((i) => i.severity === "CRITICAL");
    recommendedNextStep = `Resolve critical issue: ${firstCrit?.title}. ${firstCrit?.suggestedFix}`;
  }

  return {
    hasCriticalIssues: hasCritical,
    estimatedComplexity,
    verdictRisk,
    issues,
    positiveHighlights,
    recommendedNextStep,
  };
}
