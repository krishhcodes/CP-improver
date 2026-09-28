import { describe, it, expect } from "vitest";
import { ConceptGraph, ConceptNode } from "@/server/knowledge/concept-graph";
import { CORE_CONCEPTS } from "@/server/knowledge/concepts-data";

describe("Concept Graph & Prerequisite DAG Engine", () => {
  it("builds the core concept graph without cycles", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);
    expect(graph.getAllNodes()).toHaveLength(CORE_CONCEPTS.length);
    expect(graph.hasCycle()).toBe(false);
  });

  it("detects cycles accurately when a cycle is introduced", () => {
    const cycleNodes: ConceptNode[] = [
      {
        slug: "node-a",
        name: "Node A",
        category: "Test",
        difficulty: "BEGINNER",
        description: "",
        timeComplexity: "",
        spaceComplexity: "",
        prerequisites: ["node-c"],
        dependents: ["node-b"],
      },
      {
        slug: "node-b",
        name: "Node B",
        category: "Test",
        difficulty: "BEGINNER",
        description: "",
        timeComplexity: "",
        spaceComplexity: "",
        prerequisites: ["node-a"],
        dependents: ["node-c"],
      },
      {
        slug: "node-c",
        name: "Node C",
        category: "Test",
        difficulty: "BEGINNER",
        description: "",
        timeComplexity: "",
        spaceComplexity: "",
        prerequisites: ["node-b"],
        dependents: ["node-a"],
      },
    ];

    const graph = new ConceptGraph(cycleNodes);
    expect(graph.hasCycle()).toBe(true);
    expect(() => graph.getTopologicalSort()).toThrow("Graph contains a cycle");
  });

  it("computes a valid topological sort where prerequisites strictly precede dependents", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);
    const sorted = graph.getTopologicalSort();

    expect(sorted).toHaveLength(CORE_CONCEPTS.length);

    // Map each slug to its index in sorted order
    const indexMap = new Map<string, number>();
    sorted.forEach((slug, idx) => indexMap.set(slug, idx));

    // Verify all nodes: prerequisite index < dependent index
    for (const node of CORE_CONCEPTS) {
      const nodeIdx = indexMap.get(node.slug)!;
      for (const p of node.prerequisites) {
        const pIdx = indexMap.get(p)!;
        expect(pIdx).toBeLessThan(nodeIdx);
      }
    }
  });

  it("correctly evaluates MASTERED, UNLOCKED, and LOCKED states", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);

    // Suppose user has mastered only prefix-sums
    const mastered = new Set<string>(["prefix-sums"]);
    const statusMap = graph.getLearningStatus(mastered);

    // prefix-sums is mastered
    expect(statusMap.get("prefix-sums")).toBe("MASTERED");

    // two-pointers prerequisite is prefix-sums -> should be UNLOCKED
    expect(statusMap.get("two-pointers")).toBe("UNLOCKED");

    // binary-search-answer prerequisite is two-pointers (unmastered) -> should be LOCKED
    expect(statusMap.get("binary-search-answer")).toBe("LOCKED");

    // lazy-propagation -> should be LOCKED
    expect(statusMap.get("lazy-propagation")).toBe("LOCKED");

    // 1d-dp has no prerequisites -> should be UNLOCKED
    expect(statusMap.get("1d-dp")).toBe("UNLOCKED");

    // bfs-dfs has no prerequisites -> should be UNLOCKED
    expect(statusMap.get("bfs-dfs")).toBe("UNLOCKED");
  });

  it("resolves all transitive ancestors (prerequisites) of advanced nodes", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);
    const ancestors = graph.getAllAncestors("lazy-propagation");

    expect(ancestors).toContain("segment-tree");
    expect(ancestors).toContain("binary-search-answer");
    expect(ancestors).toContain("two-pointers");
    expect(ancestors).toContain("prefix-sums");
    expect(ancestors).not.toContain("bfs-dfs");
  });

  it("resolves all transitive descendants (unlocks) from base nodes", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);
    const descendants = graph.getAllDescendants("bfs-dfs");

    expect(descendants).toContain("dsu");
    expect(descendants).toContain("mst-kruskal");
    expect(descendants).toContain("dijkstra");
  });

  it("computes the shortest prerequisite path between two concepts", () => {
    const graph = new ConceptGraph(CORE_CONCEPTS);
    const path = graph.getShortestPath("prefix-sums", "lazy-propagation");

    expect(path).toEqual([
      "prefix-sums",
      "two-pointers",
      "binary-search-answer",
      "segment-tree",
      "lazy-propagation",
    ]);

    // Path between disconnected components
    const disconnectedPath = graph.getShortestPath("prefix-sums", "dijkstra");
    expect(disconnectedPath).toBeNull();
  });
});
