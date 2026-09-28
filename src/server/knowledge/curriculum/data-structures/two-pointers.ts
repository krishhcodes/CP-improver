import { ConceptNode } from "../concept-node-type";

export const twoPointersConcept: ConceptNode = {
  slug: "two-pointers",
  name: "Two Pointers & Sliding Window",
  category: "Algorithms",
  difficulty: "BEGINNER",
  description:
    "Linear-time iteration technique leveraging monotonicity across array indices to process subarray intervals, pair sums, and dynamic windows in amortized O(N).",
  timeComplexity: "O(N) or O(N log N) with initial sort",
  spaceComplexity: "O(1) auxiliary",
  prerequisites: ["prefix-sums"],
  dependents: ["binary-search-answer"],
  literatureReferences: [
    {
      source: "USACO Guide (Silver)",
      section: "Two Pointers Technique & Sliding Window",
      url: "https://usaco.guide/silver/two-pointers",
      keyInsight:
        "When condition f(L, R) is monotonic in both endpoints, incrementing R only ever requires advancing L forward, never backward. This yields amortized O(N) total runtime.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 8: Amortized Analysis — 2SUM and Subarray Sum (pp. 77-80)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Two pointers achieves linear time through amortized analysis: even if an inner while-loop runs multiple times for a single R, the left pointer advances at most N times across the entire algorithm.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 7: Monotonicity & Pointer Invariants",
      keyInsight:
        "Monotonicity is the prerequisite for two pointers. If shrinking the window can turn an invalid state into a valid state, two pointers applies.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 3.2.2: The Two Pointers Paradigm in Contests",
      keyInsight:
        "Used for sorting-based 2-Sum, 3-Sum (with outer loop), and multiset window tracking with frequency arrays.",
    },
  ],
  conceptualTheory: `### Mathematical Monotonicity & Amortized Complexity

#### 1. The Monotonicity Property
A problem is solvable via Two Pointers if the window validity predicate $V(l, r)$ satisfies monotonicity:
$$\\text{If } [l, r] \\text{ is invalid (e.g. sum } > K), \\text{ then } [l, r'] \\text{ is invalid for all } r' > r.$$
$$\\text{If } [l, r] \\text{ is invalid, advancing } l \\to l+1 \\text{ strictly moves toward validity.}$$

Because the right pointer $r$ sweeps from $0$ to $N-1$ and the left pointer $l$ only moves forward:
$$\\sum \\Delta r = N, \\quad \\sum \\Delta l \\le N$$
$$\\text{Total pointer increments} = O(N)$$

---

#### 2. Classical Archetype Comparison
| Archetype | Left Pointer $l$ | Right Pointer $r$ | Predicate Check |
| :--- | :--- | :--- | :--- |
| **Opposite Ends (2-Sum)** | Starts at $0$, moves $\\to$ | Starts at $N-1$, moves $\\leftarrow$ | $A[l] + A[r] == \\text{Target}$ |
| **Sliding Window (Sum $\\le K$)** | Starts at $0$, advances when invalid | Sweeps $0 \\dots N-1$ | $\\sum_{k=l}^r A[k] \\le K$ |
| **Longest Substring Without Repeats** | Contracted when $\\text{freq}[A[r]] > 1$ | Extended greedily | $\\text{distinct elements}$ |`,
  variations: [
    {
      title: "Opposite Ends (Sorted 2-Sum)",
      explanation: "Find two elements in sorted array summing to target X. If sum < X, increment L; if sum > X, decrement R.",
      formula: "A[L] + A[R] == Target",
      codeSnippet: `bool twoSum(const vector<int>& a, int target, int& l_out, int& r_out) {
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        long long s = 1LL * a[l] + a[r];
        if (s == target) { l_out = l; r_out = r; return true; }
        if (s < target) l++;
        else r--;
    }
    return false;
}`,
      timeComplexity: "O(N) after O(N log N) sort",
      spaceComplexity: "O(1)",
    },
    {
      title: "Dynamic Sliding Window (Max Length Subarray Sum <= K)",
      explanation: "Expands right boundary greedily. While constraint violated, contracts left boundary.",
      formula: "current_sum <= K",
      codeSnippet: `int maxSubarrayLen(const vector<int>& a, long long K) {
    int l = 0, max_len = 0;
    long long cur = 0;
    for (int r = 0; r < a.size(); r++) {
        cur += a[r];
        while (l <= r && cur > K) {
            cur -= a[l];
            l++;
        }
        max_len = max(max_len, r - l + 1);
    }
    return max_len;
}`,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    {
      title: "Fixed-Size Sliding Window of Length K",
      explanation: "Window length is strictly constant. Slide right by adding A[i] and subtracting A[i-K].",
      formula: "window_sum += a[i] - a[i - K]",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    {
      title: "Subarray with At Most K Distinct Elements",
      explanation: "Count subarrays with at most K distinct elements using frequency array; count exact K by atMost(K) - atMost(K-1).",
      formula: "exact(K) = atMost(K) - atMost(K - 1)",
      timeComplexity: "O(N)",
      spaceComplexity: "O(Distinct)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Array elements are non-negative and problem asks for contiguous subarray satisfying sum/distinct count",
      cue: "Non-negativity ensures monotonicity: growing window always increases sum. Two Pointers / Sliding Window in O(N).",
    },
    {
      triggerConstraint: "Finding pairs (i, j) with i < j satisfying an inequality after sorting",
      cue: "Sort array in O(N log N), then use opposite-ends two pointers in O(N).",
    },
    {
      triggerConstraint: "Exact count of subarrays with property P (e.g. exactly K distinct elements)",
      cue: "Apply sliding window with reduction: count(exactly K) = count(at most K) - count(at most K - 1).",
    },
  ],
  stepByStepStrategy: [
    "1. Verify Monotonicity: Confirm that adding an element never relaxes the constraint, and removing an element never tightens it.",
    "2. Outer Loop on Right Pointer: Drive the loop with `for (int r = 0; r < n; r++)`, incorporating a[r] into the running state.",
    "3. Inner While Loop on Left Pointer: Use `while (l <= r && is_invalid())` to evict a[l] and increment l.",
    "4. Update Result: Record current window metrics: valid length `(r - l + 1)` or number of valid subarrays ending at r `(r - l + 1)`.",
    "5. Empty Window Guard: Allow window to contract to `l = r + 1` if a single element a[r] already violates constraints.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

// Returns the count of subarrays whose sum is <= max_sum (all elements >= 0)
long long countSubarraysWithSumAtMost(const vector<int>& a, long long max_sum) {
    int n = a.size();
    long long count = 0;
    long long current_sum = 0;
    int l = 0;

    for (int r = 0; r < n; r++) {
        current_sum += a[r];
        while (l <= r && current_sum > max_sum) {
            current_sum -= a[l];
            l++;
        }
        // All subarrays starting from l..r and ending at r are valid
        count += (r - l + 1);
    }

    return count;
}

// 2-Sum problem: Find 1-based indices of two values summing to target
pair<int, int> findTwoSum(vector<pair<int, int>>& a, int target) {
    sort(a.begin(), a.end());
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        long long s = 1LL * a[l].first + a[r].first;
        if (s == target) return {a[l].second, a[r].second};
        if (s < target) l++;
        else r--;
    }
    return {-1, -1};
}`,
  pitfalls: [
    "Negative Array Elements: If array contains negative numbers, adding an element can decrease the sum, destroying monotonicity. Two pointers fails! Must use Prefix Sums + Hash Map or Monotonic Queue.",
    "Off-by-One in Subarray Count: Valid subarrays ending at r with left bound in [l, r] is exactly (r - l + 1), not (r - l).",
    "Missing l <= r Guard: Forgetting l <= r in the inner while loop can allow l to overshoot r when a single element exceeds threshold.",
    "Sorting Destroys Original Indices: In 2-Sum problems requiring original indices, pair values with their original 1-based index before sorting.",
  ],
  practiceProblems: [
    {
      name: "Subarray Sums I (CSES)",
      rating: 1100,
      url: "https://cses.fi/problemset/task/1660",
      platform: "CSES",
      hint: "All elements are positive. Maintain current window sum. Increment L when sum > X.",
    },
    {
      name: "Sum of Two Values (CSES)",
      rating: 1000,
      url: "https://cses.fi/problemset/task/1640",
      platform: "CSES",
      hint: "Store original indices in pairs, sort, and execute opposite-ends two pointers in O(N log N).",
    },
    {
      name: "Subarray Distinct Values (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/2428",
      platform: "CSES",
      hint: "Count subarrays with at most K distinct values using frequency map. Add (r - l + 1) at each step.",
    },
    {
      name: "They Are Everywhere (Codeforces)",
      rating: 1200,
      url: "https://codeforces.com/problemset/problem/701/C",
      platform: "Codeforces",
      hint: "Find the shortest substring containing all unique Pokemon types present in the string.",
    },
  ],
  deepExplanation: {
    intuition:
      "Imagine an elastic rubber band stretched across an array. The right boundary sweeps forward, eagerly claiming new elements. When the window becomes invalid (e.g. sum exceeds capacity or duplicates appear), the left boundary contracts inward until legality is restored. Because the left pointer never rewinds or moves backward, the two pointers traverse the array like two runners in a single lane, executing at most 2N steps in total.",
    proofOfCorrectness:
      "Amortized Potential Argument: Define potential Phi = l + r. At each iteration of the outer loop, r advances by 1 (at most N times). In the inner loop, l advances by 1 (at most N times because l <= r). Since both pointers move monotonically from 0 to N-1, the total number of operations is bounded by 2N = O(N).",
    complexityDerivation:
      "Time: O(N) when applied to an already sorted array or contiguous subarray problem. O(N log N) if an initial sorting step is required (e.g. 2-Sum). Auxiliary Space: O(1) memory since only two integer indices (l and r) and a running accumulator are maintained.",
    whenNotToUse:
      "Do NOT use two pointers if the array contains negative numbers. Negative numbers break sum monotonicity: adding an element could decrease the sum, and shrinking the left side could increase the sum! In the presence of negative values, use Prefix Sums paired with a Hash Map or Monotonic Deque.",
  },
  workedExample: {
    title: "Sliding Window Maximum Subarray Sum <= 8",
    scenario: "Array A = [2, 1, 5, 2, 8], Constraint: Sum <= 8",
    input: "A = [2, 1, 5, 2, 8], Target K = 8",
    output: "Max Subarray Length = 3 (subarray [1, 5, 2] with sum 8)",
    traceSteps: [
      { step: 1, state: "l=0, r=0, cur=2", action: "Expand r to 0, cur=2 <= 8", insight: "Valid window [2], max_len=1" },
      { step: 2, state: "l=0, r=1, cur=3", action: "Expand r to 1, cur=3 <= 8", insight: "Valid window [2, 1], max_len=2" },
      { step: 3, state: "l=0, r=2, cur=8", action: "Expand r to 2, cur=8 <= 8", insight: "Valid window [2, 1, 5], max_len=3" },
      { step: 4, state: "l=0, r=3, cur=10", action: "Expand r to 3, cur=10 > 8 (Invalid!)", insight: "Must contract left boundary" },
      { step: 5, state: "l=1, r=3, cur=8", action: "Evict A[0]=2, l advances to 1, cur=8 <= 8", insight: "Valid window [1, 5, 2], len=3, max_len=3" },
      { step: 6, state: "l=1, r=4, cur=16", action: "Expand r to 4, cur=16 > 8 (Invalid!)", insight: "Must contract left boundary repeatedly" },
      { step: 7, state: "l=2, r=4, cur=15", action: "Evict A[1]=1, l=2, cur=15 > 8", insight: "Still invalid, continue contracting" },
      { step: 8, state: "l=3, r=4, cur=10", action: "Evict A[2]=5, l=3, cur=10 > 8", insight: "Still invalid, continue contracting" },
      { step: 9, state: "l=4, r=4, cur=8", action: "Evict A[3]=2, l=4, cur=8 <= 8", insight: "Valid window [8], len=1, max_len=3" },
      { step: 10, state: "Termination", action: "Loop terminates as r reaches end", insight: "Final maximum length = 3" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Applying to Arrays with Negative Values",
      cause: "Assuming sum monotonically increases when expanding the right pointer.",
      fix: "If negative values exist, use Prefix Sums with Hash Map or Monotonic Queue.",
      wrongSnippet: "while (cur > K) { cur -= a[l++]; } // Fails if a[l] is negative!",
      correctedSnippet: "// Use Prefix Sums: pref[r] - pref[l-1] <= K via coordinate compression or map",
    },
    {
      trap: "Inner While Loop Index Overshoot",
      cause: "Omitting the `l <= r` guard when a single element is larger than the target.",
      fix: "Always include `l <= r` in the while condition to avoid left pointer exceeding right pointer.",
      wrongSnippet: "while (cur > K) { cur -= a[l++]; } // l can overshoot r when a[r] > K",
      correctedSnippet: "while (l <= r && cur > K) { cur -= a[l++]; } // Guaranteed safe bounds",
    },
    {
      trap: "Subarray Count Formula Error",
      cause: "Adding 1 per step instead of the number of valid subarrays ending at the current right pointer.",
      fix: "Every index from l to r forms a valid subarray ending at r. Add `(r - l + 1)`.",
      wrongSnippet: "total_subarrays++; // Only counts 1 subarray!",
      correctedSnippet: "total_subarrays += (r - l + 1); // Counts all valid prefixes ending at r",
    },
  ],
  pythonTemplate: `import sys

def solve():
    input = sys.stdin.readline
    
    # Example: Longest Subarray with Sum <= K
    n, k = map(int, input().split())
    a = list(map(int, input().split()))
    
    l = 0
    cur_sum = 0
    max_len = 0
    
    for r in range(n):
        cur_sum += a[r]
        while l <= r and cur_sum > k:
            cur_sum -= a[l]
            l += 1
        max_len = max(max_len, r - l + 1)
        
    print(max_len)

# 2-Sum on Sorted Array
def two_sum_sorted(a, target):
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return l, r
        elif s < target:
            l += 1
        else:
            r -= 1
    return -1, -1
`,
};
