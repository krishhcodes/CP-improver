import { ConceptNode } from "../concept-node-type";

export const bitmaskDPConcept: ConceptNode = {
  slug: "bitmask-dp",
  name: "Bitmask Dynamic Programming, Submask Iteration & SOS DP",
  category: "Dynamic Programming",
  difficulty: "ADVANCED",
  description:
    "State space compression mapping subsets of elements into integer bit representations. Encompasses O(3^N) submask iteration, TSP, matching, and O(N * 2^N) Sum Over Subsets (SOS DP). One of the most powerful techniques for problems with small N (≤ 20).",
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
        "Bitwise operations allow compact set representations where element membership is tested with (mask >> i) & 1 and updated with mask | (1 << i). The state space is 2^N which is feasible for N ≤ 20.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 10: Bit Manipulation — Submask Iteration & Dynamic Programming (pp. 95-104)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Iterating all submasks of all masks runs in strictly O(3^N) using the bit trick `sub = (sub - 1) & mask`. A naive nested loop takes O(4^N). The difference is critical: 3^20 ≈ 3.5×10^9 vs 4^20 ≈ 10^12.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 10: Advanced DP — Sum Over Subsets (SOS DP)",
      keyInsight:
        "SOS DP computes aggregate sums for all submasks of every mask in O(N * 2^N) by treating bit positions as dimensions in an N-dimensional hypercube. This is the same idea as prefix sums but in N dimensions simultaneously.",
    },
  ],
  conceptualTheory: `## Bitmask DP, Submask Iteration & SOS DP: A Complete Textbook Chapter

### What Is Bitmask DP?

Bitmask DP is a DP technique where the **STATE** encodes a **SET** of elements as an integer (bitmask). Bit i = 1 means element i is IN the set. Bit i = 0 means element i is NOT in the set.

This lets us:
- Represent any subset of N elements as an integer in [0, 2^N - 1].
- Perform set operations (union, intersection, membership) in O(1) with bitwise operators.
- Build a DP table over ALL 2^N subsets.

**When to use**: N ≤ 20 (sometimes up to 22 with O(N × 2^N) algorithms). The telltale sign is: "N ≤ 20 cities" or "N ≤ 15 elements" or "N ≤ 20, find minimum/maximum over all subsets."

---

### Fundamental Bitwise Operations (Set Algebra in O(1))

Given N elements indexed 0..N-1, subset S is stored as integer mask = sum of 2^i for each i in S:

| Operation | Code | Notes |
|-----------|------|-------|
| Is element i in S? | \`(mask >> i) & 1\` or \`mask & (1 << i)\` | Returns 0 or nonzero |
| Add element i | \`mask \| (1 << i)\` | Sets bit i |
| Remove element i | \`mask & ~(1 << i)\` | Clears bit i |
| Toggle element i | \`mask ^ (1 << i)\` | Flips bit i |
| Union S1 ∪ S2 | \`mask1 \| mask2\` | |
| Intersection S1 ∩ S2 | \`mask1 & mask2\` | |
| Is S1 ⊆ S2? | \`(mask1 & mask2) == mask1\` | |
| Complement | \`((1<<N)-1) ^ mask\` | Flip all N bits |
| Cardinality \|S\| | \`__builtin_popcount(mask)\` | Count set bits |
| Lowest set bit | \`mask & (-mask)\` | Isolate rightmost 1 |
| Remove lowest bit | \`mask & (mask - 1)\` | Clear rightmost 1 |

All O(1) — as fast as arithmetic!

---

### Application 1: Traveling Salesperson Problem (TSP) — O(N² × 2^N)

**Problem**: N cities. dist[i][j] = distance from city i to city j. Find the shortest Hamiltonian cycle (visit ALL cities exactly once, return to start).

**Naïve**: Try all N! permutations = 20! ≈ 2.4×10^18. Completely infeasible.

**Bitmask DP State**: dp[mask][u] = minimum cost to visit exactly the set of cities in \`mask\`, currently at city u.

- \`mask\` = bitmask of visited cities (bit i = 1 if city i was visited).
- \`u\` = last city visited.

**Base case**: dp[1 << 0][0] = 0 (at city 0, only city 0 visited, zero cost).

**Transition**: For each city v NOT in mask:
\`\`\`
dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v], dp[mask][u] + dist[u][v])
\`\`\`

**Answer**: min over all cities u of dp[(1<<N)-1][u] + dist[u][0] (close the tour).

**Time**: O(N² × 2^N). For N=20: 400 × 10^6 — tight but feasible in C++.
**Space**: O(N × 2^N). For N=20: 20 × 10^6 integers ≈ 80 MB.

**Why does this work?** The Markov property: dp[mask][u] captures everything needed for future decisions — which cities are unvisited AND where we are now. Given this, future choices are independent of HOW we got to state (mask, u).

**Correctness**: We iterate mask from smallest to largest (numerically). Since transitions only ADD bits (mask → mask | (1<<v) > mask), all predecessor states are already computed.

---

### Application 2: Submask Enumeration DP — O(3^N)

**Problem**: Partition N elements into groups. Each group's contribution depends on its bitmask. Minimize total contribution.

**DP State**: dp[mask] = minimum cost to cover all elements in \`mask\`.

**Transition**: Try every possible non-empty first group \`sub\` ⊆ \`mask\`:
\`\`\`
dp[mask] = min over non-empty sub ⊆ mask: dp[mask ^ sub] + cost[sub]
\`\`\`

**Key trick — efficient submask iteration (O(3^N) total)**:
\`\`\`
for mask = 0 to 2^N - 1:
    for sub = mask; sub > 0; sub = (sub-1) & mask:
        // process sub as a submask of mask
\`\`\`

**How \`(sub-1) & mask\` works**: Subtracting 1 from sub flips its lowest set bit to 0 and sets all lower bits to 1. AND-ing with mask then retains only bits that were in mask, producing the "next smaller submask." This enumerates all 2^popcount(mask) submasks of mask in decreasing order.

**Why O(3^N)?** Each of N elements is in one of 3 states: (1) not in mask, (2) in mask but not in sub, (3) in both mask and sub. By the Binomial Theorem: ∑_{k=0}^{N} C(N,k) × 2^k = 3^N.

For N=15: 3^15 ≈ 14 million — very fast. For N=20: 3^20 ≈ 3.5 billion — too slow. Use SOS DP for N=20.

---

### Application 3: Sum Over Subsets (SOS DP) — O(N × 2^N)

**Problem**: Given array A[0..2^N-1], compute for EVERY mask:
F[mask] = sum of A[sub] for all sub ⊆ mask.

**Naïve submask iteration**: O(3^N). Too slow for N=20.
**SOS DP**: O(N × 2^N). For N=20: 20 × 10^6 operations. Fast!

**Algorithm**:
\`\`\`
Initialize: dp[mask] = A[mask] for all mask
for i = 0 to N-1:  // Process dimension by dimension
    for mask = 0 to 2^N - 1:
        if (mask >> i) & 1:  // mask has bit i set
            dp[mask] += dp[mask ^ (1 << i)]
\`\`\`

**Intuition**: Treat the 2^N array as an N-dimensional hypercube where each axis corresponds to one bit. SOS DP is N-dimensional prefix sums: after dimension i, dp[mask] = sum of A[sub] for all sub ⊆ mask that agree with mask on dimensions 0..i. After all N dimensions: full submask sum.

**SOS DP for Supermasks** (sum over all sup ⊇ mask):
\`\`\`
for i = 0 to N-1:
    for mask = 0 to 2^N-1:
        if NOT ((mask >> i) & 1):  // bit i is 0 in mask
            dp[mask] += dp[mask | (1 << i)]
\`\`\`

**Applications**: AND/OR convolution, counting pairs with bitwise property, frequency aggregation.

---

### Application 4: Assignment/Matching DP

**Problem**: Assign N tasks to N workers. cost[i][j] = cost of worker i doing task j. Minimize total (each task done exactly once, each worker does one task).

**State**: dp[mask] = minimum cost to assign tasks in \`mask\` to the first popcount(mask) workers.

**Let k = popcount(mask) - 1** = current worker index (0-indexed). For each task j in mask:
\`\`\`
dp[mask] = min over j in mask: dp[mask ^ (1<<j)] + cost[k][j]
\`\`\`

**Time**: O(N × 2^N).

---

### Profile/Broken Profile DP

Used for tiling problems (N×M grid with N≤10):
- State: \`dp[col][profile]\` where profile = bitmask of which cells in the current column are already filled.
- Transition: Try all ways to place dominoes starting from the boundary.
- **Time**: O(M × 2^N). For M=10^5, N=10: 10^5 × 1024 = 10^8 — manageable.`,

  variations: [
    {
      title: "Traveling Salesperson Problem (Hamiltonian Path)",
      explanation: "dp[mask][u] = min cost to visit subset 'mask' ending at vertex u. Transitions: for each unvisited vertex v, extend tour. State size O(N * 2^N), transitions O(N). Close tour by returning to start.",
      formula: "dp[mask | (1 << v)][v] = min(..., dp[mask][u] + dist[u][v])",
      timeComplexity: "O(N^2 * 2^N)",
      spaceComplexity: "O(N * 2^N)",
    },
    {
      title: "Submask Enumeration DP",
      explanation: "Partition N elements into groups with bitmask-dependent costs. For each mask, iterate all submasks using (sub-1)&mask trick. O(3^N) total by Binomial Theorem argument.",
      formula: "dp[mask] = min_{sub} (dp[mask ^ sub] + cost[sub])",
      timeComplexity: "O(3^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      title: "Sum Over Subsets (SOS DP)",
      explanation: "N-dimensional prefix sums over the subset lattice. Process one bit dimension at a time. After all N passes, dp[mask] = sum of A[sub] for all sub ⊆ mask.",
      formula: "dp[mask] += dp[mask ^ (1 << i)] when mask & (1 << i)",
      timeComplexity: "O(N * 2^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      title: "Assignment Problem (Task-to-Worker Matching)",
      explanation: "dp[mask] = min cost to assign tasks in mask to the first popcount(mask) workers. Key: the current worker index is implicit = popcount(mask) - 1.",
      formula: "dp[mask] = min over j in mask: dp[mask^(1<<j)] + cost[popcount(mask)-1][j]",
      timeComplexity: "O(N * 2^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      title: "Profile/Broken Profile DP (Grid Tiling)",
      explanation: "Tile N×M grid with dominoes. State = (column, boundary profile bitmask). Process column by column. N is small (≤10), M can be large.",
      formula: "dp[col][profile]",
      timeComplexity: "O(M * 2^N)",
      spaceComplexity: "O(2^N)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "N ≤ 20 and problem involves visiting all nodes, subsets, or permutations",
      cue: "Classic Bitmask DP signature. State = (visited set as bitmask, current position). O(N^2 * 2^N).",
    },
    {
      triggerConstraint: "For each pair (i,j), compute something depending on bitwise AND/OR of A[i] and A[j]",
      cue: "Sum Over Subsets (SOS DP). Precompute frequency over all supermasks or submasks in O(N * 2^N).",
    },
    {
      triggerConstraint: "Partition N ≤ 15 elements into groups; minimize some group-dependent cost",
      cue: "Submask enumeration DP. dp[mask] = min cost; try all submasks of mask as first group. O(3^N).",
    },
    {
      triggerConstraint: "Assign N ≤ 20 tasks to N workers, minimize total cost",
      cue: "Assignment DP: dp[mask] = min cost when first popcount(mask) workers have tasks in mask. O(N * 2^N).",
    },
    {
      triggerConstraint: "Tile an N×M grid where N ≤ 10 and M can be very large",
      cue: "Broken profile / Profile DP: state = column × boundary bitmask. O(M * 2^N).",
    },
  ],

  stepByStepStrategy: [
    "1. Verify N ≤ 20 (for N^2*2^N) or N ≤ 22 (for N*2^N). For larger N, bitmask DP will TLE.",
    "2. Define state: dp[mask][u] where mask = visited/selected set, u = current element. Initialize all to INF.",
    "3. Base case: dp[(1 << start)][start] = 0 for TSP. dp[1 << j][0] = cost[0][j] for assignment.",
    "4. Iterate mask from 0 to (1<<N)-1 in ORDER (important: transitions only increase mask value).",
    "5. For each (mask, u), iterate over all unvisited vertices v (those with !(mask & (1<<v))) and update dp[mask|(1<<v)][v].",
    "6. Extract answer from dp[(1<<N)-1][*] after all masks processed.",
    "7. For SOS DP: iterate N bit dimensions as outer loop, 2^N masks as inner loop. O(N*2^N).",
    "8. Use 1LL<<i for masks with N > 30 to avoid 32-bit overflow.",
  ],

  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>
#include <climits>

using namespace std;

const int INF = 1e9;

// =========================================================
// 1. Traveling Salesperson Problem (TSP) - O(N^2 * 2^N)
// =========================================================
int solveTSP(int n, const vector<vector<int>>& dist) {
    // dp[mask][u]: min cost to visit cities in mask, ending at u
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    dp[1][0] = 0; // Start at city 0

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (dp[mask][u] == INF) continue;
            if (!(mask & (1 << u))) continue; // u must be in mask

            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue; // v already visited
                int next = mask | (1 << v);
                dp[next][v] = min(dp[next][v], dp[mask][u] + dist[u][v]);
            }
        }
    }

    int full = (1 << n) - 1;
    int ans = INF;
    for (int u = 0; u < n; u++)
        ans = min(ans, dp[full][u] + dist[u][0]); // Return to start
    return ans;
}

// =========================================================
// 2. Sum Over Subsets (SOS DP) - O(N * 2^N)
// =========================================================
vector<long long> computeSOS(int n, const vector<long long>& a) {
    vector<long long> dp = a;
    for (int i = 0; i < n; i++) {
        for (int mask = 0; mask < (1 << n); mask++) {
            if (mask & (1 << i)) { // mask has bit i set
                dp[mask] += dp[mask ^ (1 << i)]; // Add contribution from submask (mask without bit i)
            }
        }
    }
    return dp; // dp[mask] = sum of a[sub] for all sub ⊆ mask
}

// =========================================================
// 3. Submask Enumeration DP - O(3^N)
// =========================================================
int partitionMinCost(int n, const vector<int>& cost) {
    // cost[mask] = cost of handling exactly the elements in mask as one group
    vector<int> dp(1 << n, INF);
    dp[0] = 0;

    for (int mask = 1; mask < (1 << n); mask++) {
        // Try all non-empty submasks of mask as the first group
        for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
            if (dp[mask ^ sub] != INF)
                dp[mask] = min(dp[mask], dp[mask ^ sub] + cost[sub]);
        }
    }

    return dp[(1 << n) - 1];
}

// =========================================================
// 4. Assignment DP - O(N * 2^N)
// =========================================================
int assignmentDP(int n, const vector<vector<int>>& cost) {
    // dp[mask] = min cost when first popcount(mask) workers do tasks in mask
    vector<int> dp(1 << n, INF);
    dp[0] = 0;

    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == INF) continue;
        int worker = __builtin_popcount(mask); // Next worker to assign
        if (worker >= n) continue;

        for (int task = 0; task < n; task++) {
            if (mask & (1 << task)) continue; // Task already assigned
            int next = mask | (1 << task);
            dp[next] = min(dp[next], dp[mask] + cost[worker][task]);
        }
    }

    return dp[(1 << n) - 1];
}`,

  pitfalls: [
    "Bitwise Operator Precedence: In C++, `+` and `==` have HIGHER precedence than `<<`, `&`, `^`, `|`. Writing `mask & 1 << i == 0` evaluates as `mask & (1 << (i == 0))`. ALWAYS parenthesize: `!(mask & (1 << i))`.",
    "32-Bit Shift Overflow: `1 << i` for i ≥ 31 is undefined behavior and wraps to 0. Use `1LL << i` for N > 30.",
    "TLE on N > 20: O(N^2 * 2^N) for N=24 gives 24² * 16.7M ≈ 9.6 * 10^9 operations. Guaranteed TLE. Check N constraint before choosing bitmask DP.",
    "u Must Be in Mask: In TSP, always verify `mask & (1 << u)` before expanding from dp[mask][u]. Otherwise you process invalid states.",
    "Missing Empty Submask in Submask Iteration: The loop `for (sub=mask; sub>0; sub=(sub-1)&mask)` misses sub=0. If you need sub=0, add a special case outside the loop.",
    "Assignment DP Worker Index Bug: The current worker index in assignment DP is popcount(mask) BEFORE adding the task, not after. Compute `worker = __builtin_popcount(mask)` before the inner loop.",
  ],

  practiceProblems: [
    {
      name: "Hamiltonian Flights (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1691",
      platform: "CSES",
      hint: "Count Hamiltonian paths from node 1 to node N. dp[mask][u] = count of paths visiting exactly 'mask', ending at u. O(M * 2^N).",
    },
    {
      name: "Matching (AtCoder Educational DP)",
      rating: 1500,
      url: "https://atcoder.jp/contests/dp/tasks/dp_o",
      platform: "AtCoder",
      hint: "dp[mask] = number of matchings where mask = set of women already matched. Current man = popcount(mask).",
    },
    {
      name: "Elevator Rides (CSES)",
      rating: 1700,
      url: "https://cses.fi/problemset/task/1653",
      platform: "CSES",
      hint: "dp[mask] = pair (rides_needed, current_ride_weight). Transitions minimize rides first, then weight.",
    },
    {
      name: "Special Pairs (CF 165E)",
      rating: 1900,
      url: "https://codeforces.com/problemset/problem/165/E",
      platform: "Codeforces",
      hint: "SOS DP: for each element, find how many others are submasks of its complement. Build frequency array then apply SOS.",
    },
    {
      name: "Covering Points (CSES)",
      rating: 1800,
      url: "https://cses.fi/problemset/task/2429",
      platform: "CSES",
      hint: "dp[mask] = can we cover exactly the points in mask? Submask DP over circle placements.",
    },
  ],

  deepExplanation: {
    intuition:
      `When a problem involves tracking WHICH SUBSET of N items has been selected or visited, brute-force permutation checking requires O(N!), which becomes infeasible beyond N=10. The key insight is: the IDENTITY of past choices (which subset was picked) matters, but the ORDER usually doesn't.

By compressing the subset of selected items into an integer bitmask, we map 2^N exponential subsets into contiguous integers [0, 2^N-1]. This is exactly the bijection between subsets and binary strings of length N. Dynamic programming over these bitmask states computes optimal values in O(N² × 2^N) or O(N × 2^N).

The SOS DP is even more elegant: it's N-dimensional prefix sums. Just as 1D prefix sums compute cumulative sums in O(N), SOS DP computes cumulative sums over the subset lattice in O(N × 2^N). The lattice has exactly 3^N "inclusion" relationships between pairs (mask, sub), and SOS DP computes ALL of them by processing one dimension at a time — the same "sweep" idea used in 2D/3D prefix sums.`,

    proofOfCorrectness:
      `**Theorem (TSP Bitmask DP Correctness)**: dp[mask][u] correctly represents the minimum cost Hamiltonian path visiting exactly the cities in mask, ending at city u.

**Base**: dp[{0}][0] = 0. The path visiting only city 0 and ending there has zero cost. ✓

**Inductive Step**: Suppose dp[mask'][u'] is correct for all mask' with fewer bits set than mask. For dp[mask][u]: the last step was from some city v to u. The previous state was dp[mask ^ (1<<u)][v] = minimum cost to visit mask minus u, ending at v. Adding dist[v][u] gives the total cost of visiting mask ending at u. We take the minimum over all valid v. By inductive hypothesis, dp[mask^(1<<u)][v] is correct. ✓

**Topological Order**: Numerical iteration mask = 0..2^N-1 is a valid topological order of the DAG, since mask | (1<<v) > mask always. Predecessor states are always processed before successors. ✓

**SOS DP Correctness**: After processing dimension i, dp[mask] = sum of A[sub] for all sub ⊆ mask that agree with mask on ALL dimensions processed so far. The induction over dimensions 0..N-1 gives dp[mask] = full submask sum after all N dimensions. ✓`,

    complexityDerivation:
      `**TSP Time**: 2^N states × N ending cities × N transitions = O(N² × 2^N).
- N=15: 225 × 32768 ≈ 7.4 million ops → < 1ms.
- N=20: 400 × 1.05M ≈ 420 million ops → ~1-2s in C++.
- N=25: 625 × 33.5M ≈ 21 billion → definite TLE.

**SOS DP Time**: Exactly N × 2^N iterations.
- N=20: 20 × 1.05M ≈ 21 million ops → < 50ms.
- N=25: 25 × 33.5M ≈ 838 million ops → possible but tight.

**Submask Enumeration Time**: ∑_{k=0}^N C(N,k) × 2^k = (1+2)^N = 3^N.
- N=15: 3^15 ≈ 14 million → fast.
- N=20: 3^20 ≈ 3.5 billion → TLE. Use SOS DP instead.

**Space**: O(N × 2^N) for TSP (N bits × N endpoint choices). For N=20: 20 × 10^6 × 4 bytes = 80 MB.`,

    whenNotToUse:
      `**Do NOT use Bitmask DP when**:
1. **N > 22**: 2^23 = 8.4M states × N transitions quickly exceeds time/memory limits.
2. **N > 40 but ≤ 60**: Use Meet-in-the-Middle (O(2^(N/2) × something)). Split N elements into two halves of N/2 each.
3. **N > 20 and you need TSP**: No known polynomial algorithm; resort to approximation algorithms (2-approximation, LKH heuristic).
4. **Problem is bipartite matching with large N**: Hopcroft-Karp runs in O(E√V), much faster than bitmask DP.
5. **Problem involves counting paths in a DAG**: Standard DP on the DAG topology without bitmask is often O(V+E).`,
  },

  workedExample: {
    title: "TSP on 3 Cities — Complete Bitmask DP Trace",
    scenario: "Cities {0,1,2}. Start at 0, visit all, return to 0. Distances: d(0,1)=2, d(0,2)=9, d(1,2)=4, d(1,0)=1, d(2,0)=3, d(2,1)=7.",
    input: "N=3. Masks: 001=1, 010=2, 011=3, 100=4, 101=5, 110=6, 111=7. dp[mask][u] initialized to INF, dp[1][0]=0.",
    output: "Min TSP tour = 0→1→2→0, cost = 2+4+3 = 9.",
    traceSteps: [
      {
        step: 1,
        state: "Base Case",
        action: "dp[1][0] = 0. (mask=001₂={city 0}, at city 0, cost 0). All other states = INF.",
        insight: "TSP always starts at city 0."
      },
      {
        step: 2,
        state: "Expand mask=1 (visited: {0}, at 0)",
        action: "City 1 unvisited: dp[3][1] = dp[1][0] + d(0,1) = 0+2 = 2. City 2 unvisited: dp[5][2] = dp[1][0] + d(0,2) = 0+9 = 9.",
        insight: "mask 3 = 011₂ = {0,1}. mask 5 = 101₂ = {0,2}."
      },
      {
        step: 3,
        state: "Expand mask=3 (visited: {0,1}, at 1)",
        action: "City 2 unvisited: dp[7][2] = min(INF, dp[3][1] + d(1,2)) = 2+4 = 6.",
        insight: "mask 7 = 111₂ = {0,1,2}. All cities visited!"
      },
      {
        step: 4,
        state: "Expand mask=5 (visited: {0,2}, at 2)",
        action: "City 1 unvisited: dp[7][1] = min(INF, dp[5][2] + d(2,1)) = 9+7 = 16.",
        insight: "Alternative path 0→2→1 costs 16 so far."
      },
      {
        step: 5,
        state: "Close tours from full mask=7",
        action: "From city 2: dp[7][2] + d(2,0) = 6+3 = 9. From city 1: dp[7][1] + d(1,0) = 16+1 = 17. Answer = min(9, 17) = 9.",
        insight: "Optimal tour: 0→1→2→0 with total cost 9."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Bitwise Precedence Operator Hazard",
      cause: "In C++, equality == and relational operators bind TIGHTER than bitwise &, ^, |. `mask & 1 << i == 0` parses as `mask & (1 << (i == 0))`, which is almost always wrong.",
      fix: "ALWAYS surround bitwise tests with parentheses: `!(mask & (1 << i))` or `((mask >> i) & 1) == 0`.",
      wrongSnippet: "if (mask & (1 << v) == 0) ... // Bug: evaluates as mask & (1 << (v==0))",
      correctedSnippet: "if (!(mask & (1 << v))) ... // Correct: checks if bit v is not set",
    },
    {
      trap: "32-Bit Bit Shift Overflow (1 << 31)",
      cause: "Writing `1 << n` when n = 31 or 32 is undefined behavior in C++ (signed 32-bit int overflow), producing 0 or negative values.",
      fix: "For N ≥ 31, write `1LL << n` to use 64-bit integer shift.",
      wrongSnippet: "for (int mask = 0; mask < (1 << n); mask++) // Undefined behavior if n >= 31!",
      correctedSnippet: "for (long long mask = 0; mask < (1LL << n); mask++) // 64-bit safe",
    },
    {
      trap: "Naive Submask Iteration in O(4^N)",
      cause: "Iterating all pairs: `for (mask) for (sub) if (sub & mask == sub)` — this is O(2^N × 2^N) = O(4^N). For N=20: 10^12 operations = TLE.",
      fix: "Use submask decrement trick: `for (sub = mask; sub > 0; sub = (sub-1) & mask)` — only O(3^N) total.",
      wrongSnippet: "for (int m = 0; m<(1<<n); m++) for (int s = 0; s<(1<<n); s++) if ((s&m)==s) ... // O(4^N)!",
      correctedSnippet: "for (int m = 0; m<(1<<n); m++) for (int s = m; s>0; s = (s-1)&m) ... // O(3^N)",
    },
  ],

  pythonTemplate: `import sys

def solve_tsp():
    """Traveling Salesperson Problem in O(N^2 * 2^N) with bitmask DP."""
    data = sys.stdin.buffer.read().split()
    idx = 0
    n = int(data[idx]); idx += 1
    dist = []
    for i in range(n):
        row = [int(data[idx+j]) for j in range(n)]
        idx += n
        dist.append(row)

    INF = float('inf')
    # dp[mask][u]: min cost to visit subset mask ending at city u
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # Base case: city 0 visited, cost 0

    for mask in range(1, 1 << n):
        for u in range(n):
            if dp[mask][u] == INF:
                continue
            if not (mask & (1 << u)):  # u must be in mask
                continue
            for v in range(n):
                if mask & (1 << v):  # v already visited
                    continue
                next_mask = mask | (1 << v)
                new_cost = dp[mask][u] + dist[u][v]
                if new_cost < dp[next_mask][v]:
                    dp[next_mask][v] = new_cost

    full = (1 << n) - 1
    ans = min(dp[full][u] + dist[u][0] for u in range(n))
    print(ans)


def solve_sos_dp(n: int, a: list) -> list:
    """
    Sum Over Subsets (SOS DP):
    dp[mask] = sum(a[sub] for all sub ⊆ mask)
    O(N * 2^N) time, O(2^N) space.
    """
    dp = list(a)
    for i in range(n):
        bit = 1 << i
        for mask in range(1 << n):
            if mask & bit:  # mask has bit i set
                dp[mask] += dp[mask ^ bit]  # Add submask (mask without bit i)
    return dp


def assignment_dp(n: int, cost: list) -> int:
    """
    Assignment DP: min cost to assign n tasks to n workers.
    cost[worker][task] = cost.
    O(N * 2^N) time, O(2^N) space.
    """
    INF = float('inf')
    dp = [INF] * (1 << n)
    dp[0] = 0

    for mask in range(1 << n):
        if dp[mask] == INF:
            continue
        worker = bin(mask).count('1')  # = popcount(mask)
        if worker >= n:
            continue
        for task in range(n):
            if mask & (1 << task):
                continue  # Task already assigned
            next_mask = mask | (1 << task)
            dp[next_mask] = min(dp[next_mask], dp[mask] + cost[worker][task])

    return dp[(1 << n) - 1]


if __name__ == '__main__':
    solve_tsp()
`,
};
