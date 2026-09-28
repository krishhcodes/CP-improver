import { ConceptNode } from "../concept-node-type";

export const binaryLiftingLCAConcept: ConceptNode = {
  slug: "binary-lifting-lca",
  name: "Binary Lifting & Lowest Common Ancestor (LCA)",
  category: "Tree Algorithms",
  difficulty: "INTERMEDIATE",
  description:
    "Sparse table on trees precomputing 2^k-th ancestors in O(N log N). Answers LCA, k-th ancestor, tree-path distance, and path maximum/minimum queries in O(log N) per query. Essential for competitive programming's hardest tree problems.",
  timeComplexity: "O(N log N) build, O(log N) query",
  spaceComplexity: "O(N log N)",
  prerequisites: ["tree-dp"],
  dependents: [],
  literatureReferences: [
    {
      source: "USACO Guide (Platinum)",
      section: "Binary Lifting & LCA",
      url: "https://usaco.guide/plat/bin-lift",
      keyInsight:
        "Precomputing powers-of-two ancestors allows jumping up the tree in O(log N) by decomposing any distance into its binary representation. The sparse table doubles build cost to O(N log N) but pays off with O(log N) per query for any number of queries.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 18: Tree Queries — Lowest Common Ancestor (pp. 167-172)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Distance between any two tree nodes u and v: dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)]. This formula reduces ALL pairwise distance queries to LCA queries.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 4.5.2: Lowest Common Ancestor Variations",
      keyInsight:
        "Binary lifting tables can be augmented with path attributes (e.g. maximum edge weight on the 2^k path) to answer bottleneck queries in O(log N). The same framework handles path sum, path min, path GCD, etc.",
    },
  ],
  conceptualTheory: `## Binary Lifting & LCA: A Complete Textbook Chapter

### What Problems Do We Need to Solve?

In a rooted tree with N nodes and Q queries, we need to answer efficiently:

1. **K-th Ancestor**: What node is exactly K levels above node u?
2. **LCA (Lowest Common Ancestor)**: What is the deepest node that is an ancestor of both u and v?
3. **Tree Path Distance**: How many edges between u and v?
4. **Path Maximum**: What is the maximum edge weight on the path from u to v?

**Naïve solution**: Walk up the tree one step at a time. O(depth) per query = O(N) worst case (chain tree). For Q = 10^5 queries: 10^10 operations. Too slow.

**Binary Lifting**: O(N log N) preprocessing, O(log N) per query. 

---

### The Core Idea: Binary Decomposition of Jumps

Any integer K has a binary representation: K = 2^a + 2^b + 2^c + ... where a > b > c > ...

So "jump K levels up" = "jump 2^a levels, then 2^b levels, then 2^c levels, ..."

If we precompute up[u][k] = 2^k-th ancestor of u for all nodes u and all k from 0 to LOG-1, then any K-step jump takes at most LOG steps (one per set bit in K's binary representation).

**Precomputation recurrence**:
- up[u][0] = parent[u] (direct parent is the 2^0 = 1st ancestor).
- up[u][k] = up[ up[u][k-1] ][k-1] for k ≥ 1.

**Intuition for the recurrence**: "The 2^k-th ancestor of u = the 2^(k-1)-th ancestor of u's 2^(k-1)-th ancestor." Because 2^k = 2^(k-1) + 2^(k-1).

This is identical to the Sparse Table data structure used for range queries on arrays — but applied to the tree's ancestor structure.

---

### Step 1: Build the Binary Lifting Table

\`\`\`
Preprocessing:
1. Root tree at node 1 (arbitrary choice).
2. DFS/BFS to compute depth[u] and up[u][0] = parent[u] for all u.
3. Set up[root][0] = root (or 0, as sentinel — handle carefully).
4. For k = 1 to LOG-1:
       For each node u (any order works, since up[u][k-1] is already filled):
           up[u][k] = up[up[u][k-1]][k-1]
\`\`\`

**LOG value**: LOG = 20 handles N up to 2^20 ≈ 10^6. LOG = 17 is enough for N ≤ 10^5.

**Memory**: N × LOG integers. For N = 2*10^5, LOG = 20: 4 million integers ≈ 16 MB. Fine.

**Build time**: O(N × LOG) = O(N log N).

---

### Step 2: K-th Ancestor Query

To find the K-th ancestor of node u:

\`\`\`
function kthAncestor(u, K):
    for bit = 0 to LOG-1:
        if K has bit 'bit' set (i.e., (K >> bit) & 1 == 1):
            u = up[u][bit]   // Jump 2^bit levels up
    return u
\`\`\`

**Time**: O(LOG) = O(log N) per query.

**Example**: K=5 = 101 in binary = 4+1. Jump 2^2=4 levels, then 2^0=1 level. Two jumps total.

**Edge case**: If K > depth[u], this goes "past" the root. Depending on sentinel, returns root or 0 (invalid). Check depth[u] >= K first if needed.

---

### Step 3: LCA Query Algorithm

**LCA(u, v)** = deepest node that is an ancestor of BOTH u and v.

**Algorithm (4 phases)**:

**Phase 1 — Ensure u is deeper**:
If depth[u] < depth[v], swap u and v. Now depth[u] >= depth[v].

**Phase 2 — Equalize depths**:
Jump u up by (depth[u] - depth[v]) levels using binary decomposition.
After this phase: depth[u] == depth[v].

**Phase 3 — Early exit**:
If u == v after equalization, v was an ancestor of u. Return u (= v = LCA).

**Phase 4 — Simultaneous binary jumps**:
For k from LOG-1 down to 0:
  If up[u][k] != up[v][k]: jump BOTH u = up[u][k] and v = up[v][k].
  If up[u][k] == up[v][k]: DON'T jump (would overshoot LCA).

After this loop: u and v are at the same depth, and their immediate parents are the SAME (= LCA).

**Return**: LCA = up[u][0] = parent(u).

**Why jump when ancestors DIFFER?** 
If up[u][k] != up[v][k], the LCA is strictly MORE than 2^k levels above u and v. We can safely jump 2^k levels without overshooting.
If up[u][k] == up[v][k], the LCA is AT MOST 2^k levels above — we might overshoot if we jump. Don't jump.

This is a standard binary search argument: we greedily jump the largest safe amount.

---

### Step 4: Path Distance

Once we have LCA:
\`\`\`
dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)]
\`\`\`

**Why?** The path u→v goes u → LCA (depth[u] - depth[LCA] steps) → v (depth[v] - depth[LCA] steps). Total = depth[u] + depth[v] - 2*depth[LCA].

---

### Augmented Binary Lifting: Path Maximum Edge Weight

Augment the table with an additional array max_edge[u][k] = maximum edge weight on the path from u to its 2^k-th ancestor.

\`\`\`
max_edge[u][0] = weight(u, parent[u])
max_edge[u][k] = max(max_edge[u][k-1], max_edge[up[u][k-1]][k-1])
\`\`\`

When computing LCA(u, v), simultaneously track the running maximum across all jumps. This answers "maximum edge weight on path from u to v" in O(log N).

**Applications**: 
- MST Bottleneck queries (find minimax path between any two nodes).
- Verify if a new edge creates a cycle with a heavier edge on the MST path.

---

### Alternative: Euler Tour + Sparse Table (O(1) LCA)

Another approach to LCA:
1. Run DFS, record the Euler tour (each node appears multiple times: when first visited and when revisited after each child).
2. LCA(u, v) = the minimum-depth node in the Euler tour between first occurrences of u and v.
3. Build a Sparse Table for O(1) range minimum.
4. **O(1) per LCA query** after O(N log N) preprocessing.

**When to use this instead**: If you have 10^6+ LCA-only queries and no K-th ancestor or path augmentation. Binary lifting is simpler to implement and handles more query types.

---

### Iterative DFS (Avoiding Stack Overflow)

For N up to 2*10^5, recursive DFS may hit Python's recursion limit or C++'s stack limit on deep trees. Use iterative DFS:

\`\`\`cpp
stack<pair<int,int>> stk;
stk.push({root, 0});
while (!stk.empty()) {
    auto [u, p] = stk.top(); stk.pop();
    // Process node u with parent p
    for (int v : adj[u])
        if (v != p) stk.push({v, u});
}
\`\`\``,

  variations: [
    {
      title: "K-th Ancestor Query",
      explanation: "Jump node u upward by exactly K levels using binary decomposition. For each set bit in K, jump the corresponding power of 2 levels. O(log K) per query.",
      formula: "if (K >> bit) & 1: u = up[u][bit]",
      timeComplexity: "O(log K) per query",
      spaceComplexity: "O(N log N)",
    },
    {
      title: "LCA (Lowest Common Ancestor)",
      explanation: "Find deepest common ancestor via depth equalization + simultaneous binary jumps. Distance = depth[u] + depth[v] - 2*depth[LCA].",
      formula: "up[u][k] != up[v][k]: jump both; otherwise don't",
      timeComplexity: "O(log N) per query",
      spaceComplexity: "O(N log N)",
    },
    {
      title: "Tree Path Maximum/Minimum Edge Weight",
      explanation: "Augment up table with max_edge/min_edge arrays. While computing LCA, accumulate the path maximum/minimum. Used for MST bottleneck queries.",
      formula: "max_edge[u][k] = max(max_edge[u][k-1], max_edge[up[u][k-1]][k-1])",
      timeComplexity: "O(log N) per query",
      spaceComplexity: "O(N log N)",
    },
    {
      title: "Euler Tour + Sparse Table (O(1) LCA)",
      explanation: "Convert tree to Euler tour array. LCA = range minimum depth in tour between first occurrences. Sparse Table gives O(1) range minimum. Fastest for LCA-only heavy workloads.",
      formula: "LCA(u,v) = RMQ_depth(first[u], first[v])",
      timeComplexity: "O(N log N) build, O(1) per query",
      spaceComplexity: "O(N log N)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Tree with Q up to 2*10^5 queries: 'what is the K-th ancestor of node u?'",
      cue: "Binary lifting: precompute up[u][k] in O(N log N), answer each K-th ancestor in O(log N).",
    },
    {
      triggerConstraint: "Find the lowest common ancestor of node pairs in a tree",
      cue: "Binary lifting LCA with depth equalization + simultaneous jumps. O(log N) per query.",
    },
    {
      triggerConstraint: "Find distance between any two nodes on a tree",
      cue: "LCA + depth formula: dist(u,v) = depth[u] + depth[v] - 2*depth[LCA(u,v)].",
    },
    {
      triggerConstraint: "After building MST, answer bottleneck/minimax path queries",
      cue: "Build binary lifting on MST with max_edge table. Answer each query in O(log N).",
    },
    {
      triggerConstraint: "Count how many nodes are on path from u to v in a tree",
      cue: "dist(u,v) + 1 nodes on the path. Compute via LCA.",
    },
  ],

  stepByStepStrategy: [
    "1. Root the tree at node 1. Set LOG = 20 (handles N ≤ 5*10^5).",
    "2. DFS/BFS to compute depth[u] and up[u][0] = parent for each node. Set up[root][0] = 0 (sentinel).",
    "3. Fill binary lifting table: for k = 1..LOG-1, for all u: up[u][k] = up[up[u][k-1]][k-1].",
    "4. For LCA(u,v): ensure depth[u] >= depth[v] (swap if needed). Equalize depths by binary-decomposing the difference. Check if u==v (early exit). Then loop k from LOG-1 to 0: if up[u][k] != up[v][k], jump both.",
    "5. Return up[u][0] as the LCA.",
    "6. For path distance: return depth[u] + depth[v] - 2*depth[LCA(u,v)].",
    "7. Use iterative DFS in Python (not recursive) to avoid hitting recursion limits on deep trees.",
  ],

  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>
#include <stack>

using namespace std;

const int LOG = 20; // 2^20 = 1,048,576 — handles N up to 10^6

struct BinaryLifting {
    int n;
    vector<int> depth;
    vector<array<int, LOG>> up; // up[u][k] = 2^k-th ancestor of u

    // Optional: path maximum augmentation
    vector<array<int, LOG>> max_edge; // max edge weight on 2^k-path

    BinaryLifting(int n) : n(n), depth(n + 1, 0), up(n + 1), max_edge(n + 1) {
        for (int i = 0; i <= n; i++) up[i].fill(0), max_edge[i].fill(0);
    }

    // Build with edge weights (use w=0 if unweighted)
    void build(const vector<vector<pair<int,int>>>& adj, int root = 1) {
        // Iterative DFS to avoid stack overflow on deep trees
        stack<pair<int,int>> stk; // (node, parent)
        stk.push({root, 0});

        while (!stk.empty()) {
            auto [u, p] = stk.top(); stk.pop();

            // Fill level 0
            up[u][0] = p;

            // Fill levels 1..LOG-1
            for (int k = 1; k < LOG; k++) {
                up[u][k] = up[up[u][k-1]][k-1];
                max_edge[u][k] = max(max_edge[u][k-1], max_edge[up[u][k-1]][k-1]);
            }

            for (auto& [v, w] : adj[u]) {
                if (v != p) {
                    depth[v] = depth[u] + 1;
                    max_edge[v][0] = w; // Edge weight from v to its parent
                    stk.push({v, u});
                }
            }
        }
    }

    // K-th ancestor of node u (returns 0 if K > depth[u])
    int kthAncestor(int u, int k) {
        for (int bit = 0; bit < LOG; bit++) {
            if ((k >> bit) & 1) {
                u = up[u][bit];
                if (u == 0) return 0; // Went above root
            }
        }
        return u;
    }

    // LCA of nodes u and v
    int lca(int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);

        // Step 1: Equalize depths
        int diff = depth[u] - depth[v];
        for (int k = 0; k < LOG; k++)
            if ((diff >> k) & 1)
                u = up[u][k];

        // Step 2: Early exit if same node
        if (u == v) return u;

        // Step 3: Simultaneous binary jumps (high to low!)
        for (int k = LOG - 1; k >= 0; k--)
            if (up[u][k] != up[v][k]) {
                u = up[u][k];
                v = up[v][k];
            }

        // LCA is the parent of both u and v now
        return up[u][0];
    }

    // Distance between u and v
    int distance(int u, int v) {
        return depth[u] + depth[v] - 2 * depth[lca(u, v)];
    }

    // Maximum edge weight on path from u to v
    int pathMax(int u, int v) {
        int ans = 0;

        // Equalize depths while tracking max edge
        if (depth[u] < depth[v]) swap(u, v);
        int diff = depth[u] - depth[v];
        for (int k = 0; k < LOG; k++)
            if ((diff >> k) & 1) {
                ans = max(ans, max_edge[u][k]);
                u = up[u][k];
            }

        if (u == v) return ans;

        // Simultaneous jumps while tracking max edge
        for (int k = LOG - 1; k >= 0; k--)
            if (up[u][k] != up[v][k]) {
                ans = max({ans, max_edge[u][k], max_edge[v][k]});
                u = up[u][k];
                v = up[v][k];
            }

        // One final step to LCA (the edges from u and v to LCA)
        ans = max({ans, max_edge[u][0], max_edge[v][0]});
        return ans;
    }
};`,

  pitfalls: [
    "LOG Bound Too Small: If LOG = 16 and a path exceeds depth 65536, binary jumps stop prematurely. Always use LOG = 20 for safety (handles N ≤ 5*10^5).",
    "Sentinel for Root's Parent: Root node's parent should be 0 (sentinel). Ensure up[0][k] = 0 for all k, otherwise accessing up[up[root][k-1]][k-1] goes out of bounds when root's 2^k-th ancestor is queried.",
    "Jumping in Ascending Order (Wrong!): During LCA, looping k from 0 to LOG-1 is WRONG. Small jumps move nodes past each other, breaking the 'stop just below LCA' invariant. ALWAYS loop k from LOG-1 down to 0.",
    "DFS Order for Table Build: up[u][k-1] must be computed before up[u][k]. Since k is the outer loop, and parents are always processed before children in DFS order, the table fills correctly. But if you fill by k then u, ensure parent is already filled.",
    "Path Max Not Including LCA edges: When tracking path max during LCA, the edges from final u and v to their parent (= LCA) must be included. Don't forget the final max_edge[u][0] and max_edge[v][0] step.",
    "Confusing up[u][0] = parent vs up[u][0] = 0: Some implementations use 0 as the null sentinel (no parent), others use root. Be consistent throughout the build and query phases.",
  ],

  practiceProblems: [
    {
      name: "Company Queries I (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1687",
      platform: "CSES",
      hint: "K-th ancestor query. Directly apply binary lifting with K-step jump.",
    },
    {
      name: "Company Queries II (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1688",
      platform: "CSES",
      hint: "Standard LCA. Apply depth equalization + simultaneous binary jumps.",
    },
    {
      name: "Distance Queries (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1135",
      platform: "CSES",
      hint: "dist(u,v) = depth[u] + depth[v] - 2*depth[LCA(u,v)]. Compute LCA then apply formula.",
    },
    {
      name: "Path Queries II (CSES)",
      rating: 1800,
      url: "https://cses.fi/problemset/task/2134",
      platform: "CSES",
      hint: "Maximum node value on path from u to v. Augment binary lifting with max_node table instead of max_edge.",
    },
    {
      name: "Fools and Roads (CF 191C)",
      rating: 1900,
      url: "https://codeforces.com/problemset/problem/191/C",
      platform: "Codeforces",
      hint: "For each query (u,v), count how many times each edge is used. Use LCA-based tree difference array: add 1 at u and v, subtract 2 at LCA.",
    },
  ],

  deepExplanation: {
    intuition:
      `In a tree, every node has exactly one path to the root. "Walking up" the tree is a well-defined operation — but doing it one step at a time is slow for deep trees.

Binary lifting is the tree analog of the classic trick "you can represent any integer as sum of powers of 2." Instead of walking up K steps one by one, we precompute "express lanes" at powers of 2: if I need to go 13 levels up (13 = 8+4+1 = 2³+2²+2⁰), I take the 8-lane, then the 4-lane, then the 1-lane — just 3 jumps instead of 13.

The LCA algorithm works by a brilliant three-phase approach: first equalize the depths of the two nodes (so they're at the same "floor" of the tree), then binary-search for the EXACT level just below where their paths first meet. The key invariant: we jump when ancestors DIFFER (we're still below the LCA) and don't jump when they're EQUAL (we'd overshoot into or past the LCA).

The augmented version (tracking path max/min/sum) is especially powerful. By storing the maximum edge weight along each 2^k-length path, we can answer bottleneck queries — "what's the narrowest bottleneck on the path from u to v?" — in the same O(log N) time. This turns the MST into a preprocessing structure for all pairwise bottleneck queries.`,

    proofOfCorrectness:
      `**Claim**: The LCA algorithm correctly finds the LCA in O(log N).

**Phase 2 (Depth equalization) correctness**: After equalization, depth[u] == depth[v]. The equalization works by binary decomposing the difference Δ = depth[u] - depth[v]. For each set bit k in Δ: jumping u up by 2^k reduces the depth difference by exactly 2^k. Since the bits are disjoint, their contributions don't interfere, and the total reduction equals Δ.

**Phase 4 (Simultaneous jumps) correctness**: We maintain the invariant: "LCA(u,v) is a proper ancestor of both u and v (not equal to u or v)."

For each k from LOG-1 to 0:
- If up[u][k] != up[v][k]: the LCA is MORE than 2^k levels above current u and v. We safely jump 2^k levels. The invariant is preserved (LCA is still a proper ancestor of the new u,v).
- If up[u][k] == up[v][k]: the LCA is AT MOST 2^k levels above. Jumping would potentially put us AT or PAST the LCA. We don't jump.

After all LOG iterations, the LCA is exactly 1 step above u (and above v). This is because the binary search correctly binary-searches for the exact stopping point: we jump the largest safe amount at each step (greedy), which combined with the "don't jump if ancestors equal" rule, gives us the tightest possible stopping point.

Therefore LCA = up[u][0] = parent of u = parent of v. ✓`,

    complexityDerivation:
      `**Time Complexity**:
- Preprocessing: O(N × LOG) = O(N log N).
  - DFS to compute depth and up[u][0]: O(N).
  - Fill table for k = 1..LOG-1: N nodes × LOG levels = O(N log N).
- Per query: O(LOG) = O(log N).
  - Depth equalization: at most LOG bit checks.
  - Simultaneous jumps: exactly LOG iterations.

**Space Complexity**: O(N × LOG) = O(N log N) for the up table.
- For N = 2*10^5, LOG = 20: 4 million integers × 4 bytes = 16 MB. Within typical 256 MB limits.

**Practical benchmark (C++)**:
- N = 2*10^5, Q = 2*10^5 LCA queries: ~50ms total.
- Euler Tour + Sparse Table LCA: ~20ms (3× faster for pure LCA workload).

**When binary lifting wins**: K-th ancestor queries + path augmentation (max edge, etc.). Euler Tour only solves basic LCA.`,

    whenNotToUse:
      `**Do NOT use Binary Lifting when**:
1. **The tree changes dynamically (edges added/removed)**: Binary lifting is static. Use Link-Cut Trees (O(log N) per update, access, and LCA query).
2. **You only need LCA and N is very large**: Euler Tour + Sparse Table gives O(1) per LCA vs O(log N), using the same O(N log N) preprocessing.
3. **You need offline batch LCA (Q up to 10^7)**: Tarjan's Offline LCA (DSU-based) processes all queries in O(N + Q) using a post-order DFS. Much faster for massive query counts.
4. **LOG is computed incorrectly**: The most common bug is using too small LOG (e.g., LOG = 16 but N = 5*10^5, needing LOG ≥ 19). Always use LOG = 20 as a safe default.`,
  },

  workedExample: {
    title: "LCA Trace — Binary Lifting on a Sample Tree",
    scenario: "Tree: 1-root, children of 1: [2,3], children of 2: [4,5], children of 3: [6]. Depths: 1→0, 2→1, 3→1, 4→2, 5→2, 6→2. Query: LCA(5, 6).",
    input: "u=5 (depth 2), v=6 (depth 2). up[5]=[2,1,1,...], up[6]=[3,1,1,...], up[2]=[1,0,0,...], up[3]=[1,0,0,...]. LOG=3.",
    output: "LCA(5,6) = 1. dist(5,6) = 2+2 - 2*0 = 4.",
    traceSteps: [
      {
        step: 1,
        state: "Phase 1: depth check",
        action: "depth[5]=2, depth[6]=2. Equal depths, no swap needed. Proceed.",
        insight: "When depths equal, skip the equalization phase."
      },
      {
        step: 2,
        state: "Phase 2: depth equalization (diff=0)",
        action: "Difference = 0. No bits set. No jumps needed.",
        insight: "Nodes already at same depth."
      },
      {
        step: 3,
        state: "Phase 3: early exit check",
        action: "u=5, v=6. 5 ≠ 6. Cannot return early — neither is ancestor of the other.",
        insight: "Both nodes are at depth 2 but different subtrees."
      },
      {
        step: 4,
        state: "Phase 4: k=2 (jump 4 levels)",
        action: "up[5][2]=0 (sentinel, past root), up[6][2]=0. EQUAL → do NOT jump.",
        insight: "Both go past root at k=2. Jumping would overshoot LCA."
      },
      {
        step: 5,
        state: "Phase 4: k=1 (jump 2 levels)",
        action: "up[5][1]=1 (2^1=2 levels from 5: 5→2→1), up[6][1]=1 (6→3→1). EQUAL → do NOT jump.",
        insight: "Two levels up from both nodes = root (node 1). Jumping would land on LCA itself."
      },
      {
        step: 6,
        state: "Phase 4: k=0 (jump 1 level)",
        action: "up[5][0]=2 (parent of 5), up[6][0]=3 (parent of 6). 2 ≠ 3 → JUMP! u=2, v=3.",
        insight: "Ancestors differ at k=0. We jump 1 level — now u=2, v=3 are children of the LCA."
      },
      {
        step: 7,
        state: "Return LCA",
        action: "LCA = up[u][0] = up[2][0] = 1. Distance = depth[5]+depth[6] - 2*depth[1] = 2+2-0 = 4.",
        insight: "LCA found correctly. Path: 5→2→1→3→6 (4 edges)."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Jumping in Ascending Order k=0..LOG-1 Instead of LOG-1..0",
      cause: "The simultaneous jump phase must process largest bits FIRST. Starting with small jumps (k=0) loses the greedy property — small jumps move u and v past each other.",
      fix: "Always loop: `for (int k = LOG-1; k >= 0; k--)`. This is a binary search from the top down.",
      wrongSnippet: "for (int k = 0; k < LOG; k++) if (up[u][k] != up[v][k]) { u=up[u][k]; v=up[v][k]; } // WRONG!",
      correctedSnippet: "for (int k = LOG-1; k >= 0; k--) if (up[u][k] != up[v][k]) { u=up[u][k]; v=up[v][k]; } // Correct",
    },
    {
      trap: "LOG Too Small for Deep Trees",
      cause: "Setting LOG=16 handles depth up to 2^16=65536. For N=10^6, paths can be 10^6 deep. Jumps fail to reach ancestors beyond depth 65536.",
      fix: "Always use LOG=20 for N ≤ 10^6. Use LOG=30 for N ≤ 10^9 (e.g. with compressed trees).",
      wrongSnippet: "const int LOG = 16; // Fails for N > 65536 in chain trees!",
      correctedSnippet: "const int LOG = 20; // 2^20 > 10^6, safe for all competitive programming inputs",
    },
    {
      trap: "Forgetting up[root][0] = 0 Sentinel",
      cause: "If root's parent is uninitialized (garbage value), up[root][k] for k>0 reads garbage memory, corrupting the table for all nodes.",
      fix: "Explicitly set `up[root][0] = 0` (or `up[root][0] = root`, but 0 sentinel is safer). Fill up[0][k] = 0 for all k.",
      wrongSnippet: "up[root][0] = parent; // parent is -1 or unset → up[up[root][k-1]][k-1] reads index -1!",
      correctedSnippet: "up[root][0] = 0; // Sentinel. up[0][k] = 0 for all k by vector initialization",
    },
  ],

  pythonTemplate: `import sys
from typing import List

sys.setrecursionlimit(300000)

class BinaryLiftingLCA:
    """
    Binary Lifting for LCA, K-th ancestor, and tree path distance.
    O(N log N) preprocessing, O(log N) per query.
    """
    LOG = 20  # 2^20 = 1,048,576 — safe for N up to 10^6

    def __init__(self, n: int, adj: List[List[int]], root: int = 1):
        self.n = n
        self.adj = adj
        self.depth = [0] * (n + 1)
        self.up = [[0] * self.LOG for _ in range(n + 1)]
        self._build_iterative(root)

    def _build_iterative(self, root: int):
        """Iterative BFS-based build to avoid recursion limit."""
        from collections import deque
        q = deque([root])
        visited = [False] * (self.n + 1)
        visited[root] = True
        order = []

        while q:
            u = q.popleft()
            order.append(u)
            for v in self.adj[u]:
                if not visited[v]:
                    visited[v] = True
                    self.depth[v] = self.depth[u] + 1
                    self.up[v][0] = u
                    q.append(v)

        # Fill binary lifting table in BFS order (parents before children)
        for u in order:
            for k in range(1, self.LOG):
                parent_k1 = self.up[u][k - 1]
                self.up[u][k] = self.up[parent_k1][k - 1]

    def kth_ancestor(self, u: int, k: int) -> int:
        """
        Returns k-th ancestor of u.
        Returns 0 (sentinel) if k > depth[u].
        O(log k) per query.
        """
        for bit in range(self.LOG):
            if (k >> bit) & 1:
                u = self.up[u][bit]
                if u == 0:
                    return 0
        return u

    def lca(self, u: int, v: int) -> int:
        """
        Lowest Common Ancestor of u and v.
        O(log N) per query.
        """
        # Ensure u is deeper
        if self.depth[u] < self.depth[v]:
            u, v = v, u

        # Phase 1: Equalize depths
        diff = self.depth[u] - self.depth[v]
        for bit in range(self.LOG):
            if (diff >> bit) & 1:
                u = self.up[u][bit]

        # Phase 2: Early exit
        if u == v:
            return u

        # Phase 3: Simultaneous binary jumps (HIGH TO LOW!)
        for bit in range(self.LOG - 1, -1, -1):
            if self.up[u][bit] != self.up[v][bit]:
                u = self.up[u][bit]
                v = self.up[v][bit]

        return self.up[u][0]  # One step above = LCA

    def distance(self, u: int, v: int) -> int:
        """
        Edge distance between u and v.
        dist = depth[u] + depth[v] - 2 * depth[LCA(u,v)]
        """
        ancestor = self.lca(u, v)
        return self.depth[u] + self.depth[v] - 2 * self.depth[ancestor]


def solve():
    data = sys.stdin.buffer.read().split()
    idx = 0
    n, q = int(data[idx]), int(data[idx+1]); idx += 2

    adj = [[] for _ in range(n + 1)]
    for _ in range(n - 1):
        u, v = int(data[idx]), int(data[idx+1]); idx += 2
        adj[u].append(v)
        adj[v].append(u)

    solver = BinaryLiftingLCA(n, adj, root=1)

    out = []
    for _ in range(q):
        u, v = int(data[idx]), int(data[idx+1]); idx += 2
        out.append(str(solver.lca(u, v)))

    sys.stdout.write('\\n'.join(out) + '\\n')

if __name__ == '__main__':
    solve()
`,
};
