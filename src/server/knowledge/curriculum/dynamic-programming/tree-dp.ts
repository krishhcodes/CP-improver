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
};
