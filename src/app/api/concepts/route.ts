import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/server/auth/session";
import { ConceptGraph } from "@/server/knowledge/concept-graph";
import { CORE_CONCEPTS } from "@/server/knowledge/concepts-data";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);

    // Default mastered concepts for demo mode
    const masteredSlugs = new Set<string>([
      "prefix-sums",
      "two-pointers",
      "1d-dp",
      "bfs-dfs",
      "dsu",
      "dijkstra",
    ]);

    if (session?.userId) {
      try {
        const userSkills = await prisma.userConceptSkill.findMany({
          where: { userId: session.userId, skillScore: { gte: 70 } },
          include: { concept: true },
        });
        for (const s of userSkills) {
          masteredSlugs.add(s.concept.slug);
        }
      } catch (dbErr: any) {
        console.warn("DB concept skills lookup skipped:", dbErr?.message);
      }
    }

    const graph = new ConceptGraph(CORE_CONCEPTS);
    const topologicalOrder = graph.getTopologicalSort();
    const statusMap = graph.getLearningStatus(masteredSlugs);

    const enrichedNodes = CORE_CONCEPTS.map((c) => ({
      ...c,
      status: statusMap.get(c.slug) ?? "LOCKED",
    }));

    // Group by category
    const categoriesMap = new Map<string, typeof enrichedNodes>();
    for (const node of enrichedNodes) {
      const list = categoriesMap.get(node.category) ?? [];
      list.push(node);
      categoriesMap.set(node.category, list);
    }

    const categories = Array.from(categoriesMap.entries()).map(([name, concepts]) => ({
      name,
      concepts,
    }));

    let masteredCount = 0;
    let unlockedCount = 0;
    let lockedCount = 0;

    for (const s of statusMap.values()) {
      if (s === "MASTERED") masteredCount++;
      else if (s === "UNLOCKED") unlockedCount++;
      else if (s === "LOCKED") lockedCount++;
    }

    return NextResponse.json({
      success: true,
      totalConcepts: CORE_CONCEPTS.length,
      masteredCount,
      unlockedCount,
      lockedCount,
      topologicalOrder,
      categories,
      nodes: enrichedNodes,
    });
  } catch (error: any) {
    console.error("Error retrieving concept graph:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
