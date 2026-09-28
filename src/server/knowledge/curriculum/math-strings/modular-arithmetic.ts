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
  conceptualTheory: `## Modular Arithmetic, Fermat's Inverse & Combinatorics: A Complete Textbook Chapter

### Why Modulo Exists in Competitive Programming

In competitive programming, combinatorial and dynamic programming answers grow at staggering rates:
- $10! = 3,628,800$
- $20! \approx 2.43 \times 10^{18}$ (approaching the maximum limit of an unsigned 64-bit integer, $1.84 \times 10^{19}$)
- $30! \approx 2.65 \times 10^{32}$ (completely overflows 64-bit hardware registers)
- The number of binary strings or grid paths of length $N = 10^5$ reaches $2^{100000}$, a number with over 30,000 decimal digits!

To prevent competitive programming from devolving into an arbitrary-precision "BigInteger" library implementation contest, problem setters require results modulo a large prime:
$$\text{Output the answer modulo } 10^9 + 7 \text{ (or } 998,244,353\text{)}$$

#### Why Are $10^9+7$ and $998,244,353$ the Universal Standards?
1. **Both are Prime Numbers**:
   Every non-zero integer $A \not\equiv 0 \pmod M$ has a unique modular multiplicative inverse by Fermat's Little Theorem. Division is always valid and well-defined!
2. **Fits in a Signed 32-bit Integer**:
   Both primes are $< 2^{31} - 1 \approx 2.14 \times 10^9$. A single variable fits comfortably in a standard 32-bit \`int\`.
3. **Product Fits in a Signed 64-bit Integer**:
   The maximum possible product of two numbers less than $M$ is:
   $$(M - 1) \times (M - 1) < M^2 \approx 10^{18} < 2^{63} - 1 \approx 9.22 \times 10^{18}$$
   This means intermediate multiplication \`1LL * a * b\` fits in standard \`long long\` without 128-bit hardware emulation!
4. **$998,244,353$ is an NTT Prime**:
   $998,244,353 = 119 \times 2^{23} + 1$. Its factorization contains a huge power of two ($2^{23}$), making it ideal for Number Theoretic Transforms (polynomial multiplication in $O(N \log N)$).

---

### The Fundamental Axioms of Modular Arithmetic

Two integers $A$ and $B$ are **congruent modulo $M$** (written $A \equiv B \pmod M$) if and only if their difference $A - B$ is an integer multiple of $M$:
$$A \equiv B \pmod M \iff M \mid (A - B)$$

#### The 3 Well-Behaved Operations: Addition, Subtraction, Multiplication
Modular reduction distributes cleanly over addition, subtraction, and multiplication:
1. **Addition**:
   $$(A + B) \pmod M = ((A \pmod M) + (B \pmod M)) \pmod M$$
2. **Subtraction (Watch Out for the Negative Modulo Trap!)**:
   $$(A - B) \pmod M = ((A \pmod M) - (B \pmod M) + M) \pmod M$$
   *Crucial Warning*: In C++ and Java, \`%\` is the **remainder** operator, NOT true mathematical modulo!
   In C++, \`(-5) % 3\` produces \`-2\`, not \`+1\`!
   To prevent negative results when subtracting under modulo, **always add $M$ before the final modulo**:
   \`long long diff = (a - b) % M; if (diff < 0) diff += M;\`
3. **Multiplication**:
   $$(A \times B) \pmod M = ((A \pmod M) \times (B \pmod M)) \pmod M$$
   *Crucial Warning*: If \`a\` and \`b\` are 32-bit \`int\`s, \`a * b\` evaluates as a 32-bit integer before the modulo, silently overflowing! Always write:
   \`long long prod = (1LL * a * b) % M;\`

---

### The Division Dilemma & Modular Multiplicative Inverse

Notice that division does **NOT** distribute under modulo:
$$\frac{A}{B} \pmod M \ne \frac{A \pmod M}{B \pmod M}$$

For example:
- $\frac{12}{3} = 4 \equiv 4 \pmod 5$.
- But $(12 \pmod 5) / (3 \pmod 5) = 2 / 3 = 0 \ne 4 \pmod 5$!
- Even worse, consider $(4 / 2) \pmod 4 = 2 \pmod 4$, but if we used $6 / 2 = 3$, $6 \equiv 2 \pmod 4$, yet $3 \not\equiv 1 \pmod 4$.

#### Defining the Modular Multiplicative Inverse
In standard arithmetic, dividing by $B$ is equivalent to multiplying by the reciprocal $B^{-1} = 1/B$, where $B \times B^{-1} = 1$.
In modular arithmetic, the **modular inverse** of $B$ modulo $M$ is defined as an integer $X$ such that:
$$B \times X \equiv 1 \pmod M$$
We denote this integer $X$ as $B^{-1}$.
Once $B^{-1}$ is known, **division becomes multiplication**:
$$\frac{A}{B} \equiv A \times B^{-1} \pmod M$$

#### When Does a Modular Inverse Exist? (Bézout's Theorem)
A modular inverse $B^{-1} \pmod M$ exists **if and only if $B$ and $M$ are coprime**:
$$\gcd(B, M) = 1$$
If $M$ is a prime number, every integer $B$ that is not a multiple of $M$ satisfies $\gcd(B, M) = 1$. Thus, for any prime modulo, every non-zero element has a unique modular inverse!

---

### Fermat's Little Theorem (Inverse in O(log M))

**Fermat's Little Theorem**: If $M$ is a prime number and $B$ is not divisible by $M$:
$$B^{M - 1} \equiv 1 \pmod M$$

#### Derivation of the Inverse Formula
Multiply both sides of Fermat's Little Theorem by $B^{-1}$:
$$B^{-1} \times B^{M - 1} \equiv B^{-1} \times 1 \pmod M$$
$$B^{M - 2} \equiv B^{-1} \pmod M$$

This is one of the most celebrated and useful results in all of computer science:
> **To divide by $B$ modulo prime $M$, simply raise $B$ to the power $M - 2$ modulo $M$!**
> $$\frac{A}{B} \pmod M = (A \times B^{M - 2}) \pmod M$$

---

### Binary Exponentiation: Fast Power in O(log P)

How do we compute $B^{M - 2} \pmod M$?
For $M = 10^9 + 7$, $M - 2 = 1,000,000,005$. A naive loop multiplying $B$ one billion times will take 2 seconds and TLE.
**Binary Exponentiation (Exponentiation by Squaring)** solves this in just 30 multiplications!

#### The Core Insight
Consider computing $3^{13}$:
The exponent $13$ in binary is $1101_2 = 8 + 4 + 1$.
$$3^{13} = 3^8 \times 3^4 \times 3^1$$
Instead of computing $3 \times 3 \times 3 \dots$, we repeatedly square the base:
- $3^1 = 3$
- $3^2 = 3^1 \times 3^1 = 9$
- $3^4 = 3^2 \times 3^2 = 81$
- $3^8 = 3^4 \times 3^4 = 6561$
We only include powers corresponding to the \`1\` bits in the binary representation of the exponent!

#### The Canonical C++ Implementation
\`\`\`cpp
long long power(long long base, long long exp) {
    long long res = 1;
    base %= MOD;
    while (exp > 0) {
        if (exp & 1) res = (1LL * res * base) % MOD;
        base = (1LL * base * base) % MOD;
        exp >>= 1;
    }
    return res;
}

long long modInverse(long long n) {
    return power(n, MOD - 2);
}
\`\`\`
**Complexity**: Exactly $\lfloor \log_2(\text{exp}) \rfloor + 1$ iterations. For $P = 10^9$, this is at most 30 steps — executing in mere nanoseconds!

---

### Binomial Coefficients (nCr) in O(1) Time

A ubiquitous problem in competitive programming:
*"Calculate $\binom{N}{R} = \frac{N!}{R! (N - R)!} \pmod M$ for $Q = 2 \times 10^5$ queries with $N \le 10^6$."*

If we compute $R!^{M-2}$ and $(N-R)!^{M-2}$ via binary exponentiation for each query:
$$O(Q \log M) \approx 2 \times 10^5 \times 30 = 6 \times 10^6 \text{ operations (Acceptable, but can be made 30x faster!)}$$

#### The O(N) Precomputation with Backward Linear Sweep Trick
We can answer EVERY query in strictly **$O(1)$ time** by precomputing:
1. $fact[i] = i! \pmod M$
2. $invFact[i] = (i!)^{-1} \pmod M$

**Step 1**: Precompute factorials in $O(N)$:
\`fact[0] = 1;\`
\`for (int i = 1; i <= N; i++) fact[i] = (fact[i - 1] * i) % MOD;\`

**Step 2**: Compute the inverse of the LAST factorial using ONE single binary exponentiation call:
\`invFact[N] = power(fact[N], MOD - 2);\`

**Step 3**: The Backward Sweep:
Notice the mathematical identity:
$$\frac{1}{(i - 1)!} = \frac{i}{i!} = i \times \frac{1}{i!}$$
Therefore:
$$invFact[i - 1] = (invFact[i] \times i) \pmod M$$
By sweeping backwards from $N$ down to $1$, we compute ALL $10^6$ inverse factorials using simple multiplications, **requiring only ONE binary exponentiation call in total!**

\`\`\`cpp
for (int i = N; i >= 1; i--) {
    invFact[i - 1] = (1LL * invFact[i] * i) % MOD;
}
\`\`\`

#### Answering Queries in O(1)
\`\`\`cpp
long long nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return 1LL * fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
}
\`\`\`

---

### Extended Euclidean Algorithm (Non-Prime Modulo)

What if the modulo $M$ is NOT prime (e.g. $M = 10^9$ or composite), but we still need to find $B^{-1} \pmod M$?
Fermat's Little Theorem fails when $M$ is composite!
Instead, we use the **Extended Euclidean Algorithm**:
By Bézout's Identity, for any integers $A$ and $B$, there exist integers $x$ and $y$ such that:
$$A \cdot x + B \cdot y = \gcd(A, B)$$
Setting $B = M$, if $\gcd(A, M) = 1$:
$$A \cdot x + M \cdot y = 1$$
Reducing this equation modulo $M$:
$$A \cdot x \equiv 1 \pmod M$$
The Bézout coefficient $x$ is precisely the modular inverse $A^{-1} \pmod M$!

\`\`\`cpp
long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long d = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - y1 * (a / b);
    return d;
}

long long modInverseComposite(long long a, long long m) {
    long long x, y;
    long long g = extgcd(a, m, x, y);
    if (g != 1) return -1; // Inverse does not exist (not coprime!)
    return (x % m + m) % m;
}
\`\`\`

---

### Linear Inverse of All Integers 1 to N in O(N)

If you need the inverses of all single numbers $1, 2, \dots, N$ (not factorials), you can compute them in $O(N)$ total without any logarithmic factors:

#### Mathematical Derivation
Let $M = q \times i + r$, where $q = \lfloor M / i \rfloor$ and $r = M \pmod i$.
Then:
$$q \times i + r \equiv 0 \pmod M$$
Multiply both sides by $i^{-1} \times r^{-1}$:
$$q \times r^{-1} + i^{-1} \equiv 0 \pmod M$$
$$i^{-1} \equiv -q \times r^{-1} \pmod M$$
Substituting $q = \lfloor M / i \rfloor$ and $r = M \pmod i$:
$$inv[i] = (M - \lfloor M / i \rfloor) \times inv[M \pmod i] \pmod M$$

\`\`\`cpp
vector<long long> inv(n + 1);
inv[1] = 1;
for (int i = 2; i <= n; i++) {
    inv[i] = (MOD - MOD / i) * inv[MOD % i] % MOD;
}
\`\`\`
Every inverse from $1$ to $N$ is computed in strictly $O(1)$ time per element!

---

### Contest Checklist & Common Traps

1. **Negative Modulo**: Never write \`(a - b) % MOD\`. Always write \`((a - b) % MOD + MOD) % MOD\`.
2. **64-bit Casting**: Never multiply two 32-bit values without casting: \`1LL * a * b % MOD\`.
3. **Division by Zero**: If $B \equiv 0 \pmod M$, modular inverse does NOT exist! Dividing by a multiple of $M$ causes undefined results.
4. **Boundary Checks in nCr**: Always guard against $r < 0$ and $r > n$ by returning $0$.
5. **$0^0$ Definition**: By convention in combinatorics, $0^0 = 1$ and $0! = 1$.`,
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
