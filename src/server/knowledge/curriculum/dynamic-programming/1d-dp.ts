import { ConceptNode } from "../concept-node-type";

export const oneDDPConcept: ConceptNode = {
  slug: "1d-dp",
  name: "1D Dynamic Programming & State Reductions",
  category: "Dynamic Programming",
  difficulty: "BEGINNER",
  description:
    "Foundational optimization framework: breaking recursive subproblems into topological orders over Directed Acyclic Graphs with optimal substructure. Covers LIS, LCS, coin change, staircase DP, and the complete methodology for designing DP solutions from scratch.",
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
        "The Longest Increasing Subsequence (LIS) can be optimized from O(N²) to O(N log N) by maintaining 'tails': the smallest tail of all increasing subsequences of each length, enabling binary search for each new element.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 15: Dynamic Programming (pp. 359-390)",
      keyInsight:
        "Two essential ingredients: Optimal Substructure (optimal solution contains optimal solutions to subproblems) and Overlapping Subproblems (same subproblems recur many times). Both must hold for DP to apply.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 10: Dynamic Programming & Space Reductions",
      keyInsight:
        "When DP[i] depends only on DP[i-1] or a bounded window of predecessors, rolling buffers reduce auxiliary space from O(N) to O(1).",
    },
  ],
  conceptualTheory: `## 1D Dynamic Programming: A Complete Textbook Chapter

### What Is Dynamic Programming?

Dynamic Programming (DP) is an algorithmic paradigm for solving optimization or counting problems by:
1. **Breaking them into overlapping subproblems**.
2. **Solving each subproblem exactly once** and storing the result (memoization / tabulation).
3. **Combining subproblem solutions** to solve the larger problem.

The name "Dynamic Programming" is historical (Bellman coined it to sound impressive to government funders, not because it's descriptive). Think of it as: **"Smart Recursion with Memory."**

---

### The Two Key Properties

For DP to work, a problem must have:

**1. Optimal Substructure**: The optimal solution to the problem contains optimal solutions to its subproblems.

Example: The shortest path from A to C passing through B consists of the shortest path from A to B PLUS the shortest path from B to C. If you could shorten the A→B part, you'd also shorten A→C.

Counterexample (no optimal substructure): Longest path in a general graph (which may have cycles). The longest path from A to C doesn't necessarily contain the longest path from A to B.

**2. Overlapping Subproblems**: The recursive solution computes the same subproblems many times.

Example: Computing Fibonacci(10) requires Fibonacci(9) and Fibonacci(8). Computing Fibonacci(9) requires Fibonacci(8) and Fibonacci(7). Fibonacci(8) is computed TWICE! For Fibonacci(50), some subproblems are computed exponentially many times.

Without overlapping subproblems (e.g., merge sort), divide-and-conquer works fine. DP specifically addresses the overlapping case.

---

### The 4-Step DP Design Protocol

When approaching ANY DP problem, follow these steps in order:

**Step 1: Define the State**
"What is the minimum information needed to fully describe where I am in the problem?"

The state must capture exactly what you need to make future decisions WITHOUT knowing the history of how you got here. This is the **Markov property** — future is independent of past given present state.

Bad state: dp[i] = "something that depends on the whole prefix of decisions before i" (too much history).
Good state: dp[i] = "optimal answer for a subproblem defined by parameter i" (compact).

**Step 2: Define Base Cases**
"What are the smallest subproblems I can answer directly (without recursion)?"

Usually: dp[0] = 0 or dp[0] = 1, depending on what the state represents. These are the "seeds" from which the DP grows.

**Step 3: Write the Recurrence**
"How does dp[i] depend on previous states?"

The recurrence is the mathematical heart of the DP. It must:
- Only depend on SMALLER subproblems (to avoid circular dependencies).
- Cover ALL cases (exhaustively choose which option to take at step i).

**Step 4: Determine Evaluation Order**
"In what order must I compute states so all dependencies are ready?"

Usually: left-to-right (i = 0 to N). But sometimes right-to-left, or even 2D grid traversal. The order must be a TOPOLOGICAL ORDER of the dependency DAG.

---

### Classic Problem 1: Staircase / Fibonacci-style DP

**Problem**: Count ways to climb N stairs, taking 1 or 2 steps at a time.

State: dp[i] = number of ways to reach stair i.
Base: dp[0] = 1 (one way to stand at bottom), dp[1] = 1.
Recurrence: dp[i] = dp[i-1] + dp[i-2] (arrive from stair i-1 via 1-step, or from stair i-2 via 2-step).
Order: i = 2 to N.

This is essentially the Fibonacci sequence! DP gives O(N) instead of O(2^N) naive recursion.

---

### Classic Problem 2: Coin Change

**Problem**: Given coin denominations coins[] and target T, find the minimum number of coins to sum to T.

State: dp[t] = minimum coins needed to reach sum t.
Base: dp[0] = 0 (need 0 coins for sum 0).
Recurrence: dp[t] = min over all coins c where c ≤ t: dp[t - c] + 1.
Order: t = 1 to T.
Answer: dp[T] (or -1 / ∞ if dp[T] remains ∞ → impossible).

**Why this works**: To make sum t using minimum coins, the last coin used was some c, and before using c, we had sum t-c (optimally formed). This is optimal substructure.

\`\`\`
dp[0] = 0
for t = 1 to T:
    for each coin c:
        if c <= t and dp[t - c] + 1 < dp[t]:
            dp[t] = dp[t - c] + 1
\`\`\`

**Variation**: Count number of ways to make sum T (instead of minimum):
dp[t] += dp[t - c] for each coin c ≤ t. dp[0] = 1.

---

### Classic Problem 3: Longest Increasing Subsequence (LIS)

**Problem**: Given array A of N integers, find the length of the longest strictly increasing subsequence.

**O(N²) DP**:
State: dp[i] = length of LIS ending at index i (with A[i] as the last element).
Base: dp[i] = 1 (the element itself is a subsequence of length 1).
Recurrence: dp[i] = max over all j < i where A[j] < A[i]: dp[j] + 1.
Answer: max(dp[0], ..., dp[N-1]).

\`\`\`
for i in range(N):
    dp[i] = 1
    for j in range(i):
        if A[j] < A[i]:
            dp[i] = max(dp[i], dp[j] + 1)
\`\`\`

**O(N log N) Patience Sorting (Optimal)**:
Maintain array \`tails[]\` where tails[l] = the SMALLEST possible last element of any increasing subsequence of length l+1.

For each A[i]:
- Binary search for the first index in tails[] where tails[pos] ≥ A[i].
- Replace tails[pos] = A[i] (smaller tail = more room for future elements).
- If no such position exists (A[i] > all tails): extend tails (LIS length increased by 1).

The length of tails at the end = LIS length.

\`\`\`
from bisect import bisect_left
tails = []
for x in A:
    pos = bisect_left(tails, x)
    if pos == len(tails):
        tails.append(x)
    else:
        tails[pos] = x
return len(tails)
\`\`\`

---

### Classic Problem 4: Longest Common Subsequence (LCS)

**Problem**: Given strings/arrays A (length N) and B (length M), find the length of the longest common subsequence.

State: dp[i][j] = LCS length of A[0..i-1] and B[0..j-1].
Base: dp[0][j] = dp[i][0] = 0 (empty prefix has LCS 0 with anything).
Recurrence:
- If A[i-1] == B[j-1]: dp[i][j] = dp[i-1][j-1] + 1 (include this matching character).
- Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (skip either character).

Answer: dp[N][M].

**This is 2D DP**, but conceptually identical to 1D — just two parameters.

---

### Classic Problem 5: Maximum Subarray Sum (Kadane's Algorithm)

**Problem**: Find the contiguous subarray with the maximum sum.

State: dp[i] = maximum subarray sum ending at index i (MUST include A[i]).
Base: dp[0] = A[0].
Recurrence: dp[i] = max(A[i], dp[i-1] + A[i]).
- Either start a new subarray at i (just A[i]).
- Or extend the best subarray ending at i-1 (dp[i-1] + A[i]).

Answer: max(dp[0], ..., dp[N-1]).

**Space optimization**: dp[i] only depends on dp[i-1]. Use a single variable:
\`\`\`
best_ending_here = A[0]
global_best = A[0]
for i in range(1, N):
    best_ending_here = max(A[i], best_ending_here + A[i])
    global_best = max(global_best, best_ending_here)
\`\`\`

---

### Top-Down vs Bottom-Up DP

**Top-Down (Memoization)**:
Write the natural recursive solution, add a cache (dictionary or array) to store computed results.

Pros: Natural to write, only computes states actually needed.
Cons: Function call overhead, Python recursion limit.

\`\`\`python
from functools import lru_cache
@lru_cache(maxsize=None)
def dp(i):
    if i == 0: return base_case
    return min(dp(i-1) + ..., dp(i-2) + ...)
\`\`\`

**Bottom-Up (Tabulation)**:
Compute all states from base case to final answer, filling a table.

Pros: No recursion overhead, cache-friendly (sequential memory access), allows space optimization.
Cons: Must compute ALL states even if not needed.

For competitive programming: **bottom-up is almost always preferred** for performance.

---

### Space Optimization: Rolling Buffer

When dp[i] depends only on dp[i-1] (or a bounded window of k preceding states), you don't need to store the entire dp array. Use just k variables:

\`\`\`python
# Staircase: dp[i] = dp[i-1] + dp[i-2]
a, b = 1, 1  # dp[0], dp[1]
for i in range(2, N+1):
    a, b = b, a + b  # Roll: a=old dp[i-1], b=new dp[i]
# b = dp[N]
\`\`\`

This reduces O(N) space to O(1).

---

### Identifying DP Problems in Contests

Look for these signals:
1. **"Find the minimum/maximum..."** — optimize over choices.
2. **"Count the number of ways..."** — sum over choices.
3. **"Can we achieve exactly X?"** — boolean feasibility.
4. **Choices with no "undoing"** — each decision is permanent.
5. **Sequential structure** — array, string, or tree with natural order.
6. **Problem asks about subsequences, subsets, or subarrays** — classic DP territory.

The classic categories:
- **Linear sequence DP**: Operate on elements one at a time (coin change, staircase, LIS).
- **Interval DP**: dp[l][r] = answer for range [l,r] (matrix chain multiplication, palindrome partitioning).
- **Tree DP**: dp[node] = answer for subtree rooted at node.
- **Bitmask DP**: dp[mask] = answer for subset encoded in bitmask.
- **Digit DP**: Count numbers with special properties in range [L, R].`,

  variations: [
    {
      title: "Count/Optimize Over Linear Sequence",
      explanation: "Process elements one by one. dp[i] = best answer considering first i elements. Coin change, staircase DP, subset sum all fit this pattern.",
      formula: "dp[i] = min/max/sum over valid transitions from dp[j] for j < i",
      timeComplexity: "O(N × transitions)",
      spaceComplexity: "O(N) or O(1) with rolling buffer",
    },
    {
      title: "Longest Increasing Subsequence (O(N log N))",
      explanation: "Maintain 'tails' array: tails[l] = smallest last element of any IS of length l+1. Binary search for each element's position. tails length = LIS length.",
      formula: "bisect_left(tails, A[i]): replace or extend tails",
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Longest Common Subsequence",
      explanation: "2D DP on pairs of string indices. If characters match, extend diagonal; otherwise take max of left or above.",
      formula: "dp[i][j] = (A[i]==B[j]) ? dp[i-1][j-1]+1 : max(dp[i-1][j], dp[i][j-1])",
      timeComplexity: "O(N × M)",
      spaceComplexity: "O(N × M) or O(min(N,M)) with rolling rows",
    },
    {
      title: "Maximum Subarray (Kadane's)",
      explanation: "Track the maximum subarray sum ENDING at current position. Either extend previous or start fresh.",
      formula: "dp[i] = max(A[i], dp[i-1] + A[i])",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    {
      title: "DP on Strings / Intervals",
      explanation: "dp[l][r] = answer for the substring or interval [l,r]. Fill diagonally (increasing interval lengths). Used for palindrome partitioning, matrix chain, burst balloons.",
      formula: "dp[l][r] = min over split point k: dp[l][k] + dp[k+1][r] + cost(l,r)",
      timeComplexity: "O(N³)",
      spaceComplexity: "O(N²)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Minimum number of operations to convert one string/number to another",
      cue: "Edit distance DP: dp[i][j] = min edits to convert A[0..i-1] to B[0..j-1].",
    },
    {
      triggerConstraint: "Count the number of ways to reach sum T using given denominations, with unlimited reuse",
      cue: "Unbounded coin change counting DP: dp[t] = sum of dp[t - coin] for all valid coins.",
    },
    {
      triggerConstraint: "Minimum number of coins to sum to T",
      cue: "Coin change minimization DP: dp[t] = min(dp[t - c] + 1) over all coins c.",
    },
    {
      triggerConstraint: "Find the longest increasing subsequence length",
      cue: "LIS: O(N²) DP or O(N log N) patience sorting with binary search.",
    },
    {
      triggerConstraint: "Split array into minimum number of palindromic substrings",
      cue: "Interval DP on palindromes: precompute isPalin[l][r], then dp[i] = min cuts for prefix i.",
    },
    {
      triggerConstraint: "Count paths in a grid from top-left to bottom-right (only right and down moves)",
      cue: "2D DP: dp[r][c] = dp[r-1][c] + dp[r][c-1]. O(R×C) time and space.",
    },
  ],

  stepByStepStrategy: [
    "1. Read the problem carefully. Identify: Are you minimizing? Maximizing? Counting? Finding feasibility?",
    "2. Define the state: dp[i] = ? (the exact meaning). State must encode all info needed for future decisions.",
    "3. Identify base cases: smallest i (usually 0 or 1) where you know the answer directly.",
    "4. Write recurrence: dp[i] in terms of dp[j] for j < i. Think about the LAST DECISION made at step i.",
    "5. Determine evaluation order: almost always increasing i. Ensure all dp[j] are already computed when computing dp[i].",
    "6. Implement bottom-up, iteratively. Use long long if values can exceed 2×10^9.",
    "7. Check if space can be optimized: if dp[i] only depends on dp[i-1], use two variables.",
    "8. Test with small examples manually before submitting.",
  ],

  codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>
#include <climits>
#include <string>

using namespace std;

// =========================================================
// 1. Coin Change — Minimum Coins to Reach Sum T
// =========================================================
int coinChangeMin(int T, const vector<int>& coins) {
    const int INF = T + 1; // More than possible
    vector<int> dp(T + 1, INF);
    dp[0] = 0; // Base: 0 coins needed for sum 0

    for (int t = 1; t <= T; t++) {
        for (int c : coins) {
            if (c <= t && dp[t - c] != INF) {
                dp[t] = min(dp[t], dp[t - c] + 1);
            }
        }
    }

    return dp[T] == INF ? -1 : dp[T];
}

// Count number of ways to make sum T (unbounded coins)
long long coinChangeCount(int T, const vector<int>& coins) {
    const long long MOD = 1e9 + 7;
    vector<long long> dp(T + 1, 0);
    dp[0] = 1; // Base: 1 way to make sum 0 (empty set)

    for (int t = 1; t <= T; t++) {
        for (int c : coins) {
            if (c <= t) {
                dp[t] = (dp[t] + dp[t - c]) % MOD;
            }
        }
    }

    return dp[T];
}

// =========================================================
// 2. Longest Increasing Subsequence (LIS)
// =========================================================

// O(N^2) approach — useful when N <= 10^3 or need actual LIS indices
int lis_n2(const vector<int>& A) {
    int N = A.size();
    vector<int> dp(N, 1); // dp[i] = LIS length ending at A[i]

    for (int i = 1; i < N; i++) {
        for (int j = 0; j < i; j++) {
            if (A[j] < A[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }

    return *max_element(dp.begin(), dp.end());
}

// O(N log N) via patience sorting with binary search
int lis_nlogn(const vector<int>& A) {
    vector<int> tails; // tails[l] = smallest tail of all IS of length l+1

    for (int x : A) {
        // Find first position in tails where tails[pos] >= x
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x); // Extend LIS
        } else {
            *it = x; // Replace with smaller tail (more room for future)
        }
    }

    return tails.size(); // LIS length
}

// =========================================================
// 3. Longest Common Subsequence (LCS)
// =========================================================
int lcs(const string& A, const string& B) {
    int N = A.size(), M = B.size();
    // dp[i][j] = LCS length of A[0..i-1] and B[0..j-1]
    vector<vector<int>> dp(N + 1, vector<int>(M + 1, 0));

    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= M; j++) {
            if (A[i-1] == B[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1; // Characters match: extend
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]); // Skip one
            }
        }
    }

    return dp[N][M];
}

// =========================================================
// 4. Maximum Subarray Sum (Kadane's Algorithm) — O(N) O(1)
// =========================================================
long long maxSubarraySum(const vector<int>& A) {
    long long best = A[0], cur = A[0];
    for (int i = 1; i < (int)A.size(); i++) {
        cur = max((long long)A[i], cur + A[i]); // Start fresh or extend
        best = max(best, cur);
    }
    return best;
}

// =========================================================
// 5. Edit Distance (Levenshtein Distance)
// =========================================================
int editDistance(const string& A, const string& B) {
    int N = A.size(), M = B.size();
    // dp[i][j] = min edits to convert A[0..i-1] to B[0..j-1]
    vector<vector<int>> dp(N + 1, vector<int>(M + 1));

    // Base cases: converting to/from empty string
    for (int i = 0; i <= N; i++) dp[i][0] = i;
    for (int j = 0; j <= M; j++) dp[0][j] = j;

    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= M; j++) {
            if (A[i-1] == B[j-1]) {
                dp[i][j] = dp[i-1][j-1]; // No edit needed
            } else {
                dp[i][j] = 1 + min({
                    dp[i-1][j],    // Delete A[i-1]
                    dp[i][j-1],    // Insert B[j-1]
                    dp[i-1][j-1]   // Replace A[i-1] with B[j-1]
                });
            }
        }
    }

    return dp[N][M];
}

// =========================================================
// 6. Staircase DP — Count ways to climb N stairs (1 or 2 steps)
// =========================================================
long long staircaseDP(int N) {
    if (N <= 1) return 1;
    long long a = 1, b = 1; // dp[0], dp[1]
    for (int i = 2; i <= N; i++) {
        long long c = a + b; // dp[i] = dp[i-1] + dp[i-2]
        a = b;
        b = c;
    }
    return b;
}`,

  pitfalls: [
    "Off-by-One in Base Cases: If dp[0] should be 1 (one way to do nothing), setting it to 0 propagates zeros everywhere and gives wrong answer. Carefully reason about what dp[0] represents.",
    "Incorrect Evaluation Order: If dp[i] depends on dp[i+1] but you compute left-to-right, dp[i+1] hasn't been computed yet when you need it. Always verify the dependency direction.",
    "Integer Overflow: DP values counting paths can reach 2^N or N! variants. Use long long, and apply modular arithmetic % MOD when counting large numbers.",
    "State Not Minimal: If your state includes unnecessary history (making it 2D when 1D suffices), you'll use O(N²) memory and time instead of O(N). Ask: 'Can I determine future decisions from this state alone?'",
    "Confusing LCS with LIS: LCS works on TWO sequences (find common elements in order). LIS works on ONE sequence (find longest increasing elements in order). Different recurrences!",
    "LIS O(N log N) Using Wrong Binary Search: Using bisect_right instead of bisect_left (or upper_bound vs lower_bound) shifts the LIS by 1 or handles ties incorrectly. For strictly increasing: use bisect_left; for non-decreasing: use bisect_right.",
  ],

  practiceProblems: [
    {
      name: "Coin Combinations I (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1635",
      platform: "CSES",
      hint: "Count ordered ways to sum to T using given coins (unbounded). dp[t] = sum of dp[t - coin].",
    },
    {
      name: "Minimizing Coins (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1634",
      platform: "CSES",
      hint: "Minimum number of coins to reach sum T. dp[t] = min(dp[t - coin] + 1).",
    },
    {
      name: "Longest Increasing Subsequence (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1145",
      platform: "CSES",
      hint: "Implement O(N log N) patience sorting with bisect_left for strict increase.",
    },
    {
      name: "Edit Distance (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1639",
      platform: "CSES",
      hint: "Classic 2D LCS-style DP. dp[i][j] = min edits to convert A[0..i] to B[0..j].",
    },
    {
      name: "Grid Paths (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1638",
      platform: "CSES",
      hint: "Count paths from (1,1) to (N,N) with only right/down moves, avoiding traps. dp[r][c] = dp[r-1][c] + dp[r][c-1] if not trapped.",
    },
    {
      name: "Rectangle Cutting (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1744",
      platform: "CSES",
      hint: "Interval DP on 2D rectangle: dp[a][b] = min cuts to divide a×b rectangle into unit squares.",
    },
  ],

  deepExplanation: {
    intuition:
      `Dynamic Programming is the art of **converting exponential recursive trees into linear DAG traversals**.

Imagine computing Fibonacci(50) naively. The recursion tree has ~2^50 nodes—completely infeasible. But there are only 51 DISTINCT subproblems (Fib(0) through Fib(50)). Each is computed once, stored, and reused. The exponential tree "collapses" into a linear sequence.

This is the fundamental insight: **the number of distinct subproblems is polynomial, but the naive recursion computes them exponentially many times**. DP eliminates the redundancy.

The **DAG model** makes this precise: draw a node for each distinct subproblem. Draw a directed edge from subproblem B to subproblem A if computing A requires knowing B first. The resulting graph is a DAG (no cycles — we always compute "smaller" subproblems first). DP is simply computing this DAG in topological order.

**Designing the state** is the hardest and most important skill. The state must be:
- **Complete**: Enough information to compute all future decisions.
- **Minimal**: No redundant information (each state corresponds to exactly one subproblem).

**The "last decision" trick**: When writing the recurrence for dp[i], ask "what was the LAST decision made to arrive at state i?" This decomposes dp[i] into cases based on the last action:
- Coin change: "Which coin was the LAST coin used?"
- LIS: "Which element was the PREVIOUS element in the LIS?"
- Staircase: "Did I take 1 or 2 steps to reach stair i?"

For each case, the rest of the decisions must also be optimal (optimal substructure), so we recurse.

**Patience sorting for LIS** is a beautiful example of DP meeting greedy thinking: we greedily maintain "tails" that are as small as possible, allowing the maximum extension in the future. This is a profound insight: by keeping the smallest possible tail for each LIS length, we're maximally prepared to extend with any future element.`,

    proofOfCorrectness:
      `**Theorem (Optimal Substructure for Coin Change)**: If a set S of coins achieves sum T in the minimum number k of coins, then for the last coin c used, the remaining k-1 coins achieve sum T-c optimally.

**Proof by exchange argument**: Suppose the last coin used is c, and the remaining T-c is achieved by k-1 coins. If there existed a way to achieve T-c with fewer than k-1 coins, say k' < k-1 coins, then we could replace those k-1 coins with k' coins, achieving T with k'+1 < k coins total. This contradicts k being the minimum. ✓

**Theorem (LIS O(N log N) Correctness)**: After processing all N elements, the length of the tails array equals the LIS length.

**Invariant maintained after each element**: tails[l] = the smallest possible last element of any increasing subsequence of length l+1.

**Proof**: 
- tails is always strictly increasing (by construction: we only place x at position pos where tails[pos] >= x, so tails[pos] = x ≤ old tails[pos] and x > tails[pos-1]).
- After processing all elements, the length of tails = length of longest IS encountered.
- The actual LIS value is tails.size(). ✓ (Note: the specific values in tails are NOT the actual LIS elements; only its length is guaranteed correct.)`,

    complexityDerivation:
      `**Coin Change — O(T × |coins|)**:
- Outer loop: T values from 1 to T.
- Inner loop: |coins| coin denominations.
- Each iteration: O(1) work.
- Total: O(T × C) where C = number of coin denominations.

**LIS O(N²)**: Two nested loops of size N → O(N²).

**LIS O(N log N)**: N elements, each with a binary search on tails (size ≤ N) → O(N log N).

**LCS O(N × M)**: Two nested loops for the DP table → O(N × M).

**Kadane's Algorithm O(N)**: Single pass, O(1) work per element → O(N) time, O(1) space.

**Edit Distance O(N × M)**: Fill N × M table, each cell O(1) → O(N × M) time and space. Can be optimized to O(min(N,M)) space by using only two rolling rows.`,

    whenNotToUse:
      `**Do NOT use DP when**:
1. **No optimal substructure**: The optimal solution to the whole problem does NOT contain optimal solutions to subproblems. Classic example: Longest Path in a general graph (with cycles). Use brute force or constraint-specific algorithms.
2. **No overlapping subproblems**: If every subproblem is unique (as in divide-and-conquer), memoization gives no benefit.
3. **N is tiny (N ≤ 20)**: Bitmask DP is fine for N ≤ 20, but for N ≤ 10, exhaustive search might be simpler and fast enough.
4. **Greedy works**: If making locally optimal choices always yields globally optimal results (e.g., fractional knapsack, interval scheduling for maximum number of non-overlapping intervals), use greedy for O(N log N) instead of DP.
5. **State space is too large**: If states are (i, j, k) with each up to 10^5, total states = 10^15 — impossible. Reformulate or use a different approach.`,
  },

  workedExample: {
    title: "LIS O(N log N) Patience Sorting Trace",
    scenario: "Array A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]. Find LIS length.",
    input: "A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]. Expected LIS length = 4 (e.g., 1, 4, 5, 9 or 1, 4, 5, 6).",
    output: "tails final state gives LIS length = 4.",
    traceSteps: [
      {
        step: 1,
        state: "Process A[0] = 3",
        action: "tails = []. bisect_left([], 3) = 0 = len(tails). Extend: tails = [3].",
        insight: "First element always starts a new subsequence of length 1."
      },
      {
        step: 2,
        state: "Process A[1] = 1",
        action: "bisect_left([3], 1) = 0. Replace tails[0] = 1. tails = [1].",
        insight: "1 < 3. Replace 3 with 1 — same LIS length 1, but tail is now smaller (1 < 3), allowing more future extensions."
      },
      {
        step: 3,
        state: "Process A[2] = 4",
        action: "bisect_left([1], 4) = 1 = len(tails). Extend: tails = [1, 4].",
        insight: "4 > 1: extends a length-1 IS to length 2. LIS length now ≥ 2."
      },
      {
        step: 4,
        state: "Process A[3] = 1",
        action: "bisect_left([1, 4], 1) = 0. Replace tails[0] = 1. tails = [1, 4].",
        insight: "1 is not smaller than current tails[0]=1 (equal), so replaces it. tails unchanged."
      },
      {
        step: 5,
        state: "Process A[4] = 5",
        action: "bisect_left([1, 4], 5) = 2 = len(tails). Extend: tails = [1, 4, 5].",
        insight: "5 > 4: extends to length 3. LIS now ≥ 3."
      },
      {
        step: 6,
        state: "Process A[5] = 9",
        action: "Extend: tails = [1, 4, 5, 9]. LIS ≥ 4.",
        insight: "9 > all current tails. Length 4 IS exists: [1, 4, 5, 9]."
      },
      {
        step: 7,
        state: "Process A[6]=2, A[7]=6, A[8]=5, A[9]=3",
        action: "A[6]=2: bisect_left([1,4,5,9],2)=1, tails[1]=2. tails=[1,2,5,9]. A[7]=6: tails[3]=6. tails=[1,2,5,6]. A[8]=5: tails[2]=5. tails=[1,2,5,6]. A[9]=3: tails[2]=3. tails=[1,2,3,6].",
        insight: "Final tails=[1,2,3,6]. Length = 4 = LIS length. (Actual LIS could be [1,2,5,6] or [1,4,5,9] or [1,2,3,6] etc.)"
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Wrong Base Case (dp[0] = 0 vs dp[0] = 1)",
      cause: "dp[0] semantics differ by problem. Coin change (min coins): dp[0] = 0. Counting ways: dp[0] = 1 (one way to achieve sum 0: use no coins). Setting wrong base propagates incorrect values.",
      fix: "Always derive base cases from the STATE DEFINITION. 'dp[0] = minimum coins for sum 0' = 0 (use no coins). 'dp[0] = number of ways for sum 0' = 1 (one way: empty selection).",
      wrongSnippet: "dp[0] = 0 // In counting problems: should be 1!\nvector<int> dp(T+1, 0); // All zero: no ways found ever",
      correctedSnippet: "dp[0] = 1 // One way to form sum 0: take nothing\nvector<long long> dp(T+1, 0); dp[0] = 1;",
    },
    {
      trap: "LIS Patience Sort: bisect_right vs bisect_left",
      cause: "Using bisect_right (upper_bound) on equal elements places x AFTER equal elements, allowing x to be 'after' a duplicate — violating strict increase and giving wrong LIS length.",
      fix: "For STRICTLY increasing LIS: use bisect_left (lower_bound). This replaces the first element ≥ x, preventing duplicates.",
      wrongSnippet: "pos = bisect_right(tails, x) # Allows duplicates in IS → non-strictly increasing",
      correctedSnippet: "pos = bisect_left(tails, x)  # Strictly increasing: replace first element >= x",
    },
    {
      trap: "Forgetting Modular Arithmetic in Counting DPs",
      cause: "Counting paths or ways can produce numbers like 10^18 or larger. Without % MOD, this overflows long long silently, giving completely wrong large-number results.",
      fix: "Apply % MOD immediately in the inner loop: `dp[i] = (dp[i] + dp[j]) % MOD`.",
      wrongSnippet: "dp[t] += dp[t - c]; // Can reach 10^18+ without MOD, overflow!",
      correctedSnippet: "dp[t] = (dp[t] + dp[t - c]) % (long long)(1e9 + 7);",
    },
  ],

  pythonTemplate: `import sys
from bisect import bisect_left
from functools import lru_cache
from typing import List

def coin_change_min(T: int, coins: List[int]) -> int:
    """
    Minimum number of coins to make sum T.
    dp[t] = min coins for sum t.
    O(T × len(coins)) time, O(T) space.
    """
    INF = T + 1
    dp = [INF] * (T + 1)
    dp[0] = 0  # 0 coins for sum 0

    for t in range(1, T + 1):
        for c in coins:
            if c <= t and dp[t - c] + 1 < dp[t]:
                dp[t] = dp[t - c] + 1

    return dp[T] if dp[T] != INF else -1


def coin_change_count(T: int, coins: List[int]) -> int:
    """
    Count ordered ways to make sum T (each coin unlimited).
    dp[t] = number of ordered ways.
    O(T × len(coins)) time, O(T) space.
    """
    MOD = 10**9 + 7
    dp = [0] * (T + 1)
    dp[0] = 1  # 1 way to form sum 0: take nothing

    for t in range(1, T + 1):
        for c in coins:
            if c <= t:
                dp[t] = (dp[t] + dp[t - c]) % MOD

    return dp[T]


def lis_length(A: List[int]) -> int:
    """
    Longest Increasing Subsequence length in O(N log N).
    Uses patience sorting: maintain tails[], replace with binary search.
    Strictly increasing (bisect_left).
    """
    tails = []  # tails[l] = smallest tail of IS of length l+1

    for x in A:
        pos = bisect_left(tails, x)
        if pos == len(tails):
            tails.append(x)  # New longest IS found
        else:
            tails[pos] = x   # Replace: smaller tail = better for future

    return len(tails)


def lcs_length(A: str, B: str) -> int:
    """
    Longest Common Subsequence length.
    dp[i][j] = LCS of A[0..i-1] and B[0..j-1].
    O(N*M) time, O(N*M) space (can optimize to O(min(N,M))).
    """
    N, M = len(A), len(B)
    dp = [[0] * (M + 1) for _ in range(N + 1)]

    for i in range(1, N + 1):
        for j in range(1, M + 1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[N][M]


def max_subarray(A: List[int]) -> int:
    """
    Maximum contiguous subarray sum (Kadane's Algorithm).
    O(N) time, O(1) space.
    """
    best = cur = A[0]
    for x in A[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best


def edit_distance(A: str, B: str) -> int:
    """
    Minimum edit distance (Levenshtein) between strings A and B.
    Operations: insert, delete, replace (each costs 1).
    O(N*M) time, O(N*M) space.
    """
    N, M = len(A), len(B)
    dp = [[0] * (M + 1) for _ in range(N + 1)]

    for i in range(N + 1): dp[i][0] = i
    for j in range(M + 1): dp[0][j] = j

    for i in range(1, N + 1):
        for j in range(1, M + 1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])

    return dp[N][M]


if __name__ == '__main__':
    input = sys.stdin.readline
    T, *coins = map(int, sys.stdin.read().split())
    print(coin_change_min(T, coins))
`,
};
