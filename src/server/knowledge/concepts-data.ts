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
    dependents: ["dsu", "dijkstra", "tree-dp"],
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
      { name: "The Child and Sequence", rating: 2200, url: "https://codeforces.com/problemset/problem/438/D" },
    ],
  },
  // =========================================================================
  // 9. 1D DYNAMIC PROGRAMMING
  // =========================================================================
  {
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
        section: "Chapter 7: Dynamic Programming (pp. 67-76)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Formulate DP as finding a path in a Directed Acyclic Graph (DAG) of states. Iteration order must follow topological sorting, which for 1D arrays corresponds to standard ascending or descending iteration.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 15: Dynamic Programming (pp. 359-390)",
        keyInsight:
          "Two essential ingredients: Optimal Substructure (an optimal solution contains within it optimal solutions to subproblems) and Overlapping Subproblems (memoizing recurring states yields polynomial complexity).",
      },
      {
        source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
        section: "Chapter 9: Dynamic Programming & Space Reduction",
        keyInsight:
          "If the transition only references the previous K states (dp[i-1], dp[i-2]), rolling array buffers reduce auxiliary memory from O(N) to O(K) without altering time complexity.",
      },
    ],
    conceptualTheory: `### Mathematical Foundation & Mental Model

#### 1. The State Space & DAG Invariant
Every dynamic programming problem is isomorphic to finding an optimal path or counting paths in a **Directed Acyclic Graph (DAG)**:
- **Vertices $V$**: Unique subproblem states $s \\in \\mathcal{S}$.
- **Directed Edges $E$**: Valid transitions $u \\to v$ representing immediate decisions.
- **Topological Invariant**: State $u$ must be completely evaluated before state $v$ can consume $dp[u]$. In 1D arrays, iterating $i = 1 \\dots N$ guarantees topological order if $dp[i]$ depends only on $j < i$.

---

#### 2. The 4-Step Formulation Protocol
1. **Clear English Definition**: State what $dp[i]$ computes in unambiguous plain English (e.g., "$dp[i]$ is the minimum energy required to reach stone $i$ from stone $0$").
2. **Transition Recurrence**: Express $dp[i]$ as a function of predecessor subproblems:
   $$dp[i] = \\min_{j \\in \\text{valid}(i)} \\{ dp[j] + \\text{cost}(j, i) \\}$$
3. **Base Cases**: Anchor the recurrence with definitive initial conditions (e.g., $dp[0] = 0$, all others initialized to $\\infty$).
4. **Order of Evaluation & Space Reduction**: Confirm all referenced states $j$ are calculated prior to evaluating $i$. When transitions depend only on $i-1$ and $i-2$, keep two scalar variables ($prev1, prev2$) reducing space from $O(N)$ to $O(1)$.

---

#### 3. Longest Increasing Subsequence (LIS) in $O(N \\log N)$
The classical $O(N^2)$ recurrence $dp[i] = 1 + \\max_{j < i, A[j] < A[i]} dp[j]$ is accelerated to $O(N \\log N)$ using **Patience Sorting**:
- Maintain an auxiliary array $\\text{tails}$, where $\\text{tails}[k]$ stores the **smallest ending element** among all increasing subsequences of length $k+1$ discovered so far.
- **Invariant**: $\\text{tails}$ is strictly monotonically increasing.
- For each incoming element $x$:
  - Binary search using \`std::lower_bound\` for the first element $\\ge x$.
  - If found at index $idx$, update $\\text{tails}[idx] = x$ (extending the optimal candidate tail).
  - If $x$ is strictly greater than all elements, append $x$ to $\\text{tails}$.
- The length of the LIS is exactly $\\text{tails.size()}$.`,
    variations: [
      {
        title: "Prefix State DP with Transitions",
        explanation: "dp[i] stores optimal answer considering prefix A[0...i]. Common in Frog Jump, House Robber, and Cut Ribbon problems.",
        formula: "dp[i] = min(dp[i-1] + cost(i-1, i), dp[i-2] + cost(i-2, i))",
      },
      {
        title: "Longest Increasing Subsequence (LIS) in O(N log N)",
        explanation: "Patience sorting / binary search maintaining monotonic tails vector.",
        formula: "tails[lower_bound(tails.begin(), tails.end(), x)] = x",
        codeSnippet: `int idx = lower_bound(tails.begin(), tails.end(), x) - tails.begin(); if (idx == tails.size()) tails.push_back(x); else tails[idx] = x;`,
      },
      {
        title: "Linear Recurrence via Matrix Exponentiation",
        explanation: "When transitions are linear (like Fibonacci or k-step DP) and N <= 10^18, exponentiate a KxK transition matrix in O(K^3 log N).",
        formula: "[dp[i], dp[i-1]]^T = M * [dp[i-1], dp[i-2]]^T",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 10^5, decisions at step i depend on previous subproblem outcomes",
        cue: "Wording: 'maximize / minimize total score', 'count distinct valid configurations mod 10^9+7', greedy choices fail on counterexamples.",
      },
      {
        triggerConstraint: "N <= 2 * 10^5, find longest subsequence satisfying monotonicity",
        cue: "Use O(N log N) patience sorting LIS pattern.",
      },
      {
        triggerConstraint: "N <= 10^18, linear transitions with fixed small K <= 50",
        cue: "Matrix Exponentiation DP.",
      },
    ],
    stepByStepStrategy: [
      "1. Define Plain English State: Write out the exact semantics of dp[i] before writing any code.",
      "2. Check Base Cases: Initialize dp[0] explicitly; fill all other states with sentinel values (0 for max/counting, INF for min).",
      "3. Direction of Iteration: Determine if transition requires forward or reverse iteration to prevent referencing stale or prematurely updated values.",
      "4. Modulo Arithmetic: If counting modulo 10^9+7, apply modulo at every addition step to prevent 64-bit integer overflow.",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

// 1. Longest Increasing Subsequence in O(N log N) with Full Path Reconstruction
vector<int> reconstructLIS(const vector<int>& a) {
    int n = a.size();
    if (n == 0) return {};

    vector<int> tails;         // Stores smallest tail values for each length
    vector<int> tail_indices;  // Stores original index in 'a' of tail values
    vector<int> parent(n, -1); // Tracks predecessor for reconstruction

    for (int i = 0; i < n; i++) {
        int x = a[i];
        auto it = lower_bound(tails.begin(), tails.end(), x);
        int idx = it - tails.begin();

        if (it == tails.end()) {
            tails.push_back(x);
            tail_indices.push_back(i);
        } else {
            *it = x;
            tail_indices[idx] = i;
        }

        if (idx > 0) {
            parent[i] = tail_indices[idx - 1];
        }
    }

    // Reconstruct the actual subsequence
    vector<int> lis;
    int curr = tail_indices.back();
    while (curr != -1) {
        lis.push_back(a[curr]);
        curr = parent[curr];
    }
    reverse(lis.begin(), lis.end());
    return lis;
}

// 2. Classical Frog Jump 1D DP with Space Compression
int frogJumpMinCost(const vector<int>& h, int k) {
    int n = h.size();
    const int INF = 1e9;
    vector<int> dp(n, INF);
    dp[0] = 0;

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j <= min(n - 1, i + k); j++) {
            dp[j] = min(dp[j], dp[i] + abs(h[i] - h[j]));
        }
    }
    return dp[n - 1];
}`,
    pitfalls: [
      "Uninitialized Base Cases: Leaving garbage memory in dp[0] or sentinel INF values produces undefined outputs.",
      "Integer Overflow on INF: Using 2e9 + cost can overflow a 32-bit signed integer. Always use 1e9 or 1e18 for 64-bit bounds.",
      "Strict vs Non-Decreasing LIS: For non-decreasing subsequence (allow equal elements), use std::upper_bound instead of std::lower_bound.",
    ],
    practiceProblems: [
      { name: "Frog 1 & 2 (AtCoder Educational DP Contest)", rating: 1000, url: "https://atcoder.jp/contests/dp/tasks/dp_a" },
      { name: "Cut Ribbon", rating: 1300, url: "https://codeforces.com/problemset/problem/189/A" },
      { name: "Boredom", rating: 1500, url: "https://codeforces.com/problemset/problem/455/A" },
      { name: "Longest Increasing Subsequence (CSES)", rating: 1400, url: "https://cses.fi/problemset/task/1145" },
    ],
  },

  // =========================================================================
  // 10. KNAPSACK DP
  // =========================================================================
  {
    slug: "knapsack",
    name: "Knapsack DP (0/1, Unbounded, Bounded, & Dual)",
    category: "Dynamic Programming",
    difficulty: "INTERMEDIATE",
    description:
      "Subset selection optimization under capacity constraints. Features space compression from 2D O(NW) to 1D O(W), binary bundle decomposition, and dual-state inversions for large weights.",
    timeComplexity: "O(N * W)",
    spaceComplexity: "O(W)",
    prerequisites: ["1d-dp"],
    dependents: ["bitmask-dp"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Knapsack DP & Space Optimization",
        url: "https://usaco.guide/gold/knapsack",
        keyInsight:
          "In 0/1 Knapsack, iterating capacity backwards (from W down to wt[i]) prevents reusing the same item multiple times in a single step, compressing O(N*W) space to O(W).",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 7: Dynamic Programming — Knapsack Problems (pp. 69-72)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Bounded knapsack with binary power decomposition: an item with count C is split into powers of two (1, 2, 4, ..., remainder) reducing item count from C to O(log C).",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 16: Greedy Algorithms vs Dynamic Programming (pp. 425-430)",
        keyInsight:
          "The 0/1 Knapsack problem does not exhibit the greedy-choice property: sorting by value-to-weight ratio fails because fractions of items cannot be taken.",
      },
      {
        source: "Competitive Programming 4 (Steven & Felix Halim)",
        section: "Book 1, Section 3.5: Classical Dynamic Programming Paradigms",
        keyInsight:
          "When capacity W is huge (W <= 10^9) but values are small (sum V <= 10^5), invert the DP state: dp[v] represents the minimum weight required to achieve value v.",
      },
    ],
    conceptualTheory: `### Space Reduction: Why Loop Direction Dictates Invariants

#### 1. The 0/1 Knapsack Backwards Iteration Invariant
The standard 2D recurrence considers each item $i$ and capacity $w$:
$$dp[i][w] = \\max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i])$$

Notice that $dp[i][w]$ depends only on row $i-1$ at index $w$ and at a smaller index $w - wt[i]$.
If we collapse the table into a single 1D array $dp[w]$ and **iterate backwards** ($w = W \\dots wt[i]$):
\`\`\`cpp
for (int i = 0; i < n; i++) {
    for (int w = W; w >= wt[i]; w--) {
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    }
}
\`\`\`
- When evaluating $dp[w]$, the value $dp[w - wt[i]]$ has **not yet been overwritten** in the current loop iteration. It still holds the state from item $i-1$!
- This mathematically guarantees that item $i$ is included at most **once**.

---

#### 2. The Unbounded Knapsack Forward Iteration Invariant
When an infinite supply of each item is available:
$$dp[w] = \\max(dp[w], dp[w - wt[i]] + val[i])$$
Iterating **forwards** ($w = wt[i] \\dots W$):
- When computing $dp[w]$, the state $dp[w - wt[i]]$ has already incorporated item $i$.
- This correctly allows item $i$ to be selected multiple times.

---

#### 3. Bounded Knapsack via Binary Powers Decomposition
If item $i$ has weight $w_i$, value $v_i$, and count $C_i$:
- Naive expansion into $C_i$ separate items takes $O(W \\sum C_i)$ time.
- Decompose $C_i$ into powers of two: $1, 2, 4, 8, \\dots, 2^k$, and the remainder $R = C_i - (2^{k+1}-1)$.
- **Mathematical Lemma**: Any integer $x \\in [0, C_i]$ can be uniquely formed by a subset sum of these bundles!
- This reduces item count from $C_i$ to $\\lfloor \\log_2 C_i \\rfloor + 1$, accelerating runtime to $O(W \\sum \\log C_i)$.

---

#### 4. Dual Knapsack (Huge Capacity $W \\le 10^9$, Small Values)
When $W = 10^9$, standard capacity DP exceeds memory and time limits.
- Swap definition: $dp[v] =$ **minimum weight** required to achieve total value $v$.
- Base case: $dp[0] = 0$, all others $\\infty$.
- Recurrence: $dp[v] = \\min(dp[v], dp[v - val[i]] + wt[i])$.
- Final Answer: $\\max \\{ v \\mid dp[v] \\le W \\}$.`,
    variations: [
      {
        title: "0/1 Knapsack (1D Space O(W))",
        explanation: "Each item used at most once. Iterate capacity backwards from W down to wt[i].",
        formula: "dp[w] = max(dp[w], dp[w - wt[i]] + val[i])",
      },
      {
        title: "Unbounded Knapsack",
        explanation: "Infinite supply of each item. Iterate capacity forwards from wt[i] up to W.",
        formula: "dp[w] = max(dp[w], dp[w - wt[i]] + val[i])",
      },
      {
        title: "Subset Sum with Bitset Acceleration",
        explanation: "Determine reachability of weights using std::bitset. Achieves 64x speedup through bitwise word parallelism.",
        formula: "dp |= (dp << wt[i])",
        codeSnippet: `bitset<100001> dp; dp[0] = 1; for (int x : weights) dp |= (dp << x);`,
      },
      {
        title: "Dual Knapsack (Value-Based)",
        explanation: "For W <= 10^9 and sum(V) <= 10^5, minimize weight to achieve value v.",
        formula: "dp[v] = min(dp[v], dp[v - val[i]] + wt[i])",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 1000, W <= 10^5, items have weight and value",
        cue: "Standard 0/1 knapsack with backwards iteration.",
      },
      {
        triggerConstraint: "W <= 10^9, sum of values <= 10^5",
        cue: "Dual Knapsack: state is value, value is min weight.",
      },
      {
        triggerConstraint: "N <= 40, W <= 10^18",
        cue: "Meet-in-the-Middle: Split array into two halves of size 20, sort, and binary search.",
      },
    ],
    stepByStepStrategy: [
      "1. Analyze Capacity Size: If W <= 10^5, use standard weight DP. If W is huge but V is small, use dual value DP.",
      "2. Verify Item Multiplicity: 0/1 (backwards loop), Unbounded (forwards loop), or Bounded (binary bundle splitting).",
      "3. Zero-Initialize Reachability: If finding exact target sum, initialize dp with -INF (except dp[0] = 0).",
      "4. Optimize Space: Always compress to 1D vector of size W + 1.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>
#include <bitset>

using namespace std;

// 1. Classical 0/1 Knapsack with 1D O(W) Space Compression
long long knapsack01(int W, const vector<int>& wt, const vector<long long>& val) {
    int n = wt.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}

// 2. Dual Knapsack for Huge Capacity W <= 10^9, Small Total Value <= 10^5
int knapsackDual(long long maxW, const vector<long long>& wt, const vector<int>& val) {
    int n = wt.size();
    int maxVal = 0;
    for (int v : val) maxVal += v;

    const long long INF = 1e18;
    vector<long long> dp(maxVal + 1, INF);
    dp[0] = 0;

    for (int i = 0; i < n; i++) {
        for (int v = maxVal; v >= val[i]; v--) {
            if (dp[v - val[i]] != INF) {
                dp[v] = min(dp[v], dp[v - val[i]] + wt[i]);
            }
        }
    }

    for (int v = maxVal; v >= 0; v--) {
        if (dp[v] <= maxW) return v;
    }
    return 0;
}

// 3. Fast Subset Sum Reachability with std::bitset (64x bitwise speedup)
bool subsetSumBitset(int target, const vector<int>& weights) {
    bitset<200005> dp;
    dp[0] = 1;
    for (int w : weights) {
        dp |= (dp << w);
    }
    return dp[target];
}`,
    pitfalls: [
      "Forward Loop in 0/1 Knapsack: Accidental forward iteration converts 0/1 knapsack into unbounded knapsack by reusing the current item.",
      "Large Capacity Memory Explosion: Declaring vector<vector<int>> dp(1000, vector<int>(1000000)) exhausts memory. Use 1D vector.",
      "Unbounded Loop Bounds: Ensure loop terminates at wt[i] to prevent negative array indexing out of bounds.",
    ],
    practiceProblems: [
      { name: "Knapsack 1 & 2 (AtCoder Educational DP Contest)", rating: 1200, url: "https://atcoder.jp/contests/dp/tasks/dp_d" },
      { name: "Book Shop (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1158" },
      { name: "Money Sums (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1745" },
      { name: "Dima and Salad", rating: 1600, url: "https://codeforces.com/problemset/problem/366/C" },
    ],
  },

  // =========================================================================
  // 11. BITMASK DP
  // =========================================================================
  {
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
          "Bitwise operations allow representing an entire subset of {0, 1, ..., N-1} in a single 32-bit integer, transitioning in O(1) via fast CPU bitwise ALU instructions.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 10: Bit Manipulation (pp. 97-104)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Sum Over Subsets (SOS DP): computes the sum of a function over all submasks in O(N * 2^N) time using multi-dimensional prefix sums, replacing naive O(3^N) iteration.",
      },
      {
        source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
        section: "Chapter 10: Exponential Algorithms & State Compression",
        keyInsight:
          "Submask iteration trick (sub = (sub - 1) & mask) guarantees visiting all submasks of all masks in exactly 3^N total operations by the Binomial Theorem.",
      },
    ],
    conceptualTheory: `### Bitmask Operations & Subset Iteration

#### 1. Bitwise Subset Bijection
Any subset $S \\subseteq \\{0, 1, \\dots, N-1\\}$ maps injectively to an integer $\\text{mask} \\in [0, 2^N - 1]$:
$$\\text{mask} = \\sum_{i \\in S} 2^i$$
- **Test membership $i \\in S$**: \`(mask & (1 << i)) != 0\`
- **Add element $i$ to $S$**: \`mask | (1 << i)\`
- **Remove element $i$ from $S$**: \`mask & ~(1 << i)\`
- **Toggle element $i$**: \`mask ^ (1 << i)\`
- **Count subset size $|S|$**: \`__builtin_popcount(mask)\`
- **Least significant set bit**: \`mask & (-mask)\`
- **Index of lowest set bit**: \`__builtin_ctz(mask)\`

---

#### 2. Submask Enumeration in $O(3^N)$
To iterate over every valid submask $s$ of a given mask in decreasing order:
\`\`\`cpp
for (int mask = 0; mask < (1 << n); mask++) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
        // sub is a strict submask of mask!
    }
}
\`\`\`
**Mathematical Proof of $O(3^N)$ Complexity**:
For a mask with $k$ set bits, it has exactly $2^k$ submasks.
$$\\sum_{k=0}^N \\binom{N}{k} 2^k = (1 + 2)^N = 3^N$$
For $N = 15$, $3^{15} \\approx 1.4 \\times 10^7$ operations, completing in ~0.05 seconds!

---

#### 3. Traveling Salesperson Problem (TSP) in $O(N^2 \\cdot 2^N)$
Let $dp[\\text{mask}][u]$ be the minimum cost to visit all cities in subset $\\text{mask}$, ending at city $u$:
$$dp[\\text{mask} | (1 \\ll v)][v] = \\min(dp[\\text{mask} | (1 \\ll v)][v], dp[\\text{mask}][u] + \\text{dist}[u][v])$$
Base Case: $dp[1 \\ll 0][0] = 0$.

---

#### 4. Sum Over Subsets (SOS DP) in $O(N \\cdot 2^N)$
Given an array $A$ of size $2^N$, compute for every mask:
$$F[\\text{mask}] = \\sum_{i \\subseteq \\text{mask}} A[i]$$
- Naive submask iteration takes $O(3^N)$.
- **SOS DP Idea**: Treat the bitmask as an $N$-dimensional hypercube $\{0, 1\}^N$. Compute prefix sums sequentially along each bit dimension $0 \\dots N-1$:
\`\`\`cpp
for (int i = 0; i < n; i++) {
    for (int mask = 0; mask < (1 << n); mask++) {
        if (mask & (1 << i)) {
            F[mask] += F[mask ^ (1 << i)];
        }
    }
}
\`\`\`
Runs in exactly $N \\cdot 2^N$ operations. For $N = 20$, $20 \\cdot 10^6 \\approx 2 \\times 10^7$ steps!`,
    variations: [
      {
        title: "TSP & Path Reconstruction",
        explanation: "dp[mask][u] = optimal cost visiting set mask ending at u. Reconstruct using predecessor pointers.",
        formula: "dp[mask | (1 << v)][v] = min(dp[...], dp[mask][u] + dist[u][v])",
      },
      {
        title: "Submask Iteration in O(3^N)",
        explanation: "Iterates through all submasks of all masks using bitwise decrement-and-mask trick.",
        formula: "sub = (sub - 1) & mask",
      },
      {
        title: "Sum Over Subsets (SOS DP)",
        explanation: "Multi-dimensional prefix sums along bit dimensions in O(N * 2^N).",
        formula: "F[mask] += F[mask ^ (1 << i)]",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "N <= 20, permutation, matching or assignment problem",
        cue: "2^20 is ~10^6, fits comfortably within standard 1.0s limit.",
      },
      {
        triggerConstraint: "Bitwise queries over all submasks for N <= 22",
        cue: "SOS DP in O(N * 2^N).",
      },
    ],
    stepByStepStrategy: [
      "1. Verify N <= 20: If N >= 25, 2^N memory and runtime will TLE/MLE. Look for meet-in-the-middle or branch-and-bound.",
      "2. Parenthesize Bitwise Expressions: Always write (1 << i) and (mask & (1 << i)) with parentheses due to operator precedence rules.",
      "3. Use 1D Flattening: For N=22, storing vector<vector<int>> exceeds 256MB. Use a flat 1D array dp[mask * N + u].",
      "4. Initialize Sentinel: Fill dp table with INF; set base state dp[1 << start][start] = 0.",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

const int INF = 1e9;

// 1. Traveling Salesperson Problem (TSP) in O(N^2 * 2^N) with Path Reconstruction
pair<int, vector<int>> solveTSP(int n, const vector<vector<int>>& dist) {
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    vector<vector<int>> parent(1 << n, vector<int>(n, -1));

    dp[1][0] = 0; // Start at city 0 with mask (1 << 0)

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] == INF) continue;

            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                int next_mask = mask | (1 << v);
                int new_cost = dp[mask][u] + dist[u][v];

                if (new_cost < dp[next_mask][v]) {
                    dp[next_mask][v] = new_cost;
                    parent[next_mask][v] = u;
                }
            }
        }
    }

    // Connect back to starting city 0
    int final_mask = (1 << n) - 1;
    int best_cost = INF;
    int last_city = -1;

    for (int u = 0; u < n; u++) {
        if (dp[final_mask][u] != INF && dist[u][0] != INF) {
            if (dp[final_mask][u] + dist[u][0] < best_cost) {
                best_cost = dp[final_mask][u] + dist[u][0];
                last_city = u;
            }
        }
    }

    // Reconstruct tour path
    vector<int> tour;
    int curr_mask = final_mask;
    int curr_city = last_city;

    while (curr_city != -1) {
        tour.push_back(curr_city);
        int prev = parent[curr_mask][curr_city];
        curr_mask ^= (1 << curr_city);
        curr_city = prev;
    }
    reverse(tour.begin(), tour.end());
    tour.push_back(0); // Return to start

    return {best_cost, tour};
}

// 2. Sum Over Subsets (SOS DP) in O(N * 2^N)
vector<int> computeSOS(int n, vector<int> F) {
    for (int i = 0; i < n; i++) {
        for (int mask = 0; mask < (1 << n); mask++) {
            if (mask & (1 << i)) {
                F[mask] += F[mask ^ (1 << i)];
            }
        }
    }
    return F;
}`,
    pitfalls: [
      "Operator Precedence Bug: Writing 1 << n - 1 evaluates as 1 << (n - 1) due to subtraction taking precedence over shift. Always write (1 << n) - 1.",
      "Memory Allocation Overhead: Allocating vectors inside nested loops kills performance. Pre-allocate flat vectors outside loops.",
      "Base Mask Starting State: Forgetting that visiting city 0 requires mask = (1 << 0) = 1, not 0.",
    ],
    practiceProblems: [
      { name: "Matching (AtCoder Educational DP Contest)", rating: 1500, url: "https://atcoder.jp/contests/dp/tasks/dp_o" },
      { name: "Hamiltonian Flights (CSES)", rating: 1700, url: "https://cses.fi/problemset/task/1690" },
      { name: "Counting Tilings (CSES)", rating: 2000, url: "https://cses.fi/problemset/task/2181" },
      { name: "Fish", rating: 1800, url: "https://codeforces.com/problemset/problem/16/E" },
    ],
  },

  // =========================================================================
  // 12. MINIMUM SPANNING TREE (KRUSKAL & PRIM)
  // =========================================================================
  {
    slug: "mst-kruskal",
    name: "Minimum Spanning Tree (Kruskal & Prim)",
    category: "Graph Theory",
    difficulty: "INTERMEDIATE",
    description:
      "Greedy edge selection paired with Disjoint Set Union (DSU) or Priority Queues building spanning trees of minimal total weight in O(E log E). Encompasses the Cut Property, Second-Best MST, and Minimax paths.",
    timeComplexity: "O(E log E) or O(E log V)",
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
          "Generic MST Theorem: Let (S, V - S) be any cut of G that respects a set A of edges. If (u, v) is a light edge crossing the cut, then (u, v) is safe for A.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 15: Spanning Trees (pp. 143-150)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "The Cycle Property states that the strictly heaviest edge in any cycle of G cannot belong to any Minimum Spanning Tree.",
      },
    ],
    conceptualTheory: `### The Cut Property & Cycle Property Proofs

#### 1. The Cut Property (Foundation of Kruskal & Prim)
**Theorem**: Let $G = (V, E)$ be a connected, undirected graph with real-valued edge weights. Let $S \\subset V$ be a non-empty subset of vertices. If an edge $e = (u, v)$ has strictly minimal weight among all edges crossing the cut $(S, V \\setminus S)$, then $e$ **must belong to every MST** of $G$.

**Proof by Contradiction**:
Suppose an MST $T$ does not contain $e$. Adding $e$ to $T$ creates a unique cycle $C$. Because $e$ crosses the cut $(S, V \\setminus S)$, the cycle $C$ must contain at least one other edge $e'$ crossing the cut. Since $e$ is strictly minimal across the cut:
$$w(e) < w(e')$$
Removing $e'$ and inserting $e$ yields a new spanning tree $T' = T \\cup \\{e\\} \\setminus \\{e'\\}$ with:
$$w(T') = w(T) - w(e') + w(e) < w(T)$$
This contradicts the assumption that $T$ was minimal! Hence $e \\in T$.

---

#### 2. Kruskal vs Prim: Algorithmic Comparison
| Metric | Kruskal's Algorithm | Prim's Algorithm |
| :--- | :--- | :--- |
| **Strategy** | Edge-centric: Sort all edges globally | Vertex-centric: Grow connected component from start node |
| **Data Structure** | Disjoint Set Union (DSU) | Priority Queue (\`std::priority_queue\`) |
| **Time Complexity** | $O(E \\log E)$ | $O(E \\log V)$ |
| **Best Used When** | Sparse graphs ($E \\approx V$), disconnected components | Dense graphs ($E \\approx V^2$), adjacency matrix |

---

#### 3. Second-Best Minimum Spanning Tree
To find the spanning tree with the second smallest total weight:
1. Compute the primary MST $T$ with weight $W(T)$.
2. For each non-tree edge $e = (u, v) \\notin T$:
   - Adding $e$ to $T$ creates a cycle.
   - Find the maximum weight edge $e_{\\max}$ on the unique tree path between $u$ and $v$ (using LCA / Binary Lifting).
   - Candidate weight: $W(T) - w(e_{\\max}) + w(e)$.
3. The minimum candidate weight across all non-tree edges gives the exact Second-Best MST!`,
    variations: [
      {
        title: "Standard Kruskal's Algorithm",
        explanation: "Greedy edge sorting + DSU in O(E log E). Handles disconnected components by producing Minimum Spanning Forests.",
        formula: "Sort edges ascending, unite components with DSU until V-1 edges chosen.",
      },
      {
        title: "Prim's Algorithm with Priority Queue",
        explanation: "Expands frontier from root node in O(E log V). Ideal for dense networks.",
      },
      {
        title: "Maximum Spanning Tree",
        explanation: "Sort edges descending by weight to find tree maximizing connectivity capacity.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Connect all nodes with minimum total cost or wire length",
        cue: "Standard Minimum Spanning Tree.",
      },
      {
        triggerConstraint: "Minimize the maximum edge weight on any path between u and v",
        cue: "Minimax Path: The path in the MST minimizes the maximum edge weight!",
      },
    ],
    stepByStepStrategy: [
      "1. Edge Struct: Define struct Edge { int u, v; long long weight; } and overload operator<.",
      "2. 64-bit Accumulator: Always accumulate spanning tree weights into long long to avoid 32-bit overflow.",
      "3. Disconnected Guard: Check if edges_added == V - 1. If not, the graph is disconnected.",
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
      "Disconnected Graph Output: Returning sum when edges_used < n - 1 reports wrong results for disconnected graphs.",
      "32-Bit Overflow on Total Weight: Spanning tree edge sums easily exceed 2 * 10^9. Always use long long.",
    ],
    practiceProblems: [
      { name: "Road Reparation (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1675" },
      { name: "Building Roads (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1666" },
      { name: "Design Tutorial: Make It Connected", rating: 1600, url: "https://codeforces.com/problemset/problem/472/D" },
    ],
  },

  // =========================================================================
  // 13. TREE DYNAMIC PROGRAMMING & REROOTING
  // =========================================================================
  {
    slug: "tree-dp",
    name: "Tree Dynamic Programming & Rerooting (In-Out DP)",
    category: "Dynamic Programming",
    difficulty: "INTERMEDIATE",
    description:
      "Subtree aggregation and all-pairs tree metrics in linear O(N) time using two-pass depth-first search traversals. Foundation for USACO Gold and Codeforces Div. 2 D/E problems.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    prerequisites: ["1d-dp", "bfs-dfs"],
    dependents: ["binary-lifting-lca"],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "Tree DP & All-Roots Distances",
        url: "https://usaco.guide/gold/all-roots",
        keyInsight:
          "Tree rerooting computes answers for all N nodes as roots in O(N) by transitioning from root u to child v: subtract v's subtree contribution from u, then merge u as v's new child.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 14: Tree Algorithms — Tree DP (pp. 135-142)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "A rooted tree is naturally directed acyclic away from the root. A bottom-up post-order traversal resolves subtrees, while a top-down pre-order pass redistributes parent context.",
      },
    ],
    conceptualTheory: `### The 2-Pass Rerooting Architecture

#### 1. Pass 1: Bottom-Up Post-Order DFS
Root the tree arbitrarily at node $1$.
Compute for every node $u$:
- $sz[u] = 1 + \\sum_{v \\in children(u)} sz[v]$
- $dp[u] = \\sum_{v \\in children(u)} (dp[v] + sz[v])$ (Sum of distances from $u$ to all nodes in its subtree).

---

#### 2. Pass 2: Top-Down Pre-Order Rerooting DFS
When moving the root from parent $u$ to child $v$:
- The distance to all nodes in $v$'s subtree decreases by $1$: $-sz[v]$.
- The distance to all nodes outside $v$'s subtree increases by $1$: $+(N - sz[v])$.
- **Rerooting Formula**:
  $$\\text{ans}[v] = \\text{ans}[u] - sz[v] + (N - sz[v]) = \\text{ans}[u] + N - 2 \\cdot sz[v]$$
This allows answering queries for **all $N$ potential roots** in strictly $O(N)$ total time!`,
    variations: [
      {
        title: "Subtree Aggregation (Tree Distances II)",
        explanation: "Calculates sum of distances from every node to all other nodes in O(N).",
        formula: "ans[v] = ans[u] + N - 2 * sz[v]",
      },
      {
        title: "Maximum Subtree Path (Tree Distances I)",
        explanation: "Calculates maximum distance from each node to any other node using top two deepest branches.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Tree with N <= 2 * 10^5, calculate metric for every vertex as the root",
        cue: "Rerooting DP in 2 DFS passes.",
      },
    ],
    stepByStepStrategy: [
      "1. First DFS: Root at 1, compute subtree sizes and initial answer for root 1.",
      "2. Second DFS: Propagate answer from parent to child using rerooting delta formula.",
      "3. 64-Bit Distances: Sum of distances in a line graph reaches O(N^2) ~ 4 * 10^{10}. Use long long.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

int n;
vector<vector<int>> adj;
vector<long long> sz_tree;
vector<long long> ans;

void dfs1(int u, int p) {
    sz_tree[u] = 1;
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs1(v, u);
        sz_tree[u] += sz_tree[v];
        ans[1] += (ans[v] + sz_tree[v]);
    }
}

void dfs2(int u, int p) {
    for (int v : adj[u]) {
        if (v == p) continue;
        ans[v] = ans[u] + n - 2 * sz_tree[v];
        dfs2(v, u);
    }
}

vector<long long> treeDistances(int totalNodes, const vector<pair<int, int>>& edges) {
    n = totalNodes;
    adj.assign(n + 1, {});
    sz_tree.assign(n + 1, 0);
    ans.assign(n + 1, 0);

    for (const auto& e : edges) {
        adj[e.first].push_back(e.second);
        adj[e.second].push_back(e.first);
    }

    dfs1(1, 0);
    dfs2(1, 0);

    return ans;
}`,
    pitfalls: [
      "Stack Overflow on Deep Trees: In linear trees, recursion depth is N = 2 * 10^5. Increase stack size or write iterative traversal.",
      "Double Counting Edge Lengths: Forgetting to subtract the child subtree before adding parent context.",
    ],
    practiceProblems: [
      { name: "Tree Distances I (CSES)", rating: 1400, url: "https://cses.fi/problemset/task/1132" },
      { name: "Tree Distances II (CSES)", rating: 1500, url: "https://cses.fi/problemset/task/1133" },
      { name: "Subtree (AtCoder Educational DP Contest)", rating: 1800, url: "https://atcoder.jp/contests/dp/tasks/dp_v" },
    ],
  },

  // =========================================================================
  // 14. BINARY LIFTING & LOWEST COMMON ANCESTOR
  // =========================================================================
  {
    slug: "binary-lifting-lca",
    name: "Binary Lifting & Lowest Common Ancestor (LCA)",
    category: "Tree Algorithms",
    difficulty: "INTERMEDIATE",
    description:
      "Sparse table on trees precomputing 2^k-th ancestors in O(N log N). Answers LCA, k-th ancestor, and tree-path range queries in O(log N) time.",
    timeComplexity: "O(N log N) build, O(log N) query",
    spaceComplexity: "O(N log N)",
    prerequisites: ["tree-dp"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Platinum)",
        section: "Binary Lifting & LCA",
        url: "https://usaco.guide/plat/bin-lift",
        keyInsight:
          "Precomputing powers-of-two ancestors allows jumping up the tree in O(log N) by decomposing any distance into its binary representation.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 18: Tree Queries — Lowest Common Ancestor (pp. 167-172)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Distance between any two tree nodes u and v is computed via LCA: dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)].",
      },
    ],
    conceptualTheory: `### Binary Lifting Invariant & LCA Algorithm

#### 1. Precomputing the Sparse Table
Define $up[u][k]$ as the $2^k$-th ancestor of node $u$:
$$up[u][0] = \\text{parent}[u]$$
$$up[u][k] = up[up[u][k-1]][k-1] \\quad \\text{for } 1 \\le k < \\log_2 N$$

---

#### 2. Querying LCA in $O(\\log N)$
1. **Depth Equalization**: If $depth[u] < depth[v]$, swap $u$ and $v$. Jump $u$ upwards by the binary bits of $(depth[u] - depth[v])$ so that $depth[u] = depth[v]$.
2. **Early Exit**: If $u == v$, return $u$.
3. **Simultaneous Binary Jumps**: For $k = \\log_2 N - 1 \\dots 0$:
   - If $up[u][k] \\ne up[v][k]$, jump both: $u = up[u][k]$, $v = up[v][k]$.
4. The LCA is the direct parent: $up[u][0]$.`,
    variations: [
      {
        title: "K-th Ancestor Query",
        explanation: "Jump node u upward by k levels in O(log k) using binary decomposition.",
      },
      {
        title: "Tree Path Min/Max Query",
        explanation: "Maintain parallel table max_edge[u][k] storing heaviest edge to 2^k ancestor.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Tree with Q <= 2 * 10^5 path distance queries",
        cue: "Binary lifting LCA in O(log N) per query.",
      },
    ],
    stepByStepStrategy: [
      "1. DFS Setup: Compute depth and direct parent for each node in initial DFS.",
      "2. Table Construction: Fill up[u][k] for k from 1 to LOG-1.",
      "3. Distance Invariant: Use depth[u] + depth[v] - 2 * depth[lca].",
    ],
    codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

struct TreeLCA {
    int n, LOG;
    vector<int> depth;
    vector<vector<int>> up;

    TreeLCA(int n, const vector<vector<int>>& adj, int root = 1) : n(n) {
        LOG = 31 - __builtin_clz(n) + 1;
        depth.assign(n + 1, 0);
        up.assign(n + 1, vector<int>(LOG, 0));
        dfs(root, 0, 0, adj);
    }

    void dfs(int u, int p, int d, const vector<vector<int>>& adj) {
        depth[u] = d;
        up[u][0] = p;
        for (int k = 1; k < LOG; k++) {
            up[u][k] = (up[u][k - 1] == 0) ? 0 : up[up[u][k - 1]][k - 1];
        }
        for (int v : adj[u]) {
            if (v != p) dfs(v, u, d + 1, adj);
        }
    }

    int getLCA(int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        for (int k = LOG - 1; k >= 0; k--) {
            if (depth[u] - (1 << k) >= depth[v]) u = up[u][k];
        }
        if (u == v) return u;
        for (int k = LOG - 1; k >= 0; k--) {
            if (up[u][k] != up[v][k]) {
                u = up[u][k];
                v = up[v][k];
            }
        }
        return up[u][0];
    }

    int getDist(int u, int v) {
        return depth[u] + depth[v] - 2 * depth[getLCA(u, v)];
    }
};`,
    pitfalls: [
      "LOG Sizing: If LOG is too small (e.g. 15 for N=10^5), ancestors will jump to 0. Use LOG = 20 for N <= 5 * 10^5.",
    ],
    practiceProblems: [
      { name: "Company Queries I & II (CSES)", rating: 1400, url: "https://cses.fi/problemset/task/1687" },
      { name: "Distance Queries (CSES)", rating: 1500, url: "https://cses.fi/problemset/task/1135" },
      { name: "Fools and Roads", rating: 1900, url: "https://codeforces.com/problemset/problem/191/C" },
    ],
  },

  // =========================================================================
  // 15. MODULAR ARITHMETIC & COMBINATORICS
  // =========================================================================
  {
    slug: "modular-arithmetic",
    name: "Modular Arithmetic, Fermat's Inverse & Combinatorics (nCr)",
    category: "Number Theory & Math",
    difficulty: "BEGINNER",
    description:
      "Core mathematical engine powering competitive programming: binary exponentiation in O(log P), modular inverse via Fermat's Little Theorem, and O(1) combinations via precomputed factorials.",
    timeComplexity: "O(log P) power, O(1) query after O(N) precomputation",
    spaceComplexity: "O(N)",
    prerequisites: [],
    dependents: ["string-hashing"],
    literatureReferences: [
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 21: Number Theory — Modular Arithmetic (pp. 197-204)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Division under modulo M is achieved by multiplying by the modular multiplicative inverse: A / B = A * B^(M-2) (mod M) by Fermat's Little Theorem for prime M.",
      },
      {
        source: "Introduction to Algorithms (CLRS)",
        section: "Chapter 31: Number-Theoretic Algorithms (pp. 906-930)",
        keyInsight:
          "Extended Euclidean Algorithm computes integers x and y such that a*x + b*y = gcd(a, b), providing inverses even when modulo M is non-prime.",
      },
    ],
    conceptualTheory: `### The Algebra of Congruence Classes

#### 1. Fundamental Modular Identities
$$(A + B) \\pmod M = ((A \\pmod M) + (B \\pmod M)) \\pmod M$$
$$(A - B) \\pmod M = ((A \\pmod M) - (B \\pmod M) + M) \\pmod M$$
$$(A \\cdot B) \\pmod M = ((A \\pmod M) \\cdot (B \\pmod M)) \\pmod M$$

---

#### 2. Division & Fermat's Little Theorem
Division $\\frac{A}{B} \\pmod M$ is defined as $A \\cdot B^{-1} \\pmod M$, where $B \\cdot B^{-1} \\equiv 1 \\pmod M$.
If $M$ is a prime number and $\\gcd(B, M) = 1$:
$$B^{M-1} \\equiv 1 \\pmod M \\implies B \\cdot B^{M-2} \\equiv 1 \\pmod M$$
Therefore, the modular inverse is:
$$B^{-1} \\equiv B^{M-2} \\pmod M$$

---

#### 3. Combinatorics $\\binom{N}{K}$ in $O(1)$ Time
Precompute factorials $fact[i] = i! \\pmod M$ and inverse factorials $invFact[i] = (i!)^{-1} \\pmod M$ in $O(N)$:
$$\\binom{N}{K} = \\frac{N!}{K!(N-K)!} \\equiv fact[N] \\cdot invFact[K] \\cdot invFact[N-K] \\pmod M$$`,
    variations: [
      {
        title: "Binary Modular Exponentiation",
        explanation: "Computes (A^B) % M in O(log B) steps by decomposing B into binary powers.",
        formula: "power(a, b, m)",
      },
      {
        title: "Linear Inverses in O(N)",
        explanation: "Computes all inverses from 1 to N in linear time: inv[i] = M - (M/i) * inv[M%i] % M.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Answers required modulo 10^9+7 or 998244353",
        cue: "Use modular arithmetic templates.",
      },
      {
        triggerConstraint: "Choosing K items from N items with N <= 10^6",
        cue: "Precompute factorial and inverse factorial tables.",
      },
    ],
    stepByStepStrategy: [
      "1. Negative Modulo Guard: Always write (a - b % M + M) % M to ensure non-negative remainder in C++.",
      "2. 64-bit Casting: Multiply two 32-bit integers as 1LL * a * b % M to avoid 32-bit overflow before modulo.",
      "3. Boundary Checks: In nCr(n, k), return 0 if k < 0 or k > n.",
    ],
    codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

const int MOD = 1e9 + 7;

long long power(long long base, long long exp) {
    long long res = 1;
    base %= MOD;
    while (exp > 0) {
        if (exp % 2 == 1) res = (res * base) % MOD;
        base = (base * base) % MOD;
        exp /= 2;
    }
    return res;
}

long long modInverse(long long n) {
    return power(n, MOD - 2);
}

struct Combinatorics {
    int maxN;
    vector<long long> fact, invFact;

    Combinatorics(int n) : maxN(n), fact(n + 1), invFact(n + 1) {
        fact[0] = 1;
        invFact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = (fact[i - 1] * i) % MOD;
        invFact[n] = modInverse(fact[n]);
        for (int i = n - 1; i >= 1; i--) invFact[i] = (invFact[i + 1] * (i + 1)) % MOD;
    }

    long long nCr(int n, int r) {
        if (r < 0 || r > n) return 0;
        return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
    }
};`,
    pitfalls: [
      "32-Bit Overflow During Multiplication: (a * b) % MOD overflows if a and b are ints near 10^9. Always cast to 1LL.",
      "Division by Modulo: Writing a / b % MOD is wrong. Must write a * modInverse(b) % MOD.",
    ],
    practiceProblems: [
      { name: "Binomial Coefficients (CSES)", rating: 1200, url: "https://cses.fi/problemset/task/1715" },
      { name: "Creating Strings II (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1716" },
      { name: "Santa's Bot", rating: 1600, url: "https://codeforces.com/problemset/problem/1279/D" },
    ],
  },

  // =========================================================================
  // 16. STRING HASHING
  // =========================================================================
  {
    slug: "string-hashing",
    name: "Polynomial Rolling Hashing & Double Modulo",
    category: "String Algorithms",
    difficulty: "INTERMEDIATE",
    description:
      "Maps arbitrary substrings into integer hash values enabling O(1) substring equivalence queries and O(log N) Longest Common Prefix (LCP) checks after O(N) precomputation.",
    timeComplexity: "O(N) build, O(1) query",
    spaceComplexity: "O(N)",
    prerequisites: ["modular-arithmetic", "prefix-sums"],
    dependents: [],
    literatureReferences: [
      {
        source: "USACO Guide (Gold)",
        section: "String Hashing",
        url: "https://usaco.guide/gold/string-hashing",
        keyInsight:
          "Polynomial rolling hash defines H(S) = sum(S[i] * B^i) mod M. Substring hashes are obtained in O(1) similarly to prefix sums.",
      },
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 26: String Algorithms — String Hashing (pp. 235-240)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Always use double hashing (two coprime moduli) or 64-bit random bases to defeat anti-hash test cases constructed by test creators.",
      },
    ],
    conceptualTheory: `### Polynomial Rolling Hash & Substring Invariant

#### 1. The Polynomial Hash Definition
Given a string $S$ of length $N$, a base $B$ (e.g. 313), and prime modulo $M$ (e.g. $10^9+7$):
$$H(S) = \\sum_{i=0}^{N-1} S[i] \\cdot B^i \\pmod M$$
Precompute prefix hashes $pref[i]$ and base powers $powB[i]$:
$$pref[0] = 0$$
$$pref[i] = (pref[i-1] + S[i-1] \\cdot B^{i-1}) \\pmod M$$

---

#### 2. Substring Hash Query in $O(1)$
To query hash of substring $S[L \\dots R]$ (0-indexed, inclusive):
$$H(S[L \\dots R]) \\cdot B^L = (pref[R+1] - pref[L] + M) \\pmod M$$
To compare two substrings $S[L_1 \\dots R_1]$ and $S[L_2 \\dots R_2]$ without division:
$$\\text{Hash}_1 \\cdot B^{L_2} \\equiv \\text{Hash}_2 \\cdot B^{L_1} \\pmod M$$

---

#### 3. Birthday Paradox & Double Hash Defense
For a single modulo $M = 10^9+7$, after evaluating $\\sqrt{M} \\approx 3 \\times 10^4$ substrings, collision probability exceeds 50%!
Using a **Double Hash** with two distinct primes $(M_1 = 10^9+7, M_2 = 10^9+9)$ expands the hash space to $M_1 \\cdot M_2 \\approx 10^{18}$, making collisions practically impossible.`,
    variations: [
      {
        title: "Double Modulo Hash",
        explanation: "Pairs hashes under 10^9+7 and 10^9+9 to prevent collisions.",
      },
      {
        title: "LCP via Binary Search + Hashing",
        explanation: "Finds Longest Common Prefix between two substrings in O(log N) by binary searching on matching hash length.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Find matching substrings or repeated patterns in O(1) query time",
        cue: "Polynomial Rolling Hash.",
      },
    ],
    stepByStepStrategy: [
      "1. Pick Coprime Bases: Choose odd random base B > alphabet size (e.g. 313 or 353).",
      "2. Precompute Powers: Precompute base powers powB[i] up to N.",
      "3. Pair Hashes: Store hashes as std::pair<long long, long long>.",
    ],
    codeTemplate: `#include <vector>
#include <string>
#include <iostream>

using namespace std;

struct DoubleHash {
    int n;
    const long long B1 = 313, M1 = 1e9 + 7;
    const long long B2 = 353, M2 = 1e9 + 9;
    vector<long long> p1, p2, h1, h2;

    DoubleHash(const string& s) : n(s.size()), p1(n + 1, 1), p2(n + 1, 1), h1(n + 1, 0), h2(n + 1, 0) {
        for (int i = 0; i < n; i++) {
            p1[i + 1] = (p1[i] * B1) % M1;
            p2[i + 1] = (p2[i] * B2) % M2;
            h1[i + 1] = (h1[i] + s[i] * p1[i]) % M1;
            h2[i + 1] = (h2[i] + s[i] * p2[i]) % M2;
        }
    }

    pair<long long, long long> getHash(int l, int r) {
        long long val1 = (h1[r + 1] - h1[l] + M1) % M1;
        long long val2 = (h2[r + 1] - h2[l] + M2) % M2;
        val1 = (val1 * p1[n - l]) % M1;
        val2 = (val2 * p2[n - l]) % M2;
        return {val1, val2};
    }
};`,
    pitfalls: [
      "Fixed Base Hacking: Using base B = 256 or 31 on Codeforces leads to anti-hash hack tests. Choose a large random base.",
    ],
    practiceProblems: [
      { name: "String Matching (CSES)", rating: 1300, url: "https://cses.fi/problemset/task/1753" },
      { name: "Finding Borders (CSES)", rating: 1400, url: "https://cses.fi/problemset/task/1732" },
      { name: "Password", rating: 1700, url: "https://codeforces.com/problemset/problem/126/B" },
    ],
  },

  // =========================================================================
  // 17. TRIE & BINARY XOR TRIE
  // =========================================================================
  {
    slug: "trie",
    name: "Trie & Binary XOR Trie",
    category: "Data Structures & Strings",
    difficulty: "INTERMEDIATE",
    description:
      "Prefix tree automation supporting O(|S|) string insertion and retrieval, and binary bitwise Trie for Maximum XOR Pair and Subarray queries in O(log MAX_A).",
    timeComplexity: "O(|S|) per query, O(30) per XOR operation",
    spaceComplexity: "O(nodes * alphabet_size)",
    prerequisites: ["bitmask-dp"],
    dependents: [],
    literatureReferences: [
      {
        source: "Competitive Programmer's Handbook (Antti Laaksonen)",
        section: "Chapter 26: String Algorithms — Trie (pp. 241-244)",
        url: "https://cses.fi/book/book.pdf",
        keyInsight:
          "Binary 0/1 Trie allows solving Maximum XOR queries greedily from the most significant bit (MSB) down to LSB in O(30) steps.",
      },
      {
        source: "USACO Guide (Platinum)",
        section: "Maximum XOR Subarray via Trie",
        url: "https://usaco.guide/plat/xor-trie",
        keyInsight:
          "Combining prefix XOR array with a binary Trie reduces finding the maximum XOR contiguous subarray to a series of point queries.",
      },
    ],
    conceptualTheory: `### Binary XOR Trie & Greedy Bitwise Choice

#### 1. The Greedy MSB Choice Property
To maximize $X \\oplus Y$ for a fixed integer $X$:
- Represent all candidates $Y$ as 30-bit binary paths in a binary tree (depth 29 down to 0).
- For each bit position $b = 29 \\dots 0$:
  - Let $b_X$ be the $b$-th bit of $X$.
  - The ideal bit in $Y$ to maximize XOR is $1 - b_X$ (yielding $1$ in the XOR result).
  - If a child branch with bit $1 - b_X$ exists, follow it and add $2^b$ to the answer!
  - Otherwise, take the branch $b_X$.
- Since higher bits strictly outweigh all smaller bits ($2^b > \\sum_{i=0}^{b-1} 2^i$), this greedy choice is **globally optimal**!

---

#### 2. Maximum XOR Contiguous Subarray
Recall that for any subarray $A[l \\dots r]$:
$$\\bigoplus_{i=l}^r A[i] = P[r] \\oplus P[l-1]$$
where $P[i] = A[0] \\oplus \\dots \\oplus A[i]$.
- Insert prefix XOR values $P[k]$ into the Trie sequentially.
- For each $r$, query $P[r]$ against all previously inserted prefix XORs to find $\\max (P[r] \\oplus P[l-1])$ in $O(30)$ steps! Total runtime is $O(30 \\cdot N)$.`,
    variations: [
      {
        title: "Standard Dictionary Character Trie",
        explanation: "Supports insert, exact search, and prefix matching on strings in O(|S|).",
      },
      {
        title: "Binary 0/1 XOR Trie",
        explanation: "Finds pair or subarray maximizing bitwise XOR in O(30) per query.",
      },
    ],
    recognitionSignals: [
      {
        triggerConstraint: "Find two elements maximizing A[i] ^ A[j]",
        cue: "Binary 0/1 XOR Trie.",
      },
      {
        triggerConstraint: "Find contiguous subarray with maximum bitwise XOR sum",
        cue: "Prefix XORs + Binary XOR Trie.",
      },
    ],
    stepByStepStrategy: [
      "1. Bit Width: Determine maximum bit depth: for numbers up to 10^9, use 30 bits (29 down to 0). For 10^18, use 62 bits.",
      "2. Trie Array Allocation: Allocate flat 2D array next_node[MAX_NODES][2] instead of pointers for performance.",
      "3. Insert 0 First: Always insert prefix XOR = 0 into Trie before processing array elements.",
    ],
    codeTemplate: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

struct BinaryTrie {
    struct Node {
        int next[2];
        Node() { next[0] = next[1] = -1; }
    };

    vector<Node> tree;

    BinaryTrie() {
        tree.emplace_back();
    }

    void insert(int val) {
        int curr = 0;
        for (int b = 29; b >= 0; b--) {
            int bit = (val >> b) & 1;
            if (tree[curr].next[bit] == -1) {
                tree[curr].next[bit] = tree.size();
                tree.emplace_back();
            }
            curr = tree[curr].next[bit];
        }
    }

    int getMaxXOR(int val) {
        int curr = 0;
        int max_val = 0;
        for (int b = 29; b >= 0; b--) {
            int bit = (val >> b) & 1;
            int opposite = 1 - bit;
            if (tree[curr].next[opposite] != -1) {
                max_val |= (1 << b);
                curr = tree[curr].next[opposite];
            } else {
                curr = tree[curr].next[bit];
            }
        }
        return max_val;
    }
};

int maxSubarrayXOR(const vector<int>& a) {
    BinaryTrie trie;
    trie.insert(0); // Empty prefix
    int pref = 0;
    int max_xor = 0;

    for (int x : a) {
        pref ^= x;
        trie.insert(pref);
        max_xor = max(max_xor, trie.getMaxXOR(pref));
    }
    return max_xor;
}`,
    pitfalls: [
      "Missing Zero in Prefix XOR: Omitting trie.insert(0) fails when the optimal subarray starts at index 0.",
      "Insufficient Bit Depth: Using 30 bits for 64-bit values leads to wrong answers. Use 62 bits for long long.",
    ],
    practiceProblems: [
      { name: "Maximum XOR Subarray (CSES)", rating: 1600, url: "https://cses.fi/problemset/task/1655" },
      { name: "Vasiliy's Multiset", rating: 1800, url: "https://codeforces.com/problemset/problem/706/D" },
      { name: "Word Combinations (CSES)", rating: 1700, url: "https://cses.fi/problemset/task/1731" },
    ],
  },
];
