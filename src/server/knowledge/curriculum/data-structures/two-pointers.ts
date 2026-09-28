import { ConceptNode } from "../concept-node-type";

export const twoPointersConcept: ConceptNode = {
  slug: "two-pointers",
  name: "Two Pointers & Sliding Window",
  category: "Algorithms",
  difficulty: "BEGINNER",
  description:
    "Linear-time iteration technique leveraging monotonicity across array indices to process subarray intervals, pair sums, and dynamic windows in amortized O(N). Covers sorted pair sums, subarray with given sum, longest window with constraints, and three-sum problems.",
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
  conceptualTheory: `## Two Pointers & Sliding Window: A Complete Textbook Chapter

### The Core Problem

**Problem template**: Given an array A and a property P, find all subarrays [l, r] (or pairs (l, r)) satisfying P. The naïve approach checks all O(N²) subarrays — for N = 10^5 that's 10^10 operations.

**When can we do better?** When the property P is MONOTONE: if [l, r] satisfies P, then either:
- All [l, r'] for r' < r also satisfy P (shrinking window maintains property), OR
- All [l', r] for l' > l violate P (expanding left pointer breaks property).

This monotonicity lets us use two pointers: as we advance R, we need only advance L (never go back), giving O(N) total.

---

### Archetype 1: Opposite Ends (Sorted Array Pair Sum)

**Problem**: Given a sorted array A and target T, find two indices l < r with A[l] + A[r] = T.

**Algorithm**:
- Place l = 0 (leftmost, smallest element) and r = N-1 (rightmost, largest element).
- If A[l] + A[r] == T: found! Return (l, r).
- If A[l] + A[r] < T: sum too small, need larger element → advance l++.
- If A[l] + A[r] > T: sum too large, need smaller element → retreat r--.

**Why it works**: At each step, we eliminate at least one candidate:
- If sum < T, A[l] can never pair with any r' ≤ current r to give T (all sums would be ≤ A[l] + A[r] < T). Eliminate l.
- If sum > T, A[r] can never pair with any l' ≥ current l (all sums would be ≥ A[l] + A[r] > T). Eliminate r.

**Time**: O(N) for the two-pointer scan after O(N log N) sorting.
**Space**: O(1).

**Extension — Count Pairs**:
When A[l] + A[r] == T, there might be many equal-value elements at l and r. Count: freq_l × freq_r, then advance l past all equal elements and r back past all equal elements.

---

### Archetype 2: Sliding Window (Same-Direction Pointers)

**Problem**: Find the maximum length subarray [l, r] with some property (e.g., sum ≤ K, all distinct elements, at most K distinct values).

**Algorithm**:
- Both l and r start at 0.
- Advance r: add A[r] to the window. Update window state.
- While window is INVALID (property violated): advance l, remove A[l] from window.
- Record answer (e.g., max length = r - l + 1).

**Key insight**: l NEVER moves backward. Combined with r advancing N times, the total pointer movements ≤ 2N = O(N).

**Amortized analysis**: Over the entire algorithm:
- r advances: exactly N times.
- l advances: at most N times (l ≤ r always, l starts at 0, r ends at N-1).
- Total: O(N) pointer movements, even if the inner while-loop executes many iterations in a single outer loop step.

---

### Archetype 2a: Longest Subarray with Sum ≤ K

\`\`\`
l = 0, curr_sum = 0, ans = 0
for r = 0 to N-1:
    curr_sum += A[r]
    while curr_sum > K:
        curr_sum -= A[l]
        l++
    ans = max(ans, r - l + 1)
return ans
\`\`\`

**Time**: O(N). Both l and r advance at most N times.
**Requirement**: A[i] ≥ 0 (non-negative). If elements can be negative, adding A[r] might decrease the sum — then we'd need to shrink even when sum < K. This breaks monotonicity. Use prefix sums + binary search for negative elements.

---

### Archetype 2b: Longest Substring with K Distinct Characters

\`\`\`
l = 0, freq = {}, distinct = 0, ans = 0
for r = 0 to N-1:
    if freq[A[r]] == 0: distinct++
    freq[A[r]]++
    while distinct > K:
        freq[A[l]]--
        if freq[A[l]] == 0: distinct--
        l++
    ans = max(ans, r - l + 1)
\`\`\`

**Time**: O(N). Window state (freq map + distinct count) maintained in O(1) per step.

---

### Archetype 2c: Minimum Window Subarray with Sum ≥ K

**Problem**: Find the SHORTEST contiguous subarray with sum ≥ K. (Non-negative elements.)

\`\`\`
l = 0, curr_sum = 0, ans = INF
for r = 0 to N-1:
    curr_sum += A[r]
    while curr_sum >= K:   // Contract from left as long as valid
        ans = min(ans, r - l + 1)
        curr_sum -= A[l]
        l++
return ans if ans != INF else -1
\`\`\`

---

### Archetype 3: Three-Sum

**Problem**: Find all triplets (i, j, k) with A[i] + A[j] + A[k] = 0.

**Algorithm**:
1. Sort A.
2. For each index i (outer loop, O(N)):
   - Run two-pointer (opposite ends) on A[i+1..N-1] looking for pair summing to -A[i].
   - Total: O(N) per i → O(N²) total.

This is the optimal approach for three-sum, reducing O(N³) naïve to O(N²).

---

### Archetype 4: Sliding Window Maximum (Deque)

**Problem**: For each window of size K, find the maximum element. (Not standard two-pointer, but related.)

**Algorithm**: Use a monotone deque (decreasing queue):
- Maintain deque of indices where values are decreasing.
- For each new r: pop from back all indices with A[index] ≤ A[r] (they can never be max while A[r] is in window).
- Pop from front indices outside window (index < r - K + 1).
- Front of deque = index of current window maximum.

**Time**: O(N) — each index enters and exits deque at most once.

---

### Monotonicity Check (How to Verify Two Pointers Applies)

Before applying two pointers, verify the MONOTONE WINDOW SHRINK property:

"If I remove element A[l] from the left of window [l, r], does the window become MORE likely to satisfy the property?"

- Sum ≤ K: removing A[l] (non-negative) decreases sum → more likely ≤ K. ✓
- All distinct elements: removing A[l] removes one occurrence → more likely all distinct. ✓
- Subarray with negative elements summing ≤ K: removing A[l] might increase sum (if A[l] < 0) → NOT monotone. ✗

If the property is NOT monotone: use different techniques (prefix sums + binary search, segment trees, etc.).

---

### Two Pointers on Non-Arrays

The same idea applies beyond arrays:

**Merge two sorted lists**: l pointer in list 1, r pointer in list 2. Both advance forward → O(N+M).

**Dutch National Flag (3-way partition)**: Three pointers (lo, mid, hi) for partitioning into three groups in-place O(N).

**Partitioning for quicksort**: Left and right pointers that advance inward until they cross.`,

  variations: [
    {
      title: "Opposite Ends (Sorted 2-Sum)",
      explanation: "Find two elements in sorted array summing to target X. Start with l=0, r=N-1. If sum < X: l++. If sum > X: r--. If equal: found!",
      formula: "A[L] + A[R] == Target",
      timeComplexity: "O(N) scan + O(N log N) sort",
      spaceComplexity: "O(1)",
    },
    {
      title: "Sliding Window (Max length with property)",
      explanation: "Both pointers start at 0. Advance R to expand window; advance L to shrink when property violated. Each pointer moves at most N times → O(N) total.",
      formula: "while invalid: curr_sum -= A[l]; l++",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1) or O(K) for frequency map",
    },
    {
      title: "Minimum Window Subarray",
      explanation: "Find shortest subarray with sum ≥ K. Contract from left as long as property holds, tracking minimum window length.",
      formula: "while curr_sum >= K: ans = min(ans, r-l+1); curr_sum -= A[l]; l++",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    {
      title: "Three-Sum (Outer loop + two pointers)",
      explanation: "For each element A[i], run two-pointer search for pair summing to -A[i] in the remaining sorted array. O(N²) total.",
      formula: "Fix i, two-pointer on A[i+1..N-1] for target = -A[i]",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
    },
    {
      title: "Sliding Window Maximum (Monotone Deque)",
      explanation: "Use decreasing deque of indices. For each new r: pop back all smaller values, pop front if outside window. Front = current max.",
      formula: "deque maintains decreasing values; front = max of current window",
      timeComplexity: "O(N)",
      spaceComplexity: "O(K)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Find pair (i,j) in sorted array with A[i]+A[j] = target",
      cue: "Opposite-ends two pointers. O(N) after sorting.",
    },
    {
      triggerConstraint: "Find maximum length subarray with sum ≤ K (all non-negative elements)",
      cue: "Sliding window: advance R, shrink L while sum > K. O(N).",
    },
    {
      triggerConstraint: "Count subarrays with exactly K distinct elements",
      cue: "Two-pointer: count(exactly K) = count(at most K) - count(at most K-1). Each 'at most K' is a sliding window.",
    },
    {
      triggerConstraint: "Find all triplets summing to 0 in an unsorted array",
      cue: "Sort, then outer loop + two-pointer on remaining elements. O(N²).",
    },
    {
      triggerConstraint: "Maximum of every contiguous window of size K",
      cue: "Monotone decreasing deque. O(N).",
    },
    {
      triggerConstraint: "Smallest subarray with sum ≥ K (positive elements)",
      cue: "Sliding window contracting from left while sum ≥ K, tracking minimum length. O(N).",
    },
  ],

  stepByStepStrategy: [
    "1. Verify monotonicity: 'Does shrinking the window from the left always make the property easier to satisfy?' If yes, two pointers applies.",
    "2. Decide archetype: Opposite-ends (sorted pair sums) or same-direction (subarray properties)?",
    "3. Initialize l = 0. Maintain current window state (sum, freq map, distinct count, etc.).",
    "4. Outer loop: advance r from 0 to N-1. Add A[r] to window state.",
    "5. Inner while loop: while window is invalid, remove A[l] from state, advance l.",
    "6. Record answer for current valid window [l..r] (length r-l+1, or count, etc.).",
    "7. Verify both pointers advance at most N times total → confirm O(N) complexity.",
  ],

  codeTemplate: `#include <vector>
#include <algorithm>
#include <unordered_map>
#include <iostream>
#include <climits>
#include <deque>

using namespace std;

// =========================================================
// 1. Longest Subarray with Sum <= K (Non-negative elements only)
// =========================================================
int longestSubarrayWithSumLE(const vector<int>& A, long long K) {
    int l = 0, ans = 0;
    long long curr = 0;

    for (int r = 0; r < (int)A.size(); r++) {
        curr += A[r]; // Expand window
        while (curr > K) { // Contract until valid
            curr -= A[l];
            l++;
        }
        ans = max(ans, r - l + 1); // Window [l..r] is valid
    }

    return ans;
}

// =========================================================
// 2. Shortest Subarray with Sum >= K (Non-negative elements)
// =========================================================
int shortestSubarrayWithSumGE(const vector<int>& A, long long K) {
    int l = 0, ans = INT_MAX;
    long long curr = 0;

    for (int r = 0; r < (int)A.size(); r++) {
        curr += A[r];
        // Contract from left as long as property holds
        while (curr >= K) {
            ans = min(ans, r - l + 1);
            curr -= A[l];
            l++;
        }
    }

    return ans == INT_MAX ? -1 : ans;
}

// =========================================================
// 3. Two Sum in Sorted Array (Opposite Ends)
// =========================================================
pair<int,int> twoSumSorted(const vector<int>& A, long long target) {
    int l = 0, r = (int)A.size() - 1;
    while (l < r) {
        long long s = (long long)A[l] + A[r];
        if (s == target) return {l, r};
        else if (s < target) l++;
        else r--;
    }
    return {-1, -1}; // Not found
}

// =========================================================
// 4. Longest Substring with At Most K Distinct Characters
// =========================================================
int longestSubstringKDistinct(const string& s, int K) {
    unordered_map<char, int> freq;
    int l = 0, ans = 0;

    for (int r = 0; r < (int)s.size(); r++) {
        freq[s[r]]++;
        while ((int)freq.size() > K) { // Too many distinct
            freq[s[l]]--;
            if (freq[s[l]] == 0) freq.erase(s[l]);
            l++;
        }
        ans = max(ans, r - l + 1);
    }

    return ans;
}

// =========================================================
// 5. Three-Sum: Find all triplets summing to 0 — O(N^2)
// =========================================================
vector<array<int,3>> threeSum(vector<int>& A) {
    sort(A.begin(), A.end());
    vector<array<int,3>> result;
    int n = A.size();

    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && A[i] == A[i-1]) continue; // Skip duplicates

        int l = i + 1, r = n - 1;
        while (l < r) {
            long long s = (long long)A[i] + A[l] + A[r];
            if (s == 0) {
                result.push_back({A[i], A[l], A[r]});
                while (l < r && A[l] == A[l+1]) l++;
                while (l < r && A[r] == A[r-1]) r--;
                l++; r--;
            } else if (s < 0) l++;
            else r--;
        }
    }

    return result;
}

// =========================================================
// 6. Sliding Window Maximum — O(N)
// =========================================================
vector<int> slidingWindowMax(const vector<int>& A, int K) {
    deque<int> dq; // Indices; front = max of current window
    vector<int> result;

    for (int r = 0; r < (int)A.size(); r++) {
        // Remove indices outside current window
        while (!dq.empty() && dq.front() < r - K + 1) dq.pop_front();

        // Remove smaller elements from back (they can't be max)
        while (!dq.empty() && A[dq.back()] <= A[r]) dq.pop_back();

        dq.push_back(r);

        // Window of size K: record max
        if (r >= K - 1) result.push_back(A[dq.front()]);
    }

    return result;
}`,

  pitfalls: [
    "Negative Elements in Sliding Window Sum: If array contains negative numbers, adding A[r] may DECREASE the sum below K, making the window 'valid' even after expansion. L advancing doesn't guarantee moving toward invalidity. Use prefix sums + binary search for negative arrays.",
    "Not Verifying Monotonicity: Applying two pointers to a non-monotone property gives wrong answers. Always verify: 'shrinking window from left makes property easier to satisfy.'",
    "Inner While vs If: Using `if (curr > K) { ... l++; }` instead of `while (curr > K) { ... l++; }` shrinks the window by at most 1 per R increment. Use WHILE to shrink until valid.",
    "Integer Overflow in Sum: With elements up to 10^9 and N up to 2*10^5, the window sum can reach 2*10^14. Use long long for curr_sum.",
    "3-Sum Duplicate Handling: After finding a triplet, advance l and r past all equal elements to avoid duplicate triplets in the result.",
    "Counting Exactly-K: 'Exactly K distinct elements' is NOT directly a monotone window (can't shrink to fix). Use: count(exactly K) = count(at most K) - count(at most K-1). Both 'at most K' queries are valid sliding windows.",
  ],

  practiceProblems: [
    {
      name: "Subarray Sums I (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1660",
      platform: "CSES",
      hint: "Count subarrays with exact sum S using sliding window (positive elements) or prefix sum hash map (general).",
    },
    {
      name: "Subarray Distinct Values (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/2428",
      platform: "CSES",
      hint: "Count subarrays with at most K distinct values using sliding window with frequency map.",
    },
    {
      name: "Two Sum II (LeetCode 167)",
      rating: 1100,
      url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
      platform: "LeetCode",
      hint: "Classic opposite-ends two pointers on sorted array.",
    },
    {
      name: "Maximum Sum Subarray of Size K (GFG)",
      rating: 1000,
      url: "https://practice.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1",
      platform: "GeeksForGeeks",
      hint: "Fixed-size sliding window: add right element, remove leftmost element.",
    },
    {
      name: "Nearest Cow (USACO Silver)",
      rating: 1400,
      url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=1060",
      platform: "USACO",
      hint: "Sort, then two-pointer sweep for counting valid pairs.",
    },
  ],

  deepExplanation: {
    intuition:
      `Two pointers works by exploiting a crucial insight: when we have a monotone property on windows, we NEVER need to backtrack a pointer. Once the left pointer has moved forward past index i, no future window will ever start at i again (because expanding R can only make the window "more invalid" on the left).

This "monotone progress" is the key. Imagine sliding a rubber band across an array: as you stretch the right end forward (expanding R), you may need to move the left end forward too (to keep the band from being "too stretched"). But you never need to move the left end BACKWARD. The rubber band always moves in one direction.

The amortized O(N) analysis is elegant: imagine a credit system. Each element "pays" for being added to the window (when R passes it) and for being removed from the window (when L passes it). Each element can be added and removed at most once — so the total cost is 2N = O(N), regardless of how many times the inner while-loop runs.

For three-sum: fixing one element reduces the problem to two-sum, which two-pointer solves in O(N). Doing this for each of N elements gives O(N²) total — much better than O(N³) brute force.`,

    proofOfCorrectness:
      `**Theorem (Correctness of Sliding Window for "Longest with Sum ≤ K")**: At each step, the window [l, r] is the LONGEST valid window ending at index r.

**Proof**: When r is fixed, we advance l until the window is valid. The resulting l is the SMALLEST possible left endpoint (smallest l = largest window). Why smallest? Because the while loop advances l only when the window is invalid (sum > K). It stops as soon as the window becomes valid. So l is the leftmost point that makes [l, r] valid.

**Theorem (Two Pointers Opposite Ends)**: If A[l] + A[r] < target, then A[l] cannot pair with any r' ≤ r to achieve target.

**Proof**: For any r' ≤ r: A[l] + A[r'] ≤ A[l] + A[r] < target (since array is sorted, A[r'] ≤ A[r]). So l can be safely eliminated. Similarly for r when A[l] + A[r] > target. At each step we eliminate at least one index. After N-1 eliminations (each step advances one pointer), we've either found the target or proven it doesn't exist. ✓`,

    complexityDerivation:
      `**Time Complexity**: O(N) for two-pointer scan (plus O(N log N) if sorting is needed).

**Amortized analysis**: 
- The right pointer r makes exactly N total advances (one per outer loop iteration).
- The left pointer l makes at most N total advances (l ≤ r always; l starts at 0, r ends at N-1; l can advance at most as many times as r advances, i.e., at most N times).
- Total pointer movements: ≤ 2N = O(N).
- Each advance is O(1) (array access + arithmetic).
- Total: O(N).

**For sliding window maximum (deque)**: Each index enters the deque once (from the back) and exits once (from either end). Total: 2N deque operations = O(N).

**For three-sum**: N outer iterations × O(N) two-pointer scan = O(N²).

**Space Complexity**: O(1) auxiliary for basic two pointers (excluding output). O(K) for frequency map when tracking K distinct elements.`,

    whenNotToUse:
      `**Do NOT use Two Pointers when**:
1. **Array has negative elements and you need sum queries**: Shrinking window may not monotonically bring sum toward validity. Use prefix sums + hash map or segment tree.
2. **Window validity is non-monotone**: If adding/removing an element can BOTH increase and decrease validity, the pointer never consistently moves forward.
3. **You need to find pairs in an UNSORTED array**: Two pointers requires sorted order for opposite-ends variant. Sort first (O(N log N)) or use hash map (O(N)).
4. **Fixed-size window**: If window size is fixed at K, just use a simple sliding window (add A[r], remove A[r-K]) — no need for two-pointer L logic.
5. **You need offline updates**: Two pointers is inherently online (left-to-right). For problems with arbitrary queries on arbitrary ranges, use segment tree or persistent data structures.`,
  },

  workedExample: {
    title: "Sliding Window — Longest Subarray with Sum ≤ 10",
    scenario: "A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]. Find longest subarray with sum ≤ 10.",
    input: "A = [3,1,4,1,5,9,2,6,5,3], K = 10. All elements positive — two pointers applies.",
    output: "Length = 4 (window [3,1,4,1] or [1,4,1,5] etc.).",
    traceSteps: [
      {
        step: 1,
        state: "r=0, A[0]=3",
        action: "curr=3. 3 ≤ 10, valid. ans = max(0, 0-0+1) = 1. l=0.",
        insight: "Window [3]. Length 1."
      },
      {
        step: 2,
        state: "r=1, A[1]=1",
        action: "curr=4. 4 ≤ 10. ans = 2. l=0.",
        insight: "Window [3,1]. Length 2."
      },
      {
        step: 3,
        state: "r=2, A[2]=4",
        action: "curr=8. 8 ≤ 10. ans = 3. l=0.",
        insight: "Window [3,1,4]. Length 3."
      },
      {
        step: 4,
        state: "r=3, A[3]=1",
        action: "curr=9. 9 ≤ 10. ans = 4. l=0.",
        insight: "Window [3,1,4,1]. Length 4. Best so far!"
      },
      {
        step: 5,
        state: "r=4, A[4]=5",
        action: "curr=14. 14 > 10! SHRINK: curr -= A[0]=3 → curr=11, l=1. Still >10! curr -= A[1]=1 → curr=10, l=2. Now ≤ 10! ans = max(4, 4-2+1) = max(4,3) = 4. l=2.",
        insight: "Inner while loop ran twice. Two elements removed from left. L advanced from 0 to 2."
      },
      {
        step: 6,
        state: "r=5, A[5]=9",
        action: "curr=10+9=19. SHRINK: -A[2]=4 → curr=15 (l=3). Still >10! -A[3]=1 → curr=14 (l=4). -A[4]=5 → curr=9 (l=5). Now ≤10! ans = max(4, 5-5+1) = 4. l=5.",
        insight: "A[5]=9 dominated the window. Only window [9] is valid. l jumped to r."
      },
      {
        step: 7,
        state: "r=6,7,8,9",
        action: "r=6: curr=9+2=11>10, shrink A[5]=9, l=6, curr=2. ans=max(4,2)=4. r=7: curr=2+6=8≤10, ans=max(4,2)=4. r=8: curr=8+5=13>10, shrink, ... r=9: final ans=4.",
        insight: "No window longer than 4 found. Answer = 4."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Using if instead of while for window contraction",
      cause: "Using `if (sum > K) { sum -= A[l]; l++; }` shrinks by exactly 1 per R increment. If sum was 50 and K = 10, it would take 40 outer loop iterations to get sum ≤ K — but only with `while` does it correctly shrink in one pass.",
      fix: "Always use `while (condition_invalid) { remove A[l]; l++; }` to fully contract the window.",
      wrongSnippet: "if (curr > K) { curr -= A[l]; l++; } // Only removes one element at a time!",
      correctedSnippet: "while (curr > K) { curr -= A[l++]; } // Removes all excess elements",
    },
    {
      trap: "Applying Two Pointers to Negative-Element Arrays",
      cause: "With negative elements, removing A[l] (which might be negative) can INCREASE the sum, making the window MORE invalid — the opposite of what we need for monotone shrinking.",
      fix: "For general arrays (with negatives) and sum queries: use prefix sums + hash map (to count subarrays with exact sum) or prefix sums + binary search (for inequalities, requires sorted prefix sums = non-negative elements).",
      wrongSnippet: "A = [3, -10, 4], K=5. Window [3,-10,4] sum=-3<5 valid. Remove 3: sum=-6<5 still valid? No monotone shrink here!",
      correctedSnippet: "For negative arrays: use prefix sums hash map. For sum==K: count pairs (l,r) with pref[r]-pref[l]==K using map.",
    },
    {
      trap: "Forgetting to Handle Duplicate Triplets in Three-Sum",
      cause: "If A = [-1, -1, 2, 2], fixing i=0 (A[0]=-1) and finding triplet (-1, -1, 2), then fixing i=1 (A[1]=-1) would find the same triplet again.",
      fix: "Skip duplicates: after processing index i, advance i while A[i] == A[i+1]. Similarly for l and r after finding a valid triplet.",
      wrongSnippet: "for (int i = 0; i < n-2; i++) { /* find pairs */ } // Gives duplicate triplets!",
      correctedSnippet: "for (int i = 0; i < n-2; i++) { if (i > 0 && A[i]==A[i-1]) continue; /* skip dup */ }",
    },
  ],

  pythonTemplate: `import sys
from collections import defaultdict
from typing import List, Tuple, Optional

def longest_subarray_sum_le(A: List[int], K: int) -> int:
    """
    Longest subarray with sum <= K. Elements must be NON-NEGATIVE.
    Two pointers: advance R, shrink L while sum > K.
    O(N) time, O(1) space.
    """
    l, curr, ans = 0, 0, 0
    for r, val in enumerate(A):
        curr += val
        while curr > K:   # WHILE, not IF
            curr -= A[l]
            l += 1
        ans = max(ans, r - l + 1)
    return ans


def shortest_subarray_sum_ge(A: List[int], K: int) -> int:
    """
    Shortest subarray with sum >= K. Elements must be NON-NEGATIVE.
    O(N) time, O(1) space.
    """
    l, curr, ans = 0, 0, float('inf')
    for r, val in enumerate(A):
        curr += val
        while curr >= K:
            ans = min(ans, r - l + 1)
            curr -= A[l]
            l += 1
    return ans if ans != float('inf') else -1


def two_sum_sorted(A: List[int], target: int) -> Optional[Tuple[int, int]]:
    """
    Find pair in sorted array summing to target. O(N).
    Returns (l, r) indices or None if not found.
    """
    l, r = 0, len(A) - 1
    while l < r:
        s = A[l] + A[r]
        if s == target:
            return (l, r)
        elif s < target:
            l += 1
        else:
            r -= 1
    return None


def longest_k_distinct(s: str, K: int) -> int:
    """
    Longest substring with at most K distinct characters.
    O(N) time, O(K) space.
    """
    freq = defaultdict(int)
    l, ans = 0, 0
    for r, ch in enumerate(s):
        freq[ch] += 1
        while len(freq) > K:
            freq[s[l]] -= 1
            if freq[s[l]] == 0:
                del freq[s[l]]
            l += 1
        ans = max(ans, r - l + 1)
    return ans


def three_sum(A: List[int]) -> List[List[int]]:
    """
    Find all unique triplets summing to 0. O(N^2).
    """
    A.sort()
    result = []
    n = len(A)
    for i in range(n - 2):
        if i > 0 and A[i] == A[i-1]:
            continue  # Skip duplicates
        l, r = i + 1, n - 1
        while l < r:
            s = A[i] + A[l] + A[r]
            if s == 0:
                result.append([A[i], A[l], A[r]])
                while l < r and A[l] == A[l+1]: l += 1
                while l < r and A[r] == A[r-1]: r -= 1
                l += 1; r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return result


def sliding_window_max(A: List[int], K: int) -> List[int]:
    """
    Maximum of every window of size K using monotone deque. O(N).
    """
    from collections import deque
    dq = deque()  # Indices, decreasing values
    result = []
    for r, val in enumerate(A):
        while dq and dq[-1] < r - K + 1:
            dq.popleft()
        while dq and A[dq[-1]] <= val:
            dq.pop()
        dq.append(r)
        if r >= K - 1:
            result.append(A[dq[0]])
    return result


if __name__ == '__main__':
    input = sys.stdin.readline
    n, k = map(int, input().split())
    A = list(map(int, input().split()))
    print(longest_subarray_sum_le(A, k))
`,
};
