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
};
