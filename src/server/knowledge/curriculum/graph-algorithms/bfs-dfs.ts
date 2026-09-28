import { ConceptNode } from "../concept-node-type";

export const bfsDfsConcept: ConceptNode = {
  slug: "bfs-dfs",
  name: "BFS, DFS & 0-1 BFS Graph Traversals",
  category: "Graph Theory",
  difficulty: "BEGINNER",
  description:
    "Core graph explorations for connectivity, flood fill, topological ordering, cycle detection, and unweighted / 0-1 weighted shortest paths.",
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
        "0-1 BFS uses a double-ended queue (std::deque) to find shortest paths in O(V + E) on graphs with edge weights in {0, 1}, pushing 0-weight edges to front and 1-weight edges to back.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 22: Elementary Graph Algorithms (pp. 589-623)",
      keyInsight:
        "3-color DFS (WHITE=unvisited, GRAY=active on call stack, BLACK=finished) detects directed cycles if and only if a back-edge to a GRAY node is traversed.",
    },
  ],
  conceptualTheory: `### Spanning Forests, Queue Invariants & Color States

#### 1. BFS Monotonic Distance Invariant
In Breadth-First Search on unweighted graphs:
- Nodes in the FIFO queue have distances that differ by at most $1$:
  $$\\text{dist}[q_i] \\le \\text{dist}[q_{i+1}] \\le \\text{dist}[q_i] + 1$$
- Therefore, the first time node $u$ is popped from the queue, $\\text{dist}[u]$ is guaranteed to be its true shortest path distance!

---

#### 2. 0-1 BFS (Double-Ended Queue)
When edge weights are strictly $0$ or $1$:
- Standard BFS fails because distance differences can exceed 1.
- Dijkstra takes $O(E \\log V)$ with priority queue.
- **0-1 BFS Solution**: Use \`std::deque\`:
  - When relaxing edge with weight $0$: push to **front** (\`push_front\`).
  - When relaxing edge with weight $1$: push to **back** (\`push_back\`).
- This preserves the queue monotonic invariant in strictly $O(V + E)$ time!

---

#### 3. 3-Color Cycle Detection in Directed Graphs
- **0 (White)**: Unvisited.
- **1 (Gray)**: In the current recursion stack (ancestor).
- **2 (Black)**: Fully explored and exited.
$$\\text{Directed cycle exists} \\iff \\text{DFS visits an edge to a Gray (1) node.}$$`,
  variations: [
    {
      title: "Breadth-First Search (Unweighted Shortest Path)",
      explanation: "Computes shortest distance from source to all vertices on unweighted graphs in O(V + E).",
      formula: "dist[v] = dist[u] + 1",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      title: "0-1 BFS (Weights 0 and 1)",
      explanation: "Double-ended queue processes 0-cost transitions at front and 1-cost at back in O(V + E).",
      formula: "weight == 0 ? push_front(v) : push_back(v)",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      title: "Topological Sort (Kahn's & DFS)",
      explanation: "Orders vertices in a DAG such that for every directed edge u -> v, u appears before v.",
      formula: "inDegree[v] == 0 => push to queue",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      title: "2-Pass Tree Diameter",
      explanation: "BFS from arbitrary node finds furthest node u; BFS from u finds furthest node v. Path u-v is the diameter.",
      formula: "diameter = dist(u, v)",
      timeComplexity: "O(V)",
      spaceComplexity: "O(V)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Unweighted graph or 2D grid with minimum steps/moves from start to end",
      cue: "Standard BFS with queue in O(V + E).",
    },
    {
      triggerConstraint: "Grid or graph where edge weights are only 0 (free move) and 1 (cost move)",
      cue: "0-1 BFS with std::deque in O(V + E).",
    },
    {
      triggerConstraint: "Prerequisites/dependencies between tasks with cycle detection",
      cue: "Topological Sort (Kahn's algorithm) or 3-color DFS.",
    },
  ],
  stepByStepStrategy: [
    "1. Adjacency Representation: Build `vector<vector<int>> adj(N + 1)`.",
    "2. Distance Array Initialization: Allocate `vector<int> dist(N + 1, -1)`, setting `dist[start] = 0`.",
    "3. Enqueue and Mark Visited Immediately: Push start to queue. Mark visited upon PUSH to avoid duplicate node entries.",
    "4. Queue Sweep: Pop front u, iterate neighbors v. If unvisited, set `dist[v] = dist[u] + 1` and push.",
  ],
  codeTemplate: `#include <vector>
#include <queue>
#include <deque>
#include <iostream>

using namespace std;

// 1. Standard BFS: Shortest paths on unweighted graphs
vector<int> bfs(int start, int n, const vector<vector<int>>& adj) {
    vector<int> dist(n + 1, -1);
    queue<int> q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    return dist;
}

// 2. 0-1 BFS: Shortest paths on graphs with weights in {0, 1}
vector<int> bfs01(int start, int n, const vector<vector<pair<int, int>>>& adj) {
    const int INF = 1e9;
    vector<int> dist(n + 1, INF);
    deque<int> dq;

    dist[start] = 0;
    dq.push_front(start);

    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }

    return dist;
}`,
  pitfalls: [
    "Marking Visited on Pop Instead of Push: If a node is marked visited only when popped, multiple neighbors can push it into the queue concurrently, exploding queue size to O(E) and leading to Memory Limit Exceeded (MLE).",
    "Missing Cycle Check in Topological Sort: If sorted order contains fewer than V nodes, graph has a directed cycle. Always check `order.size() == V`.",
    "Grid Direction Offsets: Misaligning dx and dy arrays (`dx = {0, 0, 1, -1}; dy = {1, -1, 0, 0}`) causes diagonal or out-of-bounds walks.",
  ],
  practiceProblems: [
    {
      name: "Message Route (CSES)",
      rating: 1000,
      url: "https://cses.fi/problemset/task/1667",
      platform: "CSES",
      hint: "Unweighted BFS from 1 to N with parent pointers for path reconstruction.",
    },
    {
      name: "Labyrinth (CSES)",
      rating: 1100,
      url: "https://cses.fi/problemset/task/1193",
      platform: "CSES",
      hint: "2D grid BFS tracking path direction characters 'U', 'D', 'L', 'R'.",
    },
    {
      name: "0-1 BFS / Kaththe (SPOJ)",
      rating: 1400,
      url: "https://www.spoj.com/problems/KATHTHI/",
      platform: "SPOJ",
      hint: "0-1 BFS on 2D grid: 0 cost to adjacent cell with identical letter, 1 cost if different.",
    },
    {
      name: "Course Schedule (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1679",
      platform: "CSES",
      hint: "Topological sort using Kahn's in-degree algorithm with cycle detection.",
    },
  ],
};
