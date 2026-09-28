import { ConceptNode } from "../concept-node-type";

export const stringHashingConcept: ConceptNode = {
  slug: "string-hashing",
  name: "Polynomial Rolling Hashing & Double Modulo",
  category: "String Algorithms",
  difficulty: "INTERMEDIATE",
  description:
    "Maps arbitrary substrings into integer hash values enabling O(1) substring equivalence queries and O(log N) Longest Common Prefix (LCP) checks after O(N) precomputation.",
  timeComplexity: "O(N) build, O(1) query",
  spaceComplexity: "O(N)",
  prerequisites: ["modular-arithmetic", "prefix-sums"],
  dependents: [],
  literatureReferences: [
    {
      source: "USACO Guide (Gold)",
      section: "String Hashing",
      url: "https://usaco.guide/gold/string-hashing",
      keyInsight:
        "Using two distinct large primes (e.g. 10^9+7 and 10^9+9) reduces collision probability to ~ 10^-18, rendering hash collisions practically impossible in contest settings.",
    },
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 26: String Algorithms — String Hashing (pp. 241-246)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Substrings can be compared in O(1) by subtracting prefix hashes multiplied by powers of the base, analogous to 1D prefix sums.",
    },
    {
      source: "Principles of Algorithmic Problem Solving (Johan Sannemo)",
      section: "Chapter 15: Rolling Hashes & The Rabin-Karp Algorithm",
      keyInsight:
        "Never use a single 64-bit integer overflow modulo (2^64). Test case creators can deterministically break 2^64 hashing using Thue-Morse sequence generators.",
    },
  ],
  conceptualTheory: `### The Polynomial Rolling Hash Invariant

#### 1. Hash Definition
For a string $S = s_0 s_1 \\dots s_{N-1}$, choose a base $B > |\\Sigma|$ (e.g. $B = 313$ or $B = 37$) and a large prime modulo $M$:
$$\\text{hash}(S) = \\left( \\sum_{i=0}^{N-1} s_i \\cdot B^{N - 1 - i} \\right) \\pmod M$$

We precompute:
- **Prefix Hash Table**: $H[i] = \\text{hash}(S[0 \\dots i-1])$
  $$H[0] = 0$$
  $$H[i] = (H[i-1] \\cdot B + S[i-1]) \\pmod M$$
- **Base Powers**: $P[i] = B^i \\pmod M$

---

#### 2. Querying Any Substring in $O(1)$
To extract the hash of substring $S[l \\dots r]$ (0-indexed, inclusive, length $L = r - l + 1$):
$$\\text{hash}(S[l \\dots r]) = (H[r+1] - H[l] \\cdot B^L) \\pmod M$$
In C++:
\`\`\`cpp
long long getHash(int l, int r) {
    long long res = (H[r + 1] - H[l] * P[r - l + 1]) % M;
    if (res < 0) res += M;
    return res;
}
\`\`\`

---

#### 3. Why Double Modulo Is Essential
If only one prime $M = 10^9+7$ is used:
By the **Birthday Paradox**, among $K$ random substrings, the probability of collision exceeds $50\\%$ when:
$$K \\approx \\sqrt{M} \\approx \\sqrt{10^9} \\approx 31,622$$
In a contest with $N = 10^5$, an array of $N$ substrings has guaranteed collisions!
With **Double Modulo** $(M_1 = 10^9+7, M_2 = 10^9+9)$:
$$\\text{Effective Modulo Space} = M_1 \\times M_2 \\approx 10^{18}$$
$$\\text{Collision Threshold} \\approx \\sqrt{10^{18}} \\approx 10^9 \\text{ strings!}$$
This eliminates collision risk completely.`,
  variations: [
    {
      title: "Double Modulo String Hashing",
      explanation: "Pairs two independent prime moduli (e.g. 10^9+7 and 10^9+9) with a randomized base to guarantee zero collisions.",
      formula: "pair<long long, long long> hash",
      timeComplexity: "O(1) query",
      spaceComplexity: "O(N)",
    },
    {
      title: "Longest Common Prefix (LCP) with Binary Search",
      explanation: "Find LCP of two suffixes/substrings in O(log N) by binary searching on substring length and comparing hashes.",
      formula: "Binary search length L where getHash(i, i+L-1) == getHash(j, j+L-1)",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Rabin-Karp Substring Matching",
      explanation: "Find all occurrences of pattern P in text T in O(N + M) by comparing rolling window hash with pattern hash.",
      formula: "getHash(i, i + len - 1) == pattern_hash",
      timeComplexity: "O(N + M)",
      spaceComplexity: "O(N)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Checking equality between many arbitrary substrings in O(1)",
      cue: "Polynomial Rolling Hashing with double modulo.",
    },
    {
      triggerConstraint: "Finding the longest palindrome or longest repeated substring",
      cue: "Binary search on length + string hashing lookup.",
    },
  ],
  stepByStepStrategy: [
    "1. Choose Bases & Moduli: Use two independent primes $M_1 = 10^9+7, M_2 = 10^9+9$ and base $B = 313$.",
    "2. Precompute Powers & Prefix Hashes: Allocate size N + 1 for both H1, H2 and P1, P2.",
    "3. Positive Modulo Normalization: In getHash, always add M before final modulo: `(res % M + M) % M`.",
    "4. Suffix Equality Check: For LCP, binary search length L from 1 to min(rem1, rem2).",
  ],
  codeTemplate: `#include <vector>
#include <string>
#include <iostream>

using namespace std;

struct StringHash {
    int n;
    const long long MOD1 = 1e9 + 7;
    const long long MOD2 = 1e9 + 9;
    const long long B1 = 313;
    const long long B2 = 317;

    vector<long long> h1, h2, p1, p2;

    StringHash(const string& s) : n(s.size()), h1(n + 1, 0), h2(n + 1, 0), p1(n + 1, 1), p2(n + 1, 1) {
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B1 + s[i]) % MOD1;
            h2[i + 1] = (h2[i] * B2 + s[i]) % MOD2;
            p1[i + 1] = (p1[i] * B1) % MOD1;
            p2[i + 1] = (p2[i] * B2) % MOD2;
        }
    }

    // Returns double hash of substring s[l..r] (0-indexed, inclusive)
    pair<long long, long long> getHash(int l, int r) const {
        int len = r - l + 1;
        long long hash1 = (h1[r + 1] - h1[l] * p1[len]) % MOD1;
        if (hash1 < 0) hash1 += MOD1;

        long long hash2 = (h2[r + 1] - h2[l] * p2[len]) % MOD2;
        if (hash2 < 0) hash2 += MOD2;

        return {hash1, hash2};
    }
};`,
  pitfalls: [
    "Single Modulo Birthday Paradox: Using a single modulo 10^9+7 guarantees collisions on tests with ~ 10^5 distinct substrings. Always use Double Modulo or randomized base.",
    "Unsigned Long Long Overflow Modulo (2^64): On Codeforces, tests routinely include Thue-Morse anti-hash strings that break 2^64 hashing with 100% certainty.",
    "Base Smaller than Character Range: Choosing base B = 29 when characters include uppercase/digits causes collisions. Use B >= 257 or 313.",
  ],
  practiceProblems: [
    {
      name: "String Matching (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1753",
      platform: "CSES",
      hint: "Rabin-Karp: Compute pattern hash and match against rolling text substring hashes.",
    },
    {
      name: "Finding Borders (CSES)",
      rating: 1400,
      url: "https://cses.fi/problemset/task/1732",
      platform: "CSES",
      hint: "A border is a prefix that is also a suffix: test if getHash(0, k-1) == getHash(n-k, n-1).",
    },
    {
      name: "Minimal Rotation (CSES)",
      rating: 1600,
      url: "https://cses.fi/problemset/task/1110",
      platform: "CSES",
      hint: "Duplicate string s + s. Compare cyclic shifts using LCP binary search on hashes.",
    },
  ],
};
