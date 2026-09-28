import { NextRequest, NextResponse } from "next/server";
import { CORE_CONCEPTS } from "@/server/knowledge/concepts-data";
import { ConceptGraph } from "@/server/knowledge/concept-graph";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const concept = CORE_CONCEPTS.find((c) => c.slug === slug);

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    const graph = new ConceptGraph(CORE_CONCEPTS);
    const ancestors = graph.getAllAncestors(slug);
    const descendants = graph.getAllDescendants(slug);

    const prereqNodes = concept.prerequisites.map((pSlug) => {
      const p = CORE_CONCEPTS.find((c) => c.slug === pSlug);
      return { slug: pSlug, name: p?.name ?? pSlug, difficulty: p?.difficulty };
    });

    const dependentNodes = concept.dependents.map((dSlug) => {
      const d = CORE_CONCEPTS.find((c) => c.slug === dSlug);
      return { slug: dSlug, name: d?.name ?? dSlug, difficulty: d?.difficulty };
    });

    return NextResponse.json({
      success: true,
      concept: {
        ...concept,
        prerequisiteDetails: prereqNodes,
        dependentDetails: dependentNodes,
        allTransitiveAncestors: ancestors,
        allTransitiveDescendants: descendants,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving concept detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
