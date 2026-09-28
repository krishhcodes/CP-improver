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
};
