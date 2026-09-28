import { ConceptNode } from "../concept-node-type";

export const dijkstraConcept: ConceptNode = {
  slug: "dijkstra",
  name: "Dijkstra's Single-Source Shortest Paths",
  category: "Graph Theory",
  difficulty: "INTERMEDIATE",
  description:
    "Greedy priority queue shortest path engine for directed and undirected graphs with non-negative edge weights. Full coverage: proof of correctness, lazy deletion, state-augmented graphs, and path reconstruction.",
  timeComplexity: "O((V + E) log V)",
  spaceComplexity: "O(V + E)",
  prerequisites: ["bfs-dfs"],
  dependents: [],
  literatureReferences: [
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 24: Single-Source Shortest Paths — Dijkstra's Algorithm (pp. 658-662)",
      keyInsight:
        "Dijkstra solves the single-source shortest-path problem on a weighted, directed graph G = (V, E) for the case in which all edge weights are nonnegative. The algorithm maintains a set S of vertices whose shortest-path weights have been determined.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 13: Shortest Paths — Dijkstra's Algorithm (pp. 125-128)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Using a priority queue with pairs (distance, vertex) storing minimum distance first is the most efficient C++ approach. The stale-state check `if (d > dist[u]) continue` implements lazy deletion.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 4.4.3: Dijkstra's on State-Augmented Graphs",
      keyInsight:
        "State expansion represents extra constraints (e.g. dist[u][tickets_used] or dist[u][fuel_remaining]) as virtual vertices in a product graph, turning complex constrained path problems into vanilla Dijkstra.",
    },
  ],
  conceptualTheory: `## Dijkstra's Algorithm: A Complete Textbook Chapter

### Background & Problem Statement

**The Single-Source Shortest Path (SSSP) Problem**: Given a weighted graph G = (V, E) with edge weights w(u, v) ≥ 0, and a source vertex s, find the shortest path from s to every other vertex v.

The **shortest path** δ(s, v) is the minimum-weight path from s to v, where path weight = sum of edge weights along the path.

**Why not BFS?** Standard BFS finds shortest paths by *hop count* (unweighted). If edges have different weights, a path with fewer hops may have higher total cost. We need a smarter algorithm.

**Why not exhaustive search?** There can be exponentially many paths (if there are cycles). We need a systematic approach.

---

### The Core Insight: Greedy Settlement by Distance

Dijkstra's key observation:

> **If we know the shortest path to vertex u, and all outgoing edges from u have non-negative weight, then for any unvisited vertex v reachable from u, no future path can give us a shorter route to u.**

This allows us to "settle" (permanently finalize) vertices one at a time, always choosing the unsettled vertex with minimum current tentative distance. This is the **greedy choice**.

---

### The Algorithm Step by Step

**Initialization**:
- Set dist[s] = 0 (source has zero distance to itself).
- Set dist[v] = ∞ for all v ≠ s (unknown, possibly unreachable).
- Push (0, s) into a min-priority queue.

**Main Loop** (repeat until queue is empty):
1. Pop the element (d, u) with minimum d from the priority queue.
2. **Stale check**: if d > dist[u], this entry is outdated—skip it.
3. For each neighbor v of u with edge weight w:
   - Compute tentative = dist[u] + w.
   - If tentative < dist[v]:
     - Update dist[v] = tentative.
     - Push (dist[v], v) into the priority queue.

**Output**: dist[v] for all v = shortest distance from s to v.

---

### Why This Works: The Settlement Invariant

**Claim**: When vertex u is popped from the min-heap, dist[u] = δ(s, u) (the true shortest path).

**Proof by Contradiction**:
Suppose u is the FIRST vertex popped where dist[u] > δ(s, u). Let P be any true shortest path from s to u:

s = v₀ → v₁ → v₂ → ... → vₖ = u

Since s is correctly initialized (dist[s] = 0) and u is unsettled, the path P must cross the "frontier" from settled to unsettled vertices at some edge (x, y) where x is settled and y is not.

- x was settled before u, so by our assumption (u is the FIRST incorrectly settled vertex): **dist[x] = δ(s, x)** ✓
- When x was settled, edge (x, y) was relaxed: **dist[y] ≤ dist[x] + w(x, y) = δ(s, x) + w(x, y) = δ(s, y)**
- Since all edge weights ≥ 0: **δ(s, y) ≤ δ(s, u)** (y is on the shortest path to u)
- Therefore: **dist[y] ≤ δ(s, y) ≤ δ(s, u) < dist[u]**

But u was popped BEFORE y (min-heap, dist[u] ≤ dist[y]). Contradiction! ⟹ No such u exists. QED.

---

### Why Negative Weights Break Everything

If edge weight w(y, u) < 0 is allowed:

When u is popped with dist[u] = 10, we declare it settled. But if there's a path s → ... → y → u where dist[y] = 8 and w(y, u) = -5, then the actual distance is 3. But we already settled u at 10!

The problem: the **greedy settlement** assumes that taking any additional edge can only increase the path length. Negative weights violate this assumption entirely.

**Fix**: Use **Bellman-Ford** (relaxes all edges V-1 times, O(V*E)) or **SPFA** (Bellman-Ford with a queue optimization, faster in practice).

For DAGs specifically: relax edges in **topological order** in O(V + E) without a priority queue.

---

### Lazy Deletion: The Stale State Check

In the C++/Python implementation, when we update dist[v] and push (new_dist, v) to the queue, we DON'T remove the OLD (old_dist, v) entry. The priority queue may have multiple entries for the same vertex.

When we pop (d, u), if d > dist[u], it means a shorter path to u was already found (and processed) since this entry was pushed. We simply **skip it** — this is "lazy deletion."

**Without this check**: Stale entries would trigger redundant edge relaxations. In a dense graph, this can process O(E) edges per stale entry, degrading to O(V·E) time — causing TLE.

**With this check**: Each vertex's "canonical" entry is processed exactly once. All stale entries are discarded in O(1) each. Total time: O((V + E) log V).

---

### State-Augmented Dijkstra: Product Graphs

Many harder problems are just Dijkstra on a cleverly expanded state space.

**Example 1 — Flight Discount (CSES 1195)**:
"Travel from 1 to N with one optional 50% discount on one flight."

Expand state: (city, coupon_used) where coupon_used ∈ {0, 1}.
- dist[u][0] = shortest cost to reach u without using coupon.
- dist[u][1] = shortest cost to reach u having used the coupon.

Transitions for edge (u → v, weight w):
- (u, 0) → (v, 0) with cost w. (normal flight, coupon preserved)
- (u, 0) → (v, 1) with cost w/2. (use coupon on this flight)
- (u, 1) → (v, 1) with cost w. (normal flight, coupon already used)

Answer: min(dist[n][0], dist[n][1]).

**Example 2 — Graph with Fuel (k refuel stops allowed)**:
State: (city, fuel_remaining). Expand to V × (K+1) virtual nodes.

**Example 3 — Minimum Stops**:
Lexicographically or count-wise optimal secondary criterion. Use dist as pair<cost, num_hops> to break ties.

**General Rule**: If the problem has a secondary "resource" or "state" that changes along the path, make it part of the Dijkstra state and expand the graph accordingly.

---

### Path Reconstruction

To recover the actual shortest path (not just its length):

Maintain a \`parent[]\` array: when edge (u → v) successfully relaxes dist[v], set parent[v] = u.

After Dijkstra finishes, backtrack from destination t:
\`\`\`
path = []
curr = t
while curr != -1:
    path.append(curr)
    curr = parent[curr]
path.reverse()  # Now path goes from s to t
\`\`\`

For state-augmented Dijkstra, store parent as (prev_node, prev_state).

---

### Comparison with Other SSSP Algorithms

| Algorithm       | Constraints              | Time Complexity  | Notes                        |
|-----------------|--------------------------|------------------|------------------------------|
| BFS             | Unweighted               | O(V + E)         | Hop count only               |
| Dijkstra        | Non-negative weights     | O((V+E) log V)   | Best for sparse graphs       |
| Bellman-Ford    | Any weights (no neg cycle) | O(V·E)          | Detects negative cycles      |
| SPFA            | Any weights (heuristic)  | O(V·E) worst     | Faster than BF in practice   |
| DAG Relaxation  | DAG + any weights        | O(V + E)         | Topo sort + relaxation       |
| Floyd-Warshall  | All-pairs, dense graph   | O(V³)            | Handles negative weights     |

---

### 0-1 BFS: A Special Case

When edge weights are only 0 or 1, use a **deque** instead of a priority queue:
- Weight-0 edge: push neighbor to FRONT of deque (costs nothing, explore immediately).
- Weight-1 edge: push neighbor to BACK of deque.

This achieves O(V + E) time—faster than Dijkstra's O((V+E) log V).

This is useful for grid problems where you can pass through some cells for free.`,

  variations: [
    {
      title: "Standard Single-Source Shortest Paths",
      explanation: "Computes shortest distance from source S to all other nodes in O((V + E) log V) using a min-heap. The fundamental Dijkstra formulation.",
      formula: "dist[v] = min(dist[v], dist[u] + w) for all neighbors v of settled u",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "State-Augmented Dijkstra (k-resource problems)",
      explanation: "Expand graph to (V × K) virtual nodes where K is the number of distinct states. dist[u][k] = shortest cost to reach u with resource-state k. Used for discounts, fuel, tolls.",
      formula: "dist[v][k'] = min(..., dist[u][k] + transition_cost)",
      timeComplexity: "O(K * (V + E) log(V * K))",
      spaceComplexity: "O(V * K)",
    },
    {
      title: "Path Reconstruction",
      explanation: "Maintain parent[v] = u whenever edge (u→v) successfully relaxes dist[v]. After Dijkstra, backtrack from destination via parent pointers to reconstruct the full path.",
      formula: "parent[v] = u when dist[u] + w < dist[v]",
      timeComplexity: "O(V) backtracking",
      spaceComplexity: "O(V) parent array",
    },
    {
      title: "0-1 BFS (Deque Dijkstra)",
      explanation: "When weights are only 0 or 1, use a deque: push weight-0 neighbors to front, weight-1 to back. Achieves O(V+E) — faster than heap-based Dijkstra.",
      formula: "if w == 0: deque.appendleft(v) else: deque.append(v)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Multi-Source Dijkstra",
      explanation: "Add multiple source nodes simultaneously by pushing all (0, source_i) into the initial priority queue. Finds shortest distance from the nearest source to every node.",
      formula: "Initialize dist[source_i] = 0 and push all sources at step 0",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V + E)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Weighted directed/undirected graph with non-negative weights asking for minimum path cost from a source",
      cue: "Dijkstra's Algorithm in O((V + E) log V). Build adjacency list, use min-heap with (dist, vertex) pairs.",
    },
    {
      triggerConstraint: "Problems with bonus moves, discounts, fuel limits, or coupon usage on a weighted graph",
      cue: "State-augmented Dijkstra: expand state to dist[u][resource_state]. Run Dijkstra on the product graph.",
    },
    {
      triggerConstraint: "Grid shortest path where cells have costs 0 or 1",
      cue: "0-1 BFS with deque: push free neighbors to front, cost-1 neighbors to back. O(V+E).",
    },
    {
      triggerConstraint: "Shortest path from multiple starting points simultaneously",
      cue: "Multi-source Dijkstra: push all sources at distance 0 into the initial priority queue.",
    },
    {
      triggerConstraint: "Graph has negative edges but NO negative-weight cycles",
      cue: "Bellman-Ford O(V*E) or SPFA instead of Dijkstra. Dijkstra is INCORRECT with negative edges.",
    },
  ],

  stepByStepStrategy: [
    "1. Read graph as adjacency list: `vector<vector<pair<int, long long>>> adj(N + 1)` storing (neighbor, weight).",
    "2. Initialize distances: `vector<long long> dist(N + 1, INF); dist[start] = 0;`",
    "3. Use min-heap: `priority_queue<pair<long long,int>, vector<...>, greater<>> pq; pq.push({0, start});`",
    "4. Main loop: pop (d, u). Stale check: `if (d > dist[u]) continue;` — NEVER skip this.",
    "5. Relax neighbors: `if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }`",
    "6. For path reconstruction: add `parent[v] = u` inside the relaxation condition.",
    "7. For state-augmented: make dist a 2D array `dist[N+1][K]` and push `(dist[u][k], u, k)` tuples.",
  ],

  codeTemplate: `#include <vector>
#include <queue>
#include <iostream>
#include <algorithm>

using namespace std;

const long long INF = 1e18;

// =========================================================
// 1. Standard Dijkstra — O((V + E) log V)
// =========================================================
vector<long long> dijkstra(int start, int n,
                            const vector<vector<pair<int, long long>>>& adj) {
    vector<long long> dist(n + 1, INF);
    // Min-heap: stores (distance, vertex)
    priority_queue<pair<long long,int>,
                   vector<pair<long long,int>>,
                   greater<pair<long long,int>>> pq;

    dist[start] = 0;
    pq.push({0LL, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        // Lazy deletion: skip outdated entries
        if (d > dist[u]) continue;

        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}

// =========================================================
// 2. Dijkstra with Path Reconstruction
// =========================================================
pair<vector<long long>, vector<int>>
dijkstraWithPath(int start, int n,
                 const vector<vector<pair<int,long long>>>& adj) {
    vector<long long> dist(n + 1, INF);
    vector<int> parent(n + 1, -1);
    priority_queue<pair<long long,int>,
                   vector<pair<long long,int>>,
                   greater<>> pq;

    dist[start] = 0;
    pq.push({0LL, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;   // Track predecessor
                pq.push({dist[v], v});
            }
        }
    }

    return {dist, parent};
}

// Reconstruct path from start to end using parent array
vector<int> getPath(int end, const vector<int>& parent) {
    vector<int> path;
    for (int cur = end; cur != -1; cur = parent[cur])
        path.push_back(cur);
    reverse(path.begin(), path.end());
    return path;
}

// =========================================================
// 3. State-Augmented Dijkstra (e.g., 1 discount coupon)
//    dist[u][0] = no coupon used, dist[u][1] = coupon used
// =========================================================
vector<vector<long long>>
dijkstraWithCoupon(int start, int n,
                   const vector<vector<pair<int,long long>>>& adj) {
    // dist[node][coupon_used]
    vector<vector<long long>> dist(n + 1, vector<long long>(2, INF));
    // pq stores (distance, node, coupon_state)
    priority_queue<tuple<long long,int,int>,
                   vector<tuple<long long,int,int>>,
                   greater<>> pq;

    dist[start][0] = 0;
    pq.push({0LL, start, 0});

    while (!pq.empty()) {
        auto [d, u, k] = pq.top(); pq.pop();
        if (d > dist[u][k]) continue;

        for (auto& [v, w] : adj[u]) {
            // Normal edge (coupon state unchanged)
            if (dist[u][k] + w < dist[v][k]) {
                dist[v][k] = dist[u][k] + w;
                pq.push({dist[v][k], v, k});
            }
            // Use coupon on this edge (if not yet used)
            if (k == 0 && dist[u][0] + w/2 < dist[v][1]) {
                dist[v][1] = dist[u][0] + w/2;
                pq.push({dist[v][1], v, 1});
            }
        }
    }

    return dist;
}

// =========================================================
// 4. 0-1 BFS (Edge weights only 0 or 1)
// =========================================================
#include <deque>
vector<int> bfs01(int start, int n,
                  const vector<vector<pair<int,int>>>& adj) {
    vector<int> dist(n + 1, INT_MAX);
    dist[start] = 0;
    deque<int> dq;
    dq.push_back(start);

    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();

        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                // Weight 0: push to front (explore immediately)
                // Weight 1: push to back (defer)
                if (w == 0) dq.push_front(v);
                else        dq.push_back(v);
            }
        }
    }

    return dist;
}`,

  pitfalls: [
    "Omitting the Stale State Check: Forgetting `if (d > dist[u]) continue;` allows old suboptimal paths to re-traverse all outgoing edges, degrading worst-case complexity to O(V * E) and causing TLE.",
    "32-Bit Overflow in Distances: Accumulating weights along a path of length 10^5 with weights 10^9 easily exceeds 2 * 10^9. Always use `long long` for distance tables and pq pairs.",
    "Priority Queue Element Order: Pushing `(u, dist)` instead of `(dist, u)` into `std::priority_queue` sorts by node ID rather than distance, destroying Dijkstra's greedy invariant.",
    "Using Dijkstra on Negative-Weight Graphs: Dijkstra is INCORRECT when any edge has negative weight. The greedy settlement proof breaks. Use Bellman-Ford or SPFA instead.",
    "Max-Heap Instead of Min-Heap: The default C++ `priority_queue` is a MAX-heap. Must specify `greater<>` comparator or negate distances to simulate min-heap.",
    "Not Using Long Long in Priority Queue Key: Even if dist is `long long`, the PQ pair type must also be `pair<long long, int>` — using `pair<int, int>` causes silent overflow.",
  ],

  practiceProblems: [
    {
      name: "Shortest Routes I (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1671",
      platform: "CSES",
      hint: "Direct single-source shortest path. Use long long distances and min-priority queue.",
    },
    {
      name: "Flight Discount (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1195",
      platform: "CSES",
      hint: "State-augmented Dijkstra: dist[u][0] (no coupon) and dist[u][1] (coupon used). Answer: min(dist[n][0], dist[n][1]).",
    },
    {
      name: "Dijkstra? (Codeforces 20C)",
      rating: 1300,
      url: "https://codeforces.com/problemset/problem/20/C",
      platform: "Codeforces",
      hint: "Shortest path with path reconstruction. Use parent array and backtrack from destination.",
    },
    {
      name: "Road Reparation (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1675",
      platform: "CSES",
      hint: "All-pairs shortest path with multiple queries after precomputation using Dijkstra from each node.",
    },
    {
      name: "Minimum Spanning Tree (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1675",
      platform: "CSES",
      hint: "Not Dijkstra—use Prim's or Kruskal's. But useful to contrast with Dijkstra (both are greedy on graphs).",
    },
    {
      name: "Monsters (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1194",
      platform: "CSES",
      hint: "Multi-source BFS from all monster positions simultaneously, then navigate player to border while avoiding monsters.",
    },
  ],

  deepExplanation: {
    intuition:
      `Dijkstra's Algorithm is fundamentally a **greedy search that expands the frontier of known-shortest-path vertices outward from the source**. Think of it like pouring water on a landscape—the water flows outward and always fills the lowest valleys first. Each "settled" vertex is a valley that has been completely filled; water (shortest paths) can never flow back into already-filled valleys.

The key mental model: maintain a "cloud" of settled vertices S where shortest paths are finalized, and a "border" of tentatively-reached vertices with current best estimates. The min-heap always points us to the border vertex closest to the source. Settling it expands the cloud one vertex at a time.

**Why the greedy choice is safe with non-negative weights**: When we pick the minimum tentative vertex u from the heap, any alternative path to u must either:
(a) Stay entirely within S (already explored — we would have found it), or
(b) Go through an unsettled vertex y with dist[y] ≥ dist[u].

In case (b), since all future edges have non-negative weight, the path through y can only get longer. So dist[u] is optimal.

**The "lazy deletion" trick** is elegant engineering: instead of maintaining a heap with an efficient decrease-key operation (which requires a Fibonacci heap for O(log V) amortized), we simply push new entries and ignore stale old ones. When we pop (d, u) and d > dist[u], we know a better path was already found — discard this entry in O(1). This simplifies code while only adding O(E) extra heap operations in the worst case.

**State augmentation** is the most powerful generalization: any problem that says "traverse a graph under some constraint that changes along the path" can be expressed as Dijkstra on a product graph. The constraint becomes extra dimensions of the state, and transitions model how the constraint evolves. This turns seemingly complex problems into mechanical Dijkstra applications.`,

    proofOfCorrectness:
      `**Theorem (Dijkstra's Correctness)**: When vertex u is extracted from the min-heap for the first time (with distance d), d = δ(s, u) — the true shortest-path distance.

**Proof by strong induction on the order of extraction**:

**Base case**: The source s is extracted first with d = 0 = δ(s, s). ✓

**Inductive step**: Assume all previously extracted vertices v₁, v₂, ..., vₖ₋₁ were extracted with their true shortest distances. Let u = vₖ be the next extracted vertex with tentative distance d[u].

Let P = (s = x₀, x₁, ..., xₙ = u) be any true shortest path from s to u.

Since s ∈ settled-set and u ∉ settled-set, there exists an edge (xᵢ, xᵢ₊₁) where xᵢ ∈ settled-set and xᵢ₊₁ ∉ settled-set. Let y = xᵢ and z = xᵢ₊₁.

By the inductive hypothesis: dist[y] = δ(s, y) when y was settled.
When y was settled, edge (y, z) was relaxed: dist[z] ≤ δ(s, y) + w(y, z) = δ(s, z).
Since dist[z] ≥ δ(s, z) always: **dist[z] = δ(s, z)**.

Since all weights are non-negative:
δ(s, z) ≤ δ(s, u) (z is on the shortest path to u, so cannot cost more).

Therefore: dist[z] = δ(s, z) ≤ δ(s, u).

But u was extracted before z (min-heap chose u):
dist[u] ≤ dist[z] ≤ δ(s, u).

And trivially dist[u] ≥ δ(s, u) (dist[u] is an upper bound via some path).

Therefore: **dist[u] = δ(s, u)**. QED.

**Corollary**: The stale check is sound. Any entry (d, u) where d > dist[u] represents a path that was already beaten by a shorter one. Processing it would not update any neighbor (since dist[u] + w ≥ dist[u] + w for any w ≥ 0 and dist[u] < d). So skipping it is both correct and efficient.`,

    complexityDerivation:
      `**Time Complexity**: O((V + E) log V).

Analysis using a binary min-heap:
- Each vertex is extracted from the heap at most once (after the stale check). → V extractions × O(log(heap_size)) = O(V log V).
- Each edge (u, v) triggers at most 1 successful relaxation (when a shorter path is found). Each relaxation pushes to heap. → E pushes × O(log(heap_size)) = O(E log V).
- Each heap can have at most O(V + E) elements (V original + E pushed during relaxations).
- log(V + E) = O(log V) for connected graphs (E ≤ V²).

**Total**: O((V + E) log V).

**Practical Bounds (C++)**:
- V = E = 10^5: ~10^5 × 17 ≈ 1.7 × 10^6 operations → < 5ms ✓
- V = 10^5, E = 10^6 (dense): ~10^6 × 20 = 2 × 10^7 operations → ~50ms ✓
- Very dense graphs (E ≈ V²): O(V² log V). For V = 10^4: 10^8 × 14 → may TLE. Use matrix-based Dijkstra O(V²) instead.

**Space Complexity**: O(V + E) for adjacency lists + O(V + E) for priority queue.

**Why not Fibonacci Heap?** Theoretically gives O(V log V + E) with O(1) amortized decrease-key. But the large constant factor and complex implementation makes binary heap Dijkstra faster in practice for competitive programming.

**State-Augmented Dijkstra** with K states: O(K × (V + E) log(K × V)).`,

    whenNotToUse:
      `**Do NOT use Dijkstra when**:

1. **Any edge has negative weight**: The greedy settlement is invalid. A later edge could retroactively create a shorter path to an already-settled vertex. Use Bellman-Ford O(V·E) or SPFA instead.

2. **Graph is a DAG with arbitrary weights**: Relax edges in topological order in O(V + E) — no need for a priority queue.

3. **Graph is unweighted**: Use BFS in O(V + E). Dijkstra wastes time on the heap.

4. **Edge weights are only 0 or 1**: Use 0-1 BFS with a deque in O(V + E). Faster than Dijkstra's O((V+E) log V).

5. **All-pairs shortest paths on a dense graph**: Floyd-Warshall O(V³) is cleaner and handles negative weights (without negative cycles).

6. **Very dense graph (E ≈ V²) with V ≤ 10^4**: Use the O(V²) array-based Dijkstra (scan all unvisited vertices for minimum each iteration) instead of the heap-based variant.`,
  },

  workedExample: {
    title: "Min-Heap Settlement Trace — 5 Nodes",
    scenario: "Nodes {1, 2, 3, 4, 5}. Edges: 1→2 (4), 1→3 (2), 3→2 (1), 2→4 (5), 3→4 (8), 4→5 (2). Source = 1.",
    input: "start=1. dist=[_, 0, INF, INF, INF, INF]. PQ: [(0,1)]",
    output: "dist[1]=0, dist[2]=3, dist[3]=2, dist[4]=8, dist[5]=10. Path to 5: 1→3→2→4→5.",
    traceSteps: [
      {
        step: 1,
        state: "Pop (0, 1) — node 1 settled at dist=0",
        action: "Relax 1→2 (w=4): 0+4=4 < INF → dist[2]=4, push (4,2). Relax 1→3 (w=2): 0+2=2 < INF → dist[3]=2, push (2,3). PQ: [(2,3),(4,2)]",
        insight: "Source node processes both neighbors immediately."
      },
      {
        step: 2,
        state: "Pop (2, 3) — node 3 settled at dist=2",
        action: "Relax 3→2 (w=1): 2+1=3 < dist[2]=4 → UPDATE dist[2]=3, push (3,2). Relax 3→4 (w=8): 2+8=10 < INF → dist[4]=10, push (10,4). PQ: [(3,2),(4,2),(10,4)]",
        insight: "Path 1→3→2 (length 3) is shorter than 1→2 (length 4). dist[2] improved!"
      },
      {
        step: 3,
        state: "Pop (3, 2) — node 2 settled at dist=3",
        action: "Relax 2→4 (w=5): 3+5=8 < dist[4]=10 → UPDATE dist[4]=8, push (8,4). PQ: [(4,2),(8,4),(10,4)]",
        insight: "Path 1→3→2→4 (length 8) beats 1→3→4 (length 10)."
      },
      {
        step: 4,
        state: "Pop (4, 2) — STALE ENTRY",
        action: "d=4 > dist[2]=3. Stale check fires → SKIP immediately. PQ: [(8,4),(10,4)]",
        insight: "Lazy deletion skips the outdated entry for node 2 in O(1)."
      },
      {
        step: 5,
        state: "Pop (8, 4) — node 4 settled at dist=8",
        action: "Relax 4→5 (w=2): 8+2=10 < INF → dist[5]=10, push (10,5). PQ: [(10,4),(10,5)]",
        insight: "Node 4 finalized. Path to 5 is now known: 1→3→2→4→5 = 10."
      },
      {
        step: 6,
        state: "Pop (10, 4) — STALE",
        action: "d=10 > dist[4]=8. Skip. Pop (10,5) — node 5 settled at dist=10. No outgoing edges.",
        insight: "Algorithm terminates. All distances finalized correctly."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Omitting the Stale State Check",
      cause: "Without `if (d > dist[u]) continue;`, stale entries re-process all outgoing edges of u. In dense graphs, this causes O(V × E) total operations and TLE.",
      fix: "Always add the stale check as the FIRST line after popping from the priority queue.",
      wrongSnippet: "auto [d, u] = pq.top(); pq.pop();\nfor (auto [v, w] : adj[u]) { ... } // Processes stale entries!",
      correctedSnippet: "auto [d, u] = pq.top(); pq.pop();\nif (d > dist[u]) continue; // Lazy deletion\nfor (auto [v, w] : adj[u]) { ... }",
    },
    {
      trap: "Signed 32-Bit Overflow in Distance Accumulation",
      cause: "Path of 10^5 edges × weight 10^9 = 10^14 total distance. This wraps a 32-bit int to negative, silently corrupting distance comparisons.",
      fix: "Declare dist vector AND priority queue pair types as `long long`. Initialize INF = 1e18.",
      wrongSnippet: "vector<int> dist(n+1, INT_MAX);\npriority_queue<pair<int,int>,...> pq; // Overflows at 2.14×10^9",
      correctedSnippet: "const long long INF = 1e18;\nvector<long long> dist(n+1, INF);\npriority_queue<pair<long long,int>,...,greater<>> pq;",
    },
    {
      trap: "Max-Heap Instead of Min-Heap (Wrong Comparator)",
      cause: "C++ `priority_queue` defaults to MAX-heap. Forgetting `greater<>` means the FARTHEST vertex is processed first, producing completely wrong distances.",
      fix: "Always specify `greater<pair<long long,int>>` as the third template parameter for min-heap behavior.",
      wrongSnippet: "priority_queue<pair<long long,int>> pq; // MAX-heap: wrong!",
      correctedSnippet: "priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;",
    },
    {
      trap: "Using Dijkstra with Negative Edge Weights",
      cause: "If any edge weight is negative, a settled vertex can be reached by a shorter path through a future unsettled vertex. Dijkstra's greedy settlement is provably incorrect in this case.",
      fix: "Check for negative weights. Use Bellman-Ford (O(V*E)) or SPFA for graphs with negative edges.",
      wrongSnippet: "// Edge weights include -5. Running Dijkstra gives wrong/undefined answer.",
      correctedSnippet: "// Use Bellman-Ford:\nfor (int i = 0; i < V-1; i++)\n    for each edge (u,v,w): dist[v] = min(dist[v], dist[u]+w);",
    },
  ],

  pythonTemplate: `import sys
import heapq
from typing import List, Tuple, Optional

def dijkstra(start: int, n: int, adj: List[List[Tuple[int, int]]]) -> List[float]:
    """
    Standard Dijkstra — Single-source shortest paths.
    O((V + E) log V) time, O(V + E) space.
    
    Args:
        start: Source vertex (1-indexed)
        n: Number of vertices
        adj: Adjacency list adj[u] = [(v, weight), ...]
    
    Returns:
        dist[]: shortest distances from start to every vertex
    """
    INF = float('inf')
    dist = [INF] * (n + 1)
    dist[start] = 0
    
    # Min-heap: (distance, vertex)
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)

        # Lazy deletion: skip outdated heap entries
        if d > dist[u]:
            continue

        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))

    return dist


def dijkstra_with_path(start: int, n: int,
                        adj: List[List[Tuple[int, int]]]) -> Tuple[List[float], List[int]]:
    """
    Dijkstra with path reconstruction via parent array.
    Returns (dist[], parent[]) where parent[v] = u means u→v on shortest path.
    """
    INF = float('inf')
    dist = [INF] * (n + 1)
    parent = [-1] * (n + 1)
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                parent[v] = u
                heapq.heappush(pq, (dist[v], v))

    return dist, parent


def reconstruct_path(end: int, parent: List[int]) -> List[int]:
    """Backtrack from end to source using parent array."""
    path = []
    cur = end
    while cur != -1:
        path.append(cur)
        cur = parent[cur]
    path.reverse()
    return path


def dijkstra_state_augmented(start: int, n: int,
                              adj: List[List[Tuple[int, int]]]) -> List[List[float]]:
    """
    State-augmented Dijkstra with one optional 50% discount coupon.
    dist[u][0] = shortest reaching u without coupon
    dist[u][1] = shortest reaching u with coupon used
    """
    INF = float('inf')
    dist = [[INF, INF] for _ in range(n + 1)]
    dist[start][0] = 0
    # pq: (distance, node, coupon_state)
    pq = [(0, start, 0)]

    while pq:
        d, u, k = heapq.heappop(pq)
        if d > dist[u][k]:
            continue

        for v, w in adj[u]:
            # Normal edge (coupon unchanged)
            if dist[u][k] + w < dist[v][k]:
                dist[v][k] = dist[u][k] + w
                heapq.heappush(pq, (dist[v][k], v, k))
            # Use coupon on this edge (only if k==0)
            if k == 0 and dist[u][0] + w // 2 < dist[v][1]:
                dist[v][1] = dist[u][0] + w // 2
                heapq.heappush(pq, (dist[v][1], v, 1))

    return dist


def bfs_01(start: int, n: int, adj: List[List[Tuple[int, int]]]) -> List[int]:
    """
    0-1 BFS for graphs with only 0-cost and 1-cost edges.
    Uses deque: weight-0 edges → push_front, weight-1 edges → push_back.
    O(V + E) time — faster than Dijkstra for this special case.
    """
    from collections import deque
    INF = float('inf')
    dist = [INF] * (n + 1)
    dist[start] = 0
    dq = deque([start])

    while dq:
        u = dq.popleft()

        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)  # Free: explore immediately
                else:
                    dq.append(v)      # Cost-1: defer

    return dist


if __name__ == '__main__':
    input = sys.stdin.readline
    n, m = map(int, input().split())
    adj = [[] for _ in range(n + 1)]

    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))
        adj[v].append((u, w))  # Remove for directed graph

    distances = dijkstra(1, n, adj)
    print(' '.join(str(d) if d < float('inf') else '-1' for d in distances[1:]))
`,
};
