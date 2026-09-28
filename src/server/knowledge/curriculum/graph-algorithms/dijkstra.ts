import { ConceptNode } from "../concept-node-type";

export const dijkstraConcept: ConceptNode = {
  slug: "dijkstra",
  name: "Dijkstra's Single-Source Shortest Paths",
  category: "Graph Theory",
  difficulty: "INTERMEDIATE",
  description:
    "Greedy priority queue shortest path engine for directed and undirected graphs with non-negative edge weights, running in O((V + E) log V).",
  timeComplexity: "O((V + E) log V)",
  spaceComplexity: "O(V + E)",
  prerequisites: ["bfs-dfs"],
  dependents: [],
  literatureReferences: [
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 24: Single-Source Shortest Paths — Dijkstra's Algorithm (pp. 658-662)",
      keyInsight:
        "Dijkstra solves the single-source shortest-path problem on a weighted, directed graph G = (V, E) for the case in which all edge weights are nonnegative.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 13: Shortest Paths — Dijkstra's Algorithm (pp. 125-128)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Using a priority queue with pairs (-distance, vertex) naturally inverts C++ std::priority_queue from max-heap to min-heap without custom comparator classes.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 4.4.3: Dijkstra's on State-Augmented Graphs",
      keyInsight:
        "State expansion represents extra constraints (e.g. dist[u][tickets_used] or dist[u][fuel_remaining]) as virtual vertices in a product graph.",
    },
  ],
  conceptualTheory: `### The Greedy Choice Invariant & Non-Negative Weights

#### 1. The Greedy Choice Property
At every step, Dijkstra extracts from the priority queue the unsettled node $u$ with the minimum tentative distance $\\text{dist}[u]$.
**Proof of Correctness**:
Suppose there exists a shorter path to $u$. That path must depart from the settled set via some edge $(x, y)$.
Because all edge weights $w(e) \\ge 0$:
$$\\text{path\\_length}(x \\to y \\to u) \\ge \\text{dist}[x] + w(x, y) = \\text{dist}[y]$$
Since $u$ has the minimal distance among all unsettled nodes, $\\text{dist}[u] \\le \\text{dist}[y]$.
Hence, no shorter path to $u$ can possibly exist!

---

#### 2. Why Negative Weights Break Dijkstra
If edge weights can be negative, taking an extra edge can decrease the path length:
$$\\text{dist}[y] + w(y, u) < \\text{dist}[u] \\quad \\text{if } w(y, u) < 0$$
This invalidates the greedy property and leads to infinite loops or incorrect answers. (Use Bellman-Ford or SPFA instead).

---

#### 3. State-Augmented Dijkstra (Product Graph)
When a problem offers discounts or states:
- "You can halve the price of at most 1 flight."
- Represent state as a 2D pair: $(u, \\text{used})$, where $\\text{used} \\in \\{0, 1\\}$.
- Transitions:
  1. Standard edge: $(u, \\text{used}) \\to (v, \\text{used})$ with weight $w$.
  2. Discounted edge: $(u, 0) \\to (v, 1)$ with weight $\\lfloor w / 2 \\rfloor$.`,
  variations: [
    {
      title: "Standard Single-Source Shortest Paths",
      explanation: "Computes shortest distance from source S to all other nodes in O((V + E) log V).",
      formula: "dist[v] = min(dist[v], dist[u] + w)",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "State-Augmented Graph (Flight Discount)",
      explanation: "Expands graph vertices to dist[u][k] to track resource consumption (e.g. discount coupons used).",
      formula: "dist[v][k + 1] = min(..., dist[u][k] + w / 2)",
      timeComplexity: "O(K * (V + E) log(V * K))",
      spaceComplexity: "O(V * K)",
    },
    {
      title: "Path Reconstruction",
      explanation: "Maintain parent[v] = u whenever an edge (u, v) successfully relaxes dist[v]. Backtrack from destination to source.",
      formula: "parent[v] = u",
      timeComplexity: "O(V)",
      spaceComplexity: "O(V)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Weighted directed/undirected graph with non-negative weights asking for minimum path cost",
      cue: "Dijkstra's Algorithm in O((V + E) log V).",
    },
    {
      triggerConstraint: "Problems with bonus moves, discounts, or fuel limits on a weighted graph",
      cue: "State-augmented Dijkstra: dist[u][state].",
    },
  ],
  stepByStepStrategy: [
    "1. Adjacency List: Store pairs `vector<vector<pair<int, long long>>> adj(N + 1)`.",
    "2. 64-Bit Distance Vector: Initialize `vector<long long> dist(N + 1, INF)`, setting `dist[start] = 0`.",
    "3. Min-Heap Priority Queue: Use `priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq` storing `(distance, vertex)`.",
    "4. Outdated State Check: At the top of the while-loop, `if (d > dist[u]) continue;` is MANDATORY to prevent TLE on dense graphs.",
    "5. Relaxation: For each neighbor `(v, w)`, if `dist[u] + w < dist[v]`, update `dist[v]` and push to pq.",
  ],
  codeTemplate: `#include <vector>
#include <queue>
#include <iostream>

using namespace std;

const long long INF = 1e18;

// Standard Dijkstra in O((V + E) log V)
vector<long long> dijkstra(int start, int n, const vector<vector<pair<int, long long>>>& adj) {
    vector<long long> dist(n + 1, INF);
    // Min-heap: stores (distance, vertex)
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        // Stale entry check (crucial for efficiency)
        if (d > dist[u]) continue;

        for (auto [v, weight] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}`,
  pitfalls: [
    "Omitting the Stale State Check: Forgetting `if (d > dist[u]) continue;` allows old suboptimal paths to re-traverse all outgoing edges, degrading worst-case complexity to O(V * E) and causing TLE.",
    "32-Bit Overflow in Distances: Accumulating weights along a path of length 10^5 with weights 10^9 easily exceeds 2 * 10^9. Always use `long long` for distance tables and pq pairs.",
    "Priority Queue Element Order: Pushing `(u, dist)` instead of `(dist, u)` into `std::priority_queue` sorts by node ID rather than distance, destroying Dijkstra's greedy invariant.",
  ],
  practiceProblems: [
    {
      name: "Shortest Routes I (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1671",
      platform: "CSES",
      hint: "Direct single-source shortest path with 64-bit distances and min-priority queue.",
    },
    {
      name: "Flight Discount (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1195",
      platform: "CSES",
      hint: "State-augmented Dijkstra: dist[u][0] (no coupon used) and dist[u][1] (coupon used).",
    },
    {
      name: "Dijkstra? (Codeforces)",
      rating: 1300,
      url: "https://codeforces.com/problemset/problem/20/C",
      platform: "Codeforces",
      hint: "Shortest path with path reconstruction using parent array.",
    },
  ],
  deepExplanation: {
    intuition:
      "Dijkstra's Algorithm finds the single-source shortest paths in a directed or undirected graph with non-negative edge weights. It operates as a greedy priority-first search: at each step, it selects the unsettled vertex u with the smallest tentative distance from the source. Because all remaining edge weights are non-negative, any alternative path to u must pass through another currently unsettled vertex with equal or greater distance, making it impossible to ever discover a shorter path to u. Thus, u can be permanently finalized ('settled').",
    proofOfCorrectness:
      "Theorem (Correctness of Dijkstra's Greedy Settlement): When vertex u is popped from the min-priority queue, its tentative distance dist[u] equals the true shortest distance delta(s, u). Proof by Contradiction: Suppose u is the first vertex popped for which dist[u] > delta(s, u). Let P be a true shortest path from s to u. Since s is settled and u is unsettled, there must be an edge (x, y) along P where x is settled and y is the first unsettled vertex on P. Because x is settled before u, dist[x] = delta(s, x). When x was settled, edge (x, y) was relaxed, setting dist[y] <= dist[x] + weight(x, y) = delta(s, y). Because all edge weights are non-negative, delta(s, y) <= delta(s, u). Therefore, dist[y] <= delta(s, y) <= delta(s, u) < dist[u]. This implies dist[y] < dist[u]. But the min-priority queue chose u instead of y, which requires dist[u] <= dist[y], yielding a direct contradiction. Hence, dist[u] = delta(s, u) for all popped vertices.",
    complexityDerivation:
      "Time: O((V + E) log V). There are at most V vertex extractions (each taking O(log V) in a binary min-heap) and at most E edge relaxations pushing updated distances into the heap (each taking O(log V)). Total time: O(E log V) in connected graphs, easily handling V, E <= 2 * 10^5 in ~180ms in C++. Space: O(V + E) to store adjacency lists, distance array, and the priority queue.",
    whenNotToUse:
      "Do NOT use Dijkstra if the graph contains ANY negative edge weights; Dijkstra assumes path distances are monotonically non-decreasing and fails immediately on negative weights (use Bellman-Ford or SPFA instead). Also, on Directed Acyclic Graphs (DAGs), relaxing edges in topological order achieves O(V + E) without priority queue overhead.",
  },
  workedExample: {
    title: "Min-Heap Shortest Path Trace (4 Nodes)",
    scenario: "Nodes {1, 2, 3, 4}. Edges: (1->2, w=4), (1->3, w=2), (3->2, w=1), (2->4, w=5), (3->4, w=8). Source = 1.",
    input: "start = 1. dist = [0, INF, INF, INF]. PQ: [(0, 1)]",
    output: "Shortest distances: dist[1]=0, dist[3]=2, dist[2]=3, dist[4]=8. Optimal path to 4: 1 -> 3 -> 2 -> 4.",
    traceSteps: [
      { step: 1, state: "Pop (0, 1)", action: "Relax edges from 1: (1->2, w=4) -> dist[2]=4, push (4, 2). (1->3, w=2) -> dist[3]=2, push (2, 3). PQ: [(2, 3), (4, 2)]", insight: "Node 1 settled at 0" },
      { step: 2, state: "Pop (2, 3)", action: "Relax edges from 3: (3->2, w=1) -> 2+1=3 < dist[2](4) -> dist[2]=3, push (3, 2). (3->4, w=8) -> dist[4]=10, push (10, 4). PQ: [(3, 2), (4, 2), (10, 4)]", insight: "Node 3 settled at 2. Discovered shortcut to node 2!" },
      { step: 3, state: "Pop (3, 2)", action: "Relax edges from 2: (2->4, w=5) -> 3+5=8 < dist[4](10) -> dist[4]=8, push (8, 4). PQ: [(4, 2), (8, 4), (10, 4)]", insight: "Node 2 settled at 3 via 1->3->2" },
      { step: 4, state: "Pop (4, 2)", action: "Stale check: d=4 > dist[2]=3. Ignore immediately!", insight: "Lazy deletion skips obsolete priority queue entry in O(1)" },
      { step: 5, state: "Pop (8, 4)", action: "Node 4 has no outgoing edges. PQ has [(10, 4)] (stale).", insight: "Node 4 settled at 8 via 1->3->2->4" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Omitting the Stale State Check (d > dist[u])",
      cause: "Without `if (d > dist[u]) continue;`, vertices pushed multiple times with outdated longer distances are processed repeatedly, degrading time to O(V * E) and causing TLE.",
      fix: "Always check `if (d > dist[u]) continue;` immediately after popping from priority queue.",
      wrongSnippet: "auto [d, u] = pq.top(); pq.pop(); for (auto [v, w] : adj[u]) ... // Re-processes stale vertices!",
      correctedSnippet: "auto [d, u] = pq.top(); pq.pop(); if (d > dist[u]) continue; for (auto [v, w] : adj[u]) ...",
    },
    {
      trap: "Signed 32-Bit Overflow in Distance Accumulation",
      cause: "Summing edge weights along paths of length 10^5 with weight 10^9 produces up to 10^14, which wraps 32-bit signed int to negative.",
      fix: "Always declare distance vectors and priority queue keys as `long long`.",
      wrongSnippet: "priority_queue<pair<int, int>> pq; vector<int> dist; // Overflows 2.14 * 10^9",
      correctedSnippet: "priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq; vector<long long> dist;",
    },
    {
      trap: "Inverting Pair Tuple Order in std::priority_queue",
      cause: "Pushing `pair<int, long long>(u, dist)` into priority queue sorts by node index instead of minimum distance!",
      fix: "Always push `(distance, node)` so the heap comparator orders by smallest distance first.",
      wrongSnippet: "pq.push({v, dist[v]}); // Sorts by vertex ID!",
      correctedSnippet: "pq.push({dist[v], v}); // Correctly sorts by distance",
    },
  ],
  pythonTemplate: `import sys
import heapq

def dijkstra():
    """CSES Shortest Routes I / Single-Source Shortest Paths in O(E log V)."""
    input = sys.stdin.readline
    n, m = map(int, input().split())
    adj = [[] for _ in range(n + 1)]

    for _ in range(m):
        u, v, w = map(int, input().split())
        adj[u].append((v, w))

    INF = float('inf')
    dist = [INF] * (n + 1)
    dist[1] = 0
    
    # Priority queue stores tuples: (distance, vertex)
    pq = [(0, 1)]

    while pq:
        d, u = heapq.heappop(pq)

        # Critical: skip stale queue entries
        if d > dist[u]:
            continue

        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))

    print(" ".join(str(dist[i]) for i in range(1, n + 1)))

if __name__ == '__main__':
    dijkstra()
`,
};
