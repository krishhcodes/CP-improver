import { ConceptNode } from "../concept-node-type";

export const binarySearchAnswerConcept: ConceptNode = {
  slug: "binary-search-answer",
  name: "Binary Search on Monotonic Predicate",
  category: "Algorithms",
  difficulty: "BEGINNER",
  description:
    "Technique that transforms optimization problems ('find min/max X') into decision problems ('is X feasible?'), cutting the search space by half per iteration.",
  timeComplexity: "O(log(High - Low) * T(check))",
  spaceComplexity: "O(1) auxiliary",
  prerequisites: ["two-pointers"],
  dependents: ["segment-tree"],
  literatureReferences: [
    {
      source: "USACO Guide (Silver)",
      section: "Binary Search on Answer & Monotonic Functions",
      url: "https://usaco.guide/silver/binary-search",
      keyInsight:
        "Whenever a problem asks for 'minimum possible maximum' or 'maximum possible minimum', inverting the question to a boolean feasibility check P(x) is almost always monotonic.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 3: Sorting and Searching — Finding the Optimal Solution (pp. 31-34)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "The search domain must partition into two contiguous regions: all False followed by all True, or vice versa. The binary search locates the unique transition boundary.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 5: Monotonic Predicates & Floating Point Bisection",
      keyInsight:
        "For floating-point binary search, loop for a fixed number of iterations (e.g. 80-100 iterations) rather than testing while (high - low > eps) to guarantee numerical stability.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 3.3: Bisection and Ternary Search",
      keyInsight:
        "When the objective function is unimodal (strictly increasing then strictly decreasing) rather than monotonic, ternary search divides the search space into thirds in O(log3 N).",
    },
  ],
  conceptualTheory: `### Monotonic Predicate Inversion & Invariants

#### 1. Inversion from Optimization to Verification
Direct construction of the optimal value $X^*$ is often intractable ($NP$-hard or complex greedy combinations).
However, testing feasibility of a candidate $x$:
$$P(x) = \\begin{cases} \\text{True} & \\text{if candidate } x \\text{ is achievable} \\\\ \\text{False} & \\text{otherwise} \\end{cases}$$
is often easily solvable using a greedy sweep in $O(N)$.

---

#### 2. The Monotonic Partition Pattern
Binary search succeeds if and only if $P(x)$ is monotonic across $[\\text{Low}, \\text{High}]$:

\`\`\`
Type 1 (Minimize X):  False, False, False, [True], True, True ...
Type 2 (Maximize X):  True,  True,  [True], False, False, False ...
\`\`\`

#### 3. Invariant-Preserving Pointer Maintenance
For minimizing $X$ where $P(x)$ is $\\text{False} \\dots \\text{True}$:
- Maintain invariant: $\\text{Low}-1$ is always False, $\\text{High}+1$ is always True.
- Set $\\text{mid} = \\text{Low} + (\\text{High} - \\text{Low}) / 2$.
- If $P(\\text{mid}) == \\text{True}$: $\\text{ans} = \\text{mid}, \\text{High} = \\text{mid} - 1$.
- If $P(\\text{mid}) == \\text{False}$: $\\text{Low} = \\text{mid} + 1$.`,
  variations: [
    {
      title: "Minimize Maximum (False...True)",
      explanation: "Allocate resources such that the maximum load is minimized. Find the first True.",
      formula: "high = mid - 1 when P(mid) is true",
      codeSnippet: `long long low = 1, high = 1e18, ans = high;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) { ans = mid; high = mid - 1; }
    else { low = mid + 1; }
}`,
      timeComplexity: "O(log(High - Low) * T(check))",
      spaceComplexity: "O(1)",
    },
    {
      title: "Maximize Minimum (True...False)",
      explanation: "Place C cows in N stalls such that minimum distance between any two cows is maximized. Find the last True.",
      formula: "low = mid + 1 when P(mid) is true",
      codeSnippet: `long long low = 1, high = 1e18, ans = low;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) { ans = mid; low = mid + 1; }
    else { high = mid - 1; }
}`,
      timeComplexity: "O(log(High - Low) * T(check))",
      spaceComplexity: "O(1)",
    },
    {
      title: "Continuous / Floating-Point Binary Search",
      explanation: "Search over continuous domain [low, high] for exact real answer. Run for 80-100 iterations.",
      formula: "mid = (low + high) / 2.0",
      codeSnippet: `double low = 0.0, high = 1e9;
for (int iter = 0; iter < 100; iter++) {
    double mid = (low + high) / 2.0;
    if (check(mid)) high = mid;
    else low = mid;
}`,
      timeComplexity: "O(100 * T(check))",
      spaceComplexity: "O(1)",
    },
    {
      title: "Ternary Search on Unimodal Functions",
      explanation: "For functions with a single local extremum, evaluate mid1 and mid2 to discard one-third of the interval.",
      formula: "mid1 = l + (r - l) / 3, mid2 = r - (r - l) / 3",
      timeComplexity: "O(log_{1.5}(High - Low) * T(f))",
      spaceComplexity: "O(1)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Problem asks for 'maximum possible minimum' or 'minimum possible maximum'",
      cue: "Signature keyword phrasing for Binary Search on Answer.",
    },
    {
      triggerConstraint: "Given a target value X, checking whether X is possible can be verified greedily in O(N)",
      cue: "Invert from optimization to decision. Binary search on candidate value in O(N log(Range)).",
    },
    {
      triggerConstraint: "Continuous float answer required with precision up to 10^-6",
      cue: "Run floating-point binary search with 80 fixed iterations to prevent infinite loop on EPS.",
    },
  ],
  stepByStepStrategy: [
    "1. Identify the Search Bounds: Determine the absolute minimum possible answer (Low) and maximum possible answer (High). Ensure High is large enough (e.g. 10^18 for sum of elements).",
    "2. Design the Monotonic Predicate: Write `bool check(long long mid)` that returns whether `mid` is achievable using a greedy simulation.",
    "3. Prevent Integer Overflow in Mid: Always compute `mid = low + (high - low) / 2` instead of `(low + high) / 2`.",
    "4. Track the Best Answer: Maintain an `ans` variable updated whenever `check(mid)` succeeds, avoiding off-by-one boundary return bugs.",
    "5. Check Corner Cases: Verify that Low and High themselves evaluate correctly under the predicate.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <numeric>
#include <algorithm>

using namespace std;

// Example: Factory Machines (CSES 1620)
// Given n machines, where machine i takes t[i] seconds to make a product,
// find the minimum time needed to make t products.
bool canProduce(long long time, const vector<int>& k, long long target_products) {
    long long total_products = 0;
    for (int t : k) {
        total_products += (time / t);
        if (total_products >= target_products) return true; // Prevent overflow
    }
    return total_products >= target_products;
}

long long minTimeToProduce(const vector<int>& machines, long long target) {
    long long low = 1;
    // Upper bound: fastest machine alone makes all products
    long long fastest = *min_element(machines.begin(), machines.end());
    long long high = fastest * target;
    long long ans = high;

    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (canProduce(mid, machines, target)) {
            ans = mid;
            high = mid - 1; // Try to find smaller valid time
        } else {
            low = mid + 1;  // Need more time
        }
    }

    return ans;
}`,
  pitfalls: [
    "Overflow in High Bound: Setting High = 10^18 and computing (low + high) in 32-bit int wraps to negative. Always use 64-bit long long for all bounds and mid.",
    "Overflow in Predicate Accumulation: Summing (time / t) can exceed 64-bit int if time is large and t is 1. Early-exit `if (total >= target) return true;`.",
    "Infinite Floating Point Loop: Writing `while (high - low > 1e-9)` can loop infinitely due to IEEE 754 floating point precision limits. Always use a fixed iteration count: `for (int iter = 0; iter < 100; iter++)`.",
    "Non-Monotonic Predicate: Applying binary search to a problem where feasibility can fluctuate (e.g. True, False, True) produces completely erroneous results.",
  ],
  practiceProblems: [
    {
      name: "Factory Machines (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1620",
      platform: "CSES",
      hint: "Binary search on time T. Each machine produces floor(T / k[i]) items.",
    },
    {
      name: "Array Division (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1085",
      platform: "CSES",
      hint: "Binary search on the maximum subarray sum. Check greedily in O(N) if the array can be partitioned into <= K subarrays.",
    },
    {
      name: "Aggressive Cows (SPOJ / CSES)",
      rating: 1300,
      url: "https://www.spoj.com/problems/AGGRCOW/",
      platform: "SPOJ",
      hint: "Binary search on the minimum distance D. Greedily place the next cow at the first stall >= last_pos + D.",
    },
    {
      name: "Magic Powder (Codeforces)",
      rating: 1400,
      url: "https://codeforces.com/problemset/problem/670/D1",
      platform: "Codeforces",
      hint: "Binary search on the number of cookies baked. Check if magic powder can cover the ingredient deficits.",
    },
  ],
};
