import { ConceptNode } from "../concept-node-type";

export const mstKruskalConcept: ConceptNode = {
  slug: "mst-kruskal",
  name: "Minimum Spanning Tree (Kruskal & Prim)",
  category: "Graph Theory",
  difficulty: "INTERMEDIATE",
  description:
    "Greedy edge selection paired with Disjoint Set Union (DSU) or Priority Queues building spanning trees of minimal total weight in O(E log E). Encompasses the Cut Property, Second-Best MST, and Minimax paths.",
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
        "The Cut Property: For any cut of the graph G, the lightest edge crossing the cut belongs to some Minimum Spanning Tree.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 15: Spanning Trees — Kruskal's Algorithm (pp. 143-150)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "A spanning tree with minimal total weight also minimizes the maximum edge weight on any path between two vertices (Minimax / Bottleneck Spanning Tree).",
    },
  ],
  conceptualTheory: `### The Cut Property & Greedy Proof

#### 1. The Cut Property
Let $G = (V, E)$ be a connected, undirected weighted graph.
A **cut** $(S, V - S)$ is a partition of vertices into two disjoint sets.
An edge $(u, v)$ **crosses** the cut if $u \\in S$ and $v \\in V - S$.

> **Theorem (Cut Property)**:
> Let $(u, v)$ be a light edge (an edge of minimal weight) crossing a cut $(S, V - S)$.
> Then $(u, v)$ belongs to some Minimum Spanning Tree of $G$.

**Proof by Exchange Argument**:
Suppose an MST $T$ does not contain $(u, v)$.
Adding $(u, v)$ to $T$ creates a unique cycle.
Since $u \\in S$ and $v \\in V - S$, the cycle must cross the cut again via another edge $(x, y)$.
Removing $(x, y)$ and adding $(u, v)$ creates a new spanning tree $T'$:
$$w(T') = w(T) - w(x, y) + w(u, v)$$
Since $(u, v)$ is a light edge crossing the cut, $w(u, v) \\le w(x, y)$, meaning $w(T') \\le w(T)$.
Thus, $T'$ is also an MST containing $(u, v)$!

---

#### 2. Kruskal's Algorithm Workflow
1. Sort all $E$ edges in non-decreasing order of weight: $O(E \\log E)$.
2. Initialize DSU with $V$ individual components.
3. For each edge $(u, v, w)$:
   - If \`find(u) != find(v)\`, add $(u, v)$ to the MST and call \`unite(u, v)\`.
   - If \`find(u) == find(v)\`, discard the edge (it would form a cycle).
4. Stop when exactly $V - 1$ edges have been accepted.`,
  variations: [
    {
      title: "Kruskal's Algorithm (DSU-Based)",
      explanation: "Best for sparse graphs where E << V^2. Sort edges and filter via DSU.",
      formula: "O(E log E) time",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Prim's Algorithm (Priority Queue-Based)",
      explanation: "Best for dense graphs. Grows a single tree outward using a priority queue.",
      formula: "O(E log V) time",
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V + E)",
    },
    {
      title: "Second-Best Minimum Spanning Tree",
      explanation: "Build MST T in O(E log E). For each unused edge (u, v, w), add it and remove the heaviest edge on the tree path between u and v.",
      formula: "new_weight = w(T) + w(u, v) - max_edge(u, v)",
      timeComplexity: "O(E log V)",
      spaceComplexity: "O(V log V)",
    },
    {
      title: "Minimax Path (Bottleneck Spanning Tree)",
      explanation: "The path in the MST between any two nodes u and v minimizes the maximum edge weight between u and v.",
      formula: "bottleneck(u, v) = max_weight_on_MST_path(u, v)",
      timeComplexity: "O(log V) query via binary lifting",
      spaceComplexity: "O(V log V)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Connect all N cities or computers with minimum total wire/road cost",
      cue: "Minimum Spanning Tree via Kruskal's Algorithm.",
    },
    {
      triggerConstraint: "Minimizing the maximum edge weight required to keep a graph connected",
      cue: "MST is identical to the Bottleneck Spanning Tree.",
    },
  ],
  stepByStepStrategy: [
    "1. Define Edge Struct: Store `{u, v, weight}`.",
    "2. Sort All Edges: Use `std::sort` comparing `weight` in ascending order.",
    "3. DSU Cycle Detection: For each edge, test `dsu.unite(u, v)`. If true, accumulate weight and increment `edges_count`.",
    "4. Disconnected Graph Guard: If `edges_count < n - 1`, the graph is disconnected (no spanning tree exists).",
  ],
  codeTemplate: `#include <vector>
#include <algorithm>
#include <numeric>
#include <iostream>

using namespace std;

struct Edge {
    int u, v;
    long long weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

struct DSU {
    vector<int> parent, size;
    int numComponents;

    DSU(int n) : numComponents(n), parent(n + 1), size(n + 1, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }

    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i == root_j) return false;
        if (size[root_i] < size[root_j]) swap(root_i, root_j);
        parent[root_j] = root_i;
        size[root_i] += size[root_j];
        numComponents--;
        return true;
    }
};

pair<long long, vector<Edge>> kruskalMST(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    long long total_weight = 0;
    vector<Edge> mst_edges;

    for (const auto& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            total_weight += edge.weight;
            mst_edges.push_back(edge);
            if (mst_edges.size() == n - 1) break;
        }
    }

    if (mst_edges.size() != n - 1) {
        return {-1, {}}; // Graph is disconnected
    }

    return {total_weight, mst_edges};
}`,
  pitfalls: [
    "Disconnected Graph Assumption: Forgetting to verify whether `mst_edges.size() == n - 1`. If disconnected, return -1 or handle forest.",
    "32-Bit Integer Overflow in Total Weight: Summing up to 2 * 10^5 edges of weight 10^9 reaches 2 * 10^14. Use `long long` for total weight.",
    "0-Indexed vs 1-Indexed Nodes: Ensure DSU vector size is `n + 1` for 1-indexed graph problems.",
  ],
  practiceProblems: [
    {
      name: "Road Reparation (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1675",
      platform: "CSES",
      hint: "Standard Kruskal MST. Return 'IMPOSSIBLE' if edges_count < n - 1.",
    },
    {
      name: "Superbull (USACO Silver)",
      rating: 1400,
      url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=531",
      platform: "USACO",
      hint: "Maximum Spanning Tree: Build complete graph where edge weight is a[i] ^ a[j], sort in descending order.",
    },
    {
      name: "Design Tutorial: Inverse the Problem (Codeforces)",
      rating: 2100,
      url: "https://codeforces.com/problemset/problem/472/D",
      platform: "Codeforces",
      hint: "Construct MST from pairwise distance matrix using Kruskal, then check if tree distances match original matrix.",
    },
  ],
};
