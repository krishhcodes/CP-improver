"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Bot,
  Sparkles,
  Send,
  Code2,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Zap,
  HelpCircle,
  FileCode,
  Flame,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CodeReviewReport,
  HintTierLevel,
  MentorChatMessage,
  MentorPersona,
  ProgressiveHint,
} from "@/server/mentor/types";

const PRESET_PROBLEMS = [
  {
    key: "970E",
    name: "Alternating String",
    rating: 1400,
    tags: ["greedy", "strings"],
    timeLimit: 2.0,
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Note: Fast IO missing!\n    int n;\n    cin >> n;\n    string s;\n    cin >> s;\n    \n    // Potential O(N^2) loop\n    int ans = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            // nested loop check\n        }\n    }\n    cout << ans << endl;\n    return 0;\n}`,
  },
  {
    key: "371C",
    name: "Hamburgers",
    rating: 1400,
    tags: ["binary search", "brute force"],
    timeLimit: 2.0,
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    string recipe;\n    cin >> recipe;\n    // Potential 32-bit overflow when multiplying high bounds!\n    int r;\n    cin >> r;\n    long long low = 0, high = 1e14;\n    return 0;\n}`,
  },
  {
    key: "279B",
    name: "Books",
    rating: 1400,
    tags: ["two pointers", "binary search"],
    timeLimit: 2.0,
    sampleCode: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n, t;\n    cin >> n >> t;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    \n    int l = 0, currentSum = 0, maxBooks = 0;\n    for (int r = 0; r < n; r++) {\n        currentSum += a[r];\n        while (currentSum > t) {\n            currentSum -= a[l];\n            l++;\n        }\n        maxBooks = max(maxBooks, r - l + 1);\n    }\n    cout << maxBooks << "\\n";\n    return 0;\n}`,
  },
];

export default function MentorStudio() {
  const { profile, topicWeaknesses, recentSubmissions } = useUser();
  const [persona, setPersona] = useState<MentorPersona>("SOCRATIC");
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `Hello ${profile.handle}! I am your AI Competitive Programming Mentor. I know your current rating is **${profile.rating}** (${profile.rank}) and I have analyzed your recent contest and practice submissions.\n\nAsk me for progressive hints, paste your code for an instant bug diagnosis, or ask why your solution is encountering TLE/WA!`,
        timestampSeconds: Math.floor(Date.now() / 1000),
      },
    ]);
  }, [profile.handle, profile.rating, profile.rank]);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Progressive Hinting State
  const [unlockedTier, setUnlockedTier] = useState<HintTierLevel>(1);
  const [hints, setHints] = useState<ProgressiveHint[]>([]);
  const [loadingHint, setLoadingHint] = useState(false);

  // Code Review State
  const activeProblem = PRESET_PROBLEMS[selectedProblemIndex];
  const [sourceCode, setSourceCode] = useState(activeProblem.sampleCode);
  const [reviewReport, setReviewReport] = useState<CodeReviewReport | null>(null);
  const [analyzingCode, setAnalyzingCode] = useState(false);

  // Unlock next hint tier
  const handleUnlockNextHint = async () => {
    setLoadingHint(true);
    try {
      const res = await fetch("/api/mentor/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemKey: activeProblem.key,
          tier: unlockedTier,
          tags: activeProblem.tags,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch hint");
      const hintData: ProgressiveHint = await res.json();

      setHints((prev) => [...prev.filter((h) => h.tier !== hintData.tier), hintData]);
      if (unlockedTier < 4) {
        setUnlockedTier((prev) => (prev + 1) as HintTierLevel);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHint(false);
    }
  };

  // Run Code Review
  const handleAnalyzeCode = async () => {
    setAnalyzingCode(true);
    try {
      const res = await fetch("/api/mentor/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: sourceCode,
          problemRating: activeProblem.rating,
          expectedN: 200000,
        }),
      });

      if (!res.ok) throw new Error("Code analysis failed");
      const report: CodeReviewReport = await res.json();
      setReviewReport(report);
    } catch (err) {
      console.error(err);
      alert("Error analyzing code.");
    } finally {
      setAnalyzingCode(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isThinking) return;

    const userMsg: MentorChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestampSeconds: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          persona,
          context: {
            handle: profile.handle,
            rating: profile.rating,
            weakestTopics: topicWeaknesses.slice(0, 3).map((t) => ({
              topic: t.tag,
              score: t.weaknessScore,
            })),
            recentSubmissions: recentSubmissions.slice(0, 5).map((s) => ({
              problemName: s.problemName,
              verdict: s.verdict,
              rating: s.problemRating,
            })),
            currentProblem: {
              index: activeProblem.key.split("-")[1] || "A",
              name: activeProblem.name,
              rating: activeProblem.rating,
              tags: activeProblem.tags,
              timeLimitSeconds: activeProblem.timeLimit,
            },
          },
          currentProblem: {
            name: activeProblem.name,
            rating: activeProblem.rating,
            tags: activeProblem.tags,
          },
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();

      const assistantMsg: MentorChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestampSeconds: data.timestamp,
        persona,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Please check your query or verify your connection.",
          timestampSeconds: Math.floor(Date.now() / 1000),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                AI CP Mentor Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                  Socratic Intelligence
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Deliberate algorithmic coaching, progressive spoiler-free hint tiers, and static code diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1.5 rounded-xl self-start lg:self-auto shadow-xs">
          <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider text-[10px]">
            Persona:
          </span>
          <button
            onClick={() => setPersona("SOCRATIC")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
              persona === "SOCRATIC"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            🎓 Socratic
          </button>
          <button
            onClick={() => setPersona("STRICT_COACH")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
              persona === "STRICT_COACH"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            ⚡ Strict Coach
          </button>
          <button
            onClick={() => setPersona("DIAGNOSTICIAN")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
              persona === "DIAGNOSTICIAN"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            🔬 Diagnostician
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Panel (Hints & Code Review) & Right Panel (Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Problem Context, Hint Drawer & Code Reviewer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Problem Selector Card */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Problem Focus
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                {activeProblem.rating} Rating
              </span>
            </div>

            <div className="flex gap-2">
              {PRESET_PROBLEMS.map((p, idx) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setSelectedProblemIndex(idx);
                    setSourceCode(p.sampleCode);
                    setHints([]);
                    setUnlockedTier(1);
                    setReviewReport(null);
                  }}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border shadow-xs",
                    selectedProblemIndex === idx
                      ? "bg-sky-50 text-sky-800 border-sky-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                  )}
                >
                  {p.key}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-extrabold text-slate-900">{activeProblem.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeProblem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Tier Progressive Socratic Hint Drawer */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Progressive Socratic Hints</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Spoiler-Free Tiers</span>
            </div>

            {/* Display Unlocked Hints */}
            {hints.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                No hints unlocked yet. Solve on your own first, or unlock Tier 1 for the fundamental problem observation.
              </div>
            ) : (
              <div className="space-y-3">
                {hints.map((h) => (
                  <div
                    key={h.tier}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 animate-fade-in shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">
                        Tier {h.tier}: {h.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase border border-amber-300">
                        {h.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{h.content}</p>
                    {h.textbookCitation && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{h.textbookCitation.book} ({h.textbookCitation.chapter})</span>
                        </div>
                        <Link
                          href={`/learn/${h.textbookCitation.learnSlug}`}
                          className="text-amber-800 hover:text-amber-950 font-bold underline underline-offset-2 flex items-center gap-0.5 shrink-0 ml-2"
                        >
                          <span>Study Theory</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Let's discuss Tier ${h.tier} hint for ${activeProblem.name}: "${h.title}". What is the reasoning behind this invariant?`
                        )
                      }
                      className="text-[11px] text-sky-700 hover:text-sky-800 font-bold pt-1 flex items-center gap-1 transition-colors"
                    >
                      Discuss hint with mentor <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Unlock Next Tier Button */}
            {hints.length < 4 && (
              <button
                onClick={handleUnlockNextHint}
                disabled={loadingHint}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs"
              >
                {loadingHint ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    Unlock Tier {unlockedTier} Hint ({unlockedTier === 1 ? "Observation" : unlockedTier === 2 ? "Algorithm" : unlockedTier === 3 ? "Invariant Proof" : "Edge Cases"})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Instant Code Reviewer & Bug Diagnostic */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Static Code Review & Bug Diagnostic</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">C++ / Python / Java</span>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={8}
              placeholder="Paste your competitive programming solution here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-500 transition-colors leading-relaxed shadow-xs"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleAnalyzeCode}
                disabled={analyzingCode}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {analyzingCode ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    Analyze Code for Bugs
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  handleSendMessage(
                    `Can you review this solution code for ${activeProblem.name} (${activeProblem.rating}) and identify any complexity traps, potential TLE, or 32-bit overflow errors?\n\n\`\`\`cpp\n${sourceCode}\n\`\`\``
                  )
                }
                className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors"
              >
                Send to Mentor Chat
              </button>
            </div>

            {/* Analysis Report Output */}
            {reviewReport && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Est. Complexity: <strong className="text-slate-900">{reviewReport.estimatedComplexity}</strong>
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-xs",
                      reviewReport.hasCriticalIssues
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    )}
                  >
                    {reviewReport.hasCriticalIssues ? "Hazards Detected" : "Clean Structure"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase mb-0.5">
                    Risk Verdict:
                  </span>
                  {reviewReport.verdictRisk}
                </div>

                {reviewReport.issues.map((iss, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-xl text-xs space-y-1 border shadow-xs",
                      iss.severity === "CRITICAL"
                        ? "bg-rose-50/80 border-rose-200 text-rose-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    )}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{iss.title}</span>
                      <span className="text-[10px] uppercase font-bold">{iss.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{iss.description}</p>
                    <div className="text-[11px] text-slate-600 pt-1">
                      <strong className="text-slate-900 font-bold">Suggested Fix: </strong>
                      {iss.suggestedFix}
                    </div>
                    {iss.textbookCitation && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{iss.textbookCitation.book} &bull; {iss.textbookCitation.chapter}</span>
                        </div>
                        <Link
                          href={`/learn/${iss.textbookCitation.learnSlug}`}
                          className="text-sky-700 hover:text-sky-800 font-bold underline underline-offset-2 flex items-center gap-0.5 shrink-0 ml-2"
                        >
                          <span>Read Guide</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Mentor Chat (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[750px] bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-900">Mentor Intelligence Stream</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Active Persona: <strong className="text-sky-700 capitalize font-bold">{persona.replace(/_/g, " ")}</strong>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={cn("flex gap-3 text-xs leading-relaxed animate-fade-in", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4 text-sky-700" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 space-y-2",
                      isUser
                        ? "bg-sky-600 text-white rounded-tr-none shadow-sm font-medium"
                        : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-medium shadow-xs"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
                <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span>Mentor is analyzing algorithmic structure...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Prompts:</span>
            {[
              "Why did my solution TLE on test 4?",
              "Give me a gentle hint for Problem C",
              "Check my code for integer overflow",
              "How to improve my contest time management?",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] text-slate-600 font-semibold border border-slate-200 shrink-0 transition-colors shadow-xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${persona.replace(/_/g, " ").toLowerCase()} mentor about an algorithm, time complexity, or hint...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors shadow-xs"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isThinking}
                className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
