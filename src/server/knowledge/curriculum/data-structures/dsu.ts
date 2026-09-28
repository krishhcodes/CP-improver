import { ConceptNode } from "../concept-node-type";

export const dsuConcept: ConceptNode = {
  slug: "dsu",
  name: "Disjoint Set Union (DSU / Union-Find)",
  category: "Data Structures",
  difficulty: "BEGINNER",
  description:
    "Near-constant time data structure maintaining dynamic partitions of N elements into disjoint equivalence sets. Supports union and find in amortized O(α(N)). Backbone of Kruskal's MST, online connectivity, and cycle detection.",
  timeComplexity: "O(α(N)) amortized per operation",
  spaceComplexity: "O(N)",
  prerequisites: ["bfs-dfs"],
  dependents: ["mst-kruskal"],
  literatureReferences: [
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 15: Spanning Trees — Disjoint Set Union (pp. 143-146)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Path compression points every visited vertex directly to its set representative root during find(), flattening trees dramatically. Union by size ensures trees never exceed log N depth without compression.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 21: Data Structures for Disjoint Sets",
      keyInsight:
        "Combining Path Compression with Union by Rank/Size guarantees amortized time O(α(N)) per operation, where α is the inverse Ackermann function. α(N) ≤ 4 for any N that can exist in the physical universe.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 2.4.2: Union-Find Disjoint Sets (UFDS)",
      keyInsight:
        "Augmenting DSU roots with extra payload data (component size, min/max, bipartite parity, edge count) solves dynamic connectivity problems with minimal overhead.",
    },
  ],
  conceptualTheory: `## Disjoint Set Union (DSU): A Complete Textbook Chapter

### The Problem: Dynamic Connectivity

**Problem Statement**: You are given N elements (numbered 1..N) and a stream of two types of operations:
1. **Union(u, v)**: Merge the group containing u with the group containing v.
2. **Find(u)**: Return a representative identifier ("root") of u's current group.
3. **Connected(u, v)**: Return true iff u and v are in the same group.

This is the **Dynamic Connectivity Problem**. We need a data structure that handles Q such operations efficiently.

**Why not just use BFS/DFS?** BFS/DFS answers connectivity in O(V + E) time, but for Q queries with dynamic edge additions, re-running BFS/DFS per query gives O(Q × (V + E)) — far too slow.

---

### The Core Data Structure: Forest of Trees

DSU represents the partition as a **forest** (set of trees). Each tree corresponds to one equivalence group. Each node stores a **parent pointer** — if parent[i] = i, then i is the root (representative) of its group.

Initially: each element is its own group: parent[i] = i, size[i] = 1.

**find(i)**: Follow parent pointers until we reach the root (where parent[root] = root). Return root.

**union(u, v)**: Find root of u (call it ru) and root of v (call it rv). If ru ≠ rv, merge by setting parent[ru] = rv (or vice versa). Now both u and v share the same root.

---

### Optimization 1: Union by Size (or Rank)

**Problem with naive union**: If we always attach ru under rv, a sequence of N-1 unions can form a degenerate chain (linear tree):
1 → 2 → 3 → 4 → ... → N

Now find(1) takes O(N) time (traverses the entire chain). Over Q operations: O(Q × N) — terrible.

**Fix**: Always attach the SMALLER tree under the root of the LARGER tree:
\`\`\`
if size[ru] < size[rv]:
    parent[ru] = rv
    size[rv] += size[ru]
else:
    parent[rv] = ru
    size[ru] += size[rv]
\`\`\`

**Analysis**: After union by size, the depth of any tree is at most ⌊log₂ N⌋. 

**Proof**: A node at depth d must be in a subtree of size ≥ 2^d (because to reach depth d, each union that increased depth must have at least doubled the tree size). Since total size ≤ N, depth ≤ log₂ N. ✓

This alone gives O(Q log N) total time.

---

### Optimization 2: Path Compression

**Idea**: During find(i), once we discover the root r, why not point ALL nodes along the search path DIRECTLY to r? Future finds will be O(1)!

\`\`\`
int find(int i) {
    if (parent[i] != i)
        parent[i] = find(parent[i]);  // Recursively compress path
    return parent[i];
}
\`\`\`

This is **path compression with full compression** (also called "path halving" or "two-pass compression"). Every find call simultaneously returns the root AND flattens the path to the root.

After path compression, most future finds for nodes on this path will be O(1).

---

### The Combined Result: Inverse Ackermann Complexity

When BOTH union by size/rank AND path compression are used together:

**Theorem (Tarjan 1975)**: Any sequence of M find and union operations on N elements costs O(M × α(N)) total time, where α is the inverse Ackermann function.

**What is α(N)?**

The Ackermann function A(k,n) grows ASTRONOMICALLY fast:
- A(1,n) = n + 1
- A(2,n) = 2n (exponential growth from A(1,...))
- A(3,n) = 2^(2^(2^...)) (tower of exponentials)
- A(4,n) = unimaginably large

α(N) is the INVERSE: α(N) = min{k : A(k,1) ≥ N}.

For ALL practical purposes:
- α(10^80) = 4 (there are ~10^80 atoms in the universe)
- α(anything realistic) ≤ 4

So α(N) is effectively a CONSTANT. DSU operations are **amortized O(1)** for all practical inputs!

---

### Augmenting DSU with Extra Data

The basic DSU stores only parent/size. But we can attach ANY EXTRA DATA to group roots, updated during union:

**Component size**: \`size[root]\` — already maintained.

**Bipartite parity** (for cycle detection in bipartite graphs):
Store \`parity[i]\` = XOR distance from i to its root.
- find() updates parity along the path.
- When unioning u and v with edge (u,v), check if parity[u] XOR parity[v] XOR 1 == 0 → odd cycle → not bipartite.

**Number of edges in a component**:
Store \`edges[root]\` = count of edges in this component. When union(u, v) with components Ca and Cb: edges[new_root] = edges[root_a] + edges[root_b] + 1.
- If new edges ≥ new size → component has a cycle.

**Minimum/Maximum element** in each component:
Store \`min_val[root]\` and update during union: min_val[new_root] = min(min_val[root_a], min_val[root_b]).

---

### Weighted DSU / Potential-Based DSU

For problems where you need to track RELATIONSHIPS between elements (not just membership):

**Example**: "Group A weights 5 more than Group B. Group B weights 3 more than Group C. What's the weight difference between A and C?"

Store \`weight[i]\` = offset from i to its root. During find, compress paths AND accumulate weights. During union, set the offset to maintain consistency.

This technique handles: online sum queries, relative ordering, range tracking.

---

### Online vs. Offline Connectivity

- **Online**: Queries come one at a time with new edges in between. DSU handles this perfectly.
- **Offline with Deletions**: DSU cannot delete edges. Use "Link-Cut Trees" (advanced, O(log N) per operation) or "Offline LCT with reverse timeline" (add deleted edges first in reverse order, then undo).

---

### Rollback DSU (for Offline Divide-and-Conquer)

Some problems require undoing unions. Standard path compression breaks this. Solution: use Union by RANK (without path compression) and maintain a history stack:

\`\`\`
history = []  // (node_changed, old_parent, old_rank)

def union(u, v):
    ru, rv = find(u), find(v)
    if rank[ru] < rank[rv]: ru, rv = rv, ru
    history.push((rv, parent[rv], rank[ru]))
    parent[rv] = ru
    if rank[ru] == rank[rv]: rank[ru]++

def rollback():
    rv, old_parent, old_rank = history.pop()
    parent[rv] = old_parent
    # Also restore rank if needed
\`\`\`

Without path compression, find() is O(log N). But rollback is O(1). Used in offline segment-tree-on-time (persistent connectivity).`,

  variations: [
    {
      title: "Basic DSU with Path Compression + Union by Size",
      explanation: "The standard implementation using path compression in find() and union by size. Provides amortized O(α(N)) per operation. Handles connectivity queries in any undirected graph.",
      formula: "find(i): return parent[i]==i ? i : (parent[i]=find(parent[i]))",
      timeComplexity: "O(α(N)) amortized",
      spaceComplexity: "O(N)",
    },
    {
      title: "DSU with Component Size Tracking",
      explanation: "Augment DSU roots with size[root] = number of elements in the component. Query component size in O(α(N)). Used when you need to answer 'how many nodes are in u's component?'",
      formula: "size[new_root] = size[ru] + size[rv] during union",
      timeComplexity: "O(α(N)) per operation",
      spaceComplexity: "O(N)",
    },
    {
      title: "Bipartite DSU (Parity Tracking)",
      explanation: "Track XOR parity from each node to root. Detects odd cycles = non-bipartite graphs. When adding edge (u,v), check parity[u] XOR parity[v] == 1 for bipartite validity.",
      formula: "parity[i] = XOR distance to root; odd cycle ↔ parity[u] == parity[v] on same edge",
      timeComplexity: "O(α(N)) per operation",
      spaceComplexity: "O(N)",
    },
    {
      title: "Rollback DSU (Union by Rank, No Path Compression)",
      explanation: "Uses union by rank WITHOUT path compression so unions can be undone in O(1). Required for offline divide-and-conquer + segment tree on time problems. Find is O(log N) instead of O(α(N)).",
      formula: "history stack stores (node, old_parent); rollback restores in O(1)",
      timeComplexity: "O(log N) per find, O(1) rollback",
      spaceComplexity: "O(N + Q) for history",
    },
    {
      title: "DSU on Trees (Small-to-Large Merging)",
      explanation: "Merge subtree information from lighter children into heavier child (DSU-inspired). Amortized O(N log N) total. Used for subtree queries (e.g. count distinct colors in subtree).",
      formula: "Merge lighter set into heavier: each element moved O(log N) times",
      timeComplexity: "O(N log N) total",
      spaceComplexity: "O(N)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Dynamic graph: edges added online, queries ask 'are u and v connected?'",
      cue: "DSU with path compression + union by size. O(α(N)) per query.",
    },
    {
      triggerConstraint: "Minimum spanning tree construction",
      cue: "Kruskal's algorithm uses DSU: sort edges by weight, add edge (u,v) if find(u) ≠ find(v).",
    },
    {
      triggerConstraint: "Count number of connected components after adding edges",
      cue: "DSU: start with N components. Each successful union (find(u) ≠ find(v)) reduces count by 1.",
    },
    {
      triggerConstraint: "Detect cycle in undirected graph as edges are added online",
      cue: "DSU: if find(u) == find(v) when adding edge (u,v), it creates a cycle.",
    },
    {
      triggerConstraint: "Group elements where groups merge but never split",
      cue: "Perfect DSU use case: union-find without deletions.",
    },
    {
      triggerConstraint: "Find largest connected component size at any point",
      cue: "Track max_size variable; update it every time a union is performed: max_size = max(max_size, size[new_root]).",
    },
  ],

  stepByStepStrategy: [
    "1. Initialize: parent[i] = i, size[i] = 1 for all i in [0, N).",
    "2. Implement find(i) with path compression: `return parent[i] == i ? i : (parent[i] = find(parent[i]))`",
    "3. Implement union(u, v): find roots ru = find(u), rv = find(v). If ru == rv, already connected (return false). Else merge smaller under larger: `if size[ru] < size[rv]: swap(ru, rv); parent[rv] = ru; size[ru] += size[rv]`. Return true.",
    "4. Implement connected(u, v): return find(u) == find(v).",
    "5. For component size: query size[find(u)].",
    "6. For Kruskal's MST: sort all edges by weight, iterate edges, add edge if find(u) ≠ find(v) (always union them), stop when N-1 edges added.",
    "7. For cycle detection: if find(u) == find(v) when adding edge (u,v), a cycle exists.",
  ],

  codeTemplate: `#include <vector>
#include <iostream>
#include <numeric>
#include <algorithm>

using namespace std;

// =========================================================
// 1. Basic DSU with Path Compression + Union by Size
// =========================================================
struct DSU {
    vector<int> parent, sz;
    int components;

    DSU(int n) : parent(n), sz(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0); // parent[i] = i
    }

    int find(int i) {
        // Path compression: make every node point directly to root
        if (parent[i] != i)
            parent[i] = find(parent[i]);
        return parent[i];
    }

    // Returns true if this union connected two previously separate components
    bool unite(int u, int v) {
        int ru = find(u), rv = find(v);
        if (ru == rv) return false; // Already connected → cycle detected!

        // Union by size: smaller tree under larger root
        if (sz[ru] < sz[rv]) swap(ru, rv);
        parent[rv] = ru;
        sz[ru] += sz[rv];
        components--;

        return true; // Successfully merged
    }

    bool connected(int u, int v) { return find(u) == find(v); }
    int size(int u) { return sz[find(u)]; }
    int numComponents() { return components; }
};

// =========================================================
// 2. DSU for Kruskal's MST
// =========================================================
struct Edge {
    int u, v, weight;
    bool operator<(const Edge& o) const { return weight < o.weight; }
};

long long kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end()); // Sort by weight ascending

    DSU dsu(n + 1);
    long long mst_cost = 0;
    int edges_added = 0;

    for (auto& [u, v, w] : edges) {
        if (dsu.unite(u, v)) { // Connects two different components
            mst_cost += w;
            if (++edges_added == n - 1) break; // MST complete
        }
        // If find(u) == find(v): adding this edge would create a cycle, skip it
    }

    return (edges_added == n - 1) ? mst_cost : -1; // -1 if graph disconnected
}

// =========================================================
// 3. Bipartite DSU with Parity Tracking
// =========================================================
struct BipartiteDSU {
    vector<int> parent, parity; // parity[i] = XOR distance to root

    BipartiteDSU(int n) : parent(n), parity(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    pair<int, int> find(int i) {
        if (parent[i] == i) return {i, 0};
        auto [root, p] = find(parent[i]);
        parent[i] = root;
        parity[i] ^= parity[parent[i]]; // Accumulate parity along path
        return {root, parity[i]};
    }

    // Add edge (u,v) with expected parity p (0 = same side, 1 = different side)
    // Returns false if adding this edge creates an odd cycle (not bipartite)
    bool unite(int u, int v, int expected_parity = 1) {
        auto [ru, pu] = find(u);
        auto [rv, pv] = find(v);

        if (ru == rv) {
            // u and v already in same component: check if consistent
            return (pu ^ pv) == expected_parity; // false = odd cycle!
        }

        parent[rv] = ru;
        parity[rv] = pu ^ pv ^ expected_parity; // Ensure consistency
        return true;
    }
};

// =========================================================
// 4. Rollback DSU (for Divide & Conquer — no path compression)
// =========================================================
struct RollbackDSU {
    vector<int> parent, rank_;
    vector<pair<int*, int>> history; // (pointer, old_value)

    RollbackDSU(int n) : parent(n), rank_(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        // No path compression! Must be reversible
        while (parent[i] != i) i = parent[i];
        return i;
    }

    void unite(int u, int v) {
        int ru = find(u), rv = find(v);
        if (ru == rv) { history.push_back({nullptr, 0}); return; }
        if (rank_[ru] < rank_[rv]) swap(ru, rv);
        history.push_back({&parent[rv], parent[rv]});
        parent[rv] = ru;
        if (rank_[ru] == rank_[rv]) {
            history.push_back({&rank_[ru], rank_[ru]});
            rank_[ru]++;
        } else {
            history.push_back({nullptr, 0});
        }
    }

    void rollback() {
        // Undo last two history entries
        auto [ptr2, val2] = history.back(); history.pop_back();
        if (ptr2) *ptr2 = val2;
        auto [ptr1, val1] = history.back(); history.pop_back();
        if (ptr1) *ptr1 = val1;
    }

    bool connected(int u, int v) { return find(u) == find(v); }
};`,

  pitfalls: [
    "Forgetting Path Compression: find() WITHOUT path compression on a linearly unioned chain degrades to O(N) per call. Always use the recursive `parent[i] = find(parent[i])` form.",
    "Union by Arbitrary Attachment (No Size/Rank): Always merging smaller root into larger causes O(log N) trees without compression, but without both optimizations, trees can be degenerate chains.",
    "Off-by-One in 0-indexed vs 1-indexed: Initialize DSU for N+1 nodes if elements are 1-indexed. A common bug is initializing for N nodes but querying index N.",
    "Checking `parent[u] == parent[v]` instead of `find(u) == find(v)`: Parent pointers may not point directly to roots unless path compression has been applied. Always use find().",
    "Modifying Size of Wrong Root: In union(), size must be updated at the NEW root (the one that absorbs the other), not the node being attached. Double-check which root becomes the parent.",
    "Using Path Compression in Rollback DSU: Path compression is not undoable (it changes many parent pointers at once without a history trail). Rollback DSU must use find() WITHOUT path compression.",
  ],

  practiceProblems: [
    {
      name: "Road Construction (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1676",
      platform: "CSES",
      hint: "Add edges one by one, track number of components and max component size after each edge using DSU.",
    },
    {
      name: "Building Roads (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1666",
      platform: "CSES",
      hint: "Find connected components with DSU. Need N-1 roads minimum: one per component pair.",
    },
    {
      name: "Kruskal's Algorithm (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1675",
      platform: "CSES",
      hint: "Sort edges, use DSU to add edges greedily. Sum of added edge weights = MST cost.",
    },
    {
      name: "New Roads Queries (CSES)",
      rating: 1700,
      url: "https://cses.fi/problemset/task/1676",
      platform: "CSES",
      hint: "Offline queries — sort by query time. Use DSU to answer each query as edges are added.",
    },
    {
      name: "Bipartite Checking (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1669",
      platform: "CSES",
      hint: "Use parity-tracking DSU or simple 2-coloring BFS. Not bipartite = odd cycle exists.",
    },
  ],

  deepExplanation: {
    intuition:
      `Imagine you have N people, each in their own separate room. You have a list of "friendship" announcements: "A and B are now friends." Friends of friends become the same group. The question: are A and Z in the same group right now?

DSU models each group as a tree. The "leader" of each group is the tree root. To check if A and Z are in the same group: follow parent pointers from A up to its root, and from Z up to its root. Same root = same group.

**Path compression** is the insight that says: "After I found the root, let me not throw away that knowledge. I'll point every node I visited directly to the root, so next time I start from any of them, I reach the root in one step." This is like caching the answer.

**Union by size** says: "When merging two groups, always absorb the smaller one into the larger one." This prevents degenerate scenarios where one group is a long chain and finding its root takes O(N) steps.

Together, these two optimizations create an almost magical synergy: path compression flattens trees, union by size prevents them from getting too tall in the first place. The result is near-O(1) per operation for any practical input.

The inverse Ackermann function α(N) grows SO SLOWLY that it's effectively a constant. To give you intuition: α(10^80) = 4. There are only ~10^80 atoms in the observable universe. So α(N) ≤ 5 for literally any input you will ever encounter.`,

    proofOfCorrectness:
      `**Claim**: With union by size only (no path compression), find() takes O(log N) time.

**Proof**: We claim that if node i is at depth d in the tree, then its subtree contains at least 2^d nodes.

*Base*: d=0 (root). Subtree has ≥ 1 = 2^0 nodes. ✓

*Inductive step*: Suppose node i is at depth d+1. It was made a child when we merged a smaller tree (containing i) under a larger tree. Just before the merge, i's subtree size ≤ the larger tree's size. After merge, i's subtree size + larger tree's size ≥ 2 × (i's subtree size). By induction, i's subtree had ≥ 2^d nodes before the merge. After merge, the whole tree has ≥ 2^d + 2^d = 2^(d+1) nodes. So depth d+1 requires ≥ 2^(d+1) nodes. ✓

Since total nodes ≤ N: 2^d ≤ N → d ≤ log₂ N. Find is O(log N). ✓

**Full complexity with both optimizations** (Tarjan's analysis):
The proof uses a "potential function" argument that accounts for how path compression destroys potential for future slow operations. The key insight: high-depth nodes (expensive to find) are the ones that get the most compression applied. After being compressed, they'll be free in the future. The amortized cost works out to O(α(N)) per operation.`,

    complexityDerivation:
      `**Time Complexity**: O(α(N)) amortized per operation with both optimizations.

Without any optimization: O(N) worst case (chain tree).
With union by size only: O(log N) per find.
With path compression only: O(log N) amortized per find.
With BOTH: O(α(N)) amortized ≈ O(1) for all practical N.

**Space Complexity**: O(N) for parent[] and size[] arrays.

**Practical Performance**:
- N = 10^6, Q = 10^6 operations: Total ≈ 4 × 10^6 operations (since α(10^6) ≤ 4) → ~5ms in C++.
- The constant factor is extremely small: just array accesses and pointer chasing.

**Rollback DSU** (no path compression, with union by rank): O(log N) per find, O(1) rollback. Used when you need to undo unions (offline algorithms).`,

    whenNotToUse:
      `**Do NOT use DSU when**:
1. **You need to delete edges / split groups**: DSU only supports merging, not splitting. Use Link-Cut Trees (O(log N) per operation) for fully dynamic connectivity.
2. **You need to enumerate all members of a component**: DSU only gives the representative root. To enumerate, maintain a separate adjacency list.
3. **Graph has directed edges**: DSU is for UNDIRECTED connectivity (symmetry required). For directed connectivity, use Kosaraju's or Tarjan's SCC algorithm.
4. **You need shortest paths**: DSU only tells you IF connected, not the distance or path. Use BFS/Dijkstra.`,
  },

  workedExample: {
    title: "DSU Union Trace — Building Connectivity Step by Step",
    scenario: "N=6 elements. Operations: union(1,2), union(3,4), union(2,3), connected(1,4)?, union(5,6), union(4,6).",
    input: "Initially: parent=[1,2,3,4,5,6], size=[1,1,1,1,1,1], components=6.",
    output: "After all unions: one giant component {1,2,3,4,5,6}. connected(1,4) = true.",
    traceSteps: [
      {
        step: 1,
        state: "union(1, 2)",
        action: "find(1)=1, find(2)=2. ru=1, rv=2. size[1]=size[2]=1 (equal). Attach rv=2 under ru=1. parent[2]=1, size[1]=2. components=5.",
        insight: "Two singleton groups merged. Root 1 now represents {1,2}."
      },
      {
        step: 2,
        state: "union(3, 4)",
        action: "find(3)=3, find(4)=4. Both singletons. Attach 4 under 3. parent[4]=3, size[3]=2. components=4.",
        insight: "Group {3,4} formed. State: {1,2}, {3,4}, {5}, {6}."
      },
      {
        step: 3,
        state: "union(2, 3)",
        action: "find(2): parent[2]=1, return 1. find(3)=3. ru=1, rv=3. size[1]=size[3]=2 (equal). Attach rv=3 under ru=1. parent[3]=1, size[1]=4. components=3.",
        insight: "Groups {1,2} and {3,4} merged into {1,2,3,4}. Root 1 now has size 4."
      },
      {
        step: 4,
        state: "connected(1, 4)?",
        action: "find(1)=1. find(4): parent[4]=3, find(3): parent[3]=1, PATH COMPRESSION: parent[3] already=1. Return 1. find(4)=1. So find(1)==find(4)? 1==1 → YES!",
        insight: "Path compression fires: on find(4) we verify parent[4]=3, parent[3]=1. After call, parent[4] gets compressed to point directly to 1."
      },
      {
        step: 5,
        state: "union(5, 6)",
        action: "find(5)=5, find(6)=6. Attach 6 under 5. parent[6]=5, size[5]=2. components=2.",
        insight: "Group {5,6} formed. State: {1,2,3,4}, {5,6}."
      },
      {
        step: 6,
        state: "union(4, 6)",
        action: "find(4)=1 (path compressed). find(6): parent[6]=5, return 5. ru=1, rv=5. size[1]=4 > size[5]=2. Attach rv=5 under ru=1. parent[5]=1, size[1]=6. components=1.",
        insight: "Final merge: all 6 elements in one component rooted at 1. Done!"
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Checking Parent Directly Instead of find()",
      cause: "After path compression, parent[u] might point to a mid-level node, not the root. Checking parent[u] == parent[v] gives wrong results.",
      fix: "Always use find(u) == find(v) to compare group membership. Never compare parent[] pointers directly.",
      wrongSnippet: "if (parent[u] == parent[v]) // WRONG! Parents may not be roots after compression",
      correctedSnippet: "if (find(u) == find(v)) // CORRECT: find() always returns the root",
    },
    {
      trap: "Updating Size of Wrong Node",
      cause: "When attaching rv under ru, size[ru] grows. If you accidentally write size[rv] += size[ru] instead, the larger tree's size is wrong for all future union decisions.",
      fix: "Always update the new ROOT's size: `size[ru] += size[rv]` where ru is the parent (the tree that absorbs rv).",
      wrongSnippet: "parent[rv] = ru; size[rv] += size[ru]; // Wrong! rv is no longer a root",
      correctedSnippet: "parent[rv] = ru; size[ru] += size[rv]; // Correct: update the new root's size",
    },
    {
      trap: "Using Path Compression in Rollback DSU",
      cause: "Path compression modifies multiple parent pointers and cannot be undone without tracking every single pointer changed. Standard rollback DSU must not use path compression.",
      fix: "For rollback DSU: use union by rank only. Accept O(log N) per find. Store old parent values in history stack.",
      wrongSnippet: "int find(int i) { return parent[i]==i ? i : parent[i]=find(parent[i]); } // Can't undo!",
      correctedSnippet: "int find(int i) { while(parent[i]!=i) i=parent[i]; return i; } // O(log N), undoable",
    },
  ],

  pythonTemplate: `import sys
from typing import List, Optional

class DSU:
    """
    Disjoint Set Union with path compression and union by size.
    Amortized O(α(N)) ≈ O(1) per operation.
    """
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, i: int) -> int:
        """Find root of i's component with path compression."""
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])  # Path compression
        return self.parent[i]

    def union(self, u: int, v: int) -> bool:
        """
        Merge components of u and v.
        Returns True if they were in different components (successful merge).
        Returns False if already connected (would create a cycle).
        """
        ru, rv = self.find(u), self.find(v)
        if ru == rv:
            return False  # Already in same component

        # Union by size: smaller under larger
        if self.size[ru] < self.size[rv]:
            ru, rv = rv, ru
        self.parent[rv] = ru
        self.size[ru] += self.size[rv]
        self.components -= 1
        return True

    def connected(self, u: int, v: int) -> bool:
        return self.find(u) == self.find(v)

    def component_size(self, u: int) -> int:
        return self.size[self.find(u)]


class BipartiteDSU:
    """
    DSU with parity tracking to detect odd cycles (non-bipartite).
    parity[i] = XOR distance from i to its root (0 = same side, 1 = opposite side).
    """
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.parity = [0] * n  # Offset to root

    def find(self, i: int):
        """Returns (root, parity_to_root)."""
        if self.parent[i] == i:
            return i, 0
        root, p = self.find(self.parent[i])
        self.parent[i] = root
        self.parity[i] ^= self.parity[self.parent[i]]
        return root, self.parity[i]

    def union(self, u: int, v: int, expected_parity: int = 1) -> bool:
        """
        Add edge between u and v. expected_parity=1 means they should be on opposite sides.
        Returns False if this creates an odd cycle (not bipartite).
        """
        ru, pu = self.find(u)
        rv, pv = self.find(v)

        if ru == rv:
            return (pu ^ pv) == expected_parity  # Consistent?

        if self.rank[ru] < self.rank[rv]:
            ru, rv = rv, ru
            pu, pv = pv, pu
        self.parent[rv] = ru
        self.parity[rv] = pu ^ pv ^ expected_parity
        if self.rank[ru] == self.rank[rv]:
            self.rank[ru] += 1
        return True


class RollbackDSU:
    """
    DSU that supports undo (rollback). Uses union by rank WITHOUT path compression.
    find() is O(log N). rollback() is O(1).
    Used in offline divide-and-conquer or segment tree on time problems.
    """
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.history = []  # [(node, old_parent, node2, old_rank)]

    def find(self, i: int) -> int:
        while self.parent[i] != i:
            i = self.parent[i]
        return i

    def union(self, u: int, v: int):
        ru, rv = self.find(u), self.find(v)
        if ru == rv:
            self.history.append(None)  # No-op marker
            return
        if self.rank[ru] < self.rank[rv]:
            ru, rv = rv, ru
        # Save state before modification
        old_rank = self.rank[ru]
        self.history.append((rv, self.parent[rv], ru, old_rank))
        self.parent[rv] = ru
        if self.rank[ru] == self.rank[rv]:
            self.rank[ru] += 1

    def rollback(self):
        entry = self.history.pop()
        if entry is None:
            return  # Was a no-op
        rv, old_parent_rv, ru, old_rank_ru = entry
        self.parent[rv] = old_parent_rv
        self.rank[ru] = old_rank_ru

    def connected(self, u: int, v: int) -> bool:
        return self.find(u) == self.find(v)


if __name__ == '__main__':
    input = sys.stdin.readline
    n, q = map(int, input().split())
    dsu = DSU(n + 1)

    for _ in range(q):
        op, u, v = input().split()
        u, v = int(u), int(v)
        if op == '?':
            print('YES' if dsu.connected(u, v) else 'NO')
        else:
            dsu.union(u, v)
`,
};
