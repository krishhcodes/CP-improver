export interface CurriculumGuideLink {
  slug: string;
  name: string;
  category: string;
  primaryBookCitation: string;
  chapter: string;
  keyInvariant: string;
  recommendedTimeMinutes: number;
}

export const CURRICULUM_GUIDE_MAP: Record<string, CurriculumGuideLink> = {
  "prefix-sums": {
    slug: "prefix-sums",
    name: "Prefix Sums & Range Queries (Static 1D/2D)",
    category: "Data Structures",
    primaryBookCitation: "USACO Guide Bronze & CPH Ch 9",
    chapter: "Range Queries on Static Arrays",
    keyInvariant: "O(N) precomputation enables O(1) query: Query(L, R) = P[R] - P[L-1]",
    recommendedTimeMinutes: 20,
  },
  "two-pointers": {
    slug: "two-pointers",
    name: "Two Pointers & Sliding Window",
    category: "Algorithms",
    primaryBookCitation: "USACO Guide Silver & CPH Ch 8",
    chapter: "The Two Pointers Technique & Subarray Invariants",
    keyInvariant: "Window boundaries advance monotonically in amortized O(N) operations",
    recommendedTimeMinutes: 25,
  },
  "binary-search-answer": {
    slug: "binary-search-answer",
    name: "Binary Search on Monotonic Predicate",
    category: "Algorithms",
    primaryBookCitation: "USACO Guide Silver & Principles of Algorithmic Problem Solving Ch 5",
    chapter: "Monotonic Predicate Inversion",
    keyInvariant: "Verification predicate P(x) is monotonic: F...FT...T, reducing space to O(log(High - Low))",
    recommendedTimeMinutes: 25,
  },
  "1d-dp": {
    slug: "1d-dp",
    name: "1D Dynamic Programming & State Reductions",
    category: "Dynamic Programming",
    primaryBookCitation: "USACO Guide Silver & CPH Ch 7",
    chapter: "State Formulations & DAG Topological Order",
    keyInvariant: "Optimal substructure: DP[i] depends only on resolved predecessor subproblems",
    recommendedTimeMinutes: 30,
  },
  "knapsack": {
    slug: "knapsack",
    name: "0/1, Unbounded & Bounded Knapsack DP",
    category: "Dynamic Programming",
    primaryBookCitation: "CLRS Ch 16 & CP4 Book 1 Sec 3.5",
    chapter: "Classical Knapsack Formulations & Space Compression",
    keyInvariant: "Reverse loop traversal on 1D array prevents duplicate item reuse in 0/1 knapsack",
    recommendedTimeMinutes: 30,
  },
  "bitmask-dp": {
    slug: "bitmask-dp",
    name: "Bitmask DP & State Compression",
    category: "Dynamic Programming",
    primaryBookCitation: "CPH Ch 10 & Principles of Algorithmic Problem Solving Ch 10",
    chapter: "Subsets & Bitwise State Transitions",
    keyInvariant: "Integer bitmask representation enables compact DP states for N <= 20",
    recommendedTimeMinutes: 35,
  },
  "bfs-dfs": {
    slug: "bfs-dfs",
    name: "Graph Traversals (BFS, DFS & Tree Diameter)",
    category: "Graphs",
    primaryBookCitation: "USACO Guide Silver & CPH Ch 11-12",
    chapter: "Tree & Graph Traversals",
    keyInvariant: "BFS explores vertices in non-decreasing shortest distance order; DFS forms depth-first spanning forest",
    recommendedTimeMinutes: 30,
  },
  "dsu": {
    slug: "dsu",
    name: "Disjoint Set Union (DSU / Union-Find)",
    category: "Data Structures",
    primaryBookCitation: "CPH Ch 15 & CLRS Ch 21",
    chapter: "Disjoint Set Data Structure",
    keyInvariant: "Path compression and union by rank guarantee O(α(N)) nearly constant amortized operations",
    recommendedTimeMinutes: 25,
  },
  "dijkstra": {
    slug: "dijkstra",
    name: "Dijkstra's Single-Source Shortest Paths",
    category: "Graphs",
    primaryBookCitation: "CLRS Ch 24 & CPH Ch 13",
    chapter: "Single-Source Shortest Paths with Non-negative Weights",
    keyInvariant: "Greedy choice property: minimum priority-queue node has final finalized shortest path",
    recommendedTimeMinutes: 35,
  },
  "mst-kruskal": {
    slug: "mst-kruskal",
    name: "Kruskal's Minimum Spanning Tree",
    category: "Graphs",
    primaryBookCitation: "CLRS Ch 23 & CPH Ch 15",
    chapter: "Minimum Spanning Trees & The Cut Property",
    keyInvariant: "Cut Property: light edge crossing any cut of G belongs to some MST",
    recommendedTimeMinutes: 30,
  },
  "segment-tree": {
    slug: "segment-tree",
    name: "Segment Trees & Range Queries",
    category: "Data Structures",
    primaryBookCitation: "CP4 Book 1 Sec 2.4 & CLRS Ch 14",
    chapter: "Segment Trees (Point Update / Range Query)",
    keyInvariant: "Associative monoid operation partitioned across O(log N) canonical tree nodes",
    recommendedTimeMinutes: 40,
  },
  "lazy-propagation": {
    slug: "lazy-propagation",
    name: "Segment Tree with Lazy Propagation",
    category: "Data Structures",
    primaryBookCitation: "CP4 Book 1 Sec 2.4 & CPH Ch 28",
    chapter: "Range Update & Range Query Acceleration",
    keyInvariant: "Pending range updates are deferred to child nodes only upon traversal descent in O(log N)",
    recommendedTimeMinutes: 45,
  },
  "tree-dp": {
    slug: "tree-dp",
    name: "Tree Dynamic Programming & Rerooting (In-Out DP)",
    category: "Dynamic Programming",
    primaryBookCitation: "USACO Guide Gold & CPH Ch 14",
    chapter: "Tree Algorithms — Subtree Aggregation & Rerooting",
    keyInvariant: "All-roots answers computed in O(N) by subtracting child subtree before merging parent context",
    recommendedTimeMinutes: 40,
  },
  "binary-lifting-lca": {
    slug: "binary-lifting-lca",
    name: "Binary Lifting & Lowest Common Ancestor (LCA)",
    category: "Tree Algorithms",
    primaryBookCitation: "USACO Guide Platinum & CPH Ch 18",
    chapter: "Tree Queries — Binary Lifting & LCA",
    keyInvariant: "Precompute 2^k ancestors in O(N log N) enabling O(log N) tree path queries and LCA jumps",
    recommendedTimeMinutes: 35,
  },
  "modular-arithmetic": {
    slug: "modular-arithmetic",
    name: "Modular Arithmetic, Fermat's Inverse & Combinatorics",
    category: "Mathematics",
    primaryBookCitation: "CPH Ch 21 & CP4 Book 2 Sec 5.3",
    chapter: "Number Theory & Combinatorics in Competitive Programming",
    keyInvariant: "Division under prime modulo p is multiplication by modular inverse: a^(p-2) mod p via binary exponentiation",
    recommendedTimeMinutes: 30,
  },
  "string-hashing": {
    slug: "string-hashing",
    name: "Polynomial Rolling Hash & Rabin-Karp",
    category: "String Algorithms",
    primaryBookCitation: "USACO Guide Gold & CPH Ch 26",
    chapter: "String Hashing & Substring Equivalence",
    keyInvariant: "Prefix hash array + base powers compute any substring hash in O(1); double modulo eliminates collisions",
    recommendedTimeMinutes: 30,
  },
  "trie": {
    slug: "trie",
    name: "Trie & Binary 0/1 XOR Trie",
    category: "Data Structures",
    primaryBookCitation: "CP4 Book 1 Sec 2.3 & CPH Ch 26",
    chapter: "Prefix Trees & Maximum XOR Subarray Optimization",
    keyInvariant: "Greedy bitwise descent at each bit level maximizes/minimizes XOR queries in O(bits) time",
    recommendedTimeMinutes: 30,
  },
};

/**
 * Maps any Codeforces tag, problem tag, or weakness subject to the best-matching
 * internal textbook curriculum module.
 */
export function findCurriculumGuideForTopic(tagOrTopic: string): CurriculumGuideLink | null {
  if (!tagOrTopic) return null;
  const t = tagOrTopic.toLowerCase().trim();

  // Trie & Binary XOR Trie
  if (t.includes("trie") || (t.includes("xor") && (t.includes("max") || t.includes("query") || t.includes("tree")))) {
    return CURRICULUM_GUIDE_MAP["trie"];
  }

  // String Hashing
  if (t.includes("hash") || t.includes("string") || t.includes("rabin") || t.includes("karp")) {
    return CURRICULUM_GUIDE_MAP["string-hashing"];
  }

  // LCA & Binary Lifting
  if (t.includes("lca") || t.includes("ancestor") || t.includes("binary lifting")) {
    return CURRICULUM_GUIDE_MAP["binary-lifting-lca"];
  }

  // Tree DP & Rerooting
  if (t.includes("tree dp") || t.includes("reroot") || (t.includes("tree") && t.includes("dp"))) {
    return CURRICULUM_GUIDE_MAP["tree-dp"];
  }

  // Modular arithmetic & Combinatorics
  if (t.includes("modular") || t.includes("modulo") || t.includes("combinatorics") || t.includes("number theory") || t.includes("ncr") || t.includes("inverse") || t.includes("math")) {
    return CURRICULUM_GUIDE_MAP["modular-arithmetic"];
  }

  // Lazy propagation check first
  if (t.includes("lazy") || (t.includes("range") && t.includes("update"))) {
    return CURRICULUM_GUIDE_MAP["lazy-propagation"];
  }

  // Segment tree / Advanced trees
  if (t.includes("segment tree") || t.includes("segtree") || t.includes("fenwick") || t.includes("bit")) {
    return CURRICULUM_GUIDE_MAP["segment-tree"];
  }

  // Bitmask DP
  if (t.includes("bitmask") || t.includes("bitmasks") || (t.includes("dp") && t.includes("mask"))) {
    return CURRICULUM_GUIDE_MAP["bitmask-dp"];
  }

  // Knapsack
  if (t.includes("knapsack")) {
    return CURRICULUM_GUIDE_MAP["knapsack"];
  }

  // General DP
  if (t.includes("dp") || t.includes("dynamic programming")) {
    return CURRICULUM_GUIDE_MAP["1d-dp"];
  }

  // Two pointers / Sliding window
  if (t.includes("two pointers") || t.includes("two pointer") || t.includes("sliding window")) {
    return CURRICULUM_GUIDE_MAP["two-pointers"];
  }

  // Binary search
  if (t.includes("binary search") || t.includes("bsearch") || t.includes("ternary search")) {
    return CURRICULUM_GUIDE_MAP["binary-search-answer"];
  }

  // DSU
  if (t.includes("dsu") || t.includes("disjoint set") || t.includes("union find")) {
    return CURRICULUM_GUIDE_MAP["dsu"];
  }

  // Dijkstra / Shortest paths
  if (t.includes("shortest paths") || t.includes("dijkstra") || t.includes("bellman") || t.includes("floyd")) {
    return CURRICULUM_GUIDE_MAP["dijkstra"];
  }

  // MST / Kruskal
  if (t.includes("mst") || t.includes("spanning tree") || t.includes("kruskal") || t.includes("prim")) {
    return CURRICULUM_GUIDE_MAP["mst-kruskal"];
  }

  // Graphs / DFS / BFS / Trees
  if (t.includes("graph") || t.includes("dfs") || t.includes("bfs") || t.includes("tree")) {
    return CURRICULUM_GUIDE_MAP["bfs-dfs"];
  }

  // Prefix sums / static queries
  if (t.includes("prefix") || t.includes("data structures")) {
    return CURRICULUM_GUIDE_MAP["prefix-sums"];
  }

  // Greedy / Math fallback
  if (t.includes("greedy") || t.includes("constructive")) {
    return CURRICULUM_GUIDE_MAP["two-pointers"];
  }

  return CURRICULUM_GUIDE_MAP["prefix-sums"];
}

/**
 * Inspects a problem's tags array and returns the most relevant textbook curriculum guide.
 */
export function findCurriculumGuideForProblem(tags: string[] = []): CurriculumGuideLink | null {
  for (const tag of tags) {
    const guide = findCurriculumGuideForTopic(tag);
    if (guide) return guide;
  }
  return CURRICULUM_GUIDE_MAP["prefix-sums"];
}
