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
  deepExplanation: {
    intuition:
      "Disjoint-Set Union (DSU) partitions N elements into disjoint equivalence classes (connected components). Each component is represented as a directed tree whose root is the canonical leader. Two elements belong to the same component if and only if their root leaders match. Union merges two components by pointing one root to the other. Path compression flattens the tree during find queries, ensuring future lookups jump directly to the root in nearly constant time.",
    proofOfCorrectness:
      "Theorem (Tarjan's Bound: O(M * alpha(N)) with Path Compression & Union by Rank/Size): Let M be the total number of find and union operations on N elements. The height of any tree formed exclusively with union-by-size/rank is at most floor(log2 N). Whenever find(u) executes with path compression, every visited node on the path is reparented directly to the root. Using a potential function based on node ranks and Ackermann hierarchies, Robert Tarjan proved that the total amortized cost of M operations is O(M * alpha(N)), where alpha(N) is the inverse Ackermann function. For any N <= 10^80, alpha(N) <= 4, which is strictly indistinguishable from O(1) in competitive programming.",
    complexityDerivation:
      "Time: Amortized O(alpha(N)) per operation for both unite(u, v) and find(u). Over M = 10^6 operations, total runtime is well under 50ms. Space: O(N) auxiliary memory for the parent and size arrays.",
    whenNotToUse:
      "Do NOT use standard DSU if you need to DELETE edges or disconnect components online. Standard DSU is strictly semi-dynamic (incremental connectivity only). If edges must be deleted dynamically, use Rollback DSU with an offline divide-and-conquer segment tree over time queries, or use a Link-Cut Tree. Also, DSU does not model directed graph reachability.",
  },
  workedExample: {
    title: "Component Merging & Path Compression Trace",
    scenario: "5 nodes: {1}, {2}, {3}, {4}, {5}. Execute: unite(1, 2), unite(3, 4), unite(2, 3), find(4).",
    input: "N = 5. parent = [0, 1, 2, 3, 4, 5], size = [0, 1, 1, 1, 1, 1]",
    output: "All in single component {1, 2, 3, 4} with root 1. find(4) reparents 4 directly to 1.",
    traceSteps: [
      { step: 1, state: "Initial state", action: "Every node is its own root: parent[i] = i, size[i] = 1", insight: "5 components, max size = 1" },
      { step: 2, state: "unite(1, 2)", action: "root(1)=1, root(2)=2. Both size 1. Set parent[2] = 1, size[1] = 2", insight: "Component {1, 2} rooted at 1" },
      { step: 3, state: "unite(3, 4)", action: "root(3)=3, root(4)=4. Set parent[4] = 3, size[3] = 2", insight: "Component {3, 4} rooted at 3" },
      { step: 4, state: "unite(2, 3)", action: "root(2)=1 (size 2), root(3)=3 (size 2). Set parent[3] = 1, size[1] = 4", insight: "Tree structure before find: 4 -> 3 -> 1, 2 -> 1" },
      { step: 5, state: "find(4) with Path Compression", action: "Traverse 4 -> 3 -> 1. Root is 1. Backtrack and assign parent[4] = 1, parent[3] = 1", insight: "Tree depth flattened from 2 to 1! Next find(4) will take exactly 1 pointer step." },
    ],
  },
  trapAnalysis: [
    {
      trap: "Forgetting Assignment in Path Compression",
      cause: "Writing `if (parent[i] == i) return i; return find(parent[i]);` without assigning `parent[i] = ...`.",
      fix: "Always write `return parent[i] = find(parent[i]);` so subsequent calls execute in O(1).",
      wrongSnippet: "int find(int i) { if (parent[i] == i) return i; return find(parent[i]); } // Degrades to O(N) depth!",
      correctedSnippet: "int find(int i) { if (parent[i] == i) return i; return parent[i] = find(parent[i]); } // Amortized O(alpha(N))",
    },
    {
      trap: "Uniting Raw Nodes Instead of Root Leaders",
      cause: "Writing `parent[u] = v` instead of finding root(u) and root(v) first.",
      fix: "Always resolve root_u = find(u) and root_v = find(v) before modifying parent pointers or size counters.",
      wrongSnippet: "void unite(int u, int v) { parent[u] = v; } // Corrupts component tree and misses cycles!",
      correctedSnippet: "bool unite(int u, int v) { int ru = find(u), rv = find(v); if (ru == rv) return false; parent[rv] = ru; return true; }",
    },
    {
      trap: "Using Path Compression with Rollback DSU",
      cause: "Path compression performs multiple irreversible pointer writes per find(), making history undoing impossible.",
      fix: "When rollback is required, use Union-by-Size ONLY (depth is strictly <= log2 N) and push parent updates to an undo stack.",
      wrongSnippet: "int find(int i) { return parent[i] = find(parent[i]); } // Breaks rollback history stack",
      correctedSnippet: "int find(int i) { while (parent[i] != i) i = parent[i]; return i; } // Strict O(log N) suitable for rollback",
    },
  ],
  pythonTemplate: `import sys

# Increase recursion depth for deep recursion (or use iterative find)
sys.setrecursionlimit(300000)

class DSU:
    """Disjoint Set Union with Path Compression and Union by Size."""
    def __init__(self, n: int):
        self.n = n
        self.parent = list(range(n + 1))
        self.size = [1] * (n + 1)
        self.num_components = n
        self.max_size = 1

    def find(self, i: int) -> int:
        """Find representative root with path compression."""
        path = []
        while self.parent[i] != i:
            path.append(i)
            i = self.parent[i]
        # Flatten path to root
        for node in path:
            self.parent[node] = i
        return i

    def unite(self, i: int, j: int) -> bool:
        """Unite components containing i and j. Returns True if merged, False if already connected."""
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i == root_j:
            return False

        # Union by size: attach smaller to larger
        if self.size[root_i] < self.size[root_j]:
            root_i, root_j = root_j, root_i

        self.parent[root_j] = root_i
        self.size[root_i] += self.size[root_j]
        self.num_components -= 1
        if self.size[root_i] > self.max_size:
            self.max_size = self.size[root_i]
            
        return True

    def connected(self, i: int, j: int) -> bool:
        return self.find(i) == self.find(j)

def solve():
    input = sys.stdin.readline
    n, m = map(int, input().split())
    dsu = DSU(n)
    
    out = []
    for _ in range(m):
        u, v = map(int, input().split())
        dsu.unite(u, v)
        out.append(f"{dsu.num_components} {dsu.max_size}")
        
    sys.stdout.write("\\n".join(out) + "\\n")

if __name__ == '__main__':
    solve()
`,
};
