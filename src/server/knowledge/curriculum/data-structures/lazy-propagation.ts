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
};
