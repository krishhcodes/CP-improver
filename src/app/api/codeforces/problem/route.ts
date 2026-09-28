import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ProblemRepository } from "@/server/db/repositories/problem-repo";
import { CODEFORCES_REQUEST_HEADERS } from "@/server/codeforces/cf-headers";

export interface ParsedCFQuery {
  contestId: number;
  index: string;
}

export function parseCodeforcesInput(input: string): ParsedCFQuery | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // URL pattern 1: /contest/1800/problem/E2 or /gym/102000/problem/A
  const urlMatch1 = trimmed.match(/(?:contest|gym)\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
  if (urlMatch1) {
    return {
      contestId: parseInt(urlMatch1[1], 10),
      index: urlMatch1[2].toUpperCase(),
    };
  }

  // URL pattern 2: /problemset/problem/1800/E2
  const urlMatch2 = trimmed.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
  if (urlMatch2) {
    return {
      contestId: parseInt(urlMatch2[1], 10),
      index: urlMatch2[2].toUpperCase(),
    };
  }

  // Short ID pattern: 1800E2, 1800/E2, 1800-E2, 1800 E2, 4A, 71A
  const shortMatch = trimmed.match(/^(\d+)\s*[\/_\-\s]?\s*([A-Za-z]+[0-9]*)$/i);
  if (shortMatch) {
    return {
      contestId: parseInt(shortMatch[1], 10),
      index: shortMatch[2].toUpperCase(),
    };
  }

  return null;
}

function generateStarterCode(
  name: string,
  contestId: number,
  index: string,
  rating: number,
  tags: string[],
  url: string
): string {
  const tagList = tags.length > 0 ? tags.join(", ") : "implementation";
  return `// Problem: ${name}
// Contest: Codeforces ${contestId} (Problem ${index})
// Rating:  ${rating}
// Tags:    ${tagList}
// URL:     ${url}

#include <bits/stdc++.h>
using namespace std;

void solve() {
    // Write your solution for Codeforces ${contestId}${index} here
    
}

int main() {
    // Fast I/O for competitive programming
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // Uncomment if multi-testcase problem:
    // cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
`;
}

// Built-in presets map for instant resolution
const PRESET_LOOKUP: Record<
  string,
  {
    key: string;
    contestId: number;
    index: string;
    name: string;
    rating: number;
    tags: string[];
    timeLimit: number;
    url: string;
    sampleCode: string;
  }
> = {
  "970E": {
    key: "970E",
    contestId: 2008,
    index: "E",
    name: "Alternating String",
    rating: 1500,
    tags: ["greedy", "strings", "dp", "brute force"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/2008/problem/E",
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Note: Fast IO missing!\n    int n;\n    cin >> n;\n    string s;\n    cin >> s;\n    \n    // Potential O(N^2) loop\n    int ans = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            // nested loop check\n        }\n    }\n    cout << ans << endl;\n    return 0;\n}`,
  },
  "2008E": {
    key: "2008E",
    contestId: 2008,
    index: "E",
    name: "Alternating String",
    rating: 1500,
    tags: ["greedy", "strings", "dp", "brute force"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/2008/problem/E",
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Note: Fast IO missing!\n    int n;\n    cin >> n;\n    string s;\n    cin >> s;\n    \n    // Potential O(N^2) loop\n    int ans = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            // nested loop check\n        }\n    }\n    cout << ans << endl;\n    return 0;\n}`,
  },
  "371C": {
    key: "371C",
    contestId: 371,
    index: "C",
    name: "Hamburgers",
    rating: 1600,
    tags: ["binary search", "brute force"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/371/problem/C",
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    string recipe;\n    cin >> recipe;\n    // Potential 32-bit overflow when multiplying high bounds!\n    int r;\n    cin >> r;\n    long long low = 0, high = 1e14;\n    return 0;\n}`,
  },
  "279B": {
    key: "279B",
    contestId: 279,
    index: "B",
    name: "Books",
    rating: 1400,
    tags: ["two pointers", "binary search", "greedy"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/279/problem/B",
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n, t;\n    cin >> n >> t;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    \n    int l = 0, currentSum = 0, maxBooks = 0;\n    for (int r = 0; r < n; r++) {\n        currentSum += a[r];\n        while (currentSum > t) {\n            currentSum -= a[l];\n            l++;\n        }\n        maxBooks = max(maxBooks, r - l + 1);\n    }\n    cout << maxBooks << "\\n";\n    return 0;\n}`,
  },
};

async function fetchFromCodeforcesAPI(contestId: number, index: string) {
  // Method 1: contest.standings is fast, specific, and doesn't load 9000 problems
  try {
    const res = await fetch(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}`,
      {
        headers: CODEFORCES_REQUEST_HEADERS,
        next: { revalidate: 3600 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK" && Array.isArray(data.result?.problems)) {
        const p = data.result.problems.find(
          (x: any) => String(x.index).toUpperCase() === index
        );
        if (p) return p;
      }
    }
  } catch (err) {
    console.warn(`[CF Problem API] contest.standings fetch error for ${contestId}:`, err);
  }

  // Method 2: problemset.problems fallback
  try {
    const res = await fetch("https://codeforces.com/api/problemset.problems", {
      headers: CODEFORCES_REQUEST_HEADERS,
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK" && Array.isArray(data.result?.problems)) {
        // Direct contestId and index match
        let p = data.result.problems.find(
          (x: any) => x.contestId === contestId && String(x.index).toUpperCase() === index
        );
        if (p) return p;

        // Partial contestId match (e.g. user entered round number like 970 for contest 2008)
        p = data.result.problems.find(
          (x: any) =>
            String(x.index).toUpperCase() === index &&
            String(x.contestId).includes(String(contestId))
        );
        if (p) return p;
      }
    }
  } catch (err) {
    console.warn(`[CF Problem API] problemset.problems fetch error:`, err);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || searchParams.get("id") || "";

  return handleProblemLookup(query);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = body.query || body.id || body.problemKey || "";

  return handleProblemLookup(query);
}

async function handleProblemLookup(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return NextResponse.json(
      { success: false, error: "Please provide a Codeforces problem ID or URL." },
      { status: 400 }
    );
  }

  // Check preset lookup
  const normalizedKey = trimmed.toUpperCase().replace(/[\s\-_/]/g, "");
  if (PRESET_LOOKUP[normalizedKey]) {
    return NextResponse.json({
      success: true,
      problem: PRESET_LOOKUP[normalizedKey],
    });
  }

  // Parse input
  const parsed = parseCodeforcesInput(trimmed);
  if (!parsed) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid problem format. Use format like 1800E2, 71A, 4A, or paste a Codeforces URL.",
      },
      { status: 400 }
    );
  }

  const { contestId, index } = parsed;
  const canonicalKey = `${contestId}${index}`;

  // Check database first
  try {
    const dbProblem = await ProblemRepository.findByContestAndIndex(contestId, index);
    if (dbProblem) {
      const tags = dbProblem.tags.map((t) => t.tag);
      const url =
        dbProblem.url || `https://codeforces.com/contest/${contestId}/problem/${index}`;
      return NextResponse.json({
        success: true,
        problem: {
          key: canonicalKey,
          contestId,
          index,
          name: dbProblem.name,
          rating: dbProblem.rating || 1400,
          tags,
          timeLimit: 2.0,
          url,
          sampleCode: generateStarterCode(
            dbProblem.name,
            contestId,
            index,
            dbProblem.rating || 1400,
            tags,
            url
          ),
        },
      });
    }
  } catch (dbErr) {
    console.warn("[CF Problem API] Database cache lookup skipped:", dbErr);
  }

  // Fetch live from Codeforces API
  const cfProblem = await fetchFromCodeforcesAPI(contestId, index);
  if (!cfProblem) {
    return NextResponse.json(
      {
        success: false,
        error: `Could not find problem ${canonicalKey} on Codeforces. Verify the contest ID and problem index (e.g. 1800E2, 71A).`,
      },
      { status: 404 }
    );
  }

  const name = cfProblem.name || `Problem ${index}`;
  const rating = Number(cfProblem.rating) || 1400;
  const tags: string[] = Array.isArray(cfProblem.tags) ? cfProblem.tags : [];
  const url = `https://codeforces.com/contest/${cfProblem.contestId || contestId}/problem/${index}`;
  const sampleCode = generateStarterCode(
    name,
    cfProblem.contestId || contestId,
    index,
    rating,
    tags,
    url
  );

  // Cache in DB asynchronously if possible
  try {
    await ProblemRepository.upsertProblemWithTags({
      codeforcesContestId: cfProblem.contestId || contestId,
      index,
      name,
      rating,
      tags,
    });
  } catch (err) {
    // Non-blocking caching failure
    console.warn("[CF Problem API] Could not cache problem in DB:", err);
  }

  return NextResponse.json({
    success: true,
    problem: {
      key: `${cfProblem.contestId || contestId}${index}`,
      contestId: cfProblem.contestId || contestId,
      index,
      name,
      rating,
      tags,
      timeLimit: 2.0,
      url,
      sampleCode,
    },
  });
}
