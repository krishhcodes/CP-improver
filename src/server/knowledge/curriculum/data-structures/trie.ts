import { ConceptNode } from "../concept-node-type";

export const trieConcept: ConceptNode = {
  slug: "trie",
  name: "Trie & Binary 0/1 XOR Trie",
  category: "Data Structures",
  difficulty: "INTERMEDIATE",
  description:
    "Tree data structure storing strings or binary representations of integers. Enables O(L) prefix searches and O(30) Maximum XOR subarray queries.",
  timeComplexity: "O(L) or O(bits) per insertion/query",
  spaceComplexity: "O(total_characters * Alphabet) or O(N * bits)",
  prerequisites: ["bitmask-dp"],
  dependents: [],
  literatureReferences: [
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 2.3.2: Trie Data Structure",
      keyInsight:
        "Tries represent common prefixes compactly. A 26-ary trie accelerates dictionary lookups, autocomplete, and string frequency indexing.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 26: String Algorithms — Trie Structures (pp. 247-248)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "A binary trie represents numbers as bit strings. At each bit from 30 down to 0, greedily choosing the opposite bit guarantees the maximum possible XOR in O(bits).",
    },
  ],
  conceptualTheory: `### Prefix Trees & The Bitwise Greedy Property

#### 1. Dictionary Trie Architecture
A rooted tree where each edge represents a character $\\Sigma$ (typically lowercase English letters \`a\`-\`z\`, $\\Sigma = 26$).
- Each node stores:
  - \`child[26]\`: array of pointers / integer indices to child nodes.
  - \`isEndOfWord\`: boolean or integer count of words terminating at this node.
  - \`prefixCount\`: count of words passing through this node.

---

#### 2. Binary 0/1 XOR Trie (The Greedy Invariant)
To find $\\max_{y \\in S} (x \\oplus y)$:
The most significant bit (MSB) has greater weight than all lower bits combined:
$$2^b > \\sum_{i=0}^{b-1} 2^i = 2^b - 1$$

Therefore:
- To maximize $x \\oplus y$, at bit position $b$ (from $29$ down to $0$):
  - Determine $b$-th bit of $x$: $\\text{bit} = (x \\gg b) \\& 1$.
  - Target the **opposite bit**: $\\text{target} = 1 - \\text{bit}$.
  - If the trie has a branch for $\\text{target}$, follow it and add $2^b$ to the running XOR!
  - Otherwise, follow the $\\text{bit}$ branch (adding $0$).
- This greedy choice at each step is **provably globally optimal**.`,
  variations: [
    {
      title: "Dictionary Prefix Trie",
      explanation: "Standard 26-way trie supporting insert, search, and startsWith prefix checks in O(length).",
      formula: "child[char - 'a']",
      timeComplexity: "O(L)",
      spaceComplexity: "O(N * L * 26)",
    },
    {
      title: "Binary 0/1 XOR Trie",
      explanation: "Insert integers; query maximum or minimum XOR with any integer in O(30) steps.",
      formula: "Greedy branch selection: opposite = 1 - bit",
      timeComplexity: "O(bits)",
      spaceComplexity: "O(N * bits)",
    },
    {
      title: "Maximum XOR Subarray",
      explanation: "Subarray XOR a[l..r] is pref[r] ^ pref[l-1]. Insert prefix XORs into trie; for each r, query max XOR with pref[r].",
      formula: "pref[r] ^ pref[l - 1]",
      timeComplexity: "O(N * 30)",
      spaceComplexity: "O(N * 30)",
    },
    {
      title: "Dynamic Deletion & Frequency Trie",
      explanation: "Maintain passCount at each node. Decrement count upon removal; prune node if count == 0.",
      formula: "passCount--",
      timeComplexity: "O(bits)",
      spaceComplexity: "O(N * bits)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Find two numbers in an array whose XOR is maximized with N <= 2 * 10^5",
      cue: "Binary 0/1 XOR Trie in O(N * 30).",
    },
    {
      triggerConstraint: "Find contiguous subarray with maximum bitwise XOR sum",
      cue: "Prefix XOR array + Binary XOR Trie with initial insert(0).",
    },
    {
      triggerConstraint: "Count words matching a given prefix among 10^5 strings",
      cue: "Prefix tree with prefixCount attribute at each node.",
    },
  ],
  stepByStepStrategy: [
    "1. Vector Allocation: Use a vector of Node structs rather than dynamic pointers (`new`/`delete`) to maximize CPU cache locality and eliminate memory leaks.",
    "2. Insert Zero Prefix: For Maximum XOR Subarray, ALWAYS insert 0 before processing elements. This accounts for valid subarrays starting at index 0.",
    "3. Bit Width Sizing: For values up to 10^9, 30 bits (29 down to 0) suffices. For 64-bit `long long` values up to 10^18, use 62 bits.",
    "4. Bitwise Branching: Compute `(val >> b) & 1` and test `tree[curr].next[opposite] != -1`.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>
#include <algorithm>

using namespace std;

struct BinaryTrie {
    struct Node {
        int next[2];
        Node() { next[0] = next[1] = -1; }
    };

    vector<Node> tree;

    BinaryTrie() {
        tree.emplace_back(); // Root at index 0
    }

    void insert(int val) {
        int curr = 0;
        for (int b = 29; b >= 0; b--) {
            int bit = (val >> b) & 1;
            if (tree[curr].next[bit] == -1) {
                tree[curr].next[bit] = tree.size();
                tree.emplace_back();
            }
            curr = tree[curr].next[bit];
        }
    }

    int getMaxXOR(int val) {
        int curr = 0;
        int max_val = 0;
        for (int b = 29; b >= 0; b--) {
            int bit = (val >> b) & 1;
            int opposite = 1 - bit;
            if (tree[curr].next[opposite] != -1) {
                max_val |= (1 << b);
                curr = tree[curr].next[opposite];
            } else {
                curr = tree[curr].next[bit];
            }
        }
        return max_val;
    }
};

int maxSubarrayXOR(const vector<int>& a) {
    BinaryTrie trie;
    trie.insert(0); // Account for subarrays starting at index 0
    int pref = 0;
    int max_xor = 0;

    for (int x : a) {
        pref ^= x;
        trie.insert(pref);
        max_xor = max(max_xor, trie.getMaxXOR(pref));
    }
    return max_xor;
}`,
  pitfalls: [
    "Missing Zero in Prefix XOR: Omitting `trie.insert(0)` fails when the optimal subarray starts at index 0.",
    "Insufficient Bit Depth: Using 30 bits for 64-bit values leads to wrong answers. Use 62 bits for long long.",
    "Raw Pointer Leaks: Using `new Node()` in competitive programming causes MLE / allocator overhead. Use contiguous vector indexing `vector<Node>`.",
  ],
  practiceProblems: [
    {
      name: "Maximum XOR Subarray (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1655",
      platform: "CSES",
      hint: "Prefix XOR + Binary 0/1 XOR Trie. Insert 0 first.",
    },
    {
      name: "Vasiliy's Multiset (Codeforces)",
      rating: 1800,
      url: "https://codeforces.com/problemset/problem/706/D",
      platform: "Codeforces",
      hint: "Maintain frequency count on trie nodes to support dynamic additions and deletions.",
    },
    {
      name: "Word Combinations (CSES)",
      rating: 1700,
      url: "https://cses.fi/problemset/task/1731",
      platform: "CSES",
      hint: "Combine 1D DP with Trie string lookup: dp[i] = sum(dp[i + len]) for dictionary words matching string prefix at i.",
    },
  ],
};
