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
};
