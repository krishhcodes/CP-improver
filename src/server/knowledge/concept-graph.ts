export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type NodeLearningStatus = "MASTERED" | "UNLOCKED" | "LOCKED";

export interface ConceptPracticeProblem {
  name: string;
  rating: number;
  url: string;
  platform?: string;
  hint?: string;
}

export interface LiteratureReference {
  source: string;
  section: string;
  url?: string;
  keyInsight: string;
}

export interface ConceptVariation {
  title: string;
  explanation: string;
  formula?: string;
  codeSnippet?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface RecognitionSignal {
  triggerConstraint: string;
  cue: string;
}

export interface ConceptNode {
  slug: string;
  name: string;
  category: string;
  difficulty: DifficultyLevel;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  prerequisites: string[]; // slugs
  dependents: string[]; // slugs
  codeTemplate?: string;
  pitfalls?: string[];
  practiceProblems?: ConceptPracticeProblem[];
  literatureReferences?: LiteratureReference[];
  conceptualTheory?: string;
  variations?: ConceptVariation[];
  recognitionSignals?: RecognitionSignal[];
  stepByStepStrategy?: string[];
}

export class ConceptGraph {
  private nodes: Map<string, ConceptNode> = new Map();

  constructor(initialNodes: ConceptNode[] = []) {
    for (const node of initialNodes) {
      this.addConcept(node);
    }
    // Bidirectional reconciliation: ensure if A in B.prerequisites, then B in A.dependents and vice-versa
    for (const node of this.nodes.values()) {
      for (const p of node.prerequisites) {
        const parent = this.nodes.get(p);
        if (parent && !parent.dependents.includes(node.slug)) {
          parent.dependents.push(node.slug);
        }
      }
      for (const d of node.dependents) {
        const child = this.nodes.get(d);
        if (child && !child.prerequisites.includes(node.slug)) {
          child.prerequisites.push(node.slug);
        }
      }
    }
  }

  public addConcept(node: ConceptNode): void {
    if (!this.nodes.has(node.slug)) {
      this.nodes.set(node.slug, {
        ...node,
        prerequisites: [...node.prerequisites],
        dependents: [...node.dependents],
      });
    } else {
      const existing = this.nodes.get(node.slug)!;
      existing.name = node.name;
      existing.category = node.category;
      existing.difficulty = node.difficulty;
      existing.description = node.description;
      existing.timeComplexity = node.timeComplexity;
      existing.spaceComplexity = node.spaceComplexity;
      if (node.codeTemplate) existing.codeTemplate = node.codeTemplate;
      if (node.pitfalls) existing.pitfalls = node.pitfalls;
      if (node.practiceProblems) existing.practiceProblems = node.practiceProblems;
      if (node.literatureReferences) existing.literatureReferences = node.literatureReferences;
      if (node.conceptualTheory) existing.conceptualTheory = node.conceptualTheory;
      if (node.variations) existing.variations = node.variations;
      if (node.recognitionSignals) existing.recognitionSignals = node.recognitionSignals;
      if (node.stepByStepStrategy) existing.stepByStepStrategy = node.stepByStepStrategy;
    }
  }

  public addDependency(prereqSlug: string, dependentSlug: string): void {
    const prereq = this.nodes.get(prereqSlug);
    const dependent = this.nodes.get(dependentSlug);

    if (prereq && !prereq.dependents.includes(dependentSlug)) {
      prereq.dependents.push(dependentSlug);
    }
    if (dependent && !dependent.prerequisites.includes(prereqSlug)) {
      dependent.prerequisites.push(prereqSlug);
    }
  }

  public getNode(slug: string): ConceptNode | undefined {
    return this.nodes.get(slug);
  }

  public getAllNodes(): ConceptNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Cycle detection using 3-color DFS
   * 0: unvisited, 1: visiting (in stack), 2: visited
   */
  public hasCycle(): boolean {
    const state = new Map<string, number>();

    const dfs = (slug: string): boolean => {
      state.set(slug, 1); // visiting
      const node = this.nodes.get(slug);

      if (node) {
        for (const dep of node.dependents) {
          const depState = state.get(dep) ?? 0;
          if (depState === 1) return true; // Cycle found
          if (depState === 0 && dfs(dep)) return true;
        }
      }

      state.set(slug, 2); // visited
      return false;
    };

    for (const slug of this.nodes.keys()) {
      if ((state.get(slug) ?? 0) === 0) {
        if (dfs(slug)) return true;
      }
    }

    return false;
  }

  /**
   * Computes topological sort order using Kahn's algorithm
   */
  public getTopologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    for (const slug of this.nodes.keys()) {
      inDegree.set(slug, 0);
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.dependents) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [slug, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(slug);
      }
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      sorted.push(curr);

      const node = this.nodes.get(curr);
      if (node) {
        for (const dep of node.dependents) {
          const newDeg = (inDegree.get(dep) ?? 0) - 1;
          inDegree.set(dep, newDeg);
          if (newDeg === 0) {
            queue.push(dep);
          }
        }
      }
    }

    if (sorted.length !== this.nodes.size) {
      throw new Error("Graph contains a cycle; topological sort is not defined.");
    }

    return sorted;
  }

  /**
   * Resolves learning status for each concept given a set of mastered concepts:
   * - MASTERED: concept is in masteredSlugs
   * - UNLOCKED: concept is not mastered, but all its prerequisites are mastered
   * - LOCKED: concept has at least one unmet prerequisite
   */
  public getLearningStatus(
    masteredSlugs: Set<string>
  ): Map<string, NodeLearningStatus> {
    const statusMap = new Map<string, NodeLearningStatus>();

    for (const [slug, node] of this.nodes.entries()) {
      if (masteredSlugs.has(slug)) {
        statusMap.set(slug, "MASTERED");
      } else {
        const allPrereqsMet = node.prerequisites.every((p) => masteredSlugs.has(p));
        statusMap.set(slug, allPrereqsMet ? "UNLOCKED" : "LOCKED");
      }
    }

    return statusMap;
  }

  /**
   * Resolves all transitive ancestors (prerequisites) of a concept
   */
  public getAllAncestors(slug: string): string[] {
    const ancestors = new Set<string>();

    const dfs = (curr: string) => {
      const node = this.nodes.get(curr);
      if (!node) return;
      for (const p of node.prerequisites) {
        if (!ancestors.has(p)) {
          ancestors.add(p);
          dfs(p);
        }
      }
    };

    dfs(slug);
    return Array.from(ancestors);
  }

  /**
   * Resolves all transitive descendants (dependents) unlocked by a concept
   */
  public getAllDescendants(slug: string): string[] {
    const descendants = new Set<string>();

    const dfs = (curr: string) => {
      const node = this.nodes.get(curr);
      if (!node) return;
      for (const d of node.dependents) {
        if (!descendants.has(d)) {
          descendants.add(d);
          dfs(d);
        }
      }
    };

    dfs(slug);
    return Array.from(descendants);
  }

  /**
   * Computes shortest dependency path from source to target
   */
  public getShortestPath(fromSlug: string, toSlug: string): string[] | null {
    if (fromSlug === toSlug) return [fromSlug];

    const visited = new Set<string>([fromSlug]);
    const queue: Array<{ slug: string; path: string[] }> = [
      { slug: fromSlug, path: [fromSlug] },
    ];

    while (queue.length > 0) {
      const { slug, path } = queue.shift()!;
      const node = this.nodes.get(slug);

      if (node) {
        for (const dep of node.dependents) {
          if (dep === toSlug) {
            return [...path, dep];
          }
          if (!visited.has(dep)) {
            visited.add(dep);
            queue.push({ slug: dep, path: [...path, dep] });
          }
        }
      }
    }

    return null;
  }
}
