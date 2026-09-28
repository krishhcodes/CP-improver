import { ConceptNode } from "../concept-node-type";

export const mstKruskalConcept: ConceptNode = {
  slug: "mst-kruskal",
  name: "Minimum Spanning Tree (Kruskal & Prim)",
  category: "Graph Theory",
  difficulty: "INTERMEDIATE",
  description:
    "Greedy edge selection paired with Disjoint Set Union (DSU) or Priority Queues building spanning trees of minimal total weight in O(E log E). Full coverage of Cut Property proof, Kruskal vs Prim, Minimax paths, and Second-Best MST.",
  timeComplexity: "O(E log E) or O(E log V)",
  spaceComplexity: "O(V + E)",
  prerequisites: ["dsu"],
  dependents: [],
  literatureReferences: [
    {
      source: "USACO Guide (Gold)",
      section: "Minimum Spanning Trees",
      url: "https://usaco.guide/gold/mst",
      keyInsight:
        "Kruskal processes edges in ascending weight order. Using DSU to guard against cycles yields an optimal spanning tree by the Cut Property.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 23: Minimum Spanning Trees — The Algorithms of Kruskal and Prim (pp. 624-642)",
      keyInsight:
        "The Cut Property: For any cut of the graph G, the lightest edge crossing the cut belongs to some Minimum Spanning Tree. Both Kruskal and Prim are instantiations of the generic MST algorithm based on this property.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 15: Spanning Trees — Kruskal's Algorithm (pp. 143-150)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "A spanning tree with minimal total weight also minimizes the maximum edge weight on any path between two vertices (Minimax / Bottleneck Spanning Tree). This remarkable property enables O(log V) bottleneck queries via binary lifting on the MST.",
    },
  ],
  conceptualTheory: `## Minimum Spanning Trees: A Complete Textbook Chapter

### What Is a Spanning Tree?

Given a connected, undirected graph G = (V, E) with N vertices and M edges:

A **spanning tree** T of G is a subgraph that:
1. Contains ALL N vertices.
2. Is **connected** (there's a path between every pair of vertices).
3. Has **NO cycles**.
4. Has exactly **N-1 edges** (a tree always has exactly V-1 edges).

A **Minimum Spanning Tree (MST)** is the spanning tree with the MINIMUM total edge weight.

**Real-world interpretation**: You have N cities and a list of possible roads between them. Each road has a construction cost. Find the cheapest set of roads that keeps all cities connected.

**Key observation**: Since a spanning tree must have N-1 edges and be connected with no cycles, we're choosing exactly N-1 edges out of all M edges to include, subject to the tree constraint.

---

### Properties of MSTs

**Property 1: Uniqueness**
If all edge weights are DISTINCT, the MST is UNIQUE. If some edges share weights, there may be multiple MSTs but all have the same total weight.

**Property 2: The Cut Property** (the most important theorem)
> For any partition of vertices into two groups S and V-S, the minimum-weight edge crossing between the groups belongs to SOME MST.

**Property 3: The Cycle Property** (the dual theorem)
> For any cycle in the graph, the maximum-weight edge on that cycle does NOT appear in any MST (assuming distinct weights).

**Property 4: MST ↔ Minimax Path**
The path between any two vertices u and v in the MST minimizes the maximum edge weight on any u-v path in the original graph. The MST IS the "bottleneck spanning tree."

---

### Proof of the Cut Property

**Theorem**: Let (S, V-S) be any partition of vertices. Let e = (u, v) be the minimum-weight edge where u ∈ S and v ∈ V-S. Then e belongs to SOME MST.

**Proof by Exchange Argument**:

Suppose some MST T does NOT contain e. Add e to T — this creates exactly ONE cycle C in T ∪ {e} (since T was a tree).

This cycle C must cross the partition cut (S, V-S) at least twice:
- Once via e = (u, v) (we just added it, crossing S → V-S).
- At least once more (to return from V-S to S to close the cycle).

Let f = (x, y) be another edge on cycle C that crosses the cut (x ∈ S, y ∈ V-S).

Now form T' = T ∪ {e} \\ {f} (add e, remove f):
- T' is still connected (C minus f is a path from x to y through e, restoring connectivity).
- T' has N-1 edges (same as T).
- T' is a spanning tree.
- Weight: w(T') = w(T) - w(f) + w(e) ≤ w(T) since w(e) ≤ w(f) (e is the min-weight crossing edge).

So T' is an MST that CONTAINS e. ✓

**Corollary**: Kruskal's algorithm is correct, because at each step it selects the minimum-weight edge crossing some cut (between the current MST fragments), which by the Cut Property must be in some MST.

---

### Kruskal's Algorithm — Complete Description

**Algorithm**:
1. Sort all M edges in non-decreasing weight order. Time: O(M log M).
2. Initialize DSU with N singletons (each vertex is its own component).
3. For each edge (u, v, w) in sorted order:
   - If find(u) ≠ find(v): ACCEPT the edge. Add to MST. Call union(u, v). total_cost += w.
   - If find(u) == find(v): REJECT the edge (would create a cycle).
4. Stop when N-1 edges accepted (MST complete) or all edges processed.
5. If accepted < N-1: graph is DISCONNECTED (no spanning tree exists).

**Why does rejecting cycles work?** When we consider edge (u,v) and u,v are already connected, adding this edge would create a cycle. By the Cycle Property, this edge (being processed later than the edges already in the tree, thus with weight ≥ them on the cycle) should be excluded from the MST.

**Time**: O(M log M) for sorting + O(M α(N)) for DSU ≈ O(M log M).

---

### Prim's Algorithm — Complete Description

**Algorithm**: Grow the MST from a starting vertex, always adding the cheapest edge that connects the current tree to a new (unvisited) vertex.

\`\`\`
dist[s] = 0 for start vertex, INF for all others
in_MST[v] = false for all v
Priority Queue PQ = {(0, s)}

while PQ not empty:
    (d, u) = PQ.pop_min()
    if in_MST[u]: continue   // Already in MST tree
    in_MST[u] = true
    total_cost += d
    for each neighbor (v, w) of u:
        if not in_MST[v] and w < dist[v]:
            dist[v] = w
            PQ.push((w, v))
\`\`\`

**Time**: O(M log V) with binary heap.

**Kruskal vs Prim**:
| | Kruskal | Prim |
|---|---|---|
| **Best for** | Sparse graphs | Dense graphs |
| **Core idea** | Sort all edges + DSU | Dijkstra-like from a vertex |
| **Time** | O(M log M) | O(M log V) with heap, O(V²) with matrix |
| **Contest preference** | Usually preferred (simpler) | Better for dense graphs |

---

### Maximum Spanning Tree

To find the MAXIMUM spanning tree (maximize total weight):
- Either sort edges in DESCENDING order and run Kruskal as normal.
- Or negate all weights and find the minimum spanning tree.

**Application**: USACO Superbull — maximize XOR sum of connected farm pairs.

---

### Minimax Path Queries on MST

**Problem**: "What is the minimum possible maximum edge weight when traveling from city u to city v?"

**Answer**: The maximum edge weight on the unique path from u to v in the MST.

Why? The MST path minimizes the maximum edge (Bottleneck property). Any other path in the original graph has a maximum edge ≥ the MST path's maximum.

**Implementation**: After building MST, use Binary Lifting (LCA + path max) to answer queries in O(log N). See Binary Lifting concept.

---

### Second-Best MST

The second-best MST has the minimum weight among all spanning trees that differ from the optimal MST in at least one edge.

**Algorithm**:
1. Build the MST. Total weight = W.
2. For each non-MST edge e = (u, v, w_e):
   - Find the maximum-weight edge on the MST path from u to v: max_w = max_MST_edge(u, v).
   - Swapping: new_weight = W - max_w + w_e.
3. Second-best MST weight = min over all non-MST edges of new_weight.

Pre-compute max_MST_edge(u, v) for all pairs using LCA + binary lifting (O(log N) per query) or brute-force DFS on the MST (O(N) per query).`,

  variations: [
    {
      title: "Kruskal's Algorithm (DSU-Based, Sparse Graphs)",
      explanation: "Sort all edges by weight, then greedily add each edge if it doesn't create a cycle (checked via DSU). Best for sparse graphs. Standard competitive programming choice.",
      formula: "sort edges; for each edge: if find(u) != find(v): add to MST, unite(u,v)",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Prim's Algorithm (Priority Queue, Dense Graphs)",
      explanation: "Grow MST from a source vertex. Always add cheapest edge from current MST to an unvisited vertex. Uses min-heap similarly to Dijkstra. Better for dense graphs (E ≈ V²).",
      formula: "dist[v] = min outgoing edge weight from MST to v; add min-dist vertex each step",
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Maximum Spanning Tree",
      explanation: "Sort edges in DESCENDING order (or negate weights) and run Kruskal. Maximizes total tree weight. Used in problems requiring maximum XOR/AND connectivity.",
      formula: "Sort descending; same Kruskal algorithm",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Minimax Path (Bottleneck Queries on MST)",
      explanation: "The MST minimizes the maximum edge weight on any path. After building MST, use binary lifting to answer 'min possible max edge from u to v' in O(log V).",
      formula: "bottleneck(u,v) = max_edge on MST path from u to v",
      timeComplexity: "O(E log E) build + O(log V) per query",
      spaceComplexity: "O(V log V)",
    },
    {
      title: "Second-Best MST",
      explanation: "For each non-MST edge, try swapping it with the maximum-weight MST edge on the path it creates. Take the minimum resulting weight as second-best MST.",
      formula: "2nd_MST = min over non-MST edges e: W(MST) - max_path_edge(u,v) + w(e)",
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V log V)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Connect all N cities/computers/nodes with minimum total cost (N ≤ 2*10^5)",
      cue: "Minimum Spanning Tree via Kruskal's Algorithm in O(E log E). Sort edges, use DSU.",
    },
    {
      triggerConstraint: "Minimize the maximum edge weight on any path between two specific nodes",
      cue: "MST Bottleneck Property: build MST, then max edge on MST path = answer. Use LCA + binary lifting for queries.",
    },
    {
      triggerConstraint: "Maximum possible sum of connected pairs (e.g. farm XOR values)",
      cue: "Maximum Spanning Tree: sort edges descending, run Kruskal.",
    },
    {
      triggerConstraint: "Is it possible to connect all nodes? If so, what's the minimum cost?",
      cue: "Kruskal with disconnection check: if MST has < N-1 edges, graph is disconnected.",
    },
    {
      triggerConstraint: "After building MST, find path maximum/minimum between pairs efficiently",
      cue: "Binary Lifting on MST: precompute ancestor + path-max, answer each query O(log N).",
    },
  ],

  stepByStepStrategy: [
    "1. Define Edge Struct: `struct Edge { int u, v; long long w; bool operator<(const Edge& o) const { return w < o.w; } }`",
    "2. Sort all edges by weight ascending: `sort(edges.begin(), edges.end())`.",
    "3. Initialize DSU for N+1 nodes (handle 1-indexing).",
    "4. For each edge in sorted order: `if (dsu.unite(u, v)) { mst_cost += w; edges_added++; if (edges_added == N-1) break; }`",
    "5. After loop: if edges_added < N-1, the graph is DISCONNECTED — output 'IMPOSSIBLE'.",
    "6. For Minimax queries: after MST, run DFS to set parent/depth, build binary lifting table with path-max stored at each lift level.",
    "7. Always use `long long` for `mst_cost` since weight sums can exceed 2*10^9.",
  ],

  codeTemplate: `#include <vector>
#include <algorithm>
#include <numeric>
#include <iostream>

using namespace std;

// =========================================================
// DSU (Disjoint Set Union) for cycle detection
// =========================================================
struct DSU {
    vector<int> parent, sz;
    int components;

    DSU(int n) : parent(n + 1), sz(n + 1, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        return parent[i] == i ? i : (parent[i] = find(parent[i]));
    }

    bool unite(int u, int v) {
        int ru = find(u), rv = find(v);
        if (ru == rv) return false; // Same component: would create cycle
        if (sz[ru] < sz[rv]) swap(ru, rv);
        parent[rv] = ru;
        sz[ru] += sz[rv];
        components--;
        return true;
    }
};

// =========================================================
// Edge struct with comparison for sorting
// =========================================================
struct Edge {
    int u, v;
    long long w;
    bool operator<(const Edge& o) const { return w < o.w; }
};

// =========================================================
// Kruskal's MST — O(E log E)
// =========================================================
pair<long long, vector<Edge>> kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end()); // Sort by weight ascending

    DSU dsu(n);
    long long total = 0;
    vector<Edge> mst;

    for (auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            total += e.w;
            mst.push_back(e);
            if ((int)mst.size() == n - 1) break; // MST complete
        }
    }

    if ((int)mst.size() < n - 1) return {-1, {}}; // Disconnected!
    return {total, mst};
}

// =========================================================
// Prim's MST — O(E log V)
// =========================================================
#include <queue>
long long prim(int n, const vector<vector<pair<int,long long>>>& adj) {
    const long long INF = 1e18;
    vector<long long> dist(n + 1, INF);
    vector<bool> in_mst(n + 1, false);
    priority_queue<pair<long long,int>,
                   vector<pair<long long,int>>,
                   greater<>> pq;

    dist[1] = 0;
    pq.push({0, 1});
    long long total = 0;

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (in_mst[u]) continue;
        in_mst[u] = true;
        total += d;

        for (auto& [v, w] : adj[u]) {
            if (!in_mst[v] && w < dist[v]) {
                dist[v] = w;
                pq.push({dist[v], v});
            }
        }
    }

    return total;
}

// =========================================================
// Maximum Spanning Tree (sort descending)
// =========================================================
long long maxSpanningTree(int n, vector<Edge>& edges) {
    // Sort DESCENDING to build maximum spanning tree
    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.w > b.w; // Reverse order
    });

    DSU dsu(n);
    long long total = 0;
    int count = 0;

    for (auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            total += e.w;
            if (++count == n - 1) break;
        }
    }

    return (count == n - 1) ? total : -1;
}`,

  pitfalls: [
    "Disconnected Graph Assumption: Forgetting to verify `mst_edges.size() == n - 1`. If disconnected, Kruskal terminates with fewer than N-1 edges but no error. Always check and output 'IMPOSSIBLE' if graph is disconnected.",
    "32-Bit Integer Overflow on Total Weight: Summing up to 2*10^5 edges of weight 10^9 produces 2*10^14, which wraps 32-bit signed int. Use `long long` for total weight AND individual edge weights.",
    "0-Indexed vs 1-Indexed Nodes: DSU must be sized N+1 for 1-indexed nodes. A common bug is DSU(N) when nodes are 1..N, leaving index N out of bounds.",
    "Maximum vs Minimum: For maximum spanning tree, sort edges DESCENDING. A very common mistake is forgetting to flip the sort order.",
    "Prim's stale entry check: Like Dijkstra, Prim's min-heap can have stale entries. Always check `if (in_mst[u]) continue` after popping.",
    "Equal weight edge handling: Multiple MSTs may exist when edges have equal weights. This is fine for total weight computation but matters for second-best MST computation.",
  ],

  practiceProblems: [
    {
      name: "Road Reparation (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1675",
      platform: "CSES",
      hint: "Standard Kruskal MST. Return 'IMPOSSIBLE' if edges_count < n-1.",
    },
    {
      name: "Road Construction (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1676",
      platform: "CSES",
      hint: "Track number of components and max component size after each edge using DSU. Essentially Kruskal with tracking.",
    },
    {
      name: "Superbull (USACO Silver)",
      rating: 1400,
      url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=531",
      platform: "USACO",
      hint: "Maximum Spanning Tree: Build complete graph where edge weight is a[i] XOR a[j], sort in descending order.",
    },
    {
      name: "Design Tutorial: Inverse the Problem (CF 472D)",
      rating: 2100,
      url: "https://codeforces.com/problemset/problem/472/D",
      platform: "Codeforces",
      hint: "Construct MST from pairwise distance matrix using Kruskal, then verify if tree distances match original matrix.",
    },
    {
      name: "New Roads Queries (CSES)",
      rating: 1700,
      url: "https://cses.fi/problemset/task/1685",
      platform: "CSES",
      hint: "Offline: sort queries by time, add edges using DSU. Answer each query as roads are added.",
    },
  ],

  deepExplanation: {
    intuition:
      `An MST is the cheapest "backbone" that keeps all vertices connected. Think of building a minimum-cost fiber optic network across N cities: you need all cities connected, you can't afford redundant links (cycles are wasteful), and you want to minimize total cable length. The MST is the exact solution.

Kruskal's algorithm is based on a beautiful greedy insight: at every step, consider the cheapest remaining edge. If it connects two currently disconnected components, it MUST be in the MST (by the Cut Property — it's the cheapest edge crossing the cut between those components). If it connects two already-connected components, adding it creates a cycle, and by the Cycle Property, this expensive edge wouldn't be in any MST anyway.

The Cut Property is the mathematical heart of BOTH Kruskal and Prim. Kruskal finds the lightest edge crossing the cut between ANY two distinct components at each step. Prim finds the lightest edge crossing the cut between the current MST fragment and ALL remaining vertices.

The Minimax path property is a profound bonus: not only does the MST minimize total weight, it also minimizes the "worst bottleneck" on any path. If you need to travel from city A to city B and minimize the maximum road toll you'll encounter, the MST path gives you the optimal route. This transforms the MST into a powerful preprocessing structure for bottleneck queries.`,

    proofOfCorrectness:
      `**Theorem (Kruskal's Correctness by Matroid Theory)**: Kruskal's algorithm produces a Minimum Spanning Tree.

**Proof outline using the Cut Property**:
We prove by induction that after adding each edge, the current set of accepted edges is a subset of SOME MST.

*Inductive step*: Suppose edges e₁, ..., eₖ accepted so far are all in some MST T*. The next accepted edge eₖ₊₁ = (u, v, w) connects two different DSU components C_u and C_v (otherwise it would be rejected).

The cut S = C_u, V-S = V-C_u partitions the vertices. Edge eₖ₊₁ crosses this cut. Is it the lightest crossing edge?

All edges lighter than eₖ₊₁ were processed earlier. Why weren't they added? Either:
(a) They were rejected (same DSU component = would create cycle), or
(b) They were accepted (added to MST subset).

Any lighter crossing edge of this cut must have been accepted (it connected two components, so it wouldn't create a cycle). But then u and v would already be in the same component, contradicting our assumption that eₖ₊₁ crosses the cut!

Therefore, eₖ₊₁ IS the lightest crossing edge for this cut. By the Cut Property, eₖ₊₁ belongs to SOME MST. Combined with the inductive hypothesis, e₁,...,eₖ₊₁ are all in some (possibly different) MST T'. QED.`,

    complexityDerivation:
      `**Time Complexity**: O(E log E) = O(E log V) since E ≤ V².

1. Sorting M edges: O(M log M).
2. Processing M edges through DSU: Each operation is O(α(N)) amortized ≈ O(1). Total: O(M).
3. Combined: O(M log M) dominates.

**Practical benchmarks (C++)**:
- M = 2*10^5: ~2*10^5 * 17 ≈ 3.4*10^6 operations → < 10ms.
- M = 10^6: ~10^6 * 20 = 2*10^7 → ~50ms. Easily within 1-2s limits.

**Space Complexity**: O(V + E).
- DSU arrays: O(V).
- Sorted edge list: O(E).
- MST edge list: O(V) (V-1 edges).

**Prim's Complexity**:
- With binary min-heap: O(E log V). Each edge triggers at most one heap push.
- With Fibonacci heap: O(E + V log V) theoretically, but complex implementation.
- For dense graphs (E ≈ V²): use O(V²) array-based Prim (scan all vertices for minimum each iteration, no heap needed).`,

    whenNotToUse:
      `**Do NOT use Kruskal/Prim when**:
1. **Graph is directed**: MST is defined for undirected graphs. For directed graphs, use Minimum Spanning Arborescence (Edmonds' algorithm / Chu-Liu-Edmonds).
2. **Only want specific node pairs connected**: Use Steiner Tree problem (NP-hard in general). If only two terminal nodes, use shortest path.
3. **Graph is dense AND V is large (V ≥ 10^4)**: Consider O(V²) Prim over O(E log V) Kruskal since E = V² makes Kruskal O(V² log V) which is worse.
4. **You need the cheapest path between two specific nodes**: That's shortest path (Dijkstra), not MST. MST minimizes TOTAL cost of connecting ALL nodes.
5. **Edges have negative weights**: MST algorithms still work with negative weights (just sort correctly). Unlike shortest paths, there's no failure case here — just sort and run normally.`,
  },

  workedExample: {
    title: "Kruskal MST — Step-by-Step Edge Selection Trace",
    scenario: "5 vertices {1,2,3,4,5}. Edges: (1-2,w=1), (2-3,w=2), (1-3,w=3), (3-4,w=4), (2-4,w=5), (4-5,w=6), (3-5,w=7). Need MST.",
    input: "N=5, M=7. Sorted edges by weight: [(1-2,1), (2-3,2), (1-3,3), (3-4,4), (2-4,5), (4-5,6), (3-5,7)]. Need 4 MST edges.",
    output: "MST cost = 1+2+4+6 = 13. Edges: (1-2), (2-3), (3-4), (4-5).",
    traceSteps: [
      {
        step: 1,
        state: "Process (1-2, w=1)",
        action: "find(1)=1, find(2)=2 → DIFFERENT. Unite {1,2}. MST cost=1. DSU components=4. MST edges: 1/4.",
        insight: "Cheapest edge in graph. Always in MST by Cut Property."
      },
      {
        step: 2,
        state: "Process (2-3, w=2)",
        action: "find(2)=1 (compressed), find(3)=3 → DIFFERENT. Unite {1,2,3}. MST cost=3. MST edges: 2/4.",
        insight: "Connects vertex 3 to existing component."
      },
      {
        step: 3,
        state: "Process (1-3, w=3)",
        action: "find(1)=1, find(3)=1 → SAME COMPONENT! Reject (would create cycle 1-2-3-1).",
        insight: "DSU detects cycle in O(α(N)) ≈ O(1). Edge discarded."
      },
      {
        step: 4,
        state: "Process (3-4, w=4)",
        action: "find(3)=1, find(4)=4 → DIFFERENT. Unite {1,2,3,4}. MST cost=7. MST edges: 3/4.",
        insight: "Vertex 4 joins the main component."
      },
      {
        step: 5,
        state: "Process (2-4, w=5)",
        action: "find(2)=1, find(4)=1 → SAME COMPONENT! Reject (cycle 2-3-4-2).",
        insight: "Another rejection. No cycle added."
      },
      {
        step: 6,
        state: "Process (4-5, w=6)",
        action: "find(4)=1, find(5)=5 → DIFFERENT. Unite {1,2,3,4,5}. MST cost=13. MST edges: 4/4 → DONE!",
        insight: "All 5 vertices now connected! MST complete. Break early — edge (3-5,7) never examined."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Assuming Graph is Connected without Verification",
      cause: "If the input graph has disconnected components, Kruskal terminates with fewer than N-1 edges selected but no explicit error. Printing total weight gives wrong answer.",
      fix: "Check `if (mst_edges.size() != n - 1)` after Kruskal completes. Print 'IMPOSSIBLE' if graph is disconnected.",
      wrongSnippet: "cout << total_weight << endl; // Prints partial forest sum on disconnected graphs!",
      correctedSnippet: "if ((int)mst.size() < n-1) cout << \"IMPOSSIBLE\\n\";\nelse cout << total_weight << \"\\n\";",
    },
    {
      trap: "Signed 32-Bit Integer Overflow on Total MST Weight",
      cause: "Summing 2*10^5 edges of weight 10^9 produces 2*10^14, which wraps 32-bit signed int to a negative number.",
      fix: "Declare `total_weight` as `long long` AND store edge weights as `long long` in your edge struct.",
      wrongSnippet: "int total_weight = 0; total_weight += edge.weight; // Overflows at 2.14*10^9",
      correctedSnippet: "long long total_weight = 0; total_weight += (long long)edge.weight; // Safe to 9.2*10^18",
    },
    {
      trap: "Cycle Check using Raw Node IDs Instead of DSU Roots",
      cause: "Checking `edge.u != edge.v` only catches self-loops, not indirect cycles through other nodes. This accepts edges that create cycles.",
      fix: "Always use `dsu.unite(u, v)` which internally calls `find()` on both endpoints to get canonical roots before comparing.",
      wrongSnippet: "if (edge.u != edge.v) { total_weight += edge.w; } // WRONG: misses indirect cycles!",
      correctedSnippet: "if (dsu.unite(edge.u, edge.v)) { total_weight += edge.w; } // Checks canonical roots",
    },
  ],

  pythonTemplate: `import sys
import heapq
from typing import List, Tuple, Optional

class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n + 1))
        self.size = [1] * (n + 1)
        self.components = n

    def find(self, i: int) -> int:
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def unite(self, u: int, v: int) -> bool:
        ru, rv = self.find(u), self.find(v)
        if ru == rv:
            return False
        if self.size[ru] < self.size[rv]:
            ru, rv = rv, ru
        self.parent[rv] = ru
        self.size[ru] += self.size[rv]
        self.components -= 1
        return True


def kruskal(n: int, edges: List[Tuple[int, int, int]]) -> Optional[int]:
    """
    Kruskal's Minimum Spanning Tree.
    edges: list of (weight, u, v) tuples.
    Returns total MST weight, or None if graph is disconnected.
    O(E log E) time, O(V + E) space.
    """
    edges.sort()  # Sort by weight ascending
    dsu = DSU(n)
    total = 0
    count = 0

    for w, u, v in edges:
        if dsu.unite(u, v):
            total += w
            count += 1
            if count == n - 1:
                break

    return total if count == n - 1 else None  # None = disconnected


def prim(n: int, adj: List[List[Tuple[int, int]]]) -> Optional[int]:
    """
    Prim's Minimum Spanning Tree using min-heap.
    adj: adjacency list adj[u] = [(v, weight), ...]
    Returns total MST weight, or None if disconnected.
    O(E log V) time, O(V + E) space.
    """
    INF = float('inf')
    dist = [INF] * (n + 1)
    in_mst = [False] * (n + 1)
    dist[1] = 0
    pq = [(0, 1)]
    total = 0
    count = 0

    while pq:
        d, u = heapq.heappop(pq)
        if in_mst[u]:
            continue
        in_mst[u] = True
        total += d
        count += 1

        for v, w in adj[u]:
            if not in_mst[v] and w < dist[v]:
                dist[v] = w
                heapq.heappush(pq, (dist[v], v))

    return total if count == n else None


def max_spanning_tree(n: int, edges: List[Tuple[int, int, int]]) -> Optional[int]:
    """
    Maximum Spanning Tree: sort edges DESCENDING.
    Useful for maximizing total weight or XOR sums.
    """
    edges.sort(reverse=True)  # Sort descending!
    dsu = DSU(n)
    total = 0
    count = 0

    for w, u, v in edges:
        if dsu.unite(u, v):
            total += w
            count += 1
            if count == n - 1:
                break

    return total if count == n - 1 else None


if __name__ == '__main__':
    input = sys.stdin.readline
    n, m = map(int, input().split())
    edges = []
    for _ in range(m):
        u, v, w = map(int, input().split())
        edges.append((w, u, v))

    result = kruskal(n, edges)
    if result is None:
        print("IMPOSSIBLE")
    else:
        print(result)
`,
};
