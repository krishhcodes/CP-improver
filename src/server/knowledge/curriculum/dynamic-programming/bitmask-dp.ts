import { ConceptNode } from "../concept-node-type";

export const bitmaskDPConcept: ConceptNode = {
  slug: "bitmask-dp",
  name: "Bitmask Dynamic Programming, Submask Iteration & SOS DP",
  category: "Dynamic Programming",
  difficulty: "ADVANCED",
  description:
    "State space compression mapping subsets of elements into integer bit representations. Encompasses O(3^N) submask iteration, TSP, matching, and O(N * 2^N) Sum Over Subsets (SOS DP).",
  timeComplexity: "O(N^2 * 2^N) or O(3^N) or O(N * 2^N)",
  spaceComplexity: "O(2^N)",
  prerequisites: ["knapsack"],
  dependents: ["trie"],
  literatureReferences: [
    {
      source: "USACO Guide (Platinum)",
      section: "DP with Bitmasks & Broken Profile",
      url: "https://usaco.guide/plat/bitmask-dp",
      keyInsight:
        "Bitwise operations allow compact set representations where element membership is tested with (mask >> i) & 1 and updated with mask | (1 << i).",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 10: Bit Manipulation — Submask Iteration & Dynamic Programming (pp. 95-104)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Iterating all submasks of all masks runs in strictly O(3^N) using the bit trick `sub = (sub - 1) & mask`. A naive nested loop takes O(4^N).",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 10: Advanced DP — Sum Over Subsets (SOS DP)",
      keyInsight:
        "SOS DP computes aggregate sums for all submasks of every mask in O(N * 2^N) by treating bit positions as dimensions in an N-dimensional hypercube.",
    },
  ],
  conceptualTheory: `### Subsets as Integers & Bitwise Transitions

#### 1. Fundamental Bitwise Operations for Sets
Given a universe of $N$ elements (indexed $0 \\dots N-1$), a subset $S$ is represented by the integer $\\sum_{i \\in S} 2^i$:
- **Element Membership**: \`(mask >> i) & 1\` (or \`mask & (1 << i)\`)
- **Add Element**: \`mask | (1 << i)\`
- **Remove Element**: \`mask & ~(1 << i)\`
- **Toggle Element**: \`mask ^ (1 << i)\`
- **Set Union**: \`mask1 | mask2\`
- **Set Intersection**: \`mask1 & mask2\`
- **Subset Check**: \`(mask1 & mask2) == mask1\` ($mask1 \\subseteq mask2$)
- **Cardinality**: \`__builtin_popcount(mask)\`

---

#### 2. The $O(3^N)$ Submask Iteration Formula
To iterate over all submasks $s$ of a fixed mask:
\`\`\`cpp
for (int mask = 0; mask < (1 << n); mask++) {
    for (int sub = mask; ; sub = (sub - 1) & mask) {
        // Process submask 'sub'
        if (sub == 0) break;
    }
}
\`\`\`
**Why is this $O(3^N)$?**
By the Binomial Theorem:
$$\\sum_{k=0}^N \\binom{N}{k} 2^k = (1 + 2)^N = 3^N$$
For $N = 15$, $3^{15} \\approx 1.43 \\times 10^7$ operations, easily executing within 0.1s!

---

#### 3. Sum Over Subsets (SOS DP) in $O(N \\cdot 2^N)$
Given an array $A$ of size $2^N$, compute for every mask:
$$F[\\text{mask}] = \\sum_{\\text{sub} \\subseteq \\text{mask}} A[\\text{sub}]$$
Naive submask iteration takes $O(3^N)$.
SOS DP processes bit-by-bit:
\`\`\`cpp
for (int i = 0; i < n; i++) {
    for (int mask = 0; mask < (1 << n); mask++) {
        if (mask & (1 << i)) {
            dp[mask] += dp[mask ^ (1 << i)];
        }
    }
}
\`\`\`
For $N = 20$, $N \\cdot 2^N = 20 \\times 10^6$ operations (instantaneous vs $3^{20} \\approx 3.5 \\times 10^9$ TLE).`,
  variations: [
    {
      title: "Traveling Salesperson Problem (Hamiltonian Path)",
      explanation: "dp[mask][u] = min cost to visit subset 'mask' ending at vertex u. State size O(N * 2^N), transitions O(N).",
      formula: "dp[mask | (1 << v)][v] = min(..., dp[mask][u] + dist[u][v])",
      timeComplexity: "O(N^2 * 2^N)",
      spaceComplexity: "O(N * 2^N)",
    },
    {
      title: "Submask Enumeration DP",
      explanation: "Partition N elements into subsets (e.g. matching or clique partitioning) in O(3^N).",
      formula: "dp[mask] = min_{sub} (dp[mask ^ sub] + cost[sub])",
      timeComplexity: "O(3^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      title: "Sum Over Subsets (SOS DP)",
      explanation: "Prefix sums over hypercube lattice in O(N * 2^N). Computes submask or supermask aggregations.",
      formula: "dp[mask] += dp[mask ^ (1 << i)] when mask & (1 << i)",
      timeComplexity: "O(N * 2^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      title: "Profile / Broken Profile DP",
      explanation: "Tiling an N x M grid with dominoes (N <= 10, M <= 10^5) by passing a profile bitmask of boundary cells.",
      formula: "dp[col][mask]",
      timeComplexity: "O(M * 2^N)",
      spaceComplexity: "O(2^N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "N <= 20 and problem involves subsets, permutations, or visiting every vertex once",
      cue: "Signature constraint for Bitmask Dynamic Programming.",
    },
    {
      triggerConstraint: "Computing pairwise bitwise AND/OR relations across all pairs in an array of size up to 10^6",
      cue: "Sum Over Subsets (SOS DP) in O(N * 2^N) with N = 20-22.",
    },
    {
      triggerConstraint: "Partitioning an array of N <= 16 elements into compatible groups",
      cue: "Submask iteration in O(3^N).",
    },
  ],
  stepByStepStrategy: [
    "1. Verify Constraint Limit: Confirm N <= 20. If N = 22, O(N * 2^N) is possible, but O(N^2 * 2^N) will TLE.",
    "2. Base Case Initialization: For TSP starting at node 0, `dp[1 << 0][0] = 0`; all other states initialized to INF.",
    "3. Topological Mask Order: Iterate mask from 1 to `(1 << N) - 1`. Because transitions only add bits, standard integer iteration is naturally topologically sorted!",
    "4. Bitmask Traversal: Extract current vertex `u` and iterate through all possible next vertices `v` not yet in `mask` (`!(mask & (1 << v))`).",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

const int INF = 1e9;

// 1. Traveling Salesperson Problem (TSP) in O(N^2 * 2^N)
int solveTSP(int n, const vector<vector<int>>& dist) {
    // dp[mask][u]: min cost to visit set 'mask' ending at vertex u
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));

    // Base case: start at vertex 0
    dp[1][0] = 0;

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (dp[mask][u] == INF) continue;

            for (int v = 0; v < n; v++) {
                if (!(mask & (1 << v))) {
                    int next_mask = mask | (1 << v);
                    dp[next_mask][v] = min(dp[next_mask][v], dp[mask][u] + dist[u][v]);
                }
            }
        }
    }

    int full_mask = (1 << n) - 1;
    int min_total_cost = INF;
    for (int u = 0; u < n; u++) {
        min_total_cost = min(min_total_cost, dp[full_mask][u] + dist[u][0]);
    }
    return min_total_cost;
}

// 2. Sum Over Subsets (SOS DP) in O(N * 2^N)
vector<long long> computeSOS(int n, const vector<long long>& a) {
    vector<long long> dp = a;
    for (int i = 0; i < n; i++) {
        for (int mask = 0; mask < (1 << n); mask++) {
            if (mask & (1 << i)) {
                dp[mask] += dp[mask ^ (1 << i)];
            }
        }
    }
    return dp;
}`,
  pitfalls: [
    "Bitwise Operator Precedence: In C++, `+` and `==` have higher precedence than `<<`, `&`, `^`, `|`. Writing `mask & 1 << i == 0` evaluates as `mask & (1 << (i == 0))`. Always parenthesize bitwise operations: `(mask & (1 << i)) != 0`.",
    "32-Bit Shift Overflow: Writing `1 << i` when i >= 31 is undefined behavior and produces 0. Use `1LL << i` for 64-bit masks.",
    "TLE on N > 20: An O(N^2 * 2^N) algorithm on N = 24 takes 24^2 * 16.7M ≈ 9.6 * 10^9 operations, resulting in guaranteed TLE.",
  ],
  practiceProblems: [
    {
      name: "Hamiltonian Flights (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1691",
      platform: "CSES",
      hint: "Count number of Hamiltonian paths from node 1 to node N visiting every node once in O(M * 2^N).",
    },
    {
      name: "Matching (AtCoder Educational DP)",
      rating: 1500,
      url: "https://atcoder.jp/contests/dp/tasks/dp_o",
      platform: "AtCoder",
      hint: "dp[mask] = number of matchings between first popcount(mask) men and subset mask of women.",
    },
    {
      name: "Elevator Rides (CSES)",
      rating: 1700,
      url: "https://cses.fi/problemset/task/1653",
      platform: "CSES",
      hint: "dp[mask] = pair(rides_needed, current_ride_weight). Transitions greedily minimize ride count then weight.",
    },
    {
      name: "Special Pairs (Codeforces)",
      rating: 1900,
      url: "https://codeforces.com/problemset/problem/165/E",
      platform: "Codeforces",
      hint: "SOS DP: Find an element that is a submask of ~a[i] in O(N * 2^N).",
    },
  ],
  deepExplanation: {
    intuition:
      "When a problem involves tracking which subset of N items has been selected or visited, brute-force permutation checking requires O(N!), which becomes infeasible beyond N = 10. By compressing the subset of selected items into an integer bitmask where the i-th bit is 1 if item i is chosen and 0 otherwise, we map exponential subsets {0, 1}^N into contiguous integers [0, 2^N - 1]. Dynamic programming then computes optimal values over subsets in O(N^2 * 2^N) or O(N * 2^N), scaling comfortably up to N = 20-22.",
    proofOfCorrectness:
      "Theorem (Topological Invariance of Numerical Mask Traversal): Any valid transition in a subset expansion DP adds an unvisited element v to the current subset: next_mask = mask | (1 << v). Because (1 << v) > 0 and bitwise OR strictly sets a previously unset bit, next_mask > mask numerically and popcount(next_mask) = popcount(mask) + 1. Therefore, iterating mask as a standard integer from 1 to (1 << N) - 1 guarantees that every possible predecessor state mask' with popcount < popcount(mask) has already been computed and finalized. No cycle can exist in the state DAG, ensuring strict correctness without memoized DFS recursion.",
    complexityDerivation:
      "TSP Time: (2^N states) * (N ending vertices) * (N candidate transitions) = O(N^2 * 2^N). For N = 19, 19^2 * 524,288 ≈ 1.8 * 10^8 operations, executing in ~400ms in C++. SOS DP Time: Exactly N * 2^N operations by decomposing the multidimensional hypercube coordinate by coordinate. Submask Enumeration Time: sum_{k=0}^N (N choose k) * 2^k = (1 + 2)^N = 3^N via the Binomial Theorem. Space: O(N * 2^N) or O(2^N) integers.",
    whenNotToUse:
      "Do NOT use Bitmask DP if N > 22, as 2^23 = 8.3 * 10^6 states and 2^25 = 3.3 * 10^7 states cause immediate TLE or MLE. If the problem asks for bipartite matching or flow with N >= 100, use Hopcroft-Karp or Dinic's Algorithm (polynomial time). If N <= 40, consider Meet-in-the-Middle in O(2^(N/2)).",
  },
  workedExample: {
    title: "TSP on 3 Cities (N = 3) Trace",
    scenario: "Cities {0, 1, 2}. Start at 0, visit all cities, return to 0. Distances: d(0,1)=2, d(0,2)=9, d(1,2)=4, d(1,0)=1, d(2,0)=3, d(2,1)=7.",
    input: "N = 3. Masks 1..7. dp[mask][u] = min cost to visit mask ending at u.",
    output: "Minimum TSP tour = 0 -> 1 -> 2 -> 0 with cost 2 + 4 + 3 = 9.",
    traceSteps: [
      { step: 1, state: "Base Case", action: "dp[1][0] = 0 (mask 001_2 = {0}, end at 0). All others INF.", insight: "Starting city locked at 0" },
      { step: 2, state: "Expand from mask 1 ({0})", action: "To city 1: dp[3][1] = dp[1][0] + d(0,1) = 0 + 2 = 2. To city 2: dp[5][2] = dp[1][0] + d(0,2) = 0 + 9 = 9.", insight: "mask 3 is {0, 1}, mask 5 is {0, 2}" },
      { step: 3, state: "Process mask 3 ({0, 1}, end at 1)", action: "Unvisited city 2: dp[7][2] = min(INF, dp[3][1] + d(1,2)) = 2 + 4 = 6.", insight: "mask 7 is {0, 1, 2}" },
      { step: 4, state: "Process mask 5 ({0, 2}, end at 2)", action: "Unvisited city 1: dp[7][1] = min(INF, dp[5][2] + d(2,1)) = 9 + 7 = 16.", insight: "Alternative route 0 -> 2 -> 1" },
      { step: 5, state: "Close Tour back to 0 from full mask 7 ({0, 1, 2})", action: "From end 2: dp[7][2] + d(2,0) = 6 + 3 = 9. From end 1: dp[7][1] + d(1,0) = 16 + 1 = 17. Min = 9.", insight: "Optimal tour: 0 -> 1 -> 2 -> 0 has total cost 9!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Bitwise Precedence Operator Hazard",
      cause: "In C++, equality `==` and relational operators bind tighter than bitwise `&`, `^`, `|`. `mask & 1 << i == 0` parses as `mask & (1 << (i == 0))`.",
      fix: "ALWAYS surround bitwise tests with parentheses: `((mask >> i) & 1)` or `(mask & (1 << i)) != 0`.",
      wrongSnippet: "if (mask & (1 << v) == 0) // Bugs logic completely!",
      correctedSnippet: "if (!(mask & (1 << v))) // Safe and unambiguous",
    },
    {
      trap: "32-Bit Bit Shift Overflow (1 << 31)",
      cause: "Writing `1 << n` when n = 31 or 32 produces undefined behavior and wraps to negative or zero in signed 32-bit int.",
      fix: "For N >= 31, always write `1LL << n`.",
      wrongSnippet: "for (int mask = 0; mask < (1 << n); mask++) // Undefined behavior if n >= 31",
      correctedSnippet: "for (long long mask = 0; mask < (1LL << n); mask++) // 64-bit safe",
    },
    {
      trap: "Naive Submask Iteration in O(4^N)",
      cause: "Iterating all pairs `for mask1: for mask2: if (mask1 & mask2 == mask1)` runs in 2^N * 2^N = 4^N.",
      fix: "Use submask decrement trick: `for (int sub = mask; sub > 0; sub = (sub - 1) & mask)` running in strict O(3^N).",
      wrongSnippet: "for (int m = 0; m < (1<<n); m++) for (int sub = 0; sub < (1<<n); sub++) if ((sub & m) == sub) ...",
      correctedSnippet: "for (int m = 0; m < (1<<n); m++) for (int sub = m; sub > 0; sub = (sub - 1) & m) ...",
    },
  ],
  pythonTemplate: `import sys

def solve_tsp():
    """Traveling Salesperson Problem in O(N^2 * 2^N) with bitmask DP."""
    input = sys.stdin.readline
    n = int(input())
    dist = [list(map(int, input().split())) for _ in range(n)]

    INF = float('inf')
    # dp[mask][u]: min cost to visit subset mask ending at city u
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # Base case: city 0 visited, cost 0

    for mask in range(1, 1 << n):
        for u in range(n):
            if dp[mask][u] == INF:
                continue

            for v in range(n):
                # If city v is not yet visited in mask
                if not (mask & (1 << v)):
                    next_mask = mask | (1 << v)
                    cost = dp[mask][u] + dist[u][v]
                    if cost < dp[next_mask][v]:
                        dp[next_mask][v] = cost

    full_mask = (1 << n) - 1
    # Close tour by returning to starting city 0
    ans = min(dp[full_mask][u] + dist[u][0] for u in range(n))
    print(ans)

def solve_sos_dp(n: int, a: list) -> list:
    """Sum Over Subsets (SOS DP): dp[mask] = sum(a[sub] for all sub in mask) in O(N * 2^N)."""
    dp = list(a)
    for i in range(n):
        bit = 1 << i
        for mask in range(1 << n):
            if mask & bit:
                dp[mask] += dp[mask ^ bit]
    return dp

if __name__ == '__main__':
    solve_tsp()
`,
};
