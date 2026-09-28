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
  deepExplanation: {
    intuition:
      "1D Dynamic Programming solves optimization and counting problems by defining a state along a linear sequence (e.g. prefix length, index, or running sum) that satisfies Richard Bellman's Principle of Optimality: an optimal sequence of decisions has the property that whatever the initial state and decision are, the remaining decisions must constitute an optimal policy with respect to the resulting state. Instead of re-evaluating overlapping subproblems exponentially, we evaluate states in topological order and memoize results.",
    proofOfCorrectness:
      "Theorem (Correctness of Linear DP via Induction on Topological Ordering): Let G = (V, E) be the state-transition Directed Acyclic Graph where vertices are states {0, 1, ..., N} and directed edges (u, v) represent transitions from u to v with u < v. We induct on state index i: Base Case: dp[0] is initialized to known boundary values. Inductive Hypothesis: Assume for all k < i, dp[k] holds the true optimal cost. Inductive Step: Because u < v for all transitions, all incoming transitions to state i originate from k < i. By the inductive hypothesis, all dp[k] are optimal. Computing dp[i] = min_{(k, i) in E} { dp[k] + cost(k, i) } evaluates all admissible immediate predecessor decisions. Since Bellman's principle guarantees no alternative decomposition exists, dp[i] is strictly optimal. By induction, all dp[0..N] are optimal.",
    complexityDerivation:
      "Time: Total States * Transitions Per State. For an array of size N where each state considers K transitions, total time is O(N * K). For LIS with patience sorting / binary search, replacing the linear transition scan with std::lower_bound reduces time from O(N^2) to O(N log N). Space: O(N) to store the DP table, which can frequently be compressed to O(1) or O(K) if dp[i] only accesses a fixed lookback window.",
    whenNotToUse:
      "Do NOT use dynamic programming if the state transition graph contains directed cycles with negative weights (which would create infinite loops; use Bellman-Ford or SPFA instead) or if greedy choice can be proven optimal by exchange arguments (e.g., standard interval scheduling or fractional knapsack).",
  },
  workedExample: {
    title: "Permutations vs Combinations Coin DP Trace (Target = 5, Coins = [2, 3])",
    scenario: "Coin Combinations I (Permutations: order matters, e.g. 2+3 != 3+2) vs Coin Combinations II (Combinations: order does not matter).",
    input: "Coins = [2, 3], Target = 5.",
    output: "Combinations = 1 ({2, 3}). Permutations = 2 ([2, 3] and [3, 2]).",
    traceSteps: [
      { step: 1, state: "Combinations Loop (Coin outer, Sum inner)", action: "Outer coin=2: dp[2]+=dp[0]->dp[2]=1; dp[4]+=dp[2]->dp[4]=1. (Table: [1, 0, 1, 0, 1, 0])", insight: "Only builds solutions using coin 2" },
      { step: 2, state: "Combinations Loop (Coin=3)", action: "dp[3]+=dp[0]->dp[3]=1; dp[5]+=dp[2]->dp[5]=0+1=1. Final dp[5] = 1 ({2, 3})", insight: "Since coin 3 is processed AFTER coin 2, [3, 2] is impossible to generate. Order is strictly non-decreasing!" },
      { step: 3, state: "Permutations Loop (Sum outer, Coin inner)", action: "Sum=2: coin 2 -> dp[2]=1. Sum=3: coin 3 -> dp[3]=1. (Table so far: dp[2]=1, dp[3]=1)", insight: "Both partial prefixes known" },
      { step: 4, state: "Permutations Loop (Sum=5)", action: "coin 2: dp[5]+=dp[3] (via [3, 2], adds 1). coin 3: dp[5]+=dp[2] (via [2, 3], adds 1). dp[5] = 2", insight: "Both permutations [3, 2] and [2, 3] are captured!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Inverting Nested Loops in Coin Problems",
      cause: "Putting the sum loop outer when problem asks for distinct sets (combinations), or coin loop outer when order matters (permutations).",
      fix: "Order matters (permutations): `for sum: for coin`. Order does not matter (combinations): `for coin: for sum`.",
      wrongSnippet: "for (int s = 1; s <= target; s++) for (int c : coins) dp[s] += dp[s - c]; // Counts permutations!",
      correctedSnippet: "for (int c : coins) for (int s = c; s <= target; s++) dp[s] += dp[s - c]; // Counts combinations!",
    },
    {
      trap: "Integer Overflow with Unreachable State Marker (INF + 1)",
      cause: "Setting `dp[i] = INT_MAX` and computing `dp[i - c] + 1` causes 32-bit signed overflow to negative minimum.",
      fix: "Use `1e9` for INF or explicitly check `if (dp[i - c] != INF)` before adding.",
      wrongSnippet: "int INF = INT_MAX; dp[s] = min(dp[s], dp[s - c] + 1); // Overflows to -2147483648",
      correctedSnippet: "const int INF = 1e9; if (dp[s - c] != INF) dp[s] = min(dp[s], dp[s - c] + 1);",
    },
    {
      trap: "Missing Modulo Addition in Counting DP",
      cause: "Accumulating number of ways without modulo arithmetic leads to 64-bit integer overflow.",
      fix: "Always apply `% 1000000007` at every addition step: `dp[s] = (dp[s] + dp[s - c]) % MOD`.",
      wrongSnippet: "dp[s] += dp[s - c]; // Overflows after ~60 steps",
      correctedSnippet: "dp[s] = (dp[s] + dp[s - c]) % 1000000007;",
    },
  ],
  pythonTemplate: `import sys
from bisect import bisect_left

def solve_lis():
    """O(N log N) Longest Increasing Subsequence via Patience Sorting."""
    input = sys.stdin.readline
    n = int(input())
    a = list(map(int, input().split()))

    tails = []
    for x in a:
        idx = bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x

    print(len(tails))

def solve_coin_combinations_combinations():
    """CSES Coin Combinations II: Count combinations where order does NOT matter."""
    input = sys.stdin.readline
    n, target = map(int, input().split())
    coins = list(map(int, input().split()))
    MOD = 10**9 + 7

    dp = [0] * (target + 1)
    dp[0] = 1

    # Outer coin, inner sum -> Combinations
    for c in coins:
        for s in range(c, target + 1):
            dp[s] = (dp[s] + dp[s - c]) % MOD

    print(dp[target])

def solve_coin_combinations_permutations():
    """CSES Coin Combinations I: Count permutations where order DOES matter."""
    input = sys.stdin.readline
    n, target = map(int, input().split())
    coins = list(map(int, input().split()))
    MOD = 10**9 + 7

    dp = [0] * (target + 1)
    dp[0] = 1

    # Outer sum, inner coin -> Permutations
    for s in range(1, target + 1):
        for c in coins:
            if s >= c:
                dp[s] = (dp[s] + dp[s - c]) % MOD

    print(dp[target])

if __name__ == '__main__':
    solve_coin_combinations_combinations()
`,
};
