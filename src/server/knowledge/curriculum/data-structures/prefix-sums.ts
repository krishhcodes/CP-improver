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
  conceptualTheory: `### Mathematical Foundation & Mental Model

#### 1. The Core 1D Invariant
Given an array $A$ of size $N$, we define the prefix sum array $P$ of length $N+1$ where:
$$P[0] = 0$$
$$P[i] = \\sum_{k=0}^{i-1} A[k] = P[i-1] + A[i-1] \\quad \\text{for } 1 \\le i \\le N$$

To query the sum of any contiguous subarray $A[l \\dots r]$ (0-indexed, inclusive):
$$\\sum_{k=l}^{r} A[k] = P[r+1] - P[l]$$

**Why 1-indexing $P$ is essential**:
Setting $P[0] = 0$ handles queries starting at $l = 0$ seamlessly without conditional branch checks (e.g. $P[r+1] - P[0] = P[r+1]$).

---

#### 2. The 2D Subgrid Formula (Inclusion-Exclusion Principle)
For a 2D matrix $M$ of size $R \\times C$, define $P[r][c]$ as the sum of all elements in the subgrid from top-left $(0, 0)$ to $(r-1, c-1)$:

\`\`\`
(0,0) ----------- (0, c)
  |                  |
  |     Area A       |  Area B
  |                  |
(r,0) ----------- (r, c)
  |                  |
  |     Area C       |  Cell (r,c)
\`\`\`

**Construction Formula**:
$$P[r][c] = M[r-1][c-1] + P[r-1][c] + P[r][c-1] - P[r-1][c-1]$$

**Query Formula for Subgrid $(r_1, c_1)$ to $(r_2, c_2)$ (inclusive)**:
$$\\text{sum} = P[r_2+1][c_2+1] - P[r_1][c_2+1] - P[r_2+1][c_1] + P[r_1][c_1]$$

---

#### 3. Difference Arrays (The Inverse of Prefix Sums)
When an algorithm requires executing $Q$ offline range updates of the form:
$$\\text{Add } v \\text{ to every element in } [l, r]$$

Instead of updating all elements in $O(R - L + 1)$, define difference array $D[i] = A[i] - A[i-1]$:
1. $D[l] \\leftarrow D[l] + v$
2. $D[r+1] \\leftarrow D[r+1] - v$
3. Compute prefix sums of $D$ at the end in $O(N)$ time to reconstruct final array $A$.`,
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
