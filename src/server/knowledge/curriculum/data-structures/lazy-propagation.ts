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
  conceptualTheory: `## Segment Tree with Lazy Propagation: A Complete Textbook Chapter

### The Range Update Bottleneck: Why Standard Segment Trees Fail

In a standard Segment Tree, updating a single element takes $O(\log N)$ time by traversing from the leaf to the root.
Now consider the problem of a **Range Update**:
*"Add $V$ to every element in the subsegment $A[L \dots R]$."*

If we perform this naively by executing $R - L + 1$ individual point updates:
- For an update of width $N$ (e.g. $[0, N-1]$), we must visit every leaf in the tree.
- Touching all $N$ leaves takes $O(N \log N)$ or $O(N)$ time.
- If a problem has $Q = 10^5$ range updates, the naive approach takes:
  $$O(Q \times N) \approx 10^5 \times 10^5 = 10^{10} \text{ operations (TLE!)}$$

Even if we try to modify internal nodes directly, if we don't update their children, future queries that descend into those children will read **stale, outdated data**.
How can we update entire ranges in $O(\log N)$ time while guaranteeing that every subsequent query receives fresh, correct values?
The answer is **Lazy Propagation (Deferred Evaluation)**.

---

### The Core Intuition: "Sticky Notes & IOU Promises"

Lazy Propagation is based on a simple, brilliant real-world principle:
> **"Never do work until you are forced to do it."**

#### The School Principal Analogy
Imagine a school with 1,000 students divided into classes:
- If the principal decides every student gets +5 homework assignments:
  - **Naive method**: The principal walks to all 1,000 desks individually (takes all day).
  - **Lazy method**: The principal puts a sticky note on the 2 grade directors' doors: *"Add +5 homework to everyone in your grade."* The principal then returns to work immediately!
  - When does the note get passed down? **Only when a specific teacher arrives asking for student records.** At that exact moment, the director passes the note down to the teacher, applies the +5 to their files, and discards their own note!

#### In Segment Tree Terms:
When an update range $[L, R]$ completely encloses a node's interval $[start, end]$:
1. We compute and update the node's aggregate value **immediately**:
   $$\text{tree}[u] \mathrel{+}= (end - start + 1) \times V$$
2. Instead of recursing into its children, we record an **IOU tag** in a separate array:
   $$\text{lazy}[u] \mathrel{+}= V$$
3. **We return immediately without visiting the children!**

Because any range $[L, R]$ decomposes into at most $2 \times \lceil \log_2 N \rceil$ canonical nodes in the tree, we only touch $O(\log N)$ nodes during the update. The children are left untouched until a future query or update actually needs to inspect them!

---

### The Two Core Protocols: Push Down and Pull Up

The correctness of Lazy Propagation hinges on two fundamental routines:

#### 1. The Push-Down Protocol (\`push\`)
Whenever an operation (either \`update\` or \`query\`) needs to **descend into the children** of node $u$, it must first ensure that the children have up-to-date state by pushing down any pending lazy tags from parent $u$:

\`\`\`cpp
void push(int node, int start, int end) {
    if (lazy[node] == 0) return; // No pending tag
    
    int mid = start + (end - start) / 2;
    long long tag = lazy[node];
    
    // 1. Pass tag to left child (node * 2) covering [start, mid]
    tree[2 * node] += (mid - start + 1) * tag;
    lazy[2 * node] += tag;
    
    // 2. Pass tag to right child (node * 2 + 1) covering [mid + 1, end]
    tree[2 * node + 1] += (end - mid) * tag;
    lazy[2 * node + 1] += tag;
    
    // 3. Clear the parent's tag (promise fulfilled!)
    lazy[node] = 0;
}
\`\`\`

**Critical Rule**:
You must call \`push()\` **before** recursing into child nodes in BOTH:
- \`rangeUpdate(node, start, end, l, r, val)\`
- \`rangeQuery(node, start, end, l, r)\`

If you forget to call \`push()\` in \`rangeQuery\`, the query will read stale data from child nodes whose parents had pending modifications!

#### 2. The Pull-Up Protocol (\`pull\`)
After returning from child recursive calls, the parent's aggregate value must be recalculated from its newly updated children:
\`\`\`cpp
void pull(int node) {
    tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
}
\`\`\`

---

### Tag Composition Algebra: Handling Multiple Overlapping Updates

What happens when a node that ALREADY has a pending lazy tag receives another update before its tag was pushed down?
The new update must **compose** with the existing tag. Depending on the operations, the algebra of tag composition differs:

#### 1. Range Addition Only
- Formula: $\text{lazy}[u] \mathrel{+}= \text{new\_val}$
- Associative and commutative: order of additions does not matter.

#### 2. Range Assignment (Set all elements in $[L, R] = X$)
- When a node receives an assignment tag $X$, it **completely overwrites** whatever previous value was there.
- **Trap**: You cannot use \`lazy[u] == 0\` as a sentinel for "no pending tag", because setting values to \`0\` is a valid assignment!
- **Solution**: Maintain a boolean array \`has_lazy[u]\`:
\`\`\`cpp
void applySet(int node, int start, int end, long long val) {
    tree[node] = (end - start + 1) * val;
    lazy[node] = val;
    has_lazy[node] = true;
}
\`\`\`

#### 3. Range Addition and Range Assignment Combined
In problems with BOTH "Add $V$" and "Set to $X$":
- An **Assignment** clears any previous addition:
  \`has_set[u] = true; lazy_set[u] = X; lazy_add[u] = 0;\`
- An **Addition** appends to whatever is currently there:
  \`if (has_set[u]) lazy_set[u] += V; else lazy_add[u] += V;\`

#### 4. Range Affine Transformations ($a \cdot x + b \pmod M$)
The most general and elegant formulation represents every update as a linear function $f(x) = ax + b$:
- "Multiply range by $C$": $f(x) = C \cdot x + 0$
- "Add $D$ to range": $f(x) = 1 \cdot x + D$
- "Set range to $S$": $f(x) = 0 \cdot x + S$

When composing an existing tag $(a, b)$ with a new incoming tag $(c, d)$:
$$g(f(x)) = c \cdot (a \cdot x + b) + d = (c \cdot a) x + (c \cdot b + d)$$
Thus, the composite tag is simply:
$$\text{tag}_{\text{new}} = (c \cdot a \pmod M, \ (c \cdot b + d) \pmod M)$$
The identity tag is $(1, 0)$ since $1 \cdot x + 0 = x$.
This single affine framework handles Range Add, Range Multiply, and Range Assignment all in one clean 15-line struct!

---

### Range Length Invariant: Sum vs Min/Max

A frequent source of bugs is failing to account for how range width affects node values:

| Query Type | Applying Pending Add Tag $V$ |
|---|---|
| **Range Sum** | $\text{tree}[u] \mathrel{+}= (\text{end} - \text{start} + 1) \times V$ (Each element in the segment increases by $V$) |
| **Range Min** | $\text{tree}[u] \mathrel{+}= V$ (The minimum simply shifts up by $V$; **length does NOT multiply!**) |
| **Range Max** | $\text{tree}[u] \mathrel{+}= V$ (The maximum simply shifts up by $V$; **length does NOT multiply!**) |

---

### Step-by-Step Execution Walkthrough

Consider array $A = [0, 0, 0, 0]$ of size $N = 4$ supporting Range Add and Range Sum:

1. **Initial State**: All \`tree\` and \`lazy\` nodes are 0.
2. **Update 1: Add 3 to range $[0, 2]$**:
   - Descend to $[0, 3]$ (root): partial overlap. Push down (no-op).
   - Recurse left child $[0, 1]$: **completely inside $[0, 2]$!**
     - $\text{tree}[2] \mathrel{+}= (1 - 0 + 1) \times 3 = 6$.
     - $\text{lazy}[2] = 3$.
     - Return immediately without visiting leaves $[0]$ and $[1]$!
   - Recurse right child $[2, 3]$: partial overlap.
     - Recurse into $[2, 2]$: **completely inside $[0, 2]$!**
       - $\text{tree}[6] \mathrel{+}= (2 - 2 + 1) \times 3 = 3$.
       - $\text{lazy}[6] = 3$.
     - Recurse into $[3, 3]$: outside $[0, 2]$. Return.
     - Pull up: $\text{tree}[3] = \text{tree}[6] + \text{tree}[7] = 3 + 0 = 3$.
   - Pull up root: $\text{tree}[1] = \text{tree}[2] + \text{tree}[3] = 6 + 3 = 9$.
3. **Query: Sum of range $[0, 1]$**:
   - Root $[0, 3]$ partial overlap. Call \`push(1)\` (no-op).
   - Left child $[0, 1]$ is **completely inside query $[0, 1]$**!
   - Return $\text{tree}[2] = 6$ **instantly** without ever inspecting leaves $[0]$ and $[1]$!

Notice how the leaves $[0]$ and $[1]$ still had raw values 0! The query never had to visit them because node $[0, 1]$ already held the exact precomputed aggregate of 6. This is the beauty and efficiency of lazy propagation.

---

### Contest Checklist & Anti-Bug Traps

1. **Did you push on query?** Forgetting \`push()\` in \`query()\` is the #1 bug in lazy segment trees.
2. **Don't push from leaves**: In \`push(node, start, end)\`, only push if $start \ne end$. Attempting to update children of a leaf node will write to out-of-bounds indices like $2 \times (4N)$!
3. **64-bit precision**: When multiplying $(end - start + 1) \times V$, always cast to \`1LL\` to prevent 32-bit integer overflow before the multiplication.
4. **Order of operations in tag assignment**: When applying a new tag to a child, update BOTH the child's value AND the child's lazy tag.`,
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
