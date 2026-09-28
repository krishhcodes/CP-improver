import { ConceptNode } from "../concept-node-type";

export const lazyPropagationConcept: ConceptNode = {
  slug: "lazy-propagation",
  name: "Segment Tree with Lazy Propagation",
  category: "Data Structures",
  difficulty: "ADVANCED",
  description:
    "Advanced range modification engine deferring node updates to descendants using pending lazy tags, enabling both range updates and range queries in O(log N).",
  timeComplexity: "O(N) build, O(log N) range update / range query",
  spaceComplexity: "O(4N)",
  prerequisites: ["segment-tree"],
  dependents: [],
  literatureReferences: [
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 2.4.4: Range Updates with Lazy Propagation",
      keyInsight:
        "When an update covers a tree node's entire segment [L, R], we update the node's stored value immediately, record a pending lazy tag for its children, and return without descending further.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 28: Segment Trees Revisited — Lazy Updates (pp. 257-260)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "A push() function must always be called before descending into children during both update() and query(). This guarantees child nodes always have fresh, consistent state.",
    },
  ],
  conceptualTheory: `### The Deferral Invariant & Tag Composition

#### 1. Why Naive Range Updates Are $O(N)$
In a standard Segment Tree, updating every element in $[L, R]$ requires visiting every leaf in that interval. For an update of width $N$, this touches $O(N)$ nodes, degrading performance to that of a naive loop.

---

#### 2. The Lazy Invariant
When an update completely encloses a node's interval $[\\text{start}, \\text{end}] \\subseteq [l, r]$:
1. Update the node's aggregate summary immediately:
   $$\\text{tree}[\\text{node}] += (\\text{end} - \\text{start} + 1) \\cdot \\text{val}$$
2. If this node is not a leaf, mark the pending delta in its lazy tag:
   $$\\text{lazy}[\\text{node}] += \\text{val}$$
3. Return immediately!

---

#### 3. The Push-Down Protocol
Before recursing into children (during both updates and queries):
\`\`\`
void push(int node, int start, int end) {
    if (lazy[node] != 0) {
        int mid = start + (end - start) / 2;
        // Apply tag to left child
        tree[2*node] += 1LL * (mid - start + 1) * lazy[node];
        lazy[2*node] += lazy[node];
        // Apply tag to right child
        tree[2*node+1] += 1LL * (end - mid) * lazy[node];
        lazy[2*node+1] += lazy[node];
        // Clear parent tag
        lazy[node] = 0;
    }
}
\`\`\``,
  variations: [
    {
      title: "Range Add, Range Sum",
      explanation: "Add V to all elements in [l, r]; query sum in [l, r]. Tree node adds (length * V).",
      formula: "tree[node] += (end - start + 1) * lazy[node]",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
    {
      title: "Range Assignment / Set, Range Sum",
      explanation: "Assign all elements in [l, r] = V. Requires boolean has_lazy flag to distinguish set(0) from no-tag.",
      formula: "tree[node] = (end - start + 1) * lazy_val",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
    {
      title: "Range Add and Range Set Combined",
      explanation: "Must establish strict algebraic priority: an assignment tag clears any preceding addition tags.",
      formula: "Range set resets add; Range add appends to set",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
    {
      title: "Affine Transformations (a * x + b)",
      explanation: "Multiply by A and add B. Maintain composite tag (A, B) where composing with (C, D) gives (A*C, B*C + D).",
      formula: "Composition: (a, b) o (c, d) = (a*c, b*c + d)",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Both Range Update [l, r] += v AND Range Query [l, r] with Q <= 2 * 10^5",
      cue: "Signature requirement for Segment Tree with Lazy Propagation.",
    },
    {
      triggerConstraint: "Range assignment [l, r] = v combined with range min/max queries",
      cue: "Lazy propagation with boolean presence flag.",
    },
  ],
  stepByStepStrategy: [
    "1. Allocate Parallel Tree and Lazy Arrays: Allocate `tree` and `lazy` both of size `4 * N`.",
    "2. Implement push(): Ensure push() applies to both children's values and accumulates into children's lazy tags before resetting parent lazy to 0.",
    "3. Call push() at Top of update() and query(): If not a full overlap or outside, call `push(node, start, end)` before recursing to children.",
    "4. Merge Backtracking: After recursive child updates, re-merge: `tree[node] = tree[2*node] + tree[2*node+1]`.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

struct LazySegmentTree {
    int n;
    vector<long long> tree;
    vector<long long> lazy;

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
    "Forgetting push() in query(): Omitting push() in query() reads outdated child values, producing incorrect answers.",
    "Missing (end - start + 1) Multiplier: Adding just `lazy[node]` to `tree[node]` instead of `lazy[node] * length` for range sum.",
    "Tag Interaction Bugs: When combining Range Set and Range Add, applying set must overwrite existing add tags, while add must append to set tags.",
  ],
  practiceProblems: [
    {
      name: "Range Update Queries (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1651",
      platform: "CSES",
      hint: "Range addition and point value queries (or Fenwick difference array).",
    },
    {
      name: "Circular RMQ (Codeforces)",
      rating: 1700,
      url: "https://codeforces.com/problemset/problem/52/C",
      platform: "Codeforces",
      hint: "Range addition with range minimum queries on a circular array (split [l, r] into two queries if l > r).",
    },
    {
      name: "The Child and Sequence (Codeforces)",
      rating: 2200,
      url: "https://codeforces.com/problemset/problem/438/D",
      platform: "Codeforces",
      hint: "Segment tree beats: range modulo x % m < x / 2 if x >= m, so elements decrease exponentially. Recurse only if max >= m.",
    },
  ],
  deepExplanation: {
    intuition:
      "When updating an entire contiguous range [L, R] with value V, naive iteration visits up to N leaves, degrading updates to O(N). Lazy propagation postpones updating descendants. When a node's interval [start, end] is completely contained inside [L, R], we update the node's aggregate immediately, record a 'lazy debt' tag on that node, and halt recursion. The descendants are only updated ('pushed') on-demand later when an operation actually needs to inspect or modify their subtrees.",
    proofOfCorrectness:
      "Theorem (Invariant Preservation under Lazy Deferral): At every step of any query or update operation, the value returned or maintained at any node is identical to executing all pending updates eagerly. Proof: Let T be the segment tree. We maintain the invariant: for every node u, either lazy[u] == 0 or tree[u] correctly accounts for all updates applied to u's interval, while u's children may be deficient by exactly lazy[u]. Whenever an operation visits u and needs to recurse into its children, the subroutine push(u) is executed first: it applies lazy[u] to tree[2u] and tree[2u+1], transfers the tag to lazy[2u] and lazy[2u+1], and resets lazy[u] = 0. Therefore, whenever any child is read or written, its parent's lazy debt has been fully discharged. By induction on recursion depth, no stale node is ever read, guaranteeing exact aggregate correctness.",
    complexityDerivation:
      "Range Update Time: O(log N). Exactly like a range query in standard segment trees, an update range [L, R] breaks into at most 2 * ceil(log2 N) canonical maximal subsegments. At each such canonical node, the lazy tag is set in O(1) without descending further. Push operations take O(1) per node. Range Query Time: O(log N), visiting <= 4 * ceil(log2 N) nodes with O(1) push calls. Space: O(4N) array storage for tree[] plus O(4N) array storage for lazy[].",
    whenNotToUse:
      "Do NOT use lazy propagation if all queries are offline after all updates have completed (use an O(N) Difference Array instead). Also, do not use lazy propagation if only point updates are performed, or if range updates are purely prefix/suffix additions with commutative queries (where dual Fenwick trees suffice with 5x less code).",
  },
  workedExample: {
    title: "Range Addition [0, 2] += 5 and Range Sum Query [1, 3]",
    scenario: "Array A = [0, 0, 0, 0] of size N = 4. Initial tree and lazy arrays all 0.",
    input: "Range Add [0, 2] += 5. Range Sum Query [1, 3].",
    output: "Query Sum [1, 3] = 10 (elements: A[1]=5, A[2]=5, A[3]=0).",
    traceSteps: [
      { step: 1, state: "Update [0, 2] += 5 at Root (node 1, [0..3])", action: "Partial overlap. Mid = 1. Recurse left to node 2 ([0..1]) and right to node 3 ([2..3])", insight: "Root cannot absorb tag directly" },
      { step: 2, state: "Left child node 2 ([0..1])", action: "Fully contained in [0..2]. tree[2] += 5 * (1 - 0 + 1) = 10. lazy[2] += 5. Return immediately", insight: "Children of node 2 are NOT visited. Saved 2 leaf visits!" },
      { step: 3, state: "Right child node 3 ([2..3])", action: "Partial overlap. Push(3) (no-op). Mid = 2. Left child node 6 ([2..2]) fully inside -> tree[6] += 5 * 1 = 5, lazy[6] += 5. Right child node 7 ([3..3]) disjoint. Return. tree[3] = 5 + 0 = 5", insight: "Canonical node 6 absorbed leaf tag" },
      { step: 4, state: "Back to Root node 1", action: "tree[1] = tree[2] + tree[3] = 10 + 5 = 15. Lazy update finished in O(log N)", insight: "Total tree sum correctly reflects 5 + 5 + 5 + 0 = 15" },
      { step: 5, state: "Query Sum [1, 3] at Root (node 1)", action: "Partial overlap. Recurse left to node 2 ([0..1]) and right to node 3 ([2..3])", insight: "Must query both subtrees" },
      { step: 6, state: "Push at Node 2 ([0..1])", action: "lazy[2] = 5 != 0. Push to node 4 ([0..0]): tree[4]+=5, lazy[4]+=5. Push to node 5 ([1..1]): tree[5]+=5, lazy[5]+=5. lazy[2] = 0", insight: "Lazy debt discharged down to children on demand!" },
      { step: 7, state: "Query left child returns", action: "Node 5 ([1..1]) returns 5. Node 4 ([0..0]) is outside query range [1..3] -> returns 0. Left sum = 5", insight: "Correctly reads updated A[1] = 5" },
      { step: 8, state: "Query right child returns", action: "Node 3 ([2..3]) overlaps: node 6 ([2..2]) returns 5, node 7 ([3..3]) returns 0. Right sum = 5", insight: "Sum = left (5) + right (5) = 10" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Forgetting push() inside query() Function",
      cause: "Only putting push() in updateRange() but omitting it in query(). Child nodes retain outdated pre-update values.",
      fix: "Always call push(node, start, end) before recursing into children in BOTH updateRange and query.",
      wrongSnippet: "long long query(...) { if (l <= start && end <= r) return tree[node]; int mid = ...; return query(2*node...) + query(2*node+1...); }",
      correctedSnippet: "long long query(...) { if (l <= start && end <= r) return tree[node]; push(node, start, end); int mid = ...; return query(2*node...) + query(2*node+1...); }",
    },
    {
      trap: "Missing Length Multiplier on Range Sum Tags",
      cause: "Writing tree[node] += val instead of tree[node] += val * (end - start + 1) for range addition.",
      fix: "Multiplying by interval length (end - start + 1) because every element in the segment increases by val.",
      wrongSnippet: "tree[node] += val; // Only adds val once, regardless of interval size!",
      correctedSnippet: "tree[node] += val * (end - start + 1); // Correctly scales by interval length",
    },
    {
      trap: "Uninitialized Lazy Array with Non-Zero Neutral Value",
      cause: "Using 0 as the unassigned lazy marker for Range Set / Assignment updates, which corrupts valid updates setting values to 0.",
      fix: "For Range Set, use a sentinel like INF or a boolean has_lazy[node] flag to distinguish 'no update' from 'set to 0'.",
      wrongSnippet: "if (lazy[node] != 0) { /* set to lazy[node] */ } // Fails when setting range to 0!",
      correctedSnippet: "if (has_lazy[node]) { tree[node] = lazy[node] * len; lazy_child = ...; has_lazy[node] = false; }",
    },
  ],
  pythonTemplate: `import sys

class LazySegmentTree:
    """Segment tree with range addition and range sum queries."""
    def __init__(self, data):
        self.n = len(data)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        if self.n > 0:
            self._build(1, 0, self.n - 1, data)

    def _build(self, node: int, start: int, end: int, data: list):
        if start == end:
            self.tree[node] = data[start]
            return
        mid = (start + end) // 2
        self._build(2 * node, start, mid, data)
        self._build(2 * node + 1, mid + 1, end, data)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def _push(self, node: int, start: int, end: int):
        if self.lazy[node] != 0:
            val = self.lazy[node]
            mid = (start + end) // 2
            
            # Left child
            self.tree[2 * node] += val * (mid - start + 1)
            self.lazy[2 * node] += val
            
            # Right child
            self.tree[2 * node + 1] += val * (end - mid)
            self.lazy[2 * node + 1] += val
            
            self.lazy[node] = 0

    def update_range(self, l: int, r: int, val: int):
        """Add val to all elements in closed interval [l, r] (0-indexed)."""
        self._update(1, 0, self.n - 1, l, r, val)

    def _update(self, node: int, start: int, end: int, l: int, r: int, val: int):
        if r < start or end < l:
            return
        if l <= start and end <= r:
            self.tree[node] += val * (end - start + 1)
            self.lazy[node] += val
            return
        self._push(node, start, end)
        mid = (start + end) // 2
        self._update(2 * node, start, mid, l, r, val)
        self._update(2 * node + 1, mid + 1, end, l, r, val)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, l: int, r: int) -> int:
        """Query sum of elements in closed interval [l, r] (0-indexed)."""
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node: int, start: int, end: int, l: int, r: int) -> int:
        if r < start or end < l:
            return 0
        if l <= start and end <= r:
            return self.tree[node]
        self._push(node, start, end)
        mid = (start + end) // 2
        return (
            self._query(2 * node, start, mid, l, r)
            + self._query(2 * node + 1, mid + 1, end, l, r)
        )

def solve():
    input = sys.stdin.readline
    n, q = map(int, input().split())
    arr = list(map(int, input().split()))
    st = LazySegmentTree(arr)
    
    out = []
    for _ in range(q):
        parts = list(map(int, input().split()))
        if parts[0] == 1:
            # Range update: add u to [a-1, b-1]
            _, a, b, u = parts
            st.update_range(a - 1, b - 1, u)
        else:
            # Range sum query: sum of [a-1, b-1]
            _, a, b = parts
            out.append(str(st.query(a - 1, b - 1)))
            
    sys.stdout.write("\\n".join(out) + "\\n")

if __name__ == '__main__':
    solve()
`,
};
