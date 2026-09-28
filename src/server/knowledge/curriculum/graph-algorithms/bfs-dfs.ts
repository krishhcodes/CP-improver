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
  deepExplanation: {
    intuition:
      "Breadth-First Search (BFS) and Depth-First Search (DFS) are the dual paradigms of graph traversal. BFS explores vertices in expanding concentric waves of distance from the source using a FIFO queue. In unweighted graphs, the first time a vertex is discovered is guaranteed to be via the shortest possible path. DFS plunges deep along paths using a recursion stack or explicit LIFO structure, making it the tool of choice for topological sorting, cycle detection, strongly connected components, and tree traversal.",
    proofOfCorrectness:
      "Theorem (Optimality of BFS Shortest Paths on Unweighted Graphs): For every vertex v, BFS correctly assigns dist[v] = delta(s, v). Proof: We induct on distance d. Base case: dist[s] = 0. Inductive hypothesis: assume all vertices at distance <= d have their shortest paths correctly assigned and are enqueued before any vertex at distance d+1. When processing vertices at distance d, any unvisited neighbor u must have shortest path length either d (if discovered by another d node) or d+1 (since edge weights are 1). Because u has not yet been visited, no path of length <= d exists. Setting dist[u] = dist[v] + 1 = d + 1 assigns the exact shortest path. Since FIFO order dequeues all vertices of distance d before any of distance d+1, queue distances are strictly monotonically non-decreasing. Hence, BFS produces globally optimal distances.",
    complexityDerivation:
      "Time: O(V + E). Every vertex is pushed into the queue at most once and popped at most once: O(V). For each popped vertex, its outgoing incident edges are scanned once in directed graphs (twice in undirected graphs): O(E). Space: O(V) auxiliary memory for visited/dist arrays and the FIFO queue.",
    whenNotToUse:
      "Do NOT use standard BFS if edges have arbitrary non-negative weights (w >= 0); BFS assumes all edge costs are uniform (w = 1). Use Dijkstra's Algorithm instead. If edge weights are exclusively in {0, 1}, use 0-1 BFS with `std::deque` in O(V + E), which is faster than Dijkstra's O(E log V).",
  },
  workedExample: {
    title: "0-1 BFS Trace with Deque",
    scenario: "Nodes {1, 2, 3, 4}. Edges: (1->2, w=1), (1->3, w=0), (3->2, w=0), (2->4, w=1). Source = 1.",
    input: "start = 1. dist = [INF, 0, INF, INF, INF]. Deque: [1]",
    output: "Shortest distances: dist[1]=0, dist[3]=0, dist[2]=0, dist[4]=1.",
    traceSteps: [
      { step: 1, state: "Pop 1 (dist=0)", action: "Edge (1->2, w=1): dist[2]=1, push_back(2). Edge (1->3, w=0): dist[3]=0, push_front(3). Deque: [3, 2]", insight: "Zero-weight edge jumps to the front of the queue!" },
      { step: 2, state: "Pop 3 (dist=0)", action: "Edge (3->2, w=0): dist[3]+0=0 < dist[2](1). Relax: dist[2]=0, push_front(2). Deque: [2, 2]", insight: "Overwrote suboptimal weight-1 path to 2 with weight-0 path!" },
      { step: 3, state: "Pop 2 (dist=0)", action: "Edge (2->4, w=1): dist[4]=0+1=1, push_back(4). Deque: [2, 4]", insight: "Node 2 processed at true minimum distance 0" },
      { step: 4, state: "Pop 2 (dist=0, stale)", action: "dist[2] already finalized. Ignore duplicate.", insight: "Stale entries skipped" },
      { step: 5, state: "Pop 4 (dist=1)", action: "No outgoing edges. Deque empty.", insight: "All optimal shortest paths finalized: dist[4]=1 via 1->3->2->4" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Marking Visited on Pop Instead of Push",
      cause: "If `dist[v]` or `visited[v]` is set only when vertex v is popped from the queue, multiple neighbors can discover and enqueue v simultaneously, causing exponential queue explosion and Memory Limit Exceeded (MLE).",
      fix: "Mark `dist[v] = dist[u] + 1` IMMEDIATELY upon pushing into the queue.",
      wrongSnippet: "while(!q.empty()) { int u = q.front(); q.pop(); visited[u] = true; for(int v : adj[u]) if(!visited[v]) q.push(v); }",
      correctedSnippet: "for(int v : adj[u]) { if(dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); } }",
    },
    {
      trap: "Missing Cycle Check in Kahn's Topological Sort",
      cause: "Kahn's algorithm will only push nodes with in-degree 0. If the directed graph contains a cycle, cyclic nodes never reach in-degree 0.",
      fix: "Verify that `order.size() == V` after queue empties. If `order.size() < V`, report 'IMPOSSIBLE'.",
      wrongSnippet: "return order; // If graph has a cycle, order is incomplete!",
      correctedSnippet: "if (order.size() < n) return {}; // Cycle detected",
    },
    {
      trap: "Grid BFS Direction Offsets Asymmetry",
      cause: "Using mismatched dx and dy arrays or reversing row/column indexes.",
      fix: "Use standard 4-directional coordinate offsets: `const int dr[] = {-1, 1, 0, 0}; const int dc[] = {0, 0, -1, 1};`.",
      wrongSnippet: "int dx[] = {0, 1, 0, 1}; // Erroneous diagonal movements",
      correctedSnippet: "const int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1}; // Strict 4-neighborhood",
    },
  ],
  pythonTemplate: `import sys
from collections import deque

def solve_bfs_shortest_path():
    """CSES Message Route: Unweighted BFS with path reconstruction."""
    input = sys.stdin.readline
    n, m = map(int, input().split())
    adj = [[] for _ in range(n + 1)]
    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)
        adj[v].append(u)

    dist = [-1] * (n + 1)
    parent = [0] * (n + 1)
    
    q = deque([1])
    dist[1] = 0

    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)

    if dist[n] == -1:
        print("IMPOSSIBLE")
        return

    # Reconstruct path
    path = []
    curr = n
    while curr != 0:
        path.append(curr)
        curr = parent[curr]
    path.reverse()

    print(len(path))
    print(" ".join(map(str, path)))

def solve_kahn_topological_sort():
    """CSES Course Schedule: Kahn's in-degree algorithm with cycle detection."""
    input = sys.stdin.readline
    n, m = map(int, input().split())
    adj = [[] for _ in range(n + 1)]
    in_degree = [0] * (n + 1)

    for _ in range(m):
        u, v = map(int, input().split())
        adj[u].append(v)
        in_degree[v] += 1

    q = deque([i for i in range(1, n + 1) if in_degree[i] == 0])
    order = []

    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)

    if len(order) < n:
        print("IMPOSSIBLE")
    else:
        print(" ".join(map(str, order)))

if __name__ == '__main__':
    solve_bfs_shortest_path()
`,
};
