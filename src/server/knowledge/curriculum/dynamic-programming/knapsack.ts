import { ConceptNode } from "../concept-node-type";

export const knapsackConcept: ConceptNode = {
  slug: "knapsack",
  name: "0/1, Unbounded & Bounded Knapsack DP",
  category: "Dynamic Programming",
  difficulty: "INTERMEDIATE",
  description:
    "Archetypal resource allocation framework selecting items with weights and values to maximize gain under a capacity limit. Covers 0/1, unbounded, bounded, and huge-W variants with full mathematical proofs.",
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
  conceptualTheory: `## The Knapsack Family: A Complete Textbook Chapter

### Background & Problem Statement

The **Knapsack Problem** is one of the most famous problems in combinatorial optimization. It models the following real-world scenario:

> You are a thief with a knapsack that can hold at most **W kilograms**. In front of you are **N items**, each with a weight \`wt[i]\` and a monetary value \`val[i]\`. You cannot take a fraction of any item—you must take the whole item or leave it. What is the maximum total value you can carry?

This single problem statement spawns an entire family of variants depending on whether items can be reused:
- **0/1 Knapsack**: Each item can be taken at most once.
- **Unbounded Knapsack**: Each item can be taken any number of times.
- **Bounded Knapsack**: Item i can be taken at most \`count[i]\` times.
- **Huge-W Knapsack**: W is astronomically large but total value is small—invert the DP state.

---

### Why Greedy Fails

Your first instinct might be to sort items by value-per-weight ratio (i.e., \`val[i] / wt[i]\`) and greedily pick the most efficient items until the knapsack is full. This works perfectly for the **fractional knapsack** (where you can take 0.7 of an item), but it fails catastrophically for the discrete version.

**Counterexample**:
| Item | Weight | Value | Val/Wt |
|------|--------|-------|--------|
| A    | 10     | 60    | 6.0    |
| B    | 6      | 45    | 7.5    |
| C    | 5      | 40    | 8.0    |

With W = 11: Greedy picks C (wt=5, val=40), then tries B (remaining cap=6, picks B, val=45) → total val=85. Wait—that works in this case. But consider W = 10:

Greedy picks C (wt=5, val=40), then B (wt=6, doesn't fit), then... nothing else fits → 40.
Optimal: A alone → 60. **Greedy fails!**

This is why we need dynamic programming: greedy cannot see ahead to understand that picking a slightly less efficient item now opens up a better combination later.

---

### The Optimal Substructure

DP works because the Knapsack problem has **optimal substructure**: the optimal solution to a problem of N items and capacity W contains the optimal solution to subproblems.

Formally: Let \`OPT(i, w)\` = maximum value using items from {1, ..., i} with weight limit w. Then:

$$OPT(i, w) = \\begin{cases} 0 & \\text{if } i = 0 \\\\ OPT(i-1, w) & \\text{if } wt[i] > w \\\\ \\max(OPT(i-1, w),\\; OPT(i-1, w - wt[i]) + val[i]) & \\text{otherwise} \\end{cases}$$

This says: either we **skip** item i (value = OPT(i-1, w)), or we **include** item i (value = OPT(i-1, w - wt[i]) + val[i]).

---

### 1. The 2D DP Table (Base Understanding)

Before optimizing, build the full 2D table. Create a table \`dp[i][w]\` where rows are items 0..N and columns are capacities 0..W.

\`\`\`
         cap→ 0   1   2   3   4   5
item↓
  0 (none)   [0,  0,  0,  0,  0,  0]
  1 (2,3)    [0,  0,  3,  3,  3,  3]
  2 (3,4)    [0,  0,  3,  4,  4,  7]
  3 (4,5)    [0,  0,  3,  4,  5,  7]
\`\`\`

- Row i, col w: max value using items 1..i with capacity w.
- After processing item 1 (wt=2,val=3): every w>=2 gets val=3.
- After item 2 (wt=3,val=4): at w=5, we can take both items (3+4=7).
- Item 3 at w=5: item3 alone=5 < 7. Answer stays 7.

**Time**: O(N*W). **Space**: O(N*W).

---

### 2. 1D Space Optimization: The Reverse Loop Invariant

The 2D table is wasteful. Each row \`dp[i]\` only depends on the **previous row** \`dp[i-1]\`. So we can use a single 1D array of size W+1, updating it in place.

**The critical invariant**: when we compute \`dp[w]\` for item i, we must ensure \`dp[w - wt[i]]\` still holds the value from item \`i-1\` (not the newly updated value from item i).

**Solution**: iterate w from W down to wt[i] (RIGHT TO LEFT). When we process w, we haven't touched w - wt[i] yet in this pass (since w - wt[i] < w and we go in decreasing order). Therefore, dp[w - wt[i]] still holds the OLD row i-1 value. ✓

If instead we iterate LEFT TO RIGHT (w from wt[i] up to W):
- When computing dp[w], we might read dp[w - wt[i]] which was already updated in this same pass → item i is being counted multiple times → this becomes **Unbounded Knapsack**!

---

### 3. Unbounded Knapsack: Forward Loop

If every item can be taken any number of times, we WANT to reuse the current item. So we iterate LEFT TO RIGHT:

\`\`\`
for each item (wt, val):
    for w = wt to W:
        dp[w] = max(dp[w], dp[w - wt] + val)
\`\`\`

When computing dp[w], dp[w - wt] may already reflect this item being taken once. Reading it allows taking the item again. This is exactly right for unbounded knapsack.

**Example**: Coin change (minimum coins) is an unbounded knapsack variant. Rod cutting is another classic example.

---

### 4. Bounded Knapsack: Binary Splitting

Suppose item i can be taken at most \`count[i]\` times. Naively, you'd add item i exactly count[i] times, giving O(N * W * max_count) which can be 10^5 * 10^5 * 10^3 = too slow.

**Binary Splitting Trick**: Decompose count[i] into a sum of powers of two plus a remainder:

$$count[i] = 1 + 2 + 4 + ... + 2^k + R \\quad \\text{where } R = count[i] - (2^{k+1} - 1) \\geq 0$$

For example, count=13 = 1 + 2 + 4 + 6. These form 4 "bundle" items with weights {wt, 2*wt, 4*wt, 6*wt} and values {val, 2*val, 4*val, 6*val}.

**Why it works**: any integer from 0 to 13 can be represented as a unique combination of {1, 2, 4, 6}. So the standard 0/1 knapsack on these bundles can select 0, 1, 2, ..., 13 copies of the original item—and nothing more.

**Complexity**: O(N * W * log(max_count)) — typically fine for contests.

---

### 5. Huge-W Knapsack: Invert the DP State

**Problem**: W = 10^9 but sum of all values ≤ 10^5, N ≤ 100.

Creating a dp array of size 10^9+1 is impossible (needs ~8 GB memory).

**Key insight**: Instead of asking "max value for capacity w?", ask "min weight to achieve value v?"

Define: \`dp[v]\` = minimum total weight to achieve exactly value v.

Recurrence (0/1 variant, reverse loop):
$$dp[v] = \\min(dp[v],\\; dp[v - val[i]] + wt[i])$$

Initialize: dp[0] = 0, dp[v] = ∞ for v > 0.

After processing all items, the answer is the maximum v such that dp[v] ≤ W.

---

### 6. Subset Sum as Knapsack

The **Subset Sum** problem (can we achieve exactly sum S?) is knapsack with val[i] = wt[i]:
\`\`\`
dp[w] = true if subset summing to w exists
dp[0] = true
for each item wt:
    for w = W down to wt:
        dp[w] |= dp[w - wt]
\`\`\`

This is useful for problems like "partition N numbers into two equal-sum groups": check if any subset sums to totalSum/2.

---

### 7. Meet-in-the-Middle (N ≤ 40)

When N ≤ 40 but W can be huge (10^18), standard DP is impossible. Split items into two halves of 20:
1. Enumerate all 2^20 subsets of each half → two lists of (weight, value) pairs.
2. Sort one list by weight.
3. For each element in the first list, binary search the second list for the best complement that doesn't exceed W.

Time: O(2^(N/2) * N/2) ≈ 10^6. Handles any W.`,

  variations: [
    {
      title: "0/1 Knapsack (Each Item at Most Once)",
      explanation: "Reverse capacity loop from W down to weight[i] on 1D array ensures each item used once. The backward sweep preserves the i-1 row semantics in a single array.",
      formula: "for w = W down to wt: dp[w] = max(dp[w], dp[w - wt] + val)",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Unbounded Knapsack (Infinite Copies of Each Item)",
      explanation: "Forward capacity loop from weight[i] up to W. Since dp[w - wt] is already updated in this pass, taking the item again is automatically allowed.",
      formula: "for w = wt up to W: dp[w] = max(dp[w], dp[w - wt] + val)",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Bounded Knapsack (Binary Power Splitting)",
      explanation: "Decompose item count K into binary bundles {1, 2, 4, ..., 2^floor(log2(K)), R}. Any number 0..K is expressible as subset of these bundles. Run standard 0/1 knapsack on the bundles.",
      formula: "O(N * W * log K) — bundle decomposition reduces count dimension",
      timeComplexity: "O(N * W * log K)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Knapsack with Huge Capacity (DP by Value)",
      explanation: "When W <= 10^9 but total value V <= 10^5, swap state: dp[v] = minimum weight to achieve value v. Iterate over values instead of weights.",
      formula: "dp[v] = min(dp[v], dp[v - val] + wt)",
      timeComplexity: "O(N * V_total)",
      spaceComplexity: "O(V_total)",
    },
    {
      title: "Subset Sum (Boolean Reachability)",
      explanation: "Variant where val[i] = wt[i]. dp[w] = true if some subset sums to exactly w. Used for partition problems and counting.",
      formula: "dp[w] |= dp[w - wt]",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      title: "Meet-in-the-Middle (N ≤ 40, huge W)",
      explanation: "Split items into two halves, enumerate all 2^20 subsets of each, sort and binary search for best pairs. Handles W up to 10^18.",
      formula: "Sort half-B by weight; for each half-A element, binary search half-B",
      timeComplexity: "O(2^(N/2) * N)",
      spaceComplexity: "O(2^(N/2))",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Given N items with weights and values, maximize total value under weight capacity W <= 10^5",
      cue: "Standard 0/1 Knapsack DP with reverse 1D loop in O(N*W).",
    },
    {
      triggerConstraint: "Weight capacity W is huge (e.g. 10^9) but values are small (V <= 1000, N <= 100)",
      cue: "Knapsack DP by Value: dp[v] = min weight for value v.",
    },
    {
      triggerConstraint: "N <= 40 asking for subset sum closest to target",
      cue: "Meet-in-the-Middle: Split array into two halves of size 20, compute 2^20 sums, and binary search.",
    },
    {
      triggerConstraint: "Unlimited reuse of items (coin change, rod cutting)",
      cue: "Unbounded Knapsack with forward loop or dedicated DP with inner for-each-item.",
    },
    {
      triggerConstraint: "Each item i usable at most count[i] times",
      cue: "Bounded Knapsack with binary splitting: decompose count[i] into {1,2,4,...,R} bundles.",
    },
  ],

  stepByStepStrategy: [
    "1. Identify variant: 0/1 (reverse loop), unbounded (forward loop), bounded (binary split + reverse), or huge-W (invert state to dp[value]).",
    "2. Choose DP Dimension: If W <= 10^5 → dp[W]. If W >= 10^9 and sum(V) <= 10^5 → dp[V]. If N <= 40 → Meet-in-the-Middle.",
    "3. Allocate 1D Array: `vector<long long> dp(W + 1, 0)` (or dp[max_val+1] for huge-W).",
    "4. Outer loop over items, inner loop over capacity in the correct direction (reverse for 0/1, forward for unbounded).",
    "5. Update: `dp[w] = max(dp[w], dp[w - wt] + val)` for max-value; `dp[w] |= dp[w - wt]` for subset-sum.",
    "6. Final Answer: dp[W] for exactly-W, or max_element(dp) for at-most-W knapsack.",
    "7. For bounded knapsack: before the main DP, expand each item (wt, val, count) into binary bundles and treat as 0/1 items.",
  ],

  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>
#include <numeric>

using namespace std;

// =========================================================
// 1. Standard 0/1 Knapsack — O(N * W) time, O(W) space
// =========================================================
long long knapsack01(int W, const vector<int>& weights, const vector<long long>& values) {
    int n = weights.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        int wt = weights[i];
        long long val = values[i];
        // Reverse loop: dp[w - wt] still holds OLD (i-1) value when evaluated
        for (int w = W; w >= wt; w--) {
            dp[w] = max(dp[w], dp[w - wt] + val);
        }
    }

    return dp[W]; // max value using exactly capacity W (or less)
}

// =========================================================
// 2. Unbounded Knapsack — O(N * W) time, O(W) space
// =========================================================
long long knapsackUnbounded(int W, const vector<int>& weights, const vector<long long>& values) {
    int n = weights.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        int wt = weights[i];
        long long val = values[i];
        // Forward loop: dp[w - wt] may be already updated → item reused
        for (int w = wt; w <= W; w++) {
            dp[w] = max(dp[w], dp[w - wt] + val);
        }
    }

    return dp[W];
}

// =========================================================
// 3. Bounded Knapsack via Binary Splitting — O(N * W * log K)
// =========================================================
long long knapsackBounded(int W,
                          const vector<int>& weights,
                          const vector<long long>& values,
                          const vector<int>& counts) {
    int n = weights.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        int cnt = counts[i];
        int wt  = weights[i];
        long long val = values[i];

        // Binary decomposition of cnt into bundles
        for (int k = 1; cnt > 0; k *= 2) {
            int bundle = min(k, cnt);
            cnt -= bundle;
            int bwt = bundle * wt;
            long long bval = (long long)bundle * val;
            // 0/1 knapsack step on this bundle (reverse loop)
            for (int w = W; w >= bwt; w--) {
                dp[w] = max(dp[w], dp[w - bwt] + bval);
            }
        }
    }

    return dp[W];
}

// =========================================================
// 4. Huge-W Knapsack (W up to 10^9, sum(V) <= 10^5)
//    Invert DP state: dp[v] = min weight to achieve value v
// =========================================================
long long knapsackHugeW(long long W,
                        const vector<int>& weights,
                        const vector<int>& values) {
    int n = weights.size();
    int max_val = 0;
    for (int v : values) max_val += v;

    const long long INF = 1e18;
    vector<long long> dp(max_val + 1, INF);
    dp[0] = 0;

    for (int i = 0; i < n; i++) {
        int wt = weights[i];
        int val = values[i];
        // 0/1 variant: reverse loop over value dimension
        for (int v = max_val; v >= val; v--) {
            if (dp[v - val] != INF) {
                dp[v] = min(dp[v], dp[v - val] + wt);
            }
        }
    }

    // Find highest achievable value within capacity W
    for (int v = max_val; v >= 0; v--) {
        if (dp[v] <= W) return v;
    }
    return 0;
}

// =========================================================
// 5. Subset Sum — boolean reachability O(N * W)
// =========================================================
bool subsetSum(int target, const vector<int>& nums) {
    vector<bool> dp(target + 1, false);
    dp[0] = true;

    for (int x : nums) {
        for (int w = target; w >= x; w--) {
            dp[w] = dp[w] || dp[w - x];
        }
    }

    return dp[target];
}

// =========================================================
// 6. Count subsets summing to target — O(N * W)
// =========================================================
long long countSubsets(int target, const vector<int>& nums) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(target + 1, 0);
    dp[0] = 1;

    for (int x : nums) {
        for (int w = target; w >= x; w--) {
            dp[w] = (dp[w] + dp[w - x]) % MOD;
        }
    }

    return dp[target];
}`,

  pitfalls: [
    "Forward Loop in 0/1 Knapsack: Looping capacity from wt up to W turns 0/1 knapsack into unbounded knapsack (items can be reused infinitely). Always loop in reverse for 0/1 knapsack.",
    "Ignoring Huge W: Blindly creating an array `dp[W + 1]` when W = 10^9 immediately causes Out-Of-Memory (MLE). Check whether to swap state to DP by Value.",
    "Signed 32-bit Value Accumulation: Values can sum to > 2 * 10^9. Always use 64-bit `long long` for values and dp arrays.",
    "Bounded Knapsack Naive Implementation: Running an inner loop for each copy of an item (O(N*W*count)) TLEs. Use binary splitting.",
    "Off-By-One on Subset Sum: When using dp[target] for subset sum, ensure dp[0]=1 (empty set sums to 0) and loop from target down to x (not x-1).",
    "Forgetting Modular Arithmetic: When counting subsets, add modular reduction `% MOD` in the inner loop or intermediate sums overflow.",
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
      name: "Coin Combinations I & II (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1635",
      platform: "CSES",
      hint: "Unbounded knapsack: Combinations I counts ordered (forward dp), Combinations II counts unordered (outer loop = coin, inner = sum).",
    },
    {
      name: "Subset Sum Queries (Codeforces)",
      rating: 1600,
      url: "https://codeforces.com/problemset/problem/687/C",
      platform: "Codeforces",
      hint: "2D knapsack tracking two simultaneous sums with bitset optimization.",
    },
    {
      name: "Partition Equal Subset Sum (LeetCode 416)",
      rating: 1300,
      url: "https://leetcode.com/problems/partition-equal-subset-sum/",
      platform: "LeetCode",
      hint: "Subset sum variant: check if any subset sums to totalSum/2.",
    },
  ],

  deepExplanation: {
    intuition:
      `The 0/1 Knapsack problem is the canonical example of DP on a resource with discrete items. The core tension is: when you include item i, you reduce available capacity by wt[i] but gain val[i]. When you exclude it, capacity is preserved. The DP explores BOTH options simultaneously for ALL items and ALL capacities without redundant recomputation. The 2D table visualization (rows = items added one at a time, columns = capacity from 0 to W) makes this concrete: each cell dp[i][w] stores the provably optimal answer for a subproblem. The 1D optimization is a space engineering trick—the backward sweep ensures we only ever look "behind" (smaller indices) where values haven't been updated yet in this pass, preserving the "previous-row" semantics.

The unbounded variant (coins, rod cutting) is philosophically different: we WANT self-referential updates because "taking item i once" already improves dp[w - wt[i]], so "taking item i again" from that improved base is valid. The forward loop makes this automatic.

Bounded knapsack sits between 0/1 and unbounded. Binary splitting is a beautiful algebraic trick: since any integer 0..k can be uniquely written as a subset of powers of two up to k, we convert a "how many?" question into a "which subsets of bundles?" question, which standard 0/1 knapsack can answer directly.

The huge-W inversion is a classic dual-space transformation in DP: when one dimension is too large, flip it to the other. If you're maximizing value subject to weight ≤ W, the dual is: minimize weight subject to value ≥ v. Solving the dual for all v and then finding the maximum v with dual-solution ≤ W gives the same answer.`,

    proofOfCorrectness:
      `**Theorem**: The 1D reverse-loop correctly implements 0/1 knapsack.

**Claim**: After processing item i with the reverse-loop sweep, dp[w] = max value using a subset of {item_1, ..., item_i} with total weight ≤ w.

**Proof by induction on i**:

*Base case* (i=0): dp[w] = 0 for all w. Trivially correct—empty set has 0 value.

*Inductive step*: Assume after processing items 1..i-1, dp[w] correctly stores OPT(i-1, w) for all w.

When we process item i (reverse sweep, w from W down to wt[i]):
- At the moment we compute new_dp[w] = max(dp[w], dp[w - wt[i]] + val[i]):
  - dp[w] = OPT(i-1, w) ✓ (not yet overwritten since we're at w)
  - dp[w - wt[i]] = OPT(i-1, w - wt[i]) ✓ (not yet overwritten since w - wt[i] < w and we iterate decreasing)
- Therefore: new_dp[w] = max(OPT(i-1, w), OPT(i-1, w-wt[i]) + val[i]) = OPT(i, w) ✓

By induction, after processing all N items, dp[W] = OPT(N, W). QED.

**Why forward loop gives unbounded**: With a forward sweep, when computing dp[w], dp[w - wt[i]] has ALREADY been updated in this pass (since w - wt[i] < w and we go increasing). So dp[w - wt[i]] already reflects item i being used at w - wt[i]. Computing dp[w] from this allows using item i again at position w. This is the correct behavior for unbounded knapsack.`,

    complexityDerivation:
      `**Time Complexity**: O(N × W) for 0/1 and unbounded knapsack.
- Outer loop: N items.
- Inner loop: W capacity values.
- Each iteration: O(1) work (max or min).
- Total: N × W operations.

**Is this polynomial?** Technically NO—this is *pseudopolynomial* time. W is the numeric value of the input, and true polynomial algorithms measure complexity in the number of *bits* needed to describe input. Since W = 2^(log W) bits encodes capacity W, O(N × W) = O(N × 2^(log W)) which is exponential in the bit-length of W. This is why knapsack is NP-complete in general (for unbounded W) but solvable in practice when W ≤ 10^5.

**Space Complexity**: O(W) with 1D optimization (down from O(N × W) for the 2D table).

**Practical limits (C++)**:
- N=1000, W=10^5: 10^8 simple ops ≈ 100-200ms ✓
- N=100, W=10^6: 10^8 ops ≈ 100ms ✓
- N=100, W=10^9: impossible (~8 GB array) → use dp-by-value

**Bounded Knapsack with Binary Splitting**: O(N × W × log(max_count)).
- Binary splitting converts count[i] items into O(log count[i]) bundle items.
- Standard 0/1 knapsack on all bundles.

**Meet-in-the-Middle**: O(2^(N/2) × N) time, O(2^(N/2)) space.
- Left half: enumerate 2^(N/2) subsets.
- Right half: sort by weight (O(2^(N/2) log 2^(N/2))).
- For each left subset: binary search right half.
- For N=40: 2^20 ≈ 10^6 operations. Very fast.`,

    whenNotToUse:
      `**Do NOT use knapsack DP when**:
1. **N is small (≤ 40) AND W is astronomically large (10^18)**: DP table allocation is impossible. Use Meet-in-the-Middle.
2. **Items are fractional**: Greedy (sort by val/wt, take greedily) solves Fractional Knapsack in O(N log N).
3. **Graph structure governs what you can take**: Tree DP or DAG DP replaces flat knapsack.
4. **N is very large but W is tiny**: An O(2^N) bitmask solution might be cleaner if N ≤ 20 and W is tiny.
5. **You need to reconstruct the exact items taken**: Maintain a parent/decision table dp_choice[i][w] alongside the DP, backtrack from dp[N][W] to find items. (This needs O(N×W) space again.)`,
  },

  workedExample: {
    title: "0/1 Knapsack Reverse Sweep Full Trace (W = 5)",
    scenario: "3 items: Item 1 (wt=2, val=3), Item 2 (wt=3, val=4), Item 3 (wt=4, val=5). Capacity W = 5.",
    input: "N = 3, W = 5. dp initialized: [0, 0, 0, 0, 0, 0] (indices 0..5)",
    output: "Maximum value = 7 (Items 1 + 2: total weight=5, total value=7).",
    traceSteps: [
      {
        step: 1,
        state: "Before processing Item 1 (wt=2, val=3)",
        action: "dp = [0, 0, 0, 0, 0, 0]. Reverse loop: w=5: max(0, dp[3]+3)=max(0,0+3)=3; w=4: max(0, dp[2]+3)=3; w=3: max(0, dp[1]+3)=3; w=2: max(0, dp[0]+3)=max(0,3)=3. w=1: 1 < wt=2, skip.",
        insight: "Item 1 fits at all capacities ≥ 2. dp = [0, 0, 3, 3, 3, 3]"
      },
      {
        step: 2,
        state: "After Item 1, Before Item 2 (wt=3, val=4)",
        action: "dp = [0, 0, 3, 3, 3, 3]. Reverse loop: w=5: max(3, dp[2]+4)=max(3, 3+4)=7! w=4: max(3, dp[1]+4)=max(3, 0+4)=4. w=3: max(3, dp[0]+4)=max(3,4)=4. w=2,1: skip (< wt=3).",
        insight: "At w=5: dp[2]=3 means Item 1 fills 2 kg, adding Item 2 (3 kg) gives total wt=5, val=7! dp = [0, 0, 3, 4, 4, 7]"
      },
      {
        step: 3,
        state: "After Item 2, Before Item 3 (wt=4, val=5)",
        action: "dp = [0, 0, 3, 4, 4, 7]. Reverse loop: w=5: max(7, dp[1]+5)=max(7, 0+5)=7. w=4: max(4, dp[0]+5)=max(4,5)=5. Skip w<4.",
        insight: "Item 3 alone at cap=4 beats previous best (5>4). But at cap=5, items 1+2 (val=7) is still better than item 3 (val=5). dp = [0, 0, 3, 4, 5, 7]"
      },
      {
        step: 4,
        state: "Final Answer",
        action: "dp[5] = 7",
        insight: "Optimal subset: {Item 1 (wt=2, val=3), Item 2 (wt=3, val=4)}. Total weight = 5 = W, total value = 7."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Forward Loop Turning 0/1 into Unbounded Knapsack",
      cause: "Writing `for (int w = wt; w <= W; w++)` causes the same item to be added to itself repeatedly across larger capacities, because dp[w - wt] was already updated in this same pass.",
      fix: "Always loop in reverse `for (int w = W; w >= wt; w--)` for 0/1 knapsack where items are unique.",
      wrongSnippet: "for (int w = wt; w <= W; w++) dp[w] = max(dp[w], dp[w - wt] + val); // Unbounded!",
      correctedSnippet: "for (int w = W; w >= wt; w--) dp[w] = max(dp[w], dp[w - wt] + val); // 0/1 knapsack",
    },
    {
      trap: "Memory Limit Exceeded on Large Capacity W",
      cause: "Allocating `vector<int> dp(W + 1)` when W = 10^9 causes immediate memory allocation crash (needs ~8 GB).",
      fix: "Check problem constraints. If W <= 10^9 and sum(V) <= 10^5, invert DP state: `dp[v] = min_weight`.",
      wrongSnippet: "vector<long long> dp(W + 1, 0); // Fails when W = 10^9",
      correctedSnippet: "vector<long long> dp(sum_val + 1, INF); dp[0] = 0; // State is value, entries are min weights",
    },
    {
      trap: "Missing Long Long in Knapsack Values",
      cause: "When values can be up to 10^9 each, summing multiple item values overflows 32-bit signed int (~2.14 * 10^9).",
      fix: "Declare dp array as `vector<long long>` to support cumulative values up to 10^18.",
      wrongSnippet: "vector<int> dp(W + 1, 0); // Overflows when sum of values exceeds 2.14 * 10^9",
      correctedSnippet: "vector<long long> dp(W + 1, 0); // Safe 64-bit value accumulation",
    },
    {
      trap: "Naive Bounded Knapsack O(N*W*K) TLE",
      cause: "Iterating a count[i] loop inside the capacity loop without binary splitting produces O(N * W * max_count) which is far too slow.",
      fix: "Apply binary splitting: decompose count[i] into bundles of powers of two, then treat as O(log count[i]) separate 0/1 items.",
      wrongSnippet: "for (int c = 0; c < count[i]; c++) for (int w = W; w >= wt; w--) dp[w] = max(dp[w], dp[w-wt]+val); // O(K*N*W)",
      correctedSnippet: "// Binary split: bundle sizes 1, 2, 4, ..., R — then standard 0/1 knapsack on bundles",
    },
  ],

  pythonTemplate: `import sys
from typing import List

def solve_01_knapsack(W: int, weights: List[int], values: List[int]) -> int:
    """
    Standard 0/1 Knapsack in O(N * W).
    Each item can be used at most once.
    Reverse loop prevents reuse within same item pass.
    """
    dp = [0] * (W + 1)

    for wt, val in zip(weights, values):
        # Reverse loop: dp[w - wt] still holds old (pre-item) value
        for w in range(W, wt - 1, -1):
            if dp[w - wt] + val > dp[w]:
                dp[w] = dp[w - wt] + val

    return dp[W]


def solve_unbounded_knapsack(W: int, weights: List[int], values: List[int]) -> int:
    """
    Unbounded Knapsack in O(N * W).
    Each item can be used any number of times.
    Forward loop allows self-reference (reuse).
    """
    dp = [0] * (W + 1)

    for wt, val in zip(weights, values):
        for w in range(wt, W + 1):
            if dp[w - wt] + val > dp[w]:
                dp[w] = dp[w - wt] + val

    return dp[W]


def solve_bounded_knapsack(W: int, weights: List[int], values: List[int], counts: List[int]) -> int:
    """
    Bounded Knapsack via binary splitting in O(N * W * log K).
    count[i] copies of item i available.
    """
    dp = [0] * (W + 1)

    for wt, val, cnt in zip(weights, values, counts):
        # Binary decomposition of cnt
        k = 1
        while cnt > 0:
            bundle = min(k, cnt)
            cnt -= bundle
            bwt = bundle * wt
            bval = bundle * val
            # 0/1 knapsack step on this bundle
            for w in range(W, bwt - 1, -1):
                dp[w] = max(dp[w], dp[w - bwt] + bval)
            k *= 2

    return dp[W]


def solve_huge_w_knapsack(W: int, weights: List[int], values: List[int]) -> int:
    """
    Huge-W Knapsack: W up to 10^9, sum(values) <= 10^5.
    Invert DP state: dp[v] = min weight to achieve value v.
    """
    max_val = sum(values)
    INF = float('inf')
    dp = [INF] * (max_val + 1)
    dp[0] = 0

    for wt, val in zip(weights, values):
        for v in range(max_val, val - 1, -1):
            if dp[v - val] + wt < dp[v]:
                dp[v] = dp[v - val] + wt

    # Find maximum achievable value within capacity W
    for v in range(max_val, -1, -1):
        if dp[v] <= W:
            return v
    return 0


def solve_subset_sum(target: int, nums: List[int]) -> bool:
    """
    Subset sum: can any subset of nums sum to exactly target?
    Boolean 0/1 knapsack variant.
    """
    dp = [False] * (target + 1)
    dp[0] = True

    for x in nums:
        for w in range(target, x - 1, -1):
            dp[w] = dp[w] or dp[w - x]

    return dp[target]


def count_subsets(target: int, nums: List[int]) -> int:
    """Count number of subsets summing to target, modulo 10^9+7."""
    MOD = 10**9 + 7
    dp = [0] * (target + 1)
    dp[0] = 1

    for x in nums:
        for w in range(target, x - 1, -1):
            dp[w] = (dp[w] + dp[w - x]) % MOD

    return dp[target]


if __name__ == '__main__':
    input = sys.stdin.readline
    n, W = map(int, input().split())
    weights = list(map(int, input().split()))
    values = list(map(int, input().split()))
    print(solve_01_knapsack(W, weights, values))
`,
};
