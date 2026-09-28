import { ConceptNode } from "./concept-graph";

export const CORE_CONCEPTS: ConceptNode[] = [
  // =========================================================================
  // 1. PREFIX SUMS & DIFFERENCE ARRAYS
  // =========================================================================
  {
    slug: "prefix-sums",
    name: "Prefix Sum & Difference Arrays",
    category: "Data Structures & Math",
    difficulty: "BEGINNER",
    description:
      "Foundational precomputation technique enabling O(1) static range sum queries and O(1) offline range updates on multi-dimensional arrays.",
    timeComplexity: "O(N) build, O(1) query",
    spaceComplexity: "O(N)",
    prerequisites: [],
    dependents: ["two-pointers"],
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
      },
      {
        title: "2D Matrix Prefix Sums",
        explanation: "Computes any rectangular subgrid sum in O(1) after O(R * C) dynamic programming precomputation.",
        formula: "P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]",
      },
      {
        title: "Difference Array (Offline Range Addition)",
        explanation: "Transforms O(N) range addition queries into two O(1) boundary updates. Ideal for offline scheduling and interval sweeps.",
        formula: "diff[l] += v; diff[r + 1] -= v;",
      },
      {
        title: "Prefix XOR & Parity Masks",
        explanation: "Because XOR is self-inverse (x ^ x = 0), pref_xor[r] ^ pref_xor[l-1] yields subarray XOR sum. Used in bitmask palindrome frequency checks.",
        formula: "range_xor(l, r) = pref_xor[r + 1] ^ pref_xor[l]",
      },
      {
        title: "Remainder Equivalence (Sum % K == 0)",
        explanation: "Subarray sum A[l...r] is divisible by K if and only if P[r+1] % K == P[l] % K. Track modulo frequencies in a hash map.",
        formula: "(pref[r + 1] - pref[l]) % K == 0 <=> pref[r + 1] % K == pref[l] % K",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 2 * 10^5, Q <= 2 * 10^5",
        cue: "Array is static (no interleaved modifications between range sum queries).",
      },
      {
        triggerConstraint: "Q interval additions, only final array required",
        cue: "All interval additions [l, r] += v are known in advance (use 1D or 2D Difference Array).",
      },
      {
        triggerConstraint: "Find count of subarrays whose sum equals K or sum % K == 0",
        cue: "Map of prefix sum frequencies: check if (current_pref - K) exists in hash table.",
      },
    ],
    stepByStepStrategy: [
      "1. Verify Mutability: Ensure elements do not change between queries. If elements update dynamically, use Fenwick Tree or Segment Tree.",
      "2. Allocate 1-Indexed: Allocate prefix array of size N + 1 with pref[0] = 0.",
      "3. 64-Bit Guard: If array values can be 10^9, N = 2 * 10^5, max prefix sum reaches 2 * 10^14. Use long long.",
      "4. Closed vs Open Intervals: Clarify if problem statement queries are 0-indexed or 1-indexed, inclusive or half-open.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

// ==========================================
// 1D Prefix Sum Template
// ==========================================
struct PrefixSum1D {
    int n;
    vector<long long> pref;

    PrefixSum1D(const vector<long long>& a) : n(a.size()), pref(n + 1, 0) {
        for (int i = 0; i < n; i++) {
            pref[i + 1] = pref[i] + a[i];
        }
    }

    // Returns sum of a[l...r] (0-indexed, inclusive)
    long long query(int l, int r) const {
        if (l > r || l < 0 || r >= n) return 0;
        return pref[r + 1] - pref[l];
    }
};

// ==========================================
// 2D Matrix Prefix Sum Template
// ==========================================
struct PrefixSum2D {
    int R, C;
    vector<vector<long long>> pref;

    PrefixSum2D(const vector<vector<long long>>& mat) {
        R = mat.size();
        C = R ? mat[0].size() : 0;
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

    // Query subgrid from (r1, c1) to (r2, c2) inclusive (0-indexed)
    long long query(int r1, int c1, int r2, int c2) const {
        if (r1 > r2 || c1 > c2) return 0;
        return pref[r2 + 1][c2 + 1] 
             - pref[r1][c2 + 1] 
             - pref[r2 + 1][c1] 
             + pref[r1][c1];
    }
};

// ==========================================
// 1D Difference Array Template
// ==========================================
struct DifferenceArray {
    int n;
    vector<long long> diff;

    DifferenceArray(int n) : n(n), diff(n + 2, 0) {}

    // Add v to all elements in range [l, r] (0-indexed, inclusive)
    void addRange(int l, int r, long long v) {
        diff[l] += v;
        diff[r + 1] -= v;
    }

    // Reconstructs final array
    vector<long long> build() {
        vector<long long> res(n);
        long long running = 0;
        for (int i = 0; i < n; i++) {
            running += diff[i];
            res[i] = running;
        }
        return res;
    }
};`,
    pitfalls: [
      "Integer Overflow: Accumulating 10^5 elements of magnitude 10^9 reaches 10^14. Storing prefix sums in 32-bit int results in UB / negative overflow.",
      "Off-By-One Inversion: Querying [l, r] requires pref[r + 1] - pref[l]. Subtracting pref[l - 1] in 0-indexed systems causes out-of-bounds at l = 0.",
      "Negative Modulos: In divisibility problems (pref[i] % K), C++ % operator preserves negative signs. Always normalize with ((val % K) + K) % K.",
      "Dynamic Invalidation: Modifying a single element in array A invalidates all subsequent prefix sums in O(N). If dynamic point updates are required, switch to Fenwick/Segment Tree.",
    ],
    practiceProblems: [
      { name: "Breed Counting (USACO Silver)", rating: 1100, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=572" },
      { name: "Subsequences Summing to Sevens (USACO Silver)", rating: 1200, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=595" },
      { name: "Kuriyama Mirai's Stones", rating: 1200, url: "https://codeforces.com/problemset/problem/433/B" },
      { name: "Karen and Coffee (2D Difference Array)", rating: 1500, url: "https://codeforces.com/problemset/problem/816/B" },
      { name: "Painting the Barn (USACO Silver 2D Diff)", rating: 1600, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=919" },
    ],
  },

  // =========================================================================
  // 2. TWO POINTERS & SLIDING WINDOW
  // =========================================================================
  {
    slug: "two-pointers",
    name: "Two Pointers & Sliding Window",
    category: "Algorithms",
    difficulty: "BEGINNER",
    description:
      "Linear scanning technique using monotonic pointer movements over sorted collections or sliding contiguous intervals in amortized O(N) time.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    prerequisites: ["prefix-sums"],
    dependents: ["binary-search-answer"],
    literatureReferences: [
      {
        source: "USACO Guide (Silver)",
        section: "Two Pointers Technique",
        url: "https://usaco.guide/silver/two-pointers",
        keyInsight:
          "Two pointers applies whenever extending the right bound monotonically degrades or maintains a predicate, allowing the left bound to only ever move forward.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 8: Amortized Analysis — Two Pointers (pp. 77-80)",
        keyInsight:
          "Even though the code features nested while loops, the left and right pointers both make at most N advances throughout the entire algorithm: amortized O(2N) = O(N).",
      },
      {
        source: "Competitive Programming 4 (Halim & Halim)",
        section: "Section 3.2.2: The Two Pointers Method",
        keyInsight:
          "Ideal for sorted 2-sum, 3-sum reductions, and contiguous segment problems with monotonic criteria.",
      },
      {
        source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
        section: "Chapter 6: Greedy Algorithms & Scanning Techniques",
        keyInsight:
          "The 'At Most K' subtraction trick: count(Exact K) = count(At Most K) - count(At Most K - 1) converts non-monotonic exact matches into monotonic sliding window subproblems.",
      },
    ],
    conceptualTheory: `### Mathematical Monotonicity & Pointer Mechanics

#### 1. Why Amortized O(N) Holds
A common beginner hesitation is seeing a \`while\` loop inside a \`for\` loop and assuming $O(N^2)$.
\`\`\`cpp
for (int r = 0; r < n; r++) {
    while (l <= r && !predicate(l, r)) {
        l++; // l only increases across the ENTIRE execution!
    }
}
\`\`\`
Both $l$ and $r$ start at $0$ and strictly increment up to $N-1$.
Total increments of $r$: at most $N$.
Total increments of $l$: at most $N$.
**Total Operations**: $N + N = 2N \\implies O(N)$ time.

---

#### 2. The Two Classic Pointer Configurations

##### Archetype A: Same-Direction (Sliding Window)
Both pointers advance from left to right. Maintains a dynamic state window $[L, R]$:
- Expanding $R$: add element $A[R]$ to window state (e.g. running sum, frequency map).
- Contracting $L$: while condition is violated, subtract $A[L]$ and advance $L++$.
- Invariant: After contraction, $[L, R]$ is the longest valid window ending at $R$.

##### Archetype B: Inward Opposite-Direction Pointers
Pointers start at opposite ends of a **sorted** array ($L = 0, R = N-1$):
- If $A[L] + A[R] == \\text{Target}$: solution found.
- If $A[L] + A[R] < \\text{Target}$: sum too small $\\implies L++$.
- If $A[L] + A[R] > \\text{Target}$: sum too large $\\implies R--$.

---

#### 3. The "At Most K" Counting Trick
Problems asking for *"Count of subarrays with exactly K distinct numbers / odd numbers"* are difficult to do directly with sliding window because adding an element can either preserve or break exact equality non-monotonically.

**The Identity**:
$$\\text{Count}(\\text{Exactly } K) = \\text{Count}(\\text{At Most } K) - \\text{Count}(\\text{At Most } K - 1)$$
Since "At Most $K$" is strictly monotonic (extending window can only increase distinct count), each term can be solved in clean $O(N)$ sliding window!`,
    variations: [
      {
        title: "Variable-Size Sliding Window (Constraint Optimization)",
        explanation: "Find longest or shortest contiguous subarray satisfying constraint (e.g., sum <= K, distinct <= K).",
        formula: "valid_subarrays_ending_at_R = (R - L + 1)",
      },
      {
        title: "Fixed-Size Sliding Window (Size K)",
        explanation: "Window length is strictly K. Maintain running metric by adding A[i] and removing A[i - K].",
        formula: "window_state += A[i] - A[i - K]",
      },
      {
        title: "Opposite Inward Pointers (Sorted Target Sum)",
        explanation: "Requires sorted array. Move left pointer right to increase sum, move right pointer left to decrease sum.",
        formula: "L++ if sum < target else R--",
      },
      {
        title: "At Most K Subarray Reductions",
        explanation: "Transforms exact frequency subarray problems into two monotonic 'At Most' sliding window evaluations.",
        formula: "f(K) - f(K - 1)",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 10^5, find optimal contiguous subarray",
        cue: "Condition is monotonic: if A[l...r] is valid, shrinking to A[l+1...r] remains valid (or vice versa).",
      },
      {
        triggerConstraint: "Sorted array, find pairs (i, j) with target condition",
        cue: "Pair sum, difference, or triangle inequality on sorted elements.",
      },
      {
        triggerConstraint: "Array contains only positive integers",
        cue: "Positive integers guarantee that sum monotonically increases when expanding right.",
      },
    ],
    stepByStepStrategy: [
      "1. Check Monotonicity: Confirm that advancing R never shrinks the window criteria, and advancing L never expands it. If negative numbers exist with sum constraints, Two Pointers FAILS — use Prefix Sum + Hash Map or Monotonic Queue.",
      "2. State Management: Identify what data structure tracks the window (primitive accumulator vs freq map / multiset).",
      "3. Loop Boundary: Loop R from 0 to N-1, add A[R] to state, then while (invalid) remove A[L] and L++.",
      "4. Accumulation: For counting problems, every valid window [L, R] contributes (R - L + 1) valid subarrays ending at R.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>
#include <unordered_map>

using namespace std;

// 1. Longest subarray with sum <= K (all positive elements)
int longestSubarraySumAtMostK(const vector<int>& a, long long K) {
    int n = a.size();
    long long current_sum = 0;
    int max_len = 0;
    int l = 0;

    for (int r = 0; r < n; r++) {
        current_sum += a[r];
        while (current_sum > K && l <= r) {
            current_sum -= a[l++];
        }
        max_len = max(max_len, r - l + 1);
    }
    return max_len;
}

// 2. Count of subarrays with at most K distinct elements
long long countSubarraysAtMostKDistinct(const vector<int>& a, int K) {
    if (K <= 0) return 0;
    int n = a.size();
    unordered_map<int, int> freq;
    long long count = 0;
    int l = 0;

    for (int r = 0; r < n; r++) {
        freq[a[r]]++;
        while ((int)freq.size() > K) {
            if (--freq[a[l]] == 0) {
                freq.erase(a[l]);
            }
            l++;
        }
        // All subarrays ending at r starting between l and r are valid
        count += (r - l + 1);
    }
    return count;
}

// Exactly K distinct elements trick
long long countSubarraysExactlyKDistinct(const vector<int>& a, int K) {
    return countSubarraysAtMostKDistinct(a, K) - countSubarraysAtMostKDistinct(a, K - 1);
}

// 3. Two Sum on Sorted Array (Opposite Direction)
pair<int, int> twoSumSorted(const vector<int>& a, int target) {
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        int sum = a[l] + a[r];
        if (sum == target) return {l, r};
        if (sum < target) l++;
        else r--;
    }
    return {-1, -1};
}`,
    pitfalls: [
      "Negative Values Violation: Applying two pointers for subarray sum when array has negative integers. Negative values break monotonicity. (Use Prefix Sums + std::map instead).",
      "Off-by-One Window Size: Window size for [l, r] inclusive is (r - l + 1), not (r - l).",
      "Empty Window Bounds: When predicate fails even on single element (e.g. A[r] > K), ensure pointer condition l <= r prevents index inversion.",
      "Complexity Trap in Window State: If state update inside while loop takes O(K) rather than O(1), total time degrades to O(NK). Maintain O(1) state transitions.",
    ],
    practiceProblems: [
      { name: "Books (Codeforces Div. 2B)", rating: 1400, url: "https://codeforces.com/problemset/problem/279/B" },
      { name: "They Are Everywhere", rating: 1400, url: "https://codeforces.com/problemset/problem/701/C" },
      { name: "Subarray Sums I (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1660" },
      { name: "Diamond Collector (USACO Silver)", rating: 1300, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=643" },
      { name: "Paired Up (USACO Silver)", rating: 1200, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=738" },
    ],
  },

  // =========================================================================
  // 3. BINARY SEARCH ON ANSWER
  // =========================================================================
  {
    slug: "binary-search-answer",
    name: "Binary Search on Answer (Monotonic Predicates)",
    category: "Searching & Optimization",
    difficulty: "INTERMEDIATE",
    description:
      "Transforming complex optimization problems into feasibility checks by evaluating a monotonic boolean predicate check(mid) in logarithmic iterations.",
    timeComplexity: "O(check(X) * log(Search Space))",
    spaceComplexity: "O(1)",
    prerequisites: ["two-pointers"],
    dependents: ["segment-tree"],
    literatureReferences: [
      {
        source: "USACO Guide (Silver)",
        section: "Binary Search on the Answer",
        url: "https://usaco.guide/silver/binary-search",
        keyInsight:
          "If the answer space is monotonic—i.e., if target X is achievable, then all X' > X are also achievable (or vice-versa)—the problem reduces to finding the transition boundary.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 3: Sorting and Searching — Finding the Optimal Solution (pp. 34-36)",
        keyInsight:
          "Instead of directly computing the optimal value (which is often NP-hard or complex), formulate a decision problem check(x) that returns true if x is feasible.",
      },
      {
        source: "Competitive Programming 4 (Halim & Halim)",
        section: "Section 3.3.1: Bisection Method / Binary Search the Answer",
        keyInsight:
          "The signature clue: questions containing 'minimize the maximum...' or 'maximize the minimum...'.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 2: Divide-and-Conquer Analysis",
        keyInsight:
          "Logarithmic convergence guarantees solving search spaces up to 10^18 in at most 60 predicate evaluations.",
      },
    ],
    conceptualTheory: `### The Principle of Predicate Monotonicity

#### 1. The Decision Function Transition
Binary search is not just for finding numbers in sorted arrays. Any function $f(x) \\to \\{\\text{true}, \\text{false}\\}$ that is **monotonic** can be binary searched.

Two Canonical Transition Patterns:
\`\`\`
Minimization (Find First True):
x:        0    1    2    3    4    5    6    7
check(x): F    F    F    T    T    T    T    T
                         ^ Ans = 3

Maximization (Find Last True):
x:        0    1    2    3    4    5    6    7
check(x): T    T    T    T    T    F    F    F
                              ^ Ans = 4
\`\`\`

---

#### 2. The Universal Invariant (No Off-by-One Infinite Loops)
To write binary search without ever experiencing infinite loops or off-by-one errors:

**Template for Minimization (First True)**:
\`\`\`cpp
long long low = MIN_POSSIBLE, high = MAX_POSSIBLE, ans = high;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) {
        ans = mid;         // mid works! Record and try to find smaller
        high = mid - 1;
    } else {
        low = mid + 1;     // mid too small, must go higher
    }
}
return ans;
\`\`\`

**Template for Maximization (Last True)**:
\`\`\`cpp
long long low = MIN_POSSIBLE, high = MAX_POSSIBLE, ans = low;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) {
        ans = mid;         // mid works! Record and try to find larger
        low = mid + 1;
    } else {
        high = mid - 1;    // mid too large, must decrease
    }
}
return ans;
\`\`\`

---

#### 3. Floating-Point Binary Search
When searching over continuous real numbers, never use \`while (high - low > EPS)\` because floating-point precision degradation can cause infinite loops near $10^{-9}$.
**The Production Standard**: Use fixed iterations!
\`\`\`cpp
double low = 0.0, high = 1e9;
for (int iter = 0; iter < 100; iter++) { // 2^-100 precision!
    double mid = low + (high - low) / 2.0;
    if (check(mid)) high = mid;
    else low = mid;
}
\`\`\``,
    variations: [
      {
        title: "Minimize the Maximum (Discrete Allocation)",
        explanation: "E.g., allocate jobs to K workers minimizing maximum workload. check(max_load) greedily counts workers needed in O(N).",
        formula: "mid = low + (high - low) / 2",
      },
      {
        title: "Maximize the Minimum (Distance Spacing)",
        explanation: "E.g., place K cows in stalls such that minimum distance between cows is maximized. check(dist) greedily places next cow at least dist away.",
      },
      {
        title: "Floating-Point Precision Bisection",
        explanation: "Run a fixed loop of 80 to 100 iterations. Guarantees 10^-24 relative precision without epsilon convergence risks.",
        formula: "for (int iter = 0; iter < 100; iter++)",
      },
      {
        title: "Ternary Search (Unimodal Optimization)",
        explanation: "Optimizes strictly convex/concave functions where derivative changes sign. Tri-sections interval into thirds in O(log_{1.5} N).",
        formula: "m1 = l + (r - l) / 3; m2 = r - (r - l) / 3;",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Answer space up to 10^18, check function runs in O(N) or O(N log N)",
        cue: "Wording: 'Find the minimum possible maximum...' or 'Find the maximum minimum...'.",
      },
      {
        triggerConstraint: "Direct construction is difficult, but verifying a candidate answer is easy",
        cue: "Greedy verification check(x) takes linear time.",
      },
      {
        triggerConstraint: "Monotonic feasibility: if answer X works, X + 1 obviously works",
        cue: "Resource monotonicity (more capacity/time always makes task easier).",
      },
    ],
    stepByStepStrategy: [
      "1. Identify the Search Bounds: Determine absolute minimum possible answer (low) and guaranteed safe upper bound (high). Ensure high does not overflow 64-bit int.",
      "2. Formulate check(mid): Write a boolean function that returns true if mid satisfies the problem constraints. check(mid) should ideally be greedy or BFS/DFS.",
      "3. Choose Direction: Is problem asking for First True (minimize) or Last True (maximize)?",
      "4. Handle Mid Overflow: Always write mid = low + (high - low) / 2.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>
#include <numeric>
#include <algorithm>

using namespace std;

// Example 1: Classic 'Aggressive Cows / Social Distancing' (Maximize Minimum Distance)
bool canPlace(const vector<long long>& stalls, int C, long long minDist) {
    int placed = 1;
    long long lastPos = stalls[0];

    for (size_t i = 1; i < stalls.size(); i++) {
        if (stalls[i] - lastPos >= minDist) {
            placed++;
            lastPos = stalls[i];
            if (placed >= C) return true;
        }
    }
    return false;
}

long long maxMinDistance(vector<long long>& stalls, int C) {
    sort(stalls.begin(), stalls.end());
    long long low = 1;
    long long high = stalls.back() - stalls.front();
    long long ans = low;

    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (canPlace(stalls, C, mid)) {
            ans = mid;      // Feasible! Try to maximize distance further
            low = mid + 1;
        } else {
            high = mid - 1; // Infeasible, distance must be smaller
        }
    }
    return ans;
}

// Example 2: Fractional Bisection (100 Iterations Standard)
bool checkRatio(double x, const vector<pair<double, double>>& items, int K);

double binarySearchReal(double low, double high) {
    for (int iter = 0; iter < 100; iter++) {
        double mid = low + (high - low) / 2.0;
        // if (checkRatio(mid, ...)) low = mid; else high = mid;
    }
    return low;
}`,
    pitfalls: [
      "Integer Overflow in Mid Calculation: Writing (low + high) / 2 when high = 2 * 10^18 will overflow signed 64-bit int into negative numbers. Always use low + (high - low) / 2.",
      "Search Space Underestimation: Setting high too low (e.g. 10^9 when answer can be N * max_A = 10^14). Always verify max possible answer mathematically.",
      "Infinite Loop from Asymmetric Step: Writing low = mid without +1 or high = mid without -1 in integer division can loop infinitely when high - low == 1.",
      "Non-Monotonicity Trap: Assuming an answer is monotonic without checking counterexamples. If check(x) has local optima, standard binary search fails.",
    ],
    practiceProblems: [
      { name: "Factory Machines (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1620" },
      { name: "Poisoned Dagger (Codeforces 1200)", rating: 1200, url: "https://codeforces.com/problemset/problem/1613/C" },
      { name: "Social Distancing (USACO Silver)", rating: 1400, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=1038" },
      { name: "Hamburgers (Codeforces 1400)", rating: 1400, url: "https://codeforces.com/problemset/problem/371/C" },
      { name: "Convention (USACO Silver)", rating: 1400, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=858" },
    ],
  },

  // =========================================================================
  // 4. GRAPH TRAVERSALS: BFS, DFS & 0-1 BFS
  // =========================================================================
  {
    slug: "bfs-dfs",
    name: "BFS, DFS & 0-1 BFS Graph Traversals",
    category: "Graph Theory",
    difficulty: "BEGINNER",
    description:
      "Core graph explorations for connectivity, flood fill, topological ordering, cycle detection, and unweighted / 0-1 weighted shortest paths.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    prerequisites: [],
    dependents: ["dsu", "dijkstra"],
    literatureReferences: [
      {
        source: "USACO Guide (Silver)",
        section: "Graph Traversals (DFS & BFS) & Flood Fill",
        url: "https://usaco.guide/silver/dfs",
        keyInsight:
          "BFS guarantees unweighted shortest paths because the queue processes nodes in strictly non-decreasing distance order. DFS explores branch depth, ideal for subtree properties and topological sorting.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 22: Elementary Graph Algorithms (pp. 589-612)",
        keyInsight:
          "Classification of edges during DFS (Tree, Back, Forward, Cross edges) determines directed cycles if and only if a back edge is encountered.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 11: Basics of Graphs (pp. 105-115)",
        keyInsight:
          "0-1 BFS with std::deque achieves shortest paths in O(V + E) for graphs where edge weights are only 0 or 1, avoiding O(E log V) Dijkstra overhead.",
      },
    ],
    conceptualTheory: `### Traversal Mechanics & Invariants

#### 1. BFS Shortest Path Invariant
BFS maintains a FIFO queue where distance values in the queue at any moment are monotonic:
$$\\text{queue} = [d, d, \\dots, d, d+1, d+1, \\dots, d+1]$$
- **The Critical Rule**: Mark nodes as visited / assign \`dist[v] = dist[u] + 1\` **at the moment of pushing** into the queue, NEVER when popping. Marking upon popping pushes duplicate nodes up to degree $(u)$ times, causing $O(E)$ memory blowup and TLE!

---

#### 2. 0-1 BFS with \`std::deque\`
When edge weights are restricted to $0$ and $1$:
- If traversing an edge of weight $0$: push to **front** of deque (\`q.push_front(v)\`).
- If traversing an edge of weight $1$: push to **back** of deque (\`q.push_back(v)\`).
This preserves the monotonic distance ordering $[d, d+1]$ without needing a priority queue! Time complexity is strictly linear $O(V + E)$.

---

#### 3. Tree Diameter via Double BFS/DFS
To find the longest simple path in an unweighted tree:
1. Run BFS/DFS from any arbitrary node $x$ to find the farthest node $u$.
2. Run BFS/DFS from $u$ to find the farthest node $v$.
3. The distance $\\text{dist}(u, v)$ is mathematically guaranteed to be the exact tree diameter!`,
    variations: [
      {
        title: "Standard BFS (Unweighted Shortest Path)",
        explanation: "Level-order traversal computing minimum edge count from source to all reachable vertices in O(V + E).",
        formula: "dist[v] = dist[u] + 1",
      },
      {
        title: "0-1 BFS (Weights 0 and 1)",
        explanation: "Uses std::deque. Push 0-weight relaxations to front, 1-weight to back. Runs in linear O(V + E) without log factors.",
      },
      {
        title: "Multi-Source BFS",
        explanation: "Initialize queue with multiple starting nodes at distance 0 (e.g., spreading rot/fire/monsters) to compute simultaneous shortest reach.",
      },
      {
        title: "DFS Tree & Cycle Detection",
        explanation: "Three-color state array (0: unvisited, 1: visiting, 2: visited). Finding edge to state 1 confirms directed cycle.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Unweighted grid / maze finding shortest path",
        cue: "Standard BFS with direction vectors dx[] = {0, 0, 1, -1}, dy[] = {1, -1, 0, 0}.",
      },
      {
        triggerConstraint: "Edge weights are only 0 (free transition) or 1 (cost transition)",
        cue: "0-1 BFS with std::deque.",
      },
      {
        triggerConstraint: "Find connected components or count island regions",
        cue: "Flood fill DFS/BFS.",
      },
    ],
    stepByStepStrategy: [
      "1. Representation: Use vector<vector<int>> adj(N + 1) for adjacency list. Avoid adjacency matrix unless N <= 1000.",
      "2. Mark Immediately: When pushing to queue in BFS, mark visited immediately to avoid duplicate queue insertions.",
      "3. Recursion Limit: Deep DFS lines on trees with N = 2 * 10^5 can exceed default stack size on Windows/CF. Use iterative or custom stack if needed.",
    ],
    codeTemplate: `#include <vector>
#include <queue>
#include <deque>
#include <iostream>

using namespace std;

// 1. Standard BFS (Unweighted Shortest Path)
vector<int> bfs(int start, int n, const vector<vector<int>>& adj) {
    vector<int> dist(n + 1, -1);
    queue<int> q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}

// 2. 0-1 BFS Template (Weights 0 or 1)
const int INF = 1e9;
vector<int> zeroOneBFS(int start, int n, const vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n + 1, INF);
    deque<int> dq;

    dist[start] = 0;
    dq.push_back(start);

    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second; // 0 or 1

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                if (weight == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }
    return dist;
}`,
    pitfalls: [
      "Popping-Time Visited Marking: Marking a node visited upon pop() instead of push() causes exponential duplicates in dense graphs, leading to Memory Limit Exceeded (MLE) or TLE.",
      "Implicit Grid Coordinate Inversion: Confusing row and col indices: (r, c) maps to grid[r][c] with dx[] for rows and dy[] for columns.",
      "Directed vs Undirected Graph: Forgetting that undirected graphs require adding both adj[u].push_back(v) and adj[v].push_back(u).",
    ],
    practiceProblems: [
      { name: "Labyrinth (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1193" },
      { name: "Message Route (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1667" },
      { name: "Kefa and Park", rating: 1500, url: "https://codeforces.com/problemset/problem/580/C" },
      { name: "Three States (0-1 BFS)", rating: 1900, url: "https://codeforces.com/problemset/problem/590/C" },
    ],
  },

  // =========================================================================
  // 5. DISJOINT SET UNION (DSU)
  // =========================================================================
  {
    slug: "dsu",
    name: "Disjoint Set Union (DSU / Union-Find)",
    category: "Data Structures & Graphs",
    difficulty: "INTERMEDIATE",
    description:
      "Near-linear data structure maintaining disjoint partition sets under union and connectivity queries in near-constant amortized time O(α(N)).",
    timeComplexity: "O(α(N)) amortized",
    spaceComplexity: "O(N)",
    prerequisites: ["bfs-dfs"],
    dependents: ["mst-kruskal"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Disjoint Set Union",
        url: "https://usaco.guide/gold/dsu",
        keyInsight:
          "Combining path compression and union by size guarantees that any sequence of M operations on N elements runs in O(M * α(N)), where α(N) <= 4 for all practical universe sizes.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 21: Data Structures for Disjoint Sets (pp. 561-585)",
        keyInsight:
          "Formal proof of the inverse Ackermann bound α(N). Omitting either path compression or union by rank degrades performance to O(log N) or O(N).",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 15: Spanning Trees — Kruskal's Algorithm & DSU (pp. 147-150)",
        keyInsight:
          "Rollback DSU: When path compression is omitted in favor of union by size alone, each union makes at most one assignment, allowing O(log N) operations with full history undo support for offline dynamic connectivity.",
      },
    ],
    conceptualTheory: `### DSU Mechanics & Asymptotic Optimality

#### 1. The Two Optimization Heuristics

##### Heuristic 1: Path Compression
When querying \`find(x)\`, make every node on the path point directly to the component root:
\`\`\`cpp
int find(int i) {
    return (parent[i] == i) ? i : (parent[i] = find(parent[i]));
}
\`\`\`
Flattens tree depth to $1$ for all queried ancestors.

##### Heuristic 2: Union by Size / Rank
Always attach the smaller component under the root of the larger component:
\`\`\`cpp
if (sz[root_u] < sz[root_v]) swap(root_u, root_v);
parent[root_v] = root_u;
sz[root_u] += sz[root_v];
\`\`\`
Guarantees that maximum tree depth without path compression never exceeds $\\lfloor \\log_2 N \\rfloor$.

**Combined Result**: Operations execute in $O(\\alpha(N))$ amortized time, where $\\alpha(N)$ is the inverse Ackermann function (never exceeds 4 for $N < 10^{600}$).

---

#### 2. DSU with Rollback (History Undo)
When solving **Offline Dynamic Connectivity** (adding and deleting edges over time via divide & conquer):
- Path compression mutates multiple parent pointers, making undo difficult.
- **Solution**: Use Union by Size ONLY (depth $\\le \\log N$). Keep a stack of modifications \`history.push({u, v, sz_u})\`.
- To rollback: revert \`parent[v] = v\` and \`sz[u] -= sz_v\` in $O(1)$!`,
    variations: [
      {
        title: "Standard DSU (Path Compression + Union by Size)",
        explanation: "Near-instant O(α(N)) dynamic connectivity and component size tracking.",
        formula: "parent[i] = find(parent[i])",
      },
      {
        title: "Rollback DSU (Offline Edge Deletions)",
        explanation: "O(log N) operations without path compression, maintaining an undo stack for divide-and-conquer timeline queries.",
      },
      {
        title: "Parity / Bipartite DSU (2-Colorability)",
        explanation: "Track relative edge parities or maintain 2N nodes (x and x + N) to detect odd cycles / verify bipartiteness dynamically.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 2 * 10^5, dynamically adding edges and checking connectivity",
        cue: "Merging sets or components online.",
      },
      {
        triggerConstraint: "Kruskal's Minimum Spanning Tree",
        cue: "Cycle detection when scanning sorted edges.",
      },
    ],
    stepByStepStrategy: [
      "1. Initialize: parent[i] = i, sz[i] = 1 for all i from 1 to N.",
      "2. Root Lookup: In unite(u, v), always resolve root_u = find(u) and root_v = find(v) BEFORE updating sizes.",
      "3. Return Boolean: Make unite() return boolean (true if new merger occurred, false if already in same component).",
    ],
    codeTemplate: `#include <vector>
#include <numeric>
#include <iostream>

using namespace std;

struct DSU {
    int num_components;
    vector<int> parent, sz;

    DSU(int n) : num_components(n), parent(n + 1), sz(n + 1, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        return (parent[i] == i) ? i : (parent[i] = find(parent[i]));
    }

    bool same(int i, int j) {
        return find(i) == find(j);
    }

    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i == root_j) return false;

        // Union by size
        if (sz[root_i] < sz[root_j]) swap(root_i, root_j);
        parent[root_j] = root_i;
        sz[root_i] += sz[root_j];
        num_components--;
        return true;
    }

    int size(int i) {
        return sz[find(i)];
    }
};`,
    pitfalls: [
      "Omitting Path Compression: Writing find(int i) { while (i != parent[i]) i = parent[i]; return i; } causes degenerate chains and O(N) worst-case time.",
      "Uniting Non-Roots: Executing parent[u] = v instead of parent[find(u)] = find(v) breaks subtree invariant.",
      "Forgetting 1-Indexing Allocation: Allocating DSU of size N when graph nodes are numbered 1 to N leads to undefined vector heap overflow.",
    ],
    practiceProblems: [
      { name: "Road Construction (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1676" },
      { name: "Mocha and Diana", rating: 1400, url: "https://codeforces.com/problemset/problem/1559/D1" },
      { name: "Closing the Farm (USACO Gold - Offline DSU)", rating: 1600, url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=646" },
    ],
  },

  // =========================================================================
  // 6. DIJKSTRA'S SHORTEST PATH ALGORITHM
  // =========================================================================
  {
    slug: "dijkstra",
    name: "Dijkstra's Algorithm & State-Space Graphs",
    category: "Graph Theory",
    difficulty: "INTERMEDIATE",
    description:
      "Greedy priority-queue traversal computing single-source shortest paths on weighted graphs with non-negative edge weights in O((V + E) log V).",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V + E)",
    prerequisites: ["bfs-dfs"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Shortest Paths with Non-Negative Edge Weights (Dijkstra)",
        url: "https://usaco.guide/gold/shortest-paths",
        keyInsight:
          "Dijkstra expands frontiers greedily. The node with the minimum unfinalized distance is guaranteed to be optimal because all edge weights are non-negative.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 24.3: Dijkstra's Algorithm (pp. 658-663)",
        keyInsight:
          "Proof of correctness relies on the loop invariant: at each extraction of u from Q, dist[u] equals the true shortest path distance delta(s, u).",
      },
      {
        source: "Competitive Programming 4 (Halim & Halim)",
        section: "Section 4.4.1: Single-Source Shortest Paths (SSSP) on Weighted Graphs",
        keyInsight:
          "State-space graph modeling: when problems introduce a constraint (e.g. at most K discount coupons), model graph as dist[node][k_used].",
      },
    ],
    conceptualTheory: `### The Greedy Invariant & State Space Formulation

#### 1. Why Negative Edges Break Dijkstra
Dijkstra permanently marks a node as *finalized* the first time it is extracted from the priority queue.
If negative edge weights exist:
\`\`\`
    (1) -- [weight 5] --> (2)
     |                     ^
     | [weight 2]          | [weight -10]
     v                     |
    (3) -------------------+
\`\`\`
Dijkstra extracts $(2)$ first with distance $5$. Later, path $1 \\to 3 \\to 2$ achieves distance $2 - 10 = -8$. Because $(2)$ was already finalized, Dijkstra fails! Use **Bellman-Ford / SPFA** for negative weights.

---

#### 2. The Stale Entry Guard (Essential Performance Fix)
In C++, \`std::priority_queue\` does not support a \`decrease_key\` operation. When a shorter path is found to node $v$, we push a new pair \`{new_dist, v}\` into the queue, leaving the older, longer distance inside the queue.
**The Fix**:
\`\`\`cpp
if (d > dist[u]) continue; // Discard stale entry in O(1)!
\`\`\`
Omitting this line leads to exponential pushes on dense graphs and TLE.

---

#### 3. State-Space Graph Modeling
When a problem says *"You can use at most $K$ discount coupons to halve edge weights"*:
Define 2D state:
$$\\text{dist}[u][k] = \\text{minimum cost to reach node } u \\text{ having used } k \\text{ coupons}$$
Each edge $(u, v, w)$ offers two transitions:
1. Pay full weight: $(u, k) \\xrightarrow{w} (v, k)$
2. Use coupon (if $k < K$): $(u, k) \\xrightarrow{\\lfloor w/2 \\rfloor} (v, k+1)$`,
    variations: [
      {
        title: "Standard SSSP Dijkstra",
        explanation: "Computes minimum cost from source node to all vertices with non-negative weights in O((V + E) log V).",
      },
      {
        title: "State-Space Dijkstra (dist[node][state])",
        explanation: "Expands graph nodes into (node, remaining_fuel) or (node, coupons_used) tuples.",
      },
      {
        title: "Shortest Path Path Reconstruction",
        explanation: "Store parent[v] during relaxation. Backtrack from target to source to recover actual vertex sequence.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "V, E <= 2 * 10^5, positive edge weights",
        cue: "Shortest path or minimum cost traversal.",
      },
      {
        triggerConstraint: "Extra resource or constraint (K <= 10)",
        cue: "State-space Dijkstra with 2D distance table.",
      },
    ],
    stepByStepStrategy: [
      "1. Distance Array: Initialize vector<long long> dist(n + 1, 1e18) with dist[start] = 0.",
      "2. Min-Heap Priority Queue: Declare priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq.",
      "3. Discard Stale: Top of loop must check if (d > dist[u]) continue;.",
      "4. Relaxation: For each neighbor (v, w), if (dist[u] + w < dist[v]), update dist[v] and pq.push({dist[v], v}).",
    ],
    codeTemplate: `#include <vector>
#include <queue>
#include <iostream>

using namespace std;

const long long INF = 1e18;

// Returns distance array from start to all nodes 1...n
vector<long long> dijkstra(int start, int n, const vector<vector<pair<int, long long>>>& adj) {
    vector<long long> dist(n + 1, INF);
    // Min-heap storing {distance, node}
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        // Stale entry check (critical for O((V + E) log V))
        if (d > dist[u]) continue;

        for (const auto& edge : adj[u]) {
            int v = edge.first;
            long long weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    pitfalls: [
      "Missing Stale Entry Check: Forgetting if (d > dist[u]) continue; allows worst-case O(E log V) insertions without pruning, triggering TLE on dense benchmarks.",
      "32-Bit Integer Overflow: Long shortest paths can easily exceed 2 * 10^9. Always use 64-bit long long for distances and INF = 1e18.",
      "Negative Weights: Attempting to use Dijkstra when edges can have negative weights. Use SPFA or Bellman-Ford.",
    ],
    practiceProblems: [
      { name: "Shortest Routes I (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1671" },
      { name: "Flight Discount (CSES - State Space)", rating: 1500, url: "https://cses.fi/problemset/task/1195" },
      { name: "Dijkstra? (Codeforces Path Reconstruction)", rating: 1600, url: "https://codeforces.com/problemset/problem/20/C" },
    ],
  },

  // =========================================================================
  // 7. SEGMENT TREE (POINT UPDATE & RANGE QUERY)
  // =========================================================================
  {
    slug: "segment-tree",
    name: "Segment Tree (Point Update & Range Query)",
    category: "Data Structures",
    difficulty: "INTERMEDIATE",
    description:
      "Versatile divide-and-conquer tree data structure maintaining associative monoid operations over dynamic intervals in O(log N) time per query/update.",
    timeComplexity: "O(N) build, O(log N) query & update",
    spaceComplexity: "O(4N)",
    prerequisites: ["binary-search-answer"],
    dependents: ["lazy-propagation"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Point Update Range Query (Segment Tree)",
        url: "https://usaco.guide/gold/PURS",
        keyInsight:
          "Any associative operation (sum, min, max, gcd, matrix multiplication) can be supported on a segment tree. The canonical allocation is 4 * N.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 9: Range Queries — Segment Trees (pp. 87-95)",
        keyInsight:
          "Iterative (bottom-up) vs Recursive (top-down) tradeoffs. Recursive implementation offers maximum flexibility for lazy tags and binary search on trees.",
      },
      {
        source: "Competitive Programming 4 (Halim & Halim)",
        section: "Section 3.4.3: Segment Tree",
        keyInsight:
          "Each node in the segment tree represents an interval [L, R]. Any arbitrary query range is partitioned into at most 2 * ceil(log2 N) canonical nodes.",
      },
    ],
    conceptualTheory: `### Tree Structure & Canonical Range Decompositions

#### 1. Why 4N Allocation is Sufficient
A segment tree for an array of size $N$ is a binary tree where:
- Root represents interval $[0, N-1]$.
- Node $u$ has left child $2u$ representing $[L, \\text{mid}]$ and right child $2u+1$ representing $[\\text{mid}+1, R]$.
While $N$ leaves would need $2N - 1$ nodes if $N$ were a power of two, when $N = 2^k + 1$, the tree expands to height $k+2$. Maximum array index needed is bounded by $4N$.

---

#### 2. The Three Overlap Cases in Range Queries
When querying range $[q_l, q_r]$ on tree node covering $[s_l, s_r]$:
1. **Disjoint Case** ($q_r < s_l$ or $s_r < q_l$): Return identity element (e.g. 0 for sum, $\\infty$ for min).
2. **Complete Subsumption** ($q_l \\le s_l$ and $s_r \\le q_r$): Return \`tree[node]\` immediately.
3. **Partial Overlap**: Recurse on left child and right child, then return \`combine(left_result, right_result)\`.`,
    variations: [
      {
        title: "Point Update, Range Sum Query",
        explanation: "Update element at index i, query sum in [l, r] in O(log N).",
      },
      {
        title: "Range Minimum / Maximum Query (RMQ)",
        explanation: "Identity element is INF or -INF. Combine function is min() or max().",
      },
      {
        title: "Walk on Segment Tree (Binary Lifting in O(log N))",
        explanation: "Find the first element in range satisfying a condition in O(log N) instead of O(log^2 N) by inspecting child values.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N, Q <= 2 * 10^5, interleaved point updates and range queries",
        cue: "Need dynamic interval answers that cannot be solved with static prefix sums.",
      },
    ],
    stepByStepStrategy: [
      "1. Identify Monoid: Confirm operation is associative: (A * B) * C = A * (B * C) with identity element.",
      "2. Allocate 4 * N: Ensure tree vector has size 4 * N.",
      "3. 0-Indexed API: Implement 0-indexed public methods for clean interface.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree;

    SegmentTree(int n) : n(n), tree(4 * n, 0) {}

    SegmentTree(const vector<long long>& a) : n(a.size()), tree(4 * a.size(), 0) {
        build(1, 0, n - 1, a);
    }

    void build(int node, int start, int end, const vector<long long>& a) {
        if (start == end) {
            tree[node] = a[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(2 * node, start, mid, a);
        build(2 * node + 1, mid + 1, end, a);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    // Point update: set a[idx] = val (0-indexed)
    void update(int idx, long long val) {
        update(1, 0, n - 1, idx, val);
    }

    void update(int node, int start, int end, int idx, long long val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = start + (end - start) / 2;
        if (idx <= mid) update(2 * node, start, mid, idx, val);
        else update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    // Range query sum in [l, r] (0-indexed, inclusive)
    long long query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }

    long long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0; // Identity for sum
        if (l <= start && end <= r) return tree[node];

        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r) 
             + query(2 * node + 1, mid + 1, end, l, r);
    }
};`,
    pitfalls: [
      "Size 2N Instead of 4N: Allocating 2 * N on recursive segment trees leads to out-of-bounds leaf segmentation fault. Always allocate 4 * N.",
      "Identity Value Mismatch: Using 0 as identity for Range Minimum Query instead of 1e18 leads to incorrect answers for positive minimums.",
    ],
    practiceProblems: [
      { name: "Dynamic Range Sum Queries (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1648" },
      { name: "Dynamic Range Minimum Queries (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1649" },
      { name: "Distinct Characters Queries", rating: 1600, url: "https://codeforces.com/problemset/problem/1234/D" },
    ],
  },

  // =========================================================================
  // 8. LAZY PROPAGATION
  // =========================================================================
  {
    slug: "lazy-propagation",
    name: "Segment Tree with Lazy Propagation",
    category: "Data Structures",
    difficulty: "ADVANCED",
    description:
      "Deferred interval updates enabling simultaneous logarithmic O(log N) range updates and range queries.",
    timeComplexity: "O(log N) range update & query",
    spaceComplexity: "O(4N)",
    prerequisites: ["segment-tree"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Platinum)",
        section: "Range Updates with Lazy Propagation",
        url: "https://usaco.guide/plat/RURS",
        keyInsight:
          "Defer updating descendant nodes until they are actually queried. Storing pending tags in lazy[] maintains O(log N) updates over intervals of size up to N.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 28: Segment Trees Revisited — Lazy Updates (pp. 251-255)",
        keyInsight:
          "The critical push(node) operation distributes accumulated lazy tags to immediate children and clears node's tag before child recursion.",
      },
    ],
    conceptualTheory: `### The Lazy Invariant & Push-Down Mechanics

When executing a range update $[q_l, q_r]$:
1. If node interval $[s_l, s_r]$ is completely inside query range:
   - Apply modification directly to \`tree[node]\`.
   - Record tag in \`lazy[node]\`.
   - **Return immediately without descending into children!**
2. If partial overlap:
   - Call \`push(node)\` to pass current lazy tags to children.
   - Recurse into children.
   - Recompute \`tree[node] = combine(tree[2*node], tree[2*node+1])\`.`,
    variations: [
      {
        title: "Range Add, Range Sum",
        explanation: "tree[node] += lazy * (len). When pushing, lazy is added to child lazy tags.",
      },
      {
        title: "Range Set (Assignment), Range Sum",
        explanation: "Requires a sentinel or boolean has_lazy tag because setting to 0 is a valid assignment.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Both updates AND queries are over contiguous intervals [l, r]",
        cue: "Cannot use point update segment tree or simple difference array.",
      },
    ],
    stepByStepStrategy: [
      "1. Push Down: Always push(node, start, end) before recursing in BOTH query and update.",
      "2. Tag Composition: Determine how a new tag merges with an existing tag.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

struct LazySegmentTree {
    int n;
    vector<long long> tree, lazy;

    LazySegmentTree(int n) : n(n), tree(4 * n, 0), lazy(4 * n, 0) {}

    void push(int node, int start, int end) {
        if (lazy[node] != 0) {
            int mid = start + (end - start) / 2;
            tree[2 * node] += lazy[node] * (mid - start + 1);
            lazy[2 * node] += lazy[node];

            tree[2 * node + 1] += lazy[node] * (end - mid);
            lazy[2 * node + 1] += lazy[node];

            lazy[node] = 0;
        }
    }

    void updateRange(int l, int r, long long val) {
        updateRange(1, 0, n - 1, l, r, val);
    }

    void updateRange(int node, int start, int end, int l, int r, long long val) {
        if (r < start || end < l) return;
        if (l <= start && end <= r) {
            tree[node] += val * (end - start + 1);
            lazy[node] += val;
            return;
        }
        push(node, start, end);
        int mid = start + (end - start) / 2;
        updateRange(2 * node, start, mid, l, r, val);
        updateRange(2 * node + 1, mid + 1, end, l, r, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    long long query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }

    long long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];

        push(node, start, end);
        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r) 
             + query(2 * node + 1, mid + 1, end, l, r);
    }
};`,
    pitfalls: [
      "Forgetting push() in Query: Omitting push() in query() reads outdated child values, producing incorrect answers.",
      "Combining Add and Set: If a problem has both Range Add and Range Set, order of tag composition must be strictly respected.",
    ],
    practiceProblems: [
      { name: "Range Update Queries (CSES)", rating: 1400, url: "https://cses.fi/problemset/task/1651" },
      { name: "Circular RMQ", rating: 1700, url: "https://codeforces.com/problemset/problem/52/C" },
      { name: "The Child and Sequence", rating: 2200, url: "https://codeforces.com/problemset/problem/438/D" },
    ],
  },

  // =========================================================================
  // 9. 1D DYNAMIC PROGRAMMING
  // =========================================================================
  {
    slug: "1d-dp",
    name: "1D Dynamic Programming & State Transitions",
    category: "Dynamic Programming",
    difficulty: "BEGINNER",
    description:
      "Core optimization paradigm breaking complex recursive problems into topological subproblems with optimal substructure and overlapping states.",
    timeComplexity: "O(N * transitions)",
    spaceComplexity: "O(N)",
    prerequisites: [],
    dependents: ["knapsack"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Introduction to Dynamic Programming",
        url: "https://usaco.guide/gold/intro-dp",
        keyInsight:
          "DP states represent equivalence classes of subproblem histories. Define states by the minimum necessary information to make future decisions.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 7: Dynamic Programming (pp. 67-76)",
        keyInsight:
          "Formulate DP as finding a path in a Directed Acyclic Graph (DAG) of states. Iteration order must follow topological sorting.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 15: Dynamic Programming (pp. 359-390)",
        keyInsight:
          "Two essential ingredients: Optimal Substructure (an optimal solution contains within it optimal solutions to subproblems) and Overlapping Subproblems.",
      },
    ],
    conceptualTheory: `### State Formulation & DAG Topological Order

1. **State Definition**: What minimal information uniquely identifies subproblem? E.g., $dp[i]$ = optimal answer considering first $i$ elements.
2. **Transition Function**: Express $dp[i]$ as a function of previous states $dp[j]$ ($j < i$).
3. **Base Cases**: Initial conditions that anchor recurrence (e.g. $dp[0] = 0$).
4. **Order of Evaluation**: Compute prerequisite states first.`,
    variations: [
      {
        title: "Prefix State DP",
        explanation: "dp[i] represents optimal answer on prefix A[0...i].",
      },
      {
        title: "Longest Increasing Subsequence (LIS) in O(N log N)",
        explanation: "Patience sorting / binary search maintaining tails vector of smallest tail elements.",
        formula: "tails[idx] = x via lower_bound",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 10^5, choices at step i depend on previous states",
        cue: "Wording: 'maximize / minimize count or score', greedy choices fail.",
      },
    ],
    stepByStepStrategy: [
      "1. English Sentence: State what dp[i] means in plain English before writing code.",
      "2. Base Case Initialization: Fill base values explicitly.",
      "3. Transition: Derive transition formula from last decision.",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

// Longest Increasing Subsequence in O(N log N)
int computeLIS(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }
    return (int)tails.size();
}`,
    pitfalls: [
      "Uninitialized Base Cases: Leaving garbage values in base case indices.",
      "Incorrect Iteration Direction: Evaluating dp[i] before prerequisite states are computed.",
    ],
    practiceProblems: [
      { name: "Frog 1 & 2 (AtCoder Educational DP Contest)", rating: 1000, url: "https://atcoder.jp/contests/dp/tasks/dp_a" },
      { name: "Cut Ribbon", rating: 1300, url: "https://codeforces.com/problemset/problem/189/A" },
      { name: "Boredom", rating: 1500, url: "https://codeforces.com/problemset/problem/455/A" },
    ],
  },

  // =========================================================================
  // 10. KNAPSACK DP
  // =========================================================================
  {
    slug: "knapsack",
    name: "Knapsack DP (0/1, Unbounded, & Bounded)",
    category: "Dynamic Programming",
    difficulty: "INTERMEDIATE",
    description:
      "Classic subset selection under capacity constraints maximizing value. Features memory optimization from 2D O(NW) to 1D O(W).",
    timeComplexity: "O(N * W)",
    spaceComplexity: "O(W)",
    prerequisites: ["1d-dp"],
    dependents: ["bitmask-dp"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Knapsack DP",
        url: "https://usaco.guide/gold/knapsack",
        keyInsight:
          "In 0/1 Knapsack, iterating capacity backwards (from W down to wt[i]) prevents reusing the same item multiple times in a single step.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 7: Dynamic Programming — Knapsack Problems (pp. 69-72)",
        keyInsight:
          "Bounded knapsack with binary splitting: an item with count C can be decomposed into powers of two (1, 2, 4, ..., remainder) reducing count from C to log C.",
      },
    ],
    conceptualTheory: `### Space Reduction: Why Loop Direction Matters

**0/1 Knapsack (Iterate Backwards)**:
\`\`\`cpp
for (int i = 0; i < n; i++) {
    for (int w = W; w >= wt[i]; w--) {
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    }
}
\`\`\`
Iterating backwards ensures that when computing $dp[w]$, the value $dp[w - wt[i]]$ comes from the **previous** item $i-1$, guaranteeing each item is used at most once.

**Unbounded Knapsack (Iterate Forwards)**:
\`\`\`cpp
for (int i = 0; i < n; i++) {
    for (int w = wt[i]; w <= W; w++) {
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    }
}
\`\`\`
Iterating forwards allows re-using the current item multiple times.`,
    variations: [
      {
        title: "0/1 Knapsack (1D Space O(W))",
        explanation: "Each item used at most once. Loop capacity backwards.",
      },
      {
        title: "Unbounded Knapsack",
        explanation: "Infinite supply of each item. Loop capacity forwards.",
      },
      {
        title: "Bounded Knapsack via Binary Power Decomposition",
        explanation: "Decompose item count C into 1, 2, 4, ... bundles to solve in O(W * sum(log C)).",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 1000, W <= 10^5",
        cue: "Selecting subsets of items with weights and values.",
      },
    ],
    stepByStepStrategy: [
      "1. Check Capacity Size: If W <= 10^5, use standard knapsack. If W is huge (10^9) but values are small (V <= 10^5), swap state: dp[v] = min weight to reach value v.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

// 0/1 Knapsack in O(W) space
long long knapsack01(int W, const vector<int>& wt, const vector<long long>& val) {
    int n = wt.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`,
    pitfalls: [
      "Forward Loop in 0/1 Knapsack: Accidental forward iteration converts 0/1 knapsack into unbounded knapsack.",
      "Large Capacity Overflow: When W = 10^9, DP over weight is impossible. Use value-based DP or meet-in-the-middle.",
    ],
    practiceProblems: [
      { name: "Knapsack 1 & 2 (AtCoder Educational DP Contest)", rating: 1200, url: "https://atcoder.jp/contests/dp/tasks/dp_d" },
      { name: "Dima and Salad", rating: 1600, url: "https://codeforces.com/problemset/problem/366/C" },
    ],
  },

  // =========================================================================
  // 11. BITMASK DP
  // =========================================================================
  {
    slug: "bitmask-dp",
    name: "Bitmask Dynamic Programming & SOS DP",
    category: "Dynamic Programming",
    difficulty: "ADVANCED",
    description:
      "Exponential state optimization using integer bitmasks to represent active subsets for small N (N <= 20).",
    timeComplexity: "O(N^2 * 2^N)",
    spaceComplexity: "O(2^N)",
    prerequisites: ["knapsack"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Platinum)",
        section: "DP with Bitmasks",
        url: "https://usaco.guide/plat/bitmask-dp",
        keyInsight:
          "Bitwise operations allow representing an entire subset of {0, 1, ..., N-1} in a single 32-bit integer, transitioning in O(1) via bit manipulations.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 10: Bit Manipulation (pp. 97-104)",
        keyInsight:
          "Sum Over Subsets (SOS DP): computes sum of function over all submasks in O(N * 2^N) instead of naive O(3^N).",
      },
    ],
    conceptualTheory: `### Bitmask Operations & Subset Iteration

- Test $i$-th bit: \`(mask & (1 << i)) != 0\`
- Set $i$-th bit: \`mask | (1 << i)\`
- Clear $i$-th bit: \`mask & ~(1 << i)\`
- Count set bits: \`__builtin_popcount(mask)\`
- Submask Iteration in $O(3^N)$:
\`\`\`cpp
for (int mask = 0; mask < (1 << n); mask++) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
        // sub is a strict submask of mask!
    }
}
\`\`\``,
    variations: [
      {
        title: "TSP (Traveling Salesperson) Bitmask DP",
        explanation: "dp[mask][last_visited] = min cost to visit subset of vertices ending at last_visited.",
      },
      {
        title: "Sum Over Subsets (SOS DP)",
        explanation: "Computes prefix sums over bitwise subsets in O(N * 2^N).",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 20, permutation or assignment problem",
        cue: "2^20 is approx 10^6, fits comfortably within standard 1.0s time limit.",
      },
    ],
    stepByStepStrategy: [
      "1. Verify N <= 20: If N > 22, 2^N will exceed memory/time limit.",
      "2. Wrap Bitwise Operations: Always put parentheses around (1 << i) and (mask & (1 << i)).",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

const int INF = 1e9;

// TSP in O(N^2 * 2^N)
int tsp(int n, const vector<vector<int>>& dist) {
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    dp[1][0] = 0; // Start at city 0 with mask (1 << 0)

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] == INF) continue;

            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                int next_mask = mask | (1 << v);
                dp[next_mask][v] = min(dp[next_mask][v], dp[mask][u] + dist[u][v]);
            }
        }
    }

    int ans = INF;
    for (int u = 0; u < n; u++) {
        ans = min(ans, dp[(1 << n) - 1][u] + dist[u][0]);
    }
    return ans;
}`,
    pitfalls: [
      "Operator Precedence Bug: Writing 1 << n - 1 evaluates as 1 << (n - 1) due to subtraction having higher precedence than bit shifts.",
      "Memory Limit on 2D Bitmask: Storing vector<vector<int>> dp(1 << 22, vector<int>(22)) uses ~350MB, exceeding standard 256MB limit. Flatten to 1D.",
    ],
    practiceProblems: [
      { name: "Matching (AtCoder Educational DP Contest)", rating: 1500, url: "https://atcoder.jp/contests/dp/tasks/dp_o" },
      { name: "Hamiltonian Flights (CSES)", rating: 1700, url: "https://cses.fi/problemset/task/1690" },
      { name: "Fish", rating: 1800, url: "https://codeforces.com/problemset/problem/16/E" },
    ],
  },

  // =========================================================================
  // 12. MINIMUM SPANNING TREE (KRUSKAL'S ALGORITHM)
  // =========================================================================
  {
    slug: "mst-kruskal",
    name: "Minimum Spanning Tree (Kruskal's Algorithm)",
    category: "Graph Theory",
    difficulty: "INTERMEDIATE",
    description:
      "Greedy edge selection paired with DSU cycle detection to build spanning trees of minimal total edge weight in O(E log E).",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V + E)",
    prerequisites: ["dsu"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Minimum Spanning Trees",
        url: "https://usaco.guide/gold/mst",
        keyInsight:
          "Kruskal processes edges in ascending weight order. Using DSU to guard against cycles yields an optimal spanning tree by the Cut Property.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 23: Minimum Spanning Trees (pp. 624-642)",
        keyInsight:
          "Generic MST theorem: respect for safe edges across cuts guarantees correctness for both Kruskal and Prim algorithms.",
      },
    ],
    conceptualTheory: `### The Cut Property & Greedy Optimality

**Cut Property**:
For any cut $(S, V - S)$ of the graph, if an edge $e$ crossing the cut has strictly minimal weight among all edges crossing that cut, then $e$ must belong to some Minimum Spanning Tree of $G$.

**Kruskal's Execution**:
1. Sort all $E$ edges in non-decreasing order of weight.
2. Maintain a DSU over the $V$ vertices.
3. For each edge $(u, v, w)$, check if $u$ and $v$ belong to different components.
4. If yes, add edge to MST and merge components. Stop when $V-1$ edges are chosen.`,
    variations: [
      {
        title: "Standard Kruskal's Algorithm",
        explanation: "Greedy edge sorting + DSU in O(E log E).",
      },
      {
        title: "Minimum Spanning Forest",
        explanation: "Handles disconnected graphs by returning MST of each connected component.",
      },
      {
        title: "Maximum Spanning Tree",
        explanation: "Sort edges in descending order of weight.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Connect all nodes with minimum total wire / road length",
        cue: "Graph spanning tree optimization.",
      },
    ],
    stepByStepStrategy: [
      "1. Edge Struct: Define struct Edge { int u, v; long long weight; }.",
      "2. Sort: sort(edges.begin(), edges.end()).",
      "3. DSU Unite: Count edges added; break when edges_count == V - 1.",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <numeric>
#include <iostream>

using namespace std;

struct Edge {
    int u, v;
    long long weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

struct DSU {
    vector<int> parent, sz;
    DSU(int n) : parent(n + 1), sz(n + 1, 1) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i) { return (parent[i] == i) ? i : (parent[i] = find(parent[i])); }
    bool unite(int i, int j) {
        int root_i = find(i), root_j = find(j);
        if (root_i == root_j) return false;
        if (sz[root_i] < sz[root_j]) swap(root_i, root_j);
        parent[root_j] = root_i;
        sz[root_i] += sz[root_j];
        return true;
    }
};

pair<long long, bool> kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long total_weight = 0;
    int edges_used = 0;

    for (const auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            total_weight += e.weight;
            if (++edges_used == n - 1) break;
        }
    }
    return {total_weight, edges_used == n - 1};
}`,
    pitfalls: [
      "Disconnected Graph: If graph cannot be connected, edges_used < n - 1. Always verify connectivity.",
      "64-bit Weight Sum: Total spanning tree weight often exceeds 2 * 10^9. Store in long long.",
    ],
    practiceProblems: [
      { name: "Road Reparation (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1675" },
      { name: "Building Roads (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1666" },
      { name: "Design Tutorial: Make It Connected", rating: 1600, url: "https://codeforces.com/problemset/problem/472/D" },
    ],
  },
];
