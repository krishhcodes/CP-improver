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
};
