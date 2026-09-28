import { ConceptNode } from "./concept-node-type";
import { prefixSumsConcept } from "./data-structures/prefix-sums";
import { twoPointersConcept } from "./data-structures/two-pointers";
import { binarySearchAnswerConcept } from "./data-structures/binary-search-answer";
import { segmentTreeConcept } from "./data-structures/segment-tree";
import { lazyPropagationConcept } from "./data-structures/lazy-propagation";
import { dsuConcept } from "./data-structures/dsu";
import { trieConcept } from "./data-structures/trie";
import { oneDDPConcept } from "./dynamic-programming/1d-dp";
import { knapsackConcept } from "./dynamic-programming/knapsack";
import { bitmaskDPConcept } from "./dynamic-programming/bitmask-dp";
import { treeDPConcept } from "./dynamic-programming/tree-dp";
import { bfsDfsConcept } from "./graph-algorithms/bfs-dfs";
import { dijkstraConcept } from "./graph-algorithms/dijkstra";
import { mstKruskalConcept } from "./graph-algorithms/mst-kruskal";
import { binaryLiftingLCAConcept } from "./graph-algorithms/binary-lifting-lca";
import { modularArithmeticConcept } from "./math-strings/modular-arithmetic";
import { stringHashingConcept } from "./math-strings/string-hashing";

export const CORE_CONCEPTS: ConceptNode[] = [
  // 1. Data Structures & Foundational Search
  prefixSumsConcept,
  twoPointersConcept,
  binarySearchAnswerConcept,
  bfsDfsConcept,
  dsuConcept,
  dijkstraConcept,
  segmentTreeConcept,
  lazyPropagationConcept,

  // 2. Dynamic Programming Formulations
  oneDDPConcept,
  knapsackConcept,
  bitmaskDPConcept,
  mstKruskalConcept,
  treeDPConcept,

  // 3. Tree Algorithms & Number Theory
  binaryLiftingLCAConcept,
  modularArithmeticConcept,
  stringHashingConcept,
  trieConcept,
];

export function getConceptBySlug(slug: string): ConceptNode | undefined {
  return CORE_CONCEPTS.find((c) => c.slug === slug);
}

export function getConceptsByCategory(category: string): ConceptNode[] {
  return CORE_CONCEPTS.filter((c) => c.category === category);
}

export {
  prefixSumsConcept,
  twoPointersConcept,
  binarySearchAnswerConcept,
  bfsDfsConcept,
  dsuConcept,
  dijkstraConcept,
  segmentTreeConcept,
  lazyPropagationConcept,
  oneDDPConcept,
  knapsackConcept,
  bitmaskDPConcept,
  mstKruskalConcept,
  treeDPConcept,
  binaryLiftingLCAConcept,
  modularArithmeticConcept,
  stringHashingConcept,
  trieConcept,
};
