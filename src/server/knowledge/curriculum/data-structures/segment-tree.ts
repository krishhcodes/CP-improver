import { ConceptNode } from "../concept-node-type";

export const segmentTreeConcept: ConceptNode = {
  slug: "segment-tree",
  name: "Segment Trees & Range Queries",
  category: "Data Structures",
  difficulty: "INTERMEDIATE",
  description:
    "Binary tree structure storing associative monoid operations over array segments, supporting dynamic point updates and arbitrary range queries in O(log N).",
  timeComplexity: "O(N) build, O(log N) point update / range query",
  spaceComplexity: "O(4N) recursive or O(2N) iterative",
  prerequisites: ["binary-search-answer"],
  dependents: ["lazy-propagation"],
  literatureReferences: [
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 2.4.3: Segment Tree Data Structure",
      keyInsight:
        "A segment tree decomposes any arbitrary range [L, R] into at most 2 * ceil(log2 N) disjoint canonical tree intervals. Any associative operation (sum, min, max, gcd, matrix product) can be answered in O(log N).",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 14: Augmenting Data Structures",
      keyInsight:
        "Internal nodes maintain summary attributes of their child subtrees. Preserving the associative monoid invariant enables logarithmic updates from leaf to root.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 9: Range Queries — Segment Trees (pp. 87-92)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "The iterative segment tree represents leaves at indices N..2N-1 and parent nodes at index i / 2. Bitwise loops provide faster performance and zero recursion overhead.",
    },
  ],
  conceptualTheory: `### Tree Decomposition & Monoid Axioms

#### 1. Canonical Segment Decomposition
A segment tree built on an array of length $N$ has $2^{\\lceil \\log_2 N \\rceil + 1}$ nodes (bounded safely by $4N$).
Each node covers an interval $[L, R]$:
- Root covers $[0, N-1]$.
- If $L < R$, left child covers $[L, \\text{mid}]$ and right child covers $[\\text{mid}+1, R]$.
- Leaf covers $[L, L]$.

When querying an arbitrary range $[Q_L, Q_R]$:
1. **Completely Outside**: If $[L, R] \\cap [Q_L, Q_R] = \\emptyset$, return the identity element $I$ ($0$ for sum, $+\\infty$ for min, $-\\infty$ for max).
2. **Completely Inside**: If $[L, R] \\subseteq [Q_L, Q_R]$, return the node's stored value.
3. **Partial Overlap**: Recursively query both children and merge results using the monoid operator $\\otimes$.

---

#### 2. Monoid Requirements
The underlying query operation $\\otimes$ must satisfy two axioms:
1. **Associativity**: $(A \\otimes B) \\otimes C = A \\otimes (B \\otimes C)$
2. **Identity Element**: $A \\otimes I = I \\otimes A = A$
*(Note: Commutativity is NOT required. Non-commutative operations like matrix multiplication work identically when merged in strict left-to-right tree order).*`,
  variations: [
    {
      title: "Point Update, Range Sum Query",
      explanation: "Update a single element a[i] = v; compute sum(l, r) in O(log N).",
      formula: "node.val = left.val + right.val",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
    {
      title: "Range Minimum / Maximum Query (RMQ)",
      explanation: "Maintains min/max across ranges with identity element INT_MAX / INT_MIN.",
      formula: "node.val = min(left.val, right.val)",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
    {
      title: "Iterative Segment Tree (Bottom-Up)",
      explanation: "Leaves at n..2n-1, parent at i >> 1. Up to 4x faster execution with zero recursion overhead.",
      formula: "tree[i] = tree[i << 1] + tree[i << 1 | 1]",
      codeSnippet: `void update(int p, int val) {
    for (tree[p += n] = val; p > 1; p >>= 1) tree[p >> 1] = tree[p] + tree[p ^ 1];
}`,
      timeComplexity: "O(log N)",
      spaceComplexity: "O(2N)",
    },
    {
      title: "Binary Search on Segment Tree (Walk on Tree)",
      explanation: "Find the first index where prefix sum >= X in O(log N) by descending left if left.val >= X, else right.",
      formula: "Descend left if left.val >= X, else X -= left.val and descend right",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(4N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Array with Q up to 2 * 10^5 dynamic point updates and range queries (sum, min, max, gcd)",
      cue: "Standard Segment Tree in O(log N) per operation.",
    },
    {
      triggerConstraint: "Finding the first index in a range that satisfies a threshold (e.g. first a[i] >= X)",
      cue: "Walk on Segment Tree in O(log N) instead of binary search + query in O(log^2 N).",
    },
  ],
  stepByStepStrategy: [
    "1. Allocate 4*N Elements: For 1-based recursive segment trees, allocate `vector<long long> tree(4 * n + 1)`.",
    "2. Implement Build: Recursively divide $[L, R]$, compute children, and merge: `tree[node] = merge(tree[2*node], tree[2*node+1])`.",
    "3. Implement Point Update: Recurse to leaf $[pos, pos]$, modify value, and re-merge parents on backtrack.",
    "4. Implement Range Query: Handle no overlap (identity), full overlap (tree[node]), and partial overlap (merge children).",
    "5. 64-bit Values: Ensure sum trees use `long long` for all nodes.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree;

    SegmentTree(int n) : n(n), tree(4 * n, 0) {}

    SegmentTree(const vector<int>& a) : n(a.size()), tree(4 * a.size(), 0) {
        build(1, 0, n - 1, a);
    }

    void build(int node, int start, int end, const vector<int>& a) {
        if (start == end) {
            tree[node] = a[start];
            return;
        }
        int mid = start + (end - start) / 2;
        build(2 * node, start, mid, a);
        build(2 * node + 1, mid + 1, end, a);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
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

    long long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0; // Identity element
        if (l <= start && end <= r) return tree[node]; // Completely inside
        int mid = start + (end - start) / 2;
        return query(2 * node, start, mid, l, r)
             + query(2 * node + 1, mid + 1, end, l, r);
    }
};`,
  pitfalls: [
    "Array Size Under-Allocation: Allocating size 2N for a recursive segment tree causes segmentation faults. The maximum indexed node in a 1-based tree can reach 4N.",
    "Wrong Identity Element: Returning 0 for a Range Minimum Query (RMQ) instead of INF produces incorrect answers whenever all array elements are positive.",
    "Point Update Overwriting Instead of Adding: Pay attention to whether problem asks for `a[i] = v` (assignment) or `a[i] += v` (addition).",
  ],
  practiceProblems: [
    {
      name: "Dynamic Range Sum Queries (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1648",
      platform: "CSES",
      hint: "Standard segment tree point update and range sum query.",
    },
    {
      name: "Dynamic Range Minimum Queries (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1649",
      platform: "CSES",
      hint: "Use min merge and identity element 1e18.",
    },
    {
      name: "Hotel Queries (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1143",
      platform: "CSES",
      hint: "Walk on segment tree: maintain maximum room capacity. Descend left if left child has max >= required, else descend right.",
    },
    {
      name: "Sereja and Brackets (Codeforces)",
      rating: 1600,
      url: "https://codeforces.com/problemset/problem/380/C",
      platform: "Codeforces",
      hint: "Store matching brackets, unmatched open, and unmatched closed brackets per node. Associative merge.",
    },
  ],
  deepExplanation: {
    intuition:
      "A Segment Tree is a full binary tree where each node represents an interval of the underlying array. The root covers [0, N-1], and each internal node divides its interval into two equal halves. Instead of querying all elements sequentially in O(N), any arbitrary range [L, R] can be uniquely decomposed into at most 2 * ceil(log2 N) canonical disjoint subsegments already precomputed in the tree. Because point updates only affect nodes on the direct path from the leaf to the root, both queries and updates execute in logarithmic time.",
    proofOfCorrectness:
      "Theorem (Canonical Range Decomposition in O(log N)): At any depth d in the segment tree, at most 4 nodes are visited during a range query [L, R]. Proof: A node's interval [start, end] can fall into three cases relative to [L, R]: (1) Disjoint: discarded immediately; (2) Fully contained: value returned immediately without descending; (3) Partial overlap: both children visited. For partial overlap to occur, either L or R must strictly fall inside [start, end]. Since an interval has only two boundaries (L and R), at each level at most two nodes can contain an endpoint in their interior. Thus, at most 2 nodes branch at each level. The total number of nodes visited across all levels is bounded by 4 * height = 4 * ceil(log2 N) = O(log N). Because the binary merge operation is associative over a monoid (S, *, e), combining the values of these canonical nodes correctly yields the range aggregate.",
    complexityDerivation:
      "Build Time: O(N) because the tree has 2^(ceil(log2 N) + 1) - 1 < 4N nodes, and each internal node takes O(1) merge time. Point Update Time: O(log N), traversing a single root-to-leaf path of length <= ceil(log2 N) + 1. Range Query Time: O(log N) as proven above. Space: O(4N) array storage to hold 1-indexed binary tree child pointers.",
    whenNotToUse:
      "Do NOT use a full recursive segment tree if the operations are purely prefix sums or point updates with invertible operations (sum/XOR); a Fenwick tree (Binary Indexed Tree) has half the memory footprint, 3x faster cache performance, and requires only 10 lines of code. Also, if there are NO updates, a Sparse Table provides O(1) static RMQ queries after O(N log N) precomputation.",
  },
  workedExample: {
    title: "Point Update & Range Minimum Query (RMQ)",
    scenario: "Array A = [5, 8, 6, 3], size N = 4. Monoid: (min, INF). Query RMQ(1, 3), update A[1] = 2, query RMQ(0, 2)",
    input: "A = [5, 8, 6, 3]. Tree size = 4 * 4 = 16.",
    output: "Query 1: min([8, 6, 3]) = 3. Update A[1] = 2. Query 2: min([5, 2, 6]) = 2.",
    traceSteps: [
      { step: 1, state: "Build Leaves", action: "tree[4]=5 (idx 0), tree[5]=8 (idx 1), tree[6]=6 (idx 2), tree[7]=3 (idx 3)", insight: "Leaves correspond to base array elements" },
      { step: 2, state: "Build Internals", action: "tree[2]=min(5,8)=5 ([0..1]), tree[3]=min(6,3)=3 ([2..3]), tree[1]=min(5,3)=3 ([0..3])", insight: "Root node 1 holds overall minimum 3" },
      { step: 3, state: "Query RMQ(1, 3)", action: "Descend from node 1: left child node 2 overlaps partially [0..1] -> leaf node 5 ([1..1]) returns 8. Right child node 3 is fully inside [2..3] -> returns 3. Merge: min(8, 3) = 3", insight: "Canonical decomposition visits only 2 non-trivial segments" },
      { step: 4, state: "Update A[1] = 2", action: "Path: node 5 -> node 2 -> node 1. Set tree[5]=2. Recalculate tree[2]=min(5, 2)=2. Recalculate tree[1]=min(2, 3)=2", insight: "Exactly log2(4) = 2 merge steps updated on way to root" },
      { step: 5, state: "Query RMQ(0, 2)", action: "Node 2 ([0..1]) is fully inside [0..2] -> returns 2. Node 3 ([2..3]) overlaps partially -> leaf node 6 ([2..2]) returns 6. Merge: min(2, 6) = 2", insight: "Reflects updated value 2 instantly in O(log N)" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Allocating 2N instead of 4N for Recursive Tree",
      cause: "When N is not a power of 2, the bottom level leaves extend beyond 2N. For example, if N = 5, the tree needs height 4, requiring indices up to 2^(3+1) - 1 = 15 > 2 * 5.",
      fix: "Always declare vector<long long> tree(4 * n) or 1 << (32 - __builtin_clz(n) + 1).",
      wrongSnippet: "vector<long long> tree(2 * n); // SIGSEGV on out-of-bounds index access!",
      correctedSnippet: "vector<long long> tree(4 * n, 0); // Guaranteed safe for all N",
    },
    {
      trap: "Incorrect Identity Element for Range Minimum / Maximum",
      cause: "Returning 0 for RMQ outside range boundary causes positive arrays to return 0 instead of true minimum.",
      fix: "For sum use 0; for min use INF (1e18 or 2e9); for max use -INF; for GCD use 0.",
      wrongSnippet: "if (r < start || end < l) return 0; // Bugs RMQ when all elements are positive!",
      correctedSnippet: "if (r < start || end < l) return 1e18; // Correct neutral element for min",
    },
    {
      trap: "Query Boundary Full Overlap Condition Inversion",
      cause: "Checking `if (start <= l && r <= end)` instead of `if (l <= start && end <= r)`.",
      fix: "The node segment [start, end] must be completely inside the query range [l, r].",
      wrongSnippet: "if (start <= l && r <= end) return tree[node]; // Inverted condition!",
      correctedSnippet: "if (l <= start && end <= r) return tree[node]; // Valid canonical segment",
    },
  ],
  pythonTemplate: `import sys

class SegmentTree:
    """Standard 1-indexed recursive segment tree with arbitrary monoid support."""
    def __init__(self, data, merge_fn=min, identity=float('inf')):
        self.n = len(data)
        self.merge = merge_fn
        self.identity = identity
        self.tree = [identity] * (4 * self.n)
        if self.n > 0:
            self._build(1, 0, self.n - 1, data)

    def _build(self, node: int, start: int, end: int, data: list):
        if start == end:
            self.tree[node] = data[start]
            return
        mid = (start + end) // 2
        self._build(2 * node, start, mid, data)
        self._build(2 * node + 1, mid + 1, end, data)
        self.tree[node] = self.merge(self.tree[2 * node], self.tree[2 * node + 1])

    def update(self, idx: int, val: int):
        """Point update: set A[idx] = val (0-indexed)."""
        self._update(1, 0, self.n - 1, idx, val)

    def _update(self, node: int, start: int, end: int, idx: int, val: int):
        if start == end:
            self.tree[node] = val
            return
        mid = (start + end) // 2
        if idx <= mid:
            self._update(2 * node, start, mid, idx, val)
        else:
            self._update(2 * node + 1, mid + 1, end, idx, val)
        self.tree[node] = self.merge(self.tree[2 * node], self.tree[2 * node + 1])

    def query(self, l: int, r: int) -> int:
        """Range query over closed interval [l, r] (0-indexed)."""
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node: int, start: int, end: int, l: int, r: int) -> int:
        if r < start or end < l:
            return self.identity
        if l <= start and end <= r:
            return self.tree[node]
        mid = (start + end) // 2
        p1 = self._query(2 * node, start, mid, l, r)
        p2 = self._query(2 * node + 1, mid + 1, end, l, r)
        return self.merge(p1, p2)

def solve():
    input = sys.stdin.readline
    n, q = map(int, input().split())
    arr = list(map(int, input().split()))
    
    # Range Minimum Query configuration
    st = SegmentTree(arr, merge_fn=min, identity=float('inf'))
    
    out = []
    for _ in range(q):
        type_op, a, b = map(int, input().split())
        if type_op == 1:
            # Update A[k-1] = u
            st.update(a - 1, b)
        else:
            # Query RMQ in [l-1, r-1]
            out.append(str(st.query(a - 1, b - 1)))
            
    sys.stdout.write("\\n".join(out) + "\\n")

if __name__ == '__main__':
    solve()
`,
};
