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
  conceptualTheory: `## Binary Search on Answer: A Complete Textbook Chapter

### The Core Insight: Optimization to Verification (The "Flipping" Paradigm)

Many optimization problems in competitive programming present formidable challenges when approached directly:
> *"What is the minimum maximum speed required to finish a race in $T$ seconds?"*
> *"What is the maximum minimum distance between $C$ cows placed in $N$ stalls?"*
> *"What is the minimum capacity of a conveyor belt to ship all packages in $D$ days?"*

Trying to construct the optimal answer greedily or via dynamic programming often fails because choices at step $i$ depend globally on future choices.
However, notice what happens when we **flip the question on its head**:
Instead of asking: *"What is the exact optimal value $X$?"*
We ask: *"Is it possible to complete the task with value $X$?"* (A simple **YES or NO decision question**).

#### The Monotone Partition Property
If the predicate $P(X) = \text{isPossible}(X)$ is **monotonic**:
- For **Minimization Problems**: If it is possible to achieve the task with resource budget $X$, it is automatically possible for ANY larger budget $X' \ge X$:
  \`\`\`
  Search Space:  [ Low ......................................... High ]
  Predicate P:     False   False   False   TRUE    TRUE    TRUE    TRUE
                                           ↑
                                     First True = Minimum Feasible Answer
  \`\`\`
- For **Maximization Problems**: If it is possible to achieve minimum distance $X$, any smaller distance $X' \le X$ is also feasible:
  \`\`\`
  Search Space:  [ Low ......................................... High ]
  Predicate P:     TRUE    TRUE    TRUE    FALSE   FALSE   FALSE   FALSE
                                   ↑
                             Last True = Maximum Feasible Answer
  \`\`\`

By verifying that $P(X)$ is monotonic, the problem of finding the optimum transforms into **finding the boundary in a sorted boolean array**!
We evaluate $P(\text{mid})$:
- In $O(\log(\text{Search Range}))$ steps, we pinpoint the exact optimal value!
- Reduces complexity from $O(\text{Range} \times \text{Cost})$ to $O(\log(\text{Range}) \times \text{Cost})$.

---

### The Invariant-Based Binary Search Templates

Off-by-one errors and infinite loops are the bane of binary search. Following these strict invariant templates eliminates off-by-one bugs forever:

#### Template 1: Closed Interval with Explicit \`ans\` Variable (Recommended)
This is the safest, most readable, and most bulletproof template in contest environments:

**For Minimization (Find the First True / Smallest Feasible Value)**:
\`\`\`cpp
long long low = min_possible, high = max_possible;
long long ans = high;

while (low <= high) {
    long long mid = low + (high - low) / 2; // Prevents overflow!
    if (check(mid)) {
        ans = mid;        // mid is feasible, record it
        high = mid - 1;   // Try to find a smaller feasible answer
    } else {
        low = mid + 1;    // mid is too small, must search higher
    }
}
return ans;
\`\`\`

**For Maximization (Find the Last True / Largest Feasible Value)**:
\`\`\`cpp
long long low = min_possible, high = max_possible;
long long ans = low;

while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) {
        ans = mid;        // mid is feasible, record it
        low = mid + 1;    // Try to find a larger feasible answer
    } else {
        high = mid - 1;   // mid is too large, must search lower
    }
}
return ans;
\`\`\`

#### Why \`low + (high - low) / 2\` Instead of \`(low + high) / 2\`?
If $low$ and $high$ are $10^{18}$ (common when searching over time or distances), computing $low + high$ produces $2 \times 10^{18}$, which overflows signed 64-bit integers (\`LLONG_MAX\` $\approx 9.22 \times 10^{18}$ is safe, but in 32-bit signed ints $10^9 + 10^9 > 2.14 \times 10^9$ causes signed integer overflow and negative mid values!).
\`low + (high - low) / 2\` is mathematically identical and **never overflows**.

---

### The 4 Canonical Binary Search Archetypes

#### Archetype 1: Minimize the Maximum (Resource Partitioning)
- **Examples**: CSES Factory Machines, LeetCode Split Array Largest Sum, Painter's Partition Problem.
- **Problem**: Divide $N$ tasks among $K$ workers such that the maximum workload assigned to any single worker is minimized.
- **Predicate $P(X)$**: *"Can all tasks be completed such that no worker does more than $X$ work?"*
- **Greedy Verification**: Iterate through the tasks sequentially. Add tasks to the current worker until adding the next task exceeds $X$. When it does, assign the next task to a new worker. If the total workers needed $\le K$, return \`True\`; else \`False\`.

#### Archetype 2: Maximize the Minimum (Separation Distance)
- **Examples**: CSES Aggressive Cows, USACO Social Distancing.
- **Problem**: Place $C$ cows into $N$ stalls such that the minimum distance between any two cows is as large as possible.
- **Predicate $P(X)$**: *"Can we place $C$ cows such that every pair is at least $X$ units apart?"*
- **Greedy Verification**: Sort the stall positions. Always place the first cow in the first stall. For each subsequent cow, place it in the earliest stall whose coordinate is $\ge \text{last\_stall} + X$. If at least $C$ cows are placed, return \`True\`; else \`False\`.

#### Archetype 3: Fractional Programming (Optimal Ratio Maximization)
- **Problem**: Given $N$ items with value $V_i$ and weight $W_i$, select $K$ items to maximize the ratio $\frac{\sum V_i}{\sum W_i}$.
- **Algebraic Transformation**:
  $$\frac{\sum V_i}{\sum W_i} \ge X \iff \sum V_i \ge X \sum W_i \iff \sum (V_i - X \cdot W_i) \ge 0$$
- **Verification in O(N log N)**:
  For a candidate ratio $X$, compute $score_i = V_i - X \cdot W_i$ for each item. Sort the scores in descending order and sum the top $K$. If the sum $\ge 0$, then ratio $X$ is achievable!

#### Archetype 4: Continuous / Floating-Point Binary Search
- **Problem**: Find an answer in the real numbers (floating-point domain), e.g. finding coordinates or physics simulations.
- **The Golden Rule**: **NEVER use \`while (high - low > 1e-9)\` in competitive programming!**
  Due to IEEE 754 floating-point precision limits and rounding inaccuracies, $high - low$ might never become less than $10^{-9}$, causing an **Infinite Loop (Time Limit Exceeded)**!
- **The Correct Pattern (Fixed Iterations)**:
\`\`\`cpp
double low = 0.0, high = 1e9;
for (int iter = 0; iter < 100; iter++) {
    double mid = low + (high - low) / 2.0;
    if (check(mid)) high = mid;
    else low = mid;
}
return low;
\`\`\`
**Why 100 iterations?**
Each iteration halves the interval. After 100 iterations:
$$\text{Interval Width} = \frac{10^9}{2^{100}} \approx \frac{10^9}{1.26 \times 10^{30}} \approx 10^{-21}$$
This guarantees maximum double-precision accuracy with zero chance of an infinite loop!

---

### Ternary Search (For Unimodal Functions)

What if the function is NOT monotonic, but **unimodal** (strictly increases to a peak, then strictly decreases, or vice-versa)?
Binary search fails because the derivative changes sign. **Ternary Search** finds the global extremum in $O(\log_3 N)$:

#### How It Works
Divide the interval $[L, R]$ into three equal segments using two midpoints:
$$m_1 = L + \frac{R - L}{3}, \quad m_2 = R - \frac{R - L}{3}$$
Compare $f(m_1)$ and $f(m_2)$:
- If maximizing: if $f(m_1) < f(m_2)$, the peak cannot be in $[L, m_1]$. We can discard the entire first third: \`low = m1\`!
- If $f(m_1) \ge f(m_2)$, the peak cannot be in $[m_2, R]$. We can discard the entire last third: \`high = m2\`!
Each iteration reduces the search space by a factor of $\frac{2}{3}$!

\`\`\`cpp
while (high - low > 2) {
    int m1 = low + (high - low) / 3;
    int m2 = high - (high - low) / 3;
    if (f(m1) < f(m2)) low = m1;
    else high = m2;
}
long long ans = f(low);
for (int i = low + 1; i <= high; i++) ans = max(ans, f(i));
return ans;
\`\`\`

---

### Contest Checklist & Common Pitfalls

1. **Upper Bound Underestimation**:
   If $N = 10^5$ and each machine takes $10^9$ seconds, the answer can reach $10^{14}$ or $10^{18}$! Setting \`high = 1e9\` will result in wrong answers on large test cases. Always calculate the theoretical maximum: \`high = 1e18\`.
2. **Lower Bound Sizing**:
   Don't arbitrarily pick \`low = 0\` if the answer must be $\ge 1$ (e.g. non-zero capacity).
3. **Monotonicity Check**:
   Before writing binary search, explicitly ask yourself: *"If answer $X$ is feasible, does that strictly imply $X+1$ is feasible?"* If not, binary search is invalid; use DP or network flow instead.
4. **Greedy Feasibility Verification**:
   The \`check()\` function MUST be completely deterministic and correct. If your greedy check has flaws, binary search will accurately find the wrong answer!`,
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
  deepExplanation: {
    intuition:
      "When a problem asks to find an optimal number X (e.g. minimum capacity, maximum minimum distance, or minimum time) where computing X directly requires complex combinatorial logic, observe that testing whether a specific candidate X is sufficient is often trivial. If increasing X only ever makes the condition easier to satisfy (monotonicity), the solution space splits into two contiguous halves: [Impossible, ..., Impossible, Feasible, ..., Feasible]. Instead of testing all values linearly, we eliminate half the search space with a single verification probe.",
    proofOfCorrectness:
      "Let P(x) be a boolean predicate defined on domain [L, R] such that P(x) is monotonic: P(a) = True implies P(b) = True for all b > a. We maintain the invariant that the optimal threshold x* satisfies low <= x* <= high + 1. At each step, we choose mid = low + (high - low) / 2. If P(mid) is True, the minimum valid x* cannot be strictly greater than mid; hence x* in [low, mid], and we set high = mid - 1 and record ans = mid. If P(mid) is False, x* cannot be in [low, mid]; hence x* in [mid + 1, high], and we set low = mid + 1. Since mid is strictly between low and high, high - low strictly decreases at every iteration by at least factor of 2. By induction, the interval contracts to empty in ceil(log2(R - L + 1)) steps, terminating with ans = x*.",
    complexityDerivation:
      "Time: O(log2(High - Low) * T(check)). For domain [1, 10^18], log2(10^18) approx 60 iterations. With an O(N) greedy feasibility check where N = 2 * 10^5, total operations approx 60 * 2 * 10^5 = 1.2 * 10^7, executing comfortably under 100ms in C++ and under 400ms in Python. Space: O(1) auxiliary space beyond the problem input.",
    whenNotToUse:
      "Do NOT use binary search on answer if the feasibility predicate P(x) is NOT monotonic (e.g. if increasing X can cause a condition to become true, then false again). Also, if the objective function is unimodal (increases to a peak then decreases), binary search will fail; use Ternary Search or Golden Section Search instead.",
  },
  workedExample: {
    title: "CSES Factory Machines (Minimum Time to Produce T Products)",
    scenario: "Machines with work times [3, 2, 5], target T = 7 products",
    input: "machines = [3, 2, 5], target = 7 products. low = 1, high = 2 * 7 = 14",
    output: "Minimum time = 8",
    traceSteps: [
      { step: 1, state: "low = 1, high = 14", action: "mid = 7. Products: 7/3 + 7/2 + 7/5 = 2 + 3 + 1 = 6 < 7", insight: "P(7) = False (insufficient). Set low = 8." },
      { step: 2, state: "low = 8, high = 14", action: "mid = 11. Products: 11/3 + 11/2 + 11/5 = 3 + 5 + 2 = 10 >= 7", insight: "P(11) = True (feasible). ans = 11, set high = 10." },
      { step: 3, state: "low = 8, high = 10", action: "mid = 9. Products: 9/3 + 9/2 + 9/5 = 3 + 4 + 1 = 8 >= 7", insight: "P(9) = True (feasible). ans = 9, set high = 8." },
      { step: 4, state: "low = 8, high = 8", action: "mid = 8. Products: 8/3 + 8/2 + 8/5 = 2 + 4 + 1 = 7 >= 7", insight: "P(8) = True (feasible). ans = 8, set high = 7." },
      { step: 5, state: "low = 8, high = 7", action: "Terminated (low > high)", insight: "Final optimal answer = 8 time units." },
    ],
  },
  trapAnalysis: [
    {
      trap: "Integer Overflow in (low + high) / 2",
      cause: "When low and high are large (e.g. high = 10^18), low + high exceeds 64-bit signed integer maximum (~9.22 * 10^18), overflowing into negative values.",
      fix: "Always write mid = low + (high - low) / 2. In Python, integers have arbitrary precision, but in C++ this is critical.",
      wrongSnippet: "long long mid = (low + high) / 2; // Can overflow if sum > 9e18",
      correctedSnippet: "long long mid = low + (high - low) / 2; // Invariant-safe",
    },
    {
      trap: "Overflow During Feasibility Accumulation",
      cause: "Summing floor(T / k[i]) when T is up to 10^18 and k[i] = 1 can cause total products to exceed 64-bit integer limit.",
      fix: "Early exit from the accumulator loop as soon as total >= target.",
      wrongSnippet: "for (int x : machines) total += time / x; // can overflow 64-bit limit",
      correctedSnippet: "for (int x : machines) { total += time / x; if (total >= target) return true; }",
    },
    {
      trap: "Off-by-One in Integer Halving Bounds",
      cause: "Using high = mid instead of high = mid - 1 with while (low <= high), leading to infinite loops when low == high.",
      fix: "Pair while (low <= high) with high = mid - 1 and low = mid + 1, storing ans = mid on valid states.",
      wrongSnippet: "while (low < high) { int mid = (low + high) / 2; if (check(mid)) high = mid; else low = mid; }",
      correctedSnippet: "while (low <= high) { long long mid = low + (high - low)/2; if (check(mid)) { ans = mid; high = mid - 1; } else low = mid + 1; }",
    },
  ],
  pythonTemplate: `import sys

def solve():
    input = sys.stdin.readline
    n, target = map(int, input().split())
    machines = list(map(int, input().split()))

    def can_produce(t: int) -> bool:
        products = 0
        for m in machines:
            products += t // m
            if products >= target:
                return True
        return False

    # Lower bound: 1 second
    # Upper bound: fastest machine alone makes all products
    low = 1
    high = min(machines) * target
    ans = high

    while low <= high:
        mid = low + (high - low) // 2
        if can_produce(mid):
            ans = mid
            high = mid - 1  # Seek smaller feasible time
        else:
            low = mid + 1   # Need more time

    print(ans)

if __name__ == '__main__':
    solve()
`,
};
