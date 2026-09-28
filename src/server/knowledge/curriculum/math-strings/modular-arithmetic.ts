import { ConceptNode } from "../concept-node-type";

export const modularArithmeticConcept: ConceptNode = {
  slug: "modular-arithmetic",
  name: "Modular Arithmetic, Fermat's Inverse & Combinatorics (nCr)",
  category: "Number Theory & Math",
  difficulty: "BEGINNER",
  description:
    "Core mathematical engine powering competitive programming: binary exponentiation in O(log P), modular inverse via Fermat's Little Theorem, and O(1) combinations via precomputed factorials.",
  timeComplexity: "O(log P) power, O(1) query after O(N) precomputation",
  spaceComplexity: "O(N)",
  prerequisites: [],
  dependents: ["string-hashing"],
  literatureReferences: [
    {
      source: "Competitive Programmer's Handbook (Antti Laaksonen)",
      section: "Chapter 21: Number Theory — Modular Arithmetic (pp. 197-204)",
      url: "https://cses.fi/book/book.pdf",
      keyInsight:
        "Division under modulo M is achieved by multiplying by the modular multiplicative inverse: A / B = A * B^(M-2) (mod M) by Fermat's Little Theorem for prime M.",
    },
    {
      source: "Introduction to Algorithms (CLRS)",
      section: "Chapter 31: Number-Theoretic Algorithms (pp. 906-930)",
      keyInsight:
        "Extended Euclidean Algorithm computes integers x and y such that a*x + b*y = gcd(a, b), providing inverses even when modulo M is non-prime (provided gcd(a, M) = 1).",
    },
    {
      source: "Competitive Programming 4 (Steven & Felix Halim)",
      section: "Section 5.3: Combinatorics in Competitive Programming",
      keyInsight:
        "Precomputing factorials and inverse factorials up to N = 10^6 allows answering binomial coefficient queries nCr(n, r) in strictly O(1) time.",
    },
  ],
  conceptualTheory: `### The Algebra of Congruence Classes & Fermat's Inverse

#### 1. Fundamental Modular Arithmetic Identities
$$(A + B) \\pmod M = ((A \\pmod M) + (B \\pmod M)) \\pmod M$$
$$(A - B) \\pmod M = ((A \\pmod M) - (B \\pmod M) + M) \\pmod M$$
$$(A \\cdot B) \\pmod M = ((A \\pmod M) \\cdot (B \\pmod M)) \\pmod M$$

**Notice: Division does NOT distribute!** $(A / B) \\pmod M \\ne (A \\pmod M) / (B \\pmod M)$.

---

#### 2. Division & Fermat's Little Theorem
Division $\\frac{A}{B} \\pmod M$ is defined as $A \\cdot B^{-1} \\pmod M$, where $B \\cdot B^{-1} \\equiv 1 \\pmod M$.
If $M$ is a prime number and $\\gcd(B, M) = 1$:
$$B^{M-1} \\equiv 1 \\pmod M$$
Multiplying both sides by $B^{-1}$:
$$B^{-1} \\equiv B^{M-2} \\pmod M$$
We compute $B^{M-2} \\pmod M$ in $O(\\log M)$ time using **Binary Exponentiation**!

---

#### 3. Combinatorics $\\binom{N}{K}$ in $O(1)$ Time
Precompute factorials $fact[i] = i! \\pmod M$ and inverse factorials $invFact[i] = (i!)^{-1} \\pmod M$ in $O(N)$ time:
1. $fact[i] = (fact[i-1] \\cdot i) \\pmod M$
2. $invFact[N] = \\text{power}(fact[N], M - 2)$
3. $invFact[i] = (invFact[i+1] \\cdot (i+1)) \\pmod M$ (Linear sweep backwards!)

Then for any query:
$$\\binom{N}{K} = \\frac{N!}{K!(N-K)!} \\equiv fact[N] \\cdot invFact[K] \\cdot invFact[N-K] \\pmod M$$`,
  variations: [
    {
      title: "Binary Modular Exponentiation",
      explanation: "Computes (A^B) % M in O(log B) steps by decomposing B into binary bits.",
      formula: "power(a, b, m)",
      timeComplexity: "O(log B)",
      spaceComplexity: "O(1)",
    },
    {
      title: "O(1) Binomial Coefficients (nCr)",
      explanation: "Computes n choose r in O(1) after O(N) precomputation of factorials and inverse factorials.",
      formula: "nCr = fact[n] * invFact[r] % M * invFact[n - r] % M",
      timeComplexity: "O(1) query, O(N) precompute",
      spaceComplexity: "O(N)",
    },
    {
      title: "Linear Inverses in O(N)",
      explanation: "Computes all inverses from 1 to N in linear time: inv[i] = M - (M/i) * inv[M%i] % M.",
      formula: "inv[i] = (M - M/i) * inv[M % i] % M",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
    {
      title: "Extended Euclidean Algorithm",
      explanation: "Finds modular inverse when modulo M is not necessarily prime, provided gcd(A, M) == 1.",
      formula: "a*x + b*y = gcd(a, b)",
      timeComplexity: "O(log(min(A, M)))",
      spaceComplexity: "O(1)",
    },
  ],
  recognitionSignals: [
    {
      triggerConstraint: "Answers required modulo 10^9+7 or 998244353",
      cue: "Modular arithmetic templates with 64-bit casting.",
    },
    {
      triggerConstraint: "Choosing K items from N items with N up to 10^6",
      cue: "Precomputed factorials and inverse factorials in O(N).",
    },
  ],
  stepByStepStrategy: [
    "1. Define Constant MOD: Declare `const int MOD = 1e9 + 7;` or `998244353;`.",
    "2. Negative Subtraction Guard: Always write `((a - b) % MOD + MOD) % MOD` to prevent negative remainder in C++.",
    "3. 64-Bit Multiplication: Cast `1LL * a * b % MOD` to avoid 32-bit overflow before modulo.",
    "4. Boundary Check: In `nCr(n, r)`, immediately return 0 if `r < 0 || r > n`.",
  ],
  codeTemplate: `#include <vector>
#include <iostream>

using namespace std;

const int MOD = 1e9 + 7;

long long power(long long base, long long exp) {
    long long res = 1;
    base %= MOD;
    while (exp > 0) {
        if (exp % 2 == 1) res = (res * base) % MOD;
        base = (base * base) % MOD;
        exp /= 2;
    }
    return res;
}

long long modInverse(long long n) {
    return power(n, MOD - 2);
}

struct Combinatorics {
    int maxN;
    vector<long long> fact, invFact;

    Combinatorics(int n) : maxN(n), fact(n + 1), invFact(n + 1) {
        fact[0] = 1;
        invFact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = (fact[i - 1] * i) % MOD;
        invFact[n] = modInverse(fact[n]);
        // Linear backward inverse factorial precomputation
        for (int i = n - 1; i >= 1; i--) invFact[i] = (invFact[i + 1] * (i + 1)) % MOD;
    }

    long long nCr(int n, int r) {
        if (r < 0 || r > n) return 0;
        return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
    }
};`,
  pitfalls: [
    "32-Bit Overflow in Multiplication: Multiplying two 32-bit ints near 10^9 produces 10^18, overflowing signed 32-bit int before `% MOD`. Always cast with `1LL * a * b`.",
    "Dividing by Modulo Directly: Writing `(a / b) % MOD` is mathematically invalid. You MUST compute `(a * modInverse(b)) % MOD`.",
    "Zero or Negative Bases: If base is negative, `base % MOD` is negative in C++. Always normalize: `base = (base % MOD + MOD) % MOD`.",
  ],
  practiceProblems: [
    {
      name: "Binomial Coefficients (CSES)",
      rating: 1200,
      url: "https://cses.fi/problemset/task/1715",
      platform: "CSES",
      hint: "Precompute factorials up to 10^6 and answer Q = 10^5 queries in O(1) each.",
    },
    {
      name: "Creating Strings II (CSES)",
      rating: 1300,
      url: "https://cses.fi/problemset/task/1716",
      platform: "CSES",
      hint: "Multinomial coefficients: N! / (c1! * c2! * ... * ck!) modulo 10^9+7.",
    },
    {
      name: "Santa's Bot (Codeforces)",
      rating: 1600,
      url: "https://codeforces.com/problemset/problem/1279/D",
      platform: "Codeforces",
      hint: "Probability calculations modulo 998244353 using modular inverses.",
    },
  ],
  deepExplanation: {
    intuition:
      "In competitive programming, combinatorial answers grow astronomically large (e.g. 100! has 158 digits). To prevent arbitrary-precision overhead, answers are computed in the finite Galois field Z/pZ modulo a large prime (typically 10^9 + 7 or 998244353). While addition, subtraction, and multiplication distribute cleanly over modulo, division is undefined because integers lack standard multiplicative inverses. We resolve division by multiplying by the unique modular multiplicative inverse b^(-1) such that b * b^(-1) ≡ 1 (mod p).",
    proofOfCorrectness:
      "Theorem (Fermat's Little Theorem & Inverse Factorial Invariance): (1) Let p be a prime number. For any integer a coprime to p, Fermat's Little Theorem states: a^(p-1) ≡ 1 (mod p). Multiplying both sides by a^(-1): a^(-1) ≡ a^(p-2) (mod p). Thus, computing a^(p-2) % p via binary exponentiation in O(log p) steps yields the exact unique multiplicative inverse in Z/pZ. (2) Linear Inverse Factorial Backward Precomputation: Let invFact[n] = (n!)^(-1) mod p. For any i < n: invFact[i] = (i!)^(-1) = ((i+1)!) / (i+1) ^ (-1) = invFact[i+1] * (i+1) (mod p). Hence, computing a single modular inverse for fact[N] in O(log p) allows deriving all remaining N - 1 inverse factorials in O(N) linear time, enabling O(1) evaluation of nCr(n, r) = fact[n] * invFact[r] * invFact[n-r] % p.",
    complexityDerivation:
      "Modular Exponentiation: Exactly ceil(log2 exp) iterations = 30 multiplications for exp = 10^9+5, taking ~20 nanoseconds. Combinatorics Precomputation: O(N) to compute fact[0..N] and invFact[0..N] linearly. Query Time: O(1) for nCr, nPr, or modular fraction evaluation. Space: O(N) 64-bit vectors.",
    whenNotToUse:
      "Do NOT use Fermat's Little Theorem if the modulus M is COMPOSITE (e.g. M = 10^9). In composite moduli, b^(M-2) is NOT the inverse; you must use the Extended Euclidean Algorithm (gcd(b, M) must equal 1) or Euler's Totient Theorem: b^(phi(M)-1) mod M. If gcd(b, M) > 1, no modular inverse exists.",
  },
  workedExample: {
    title: "Modular Inverse & Binomial Coefficient Trace (p = 7)",
    scenario: "Modulus p = 7. Compute 3^(-1) mod 7 and evaluate 5 choose 2 mod 7.",
    input: "p = 7, a = 3. Compute 3^(7 - 2) = 3^5 mod 7.",
    output: "3^(-1) ≡ 5 (mod 7). Check: 3 * 5 = 15 = 2 * 7 + 1 ≡ 1 (mod 7). 5C2 ≡ 3 (mod 7).",
    traceSteps: [
      { step: 1, state: "Binary Exponentiation 3^5 mod 7", action: "exp = 5 (binary 101_2). Base = 3, Res = 1.", insight: "Powers of two: 3^1, 3^2, 3^4" },
      { step: 2, state: "Bit 0 (exp % 2 == 1)", action: "res = (1 * 3) % 7 = 3. base = (3 * 3) % 7 = 9 % 7 = 2. exp = 2.", insight: "Accumulated 3^1" },
      { step: 3, state: "Bit 1 (exp % 2 == 0)", action: "res = 3. base = (2 * 2) % 7 = 4. exp = 1.", insight: "Squared base to 3^2 = 2" },
      { step: 4, state: "Bit 2 (exp % 2 == 1)", action: "res = (3 * 4) % 7 = 12 % 7 = 5. base = (4 * 4) % 7 = 2. exp = 0.", insight: "Result 3^5 % 7 = 5" },
      { step: 5, state: "Evaluate 5C2 mod 7", action: "fact[5]=120≡1. fact[2]=2. fact[3]=6≡-1. invFact[2]=2^(-1)=4. invFact[3]=6^(-1)=6. 5C2 = 1 * 4 * 6 = 24 % 7 = 3.", insight: "Verified: 5C2 = 10 ≡ 3 (mod 7)" },
    ],
  },
  trapAnalysis: [
    {
      trap: "Direct Division Modulo P: (a / b) % MOD",
      cause: "Dividing floating point or truncated integer before modulo yields mathematically false answers. (12 / 4) % 5 = 3, but (12 % 5) / 4 = 2 / 4 = 0.",
      fix: "Always convert division to multiplication by the modular inverse: `(a * modInverse(b)) % MOD`.",
      wrongSnippet: "long long ans = (fact[n] / fact[r]) % MOD; // Mathematically invalid!",
      correctedSnippet: "long long ans = (fact[n] * invFact[r]) % MOD; // Exact modular division",
    },
    {
      trap: "32-Bit Integer Multiplication Overflow Before Modulo",
      cause: "If a and b are 32-bit `int` with value ~10^9, their product `a * b` is ~10^18, overflowing signed 32-bit int BEFORE `% MOD` runs.",
      fix: "Cast to 64-bit integer: `(1LL * a * b) % MOD` or declare variables as `long long`.",
      wrongSnippet: "int c = (a * b) % MOD; // 32-bit overflow!",
      correctedSnippet: "int c = (1LL * a * b) % MOD; // 64-bit multiplication safe",
    },
    {
      trap: "Negative Modulo Remainder in Subtraction",
      cause: "In C++, `(-3) % 7` evaluates to `-3`, which corrupts index lookups and hash keys.",
      fix: "Always add MOD before applying modulo: `((a - b) % MOD + MOD) % MOD`.",
      wrongSnippet: "long long diff = (a - b) % MOD; // Can be negative!",
      correctedSnippet: "long long diff = ((a - b) % MOD + MOD) % MOD; // Guaranteed [0, MOD-1]",
    },
  ],
  pythonTemplate: `import sys

class Combinatorics:
    """Precomputed Factorials and Inverse Factorials in O(N) for O(1) nCr."""
    def __init__(self, n: int, mod: int = 10**9 + 7):
        self.mod = mod
        self.fact = [1] * (n + 1)
        self.inv_fact = [1] * (n + 1)

        for i in range(1, n + 1):
            self.fact[i] = (self.fact[i - 1] * i) % self.mod

        # Fermat's Little Theorem: pow(val, mod - 2, mod)
        self.inv_fact[n] = pow(self.fact[n], self.mod - 2, self.mod)
        for i in range(n - 1, 0, -1):
            self.inv_fact[i] = (self.inv_fact[i + 1] * (i + 1)) % self.mod

    def nCr(self, n: int, r: int) -> int:
        if r < 0 or r > n:
            return 0
        return (self.fact[n] * self.inv_fact[r] % self.mod) * self.inv_fact[n - r] % self.mod

    def nPr(self, n: int, r: int) -> int:
        if r < 0 or r > n:
            return 0
        return (self.fact[n] * self.inv_fact[n - r]) % self.mod

def solve():
    input = sys.stdin.readline
    q = int(input())
    comb = Combinatorics(1000000)
    
    out = []
    for _ in range(q):
        n, r = map(int, input().split())
        out.append(str(comb.nCr(n, r)))
        
    sys.stdout.write("\\n".join(out) + "\\n")

if __name__ == '__main__':
    solve()
`,
};
