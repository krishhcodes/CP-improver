import { ConceptNode } from "../concept-node-type";

export const binaryLiftingLCAConcept: ConceptNode = {
  slug: "binary-lifting-lca",
  name: "Binary Lifting & Lowest Common Ancestor (LCA)",
  category: "Tree Algorithms",
  difficulty: "INTERMEDIATE",
  description:
    "Sparse table on trees precomputing 2^k-th ancestors in O(N log N). Answers LCA, k-th ancestor, and tree-path range queries in O(log N) time.",
  timeComplexity: "O(N log N) build, O(log N) query",
  spaceComplexity: "O(N log N)",
  prerequisites: ["tree-dp"],
  dependents: [],
  literatureReferences: [
    {
      source: "USACO Guide (Platinum)",
      section: "Binary Lifting & LCA",
      url: "https://usaco.guide/plat/bin-lift",
      keyInsight:
        "Precomputing powers-of-two ancestors allows jumping up the tree in O(log N) by decomposing any distance into its binary representation.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 18: Tree Queries — Lowest Common Ancestor (pp. 167-172)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Distance between any two tree nodes u and v is computed via LCA: dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)].",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 4.5.2: Lowest Common Ancestor Variations",
      keyInsight:
        "Binary lifting tables can be augmented with path attributes (e.g. maximum edge weight or minimum capacity on the 2^k path) to answer bottleneck queries in O(log N).",
    },
  ],
  conceptualTheory: `### Binary Lifting Invariant & LCA Algorithm

#### 1. Precomputing the Sparse Table
Define $up[u][k]$ as the $2^k$-th ancestor of node $u$:
$$up[u][0] = \\text{parent}[u]$$
$$up[u][k] = up[up[u][k-1]][k-1] \\quad \\text{for } 1 \\le k < \\log_2 N$$

**Space & Time**:
- Number of levels: $\\text{LOG} = \\lceil \\log_2 N \\rceil + 1$ (e.g. $\\approx 20$ for $N = 2 \\times 10^5$).
- Table size: $N \\times \\text{LOG}$, constructed in $O(N \\log N)$.

---

#### 2. Querying LCA in $O(\\log N)$
1. **Depth Equalization**:
   If $\\text{depth}[u] < \\text{depth}[v]$, swap $u$ and $v$.
   Let $\\Delta = \\text{depth}[u] - \\text{depth}[v]$.
   For each bit $k$ where $((\\Delta \\gg k) \\& 1) == 1$:
   $$u = up[u][k]$$
   Now $\\text{depth}[u] == \\text{depth}[v]$.

2. **Early Exit**:
   If $u == v$, return $u$ (one was an ancestor of the other).

3. **Simultaneous Binary Jumps**:
   For $k = \\text{LOG} - 1 \\dots 0$:
   - If $up[u][k] \\ne up[v][k]$:
     $$u = up[u][k], \\quad v = up[v][k]$$
   *(We jump whenever ancestors differ, stopping just below the LCA).*

4. **Final Step**:
   The LCA is the direct parent: $up[u][0]$.`,
  variations: [
    {
      title: "K-th Ancestor Query",
      explanation: "Jump node u upward by k levels in O(log k) using binary decomposition.",
      formula: "if (k & (1 << i)) u = up[u][i]",
      timeComplexity: "O(log K)",
      spaceComplexity: "O(N log N)",
    },
    {
      title: "Tree Path Distance Query",
      explanation: "Distance between any two nodes u and v on an unweighted tree via LCA.",
      formula: "dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)]",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(N log N)",
    },
    {
      title: "Tree Path Maximum / Minimum Weight",
      explanation: "Maintain parallel table max_edge[u][k] storing heaviest edge along the 2^k jump.",
      formula: "max_edge[u][k] = max(max_edge[u][k-1], max_edge[up[u][k-1]][k-1])",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(N log N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Tree with Q up to 2 * 10^5 path distance queries or kth ancestor queries",
      cue: "Binary lifting LCA in O(log N) per query.",
    },
    {
      triggerConstraint: "Queries asking for minimum edge weight between any two vertices on a tree",
      cue: "Binary lifting with path minimum table in O(log N).",
    },
  ],
  stepByStepStrategy: [
    "1. DFS Setup: Root tree at 1, compute `depth[u]` and `up[u][0] = parent` during pre-order DFS.",
    "2. Table Construction: For k = 1 to LOG-1, for u = 1 to N: `up[u][k] = up[up[u][k-1]][k-1]`.",
    "3. Equalize Depths: Jump the deeper node upwards by binary bits of depth difference.",
    "4. Simultaneous Jumps: Loop k from LOG-1 down to 0, jumping when ancestors differ.",
    "5. Return Immediate Parent: The LCA is `up[u][0]`.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

struct TreeLCA {
    int n, LOG;
    vector<int> depth;
    vector<vector<int>> up;

    TreeLCA(int n, const vector<vector<int>>& adj, int root = 1) : n(n) {
        LOG = 31 - __builtin_clz(n) + 2; // e.g. 20 for 2e5
        depth.assign(n + 1, 0);
        up.assign(n + 1, vector<int>(LOG, 0));
        dfs(root, 0, 0, adj);
    }

    void dfs(int u, int p, int d, const vector<vector<int>>& adj) {
        depth[u] = d;
        up[u][0] = p;
        for (int k = 1; k < LOG; k++) {
            up[u][k] = (up[u][k - 1] == 0) ? 0 : up[up[u][k - 1]][k - 1];
        }
        for (int v : adj[u]) {
            if (v != p) dfs(v, u, d + 1, adj);
        }
    }

    int getLCA(int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        // Equalize depths
        for (int k = LOG - 1; k >= 0; k--) {
            if (depth[u] - (1 << k) >= depth[v]) u = up[u][k];
        }
        if (u == v) return u;
        // Jump together
        for (int k = LOG - 1; k >= 0; k--) {
            if (up[u][k] != up[v][k]) {
                u = up[u][k];
                v = up[v][k];
            }
        }
        return up[u][0];
    }

    int getDist(int u, int v) {
        return depth[u] + depth[v] - 2 * depth[getLCA(u, v)];
    }
};`,
  pitfalls: [
    "LOG Bound Sizing: If LOG is too small (e.g. 15 for N = 10^5), jumps overshoot into 0 and return root incorrectly. Use `LOG = 20` for N <= 5 * 10^5.",
    "Parent of Root: Ensure root's parent is initialized to 0, and `up[0][k] = 0` for all k to avoid out-of-bounds array lookups.",
    "Order of Jumps: When finding LCA, jumping from 0 up to LOG-1 is WRONG. You must jump from largest power (LOG-1) down to 0.",
  ],
  practiceProblems: [
    {
      name: "Company Queries I & II (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1687",
      platform: "CSES",
      hint: "Company Queries I is K-th ancestor; Company Queries II is standard LCA.",
    },
    {
      name: "Distance Queries (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1135",
      platform: "CSES",
      hint: "Query distance between two nodes via depth[u] + depth[v] - 2*depth[LCA].",
    },
    {
      name: "Fools and Roads (Codeforces)",
      rating: 1900,
      url: "https://codeforces.com/problemset/problem/191/C",
      platform: "Codeforces",
      hint: "Tree difference array: for query (u, v), add 1 to u and v, subtract 2 from LCA(u, v).",
    },
  ],
};
