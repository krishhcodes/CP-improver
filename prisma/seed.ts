import { PrismaClient, DifficultyLevel, SubmissionVerdict } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Competitive Programming Database Seeding...");

  // 1. Seed Core CP Concepts
  const concepts = [
    {
      slug: "prefix-sums",
      name: "Prefix Sum & Difference Arrays",
      description: "Precomputation technique enabling O(1) range sum queries and O(1) offline range updates.",
      difficulty: "BEGINNER" as DifficultyLevel,
      category: "Data Structures & Math",
      timeComplexity: "O(N) build, O(1) query",
      spaceComplexity: "O(N)",
    },
    {
      slug: "two-pointers",
      name: "Two Pointers Technique",
      description: "Linear scanning technique using monotonic left and right indices on sorted arrays or windows.",
      difficulty: "BEGINNER" as DifficultyLevel,
      category: "Algorithms",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
    {
      slug: "binary-search-answer",
      name: "Binary Search on Answer",
      description: "Optimizing monotonic decision problems by evaluating canSatisfy(mid) in O(log(MAX_ANS)).",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Searching & Optimization",
      timeComplexity: "O(check(X) * log(Range))",
      spaceComplexity: "O(1)",
    },
    {
      slug: "1d-dp",
      name: "1D Dynamic Programming & State Transitions",
      description: "Foundational DP breaking problems into subproblems with optimal substructure and overlapping states.",
      difficulty: "BEGINNER" as DifficultyLevel,
      category: "Dynamic Programming",
      timeComplexity: "O(N * transitions)",
      spaceComplexity: "O(N)",
    },
    {
      slug: "knapsack",
      name: "Knapsack (0/1 & Unbounded)",
      description: "Standard optimization DP selecting subsets under capacity constraints with value maximization.",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Dynamic Programming",
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W)",
    },
    {
      slug: "bitmask-dp",
      name: "Bitmask Dynamic Programming",
      description: "Exponential DP using binary integers to represent small subset states (N <= 20).",
      difficulty: "ADVANCED" as DifficultyLevel,
      category: "Dynamic Programming",
      timeComplexity: "O(N^2 * 2^N)",
      spaceComplexity: "O(2^N)",
    },
    {
      slug: "bfs-dfs",
      name: "BFS & DFS Graph Traversals",
      description: "Fundamental graph and tree search patterns for reachability, cycle detection, and shortest paths in unweighted graphs.",
      difficulty: "BEGINNER" as DifficultyLevel,
      category: "Graph Theory",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V)",
    },
    {
      slug: "dsu",
      name: "Disjoint Set Union (DSU / Union-Find)",
      description: "Near O(1) set operations with path compression and rank heuristic for connected components.",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Data Structures & Graphs",
      timeComplexity: "O(α(N)) amortized",
      spaceComplexity: "O(N)",
    },
    {
      slug: "dijkstra",
      name: "Dijkstra's Shortest Path Algorithm",
      description: "Greedy priority-queue traversal computing single-source shortest paths in non-negative weighted graphs.",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Graph Theory",
      timeComplexity: "O((V + E) log V)",
      spaceComplexity: "O(V + E)",
    },
    {
      slug: "mst-kruskal",
      name: "Minimum Spanning Tree (Kruskal's Algorithm)",
      description: "Greedy edge sorting paired with DSU cycle detection to build spanning trees of minimum total weight.",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Graph Theory",
      timeComplexity: "O(E log E)",
      spaceComplexity: "O(V + E)",
    },
    {
      slug: "segment-tree",
      name: "Segment Tree (Point Update & Range Query)",
      description: "Binary tree maintaining associative operations (sum, min, max, gcd) over dynamic intervals.",
      difficulty: "INTERMEDIATE" as DifficultyLevel,
      category: "Advanced Data Structures",
      timeComplexity: "O(N) build, O(log N) query & update",
      spaceComplexity: "O(4N)",
    },
    {
      slug: "lazy-propagation",
      name: "Segment Tree with Lazy Propagation",
      description: "Deferred interval updates enabling O(log N) range updates combined with range queries.",
      difficulty: "ADVANCED" as DifficultyLevel,
      category: "Advanced Data Structures",
      timeComplexity: "O(log N) range update & query",
      spaceComplexity: "O(4N)",
    },
  ];

  for (const c of concepts) {
    await prisma.concept.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${concepts.length} core concepts.`);

  // 2. Seed Concept Dependency DAG
  const dependencies = [
    { prereq: "prefix-sums", dep: "two-pointers" },
    { prereq: "two-pointers", dep: "binary-search-answer" },
    { prereq: "binary-search-answer", dep: "segment-tree" },
    { prereq: "segment-tree", dep: "lazy-propagation" },
    { prereq: "bfs-dfs", dep: "dsu" },
    { prereq: "dsu", dep: "mst-kruskal" },
    { prereq: "bfs-dfs", dep: "dijkstra" },
    { prereq: "1d-dp", dep: "knapsack" },
    { prereq: "knapsack", dep: "bitmask-dp" },
  ];

  for (const d of dependencies) {
    const p = await prisma.concept.findUnique({ where: { slug: d.prereq } });
    const c = await prisma.concept.findUnique({ where: { slug: d.dep } });
    if (p && c) {
      await prisma.conceptDependency.upsert({
        where: {
          prerequisiteConceptId_dependentConceptId: {
            prerequisiteConceptId: p.id,
            dependentConceptId: c.id,
          },
        },
        update: {},
        create: {
          prerequisiteConceptId: p.id,
          dependentConceptId: c.id,
        },
      });
    }
  }
  console.log(`✅ Seeded ${dependencies.length} concept DAG prerequisite edges.`);

  // 3. Seed Default User & Codeforces Profile
  const demoUser = await prisma.user.upsert({
    where: { username: "demo_user" },
    update: { email: "demo@cp-intelligence.dev" },
    create: {
      username: "demo_user",
      email: "demo@cp-intelligence.dev",
      role: "USER",
    },
  });

  const cfProfile = await prisma.codeforcesProfile.upsert({
    where: { userId: demoUser.id },
    update: {
      handle: "Alex_Algo",
      rating: 1748,
      maxRating: 1824,
      rank: "Expert",
      maxRank: "Expert",
      contribution: 14,
      syncStatus: "COMPLETED",
      lastSyncedAt: new Date(),
    },
    create: {
      userId: demoUser.id,
      handle: "Alex_Algo",
      rating: 1748,
      maxRating: 1824,
      rank: "Expert",
      maxRank: "Expert",
      contribution: 14,
      syncStatus: "COMPLETED",
      lastSyncedAt: new Date(),
    },
  });
  console.log(`✅ Seeded demo user (${demoUser.username}) with CF handle (${cfProfile.handle}).`);

  // 4. Seed Contests & Sample Problems
  const contest169 = await prisma.contest.upsert({
    where: { codeforcesContestId: 970 },
    update: {},
    create: {
      codeforcesContestId: 970,
      name: "Educational Codeforces Round 169 (Rated for Div. 2)",
      phase: "FINISHED",
      startTimeSeconds: 1763000000,
      durationSeconds: 7200,
      ratingChangesAvailable: true,
    },
  });

  const problemsData = [
    {
      index: "A",
      name: "Closest Point",
      rating: 800,
      tags: ["implementation"],
      url: "https://codeforces.com/contest/970/problem/A",
    },
    {
      index: "B",
      name: "Game with Doors",
      rating: 1100,
      tags: ["implementation", "math"],
      url: "https://codeforces.com/contest/970/problem/B",
    },
    {
      index: "C",
      name: "Splitting Items",
      rating: 1300,
      tags: ["greedy", "sortings"],
      url: "https://codeforces.com/contest/970/problem/C",
    },
    {
      index: "D",
      name: "Colored Portals",
      rating: 1600,
      tags: ["binary search", "data structures", "graphs"],
      url: "https://codeforces.com/contest/970/problem/D",
    },
    {
      index: "E",
      name: "Not a Nim Problem",
      rating: 1800,
      tags: ["games", "math", "number theory"],
      url: "https://codeforces.com/contest/970/problem/E",
    },
  ];

  for (const prob of problemsData) {
    const createdProb = await prisma.problem.upsert({
      where: {
        codeforcesContestId_index: {
          codeforcesContestId: contest169.codeforcesContestId,
          index: prob.index,
        },
      },
      update: {
        name: prob.name,
        rating: prob.rating,
        url: prob.url,
      },
      create: {
        codeforcesContestId: contest169.codeforcesContestId,
        index: prob.index,
        name: prob.name,
        rating: prob.rating,
        url: prob.url,
      },
    });

    for (const tag of prob.tags) {
      await prisma.problemTag.upsert({
        where: {
          problemId_tag: {
            problemId: createdProb.id,
            tag,
          },
        },
        update: {},
        create: {
          problemId: createdProb.id,
          tag,
        },
      });
    }
  }
  console.log(`✅ Seeded contest 970 and ${problemsData.length} problems with tags.`);

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
