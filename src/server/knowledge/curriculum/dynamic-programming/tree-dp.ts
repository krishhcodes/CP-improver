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
  conceptualTheory: `## Tree DP & Rerooting: A Complete Textbook Chapter

### What Makes Tree DP Different from Linear DP?

In standard Linear Dynamic Programming, states are typically indexed sequentially along an array:
\`dp[i]\` depends on predecessors \`dp[i-1]\`, \`dp[i-2]\`, or a sliding prefix.

A tree, however, has **hierarchical branching topology**:
- There is no single "left-to-right" order.
- Instead, a tree naturally decomposes into **nested subtrees**: removing any edge disconnects the tree into two independent subtrees.
- If we root the tree arbitrarily at a vertex (conventionally vertex 1), every node $u$ defines a rooted subtree $T_u$ consisting of $u$ and all its descendants.

#### The Bottom-Up Invariant (Post-Order Traversal)
In Tree DP, **a parent's state depends strictly on the states of its children**:
$$\text{dp}[u] = \text{combine}(\text{dp}[v_1], \text{dp}[v_2], \dots, \text{dp}[v_k])$$
Therefore, we evaluate the tree in **Post-Order Traversal**:
1. Recurse into all children first.
2. When the recursion backtracks from child $v$ to parent $u$, the child's subtree $T_v$ is completely solved.
3. Compute $\text{dp}[u]$ using the finalized child states.
A simple recursive Depth-First Search (DFS) naturally implements this post-order evaluation order!

---

### Archetype 1: Subtree Optimizations (Diameter & Maximum Path)

#### Classic Problem: Tree Diameter (Longest Simple Path in a Tree)
Given an unweighted tree of $N$ vertices, find the length of the longest path between any two vertices.

#### State Definition
At each node $u$:
Let $\text{down}[u]$ be the length of the longest simple path starting at $u$ and going **downward** into the subtree of $u$.

#### Base Case & Recurrence
- If $u$ is a leaf node: $\text{down}[u] = 0$.
- For an internal node $u$ with children $v_1, v_2, \dots$:
  $$\text{down}[u] = 1 + \max_{v \in \text{children}(u)} \text{down}[v]$$

#### Finding the Diameter
The longest path in the entire tree has a unique highest node (its Lowest Common Ancestor $u$):
- Either the path passes THROUGH $u$: it comes up from one child subtree, reaches $u$, and goes down into another child subtree.
- Its length is the sum of the **two longest downward paths** among all children of $u$:
  $$\text{path\_through}(u) = \text{longest\_child}(u) + \text{second\_longest\_child}(u) + 2$$
- The overall tree diameter is simply:
  $$\text{Diameter} = \max_{u \in V} \text{path\_through}(u)$$

\`\`\`cpp
int diameter = 0;
int dfs(int u, int p) {
    int max1 = 0, max2 = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        int d = 1 + dfs(v, u);
        if (d > max1) { max2 = max1; max1 = d; }
        else if (d > max2) { max2 = d; }
    }
    diameter = max(diameter, max1 + max2);
    return max1;
}
\`\`\`
**Runtime**: Exactly one DFS visit per vertex and edge: strictly $O(N)$!

---

### Archetype 2: Subtree Subset Selection (Maximum Independent Set)

#### Classic Problem: House Robber on a Tree
Given a tree where each node $u$ has value $val[u]$, choose a subset of nodes with maximum total value such that **no two chosen nodes are directly connected by an edge**.

#### The 2-State Recurrence
For each node $u$, we maintain two mutually exclusive states:
1. $\text{dp}[u][0]$: Maximum value in subtree $T_u$ given that node $u$ is **NOT chosen**.
2. $\text{dp}[u][1]$: Maximum value in subtree $T_u$ given that node $u$ **IS chosen**.

#### State Transitions
- **If node $u$ is NOT chosen ($	ext{dp}[u][0]$)**:
  Its children can either be chosen or not chosen — each child $v$ independently picks whichever yields the greater value!
  $$\text{dp}[u][0] = \sum_{v \in \text{children}(u)} \max(\text{dp}[v][0], \ \text{dp}[v][1])$$
- **If node $u$ IS chosen ($	ext{dp}[u][1]$)**:
  Because adjacent nodes cannot both be chosen, **NONE of $u$'s children can be chosen**! Every child $v$ is forced into state $\text{dp}[v][0]$:
  $$\text{dp}[u][1] = val[u] + \sum_{v \in \text{children}(u)} \text{dp}[v][0]$$

#### Final Answer
$$\max(\text{dp}[\text{root}][0], \ \text{dp}[\text{root}][1])$$
**Runtime**: $O(N)$ time and $O(N)$ space.

---

### Archetype 3: The Rerooting Technique (All-Roots Tree DP)

#### The Problem That Breaks Naive Tree DP
Suppose a problem asks:
> *"For **EACH** vertex $u \in \{1, \dots, N\}$, find the sum of distances from $u$ to all other vertices in the tree."* ($N = 2 \times 10^5$)

- **Naive approach**: Run a separate DFS from each of the $N$ nodes as root.
  $$\text{Total Time} = N \times O(N) = O(N^2) \approx (2 \times 10^5)^2 = 4 \times 10^{10} \text{ operations (TLE!)}$$
- **Rerooting Technique**: Solves this for ALL $N$ vertices simultaneously in strictly **$O(N)$ time**!

---

### The 2-Pass Rerooting Protocol (In Depth)

Rerooting solves all-roots problems using two complementary DFS passes:
1. **Pass 1 (Bottom-Up Post-Order)**: Root the tree arbitrarily at vertex 1. Compute subtree sizes $sz[u]$ and subtree metrics for root 1.
2. **Pass 2 (Top-Down Pre-Order)**: Push the root answers down to children in $O(1)$ per edge!

#### Mathematical Derivation of the Transition Formula
Let $ans[u]$ be the sum of distances from node $u$ to all nodes in the tree.
Suppose we know $ans[u]$, and we want to compute $ans[v]$ for a neighbor child $v$:
When the root moves from $u$ across edge $(u, v)$ to $v$:
1. **Nodes in $v$'s subtree ($sz[v]$ nodes)**:
   Every node in the subtree of $v$ is now **1 step CLOSER** to the new root $v$.
   Contribution: $-sz[v]$
2. **Nodes outside $v$'s subtree ($N - sz[v]$ nodes)**:
   Every node outside $v$'s subtree was previously connected to $u$. To reach $v$, they must now travel across the edge $(u, v)$, making them **1 step FARTHER**.
   Contribution: $+(N - sz[v])$

Summing both contributions yields the famous **Rerooting Distance Formula**:
$$ans[v] = ans[u] - sz[v] + (N - sz[v]) = ans[u] + N - 2 \times sz[v]$$

Because $N$ and $sz[v]$ are precomputed, computing $ans[v]$ from $ans[u]$ takes strictly **$O(1)$ time**!

\`\`\`cpp
// Pass 1: Bottom-up subtree sizes and root-1 distance sum
void dfs1(int u, int p, int depth) {
    sz[u] = 1;
    ans[1] += depth;
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs1(v, u, depth + 1);
        sz[u] += sz[v];
    }
}

// Pass 2: Top-down rerooting transfer
void dfs2(int u, int p) {
    for (int v : adj[u]) {
        if (v == p) continue;
        // O(1) state transfer
        ans[v] = ans[u] + n - 2 * sz[v];
        dfs2(v, u);
    }
}
\`\`\`
Total execution time: exactly two $O(N)$ DFS passes = strictly $O(N)$!

---

### Archetype 4: Non-Invertible Rerooting via Prefix-Suffix Merging

In the distance sum problem, the aggregation operation was addition, which is **invertible** (we could subtract child $v$'s contribution).
What if the aggregation is **NOT invertible**?
For example:
- Finding the maximum distance to any node (operation is $\max$). You cannot "un-max" a value!
- Multiplying probabilities or weights under non-prime modulo $M$ (division by zero or non-coprime numbers is undefined).

#### The Prefix-Suffix Solution
For each node $u$ with children $v_1, v_2, \dots, v_k$:
To compute what $u$ contributes to child $v_i$ when $v_i$ becomes the new root:
1. We need the aggregate of all children of $u$ **EXCEPT $v_i$**, merged with the parent contribution from above $u$.
2. Compute two auxiliary arrays across the list of children:
   - $\text{pref}[i]$ = aggregate of children $v_1 \dots v_i$
   - $\text{suff}[i]$ = aggregate of children $v_i \dots v_k$
3. Then the contribution excluding child $v_i$ is simply:
   $$\text{exclude}(v_i) = \text{combine}(\text{pref}[i - 1], \ \text{suff}[i + 1], \ \text{parent\_contrib})$$

Because each child list of length $k$ takes $O(k)$ to build prefix/suffix tables, the sum over all nodes $\sum k = O(N)$. Non-invertible rerooting runs in strictly **$O(N)$ time**!

---

### Archetype 5: Tree Knapsack (Why It Is O(N²) and NOT O(N³))

A common problem:
*"Each node has weight $w[u]$ and value $val[u]$. Choose at most $K$ connected nodes in the tree to maximize total value."*

Let $\text{dp}[u][j]$ be the maximum value in subtree $T_u$ using $j$ nodes.
When merging child subtree $v$ of size $sz[v]$ into parent $u$ of current size $sz[u]$:
\`\`\`cpp
for (int j = min(k, sz[u]); j >= 0; j--) {
    for (int c = 0; c <= min(k - j, sz[v]); c++) {
        new_dp[j + c] = max(new_dp[j + c], dp[u][j] + dp[v][c]);
    }
}
\`\`\`

#### The Pair-Counting Proof of O(N²) Runtime
At first glance, three nested loops (nodes $\times$ budget $\times$ budget) look like $O(N^3)$ or $O(N \cdot K^2)$.
However, notice the bound:
The inner double loop runs $sz[u] \times sz[v]$ iterations.
What does $sz[u] \times sz[v]$ represent?
**It represents the number of pairs of vertices $(x, y)$ such that $x \in T_u$ and $y \in T_v$!**
Because every pair of vertices in a tree has a **unique Lowest Common Ancestor (LCA)**, each pair of vertices $(x, y)$ is considered in the inner loop **EXACTLY ONCE** across the entire algorithm — at the moment their subtrees are merged at their LCA!
Since there are $\binom{N}{2} = \frac{N(N - 1)}{2} = O(N^2)$ total pairs of vertices in the tree:
$$\text{Total Operations} \le \sum_{\text{merges}} sz[u] \times sz[v] = \frac{N(N - 1)}{2} = O(N^2)$$
When bounded by knapsack capacity $K$, the runtime reduces further to **$O(N \times K)$**!

---

### Contest Checklist & Tree DP Traps

1. **Stack Overflow on Line Trees**:
   A degenerated tree (a bamboo line graph of $N = 2 \times 10^5$) will recurse 200,000 frames deep. In C++, ensure the contest environment has sufficient stack size (Codeforces provides 256MB stack; on platforms with limited stack, use manual stack or BFS topological order). In Python, ALWAYS set \`sys.setrecursionlimit(300000)\`.
2. **64-bit Distance Sums**:
   On a line tree of $N = 2 \times 10^5$, the sum of distances from an endpoint is $\frac{N(N - 1)}{2} \approx 2 \times 10^{10}$, which overflows 32-bit signed integers. Always use \`long long\` for distance metrics.
3. **Subtree Size Initialization**:
   In \`dfs1\`, initialize \`sz[u] = 1\` (accounting for node $u$ itself) BEFORE iterating over children.
4. **Undirected Edge Avoidance**:
   Always pass the parent parameter \`p\` in \`dfs(u, p)\` and check \`if (v == p) continue;\` to prevent infinite cycling between parent and child.`,
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
