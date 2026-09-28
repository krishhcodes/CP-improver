import { ConceptNode } from "../concept-node-type";

export const knapsackConcept: ConceptNode = {
  slug: "knapsack",
  name: "0/1, Unbounded & Bounded Knapsack DP",
  category: "Dynamic Programming",
  difficulty: "INTERMEDIATE",
  description:
    "Archetypal resource allocation framework selecting items with weights and values to maximize gain under a capacity limit. Includes 1D space compression and binary splitting.",
  timeComplexity: "O(N * W) or O(W * sum(log K))",
  spaceComplexity: "O(W) in 1D space-compressed array",
  prerequisites: ["1d-dp"],
  dependents: ["bitmask-dp"],
  literatureReferences: [
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 16: Greedy Algorithms vs Dynamic Programming — The 0-1 Knapsack Problem",
      keyInsight:
        "The fractional knapsack problem admits a greedy solution by value-to-weight ratio, but the discrete 0-1 knapsack exhibits optimal substructure requiring dynamic programming.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 3.5.1: Classical 0-1 Knapsack and Space Optimization",
      keyInsight:
        "Iterating the capacity loop backwards from W down to w[i] allows compressing the 2D DP table DP[N][W] into a single 1D array of size W+1 without multiple-item reuse.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 7: Dynamic Programming — Knapsack Problems (pp. 68-71)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Bounded knapsack with item counts C[i] is optimized via binary powers (1, 2, 4, ..., remainder), transforming O(N * W * C) into O(N * W * log C).",
    },
  ],
  conceptualTheory: `### The 2D Recurrence & The 1D Space Invariant

#### 1. Classical 2D Recurrence
Let $DP[i][w]$ be the maximum value achievable considering items $1 \\dots i$ with remaining weight capacity $w$:
$$DP[i][w] = \\begin{cases} DP[i-1][w] & \\text{if } w < \\text{weight}[i] \\\\ \\max(DP[i-1][w], DP[i-1][w - \\text{weight}[i]] + \\text{value}[i]) & \\text{otherwise} \\end{cases}$$

---

#### 2. The Reverse Loop Invariant (1D Space Compression)
Notice that $DP[i][w]$ depends **only** on the previous row $i-1$ at positions $w$ and $w - \\text{weight}[i]$.
If we iterate $w$ in **reverse order**:
$$w = W \\dots \\text{weight}[i]$$
when evaluating state $w$, the value $DP[w - \\text{weight}[i]]$ still holds the result from item $i-1$, preventing item $i$ from being used twice!

---

#### 3. Bounded Knapsack Binary Decomposition
If item $i$ has count $C_i$:
Instead of testing each copy individually, decompose $C_i$ into powers of two:
$$\\{1, 2, 4, 8, \\dots, 2^k, R\\} \\quad \\text{such that } \\sum = C_i$$
Any integer between $0$ and $C_i$ can be uniquely formed by a subset of these powers! This reduces the number of items from $C_i$ to $O(\\log C_i)$.`,
  variations: [
    {
      title: "0/1 Knapsack (Each Item at Most Once)",
      explanation: "Reverse capacity loop from W down to weight[i] on 1D array.",
      formula: "for w = W down to wt: dp[w] = max(dp[w], dp[w - wt] + val)",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Unbounded Knapsack (Infinite Copies of Each Item)",
      explanation: "Forward capacity loop from weight[i] up to W. Reuse of current item is allowed.",
      formula: "for w = wt up to W: dp[w] = max(dp[w], dp[w - wt] + val)",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Bounded Knapsack (Binary Power Splitting)",
      explanation: "Split quantity K into binary bundles 1, 2, 4, ..., R and run standard 0/1 knapsack on the bundles.",
      formula: "O(N * W * log K)",
      timeComplexity: "O(N * W * log K)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Knapsack with Huge Capacity (DP by Value)",
      explanation: "When W <= 10^9 but total value V <= 10^5, swap state: dp[v] = minimum weight to achieve value v.",
      formula: "dp[v] = min(dp[v], dp[v - val] + wt)",
      timeComplexity: "O(N * V_total)",
      spaceComplexity: "O(V_total)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Given N items with weights and values, maximize total value under weight capacity W <= 10^5",
      cue: "Standard 0/1 Knapsack DP with reverse 1D loop.",
    },
    {
      triggerConstraint: "Weight capacity W is huge (e.g. 10^9) but values are small (V <= 1000, N <= 100)",
      cue: "Knapsack DP by Value: dp[v] = min weight for value v.",
    },
    {
      triggerConstraint: "N <= 40 asking for subset sum closest to target",
      cue: "Meet-in-the-Middle: Split array into two halves of size 20, compute 2^20 sums, and binary search.",
    },
  ],
  stepByStepStrategy: [
    "1. Choose DP Dimension: Check constraints: If W <= 10^5, use DP by Weight. If W >= 10^9 and sum(V) <= 10^5, use DP by Value. If N <= 40, use Meet-in-the-Middle.",
    "2. Allocate 1D Array: `vector<long long> dp(W + 1, 0)`.",
    "3. Outer Loop Over Items: For each item `(wt, val)`.",
    "4. Inner Reverse Loop: `for (int w = W; w >= wt; w--) dp[w] = max(dp[w], dp[w - wt] + val)`.",
    "5. Final Answer: The maximum value is `dp[W]` or `*max_element(dp.begin(), dp.end())`.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

// 1. Standard 0/1 Knapsack in O(N * W) time and O(W) space
long long knapsack01(int W, const vector<int>& weights, const vector<long long>& values) {
    int n = weights.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        int wt = weights[i];
        long long val = values[i];
        // Reverse loop ensures each item is used at most once
        for (int w = W; w >= wt; w--) {
            dp[w] = max(dp[w], dp[w - wt] + val);
        }
    }

    return dp[W];
}

// 2. Knapsack with Huge Capacity (W up to 10^9, sum(V) <= 10^5)
long long knapsackHugeW(int W, const vector<int>& weights, const vector<int>& values) {
    int n = weights.size();
    int max_val = 0;
    for (int v : values) max_val += v;

    const long long INF = 1e18;
    vector<long long> dp(max_val + 1, INF);
    dp[0] = 0;

    for (int i = 0; i < n; i++) {
        int wt = weights[i];
        int val = values[i];
        for (int v = max_val; v >= val; v--) {
            if (dp[v - val] != INF) {
                dp[v] = min(dp[v], dp[v - val] + wt);
            }
        }
    }

    long long best_val = 0;
    for (int v = max_val; v >= 0; v--) {
        if (dp[v] <= W) {
            best_val = v;
            break;
        }
    }
    return best_val;
}`,
  pitfalls: [
    "Forward Loop in 0/1 Knapsack: Looping capacity from wt up to W turns 0/1 knapsack into unbounded knapsack (items can be reused infinitely). Always loop in reverse for 0/1 knapsack.",
    "Ignoring Huge W: Blindly creating an array `dp[W + 1]` when W = 10^9 immediately causes Out-Of-Memory (MLE). Check whether to swap state to DP by Value.",
    "Signed 32-bit Value Accumulation: Values can sum to > 2 * 10^9. Always use 64-bit `long long` for values and dp arrays.",
  ],
  practiceProblems: [
    {
      name: "Book Shop (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1158",
      platform: "CSES",
      hint: "Classic 0/1 knapsack with maximum pages for given budget.",
    },
    {
      name: "Knapsack 1 & 2 (AtCoder Educational DP)",
      rating: 1300,
      url: "https://atcoder.jp/contests/dp/tasks/dp_e",
      platform: "AtCoder",
      hint: "Knapsack 2 features W <= 10^9 and V <= 10^5. Invert DP state: dp[v] = minimum weight for value v.",
    },
    {
      name: "Two Sets II (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1093",
      platform: "CSES",
      hint: "Partition numbers 1..N into two sets of equal sum S = N*(N+1)/4. Count subsets summing to S using 0/1 knapsack.",
    },
    {
      name: "Subset Sum Queries (Codeforces)",
      rating: 1600,
      url: "https://codeforces.com/problemset/problem/687/C",
      platform: "Codeforces",
      hint: "2D knapsack tracking two simultaneous sums with bitset optimization.",
    },
  ],
};
