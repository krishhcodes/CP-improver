import { HintTierLevel, ProgressiveHint } from "./types";

export interface ProblemHintCurriculum {
  problemKey: string; // e.g. "970E", "371C", "default-dp"
  problemName: string;
  rating: number;
  hints: Record<HintTierLevel, ProgressiveHint>;
}

export const CURATED_PROBLEM_HINTS: Record<string, ProblemHintCurriculum> = {
  "970E": {
    problemKey: "970E",
    problemName: "Alternating String",
    rating: 1400,
    hints: {
      1: {
        tier: 1,
        title: "Observation & Parity Reduction",
        category: "OBSERVATION",
        content:
          "Analyze the string parity: characters at even indices must all match, and characters at odd indices must all match. If N is even, deleting a character is not allowed, so the answer is simply (N/2 - max_even_freq) + (N/2 - max_odd_freq). What changes when N is odd?",
      },
      2: {
        tier: 2,
        title: "Prefix & Suffix Parity Inversion",
        category: "ALGORITHM_PARADIGM",
        content:
          "When N is odd, you must delete exactly one character at index `i`. Notice the crucial structural shift: deleting character `i` swaps the parity of all subsequent characters (indices > i) from even to odd, and odd to even! How can you compute frequencies before and after `i` in O(1)?",
      },
      3: {
        tier: 3,
        title: "Prefix/Suffix Frequency Vectors",
        category: "INVARIANT_PROOF",
        content:
          "Precompute two 26-element frequency prefix arrays and two suffix arrays: `prefEven[i][c]`, `prefOdd[i][c]`, `suffEven[i][c]`, `suffOdd[i][c]`. When deleting index `i`, total even frequencies for character `c` become `prefEven[i-1][c] + suffOdd[i+1][c]`. Total odd frequencies become `prefOdd[i-1][c] + suffEven[i+1][c]`. Iterate through all N possible deletion points in O(26 * N) time.",
      },
      4: {
        tier: 4,
        title: "Edge Cases & Off-by-One Guardrails",
        category: "EDGE_CASES",
        content:
          "Edge case: When N = 1, any single character string is alternating by definition after deleting the only character (operations = 1). When N is already alternating, deletion is still mandatory if N is odd. Ensure your frequency arrays use 1-based indexing with padding to prevent boundary checks on `i=0` and `i=N-1`.",
      },
    },
  },
  "371C": {
    problemKey: "371C",
    problemName: "Hamburgers",
    rating: 1400,
    hints: {
      1: {
        tier: 1,
        title: "Monotonic Invariant",
        category: "OBSERVATION",
        content:
          "Instead of trying to greedily buy ingredients round-by-round, invert the problem: 'Can we make at least X hamburgers with our current inventory and budget R?' If we can make X hamburgers, can we also make X - 1? If we cannot make X hamburgers, could we ever make X + 1?",
      },
      2: {
        tier: 2,
        title: "Binary Search on Answer",
        category: "ALGORITHM_PARADIGM",
        content:
          "Because `canCook(X)` is strictly monotonic (True, True, ..., True, False, False), we can binary search directly for the maximum valid X in range [0, 10^13]. What is the cost formula for cooking X hamburgers?",
      },
      3: {
        tier: 3,
        title: "Cost Calculation Invariant",
        category: "INVARIANT_PROOF",
        content:
          "To cook X hamburgers, you need `X * countB` bread, `X * countS` sausage, and `X * countC` cheese. The required purchase for ingredient i is `needed = max(0LL, X * count_i - inventory_i)`. Total cost is `sum(needed * price_i)`. We can make X if and only if `totalCost <= R`.",
      },
      4: {
        tier: 4,
        title: "Integer Overflow Traps",
        category: "EDGE_CASES",
        content:
          "CRITICAL 64-BIT WARNING: The search ceiling `high` must be at least `(inventory + R / min_price) ~ 10^12 + 100`. In the predicate `canCook`, `X * countB` can reach 10^14. If you multiply using 32-bit `int`, it will overflow and return wrong answers. Every count, price, inventory, and binary search variable MUST be `long long`.",
      },
    },
  },
  "279B": {
    problemKey: "279B",
    problemName: "Books",
    rating: 1400,
    hints: {
      1: {
        tier: 1,
        title: "Contiguous Segment Property",
        category: "OBSERVATION",
        content:
          "The problem asks for the maximum number of consecutive books that can be read within time T. Because all reading times `a[i] > 0` are strictly positive, any subsegment sum increases monotonically as the right endpoint expands.",
      },
      2: {
        tier: 2,
        title: "Sliding Window / Two Pointers",
        category: "ALGORITHM_PARADIGM",
        content:
          "Instead of recomputing segment sums in O(N^2), maintain a dynamic window `[l, r]`. Expand `r` to include the next book. What should you do when the current window sum exceeds T?",
      },
      3: {
        tier: 3,
        title: "Two Pointers Amortized O(N) Invariant",
        category: "INVARIANT_PROOF",
        content:
          "Maintain `currentSum`. For each right index `r` from 0 to N-1: `currentSum += a[r]`. While `currentSum > T`, subtract `a[l]` and increment `l++`. The valid window length is `r - l + 1`. Both `l` and `r` advance at most N times, guaranteeing O(N) total runtime.",
      },
      4: {
        tier: 4,
        title: "Empty Window & Zero Time Cases",
        category: "EDGE_CASES",
        content:
          "Edge case: When even a single book has `a[i] > T`, `l` will advance past `r`, so `currentSum` becomes 0 and length is 0. Ensure `ans` is initialized to 0 and `l <= r` or subtraction is guarded properly.",
      },
    },
  },
};

/**
 * Returns progressive hints for a given problem or generates pattern-based hints
 */
export function getProgressiveHint(
  problemKey: string,
  tier: HintTierLevel,
  fallbackTags: string[] = ["dynamic programming"]
): ProgressiveHint {
  const normalizedKey = problemKey.toUpperCase().trim();
  const curated = CURATED_PROBLEM_HINTS[normalizedKey];

  if (curated && curated.hints[tier]) {
    return curated.hints[tier];
  }

  // Generic Pattern-Based Socratic Hints
  const primaryTag = fallbackTags[0]?.toLowerCase() || "algorithmic problem";

  if (primaryTag.includes("dp") || primaryTag.includes("dynamic programming")) {
    const genericDPHints: Record<HintTierLevel, ProgressiveHint> = {
      1: {
        tier: 1,
        title: "Subproblem Identification",
        category: "OBSERVATION",
        content:
          "Analyze the decision tree: at step `i`, what minimal information from previous steps is necessary to make the current optimal choice? Do subproblems overlap?",
      },
      2: {
        tier: 2,
        title: "State Representation",
        category: "ALGORITHM_PARADIGM",
        content:
          "Define your state `DP[i][state]`. Keep dimensions minimal: if one dimension can be derived from the others (e.g. remaining capacity = total - used), eliminate it to save memory.",
      },
      3: {
        tier: 3,
        title: "State Transition Formula",
        category: "INVARIANT_PROOF",
        content:
          "Formulate recurrence: `DP[i] = combine(DP[i-1] with choices)`. Ensure the evaluation order is topological (e.g. previous states are completely resolved before computing current state).",
      },
      4: {
        tier: 4,
        title: "Base Cases & Space Compression",
        category: "EDGE_CASES",
        content:
          "Check base cases (`i = 0` or empty choices). If transitions only look back 1 step (`i - 1`), compress memory from O(N * K) to O(K) using rolling arrays.",
      },
    };
    return genericDPHints[tier];
  }

  // Default General CP Hint
  const genericHints: Record<HintTierLevel, ProgressiveHint> = {
    1: {
      tier: 1,
      title: "Problem Reduction & Small Testcases",
      category: "OBSERVATION",
      content:
        "Trace small examples manually on paper (N=2, N=3, N=4). Look for patterns, symmetries, invariants, or monotonic trends that reduce complexity.",
    },
    2: {
      tier: 2,
      title: "Complexity Bound Analysis",
      category: "ALGORITHM_PARADIGM",
      content:
        "Check constraints: If N <= 20, consider Bitmask DP (O(2^N * N)). If N <= 2000, O(N^2) DP is viable. If N >= 2 * 10^5, you MUST achieve O(N) or O(N log N) via Sorting, Binary Search, or Data Structures.",
    },
    3: {
      tier: 3,
      title: "Algorithmic Invariant & Technique",
      category: "INVARIANT_PROOF",
      content:
        "Can the problem be inverted? Often, asking 'What is the minimum condition required for an answer to be valid?' transforms a constructive search into a deterministic check.",
    },
    4: {
      tier: 4,
      title: "Boundary Conditions & Edge Cases",
      category: "EDGE_CASES",
      content:
        "Verify edge cases: N = 1, empty strings, all elements equal, negative coordinates, maximum constraints (overflowing 32-bit int), and disconnect graph components.",
    },
  };

  return genericHints[tier];
}
