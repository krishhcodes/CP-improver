"use client";

import { useState, useEffect } from "react";
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                AI CP Mentor Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  Socratic Intelligence
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Deliberate algorithmic coaching, progressive spoiler-free hint tiers, and static code diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0a0f1d] border border-white/[0.08] p-1.5 rounded-xl self-start lg:self-auto">
          <span className="text-xs font-semibold text-zinc-400 px-2 uppercase tracking-wider text-[10px]">
            Persona:
          </span>
          <button
            onClick={() => setPersona("SOCRATIC")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
              persona === "SOCRATIC"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            🎓 Socratic
          </button>
          <button
            onClick={() => setPersona("STRICT_COACH")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
              persona === "STRICT_COACH"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            ⚡ Strict Coach
          </button>
          <button
            onClick={() => setPersona("DIAGNOSTICIAN")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
              persona === "DIAGNOSTICIAN"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
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
          <div className="glass-panel border border-white/[0.08] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Active Problem Focus
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
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
                    "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all text-center border",
                    selectedProblemIndex === idx
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.04]"
                  )}
                >
                  {p.key}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-white">{activeProblem.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeProblem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.05]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Tier Progressive Socratic Hint Drawer */}
          <div className="glass-panel border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Progressive Socratic Hints</h3>
              </div>
              <span className="text-[10px] text-zinc-400">Spoiler-Free Tiers</span>
            </div>

            {/* Display Unlocked Hints */}
            {hints.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-zinc-400">
                No hints unlocked yet. Solve on your own first, or unlock Tier 1 for the fundamental problem observation.
              </div>
            ) : (
              <div className="space-y-3">
                {hints.map((h) => (
                  <div
                    key={h.tier}
                    className="p-3.5 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-1.5 animate-fade-in"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400">
                        Tier {h.tier}: {h.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                        {h.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{h.content}</p>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `Let's discuss Tier ${h.tier} hint for ${activeProblem.name}: "${h.title}". What is the reasoning behind this invariant?`
                        )
                      }
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium pt-1 flex items-center gap-1 transition-colors"
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
                className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingHint ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lightbulb className="w-3.5 h-3.5" />
                    Unlock Tier {unlockedTier} Hint ({unlockedTier === 1 ? "Observation" : unlockedTier === 2 ? "Algorithm" : unlockedTier === 3 ? "Invariant Proof" : "Edge Cases"})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Instant Code Reviewer & Bug Diagnostic */}
          <div className="glass-panel border border-white/[0.08] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Static Code Review & Bug Diagnostic</h3>
              </div>
              <span className="text-[10px] text-zinc-400">C++ / Python / Java</span>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={8}
              placeholder="Paste your competitive programming solution here..."
              className="w-full bg-[#080d1a] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleAnalyzeCode}
                disabled={analyzingCode}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
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
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Send to Mentor Chat
              </button>
            </div>

            {/* Analysis Report Output */}
            {reviewReport && (
              <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    Est. Complexity: <strong className="text-white">{reviewReport.estimatedComplexity}</strong>
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      reviewReport.hasCriticalIssues
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    )}
                  >
                    {reviewReport.hasCriticalIssues ? "Hazards Detected" : "Clean Structure"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300">
                  <span className="font-semibold text-zinc-400 block text-[10px] uppercase mb-0.5">
                    Risk Verdict:
                  </span>
                  {reviewReport.verdictRisk}
                </div>

                {reviewReport.issues.map((iss, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-xl text-xs space-y-1 border",
                      iss.severity === "CRITICAL"
                        ? "bg-red-950/20 border-red-500/30 text-red-200"
                        : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                    )}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{iss.title}</span>
                      <span className="text-[10px] uppercase font-semibold">{iss.category}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">{iss.description}</p>
                    <div className="text-[11px] text-zinc-400 pt-1">
                      <strong className="text-zinc-200">Suggested Fix: </strong>
                      {iss.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Mentor Chat (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[750px] glass-panel border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-white">Mentor Intelligence Stream</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Active Persona: <strong className="text-indigo-400 capitalize">{persona.replace(/_/g, " ")}</strong>
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
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 space-y-2",
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20"
                        : "bg-white/[0.04] text-zinc-200 border border-white/[0.08] rounded-tl-none"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 pl-10">
                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Mentor is analyzing algorithmic structure...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase text-zinc-400 shrink-0">Prompts:</span>
            {[
              "Why did my solution TLE on test 4?",
              "Give me a gentle hint for Problem C",
              "Check my code for integer overflow",
              "How to improve my contest time management?",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-zinc-300 border border-white/[0.06] shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-white/[0.08] bg-[#070b14]">
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
                className="flex-1 bg-[#0a0f1e] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isThinking}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40"
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
