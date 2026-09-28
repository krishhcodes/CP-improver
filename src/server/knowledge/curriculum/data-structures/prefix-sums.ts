import { ConceptNode } from "../concept-node-type";

export const prefixSumsConcept: ConceptNode = {
  slug: "prefix-sums",
  name: "Prefix Sum & Difference Arrays",
  category: "Data Structures & Math",
  difficulty: "BEGINNER",
  description:
    "Foundational precomputation technique enabling O(1) static range sum queries and O(1) offline range updates on multi-dimensional arrays.",
  timeComplexity: "O(N) build, O(1) query",
  spaceComplexity: "O(N)",
  prerequisites: [],
  dependents: ["two-pointers", "string-hashing"],
  literatureReferences: [
    {
      source: "USACO Guide (Silver)",
      section: "Introduction to Prefix Sums & More on Prefix Sums (2D)",
      url: "https://usaco.guide/silver/prefix-sums",
      keyInsight:
        "Precomputing cumulative sums reduces repeated contiguous segment summations from O(N) to O(1), and extends naturally to 2D matrices via 4-term inclusion-exclusion.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 9: Range Queries — Static Array Queries (pp. 83-85)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Prefix sums represent the discrete analogue of integration, while difference arrays represent differentiation. Any invertible associative operator over a group can form a prefix structure.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 3.2.1: Non-Trivial Prefix Sum Applications",
      keyInsight:
        "Transforming subarray divisibility problems (sum % K == 0) into equivalence relations on remainder frequencies: P[r] ≡ P[l-1] (mod K).",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 8: Intervals and Offline Updates",
      keyInsight:
        "A difference array transforms range addition queries [l, r] += v into two point updates: D[l] += v and D[r+1] -= v, evaluated in one sweep.",
    },
  ],
  conceptualTheory: `## Prefix Sums & Difference Arrays: A Complete Textbook Chapter

### The Fundamental Problem: Range Sum Queries Without Modification

Consider one of the most foundational tasks in algorithmic problem solving:
> You are given an array $A$ of $N$ integers. You must answer $Q$ independent queries:
> *"What is the sum of elements from index $l$ to index $r$ ($A[l] + A[l+1] + \dots + A[r]$)?"* ($N, Q \le 2 \times 10^5$)

#### The Naive Approach
For each query, iterate from $l$ to $r$ and sum the elements:
- Time per query: $O(N)$ in the worst case (when $l = 0, r = N-1$).
- Total time: $O(Q \times N) \approx 2 \times 10^5 \times 2 \times 10^5 = 4 \times 10^{10} \text{ operations (TLE!)}$

#### The Prefix Sum Breakthrough
By investing **$O(N)$ precomputation time**, we can answer ANY range sum query in strictly **$O(1)$ time**!
$$\text{Total Time} = O(N + Q) \approx 4 \times 10^5 \text{ operations (0.01 seconds!)}$$

---

### 1. 1D Prefix Sums: Mathematical Foundation & The Sentinel Invariant

#### Formal Definition
Given an array $A[0 \dots N-1]$, define the **Prefix Sum Array** $P[0 \dots N]$ of length $N + 1$:
- $P[0] = 0$ (The sum of an empty prefix is always zero)
- $P[i] = P[i-1] + A[i-1]$ for all $1 \le i \le N$

Thus, $P[i]$ stores the exact sum of the first $i$ elements:
$$P[i] = \sum_{k=0}^{i-1} A[k]$$

#### The Fundamental Cancellation Identity
For any contiguous range $A[l \dots r]$ (0-indexed, inclusive, $0 \le l \le r < N$):
$$\sum_{k=l}^{r} A[k] = P[r + 1] - P[l]$$

#### Algebraic Proof of Correctness
Expand both terms using their definitions:
$$P[r + 1] = A[0] + A[1] + \dots + A[l-1] + A[l] + \dots + A[r]$$
$$P[l] = A[0] + A[1] + \dots + A[l-1]$$
Subtracting the two equations:
$$P[r + 1] - P[l] = (A[0] + \dots + A[r]) - (A[0] + \dots + A[l-1]) = A[l] + A[l+1] + \dots + A[r]$$
All elements before index $l$ cancel out completely!

#### Why the Sentinel $P[0] = 0$ Is Critical
If we used a 0-indexed prefix array where $P[i] = A[0] + \dots + A[i]$, querying a range starting at $l = 0$ would require special-case handling:
\`if (l == 0) return P[r]; else return P[r] - P[l-1];\`
By allocating size $N + 1$ with $P[0] = 0$, every query uniformly evaluates to \`P[r + 1] - P[l]\` with zero branching!

#### Trace Walkthrough
\`\`\`
Index:     0   1   2   3   4   5   6   7
A:       [ 3,  1,  4,  1,  5,  9,  2,  6 ]
P:   [ 0,  3,  4,  8,  9, 14, 23, 25, 31 ]
       ↑ P[0] = 0 (Sentinel)

Query sum(2, 5): P[6] - P[2] = 23 - 4 = 19  ✓ (4 + 1 + 5 + 9 = 19)
Query sum(0, 3): P[4] - P[0] =  9 - 0 =  9  ✓ (3 + 1 + 4 + 1 = 9)
Query sum(4, 4): P[5] - P[4] = 14 - 9 =  5  ✓ (A[4] = 5)
\`\`\`

#### Integer Overflow Warning
With $N = 2 \times 10^5$ elements, each up to $10^9$:
$$\text{Maximum Prefix Sum} = 2 \times 10^5 \times 10^9 = 2 \times 10^{14}$$
This massively exceeds the signed 32-bit integer limit ($2.14 \times 10^9$).
**Always declare the prefix sum array as \`vector<long long>\` or \`long long pref[]\`!**

---

### 2. 2D Prefix Sums (Matrix Subgrid Queries)

#### Problem Formulation
Given a 2D matrix $M$ of size $R \times C$, answer $Q$ queries:
*"What is the sum of numbers in the rectangular subgrid from top-left $(r_1, c_1)$ to bottom-right $(r_2, c_2)$ inclusive?"*

#### Construction via Inclusion-Exclusion
We build an $(R + 1) \times (C + 1)$ prefix matrix $P$, where $P[r][c]$ is the sum of all cells in the rectangle from $(0, 0)$ to $(r - 1, c - 1)$:
$$P[r][c] = M[r-1][c-1] + P[r-1][c] + P[r][c-1] - P[r-1][c-1]$$

**Intuition**:
- Take the current cell $M[r-1][c-1]$.
- Add the rectangle directly above: $P[r-1][c]$.
- Add the rectangle directly to the left: $P[r][c-1]$.
- The top-left corner $P[r-1][c-1]$ was included in both rectangles (double counted), so subtract it once!

#### Querying Any Subgrid in O(1)
For query rectangle $(r_1, c_1)$ to $(r_2, c_2)$ (0-indexed, inclusive):
$$\text{Sum} = P[r_2 + 1][c_2 + 1] - P[r_1][c_2 + 1] - P[r_2 + 1][c_1] + P[r_1][c_1]$$

\`\`\`
+---------------------+-------------------+
|                     |                   |
|     P[r1][c1]       |    P[r1][c2+1]    |
|   (Added back)      |   (Subtracted)    |
|                     |                   |
+---------------------+-------------------+
|                     |                   |
|    P[r2+1][c1]      |   P[r2+1][c2+1]   |
|   (Subtracted)      |  (Full Rectangle) |
|                     |                   |
+---------------------+-------------------+
\`\`\`

---

### 3. Difference Arrays: The Dual of Prefix Sums

While Prefix Sums turn $O(N)$ range queries into $O(1)$, **Difference Arrays** turn $O(N)$ range updates into $O(1)$!

#### Problem Formulation
You start with an array $A$ of all zeros.
You are given $Q$ offline range updates:
*"Add value $V$ to all elements in closed interval $[L, R]$."*
After all $Q$ updates are performed, output the final array $A$.

#### The Difference Invariant
Define the difference array $D[0 \dots N]$ such that:
$$D[0] = A[0], \quad D[i] = A[i] - A[i-1]$$
Notice that $A$ is the **prefix sum of $D$**:
$$A[i] = \sum_{k=0}^{i} D[k]$$

#### The O(1) Range Update Trick
Adding $V$ to all elements in $A[L \dots R]$ changes only **TWO** elements in the difference array:
1. $D[L] \mathrel{+}= V$ (Starts the additive wave of $+V$ from position $L$ onward)
2. $D[R + 1] \mathrel{-}= V$ (Cancels the $+V$ wave for all positions beyond $R$)

Total time for $Q$ range updates: $O(Q \times 1) = O(Q)$!
At the end, reconstruct array $A$ with a single prefix sum sweep in $O(N)$:
\`\`\`cpp
vector<long long> D(n + 2, 0);
for (auto& upd : updates) {
    D[upd.l] += upd.v;
    D[upd.r + 1] -= upd.v;
}
vector<long long> A(n);
long long running = 0;
for (int i = 0; i < n; i++) {
    running += D[i];
    A[i] = running;
}
\`\`\`

#### 2D Difference Array
For a 2D rectangle update adding $V$ to $(r_1, c_1) \dots (r_2, c_2)$:
- $D[r_1][c_1] \mathrel{+}= V$
- $D[r_1][c_2 + 1] \mathrel{-}= V$
- $D[r_2 + 1][c_1] \mathrel{-}= V$
- $D[r_2 + 1][c_2 + 1] \mathrel{+}= V$
Reconstruct $A$ by running 2D prefix sums over $D$ (first row-wise, then column-wise) in $O(R \times C)$!

---

### 4. Subarray Counting Archetypes via Prefix Sums

#### Archetype A: Subarrays with Sum Equal to Target S
*"Count how many subarrays satisfy $A[l] + \dots + A[r] = S$."*
1. Subarray sum is $P[r+1] - P[l] = S \iff P[l] = P[r+1] - S$.
2. Maintain a hash map \`freq\` of prefix sum frequencies.
3. As you iterate $r$ from 0 to $N-1$:
   - \`ans += freq[P[r+1] - S]\`
   - \`freq[P[r+1]]++\`
4. Initialize \`freq[0] = 1\` (empty prefix!). Runtime: $O(N)$!

#### Archetype B: Subarrays Divisible by K
*"Count how many subarrays have sum divisible by $K$."*
1. $(P[r+1] - P[l]) \equiv 0 \pmod K \iff P[r+1] \equiv P[l] \pmod K$.
2. Maintain frequency count of remainders $P[i] \pmod K$.
3. When remainder $rem$ has appeared $C$ times, it creates $\binom{C}{2} = \frac{C(C-1)}{2}$ valid subarrays!
4. Remember the negative modulo fix: \`rem = ((P[i] % K) + K) % K\`.

#### Archetype C: Maximum Subarray Sum (Kadane via Prefix Sums)
The maximum subarray ending at index $r$ is:
$$\max_{0 \le l \le r} (P[r + 1] - P[l]) = P[r + 1] - \min_{0 \le l \le r} P[l]$$
By tracking the running minimum prefix sum seen so far (\`min_pref\`), we compute the maximum subarray sum in strictly $O(N)$ time and $O(1)$ auxiliary space!

---

### 5. Tree Prefix Sums (Range Queries on Trees via LCA)

Prefix sums extend beautifully to trees rooted at vertex 1:
Let $dist[u]$ be the sum of values on the path from root 1 down to node $u$.

#### 1. Path Sum Query Between Any Two Nodes (u, v)
The path between $u$ and $v$ passes through their Lowest Common Ancestor $L = \text{LCA}(u, v)$:
- **For values on Vertices**:
  $$\text{path\_sum}(u, v) = dist[u] + dist[v] - dist[L] - dist[\text{parent}(L)]$$
- **For values on Edges**:
  $$\text{path\_sum}(u, v) = dist[u] + dist[v] - 2 \times dist[L]$$

#### 2. Subtree Value Updates via Difference Arrays on Trees
To add $V$ to all nodes in the subtree of $u$:
- Using Euler Tour (tree flattening): the subtree of $u$ corresponds to a contiguous index range $[\text{in}[u], \text{out}[u]]$.
- A subtree update is simply a range update $[\text{in}[u], \text{out}[u]] \mathrel{+}= V$ on a 1D difference array!

---

### Contest Checklist & Common Traps

1. **64-bit Integer Overflow**:
   Always declare \`vector<long long> pref\` when summing up to $2 \times 10^5$ elements.
2. **0-Indexed vs 1-Indexed Range Query**:
   Subarray $A[l \dots r]$ is \`pref[r + 1] - pref[l]\`. Forgetting the \`+ 1\` drops element $A[r]$.
3. **Always Set \`freq[0] = 1\`**:
   In prefix sum hash map problems, setting \`freq[0] = 1\` accounts for valid subarrays starting at index 0.
4. **Negative Modulo**:
   In C++, \`(-5) % 3 == -2\`. Always write \`((x % k) + k) % k\`.`,
  variations: [
    {
      title: "1D Static Range Sums",
      explanation: "O(N) precomputation, O(1) query. Use 64-bit integers to prevent 32-bit arithmetic overflow.",
      formula: "sum(l, r) = pref[r + 1] - pref[l]",
      codeSnippet: `long long query(int l, int r) { return pref[r + 1] - pref[l]; }`,
      timeComplexity: "O(N) build, O(1) query",
      spaceComplexity: "O(N)",
    },
    {
      title: "2D Matrix Prefix Sums",
      explanation: "Computes any rectangular subgrid sum in O(1) after O(R * C) dynamic programming precomputation.",
      formula: "P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]",
      codeSnippet: `long long query2D(int r1, int c1, int r2, int c2) {
    return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1];
}`,
      timeComplexity: "O(R * C) build, O(1) query",
      spaceComplexity: "O(R * C)",
    },
    {
      title: "Difference Array (Range Updates)",
      explanation: "Transforms range addition queries [l, r] += v into two point updates in O(1) each.",
      formula: "D[l] += v, D[r + 1] -= v",
      codeSnippet: `void rangeAdd(int l, int r, long long v) {
    D[l] += v;
    if (r + 1 < n) D[r + 1] -= v;
}`,
      timeComplexity: "O(1) update, O(N) reconstruction",
      spaceComplexity: "O(N)",
    },
    {
      title: "Subarray Sum Divisible by K",
      explanation: "Subarray sum (pref[r] - pref[l-1]) % K == 0 is equivalent to pref[r] % K == pref[l-1] % K. Maintain frequency map of remainders.",
      formula: "pref[r] % K == pref[l - 1] % K",
      codeSnippet: `long long countDivisibleSubarrays(const vector<int>& a, int k) {
    unordered_map<int, int> remCount;
    remCount[0] = 1;
    long long pref = 0, ans = 0;
    for (int x : a) {
        pref = ((pref + x) % k + k) % k;
        ans += remCount[pref];
        remCount[pref]++;
    }
    return ans;
}`,
      timeComplexity: "O(N)",
      spaceComplexity: "O(K)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Static array with Q up to 2 * 10^5 range sum queries without updates",
      cue: "Prefix sums: O(N) precomputation, O(1) per query.",
    },
    {
      triggerConstraint: "Q offline range additions [l, r] += v before all reads",
      cue: "Difference array: D[l] += v, D[r+1] -= v, final prefix sum pass.",
    },
    {
      triggerConstraint: "Finding count or length of subarrays whose sum meets a modular condition (e.g. sum % K == 0)",
      cue: "Prefix sums with remainder frequency hash map.",
    },
    {
      triggerConstraint: "2D grid rectangle sum queries with N, M <= 1000 and Q <= 2 * 10^5",
      cue: "2D Prefix Sums with 4-term inclusion-exclusion formula.",
    },
  ],
  stepByStepStrategy: [
    "1. Size Allocation: Allocate size N + 1 for 1-based indexing, setting pref[0] = 0.",
    "2. Integer Type Selection: Always use long long for prefix sums. N = 2 * 10^5 elements of 10^9 sum to 2 * 10^14, exceeding 32-bit signed int (2 * 10^9).",
    "3. Construction Loop: Compute pref[i] = pref[i-1] + a[i-1] for i in 1..N.",
    "4. Query Conversion: For 0-indexed subarray [l, r], query pref[r+1] - pref[l].",
    "5. 2D Verification: Ensure boundary terms are subtracted and top-left overlap is added back exactly once.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

// 1D Prefix Sums Engine
struct PrefixSum1D {
    vector<long long> pref;

    PrefixSum1D(const vector<int>& a) {
        int n = a.size();
        pref.assign(n + 1, 0);
        for (int i = 0; i < n; i++) {
            pref[i + 1] = pref[i] + a[i];
        }
    }

    // Query sum of a[l..r] (0-indexed, inclusive)
    long long query(int l, int r) const {
        if (l > r) return 0;
        return pref[r + 1] - pref[l];
    }
};

// 2D Matrix Prefix Sums Engine
struct PrefixSum2D {
    int R, C;
    vector<vector<long long>> pref;

    PrefixSum2D(const vector<vector<int>>& mat) {
        R = mat.size();
        C = mat[0].size();
        pref.assign(R + 1, vector<long long>(C + 1, 0));

        for (int r = 0; r < R; r++) {
            for (int c = 0; c < C; c++) {
                pref[r + 1][c + 1] = mat[r][c]
                                   + pref[r][c + 1]
                                   + pref[r + 1][c]
                                   - pref[r][c];
            }
        }
    }

    // Query sum of subgrid (r1, c1) to (r2, c2) inclusive
    long long query(int r1, int c1, int r2, int c2) const {
        return pref[r2 + 1][c2 + 1]
             - pref[r1][c2 + 1]
             - pref[r2 + 1][c1]
             + pref[r1][c1];
    }
};`,
  pitfalls: [
    "32-Bit Integer Overflow: Accumulating 10^5 elements of 10^9 wraps signed 32-bit int around to negative values. Always declare prefix sum array as long long.",
    "0-Indexed vs 1-Indexed Mismatch: Querying pref[r] - pref[l] instead of pref[r+1] - pref[l] accidentally drops element a[r].",
    "Negative Modulo in Divisibility: In C++, (-5) % 3 is -2, not +1. Always normalize modulo using ((x % k) + k) % k.",
    "Missing Prefix Zero Entry in Subarray Counting: Forgetting to initialize remCount[0] = 1 causes subsegments starting at index 0 to be omitted.",
  ],
  practiceProblems: [
    {
      name: "Static Range Sum Queries (CSES)",
      rating: 1000,
      url: "https://cses.fi/problemset/task/1646",
      platform: "CSES",
      hint: "Direct application of 1D prefix sums with 64-bit integer accumulation.",
    },
    {
      name: "Subarray Divisibility (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1662",
      platform: "CSES",
      hint: "Track remainder frequencies of (pref % N + N) % N. If the same remainder appears C times, it yields C*(C-1)/2 valid subarrays.",
    },
    {
      name: "Breed Counting (USACO Silver)",
      rating: 1200,
      url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=572",
      platform: "USACO",
      hint: "Maintain three independent prefix sum arrays, one for each cow breed ID (1, 2, 3).",
    },
    {
      name: "Forest Queries (CSES 2D)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1658",
      platform: "CSES",
      hint: "Build a 2D prefix sum grid where trees are 1 and empty cells are 0. Query with 4-term inclusion-exclusion.",
    },
  ],
  deepExplanation: {
    intuition:
      "Consider walking along a path where each step has a certain weight. If you keep a running odometer of total weight accumulated from the origin, calculating the weight of any stretch between milestone L and milestone R is simply reading the odometer at R and subtracting the reading at L-1. Prefix sums translate the expensive O(N) repetitive process of summing elements into a single O(1) difference query by trading linear precomputation memory for constant-time evaluation.",
    proofOfCorrectness:
      "Base case: P[0] = 0. For any i >= 1, P[i] = P[i-1] + A[i-1] = sum_{k=0}^{i-1} A[k]. For a query [l, r], P[r+1] - P[l] = sum_{k=0}^{r} A[k] - sum_{k=0}^{l-1} A[k] = sum_{k=l}^{r} A[k]. By mathematical induction, this holds strictly for all 0 <= l <= r < N without edge cases because P[0] = 0 correctly handles l = 0.",
    complexityDerivation:
      "Time: O(N) build time since each element of A is visited exactly once in a single linear pass. O(1) query time because computing P[r+1] - P[l] takes exactly two array lookups and one subtraction. Space: O(N) auxiliary space to store the prefix array of size N + 1.",
    whenNotToUse:
      "Do NOT use prefix sums if the array elements are modified frequently (point updates). Each point update would require updating all subsequent prefix sums in O(N), which degenerates total runtime to O(Q * N). In such dynamic settings, use a Fenwick Tree (Binary Indexed Tree) or Segment Tree which balances updates and queries in O(log N).",
  },
  workedExample: {
    title: "1D Range Sum & 2D Grid Execution",
    scenario: "Array A = [3, -2, 5, 1, -4, 6] with size N = 6",
    input: "A = [3, -2, 5, 1, -4, 6], queries: [1, 3], [0, 4], [2, 5]",
    output: "Query [1, 3] = 4, Query [0, 4] = 3, Query [2, 5] = 8",
    traceSteps: [
      { step: 1, state: "P[0] = 0", action: "Initialize sentinel zero", insight: "Handles queries starting at index 0 seamlessly" },
      { step: 2, state: "P[1] = 0 + 3 = 3", action: "Accumulate A[0]=3", insight: "Sum of prefix [0..0]" },
      { step: 3, state: "P[2] = 3 + (-2) = 1", action: "Accumulate A[1]=-2", insight: "Sum of prefix [0..1]" },
      { step: 4, state: "P[3] = 1 + 5 = 6", action: "Accumulate A[2]=5", insight: "Sum of prefix [0..2]" },
      { step: 5, state: "P[4] = 6 + 1 = 7", action: "Accumulate A[3]=1", insight: "Sum of prefix [0..3]" },
      { step: 6, state: "P[5] = 7 + (-4) = 3", action: "Accumulate A[4]=-4", insight: "Sum of prefix [0..4]" },
      { step: 7, state: "P[6] = 3 + 6 = 9", action: "Accumulate A[5]=6", insight: "Prefix table P = [0, 3, 1, 6, 7, 3, 9]" },
      { step: 8, state: "Query [1, 3]", action: "Compute P[4] - P[1] = 7 - 3 = 4", insight: "Verifies: A[1] + A[2] + A[3] = -2 + 5 + 1 = 4" },
      { step: 9, state: "Query [0, 4]", action: "Compute P[5] - P[0] = 3 - 0 = 3", insight: "Verifies: 3 - 2 + 5 + 1 - 4 = 3" },
      { step: 10, state: "Query [2, 5]", action: "Compute P[6] - P[2] = 9 - 1 = 8", insight: "Verifies: 5 + 1 - 4 + 6 = 8" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Off-by-One 0-Indexed Query Boundary",
      cause: "Writing pref[r] - pref[l] instead of pref[r + 1] - pref[l].",
      fix: "Always use 1-based indexing for the prefix array: pref[r + 1] - pref[l] returns sum of A[l..r].",
      wrongSnippet: "long long sum = pref[r] - pref[l]; // Drops A[r] and misaligns",
      correctedSnippet: "long long sum = pref[r + 1] - pref[l]; // Exact closed interval [l, r]",
    },
    {
      trap: "32-Bit Signed Integer Overflow",
      cause: "Summing 200,000 elements of value up to 10^9 produces 2 * 10^14, which exceeds INT_MAX (2.14 * 10^9).",
      fix: "Declare the prefix array as vector<long long> or in Python use arbitrary precision integers.",
      wrongSnippet: "vector<int> pref(n + 1, 0); // Overflows on large sums",
      correctedSnippet: "vector<long long> pref(n + 1, 0); // Bounded up to ~9 * 10^18",
    },
    {
      trap: "Negative Modulo Remainder in Divisibility Subarrays",
      cause: "In C++ and Java, % is the remainder operator, not true mathematical modulo: (-5) % 3 == -2.",
      fix: "Normalize remainder with ((x % k) + k) % k before indexing into frequency arrays.",
      wrongSnippet: "int rem = pref % k; // Can be negative!",
      correctedSnippet: "int rem = ((pref % k) + k) % k; // Always in [0, k-1]",
    },
  ],
  pythonTemplate: `import sys
from itertools import accumulate

def solve():
    input = sys.stdin.readline
    
    # 1D Prefix Sums
    # Given an array a of length n, answer q range queries [l, r] (0-indexed, inclusive)
    n, q = map(int, input().split())
    a = list(map(int, input().split()))
    
    # itertools.accumulate gives running sums; prepend 0 for 1-based sentinel
    pref = [0] + list(accumulate(a))
    
    out = []
    for _ in range(q):
        l, r = map(int, input().split())
        # Query sum in closed interval [l, r]
        out.append(str(pref[r + 1] - pref[l]))
        
    sys.stdout.write("\\n".join(out) + "\\n")

# 2D Matrix Prefix Sum Class
class PrefixSum2D:
    def __init__(self, mat):
        self.R = len(mat)
        self.C = len(mat[0])
        self.P = [[0] * (self.C + 1) for _ in range(self.R + 1)]
        for r in range(self.R):
            for c in range(self.C):
                self.P[r + 1][c + 1] = (
                    mat[r][c]
                    + self.P[r][c + 1]
                    + self.P[r + 1][c]
                    - self.P[r][c]
                )
                
    def query(self, r1, c1, r2, c2):
        """Query rectangular subgrid from (r1, c1) to (r2, c2) inclusive."""
        return (
            self.P[r2 + 1][c2 + 1]
            - self.P[r1][c2 + 1]
            - self.P[r2 + 1][c1]
            + self.P[r1][c1]
        )
`,
};
