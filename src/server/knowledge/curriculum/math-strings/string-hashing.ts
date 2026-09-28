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
  conceptualTheory: `## Polynomial Rolling Hashing & Double Modulo: A Complete Textbook Chapter

### The Substring Equivalence Problem: Why Hash Strings?

Consider one of the most common requirements in competitive programming:
> Given a string $S$ of length $N = 10^5$, answer $Q = 10^5$ queries:
> *"Is substring $S[a \dots b]$ identical to substring $S[c \dots d]$?"*

If we perform naive character-by-character comparison:
- Comparing two substrings of length $L$ takes $O(L)$ time.
- For $Q = 10^5$ queries on strings of length $10^5$:
  $$\text{Total Time} = O(Q \times N) \approx 10^5 \times 10^5 = 10^{10} \text{ operations (Time Limit Exceeded!)}$$

Can we check if two arbitrary substrings are equal in strictly **$O(1)$ time**?
Yes, using **Polynomial Rolling Hashing**:
We map every possible substring to an integer fingerprint (hash). If two substrings have identical hashes, they are equal with overwhelming probability ($> 99.9999999999999999\%$).

---

### The Base-10 Number Analogy: Mental Model

Before writing formulas, think about how we write normal numbers in base 10:
Consider the number \`472\`:
$$472 = 4 \times 10^2 + 7 \times 10^1 + 2 \times 10^0$$

Now suppose you have a sequence of digits \`[4, 7, 2, 9, 5]\` and you computed prefix numbers:
- \`P[0] = 0\`
- \`P[1] = 4\`
- \`P[2] = 47\`
- \`P[3] = 472\`
- \`P[4] = 4729\`

How would you extract the number \`729\` (from index 1 to 3) in $O(1)$?
1. Take \`P[4] = 4729\`.
2. Take \`P[1] = 4\`.
3. Shift \`P[1]\` to the left by 3 decimal places: \`4 * 10^3 = 4000\`.
4. Subtract: \`4729 - 4000 = 729\`!

Polynomial Rolling Hashing does the **EXACT SAME THING**, but instead of base 10, we use a large base $B$ (e.g. $B = 313$), and instead of unlimited digits, we compute everything **modulo a large prime $M$**!

---

### The Mathematical Formulation

Given a string $S = s_0 s_1 \dots s_{N-1}$:
1. Choose an integer **Base** $B$ strictly greater than the alphabet size:
   $$B > |\Sigma|$$
   (For lowercase English letters \`a\`-\`z\`, $|\Sigma| = 26$, so choose $B \approx 300$ or a randomized prime base).
2. Choose a large **Prime Modulo** $M$ (e.g. $10^9 + 7$).

#### Prefix Hashes & Power Tables
We precompute two arrays in $O(N)$ time:
- **Base Powers**: $P[i] = B^i \pmod M$
  $$P[0] = 1, \quad P[i] = (P[i-1] \times B) \pmod M$$
- **Prefix Hashes**: $H[i] = \text{hash}(S[0 \dots i-1])$
  $$H[0] = 0$$
  $$H[i] = (H[i-1] \times B + (S[i-1] - \text{'a'} + 1)) \pmod M$$

#### Querying Any Substring $S[l \dots r]$ in O(1)
For a substring starting at index $l$ and ending at index $r$ (0-indexed, inclusive, length $L = r - l + 1$):
$$\text{hash}(S[l \dots r]) = (H[r + 1] - H[l] \times B^L) \pmod M$$

\`\`\`cpp
long long getHash(int l, int r) {
    long long res = (H[r + 1] - 1LL * H[l] * P[r - l + 1]) % MOD;
    if (res < 0) res += MOD; // Negative modulo protection!
    return res;
}
\`\`\`

---

### Collision Probabilities & Why Double Modulo Is Mandatory

In hash-based algorithms, two distinct strings $S_1 \ne S_2$ might produce the same hash value (a **Hash Collision**).

#### The Birthday Paradox & Single Modulo Vulnerability
If we use a single prime $M = 10^9 + 7$:
By the **Birthday Paradox**, among $K$ distinct strings, the probability of at least one collision exceeds $50\%$ when:
$$K \approx \sqrt{M} \approx \sqrt{10^9} \approx 31,622$$

In a competitive programming problem where $N = 10^5$, an array has $\approx 10^5$ suffixes and $O(N^2)$ substrings.
With $10^5$ distinct hashes, **a single modulo $10^9 + 7$ will collide with $> 99.9\%$ probability!** Your solution will fail with Wrong Answer on hidden test cases.

#### Why \`unsigned long long\` (Modulo $2^{64}$) Is Deterministically Broken
Many competitors use \`unsigned long long\` relying on automatic hardware overflow (modulo $2^{64}$) to avoid modulo operations:
> **WARNING**: Never use $2^{64}$ single-modulo hashing on platforms like Codeforces!
> Using the **Thue-Morse sequence**, test creators can deterministically generate two strings of length $2^{12} = 4096$ that have the EXACT SAME hash modulo $2^{64}$ for ANY fixed base $B$! Codeforces test suites systematically include anti-hash test cases.

#### The Double Modulo Solution: $10^{18}$ State Space
Instead of one prime, we compute hashes under **TWO independent large primes**:
- $M_1 = 10^9 + 7$
- $M_2 = 10^9 + 9$ (or $10^9 + 21$, $10^9 + 33$)
- Base $B = 313$ (or a randomized base generated via \`mt19937\`)

A substring's hash is stored as a \`pair<long long, long long>\`:
$$\text{hash}(S) = (\text{hash}_{M_1}(S), \ \text{hash}_{M_2}(S))$$
The effective hash space is:
$$M_1 \times M_2 \approx 10^9 \times 10^9 = 10^{18}$$
By the Birthday Paradox:
$$K \approx \sqrt{10^{18}} = 10^9 \text{ strings needed for a } 50\% \text{ collision chance!}$$
Across $10^5$ strings, the collision probability is $< 10^{-8}$ — rendering collisions practically impossible!

---

### The 5 Classical String Hashing Archetypes

#### Archetype 1: Substring Pattern Matching (Rabin-Karp) in O(N + M)
Find all occurrences of pattern $P$ (length $M$) in text $T$ (length $N$):
1. Compute the pattern hash $H_P = \text{hash}(P)$ in $O(M)$.
2. Precompute prefix hashes for text $T$ in $O(N)$.
3. Slide a window of length $M$ from index $i = 0$ to $N - M$:
   - If \`getHash(i, i + M - 1) == H_P\`, record match at index $i$!
Total runtime: strictly $O(N + M)$!

#### Archetype 2: Longest Common Prefix (LCP) in O(log N)
Given two starting positions $i$ and $j$ in string $S$, how many characters do their suffixes share?
Binary search on the length $L \in [1, \min(N - i, N - j)]$:
- If \`getHash(i, i + L - 1) == getHash(j, j + L - 1)\`: feasible, try larger $L$ (\`low = mid + 1\`).
- Else: infeasible, try smaller $L$ (\`high = mid - 1\`).
Runtime: strictly $O(\log N)$!

#### Archetype 3: Lexicographical Substring Comparison in O(log N)
How do we compare two substrings $S[a \dots b]$ and $S[c \dots d]$ alphabetically without $O(N)$ string comparison?
1. Find their Longest Common Prefix length $k = \text{LCP}(a, c)$ in $O(\log N)$.
2. If $k$ equals the length of one substring, the shorter substring is lexicographically smaller.
3. Otherwise, the very first character where they diverge is at index $a + k$ vs $c + k$:
   - Compare the characters: \`S[a + k] < S[c + k]\` in $O(1)$!
Enables sorting $N$ substrings in $O(N \log^2 N)$ without building a Suffix Array!

#### Archetype 4: Palindrome Queries in O(1)
To check if ANY substring $S[l \dots r]$ is a palindrome:
1. Compute prefix hashes of $S$: \`H_fwd\`
2. Compute prefix hashes of reversed $S$: \`H_bwd\`
3. $S[l \dots r]$ is a palindrome if and only if:
   $$\text{fwd\_hash}(l, r) == \text{bwd\_hash}(N - 1 - r, N - 1 - l)$$
Answers arbitrary palindrome queries in strictly $O(1)$!

#### Archetype 5: Counting Distinct Substrings in O(N² log N)
To count how many distinct substrings exist in a string of length $N \le 3000$:
- Extract the double hash for all $N(N + 1)/2$ substrings.
- Insert them into a \`vector<pair<long long, long long>>\`, sort, and use \`std::unique\`.
- Total runtime: $O(N^2 \log N)$ with zero memory leaks.

---

### Contest Checklist & Anti-Hack Traps

1. **Randomize Your Base**:
   \`\`\`cpp
   mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
   long long B = uniform_int_distribution<long long>(300, 1e9)(rng);
   \`\`\`
   A randomized base prevents anti-hash test generators from predicting your hash function!
2. **Negative Modulo Handling**:
   Always write \`(diff % MOD + MOD) % MOD\` when subtracting hashes.
3. **1-Based Prefix Indexing**:
   $H[0] = 0$ is the empty prefix. Substring $S[l \dots r]$ uses $H[r + 1] - H[l] \times B^{r - l + 1}$.
4. **Base Greater Than Alphabet**:
   Never use $B = 26$ or smaller; characters will carry over like arithmetic addition and collide.`,
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
