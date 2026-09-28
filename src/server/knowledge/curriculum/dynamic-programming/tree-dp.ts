import { ConceptNode } from "../concept-node-type";

export const treeDPConcept: ConceptNode = {
  slug: "tree-dp",
  name: "Tree Dynamic Programming & Rerooting (In-Out DP)",
  category: "Dynamic Programming",
  difficulty: "INTERMEDIATE",
  description:
    "Subtree aggregation and all-pairs tree metrics in linear O(N) time using two-pass depth-first search traversals. Foundation for USACO Gold and Codeforces Div. 2 D/E problems.",
  timeComplexity: "O(N)",
  spaceComplexity: "O(N)",
  prerequisites: ["1d-dp", "bfs-dfs"],
  dependents: ["binary-lifting-lca"],
  literatureReferences: [
    {
      source: "USACO Guide (Gold)",
      section: "Tree DP & All-Roots Distances",
      url: "https://usaco.guide/gold/all-roots",
      keyInsight:
        "Tree rerooting computes answers for all N nodes as roots in O(N) by transitioning from root u to child v: subtract v's subtree contribution from u, then merge u as v's new child.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 14: Tree Algorithms — Tree DP (pp. 135-142)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "A rooted tree is naturally directed acyclic away from the root. A bottom-up post-order traversal resolves subtrees, while a top-down pre-order pass redistributes parent context.",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 4.5.3: Dynamic Programming on Trees",
      keyInsight:
        "Tree Knapsack (Subtree DP) merges child subtrees in O(N^2) rather than O(N^3) by bounding the inner convolution by the product of subtree sizes.",
    },
  ],
  conceptualTheory: `### The 2-Pass Rerooting Architecture

#### 1. Pass 1: Bottom-Up Post-Order DFS
Root the tree arbitrarily at node $1$.
Compute for every node $u$:
- $sz[u] = 1 + \\sum_{v \\in \\text{children}(u)} sz[v]$
- $dp[u] = \\sum_{v \\in \\text{children}(u)} (dp[v] + sz[v])$ (Sum of distances from $u$ to all nodes in its subtree).

---

#### 2. Pass 2: Top-Down Pre-Order Rerooting DFS
When moving the root from parent $u$ to child $v$:
- The distance to all nodes in $v$'s subtree decreases by $1$: $-sz[v]$.
- The distance to all nodes outside $v$'s subtree increases by $1$: $+(N - sz[v])$.
- **Rerooting Formula**:
  $$\\text{ans}[v] = \\text{ans}[u] - sz[v] + (N - sz[v]) = \\text{ans}[u] + N - 2 \\cdot sz[v]$$
This allows answering queries for **all $N$ potential roots** in strictly $O(N)$ total time!

---

#### 3. General In-Out / Prefix-Suffix Rerooting
For general non-invertible operations (e.g. maximum, gcd):
To compute the rerooted answer without inverse operations:
1. For each node $u$, compute prefix and suffix combinations of child answers:
   $$\\text{pref}[i] = \\bigotimes_{j=0}^i \\text{child}[j], \\quad \\text{suff}[i] = \\bigotimes_{j=i}^k \\text{child}[j]$$
2. When transitioning to child $i$, the excluded context is $\\text{pref}[i-1] \\otimes \\text{suff}[i+1] \\otimes \\text{up}[u]$.`,
  variations: [
    {
      title: "Tree Distances II (Sum of Distances to All Vertices)",
      explanation: "Calculates sum of distances from every node to all other nodes in O(N).",
      formula: "ans[v] = ans[u] + N - 2 * sz[v]",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Tree Distances I (Maximum Distance to Any Vertex)",
      explanation: "Calculates maximum distance from each node to any other node using top two deepest branches.",
      formula: "ans[u] = max(deepest1, up[u])",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Tree Knapsack (Subtree Merging DP)",
      explanation: "Select K nodes in a tree to maximize value. Merging child subtrees runs in O(N^2) using size-bounded loops.",
      formula: "Loop j = 0..sz[u], k = 0..sz[v]",
      timeComplexity: "O(N^2)",
      spaceComplexity: "O(N * K)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Tree with N <= 2 * 10^5, calculate a metric for every vertex if it were chosen as the root",
      cue: "Rerooting DP in 2 DFS passes in O(N).",
    },
    {
      triggerConstraint: "Choosing independent set or vertex cover on a tree",
      cue: "Standard bottom-up Tree DP: dp[u][0] (not chosen) and dp[u][1] (chosen).",
    },
  ],
  stepByStepStrategy: [
    "1. Adjacency Representation: Build undirected graph with vector of vectors `adj`.",
    "2. Pass 1 (Post-Order): Root at 1, compute subtree sizes and initial answer for root 1.",
    "3. Pass 2 (Pre-Order): Propagate answer from parent to child using rerooting delta formula.",
    "4. 64-Bit Distances: Sum of distances in a line graph reaches O(N^2) ~ 4 * 10^{10}. Always use `long long` for distance sums.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

int n;
vector<vector<int>> adj;
vector<long long> sz_tree;
vector<long long> ans;

void dfs1(int u, int p) {
    sz_tree[u] = 1;
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs1(v, u);
        sz_tree[u] += sz_tree[v];
        ans[1] += (ans[v] + sz_tree[v]);
    }
}

void dfs2(int u, int p) {
    for (int v : adj[u]) {
        if (v == p) continue;
        // Rerooting delta formula
        ans[v] = ans[u] + n - 2 * sz_tree[v];
        dfs2(v, u);
    }
}

vector<long long> treeDistances(int totalNodes, const vector<pair<int, int>>& edges) {
    n = totalNodes;
    adj.assign(n + 1, {});
    sz_tree.assign(n + 1, 0);
    ans.assign(n + 1, 0);

    for (const auto& e : edges) {
        adj[e.first].push_back(e.second);
        adj[e.second].push_back(e.first);
    }

    dfs1(1, 0);
    dfs2(1, 0);

    return ans;
}`,
  pitfalls: [
    "Stack Overflow on Deep Trees: In linear trees, recursion depth is N = 2 * 10^5. Ensure recursion stack size or implement manual stack traversal.",
    "Double Counting Edge Lengths: Forgetting to subtract the child subtree before adding parent context.",
    "32-Bit Integer Overflow in Line Trees: A line tree of length 2 * 10^5 has distance sum N*(N-1)/2 ~ 2 * 10^10, which overflows 32-bit int. Always use `long long`.",
  ],
  practiceProblems: [
    {
      name: "Tree Distances I (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1132",
      platform: "CSES",
      hint: "Track top two longest paths in subtree plus longest path going up into parent.",
    },
    {
      name: "Tree Distances II (CSES)",
      rating: 1500,
      url: "https://cses.fi/problemset/task/1133",
      platform: "CSES",
      hint: "All-roots distance sum: ans[v] = ans[u] + N - 2 * sz[v].",
    },
    {
      name: "Subtree (AtCoder Educational DP)",
      rating: 1800,
      url: "https://atcoder.jp/contests/dp/tasks/dp_v",
      platform: "AtCoder",
      hint: "Tree DP with prefix-suffix multiplication for modulo M where M is not necessarily prime.",
    },
  ],
  deepExplanation: {
    intuition:
      "A tree is an acyclic connected graph where removing any edge partitions the vertices into two disjoint subtrees. In Tree DP, we root the tree arbitrarily (e.g. at vertex 1) and compute subtree metrics bottom-up via post-order traversal. For problems requiring answers for ALL vertices as the root (e.g. sum of distances from every vertex), running a full DFS from each vertex requires O(N^2). The Rerooting Technique solves this in O(N) by performing one bottom-up pass followed by one top-down pass, transferring root state along edges in O(1) time.",
    proofOfCorrectness:
      "Theorem (O(1) Rerooting Invariant for Distance Sum): Let T be a tree with N nodes rooted at u. Moving the root to an adjacent neighbor v shifts the tree topology such that the subtree of v now contains the entire tree except what was outside v. Specifically: every node in the original subtree of v is now exactly 1 edge closer to v (saving 1 unit of distance per node, total -sz[v]). Every other node in the tree (N - sz[v] nodes) must now pass through u to reach v, becoming exactly 1 edge farther (adding +1 unit of distance per node, total +(N - sz[v])). Summing these changes: ans[v] = ans[u] + (N - sz[v]) - sz[v] = ans[u] + N - 2 * sz[v]. Because this transition formula depends strictly on precomputed sz[v] and the parent answer ans[u], a single top-down DFS computes exact distance sums for all N nodes in O(N) time.",
    complexityDerivation:
      "Time: DFS 1 (bottom-up subtree sizing and root-1 distance accumulation) visits each vertex and edge once: O(N). DFS 2 (top-down rerooting) computes the transition in O(1) per directed edge: O(N). Total runtime: O(N), running in ~60ms in C++ for N = 200,000. Space: O(N) for adjacency list, subtree sizes, and answer vector.",
    whenNotToUse:
      "Do NOT use static tree DP if edges or node values are updated dynamically between queries; in dynamic settings, use Heavy-Light Decomposition (HLD) or Centroid Decomposition with Segment Trees (O(log^2 N)). If the graph has cycles, tree DP is invalid; compute a Depth-First Search Spanning Tree or Block-Cut Tree first.",
  },
  workedExample: {
    title: "CSES Tree Distances II Rerooting Trace (N = 5)",
    scenario: "Tree with edges (1-2), (1-3), (3-4), (3-5). N = 5 nodes.",
    input: "Edges: (1,2), (1,3), (3,4), (3,5). Root at 1.",
    output: "Distance sums: ans[1]=6, ans[2]=9, ans[3]=5, ans[4]=8, ans[5]=8.",
    traceSteps: [
      { step: 1, state: "DFS 1 Subtree Sizes", action: "Leaves: sz[2]=1, sz[4]=1, sz[5]=1. Node 3: 1 + sz[4] + sz[5] = 3. Root 1: 1 + sz[2] + sz[3] = 5.", insight: "Subtree sizes verified" },
      { step: 2, state: "DFS 1 Subtree Distances for Root 1", action: "dist(1,2)=1, dist(1,3)=1, dist(1,4)=2, dist(1,5)=2. Total sum ans[1] = 1 + 1 + 2 + 2 = 6.", insight: "Base root answer ans[1] = 6" },
      { step: 3, state: "DFS 2 Reroot 1 -> 2", action: "ans[2] = ans[1] + N - 2*sz[2] = 6 + 5 - 2*(1) = 9.", insight: "Node 2 gets 1 step closer to itself (-1), but 1 step farther from remaining 4 nodes (+4). Delta = +3. 6 + 3 = 9" },
      { step: 4, state: "DFS 2 Reroot 1 -> 3", action: "ans[3] = ans[1] + N - 2*sz[3] = 6 + 5 - 2*(3) = 6 + 5 - 6 = 5.", insight: "Node 3 is central: closer to {3, 4, 5} (-3) and farther from {1, 2} (+2). Delta = -1. 6 - 1 = 5" },
      { step: 5, state: "DFS 2 Reroot 3 -> 4 and 3 -> 5", action: "ans[4] = ans[3] + 5 - 2*sz[4] = 5 + 5 - 2 = 8. ans[5] = ans[3] + 5 - 2*sz[5] = 5 + 5 - 2 = 8.", insight: "All 5 all-pairs distance sums finalized in exactly 2 O(N) passes!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Signed 32-Bit Integer Overflow on Line Trees",
      cause: "On a degenerated line graph of N = 2 * 10^5, the sum of all distances is N * (N - 1) / 2 approx 2 * 10^10, exceeding INT_MAX (2.14 * 10^9).",
      fix: "Declare distance sums and answer arrays as `long long`.",
      wrongSnippet: "vector<int> ans(n + 1, 0); // Overflows on tree chains!",
      correctedSnippet: "vector<long long> ans(n + 1, 0); // 64-bit precision safe",
    },
    {
      trap: "Python Maximum Recursion Depth on Deep Chains",
      cause: "Default Python recursion limit is 1000. Tree of depth 200,000 raises `RecursionError: maximum recursion depth exceeded`.",
      fix: "Call `sys.setrecursionlimit(300000)` and run on large stack, or write iterative DFS.",
      wrongSnippet: "def dfs(u, p): for v in adj[u]: ... # Crashes on long chains",
      correctedSnippet: "import sys; sys.setrecursionlimit(300000)",
    },
    {
      trap: "Non-Invertible Operator Rerooting Division Bug",
      cause: "When computing tree DP under non-prime modulo M or max/min aggregations, subtracting or dividing by child's contribution is invalid.",
      fix: "Use prefix and suffix product/aggregate arrays across the children of each node to compute exclusions without division.",
      wrongSnippet: "long long parent_contrib = total_prod / child_val; // Division by zero or non-coprime modulo breaks!",
      correctedSnippet: "// Compute prefix and suffix arrays of children contributions: pref[i-1] * suff[i+1]",
    },
  ],
  pythonTemplate: `import sys

# Crucial for deep trees (chains of 200,000 nodes)
sys.setrecursionlimit(300000)

def solve():
    """CSES Tree Distances II in O(N) via Rerooting Technique."""
    input = sys.stdin.readline
    n = int(input())
    if n == 1:
        print(0)
        return

    adj = [[] for _ in range(n + 1)]
    for _ in range(n - 1):
        u, v = map(int, input().split())
        adj[u].append(v)
        adj[v].append(u)

    sz = [0] * (n + 1)
    ans = [0] * (n + 1)

    # DFS 1: Subtree sizes and initial root-1 distance sum
    def dfs1(u: int, p: int, depth: int):
        sz[u] = 1
        ans[1] += depth
        for v in adj[u]:
            if v != p:
                dfs1(v, u, depth + 1)
                sz[u] += sz[v]

    # DFS 2: Top-down rerooting
    def dfs2(u: int, p: int):
        for v in adj[u]:
            if v != p:
                # v moves 1 edge closer to sz[v] nodes, and 1 edge farther from (n - sz[v]) nodes
                ans[v] = ans[u] + n - 2 * sz[v]
                dfs2(v, u)

    dfs1(1, 0, 0)
    dfs2(1, 0)

    print(" ".join(str(ans[i]) for i in range(1, n + 1)))

if __name__ == '__main__':
    solve()
`,
};
