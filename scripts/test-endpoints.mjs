const BASE = "http://localhost:3000";

const GET_ENDPOINTS = [
  // Core pages
  "/",
  "/mentor",
  "/virtual",
  "/contests",
  "/upsolve",
  "/topics",
  "/recommend",
  "/training",
  "/learn",
  "/revision",
  "/contests/2267",
  "/learn/binary-search-answer",

  // APIs
  "/api/user-data?handle=AC_on_first_TRY",
  "/api/user-data?handle=tourist",
  "/api/contests/2267?handle=AC_on_first_TRY",
  "/api/contests/970",
  "/api/analytics/topics?handle=AC_on_first_TRY",
  "/api/recommend?handle=AC_on_first_TRY&rating=994",
  "/api/training?handle=AC_on_first_TRY&rating=994",
  "/api/virtual-contests",
  "/api/concepts",
  "/api/concepts/binary-search-answer",
  "/api/revision",
];

async function run() {
  console.log("=== SMOKE TESTING ALL ENDPOINTS ===");
  let failures = 0;

  for (const path of GET_ENDPOINTS) {
    try {
      const res = await fetch(`${BASE}${path}`);
      const text = await res.text();
      let extra = "";
      if (res.headers.get("content-type")?.includes("json")) {
        try {
          const json = JSON.parse(text);
          extra = `(keys: ${Object.keys(json).join(", ")})`;
        } catch {
          extra = "(invalid json)";
        }
      } else {
        extra = `(html length: ${text.length})`;
      }

      if (res.ok) {
        console.log(`✅ [${res.status}] ${path} ${extra}`);
      } else {
        console.error(`❌ [${res.status}] ${path} ${extra}`);
        failures++;
      }
    } catch (err) {
      console.error(`❌ [EXCEPTION] ${path}: ${err.message}`);
      failures++;
    }
  }

  // Test POST endpoints
  console.log("\n=== TESTING POST ENDPOINTS ===");
  
  // 1. Sync
  try {
    const res = await fetch(`${BASE}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: "AC_on_first_TRY" }),
    });
    const json = await res.json();
    console.log(`✅ [/api/sync] Status: ${res.status}, success: ${json.success}`);
  } catch (e) {
    console.error(`❌ [/api/sync] ${e.message}`);
    failures++;
  }

  // 2. Mentor Chat
  try {
    const res = await fetch(`${BASE}/api/mentor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "How do I improve in greedy problems?" }],
        persona: "SOCRATIC",
        userRating: 994,
      }),
    });
    const json = await res.json();
    console.log(`✅ [/api/mentor/chat] Status: ${res.status}, response length: ${json.message?.content?.length || 0}`);
  } catch (e) {
    console.error(`❌ [/api/mentor/chat] ${e.message}`);
    failures++;
  }

  // 3. Mentor Code Review
  try {
    const res = await fetch(`${BASE}/api/mentor/code-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: `#include <bits/stdc++.h>\nusing namespace std;\nint main() { int n; cin >> n; cout << n << endl; }`,
        problemTitle: "Dr. Evil Underscores",
        problemTags: ["dp", "bitmasks"],
        problemRating: 1500,
        userRating: 994,
      }),
    });
    const json = await res.json();
    console.log(`✅ [/api/mentor/code-review] Status: ${res.status}, report verdict: ${json.report?.verdict || "OK"}`);
  } catch (e) {
    console.error(`❌ [/api/mentor/code-review] ${e.message}`);
    failures++;
  }

  // 4. Mentor Progressive Hints
  try {
    const res = await fetch(`${BASE}/api/mentor/hints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemKey: "970E",
        currentTier: "CONCEPTUAL",
      }),
    });
    const json = await res.json();
    console.log(`✅ [/api/mentor/hints] Status: ${res.status}, hints count: ${json.hints?.length || 0}`);
  } catch (e) {
    console.error(`❌ [/api/mentor/hints] ${e.message}`);
    failures++;
  }

  // 5. Virtual Contests session create & submit
  try {
    const startRes = await fetch(`${BASE}/api/virtual-contests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contestId: 970,
        scoringMode: "ICPC",
        userHandle: "AC_on_first_TRY",
        userRating: 994,
      }),
    });
    const session = await startRes.json();
    console.log(`✅ [/api/virtual-contests POST] Status: ${startRes.status}, sessionId: ${session.id}`);

    if (session.id) {
      // Submit code
      const subRes = await fetch(`${BASE}/api/virtual-contests/${session.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemIndex: "A",
          code: `#include <iostream>\nint main(){ std::cout << "YES\\n"; }`,
          language: "CPP",
        }),
      });
      const subJson = await subRes.json();
      console.log(`✅ [/api/virtual-contests/:id/submit] Status: ${subRes.status}, verdict: ${subJson.submission?.verdict}`);

      // Autopsy
      const autoRes = await fetch(`${BASE}/api/virtual-contests/${session.id}/autopsy`);
      console.log(`✅ [/api/virtual-contests/:id/autopsy] Status: ${autoRes.status}`);

      // Finish
      const finRes = await fetch(`${BASE}/api/virtual-contests/${session.id}/finish`, {
        method: "POST",
      });
      console.log(`✅ [/api/virtual-contests/:id/finish] Status: ${finRes.status}`);
    }
  } catch (e) {
    console.error(`❌ [/api/virtual-contests flow] ${e.message}`);
    failures++;
  }

  // 6. Revision SM-2 Review
  try {
    const revRes = await fetch(`${BASE}/api/revision/rev-1/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quality: 4 }),
    });
    const revJson = await revRes.json();
    console.log(`✅ [/api/revision/:id/review] Status: ${revRes.status}, easeFactor: ${revJson.card?.easeFactor}`);
  } catch (e) {
    console.error(`❌ [/api/revision/:id/review] ${e.message}`);
    failures++;
  }

  console.log(`\n=== RESULTS: ${failures === 0 ? "ALL CHECKS PASSED PERFECTLY 🎉" : `${failures} CHECKS FAILED`} ===`);
  process.exit(failures > 0 ? 1 : 0);
}

run();
