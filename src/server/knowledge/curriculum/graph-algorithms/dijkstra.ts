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
};
