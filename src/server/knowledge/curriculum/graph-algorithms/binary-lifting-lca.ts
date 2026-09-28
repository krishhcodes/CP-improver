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
  deepExplanation: {
    intuition:
      "In a tree, walking from a node to an ancestor one step at a time takes O(N) in the worst case (a degenerate line graph). Binary Lifting solves this by precomputing powers-of-two jumps: the 1st, 2nd, 4th, 8th, ..., 2^k-th ancestor of each node. Because any arbitrary jump distance K can be uniquely decomposed into the sum of powers of two (its binary representation), we can reach any ancestor K steps away in O(log K) steps. For the Lowest Common Ancestor (LCA) of two nodes u and v, we first equalize their depths, then binary lift both nodes simultaneously until they are immediate children of their common ancestor.",
    proofOfCorrectness:
      "Theorem (Correctness of Binary Doubling & LCA Divergence Search): (1) Doubling Invariant: For all k >= 1, the 2^k-th ancestor of u is the 2^(k-1)-th ancestor of u's 2^(k-1)-th ancestor, because 2^k = 2^(k-1) + 2^(k-1). Computing up[u][k] = up[up[u][k-1]][k-1] by dynamic programming in increasing order of k guarantees that every jump target is precomputed and exact. (2) Depth Equalization: Let Delta = depth[u] - depth[v] >= 0. For each bit k where (Delta & (1 << k)) != 0, jumping u = up[u][k] reduces the depth difference by exactly 2^k, ending with depth[u] == depth[v]. (3) Divergence Search: If u == v after equalization, v was an ancestor of u, so v is the LCA. Otherwise, let k iterate from LOG - 1 down to 0. If up[u][k] != up[v][k], the true LCA must lie strictly above 2^k steps; hence advancing u = up[u][k] and v = up[v][k] preserves the invariant that LCA(u, v) is an ancestor of both nodes. If up[u][k] == up[v][k], jumping 2^k would overshoot the lowest common ancestor into a common ancestor; hence we do not jump. By binary bisection, the search terminates with u and v being distinct nodes whose immediate parents coincide. Thus, LCA(u, v) = up[u][0].",
    complexityDerivation:
      "Precomputation: O(N log N) time and memory to build the N x LOG table up[][], where LOG = ceil(log2 N) + 1. For N = 200,000, LOG = 19, taking ~200,000 * 19 * 4 bytes ≈ 15 MB RAM. Query Time: O(log N) for getLCA, K-th ancestor, and tree distance queries. 200,000 queries execute in ~110ms in C++.",
    whenNotToUse:
      "If ALL queries are known in advance (offline), Tarjan's Offline LCA with DSU runs in O(N + Q * alpha(N)), which is faster and uses O(N) memory. If queries require O(1) worst-case time per LCA, Euler Tour Flattening with a Sparse Table (RMQ) achieves O(1) query time after O(N log N) precomputation.",
  },
  workedExample: {
    title: "Binary Lifting LCA Trace: Nodes 5 and 6",
    scenario: "Tree: 1 (root), 2 (child of 1), 3 (child of 1), 4 (child of 2), 5 (child of 4), 6 (child of 3). Depths: 1 (0), 2 (1), 3 (1), 4 (2), 5 (3), 6 (1). Query LCA(5, 6).",
    input: "u = 5 (depth 3), v = 6 (depth 1). LOG = 3 (powers 2^0=1, 2^1=2, 2^2=4).",
    output: "LCA(5, 6) = 1. Distance between 5 and 6 = 3 + 1 - 2*0 = 4 (path: 5-4-2-1-3-6).",
    traceSteps: [
      { step: 1, state: "Phase 1: Equalize Depths", action: "depth[5] = 3, depth[6] = 1. Difference Delta = 3 - 1 = 2 (binary 10_2). Jump u by 2^1 = 2 steps: up[5][1] = 2. Now u = 2 (depth 1), v = 6 (depth 1).", insight: "Both nodes now at identical depth 1" },
      { step: 2, state: "Phase 2: Check u == v", action: "u = 2, v = 6. Not equal, proceed to binary lifting together.", insight: "Neither was an ancestor of the other" },
      { step: 3, state: "Lift Bit k = 2 (jump 4)", action: "up[2][2] = 0, up[6][2] = 0. Equal (both 0, out of tree). Overshoot! Do not jump.", insight: "Common ancestor overshoot prevented" },
      { step: 4, state: "Lift Bit k = 1 (jump 2)", action: "up[2][1] = 0, up[6][1] = 0. Equal (overshoot). Do not jump.", insight: "Still above root" },
      { step: 5, state: "Lift Bit k = 0 (jump 1)", action: "up[2][0] = 1, up[6][0] = 1. Equal! Do not jump.", insight: "Nodes 2 and 6 are immediate children of LCA 1" },
      { step: 6, state: "Final LCA Return", action: "Return up[u][0] = up[2][0] = 1. Verified: path 5 -> 4 -> 2 -> 1 -> 6 meets at 1.", insight: "LCA confirmed in O(log N) steps!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Under-Allocating LOG for Deep Paths",
      cause: "Setting `LOG = 16` for N = 2 * 10^5. Since 2^16 = 65,536 < 200,000, jumps along deep branches cannot reach ancestors beyond depth 65,536.",
      fix: "Use `LOG = 20` for N <= 5 * 10^5, or compute dynamically: `31 - __builtin_clz(n) + 2`.",
      wrongSnippet: "const int LOG = 16; int up[MAXN][LOG]; // Fails when tree depth exceeds 65536!",
      correctedSnippet: "const int LOG = 20; int up[MAXN][LOG]; // Safe up to depth 1,000,000",
    },
    {
      trap: "Lifting in Ascending Order (0 to LOG-1)",
      cause: "Looping `for (int k = 0; k < LOG; k++)` during binary search. Small jumps move nodes past each other, corrupting the invariant.",
      fix: "Always loop in descending order `for (int k = LOG - 1; k >= 0; k--)` to halve the search space from largest power of two to smallest.",
      wrongSnippet: "for (int k = 0; k < LOG; k++) if (up[u][k] != up[v][k]) ... // Erroneous bisection order!",
      correctedSnippet: "for (int k = LOG - 1; k >= 0; k--) if (up[u][k] != up[v][k]) ... // Correct bisection",
    },
    {
      trap: "Sentinel Zero Out-of-Bounds Node Access",
      cause: "If node 0 is used as the unassigned sentinel and not padded in vectors, `up[0][k]` reads invalid memory.",
      fix: "Allocate vectors of size `n + 1`, and ensure `up[0][k] = 0` for all k.",
      wrongSnippet: "up.assign(n, vector<int>(LOG)); // Index n causes segfault on 1-based graphs",
      correctedSnippet: "up.assign(n + 1, vector<int>(LOG, 0)); // 1-based indexing with safe zero sentinel",
    },
  ],
  pythonTemplate: `import sys

sys.setrecursionlimit(300000)

class BinaryLiftingLCA:
    """O(N log N) precomputation, O(log N) LCA and tree distance queries."""
    def __init__(self, n: int, adj: list, root: int = 1):
        self.n = n
        self.adj = adj
        self.LOG = (n).bit_length() + 1
        self.depth = [0] * (n + 1)
        self.up = [[0] * self.LOG for _ in range(n + 1)]

        # Run iterative or recursive DFS to build tree
        self._dfs(root, 0, 0)

    def _dfs(self, u: int, p: int, d: int):
        self.depth[u] = d
        self.up[u][0] = p
        for k in range(1, self.LOG):
            parent = self.up[u][k - 1]
            self.up[u][k] = self.up[parent][k - 1] if parent != 0 else 0

        for v in self.adj[u]:
            if v != p:
                self._dfs(v, u, d + 1)

    def get_kth_ancestor(self, node: int, k: int) -> int:
        """Jump k steps up from node. Returns 0 if outside tree."""
        curr = node
        for b in range(self.LOG):
            if (k >> b) & 1:
                curr = self.up[curr][b]
                if curr == 0:
                    break
        return curr

    def get_lca(self, u: int, v: int) -> int:
        """Find Lowest Common Ancestor of u and v in O(log N)."""
        if self.depth[u] < self.depth[v]:
            u, v = v, u

        # Step 1: Equalize depths
        diff = self.depth[u] - self.depth[v]
        for b in range(self.LOG):
            if (diff >> b) & 1:
                u = self.up[u][b]

        if u == v:
            return u

        # Step 2: Lift together from largest jump down to 0
        for b in range(self.LOG - 1, -1, -1):
            if self.up[u][b] != self.up[v][b]:
                u = self.up[u][b]
                v = self.up[v][b]

        return self.up[u][0]

    def get_distance(self, u: int, v: int) -> int:
        lca = self.get_lca(u, v)
        return self.depth[u] + self.depth[v] - 2 * self.depth[lca]

def solve():
    input = sys.stdin.readline
    n, q = map(int, input().split())
    # CSES Company Queries II format: parent of node i is given for i = 2..N
    parents = list(map(int, input().split()))
    adj = [[] for _ in range(n + 1)]
    for i in range(2, n + 1):
        p = parents[i - 2]
        adj[p].append(i)
        adj[i].append(p)

    lca_solver = BinaryLiftingLCA(n, adj, root=1)
    
    out = []
    for _ in range(q):
        u, v = map(int, input().split())
        out.append(str(lca_solver.get_lca(u, v)))
        
    sys.stdout.write("\\n".join(out) + "\\n")

if __name__ == '__main__':
    solve()
`,
};
