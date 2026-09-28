import { ConceptNode } from "../concept-node-type";

export const dsuConcept: ConceptNode = {
  slug: "dsu",
  name: "Disjoint Set Union (DSU / Union-Find)",
  category: "Data Structures",
  difficulty: "BEGINNER",
  description:
    "Near-constant time data structure maintaining dynamic partitions of N elements into disjoint equivalence sets, supporting union and find operations in amortized O(α(N)).",
  timeComplexity: "O(α(N)) amortized per operation",
  spaceComplexity: "O(N)",
  prerequisites: ["bfs-dfs"],
  dependents: ["mst-kruskal"],
  literatureReferences: [
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 15: Spanning Trees — Disjoint Set Union (pp. 143-146)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Path compression points every visited vertex directly to its set representative root during find(), flattening trees dramatically.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 21: Data Structures for Disjoint Sets",
      keyInsight:
        "Combining Path Compression with Union by Rank/Size guarantees amortized time O(α(N)) per operation, where α is the inverse Ackermann function (α(N) <= 4 for all universe atoms).",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 2.4.2: Union-Find Disjoint Sets (UFDS)",
      keyInsight:
        "Augmenting roots with extra payload data (such as component size, component min/max, or cycle count) solves dynamic connectivity with minimal overhead.",
    },
  ],
  conceptualTheory: `### Theoretical Foundations & Ackermann Invariants

#### 1. The Two Optimizations
Without optimization, a sequence of unions can form a degenerate linked list of depth $N$, degrading find operations to $O(N)$.

1. **Union by Size / Rank**:
   Always attach the smaller tree under the root of the larger tree:
   $$\\text{If } \\text{sz}[u] < \\text{sz}[v], \\text{ parent}[u] = v; \\quad \\text{sz}[v] += \\text{sz}[u]$$
   This alone guarantees tree depth $\\le \\log_2 N$.

2. **Path Compression**:
   During \`find(i)\`, update parent pointers along the entire search path to point directly to the root:
   \`\`\`cpp
   int find(int i) {
       return (parent[i] == i) ? i : (parent[i] = find(parent[i]));
   }
   \`\`\`

---

#### 2. Tarjan's Amortized Bound: $O(\\alpha(N))$
When both optimizations are combined, any sequence of $M$ operations on $N$ elements takes $O(M \\cdot \\alpha(N))$ time.
The inverse Ackermann function $\\alpha(N)$ grows so slowly that:
$$\\alpha(10^{600}) \\le 4$$
For all practical computational purposes, operations execute in effectively $O(1)$ constant time.`,
  variations: [
    {
      title: "DSU with Component Size Tracking",
      explanation: "Maintains size of each connected component at its root. Useful for finding size of group containing x.",
      formula: "sz[root_v] += sz[root_u]",
      timeComplexity: "O(α(N))",
      spaceComplexity: "O(N)",
    },
    {
      title: "Bipartite / Parity DSU",
      explanation: "Maintains 2-coloring (bipartiteness) across components by tracking distance/parity to parent.",
      formula: "parity[u] = (parity[parent] + edge_parity) % 2",
      timeComplexity: "O(α(N))",
      spaceComplexity: "O(N)",
    },
    {
      title: "Rollback DSU (Offline Divide & Conquer)",
      explanation: "Omits path compression (retains union by size) to allow undoing operations in LIFO order using a history stack.",
      formula: "Undo last union in O(1); tree height O(log N)",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Online edge additions with queries asking if two vertices are connected",
      cue: "Disjoint Set Union (DSU) in O(α(N)) per query.",
    },
    {
      triggerConstraint: "Adding edges to a graph and detecting the exact moment a cycle forms",
      cue: "If find(u) == find(v), adding edge (u, v) creates a cycle.",
    },
    {
      triggerConstraint: "Greedy edge sorting for Minimum Spanning Trees (Kruskal)",
      cue: "DSU guards against creating cycles in O(E α(V)).",
    },
  ],
  stepByStepStrategy: [
    "1. Initialization: Set parent[i] = i and size[i] = 1 for all i from 1 to N.",
    "2. Find with Path Compression: Use recursive assignment `return parent[i] = find(parent[i])`.",
    "3. Union with Size/Rank: Find roots root_u and root_v. If identical, return false (already connected). Otherwise, attach smaller to larger.",
    "4. Return Union Status: Returning a boolean from unite() allows immediate cycle detection.",
  ],
  codeTemplate: `#include <vector>
#include <numeric>
#include <iostream>

using namespace std;

struct DSU {
    int numComponents;
    vector<int> parent;
    vector<int> size;

    DSU(int n) : numComponents(n), parent(n + 1), size(n + 1, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }

    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i == root_j) return false; // Cycle detected

        // Union by size
        if (size[root_i] < size[root_j]) swap(root_i, root_j);
        parent[root_j] = root_i;
        size[root_i] += size[root_j];
        numComponents--;
        return true;
    }

    bool isConnected(int i, int j) {
        return find(i) == find(j);
    }

    int getComponentSize(int i) {
        return size[find(i)];
    }
};`,
  pitfalls: [
    "1-Based vs 0-Based Node Indexing: Initializing vectors of size N when graph nodes are 1..N causes out-of-bounds access. Always allocate N + 1.",
    "Forgetting Path Compression: Writing `if (parent[i] == i) return i; return find(parent[i]);` misses the assignment `parent[i] = ...`, leaving trees deep and degrading to O(N).",
    "Combining Rollback with Path Compression: Path compression mutates parent pointers irreversibly. Rollback DSU MUST use union by size ONLY, achieving O(log N) without path compression.",
  ],
  practiceProblems: [
    {
      name: "Road Construction (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1676",
      platform: "CSES",
      hint: "Track number of components and maximum component size after each added road.",
    },
    {
      name: "Moocast (USACO Gold)",
      rating: 1500,
      url: "http://www.usaco.org/index.php?page=viewproblem2&cpid=669",
      platform: "USACO",
      hint: "Binary search on transmission power X or sort edges by distance squared and use DSU until single component.",
    },
    {
      name: "Love Rescue (Codeforces)",
      rating: 1400,
      url: "https://codeforces.com/problemset/problem/939/D",
      platform: "Codeforces",
      hint: "Unite character pairs that need to become identical; minimal spells is edges in DSU spanning forest.",
    },
  ],
};
