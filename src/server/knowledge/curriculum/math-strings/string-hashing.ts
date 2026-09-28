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
  deepExplanation: {
    intuition:
      "Comparing two strings of length L takes O(L) time. If an algorithm requires comparing many substrings (e.g., checking if two substrings match, finding palindromes, or binary searching for Longest Common Prefix), naive comparison explodes to O(N^2) or O(N^3). Polynomial Rolling Hashing treats a string of characters as digits in base B modulo M. By precomputing prefix hashes and powers of B in O(N), any arbitrary substring hash H(S[l..r]) can be extracted in O(1) time using an algebraic shift-and-subtract formula identical to prefix sums.",
    proofOfCorrectness:
      "Theorem (Substring Hash Invariance & Collision Bound via Schwartz-Zippel): (1) Extraction Formula: Define prefix hash H[i] = sum_{k=0}^{i-1} S[k] * B^(i - 1 - k) mod M. Then H[r+1] = sum_{k=0}^{r} S[k] * B^(r - k) mod M and H[l] * B^(r - l + 1) = sum_{k=0}^{l-1} S[k] * B^(r - k) mod M. Subtracting the two cancels the common prefix S[0..l-1], leaving exactly sum_{k=l}^{r} S[k] * B^(r - k) mod M = H(S[l..r]). (2) Collision Probability: By the Schwartz-Zippel Lemma, two distinct strings of length <= L evaluate to the same polynomial hash modulo prime M with probability at most L / M. By the Birthday Paradox, comparing K substrings yields collision probability approx 1 - exp(-K^2 / (2M)). For single modulo M approx 10^9 with K = 10^5 substrings, collision probability exceeds 99%. By employing Double Modulo (M1 = 10^9+7, M2 = 10^9+9) with coprime moduli, the composite modulus is M1 * M2 approx 10^18. The collision probability drops to K^2 / (2 * 10^18) <= 10^10 / (2 * 10^18) = 5 * 10^(-9), which is statistically zero across all competitive programming tests.",
    complexityDerivation:
      "Build Time: O(N) to compute prefix hashes and power arrays p1[] and p2[]. Substring Hash Query: Exactly 2 subtractions and 2 multiplications: O(1). Substring LCP Query: O(log N) via binary search on substring length. Space: O(N) auxiliary memory for prefix hash tables.",
    whenNotToUse:
      "Do NOT use polynomial hashing if an exact deterministic algorithm exists with equal complexity (e.g. use KMP or Z-Algorithm for pattern matching in O(N), or Suffix Automaton for substring indexing in O(N)). On competitive platforms like Codeforces with open hacking, deterministic linear-time algorithms are 100% immune to anti-hash adversarial test generators.",
  },
  workedExample: {
    title: "Prefix-Suffix Border Matching on 'abacaba'",
    scenario: "String S = 'abacaba' (length 7). Base B = 31, MOD = 10^9+7. Check if length-3 prefix 'aba' equals suffix 'aba'.",
    input: "S = 'abacaba', l1 = 0, r1 = 2 ('aba'); l2 = 4, r2 = 6 ('aba').",
    output: "H(S[0..2]) == H(S[4..6]). Confirms 'aba' is a valid border.",
    traceSteps: [
      { step: 1, state: "ASCII Mapping", action: "a=97, b=98. S = [97, 98, 97, 99, 97, 98, 97]", insight: "Zero-indexed character codes" },
      { step: 2, state: "Prefix 'aba' Hash (indices 0..2)", action: "H[3] = 97*31^2 + 98*31 + 97 = 93217 + 3038 + 97 = 96352", insight: "Direct prefix evaluation" },
      { step: 3, state: "Suffix 'aba' Extraction (indices 4..6)", action: "Compute (H[7] - H[4] * B^3) % MOD.", insight: "Cancels out prefix 'abac' (length 4) shifted by B^3" },
      { step: 4, state: "Equivalence Check", action: "Extracted hash matches 96352 identically modulo 10^9+7.", insight: "Confirmed match in O(1) without character-by-character scan!" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Single Modulo Birthday Paradox Collision",
      cause: "Using only M = 10^9 + 7. When testing 10^5 distinct substrings, the birthday paradox produces collisions with > 99% probability, resulting in Wrong Answer (WA).",
      fix: "Always use Double Hashing with two distinct large primes (e.g., M1 = 10^9 + 7 and M2 = 10^9 + 9) or a 64-bit Mersenne prime (2^61 - 1).",
      wrongSnippet: "long long h = getHash(l, r); // Single 32-bit modulo fails easily",
      correctedSnippet: "pair<long long, long long> h = getDoubleHash(l, r); // Effective modulus ~ 10^18",
    },
    {
      trap: "Natural 2^64 Overflow (unsigned long long) Anti-Hash Hack",
      cause: "Using `unsigned long long` without modulo allows Codeforces hackers to construct Thue-Morse strings that force hash collisions with 100% certainty.",
      fix: "Never use pure unsigned 64-bit overflow on Codeforces. Use explicit prime modulo or randomized base.",
      wrongSnippet: "typedef unsigned long long ull; ull h[N]; // Easily hacked with anti-hash tests!",
      correctedSnippet: "const long long MOD1 = 1e9 + 7, MOD2 = 1e9 + 9; // Immune to Thue-Morse hacks",
    },
    {
      trap: "Base Smaller than Alphabet Size",
      cause: "Using base B = 29 or 31 on strings containing uppercase letters or full ASCII (values up to 127). Two different characters can collide into identical power sums.",
      fix: "Choose base B strictly greater than the maximum character value (e.g., B >= 257 or B = 313 for ASCII, or randomized odd base).",
      wrongSnippet: "const int B = 26; // Collides on uppercase / ASCII!",
      correctedSnippet: "const int B1 = 313, B2 = 317; // Strictly greater than ASCII 127",
    },
  ],
  pythonTemplate: `import sys

class StringHasher:
    """Double Polynomial Rolling Hash (MOD1 = 10^9 + 7, MOD2 = 10^9 + 9)."""
    def __init__(self, s: str, b1: int = 313, b2: int = 317):
        self.s = s
        self.n = len(s)
        self.MOD1 = 10**9 + 7
        self.MOD2 = 10**9 + 9
        
        self.h1 = [0] * (self.n + 1)
        self.h2 = [0] * (self.n + 1)
        self.p1 = [1] * (self.n + 1)
        self.p2 = [1] * (self.n + 1)

        for i in range(self.n):
            code = ord(s[i])
            self.h1[i + 1] = (self.h1[i] * b1 + code) % self.MOD1
            self.h2[i + 1] = (self.h2[i] * b2 + code) % self.MOD2
            self.p1[i + 1] = (self.p1[i] * b1) % self.MOD1
            self.p2[i + 1] = (self.p2[i] * b2) % self.MOD2

    def get_hash(self, l: int, r: int) -> tuple:
        """Returns (hash1, hash2) for substring s[l..r] (0-indexed, inclusive) in O(1)."""
        length = r - l + 1
        hash1 = (self.h1[r + 1] - self.h1[l] * self.p1[length]) % self.MOD1
        hash2 = (self.h2[r + 1] - self.h2[l] * self.p2[length]) % self.MOD2
        return (hash1, hash2)

def solve_string_matching():
    """CSES String Matching: Rabin-Karp substring occurrence counter."""
    input = sys.stdin.readline
    text = input().strip()
    pattern = input().strip()

    n = len(text)
    m = len(pattern)
    if m > n:
        print(0)
        return

    text_hasher = StringHasher(text)
    pattern_hasher = StringHasher(pattern)
    target_hash = pattern_hasher.get_hash(0, m - 1)

    matches = 0
    for i in range(n - m + 1):
        if text_hasher.get_hash(i, i + m - 1) == target_hash:
            matches += 1

    print(matches)

if __name__ == '__main__':
    solve_string_matching()
`,
};
