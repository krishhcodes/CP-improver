export interface DiagnosticTopic {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  difficulty: "FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED";
  bookCitation: string;
}

export interface VerificationQuestion {
  id: string;
  topicId: string;
  topicName: string;
  conceptSlug: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bookCitation: string;
  keyInvariant: string;
}

export interface DiagnosticResult {
  tickedTopicIds: string[];
  answers: Record<string, number>; // questionId -> selectedIndex
  verifiedTopicIds: string[];
  blindspotTopicIds: string[];
  unlearnedTopicIds: string[];
  score: number; // 0 - 100
  recommendedStartingWeek: number; // 1 to 4
  milestoneTitle: string;
  milestoneDescription: string;
}

export const DIAGNOSTIC_TOPICS: DiagnosticTopic[] = [
  {
    id: "prefix-sums",
    slug: "prefix-sums",
    name: "Prefix Sums & Range Queries",
    category: "Data Structures",
    description: "Static 1D/2D range sum precomputations in O(1) query time.",
    difficulty: "FOUNDATIONAL",
    bookCitation: "USACO Guide Bronze & CPH Ch 9",
  },
  {
    id: "two-pointers",
    slug: "two-pointers",
    name: "Two Pointers & Sliding Window",
    category: "Algorithms",
    description: "Monotonic subarray intervals and pairs traversed in amortized O(N).",
    difficulty: "FOUNDATIONAL",
    bookCitation: "USACO Guide Silver & CPH Ch 8",
  },
  {
    id: "binary-search-answer",
    slug: "binary-search-answer",
    name: "Binary Search on Answer",
    category: "Algorithms",
    description: "Inverting constructive search to a monotonic verification predicate P(x).",
    difficulty: "FOUNDATIONAL",
    bookCitation: "USACO Guide Silver & Sannemo Ch 5",
  },
  {
    id: "1d-dp",
    slug: "1d-dp",
    name: "1D Dynamic Programming",
    category: "Dynamic Programming",
    description: "Optimal substructure and state formulation across topological subproblem DAGs.",
    difficulty: "INTERMEDIATE",
    bookCitation: "USACO Guide Silver & CPH Ch 7",
  },
  {
    id: "knapsack",
    slug: "knapsack",
    name: "Knapsack DP Variants",
    category: "Dynamic Programming",
    description: "0/1 Knapsack with reverse loop space compression and unbounded variations.",
    difficulty: "INTERMEDIATE",
    bookCitation: "CLRS Ch 16 & CP4 Book 1 Sec 3.5",
  },
  {
    id: "bfs-dfs",
    slug: "bfs-dfs",
    name: "Graph Traversals (BFS & DFS)",
    category: "Graphs",
    description: "Shortest paths on unweighted graphs, tree diameter, and connected components.",
    difficulty: "INTERMEDIATE",
    bookCitation: "USACO Guide Silver & CPH Ch 11-12",
  },
  {
    id: "dsu",
    slug: "dsu",
    name: "Disjoint Set Union (DSU / Union-Find)",
    category: "Data Structures",
    description: "Near-constant time O(α(N)) dynamic connectivity and cycle detection.",
    difficulty: "INTERMEDIATE",
    bookCitation: "CPH Ch 15 & CLRS Ch 21",
  },
  {
    id: "dijkstra",
    slug: "dijkstra",
    name: "Dijkstra's Shortest Path",
    category: "Graphs",
    description: "Greedy single-source shortest paths on weighted graphs with non-negative edges in O((V + E) log V).",
    difficulty: "ADVANCED",
    bookCitation: "CLRS Ch 24 & CPH Ch 13",
  },
  {
    id: "segment-tree",
    slug: "segment-tree",
    name: "Segment Trees & Range Queries",
    category: "Data Structures",
    description: "Dynamic point updates and range associative monoid queries in O(log N).",
    difficulty: "ADVANCED",
    bookCitation: "CP4 Book 1 Sec 2.4 & CLRS Ch 14",
  },
  {
    id: "bitmask-dp",
    slug: "bitmask-dp",
    name: "Bitmask DP & State Compression",
    category: "Dynamic Programming",
    description: "Subsets and permutations compressed into integer bitmasks for N <= 20.",
    difficulty: "ADVANCED",
    bookCitation: "CPH Ch 10 & Sannemo Ch 10",
  },
  {
    id: "tree-dp",
    slug: "tree-dp",
    name: "Tree Dynamic Programming & Rerooting",
    category: "Dynamic Programming",
    description: "Subtree aggregation and all-pairs tree metrics in linear O(N) time using two-pass DFS.",
    difficulty: "INTERMEDIATE",
    bookCitation: "USACO Guide Gold & CPH Ch 14",
  },
  {
    id: "binary-lifting-lca",
    slug: "binary-lifting-lca",
    name: "Binary Lifting & Lowest Common Ancestor (LCA)",
    category: "Tree Algorithms",
    description: "Sparse table on trees precomputing 2^k ancestors in O(N log N) for O(log N) tree path queries.",
    difficulty: "INTERMEDIATE",
    bookCitation: "USACO Guide Platinum & CPH Ch 18",
  },
  {
    id: "modular-arithmetic",
    slug: "modular-arithmetic",
    name: "Modular Arithmetic, Fermat's Inverse & Combinatorics",
    category: "Mathematics",
    description: "Binary exponentiation in O(log P), modular inverse via Fermat's Little Theorem, and O(1) combinations.",
    difficulty: "FOUNDATIONAL",
    bookCitation: "CPH Ch 21 & CP4 Book 2 Sec 5.3",
  },
  {
    id: "string-hashing",
    slug: "string-hashing",
    name: "Polynomial Rolling Hashing & Rabin-Karp",
    category: "String Algorithms",
    description: "Double modulo polynomial hashing for O(1) substring equivalence queries and LCP binary search.",
    difficulty: "INTERMEDIATE",
    bookCitation: "USACO Guide Gold & CPH Ch 26",
  },
  {
    id: "trie",
    slug: "trie",
    name: "Trie & Binary 0/1 XOR Trie",
    category: "Data Structures",
    description: "Prefix tree structure and greedy bitwise descent for Maximum XOR Subarray in O(30).",
    difficulty: "INTERMEDIATE",
    bookCitation: "CP4 Book 1 Sec 2.3 & CPH Ch 26",
  },
];

export const VERIFICATION_QUESTIONS: VerificationQuestion[] = [
  {
    id: "q-binary-search",
    topicId: "binary-search-answer",
    topicName: "Binary Search on Answer",
    conceptSlug: "binary-search-answer",
    question: "When inverting a problem using 'Binary Search on Answer', what mathematical property MUST the check predicate P(x) satisfy across the search range?",
    options: [
      "P(x) must be convex with a unique global minimum or maximum.",
      "P(x) must be monotonic (e.g. True...True followed by False...False, or vice versa).",
      "P(x) must execute in strictly O(1) constant time without loops.",
      "P(x) must evaluate to integer powers of 2 for all test inputs.",
    ],
    correctIndex: 1,
    explanation: "Binary search fundamentally relies on monotonicity: if P(mid) is true, the answer space to one side can be discarded safely, halving the domain in O(log(High - Low)).",
    bookCitation: "USACO Guide Silver & Sannemo Ch 5",
    keyInvariant: "Monotonicity Invariant: P(x) divides domain into contiguous True and False regions.",
  },
  {
    id: "q-knapsack",
    topicId: "knapsack",
    topicName: "Knapsack DP Variants",
    conceptSlug: "knapsack",
    question: "In the 0/1 Knapsack problem compressed into a 1D DP array of size W+1, why MUST the capacity loop iterate in reverse order from W down to w[i]?",
    options: [
      "To optimize CPU cache locality by reading consecutive memory addresses.",
      "To allow negative weight items to be computed without offset transformations.",
      "To ensure that each item i is used at most once, as dp[c - w[i]] reflects state from item i-1.",
      "Because C++ arrays cannot be indexed in ascending order during dynamic programming.",
    ],
    correctIndex: 2,
    explanation: "Iterating backwards ensures that when computing dp[c], the value dp[c - w[i]] has not yet been updated for the current item i, preventing multiple inclusions of the same item.",
    bookCitation: "CLRS Ch 16 & CP4 Book 1 Sec 3.5",
    keyInvariant: "Space compression invariant: reverse loop preserves subproblem independence.",
  },
  {
    id: "q-two-pointers",
    topicId: "two-pointers",
    topicName: "Two Pointers Technique",
    conceptSlug: "two-pointers",
    question: "Why does the Two Pointers / Sliding Window technique guarantee an amortized O(N) runtime even though it contains an inner while-loop?",
    options: [
      "Because the compiler automatically vectorizes the pointers with AVX-512 instructions.",
      "Because both the left and right pointers only move forward and advance at most N times each across the entire execution.",
      "Because the array is required to have unique elements without any duplicates.",
      "Because the inner loop only executes when N is a prime number.",
    ],
    correctIndex: 1,
    explanation: "Even if the inner while-loop runs multiple times on a single iteration, the left pointer l can advance at most N times total. Thus, the total operations for both pointers is at most 2N = O(N).",
    bookCitation: "USACO Guide Silver & CPH Ch 8",
    keyInvariant: "Unidirectional pointer advancement: sum of all pointer increments <= 2N.",
  },
  {
    id: "q-dsu",
    topicId: "dsu",
    topicName: "Disjoint Set Union (DSU)",
    conceptSlug: "dsu",
    question: "What is the amortized time complexity per find/union operation in a Disjoint Set Union (DSU) utilizing BOTH Path Compression and Union by Rank/Size?",
    options: [
      "Strictly O(1) worst-case time for every single call.",
      "O(log N) time per operation due to balanced binary tree traversal.",
      "O(α(N)) amortized time, where α is the inverse Ackermann function (<= 4 for all practical inputs).",
      "O(sqrt(N)) time using square root decomposition blocks.",
    ],
    correctIndex: 2,
    explanation: "Combining path compression with union by rank flattens trees so aggressively that each operation takes O(α(N)) time, which is effectively constant for any value of N <= 10^600.",
    bookCitation: "CPH Ch 15 & CLRS Ch 21",
    keyInvariant: "Tarjan's bound: α(N) grows slower than any logarithmic or polynomial function.",
  },
  {
    id: "q-bfs-dfs",
    topicId: "bfs-dfs",
    topicName: "Graph Traversals (BFS & DFS)",
    conceptSlug: "bfs-dfs",
    question: "Under which condition is Breadth-First Search (BFS) guaranteed to find the true shortest path from a start vertex S to all other vertices?",
    options: [
      "All edge weights must be strictly non-zero and distinct.",
      "The graph must be a Directed Acyclic Graph (DAG) with no cycles.",
      "All edges must have uniform (equal) weight, or the graph is unweighted.",
      "The graph must have fewer than 100 vertices.",
    ],
    correctIndex: 2,
    explanation: "BFS explores vertices in non-decreasing order of hop distance from the source. This corresponds to true shortest path distance if and only if all edges have identical weight (e.g. weight 1).",
    bookCitation: "USACO Guide Silver & CPH Ch 11",
    keyInvariant: "FIFO queue invariant: elements in queue have distances that differ by at most 1.",
  },
  {
    id: "q-dijkstra",
    topicId: "dijkstra",
    topicName: "Dijkstra's Shortest Path",
    conceptSlug: "dijkstra",
    question: "Why does standard Dijkstra's algorithm produce incorrect results or infinite loops on graphs containing negative edge weights?",
    options: [
      "The priority queue will throw a negative index out-of-bounds runtime exception.",
      "Dijkstra's greedy property assumes finalized distances cannot decrease; a negative edge can retroactively create a shorter path to an already-settled node.",
      "Dijkstra's algorithm cannot represent directed edges.",
      "Signed integers in C++ cannot store negative distances.",
    ],
    correctIndex: 1,
    explanation: "Once Dijkstra extracts a node u from the priority queue, it marks dist[u] as finalized based on the assumption that adding non-negative edges can only increase path weight. Negative edges violate this invariant.",
    bookCitation: "CLRS Ch 24 & CPH Ch 13",
    keyInvariant: "Greedy choice invariant: minimal tentative distance is final under non-negative weights.",
  },
  {
    id: "q-segment-tree",
    topicId: "segment-tree",
    topicName: "Segment Trees & Range Queries",
    conceptSlug: "segment-tree",
    question: "What mathematical property must an operation ⊗ satisfy so that a standard Segment Tree can compute range queries rangeQuery(L, R) efficiently in O(log N)?",
    options: [
      "The operation must be commutative: A ⊗ B = B ⊗ A.",
      "The operation must be associative: (A ⊗ B) ⊗ C = A ⊗ (B ⊗ C).",
      "The operation must have an inverse element (like subtraction for addition).",
      "The operation must be idempotent: A ⊗ A = A.",
    ],
    correctIndex: 1,
    explanation: "A segment tree decomposes any arbitrary range [L, R] into O(log N) disjoint canonical tree segments. Combining them in left-to-right tree order requires only associativity (forming a monoid). Commutativity and invertibility are not required.",
    bookCitation: "CP4 Book 1 Sec 2.4 & CLRS Ch 14",
    keyInvariant: "Monoid property: Associative split and merge across canonical tree nodes.",
  },
  {
    id: "q-bitmask-dp",
    topicId: "bitmask-dp",
    topicName: "Bitmask DP & State Compression",
    conceptSlug: "bitmask-dp",
    question: "In competitive programming, what constraint on N is the immediate signature trigger indicating that a Bitmask DP solution (e.g. O(2^N * N)) is expected?",
    options: [
      "N is between 10^5 and 2 * 10^5.",
      "N is between 1,000 and 2,000.",
      "N is very small, typically N <= 20 or N <= 22.",
      "N is an exact multiple of 64.",
    ],
    correctIndex: 2,
    explanation: "Because 2^20 is approximately 1.05 * 10^6 (which easily fits within the 10^8 operations per second limit), problems with N <= 20 almost universally test subset/permutation state compression via bitmasks.",
    bookCitation: "CPH Ch 10 & Sannemo Ch 10",
    keyInvariant: "Constraint recognition: 2^20 ~ 1e6; 2^30 ~ 1e9 (TLE).",
  },
  {
    id: "q-tree-dp",
    topicId: "tree-dp",
    topicName: "Tree DP & Rerooting",
    conceptSlug: "tree-dp",
    question: "In the Tree Rerooting DP technique, when shifting the root from parent u to child v in an unweighted tree of N nodes, how does the sum of distances to all other nodes change?",
    options: [
      "It increases uniformly by 1 for all vertices in the tree.",
      "It updates in O(1) via ans[v] = ans[u] + N - 2 * sz[v], as nodes in v's subtree get 1 step closer while all other (N - sz[v]) nodes get 1 step farther.",
      "It requires re-running a full O(N) BFS from scratch for child v.",
      "The sum of distances is invariant regardless of which node is root.",
    ],
    correctIndex: 1,
    explanation: "When moving the root from u to v, all sz[v] nodes in v's subtree decrease distance by 1, while the remaining (N - sz[v]) nodes outside v increase distance by 1, yielding ans[v] = ans[u] - sz[v] + (N - sz[v]).",
    bookCitation: "USACO Guide Gold & CPH Ch 14",
    keyInvariant: "Rerooting delta invariant: ans[v] = ans[u] + N - 2 * sz[v].",
  },
  {
    id: "q-binary-lifting",
    topicId: "binary-lifting-lca",
    topicName: "Binary Lifting & LCA",
    conceptSlug: "binary-lifting-lca",
    question: "Why does Binary Lifting for LCA precompute ancestors at powers of two (2^0, 2^1, 2^2, ...), and what is the resulting query complexity?",
    options: [
      "Powers of two allow any arbitrary jump distance k to be expressed uniquely as a sum of binary powers, enabling O(log N) tree path queries.",
      "Powers of two are mandatory because balanced trees cannot have depths exceeding 16.",
      "To enable bitwise AND operations between adjacent vertex indices.",
      "Because C++ arrays only support indices that are powers of two.",
    ],
    correctIndex: 0,
    explanation: "Any positive integer k has a unique binary representation. By precomputing up[u][i] = 2^i-th ancestor, any distance jump decomposes into at most log2(N) steps in O(log N) time.",
    bookCitation: "USACO Guide Platinum & CPH Ch 18",
    keyInvariant: "Binary decomposition invariant: jump k decomposed into sum of 2^i bits.",
  },
  {
    id: "q-modular-arithmetic",
    topicId: "modular-arithmetic",
    topicName: "Modular Arithmetic & Fermat's Inverse",
    conceptSlug: "modular-arithmetic",
    question: "Under a prime modulo P (e.g. 10^9 + 7), why can modular division a / b (mod P) be computed as a * b^(P-2) (mod P)?",
    options: [
      "Fermat's Little Theorem states that if P is prime and gcd(b, P) = 1, then b^(P-1) ≡ 1 (mod P), so b * b^(P-2) ≡ 1 (mod P), making b^(P-2) the multiplicative inverse.",
      "Because all prime numbers above 2 are odd, making division equivalent to multiplying by P-2.",
      "Because floating point division in C++ produces accurate IEEE 754 rounded results under modulo.",
      "Due to Wilson's theorem on factorial residues.",
    ],
    correctIndex: 0,
    explanation: "Fermat's Little Theorem proves b^(P-1) ≡ 1 (mod P) for prime P and b not divisible by P. Multiplying both sides by b^(-1) gives b^(-1) ≡ b^(P-2) (mod P), computable in O(log P) via binary exponentiation.",
    bookCitation: "CPH Ch 21 & CP4 Book 2 Sec 5.3",
    keyInvariant: "Fermat's inverse invariant: inv(b) ≡ b^(P-2) (mod P) via binary exponentiation.",
  },
  {
    id: "q-string-hashing",
    topicId: "string-hashing",
    topicName: "Polynomial Rolling Hashing",
    conceptSlug: "string-hashing",
    question: "Why is double hashing using two distinct large prime moduli (e.g., 10^9+7 and 10^9+9) strongly recommended over a single 64-bit integer overflow modulo (2^64) in competitive programming contests?",
    options: [
      "Because modulo 2^64 can be systematically broken by adversarial Thue-Morse anti-hash test cases, whereas double prime modulo reduces collision probability to ~ 10^(-18).",
      "Because 2^64 is an even number, causing syntax errors in C++20 standard libraries.",
      "Because double hashing computes substring queries in O(1/2) time instead of O(1).",
      "Because 10^9+7 and 10^9+9 automatically compile into SIMD AVX-512 vector instructions.",
    ],
    correctIndex: 0,
    explanation: "Modulo 2^64 (unsigned long long overflow) can be hacked deterministically using known test case generators. Double prime hashing with two large independent primes (or randomized bases) virtually eliminates collision risk to 1 / (M1 * M2) ≈ 10^(-18).",
    bookCitation: "USACO Guide Gold & CPH Ch 26",
    keyInvariant: "Anti-collision invariant: Joint hash space (M1 * M2) gives birthday paradox threshold > 10^9 strings.",
  },
  {
    id: "q-trie",
    topicId: "trie",
    topicName: "Trie & Binary XOR Trie",
    conceptSlug: "trie",
    question: "In a Binary 0/1 XOR Trie with numbers up to 10^9, how do you query the maximum XOR with a given integer X in O(30) time?",
    options: [
      "Sort all elements in the trie and binary search for the element closest to X.",
      "At each bit position from most significant (bit 29) down to 0, greedily move along the branch matching the OPPOSITE bit (1 - bit(X)) if it exists, otherwise follow the matching bit.",
      "Sum all branch weights and divide by the number of leaf nodes.",
      "Compute bitwise NOT of X and perform a depth-first search collecting all path values.",
    ],
    correctIndex: 1,
    explanation: "To maximize XOR, higher bits take absolute priority (2^b > sum_{i=0}^{b-1} 2^i). Greedily picking the opposite bit at the highest available position guarantees the optimal maximum XOR result.",
    bookCitation: "CP4 Book 1 Sec 2.3 & CPH Ch 26",
    keyInvariant: "Greedy bitwise priority invariant: 2^b > sum_{i < b} 2^i dictates greedy descent.",
  },
];

/**
 * Evaluates the diagnostic self-audit & theoretical verification test,
 * generating a personalized starting milestone and tailored multi-week plan.
 */
export function evaluateDiagnosticAssessment(params: {
  tickedTopicIds: string[];
  answers: Record<string, number>; // questionId -> selectedIndex
  userRating: number;
}): DiagnosticResult {
  const { tickedTopicIds, answers, userRating } = params;

  const verifiedTopicIds: string[] = [];
  const blindspotTopicIds: string[] = [];
  const unlearnedTopicIds: string[] = [];

  let correctCount = 0;
  let answeredCount = 0;

  for (const q of VERIFICATION_QUESTIONS) {
    const selected = answers[q.id];
    if (selected !== undefined) {
      answeredCount++;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) {
        correctCount++;
        if (!verifiedTopicIds.includes(q.topicId)) {
          verifiedTopicIds.push(q.topicId);
        }
      } else {
        if (!blindspotTopicIds.includes(q.topicId)) {
          blindspotTopicIds.push(q.topicId);
        }
      }
    }
  }

  // Categorize topics not covered by questions
  for (const t of DIAGNOSTIC_TOPICS) {
    const isTicked = tickedTopicIds.includes(t.id);
    const isVerified = verifiedTopicIds.includes(t.id);
    const isBlindspot = blindspotTopicIds.includes(t.id);

    if (!isVerified && !isBlindspot) {
      if (isTicked) {
        // Ticked but unverified
        verifiedTopicIds.push(t.id);
      } else {
        unlearnedTopicIds.push(t.id);
      }
    }
  }

  const score = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 50;

  // Calibrate starting week based on rating & diagnostic score
  let recommendedStartingWeek = 1;
  let milestoneTitle = "Phase 1: Foundational Invariants";
  let milestoneDescription = "Mastering range queries, monotonic sliding windows, and binary search predicates.";

  if (userRating < 1200) {
    recommendedStartingWeek = 1;
    milestoneTitle = "Road to Specialist (1400): Core Fundamentals";
    milestoneDescription = "Cementing Prefix Sums, Two Pointers, and Monotonic Binary Search without off-by-one errors.";
  } else if (userRating < 1500) {
    if (score >= 75 && verifiedTopicIds.includes("prefix-sums") && verifiedTopicIds.includes("two-pointers")) {
      recommendedStartingWeek = 2;
      milestoneTitle = "Road to Expert (1600): Graph Traversals & DP";
      milestoneDescription = "Elevating to BFS/DFS tree invariants and 1D DP DAG state reductions.";
    } else {
      recommendedStartingWeek = 1;
      milestoneTitle = "Foundations Reinforcement: Eliminating Contest WA";
      milestoneDescription = "Patching theoretical blindspots in boundary invariants before pushing into harder tiers.";
    }
  } else {
    // 1500+
    if (score >= 70) {
      recommendedStartingWeek = 3;
      milestoneTitle = "Road to Candidate Master (1900): Advanced Algorithms";
      milestoneDescription = "Focusing on Knapsack variants, DSU cycle invariants, and Segment Tree range queries.";
    } else {
      recommendedStartingWeek = 2;
      milestoneTitle = "Algorithmic Precision Drill";
      milestoneDescription = "Consolidating graph traversals and DP state formulation speed.";
    }
  }

  return {
    tickedTopicIds,
    answers,
    verifiedTopicIds,
    blindspotTopicIds,
    unlearnedTopicIds,
    score,
    recommendedStartingWeek,
    milestoneTitle,
    milestoneDescription,
  };
}
