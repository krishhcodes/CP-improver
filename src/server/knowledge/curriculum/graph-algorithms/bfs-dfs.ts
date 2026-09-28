import { ConceptNode } from "../concept-node-type";

export const bfsDfsConcept: ConceptNode = {
  slug: "bfs-dfs",
  name: "BFS, DFS & 0-1 BFS Graph Traversals",
  category: "Graph Theory",
  difficulty: "BEGINNER",
  description:
    "Core graph explorations for connectivity, flood fill, topological ordering, cycle detection, and unweighted / 0-1 weighted shortest paths. The foundation for almost all graph algorithms.",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  prerequisites: [],
  dependents: ["dsu", "dijkstra", "tree-dp"],
  literatureReferences: [
    {
      source: "USACO Guide (Silver)",
      section: "Graph Traversals (DFS & BFS) & Flood Fill",
      url: "https://usaco.guide/silver/dfs",
      keyInsight:
        "BFS guarantees unweighted shortest paths because the queue processes nodes in strictly non-decreasing distance order. DFS explores branch depth, ideal for subtree properties and topological sorting.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 11-12: Basics of Graphs & Graph Traversals (pp. 107-124)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "0-1 BFS uses a double-ended queue to find shortest paths in O(V+E) on graphs with edge weights in {0,1}, pushing weight-0 edges to front and weight-1 edges to back.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 22: Elementary Graph Algorithms (pp. 589-623)",
      keyInsight:
        "3-color DFS (WHITE=unvisited, GRAY=active on call stack, BLACK=finished) detects directed cycles if and only if a back-edge to a GRAY node is traversed during the DFS.",
    },
  ],
  conceptualTheory: `## BFS, DFS & 0-1 BFS: A Complete Textbook Chapter

### What is a Graph?

A **graph** G = (V, E) consists of:
- **Vertices (V)**: nodes, representing entities (cities, states, people, positions).
- **Edges (E)**: connections between vertices, representing relationships or transitions.

Edges can be:
- **Directed**: edge (u→v) means you can go from u to v but not necessarily v to u.
- **Undirected**: edge {u,v} means you can go both ways.
- **Weighted**: edges have costs/distances. **Unweighted**: all edges equal.

**Representing a graph in code**:

1. **Adjacency List** (preferred for sparse graphs, E << V²):
   \`adj[u]\` = list of neighbors of u. Space: O(V + E). Traversal: O(V + E).

2. **Adjacency Matrix** (preferred for dense graphs, E ≈ V²):
   \`mat[u][v]\` = 1 if edge exists. Space: O(V²). Edge lookup: O(1).

3. **Edge List**: list of all edges (u, v, w). Used for algorithms like Kruskal's.

---

### Breadth-First Search (BFS)

**Core Idea**: Explore the graph **layer by layer**. First visit all nodes at distance 1 from source, then all at distance 2, etc. Uses a **FIFO queue**.

**Key Properties**:
- Visits every reachable vertex exactly once.
- Guarantees **minimum hop-count paths** (unweighted shortest paths).
- Queue invariant: all elements in the queue differ in distance by at most 1.

**Algorithm**:
\`\`\`
BFS(s):
  dist[s] = 0, all others = ∞
  Queue Q = {s}
  while Q is not empty:
    u = Q.front(); Q.pop_front()
    for each neighbor v of u:
      if dist[v] == ∞:
        dist[v] = dist[u] + 1
        Q.push_back(v)
\`\`\`

**Why BFS gives shortest paths**: When vertex v is first dequeued, its dist[v] is optimal. Any shorter path would have been discovered first because of the FIFO processing order.

**Applications**:
- Unweighted shortest paths in graphs/grids.
- Flood fill (connected components, bipartite checking).
- Multi-source BFS (find nearest fire station, nearest zombie, etc.).
- Level-order tree traversal.
- Checking graph bipartiteness (2-coloring).

---

### Depth-First Search (DFS)

**Core Idea**: Explore as **deep as possible** along each branch before backtracking. Uses a **recursion stack** (or explicit stack).

**Key Properties**:
- Visits every reachable vertex exactly once.
- Does NOT guarantee shortest paths.
- Produces DFS tree with tree/back/forward/cross edges.
- Naturally computes **entry time** and **exit time** for each node.

**Algorithm**:
\`\`\`
DFS(u):
  visited[u] = true
  timer++ ; entry[u] = timer
  for each neighbor v of u:
    if not visited[v]:
      parent[v] = u
      DFS(v)
  timer++ ; exit[u] = timer
\`\`\`

**The DFS Tree & Edge Classification**:
In a directed graph, every edge is one of:
- **Tree edge**: u→v where v is unvisited (DFS explores it).
- **Back edge**: u→v where v is an ancestor of u (still on stack). **Indicates a cycle!**
- **Forward edge**: u→v where v is a descendant of u (already fully explored).
- **Cross edge**: u→v where v is in a completely different branch.

In an undirected graph, only tree edges and back edges exist.

**Applications**:
- Cycle detection.
- Topological sorting of DAGs.
- Finding strongly connected components (Tarjan's / Kosaraju's).
- Articulation points and bridges.
- Tree DPs (subtree sizes, depths, ancestors).
- Path/reachability problems.

---

### Cycle Detection

**Undirected Graphs**:
During DFS, if we reach a neighbor v that is VISITED and v is NOT the parent of u, we've found a cycle (back edge).

\`\`\`
bool hasCycle(u, parent):
    visited[u] = true
    for v in adj[u]:
        if not visited[v]:
            if hasCycle(v, u): return true
        elif v != parent:
            return true  // Back edge to non-parent visited node
    return false
\`\`\`

**Directed Graphs** — 3-Color Method:
- **WHITE (0)**: Unvisited.
- **GRAY (1)**: On current recursion stack (active).
- **BLACK (2)**: Fully processed.

Cycle exists ↔ DFS encounters a back edge to a GRAY node.

\`\`\`
bool hasCycle(u):
    color[u] = GRAY
    for v in adj[u]:
        if color[v] == GRAY: return true  // Back edge!
        if color[v] == WHITE and hasCycle(v): return true
    color[u] = BLACK
    return false
\`\`\`

---

### Topological Sort (DAG Ordering)

A **topological ordering** of a DAG is a linear order of vertices such that for every directed edge u→v, u appears before v in the ordering.

**DFS-based Kahn's Algorithm is NOT required—two methods exist**:

**Method 1 — DFS + Reverse Postorder**:
- Run DFS on all unvisited vertices.
- After finishing a vertex (exit), add it to a stack.
- Reverse the stack at the end.

**Method 2 — Kahn's Algorithm (BFS-based)**:
- Compute in-degree of all vertices.
- Push all in-degree-0 vertices into a queue.
- Repeat: pop u from queue, add to result, decrement in-degree of all v in adj[u]. If in-degree[v] becomes 0, push v.
- If result has all V vertices → valid topo sort. Else → cycle exists!

Kahn's is preferred in contests because it also detects cycles (result size < V means cycle exists).

---

### 0-1 BFS: Fastest Shortest Path for {0, 1} Weights

When edge weights are ONLY 0 or 1, we can do better than Dijkstra's O((V+E) log V):

**Deque BFS**: Maintain a deque (double-ended queue):
- **Weight-0 edge to v**: push v to the **FRONT** (it's "free", same distance, explore it first).
- **Weight-1 edge to v**: push v to the **BACK** (it costs 1 more, explore later).

This preserves the monotone distance invariant: front elements have distance d, back has d or d+1.

**Time**: O(V + E) — optimal!

**Why this works**: The deque always has elements with at most 2 distinct distances (d and d+1). Free edges keep us at the same level; cost-1 edges increment by 1. The invariant is preserved.

---

### Bipartite Checking

A graph is **bipartite** if vertices can be 2-colored such that no edge connects same-colored vertices. This is equivalent to: **the graph has no odd-length cycle**.

Use BFS (or DFS) with 2-coloring:
\`\`\`
color[s] = 0
BFS from s:
    when processing edge (u, v):
        if color[v] == -1:
            color[v] = 1 - color[u]  // Opposite color
        elif color[v] == color[u]:
            return false  // Same color = odd cycle!
return true
\`\`\`

---

### Multi-Source BFS

Instead of starting from ONE source, add ALL sources to the queue at time 0. This finds the nearest source for every vertex simultaneously.

**Use case**: "You have multiple 'fire' cells in a grid. Find the minimum time for fire to reach each cell."

\`\`\`
for each fire_cell (r, c):
    dist[r][c] = 0
    queue.push((r, c))
BFS(queue)  // Standard BFS from all sources simultaneously
\`\`\`

---

### Grid BFS/DFS (Flood Fill)

For 2D grids, the graph is implicit:
- Vertices = cells (r, c).
- Edges = adjacent cells (up, down, left, right; optionally diagonals).

Standard grid traversal:
\`\`\`
dx = [0, 0, 1, -1]
dy = [1, -1, 0, 0]

BFS/DFS from (sr, sc):
    for each direction (dx[i], dy[i]):
        nr = r + dx[i], nc = c + dy[i]
        if 0 <= nr < R and 0 <= nc < C and not visited[nr][nc]:
            explore (nr, nc)
\`\`\`

This is "flood fill" — used for counting connected regions, detecting enclosed areas, finding shortest grid paths.`,

  variations: [
    {
      title: "BFS — Unweighted Shortest Paths",
      explanation: "FIFO queue explores vertices layer by layer. First time a vertex is popped, its distance is final. Use for all unweighted SSSP problems on graphs and grids.",
      formula: "dist[v] = dist[u] + 1 for each unvisited neighbor v of u",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      title: "DFS — Recursion with Backtracking",
      explanation: "Recursively explore as deep as possible. Tracks entry/exit times for each node. Basis for cycle detection, topo sort, bridge/articulation finding, and subtree computations.",
      formula: "DFS(u): mark visited → recurse on unvisited neighbors → mark finished",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V) recursion stack",
    },
    {
      title: "0-1 BFS — Deque Shortest Paths",
      explanation: "For graphs where edges cost 0 or 1. Push weight-0 neighbors to front, weight-1 to back. Maintains monotone distance invariant without a heap.",
      formula: "w==0 → deque.push_front(v), w==1 → deque.push_back(v)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Multi-Source BFS",
      explanation: "Initialize all source nodes at distance 0 in the queue simultaneously. Finds nearest source for every vertex. Used for fire spread, zombie infection, nearest-facility problems.",
      formula: "dist[source_i] = 0 for all i; run single BFS",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      title: "Topological Sort (Kahn's BFS)",
      explanation: "Compute in-degrees. Push 0-in-degree nodes to queue. Process them, decrement neighbors' in-degrees. If result length < V, a cycle exists.",
      formula: "in_deg[v]--; if in_deg[v]==0: queue.push(v)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Bipartite Check via 2-Coloring",
      explanation: "BFS with alternating colors. If any edge connects two same-colored vertices, graph is not bipartite (has odd cycle).",
      formula: "color[v] = 1 - color[u] for tree edges; color[v]==color[u] → not bipartite",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
  ],

  recognitionSignals: [
    {
      triggerConstraint: "Unweighted graph/grid: minimum steps from source to destination",
      cue: "BFS — explores layer by layer, guarantees minimum hop count.",
    },
    {
      triggerConstraint: "Graph connectivity: how many connected components? Is the whole graph reachable from source?",
      cue: "DFS or BFS loop over all unvisited vertices, count components.",
    },
    {
      triggerConstraint: "Does this directed graph have a cycle?",
      cue: "3-color DFS: GRAY node encountered = cycle. Or Kahn's topo sort: if result size < V → cycle.",
    },
    {
      triggerConstraint: "Process tasks in dependency order (prerequisite ordering)",
      cue: "Topological sort (DFS postorder or Kahn's BFS on in-degrees).",
    },
    {
      triggerConstraint: "Grid with cells free or blocked, find shortest path",
      cue: "BFS on implicit grid graph with 4-directional movement.",
    },
    {
      triggerConstraint: "Edge weights in {0, 1} and need shortest paths faster than Dijkstra",
      cue: "0-1 BFS with deque — achieves O(V+E) instead of O((V+E) log V).",
    },
    {
      triggerConstraint: "Multiple 'sources' spreading simultaneously — find nearest source for each node",
      cue: "Multi-source BFS: enqueue all sources at distance 0 initially.",
    },
  ],

  stepByStepStrategy: [
    "1. Parse graph input: build adjacency list adj[u] = [(v, weight), ...] for weighted, or adj[u] = [v, ...] for unweighted.",
    "2. Decide BFS vs DFS: BFS for shortest paths; DFS for cycle detection, topo sort, or subtree computation.",
    "3. For BFS: use a queue. Initialize dist[source] = 0, push source. Process until queue empty.",
    "4. For DFS: mark visited before recursing. Return result on backtrack (post-order). Use iterative with explicit stack if recursion depth can exceed 10^4 (stack overflow risk in Python/Java).",
    "5. For 0-1 BFS: use collections.deque. Push w=0 neighbors to appendleft, w=1 to append.",
    "6. For topo sort: compute in-degrees first, then Kahn's BFS on in-degree-0 vertices.",
    "7. Grid problems: define dx/dy arrays for 4 (or 8) directions. Check bounds and visited status before adding to queue.",
    "8. For multi-source BFS: pre-populate queue with ALL sources at distance 0 before the main loop.",
  ],

  codeTemplate: `#include <vector>
#include <queue>
#include <deque>
#include <stack>
#include <iostream>
#include <algorithm>

using namespace std;

// =========================================================
// 1. BFS — Unweighted Shortest Paths from source s
// =========================================================
vector<int> bfs(int s, int n, const vector<vector<int>>& adj) {
    vector<int> dist(n + 1, -1);
    queue<int> q;

    dist[s] = 0;
    q.push(s);

    while (!q.empty()) {
        int u = q.front(); q.pop();

        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    return dist; // dist[v] = -1 if unreachable
}

// =========================================================
// 2. DFS — Recursive with entry/exit timestamps
// =========================================================
int timer_global = 0;
vector<int> entry_time, exit_time, color; // 0=white, 1=gray, 2=black
bool has_directed_cycle = false;

void dfs(int u, const vector<vector<int>>& adj) {
    color[u] = 1; // GRAY: on stack
    entry_time[u] = ++timer_global;

    for (int v : adj[u]) {
        if (color[v] == 0) {
            dfs(v, adj); // Tree edge
        } else if (color[v] == 1) {
            has_directed_cycle = true; // Back edge → cycle!
        }
        // color[v] == 2 → forward/cross edge, no cycle
    }

    color[u] = 2; // BLACK: fully explored
    exit_time[u] = ++timer_global;
}

// =========================================================
// 3. Topological Sort via Kahn's Algorithm (BFS)
// =========================================================
vector<int> topoSort(int n, const vector<vector<int>>& adj) {
    vector<int> in_deg(n + 1, 0);

    for (int u = 1; u <= n; u++)
        for (int v : adj[u])
            in_deg[v]++;

    queue<int> q;
    for (int u = 1; u <= n; u++)
        if (in_deg[u] == 0) q.push(u);

    vector<int> topo;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topo.push_back(u);

        for (int v : adj[u]) {
            if (--in_deg[v] == 0)
                q.push(v);
        }
    }

    // If topo.size() < n → cycle exists in graph
    return topo;
}

// =========================================================
// 4. 0-1 BFS — O(V + E) for {0, 1} edge weights
// =========================================================
vector<int> bfs01(int s, int n, const vector<vector<pair<int,int>>>& adj) {
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    deque<int> dq;

    dist[s] = 0;
    dq.push_back(s);

    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();

        for (auto& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);  // Free: front
                else        dq.push_back(v);   // Cost-1: back
            }
        }
    }

    return dist;
}

// =========================================================
// 5. Multi-Source BFS — nearest source to every node
// =========================================================
vector<int> multiSourceBFS(const vector<int>& sources, int n,
                            const vector<vector<int>>& adj) {
    vector<int> dist(n + 1, -1);
    queue<int> q;

    // Initialize ALL sources at distance 0
    for (int s : sources) {
        dist[s] = 0;
        q.push(s);
    }

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    return dist;
}

// =========================================================
// 6. Bipartite Check via 2-Coloring BFS
// =========================================================
bool isBipartite(int n, const vector<vector<int>>& adj) {
    vector<int> color(n + 1, -1);

    for (int start = 1; start <= n; start++) {
        if (color[start] != -1) continue; // Already colored

        queue<int> q;
        color[start] = 0;
        q.push(start);

        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u]; // Opposite color
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false; // Same color on edge → odd cycle!
                }
            }
        }
    }
    return true;
}

// =========================================================
// 7. Grid BFS — Shortest path in 2D grid
// =========================================================
int gridBFS(int sr, int sc, int er, int ec,
            const vector<string>& grid) {
    int R = grid.size(), C = grid[0].size();
    const int dx[] = {0, 0, 1, -1};
    const int dy[] = {1, -1, 0, 0};

    vector<vector<int>> dist(R, vector<int>(C, -1));
    dist[sr][sc] = 0;
    queue<pair<int,int>> q;
    q.push({sr, sc});

    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();

        if (r == er && c == ec) return dist[r][c];

        for (int d = 0; d < 4; d++) {
            int nr = r + dx[d], nc = c + dy[d];
            if (nr >= 0 && nr < R && nc >= 0 && nc < C
                && grid[nr][nc] != '#' && dist[nr][nc] == -1) {
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }

    return -1; // Unreachable
}`,

  pitfalls: [
    "Not Marking Visited Before Pushing to Queue: If you mark visited only when POPPING (not when PUSHING), the same node gets pushed multiple times from different neighbors. This causes O(V + E) pushes to balloon into O(V * average_degree) = O(E) redundant work, and can cause TLE.",
    "DFS Stack Overflow on Large Inputs: Recursive DFS has a call stack depth of O(V). For V = 10^5 in Python (recursion limit ~1000), or even in C++ (stack ~8 MB), deep linear graphs cause stack overflow. Use iterative DFS with an explicit stack for safety.",
    "Cycle Detection in Undirected Graphs: Checking `v != parent[u]` is insufficient for multigraphs (multiple edges between same pair). Track edge index instead of parent node.",
    "Topological Sort on Cyclic Graph: Kahn's algorithm naturally detects cycles (result size < V). Always validate result size before using the ordering.",
    "BFS Distance Initialization: Initialize dist[v] = -1 (or INF), not 0. Initializing to 0 prevents the visited check from working correctly for the source vs. unreachable nodes.",
    "Grid Bounds Checking: Always check `0 <= nr < R && 0 <= nc < C` BEFORE accessing grid[nr][nc] to avoid index-out-of-bounds crashes.",
    "0-1 BFS Stale Check Missing: Unlike standard BFS, 0-1 BFS can re-push vertices with better distances. Always check `if dist[u] + w < dist[v]` before pushing.",
  ],

  practiceProblems: [
    {
      name: "Message Route (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1667",
      platform: "CSES",
      hint: "BFS from node 1 to node N. Reconstruct path using parent array.",
    },
    {
      name: "Labyrinth (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1193",
      platform: "CSES",
      hint: "BFS on a grid. Track directions in parent array to reconstruct the 'UDLR' path.",
    },
    {
      name: "Course Schedule (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1679",
      platform: "CSES",
      hint: "Topological sort via Kahn's algorithm. If sort fails (size < N), output 'IMPOSSIBLE'.",
    },
    {
      name: "Round Trip (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1669",
      platform: "CSES",
      hint: "Find a cycle in an undirected graph using DFS. Track parent to reconstruct the cycle.",
    },
    {
      name: "Monsters (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1194",
      platform: "CSES",
      hint: "Multi-source BFS from all monsters to precompute their distances, then BFS the player avoiding cells reachable by monsters at same or earlier time.",
    },
    {
      name: "Teleporters Path (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1693",
      platform: "CSES",
      hint: "Eulerian path in a directed graph. Check in-degree == out-degree for all intermediate nodes.",
    },
  ],

  deepExplanation: {
    intuition:
      `BFS and DFS are two fundamentally different strategies for exploring a graph systematically, ensuring every vertex and edge is visited exactly once (O(V + E) total work).

**BFS** is like dropping a pebble in a pond: ripples spread outward uniformly in all directions simultaneously. At any moment, you're processing all nodes at distance d before touching any node at distance d+1. This "level-by-level" structure is why BFS naturally computes shortest paths in unweighted graphs—the first time you reach a node is provably via the shortest path.

**DFS** is like exploring a maze by always going as far as you can along one corridor before backtracking. It dives deep into the graph structure, naturally revealing parent-child relationships (the DFS tree). The timestamps (entry/exit times) encode a wealth of structural information: two vertices are in ancestor-descendant relationship if and only if one's interval [entry, exit] contains the other's.

**0-1 BFS** is an elegant synthesis: by using a deque instead of a regular queue, and pushing weight-0 edges to the front (same level, process first) and weight-1 edges to the back (next level), we maintain the BFS level invariant without the overhead of a priority queue. This gives us Dijkstra's correctness at BFS's speed for the {0,1} weight special case.

**The deeper insight**: BFS, 0-1 BFS, and Dijkstra are all instances of the same algorithmic template, just with different priority structures: FIFO queue (BFS), deque with front/back priority (0-1 BFS), and min-heap (Dijkstra). The correctness of all three relies on the same monotone distance invariant: when you extract a vertex, you can guarantee its distance is final.`,

    proofOfCorrectness:
      `**Theorem (BFS Correctness)**: When vertex u is first dequeued in BFS, dist[u] = δ(s, u) — the true shortest-hop distance from source s to u.

**Proof by induction on δ(s, u)**:

*Base case* (δ = 0): Only s itself, dist[s] = 0 ✓.

*Inductive step*: Assume all vertices at distance < d are correctly computed. Let u have δ(s, u) = d.

Let P = s → ... → x → u be the shortest path (d hops). Then δ(s, x) = d-1.
By inductive hypothesis, x was correctly dequeued with dist[x] = d-1.
When x was processed, edge (x, u) was relaxed: dist[u] = d-1+1 = d (if not already set to ≤ d).
Since δ(s, u) = d, no path shorter than d exists, so dist[u] ≥ d. Combined: dist[u] = d = δ(s, u). ✓

**Theorem (3-Color DFS Cycle Detection)**: A directed graph G has a cycle ↔ DFS encounters a back edge (u → v where color[v] = GRAY).

**Proof**:
(→) If G has a cycle C = v₁ → v₂ → ... → vₖ → v₁. WLOG DFS enters v₁ first. From v₁ DFS must eventually reach vₖ (all in cycle). At vₖ, edge vₖ → v₁ exists, but v₁ is still GRAY (hasn't exited yet). → Back edge found.

(←) If DFS finds back edge u → v (v is GRAY), then v is an ancestor of u in DFS tree. The DFS tree path from v down to u, combined with the edge u → v, forms a cycle. ✓`,

    complexityDerivation:
      `**BFS/DFS Time Complexity**: O(V + E).

- Each vertex is added to the queue/stack exactly once: O(V) enqueue/push operations.
- Each edge (u, v) is examined exactly once when u is dequeued: O(E) total edge scans.
- Total work: O(V + E).

**Space Complexity**: O(V) for the queue/stack + O(V) for visited/dist array + O(V + E) for adjacency list.

**Practical Performance (C++)**:
- V = E = 10^5: O(2 × 10^5) = trivially fast, ~1ms.
- V = E = 10^6: O(2 × 10^6) = ~5ms, well within time limits.
- Grid N×N: V = N², E = 4N². For N = 10^3: V+E = 5 × 10^6, fast.

**0-1 BFS Time Complexity**: O(V + E). Each vertex may be pushed to the deque multiple times as its distance improves, but each push requires a distance update. Since distances can only decrease and are bounded, the total number of pushes is O(E). Each pop is O(1).

**Topological Sort (Kahn's)**: O(V + E). Computing all in-degrees: O(E). Processing queue: O(V + E).`,

    whenNotToUse:
      `**Do NOT use BFS for**:
- Weighted shortest paths (edge weights ≠ 1): Use Dijkstra or Bellman-Ford.
- Subtree computations, finding DFS timestamps, cycle detection in directed graphs: DFS is more natural.

**Do NOT use recursive DFS for**:
- Very deep graphs (linear chains of 10^5 nodes): recursion stack overflow. Use iterative DFS.
- When you need BFS-level order information.

**Do NOT use 0-1 BFS for**:
- General edge weights beyond {0, 1}: Use Dijkstra or Bellman-Ford.

**Do NOT use Kahn's topo sort for**:
- Graphs that might have cycles and you want ALL topological orderings: Use DFS backtracking instead.`,
  },

  workedExample: {
    title: "BFS Shortest Path Trace on 6-Node Graph",
    scenario: "Nodes 1..6. Edges: 1-2, 1-3, 2-4, 3-4, 3-5, 4-6, 5-6. Source = 1, Target = 6.",
    input: "dist = [-1, 0, -1, -1, -1, -1, -1]. Queue: [1]",
    output: "dist[6] = 3. Shortest path: 1 → 3 → 5 → 6 (or 1 → 2 → 4 → 6, both length 3).",
    traceSteps: [
      {
        step: 1,
        state: "Process node 1 (dist=0)",
        action: "Neighbors 2 and 3 are unvisited. Set dist[2]=1, push 2. Set dist[3]=1, push 3. Queue: [2, 3]",
        insight: "Level 1 nodes (distance 1 from source): {2, 3}"
      },
      {
        step: 2,
        state: "Process node 2 (dist=1)",
        action: "Neighbor 4 is unvisited. Set dist[4]=2, push 4. Neighbor 1 already visited. Queue: [3, 4]",
        insight: "Level 2 discovery: node 4 via 1→2→4"
      },
      {
        step: 3,
        state: "Process node 3 (dist=1)",
        action: "Neighbor 4 already has dist=2. Neighbor 5 unvisited → dist[5]=2, push 5. Queue: [4, 5]",
        insight: "Level 2: node 5 via 1→3→5. Node 4 already discovered, not re-pushed."
      },
      {
        step: 4,
        state: "Process node 4 (dist=2)",
        action: "Neighbor 6 unvisited → dist[6]=3, push 6. Queue: [5, 6]",
        insight: "Level 3 discovery: node 6 via 1→2→4→6. Distance = 3."
      },
      {
        step: 5,
        state: "Process node 5 (dist=2)",
        action: "Neighbor 6 already has dist=3, skip. Queue: [6]",
        insight: "Another path to 6 (1→3→5→6) also length 3, but already found."
      },
      {
        step: 6,
        state: "Process node 6 (dist=3)",
        action: "Target reached! dist[6] = 3. No unvisited neighbors.",
        insight: "BFS guarantees this is the shortest path — 3 hops."
      },
    ],
  },

  trapAnalysis: [
    {
      trap: "Marking Visited When Popping (Not Pushing) — Causes Duplicate Pushes",
      cause: "If you check/mark visited when you POP from the queue, multiple entries for the same vertex get queued from different neighbors. In dense graphs this is O(E) extra pushes and processes.",
      fix: "Always mark dist[v] (or visited[v]) IMMEDIATELY when you decide to push v, BEFORE the push. This prevents any other neighbor from pushing v again.",
      wrongSnippet: "q.push(v); // Push without marking\n// ... later when popping:\nif (visited[u]) continue; // Too late! duplicates already in queue",
      correctedSnippet: "if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); } // Mark immediately",
    },
    {
      trap: "Recursive DFS Stack Overflow",
      cause: "For graphs shaped like a long chain (node 1 → 2 → 3 → ... → N), recursive DFS has O(N) call stack depth. Python's default limit is 1000, C++ stack is ~8 MB (~10^4 to 10^5 frames).",
      fix: "Use iterative DFS with an explicit stack for graphs that may have long chains. Alternatively, in Python: `sys.setrecursionlimit(300000)` (risky) or convert to iterative.",
      wrongSnippet: "def dfs(u): visited[u]=True; for v in adj[u]: if not visited[v]: dfs(v) # Stack overflow for N=10^5",
      correctedSnippet: "stack = [start]; visited[start]=True\nwhile stack:\n    u = stack.pop()\n    for v in adj[u]:\n        if not visited[v]: visited[v]=True; stack.append(v)",
    },
    {
      trap: "Cycle Detection in Undirected Graphs: Parent Check Fails for Multi-Edges",
      cause: "In an undirected graph with parallel edges (u,v) and (u,v), checking `v != parent[u]` allows the second edge to be falsely flagged as a cycle even though both are the same undirected edge.",
      fix: "Track EDGE INDEX (not parent node) to correctly handle multigraphs. Or represent each undirected edge as two directed edges with IDs, and skip the reverse edge by ID.",
      wrongSnippet: "for v in adj[u]:\n    if v != parent: hasCycle = True # Wrong for multi-edges!",
      correctedSnippet: "for (v, edge_id) in adj[u]:\n    if edge_id != parent_edge: ... # Track edge, not node",
    },
  ],

  pythonTemplate: `import sys
from collections import deque
from typing import List, Optional

def bfs(s: int, n: int, adj: List[List[int]]) -> List[int]:
    """
    BFS — Unweighted shortest paths from source s.
    Returns dist[v] = minimum hops from s to v, or -1 if unreachable.
    O(V + E) time and space.
    """
    dist = [-1] * (n + 1)
    dist[s] = 0
    q = deque([s])

    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)

    return dist


def bfs_with_path(s: int, t: int, n: int, adj: List[List[int]]) -> Optional[List[int]]:
    """
    BFS with path reconstruction from s to t.
    Returns the path as a list of vertices, or None if t is unreachable.
    """
    dist = [-1] * (n + 1)
    parent = [-1] * (n + 1)
    dist[s] = 0
    q = deque([s])

    while q:
        u = q.popleft()
        if u == t:
            break
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)

    if dist[t] == -1:
        return None  # Unreachable

    # Reconstruct path
    path = []
    cur = t
    while cur != -1:
        path.append(cur)
        cur = parent[cur]
    path.reverse()
    return path


def dfs_iterative(s: int, n: int, adj: List[List[int]]) -> List[bool]:
    """
    Iterative DFS — avoids recursion stack overflow for large graphs.
    Returns visited[] array.
    """
    visited = [False] * (n + 1)
    stack = [s]
    visited[s] = True

    while stack:
        u = stack.pop()
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                stack.append(v)

    return visited


def topo_sort_kahn(n: int, adj: List[List[int]]) -> Optional[List[int]]:
    """
    Topological sort via Kahn's BFS algorithm.
    Returns ordered list if DAG, or None if cycle detected.
    O(V + E) time.
    """
    in_deg = [0] * (n + 1)
    for u in range(1, n + 1):
        for v in adj[u]:
            in_deg[v] += 1

    q = deque()
    for u in range(1, n + 1):
        if in_deg[u] == 0:
            q.append(u)

    topo = []
    while q:
        u = q.popleft()
        topo.append(u)
        for v in adj[u]:
            in_deg[v] -= 1
            if in_deg[v] == 0:
                q.append(v)

    return topo if len(topo) == n else None  # None = cycle exists


def bfs_01(s: int, n: int, adj: List[List[tuple]]) -> List[int]:
    """
    0-1 BFS for graphs with edge weights in {0, 1}.
    Push weight-0 neighbors to front, weight-1 to back.
    O(V + E) — faster than Dijkstra for this special case.
    """
    INF = float('inf')
    dist = [INF] * (n + 1)
    dist[s] = 0
    dq = deque([s])

    while dq:
        u = dq.popleft()
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)

    return dist


def is_bipartite(n: int, adj: List[List[int]]) -> bool:
    """
    Check if graph is bipartite (2-colorable, no odd cycles).
    Returns True if bipartite, False otherwise.
    """
    color = [-1] * (n + 1)

    for start in range(1, n + 1):
        if color[start] != -1:
            continue
        color[start] = 0
        q = deque([start])

        while q:
            u = q.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return False  # Same color on edge → not bipartite

    return True


if __name__ == '__main__':
    input = sys.stdin.readline
    n, m = map(int, input().split())
    adj = [[] for _ in range(n + 1)]

    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)
        adj[v].append(u)

    dist = bfs(1, n, adj)
    print(dist[n] if dist[n] != -1 else -1)
`,
};
