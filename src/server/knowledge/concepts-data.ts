import { ConceptNode } from "./concept-graph";

export const CORE_CONCEPTS: ConceptNode[] = [
  {
    slug: "prefix-sums",
    name: "Prefix Sum & Difference Arrays",
    category: "Data Structures & Math",
    difficulty: "BEGINNER",
    description:
      "Precomputation technique enabling O(1) range sum queries and O(1) offline range updates on static arrays.",
    timeComplexity: "O(N) build, O(1) query",
    spaceComplexity: "O(N)",
    prerequisites: [],
    dependents: ["two-pointers"],
    codeTemplate: `#include <vector>
using namespace std;

// 1D Prefix Sums
struct PrefixSum {
    vector<long long> pref;
    PrefixSum(const vector<long long>& a) {
        int n = a.size();
        pref.assign(n + 1, 0);
        for (int i = 0; i < n; i++) {
            pref[i + 1] = pref[i] + a[i];
        }
    }
    // Query sum in range [l, r] (0-indexed inclusive)
    long long query(int l, int r) const {
        return pref[r + 1] - pref[l];
    }
};`,
    pitfalls: [
      "Integer overflow: always use 64-bit integers (`long long`) for prefix sums of large values.",
      "Off-by-one errors: 1-indexed internal representation prevents out-of-bounds at index -1.",
    ],
    practiceProblems: [
      { name: "Kuriyama Mirai's Stones", rating: 1200, url: "https://codeforces.com/problemset/problem/433/B" },
      { name: "Karen and Coffee", rating: 1500, url: "https://codeforces.com/problemset/problem/816/B" },
    ],
  },
  {
    slug: "two-pointers",
    name: "Two Pointers Technique",
    category: "Algorithms",
    difficulty: "BEGINNER",
    description:
      "Linear scanning technique using monotonic left and right indices on sorted arrays or sliding windows.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    prerequisites: ["prefix-sums"],
    dependents: ["binary-search-answer"],
    codeTemplate: `#include <vector>
using namespace std;

// Example: Longest subarray with sum <= K
int maxSubarrayLen(const vector<int>& a, long long k) {
    int n = a.size();
    long long current_sum = 0;
    int max_len = 0, l = 0;

    for (int r = 0; r < n; r++) {
        current_sum += a[r];
        while (current_sum > k && l <= r) {
            current_sum -= a[l++];
        }
        max_len = max(max_len, r - l + 1);
    }
    return max_len;
}`,
    pitfalls: [
      "Non-monotonicity: Two pointers only applies when advancing the right pointer monotonically changes the predicate.",
      "Window contract condition: ensure `l <= r` or handle empty window correctly.",
    ],
    practiceProblems: [
      { name: "Books", rating: 1400, url: "https://codeforces.com/problemset/problem/279/B" },
      { name: "They Are Everywhere", rating: 1400, url: "https://codeforces.com/problemset/problem/701/C" },
    ],
  },
  {
    slug: "binary-search-answer",
    name: "Binary Search on Answer",
    category: "Searching & Optimization",
    difficulty: "INTERMEDIATE",
    description:
      "Optimizing monotonic decision problems by evaluating a boolean predicate check(mid) in logarithmic iterations.",
    timeComplexity: "O(check(X) * log(Range))",
    spaceComplexity: "O(1)",
    prerequisites: ["two-pointers"],
    dependents: ["segment-tree"],
    codeTemplate: `#include <vector>
using namespace std;

// Predicate: can we achieve answer with threshold X?
bool check(long long mid, const vector<int>& a);

long long binarySearchAnswer(long long low, long long high, const vector<int>& a) {
    long long ans = high;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (check(mid, a)) {
            ans = mid;
            high = mid - 1; // Try smaller for minimization
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`,
    pitfalls: [
      "Mid overflow: use `low + (high - low) / 2` instead of `(low + high) / 2`.",
      "Infinite loops: verify update bounds `high = mid - 1` vs `high = mid` to prevent ping-pong.",
    ],
    practiceProblems: [
      { name: "Poisoned Dagger", rating: 1200, url: "https://codeforces.com/problemset/problem/1613/C" },
      { name: "Hamburgers", rating: 1400, url: "https://codeforces.com/problemset/problem/371/C" },
    ],
  },
  {
    slug: "1d-dp",
    name: "1D Dynamic Programming & State Transitions",
    category: "Dynamic Programming",
    difficulty: "BEGINNER",
    description:
      "Foundational DP breaking problems into subproblems with optimal substructure and overlapping states.",
    timeComplexity: "O(N * transitions)",
    spaceComplexity: "O(N)",
    prerequisites: [],
    dependents: ["knapsack"],
    codeTemplate: `#include <vector>
#include <algorithm>
using namespace std;

// Longest Increasing Subsequence in O(N log N)
int computeLIS(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}`,
    pitfalls: [
      "Overlooking base cases (e.g. dp[0] initialization).",
      "Direction of iteration: calculating dependent states before their prerequisites are resolved.",
    ],
    practiceProblems: [
      { name: "Boredom", rating: 1500, url: "https://codeforces.com/problemset/problem/455/A" },
      { name: "Cut Ribbon", rating: 1300, url: "https://codeforces.com/problemset/problem/189/A" },
    ],
  },
  {
    slug: "knapsack",
    name: "Knapsack (0/1 & Unbounded)",
    category: "Dynamic Programming",
    difficulty: "INTERMEDIATE",
    description:
      "Standard optimization DP selecting subsets under capacity constraints with value maximization.",
    timeComplexity: "O(N * W)",
    spaceComplexity: "O(W)",
    prerequisites: ["1d-dp"],
    dependents: ["bitmask-dp"],
    codeTemplate: `#include <vector>
#include <algorithm>
using namespace std;

// 0/1 Knapsack in 1D Space O(W)
long long knapsack01(int W, const vector<int>& wt, const vector<long long>& val) {
    int n = wt.size();
    vector<long long> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        // Iterate backwards to prevent using item i multiple times
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`,
    pitfalls: [
      "Forward vs backward loop: 0/1 requires iterating capacity backwards; unbounded requires forward.",
      "Large capacity: when W > 10^7, convert to meet-in-the-middle or value-based DP.",
    ],
    practiceProblems: [
      { name: "Dima and Salad", rating: 1600, url: "https://codeforces.com/problemset/problem/366/C" },
      { name: "Filling Shapes", rating: 1000, url: "https://codeforces.com/problemset/problem/1182/A" },
    ],
  },
  {
    slug: "bitmask-dp",
    name: "Bitmask Dynamic Programming",
    category: "Dynamic Programming",
    difficulty: "ADVANCED",
    description:
      "Exponential DP using binary integers to represent small subset states (N <= 20).",
    timeComplexity: "O(N^2 * 2^N)",
    spaceComplexity: "O(2^N)",
    prerequisites: ["knapsack"],
    dependents: [],
    codeTemplate: `#include <vector>
#include <algorithm>
using namespace std;

// Traveling Salesperson Problem (TSP) with Bitmask
const int INF = 1e9;
int tsp(int n, const vector<vector<int>>& dist) {
    vector<vector<int>> dp(1 << n, vector<int>(n, INF));
    dp[1][0] = 0;

    for (int mask = 1; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] == INF) continue;
            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                int nmask = mask | (1 << v);
                dp[nmask][v] = min(dp[nmask][v], dp[mask][u] + dist[u][v]);
            }
        }
    }
    int ans = INF;
    for (int u = 0; u < n; u++) ans = min(ans, dp[(1 << n) - 1][u] + dist[u][0]);
    return ans;
}`,
    pitfalls: [
      "Operator precedence: `1 << n - 1` computes `1 << (n - 1)`. Always wrap bit operations with parentheses `(mask & (1 << i))`.",
      "Memory limits when states exceed 2^22.",
    ],
    practiceProblems: [
      { name: "Fish", rating: 1800, url: "https://codeforces.com/problemset/problem/16/E" },
      { name: "Hamiltonian Flights", rating: 1700, url: "https://cses.fi/problemset/task/1690" },
    ],
  },
  {
    slug: "bfs-dfs",
    name: "BFS & DFS Graph Traversals",
    category: "Graph Theory",
    difficulty: "BEGINNER",
    description:
      "Fundamental graph and tree search patterns for reachability, cycle detection, and shortest paths in unweighted graphs.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    prerequisites: [],
    dependents: ["dsu", "dijkstra"],
    codeTemplate: `#include <vector>
#include <queue>
using namespace std;

// Unweighted shortest paths with BFS
vector<int> bfsShortestPaths(int start, int n, const vector<vector<int>>& adj) {
    vector<int> dist(n + 1, -1);
    queue<int> q;
    dist[start] = 0;
    q.push(start);

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
}`,
    pitfalls: [
      "Stack overflow on deep recursion with DFS on lines: call `ios::sync_with_stdio(0)` or use iterative stack / increasing stack size.",
      "Duplicate queue pushes in BFS: mark `dist[v]` immediately when pushing to queue, not when popping.",
    ],
    practiceProblems: [
      { name: "Kefa and Park", rating: 1500, url: "https://codeforces.com/problemset/problem/580/C" },
      { name: "Labyrinth", rating: 1400, url: "https://codeforces.com/problemset/problem/1063/B" },
    ],
  },
  {
    slug: "dsu",
    name: "Disjoint Set Union (DSU / Union-Find)",
    category: "Data Structures & Graphs",
    difficulty: "INTERMEDIATE",
    description:
      "Near O(1) set operations with path compression and rank heuristic for dynamic connectivity.",
    timeComplexity: "O(α(N)) amortized",
    spaceComplexity: "O(N)",
    prerequisites: ["bfs-dfs"],
    dependents: ["mst-kruskal"],
    codeTemplate: `#include <vector>
#include <numeric>
using namespace std;

struct DSU {
    vector<int> parent, sz;
    DSU(int n) : parent(n), sz(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i) {
        return (parent[i] == i) ? i : (parent[i] = find(parent[i]));
    }
    bool unite(int i, int j) {
        int root_i = find(i), root_j = find(j);
        if (root_i == root_j) return false;
        if (sz[root_i] < sz[root_j]) swap(root_i, root_j);
        parent[root_j] = root_i;
        sz[root_i] += sz[root_j];
        return true;
    }
};`,
    pitfalls: [
      "Forgetting path compression `parent[i] = find(parent[i])` results in O(N) degenerate trees.",
      "Uniting components without finding their roots first.",
    ],
    practiceProblems: [
      { name: "Mocha and Diana", rating: 1400, url: "https://codeforces.com/problemset/problem/1559/D1" },
      { name: "Learning Languages", rating: 1400, url: "https://codeforces.com/problemset/problem/277/A" },
    ],
  },
  {
    slug: "dijkstra",
    name: "Dijkstra's Shortest Path Algorithm",
    category: "Graph Theory",
    difficulty: "INTERMEDIATE",
    description:
      "Greedy priority-queue traversal computing single-source shortest paths in non-negative weighted graphs.",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V + E)",
    prerequisites: ["bfs-dfs"],
    dependents: [],
    codeTemplate: `#include <vector>
#include <queue>
using namespace std;

const long long INF = 1e18;

vector<long long> dijkstra(int start, int n, const vector<vector<pair<int, int>>>& adj) {
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            long long weight = edge.second;
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    pitfalls: [
      "Negative edge weights: Dijkstra is invalid on negative edges. Use SPFA or Bellman-Ford.",
      "Forgetting the stale entry check `if (d > dist[u]) continue;` causes O(E log V) queue blowup.",
    ],
    practiceProblems: [
      { name: "Dijkstra?", rating: 1600, url: "https://codeforces.com/problemset/problem/20/C" },
      { name: "Shortest Path with Obstacle", rating: 1400, url: "https://codeforces.com/problemset/problem/1547/A" },
    ],
  },
  {
    slug: "mst-kruskal",
    name: "Minimum Spanning Tree (Kruskal's Algorithm)",
    category: "Graph Theory",
    difficulty: "INTERMEDIATE",
    description:
      "Greedy edge sorting paired with DSU cycle detection to build spanning trees of minimum total weight.",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V + E)",
    prerequisites: ["dsu"],
    dependents: [],
    codeTemplate: `#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, weight;
    bool operator<(const Edge& o) const { return weight < o.weight; }
};

// Returns total weight and whether spanning tree was connected
pair<long long, bool> kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    // Assume DSU struct available
    vector<int> parent(n + 1);
    for (int i = 1; i <= n; i++) parent[i] = i;
    auto find = [&](auto& self, int i) -> int {
        return (parent[i] == i) ? i : (parent[i] = self(self, parent[i]));
    };

    long long total_weight = 0;
    int edges_used = 0;

    for (const auto& e : edges) {
        int ru = find(find, e.u), rv = find(find, e.v);
        if (ru != rv) {
            parent[ru] = rv;
            total_weight += e.weight;
            if (++edges_used == n - 1) break;
        }
    }
    return {total_weight, edges_used == n - 1};
}`,
    pitfalls: [
      "Disconnected graph: if graph has multiple components, Kruskal produces a Minimum Spanning Forest.",
      "Multiple edges between the same two nodes must still be filtered by DSU.",
    ],
    practiceProblems: [
      { name: "Design Tutorial: Make It Connected", rating: 1600, url: "https://codeforces.com/problemset/problem/472/D" },
      { name: "Building Roads", rating: 1200, url: "https://cses.fi/problemset/task/1666" },
    ],
  },
  {
    slug: "segment-tree",
    name: "Segment Tree (Point Update & Range Query)",
    category: "Data Structures",
    difficulty: "INTERMEDIATE",
    description:
      "Binary tree maintaining associative operations (sum, min, max, gcd) over dynamic intervals.",
    timeComplexity: "O(N) build, O(log N) query & update",
    spaceComplexity: "O(4N)",
    prerequisites: ["binary-search-answer"],
    dependents: ["lazy-propagation"],
    codeTemplate: `#include <vector>
using namespace std;

struct SegmentTree {
    int n;
    vector<long long> tree;
    SegmentTree(int n) : n(n), tree(4 * n, 0) {}

    void update(int node, int start, int end, int idx, long long val) {
        if (start == end) { tree[node] = val; return; }
        int mid = (start + end) / 2;
        if (idx <= mid) update(2 * node, start, mid, idx, val);
        else update(2 * node + 1, mid + 1, end, idx, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    long long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);
    }
};`,
    pitfalls: [
      "Array sizing: Segment tree requires `4 * N` size to prevent out-of-bounds leaf access.",
      "Associativity: operation must be strictly associative.",
    ],
    practiceProblems: [
      { name: "Distinct Characters Queries", rating: 1600, url: "https://codeforces.com/problemset/problem/1234/D" },
      { name: "Ant colony", rating: 1800, url: "https://codeforces.com/problemset/problem/474/F" },
    ],
  },
  {
    slug: "lazy-propagation",
    name: "Segment Tree with Lazy Propagation",
    category: "Data Structures",
    difficulty: "ADVANCED",
    description:
      "Deferred interval updates enabling O(log N) range updates combined with range queries.",
    timeComplexity: "O(log N) range update & query",
    spaceComplexity: "O(4N)",
    prerequisites: ["segment-tree"],
    dependents: [],
    codeTemplate: `#include <vector>
using namespace std;

struct LazySegmentTree {
    int n;
    vector<long long> tree, lazy;
    LazySegmentTree(int n) : n(n), tree(4 * n, 0), lazy(4 * n, 0) {}

    void push(int node, int start, int end) {
        if (lazy[node] != 0) {
            int mid = (start + end) / 2;
            tree[2 * node] += lazy[node] * (mid - start + 1);
            lazy[2 * node] += lazy[node];
            tree[2 * node + 1] += lazy[node] * (end - mid);
            lazy[2 * node + 1] += lazy[node];
            lazy[node] = 0;
        }
    }

    void updateRange(int node, int start, int end, int l, int r, long long val) {
        if (r < start || end < l) return;
        if (l <= start && end <= r) {
            tree[node] += val * (end - start + 1);
            lazy[node] += val;
            return;
        }
        push(node, start, end);
        int mid = (start + end) / 2;
        updateRange(2 * node, start, mid, l, r, val);
        updateRange(2 * node + 1, mid + 1, end, l, r, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
};`,
    pitfalls: [
      "Forgetting `push(node, start, end)` before recursing into children during both query and update.",
      "Lazy accumulator order: when combining range assignment and range addition, assignment cancels addition.",
    ],
    practiceProblems: [
      { name: "The Child and Sequence", rating: 2200, url: "https://codeforces.com/problemset/problem/438/D" },
      { name: "Circular RMQ", rating: 1700, url: "https://codeforces.com/problemset/problem/52/C" },
    ],
  },
];
