import { ConceptNode } from "../concept-node-type";

export const oneDDPConcept: ConceptNode = {
  slug: "1d-dp",
  name: "1D Dynamic Programming & State Reductions",
  category: "Dynamic Programming",
  difficulty: "BEGINNER",
  description:
    "Foundational optimization framework breaking recursive subproblems into topological orders over Directed Acyclic Graphs (DAGs) with optimal substructure.",
  timeComplexity: "O(N * transitions)",
  spaceComplexity: "O(N) or O(1) with rolling buffers",
  prerequisites: [],
  dependents: ["knapsack", "tree-dp"],
  literatureReferences: [
    {
      source: "USACO Guide (Silver/Gold)",
      section: "Introduction to Dynamic Programming & Path Counting",
      url: "https://usaco.guide/gold/intro-dp",
      keyInsight:
        "DP states represent equivalence classes of subproblem histories. Define states by the minimum necessary information to make future decisions, transforming exponential recursive trees into linear DAG traversals.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 7: Dynamic Programming — Coin Problem & LIS (pp. 65-75)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "The Longest Increasing Subsequence (LIS) can be optimized from O(N^2) to O(N log N) by maintaining tails: the smallest tail of all increasing subsequences of length L.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 15: Dynamic Programming (pp. 359-390)",
      keyInsight:
        "Two essential ingredients: Optimal Substructure (optimal solution to problem contains optimal solutions to subproblems) and Overlapping Subproblems.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 10: Dynamic Programming & Space Reductions",
      keyInsight:
        "When DP[i] depends only on DP[i-1] or a bounded window of predecessors, rolling buffers reduce auxiliary space from O(N) to O(1).",
    },
  ],
  conceptualTheory: `### The DAG Formulation & State Space Minimization

#### 1. The Subproblem DAG Mental Model
Every Dynamic Programming problem can be conceptualized as a path query on a **Directed Acyclic Graph (DAG)**:
- **Vertices**: Unique state configurations (e.g. index $i$, remaining weight $w$).
- **Directed Edges**: Valid transitions from subproblems to dependent states.
- **Topological Order**: The evaluation order guaranteeing that all predecessor values are finalized before computing the current state.

---

#### 2. The 4-Step Contest DP Protocol
1. **State Definition**: What is the minimal set of variables required to uniquely identify future choices?
2. **Base Cases**: What are the boundary starting conditions (e.g. $DP[0] = 0$ or $DP[0] = 1$)?
3. **Recurrence Relation**: Formulate $DP[i]$ as a function of previous states $\\min / \\max / \\sum_{j < i} (DP[j] + \\text{cost})$.
4. **Computation Order**: Loop in topological order (usually ascending $i = 0 \\dots N$).

---

#### 3. Classical O(N log N) LIS Patience Sorting
For Longest Increasing Subsequence:
Maintain an array $\\text{tails}$ where $\\text{tails}[len]$ is the smallest ending element of any increasing subsequence of length $len+1$.
- For each $x \\in A$:
  - Use \`std::lower_bound\` to find the first element in $\\text{tails} \\ge x$.
  - If found, replace it with $x$ (greedily lowers the boundary for future extensions).
  - If not found, append $x$ (subsequence length increases by $1$!).
- Total time: $O(N \\log N)$.`,
  variations: [
    {
      title: "Coin Change (Counting Combinations)",
      explanation: "Count ways to form sum X using given coins. Outer loop on coins avoids permutations; inner loop allows reuse.",
      formula: "dp[s] = (dp[s] + dp[s - c]) % MOD",
      timeComplexity: "O(N * Target)",
      spaceComplexity: "O(Target)",
    },
    {
      title: "Coin Change (Minimum Coins)",
      explanation: "Find minimum coins needed to produce sum X. Initialize dp with INF, dp[0] = 0.",
      formula: "dp[s] = min(dp[s], dp[s - c] + 1)",
      timeComplexity: "O(N * Target)",
      spaceComplexity: "O(Target)",
    },
    {
      title: "Longest Increasing Subsequence (LIS)",
      explanation: "Binary search patience sorting finds length of LIS in O(N log N).",
      formula: "*lower_bound(tails.begin(), tails.end(), x) = x",
      codeSnippet: `int lengthOfLIS(const vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}`,
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Maximum Subarray Sum (Kadane's Algorithm)",
      explanation: "dp[i] = max(a[i], dp[i-1] + a[i]). Optimized to O(1) space with current_sum variable.",
      formula: "cur = max(1LL * a[i], cur + a[i])",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Problem asks for optimal value (min cost, max value) or count of ways to reach an end state",
      cue: "Dynamic Programming with topological state space.",
    },
    {
      triggerConstraint: "Order matters vs order doesn't matter in combination counting",
      cue: "Outer loop on items = combinations; Outer loop on sum = permutations.",
    },
    {
      triggerConstraint: "N up to 2 * 10^5 asking for longest monotonic subsequence",
      cue: "Patience sorting LIS with binary search in O(N log N).",
    },
  ],
  stepByStepStrategy: [
    "1. Define State Semantics in Plain Words: Write down explicitly what `dp[i]` represents before writing any code.",
    "2. Identify Out-of-Bounds Transitions: Guard transitions when `i - step < 0`.",
    "3. Set Base Case Explicitly: `dp[0] = 1` for counting ways; `dp[0] = 0` and all other `dp[i] = INF` for minimizing.",
    "4. Memory Optimization: If state only looks back 1 or 2 steps, replace vector with two integer registers.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

// 1. Longest Increasing Subsequence in O(N log N)
int computeLIS(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

// 2. Minimum Coins to form Target Sum in O(N * Target)
int minCoins(const vector<int>& coins, int target) {
    const int INF = 1e9;
    vector<int> dp(target + 1, INF);
    dp[0] = 0;

    for (int s = 1; s <= target; s++) {
        for (int c : coins) {
            if (s - c >= 0 && dp[s - c] != INF) {
                dp[s] = min(dp[s], dp[s - c] + 1);
            }
        }
    }

    return (dp[target] == INF ? -1 : dp[target]);
}`,
  pitfalls: [
    "Permutations vs Combinations Loop Inversion: Looping sum on outer loop and coins on inner loop counts permutations (order matters). Looping coins on outer loop counts combinations (order does not matter).",
    "Integer Overflow in INF + 1: If unreachable state is `INT_MAX`, computing `dp[s - c] + 1` overflows to negative. Use `1e9` for INF or guard `dp[s - c] != INF`.",
    "Strictly Increasing vs Non-Decreasing LIS: For non-decreasing subsequence (<=), use `std::upper_bound` instead of `std::lower_bound`.",
  ],
  practiceProblems: [
    {
      name: "Coin Combinations I (CSES)",
      rating: 1100,
      url: "https://cses.fi/problemset/task/1635",
      platform: "CSES",
      hint: "Count permutations: outer loop on sum, inner loop on coins.",
    },
    {
      name: "Coin Combinations II (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1636",
      platform: "CSES",
      hint: "Count combinations: outer loop on coins, inner loop on sum.",
    },
    {
      name: "Increasing Subsequence (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1644",
      platform: "CSES",
      hint: "O(N log N) LIS using std::lower_bound on tails array.",
    },
    {
      name: "Frog 1 & 2 (AtCoder Educational DP)",
      rating: 1000,
      url: "https://atcoder.jp/contests/dp/tasks/dp_b",
      platform: "AtCoder",
      hint: "dp[i] = min_{1 <= k <= K} (dp[i-k] + abs(h[i] - h[i-k])).",
    },
  ],
};
