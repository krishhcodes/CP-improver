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
  deepExplanation: {
    intuition:
      "A Trie (prefix tree) organizes a set of strings or fixed-width binary representations by storing common prefixes in shared parent nodes. For competitive programming, its premier application is the Binary 0/1 Trie for bitwise XOR optimization. To maximize X XOR Y given fixed X, we want each bit of Y from MSB to LSB to differ from X. The trie allows navigating greedily: at bit position b, if a branch with the inverted bit exists, we must take it.",
    proofOfCorrectness:
      "Theorem (Optimality of Greedy Bitwise Traversal in Binary Trie): In a binary trie with keys of width B, traversing the opposite bit branch at the highest available bit position b always yields a strictly greater XOR value than any choice made at subsequent bits b-1 ... 0. Proof: Suppose at bit position b, a node offers both bit and 1 - bit. Choosing 1 - bit contributes 2^b to the XOR product. The maximum possible sum from all remaining lower bits is sum_{k=0}^{b-1} 2^k = 2^b - 1. Since 2^b > 2^b - 1, no combination of lower bits can ever compensate for missing a 1 at bit b. Thus, the greedy decision at each bit from MSB to LSB is globally optimal.",
    complexityDerivation:
      "Time: O(B) per insertion and query, where B is the bit width (B = 30 for 32-bit integers, B = 62 for 64-bit integers). Across N elements, total time is O(N * B) approx 30 * 2 * 10^5 = 6 * 10^6 ops, running in ~15ms. Space: At most N * B trie nodes. In a static array implementation, size <= 2 * 10^5 * 30 = 6 * 10^6 nodes, requiring ~48MB RAM.",
    whenNotToUse:
      "Do NOT use a full 26-ary pointer-based Trie for simple dictionary search if you only need exact string lookup (an `unordered_set<string>` or polynomial rolling hash is much faster and uses 10x less memory). For multiple pattern matching in text, upgrade to an Aho-Corasick automaton with failure links.",
  },
  workedExample: {
    title: "Binary Trie Max XOR Query with 3-Bit Numbers",
    scenario: "Bit width B = 3. Insert 5 (101_2) and 3 (011_2). Query maxXOR with candidate 2 (010_2).",
    input: "Keys: 5 (101_2), 3 (011_2). Query: 2 (010_2).",
    output: "Max XOR = 2 XOR 5 = 7 (111_2).",
    traceSteps: [
      { step: 1, state: "Insert 5 (101_2)", action: "Root -> bit 1 (node 1) -> bit 0 (node 2) -> bit 1 (node 3)", insight: "Path represents binary 101" },
      { step: 2, state: "Insert 3 (011_2)", action: "Root -> bit 0 (node 4) -> bit 1 (node 5) -> bit 1 (node 6)", insight: "Trie now contains both paths {101, 011}" },
      { step: 3, state: "Query Max XOR for 2 (010_2): Bit 2 (val = 0)", action: "Opposite bit is 1. Check Root.next[1]: exists (node 1). Choose 1! Bit 2 of XOR = 1. Acc = 4", insight: "Greedy choice captures 2^2 = 4" },
      { step: 4, state: "Query Bit 1 (val = 1)", action: "Opposite bit is 0. Check node 1.next[0]: exists (node 2). Choose 0! Bit 1 of XOR = 1. Acc = 4 + 2 = 6", insight: "Greedy choice captures 2^1 = 2" },
      { step: 5, state: "Query Bit 0 (val = 0)", action: "Opposite bit is 1. Check node 2.next[1]: exists (node 3). Choose 1! Bit 0 of XOR = 1. Acc = 6 + 1 = 7", insight: "Matches key 5. 2 XOR 5 = 010 XOR 101 = 111_2 = 7!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Missing Initial 0 in Prefix XOR Subarray Problems",
      cause: "When finding max XOR contiguous subarray using pref[r] ^ pref[l-1], if the optimal subarray starts at index 0 (l = 0), pref[l-1] is pref[-1] = 0.",
      fix: "Always call `trie.insert(0)` BEFORE iterating through the array.",
      wrongSnippet: "BinaryTrie trie; for (int x : a) { pref ^= x; trie.insert(pref); ans = max(ans, trie.query(pref)); }",
      correctedSnippet: "BinaryTrie trie; trie.insert(0); for (int x : a) { pref ^= x; trie.insert(pref); ans = max(ans, trie.query(pref)); }",
    },
    {
      trap: "32-Bit Bit Shift Overflow (1 << b)",
      cause: "Writing `1 << b` in C++ when b >= 31 causes undefined behavior and signed overflow.",
      fix: "Always use `1LL << b` when manipulating 64-bit integer bitmasks.",
      wrongSnippet: "val |= (1 << b); // UB when b >= 31!",
      correctedSnippet: "val |= (1LL << b); // Safe for 64-bit bits up to 62",
    },
    {
      trap: "Dynamic Node Allocation TLE/MLE",
      cause: "Allocating nodes with `new TrieNode()` creates memory fragmentation and thousands of heap calls.",
      fix: "Pre-allocate a static vector `vector<Node>` or flat 2D array `int next_node[MAX_NODES][2]`.",
      wrongSnippet: "struct Node { Node* left; Node* right; Node() : left(nullptr), right(nullptr) {} };",
      correctedSnippet: "struct Node { int next[2] = {-1, -1}; int cnt = 0; }; vector<Node> tree;",
    },
  ],
  pythonTemplate: `import sys

class BinaryTrie:
    """Fast 0/1 Trie for bitwise XOR queries with frequency tracking."""
    def __init__(self, bit_depth: int = 30):
        self.bit_depth = bit_depth
        # Flattened nodes: next_node[0], next_node[1], count
        self.next_0 = [-1]
        self.next_1 = [-1]
        self.cnt = [0]

    def insert(self, val: int):
        curr = 0
        self.cnt[curr] += 1
        for b in range(self.bit_depth - 1, -1, -1):
            bit = (val >> b) & 1
            if bit == 0:
                if self.next_0[curr] == -1:
                    self.next_0[curr] = len(self.cnt)
                    self.next_0.append(-1)
                    self.next_1.append(-1)
                    self.cnt.append(0)
                curr = self.next_0[curr]
            else:
                if self.next_1[curr] == -1:
                    self.next_1[curr] = len(self.cnt)
                    self.next_0.append(-1)
                    self.next_1.append(-1)
                    self.cnt.append(0)
                curr = self.next_1[curr]
            self.cnt[curr] += 1

    def max_xor(self, val: int) -> int:
        """Find max(val ^ x) for all x currently stored in the trie."""
        curr = 0
        ans = 0
        for b in range(self.bit_depth - 1, -1, -1):
            bit = (val >> b) & 1
            desired = 1 - bit
            if desired == 1 and self.next_1[curr] != -1 and self.cnt[self.next_1[curr]] > 0:
                ans |= (1 << b)
                curr = self.next_1[curr]
            elif desired == 0 and self.next_0[curr] != -1 and self.cnt[self.next_0[curr]] > 0:
                ans |= (1 << b)
                curr = self.next_0[curr]
            else:
                curr = self.next_0[curr] if bit == 0 else self.next_1[curr]
        return ans

def solve():
    input = sys.stdin.readline
    n = int(input())
    a = list(map(int, input().split()))
    
    trie = BinaryTrie(bit_depth=30)
    trie.insert(0) # Invariant: subarray starting at index 0
    
    pref = 0
    max_xor = 0
    for x in a:
        pref ^= x
        trie.insert(pref)
        max_xor = max(max_xor, trie.max_xor(pref))
        
    print(max_xor)

if __name__ == '__main__':
    solve()
`,
};
