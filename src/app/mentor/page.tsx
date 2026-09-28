"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Bot,
  Sparkles,
  Send,
  Code2,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Zap,
  ChevronRight,
  BookOpen,
  Search,
  ExternalLink,
  RefreshCw,
  Target,
  Globe,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CodeReviewReport,
  HintTierLevel,
  MentorChatMessage,
  MentorPersona,
  ProgressiveHint,
} from "@/server/mentor/types";

interface ProblemFocus {
  key: string;
  name: string;
  rating: number;
  tags: string[];
  timeLimit: number;
  url: string;
  sampleCode: string;
}

const PRESET_PROBLEMS: ProblemFocus[] = [
  {
    key: "970E",
    name: "Alternating String",
    rating: 1400,
    tags: ["greedy", "strings"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/2008/problem/E",
    sampleCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Note: Fast IO missing!
    int n;
    cin >> n;
    string s;
    cin >> s;
    
    // Potential O(N^2) loop
    int ans = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            // nested loop check
        }
    }
    cout << ans << endl;
    return 0;
}`,
  },
  {
    key: "371C",
    name: "Hamburgers",
    rating: 1400,
    tags: ["binary search", "brute force"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/371/problem/C",
    sampleCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string recipe;
    cin >> recipe;
    // Potential 32-bit overflow when multiplying high bounds!
    int r;
    cin >> r;
    long long low = 0, high = 1e14;
    return 0;
}`,
  },
  {
    key: "279B",
    name: "Books",
    rating: 1400,
    tags: ["two pointers", "binary search"],
    timeLimit: 2.0,
    url: "https://codeforces.com/contest/279/problem/B",
    sampleCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, t;
    cin >> n >> t;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    
    int l = 0, currentSum = 0, maxBooks = 0;
    for (int r = 0; r < n; r++) {
        currentSum += a[r];
        while (currentSum > t) {
            currentSum -= a[l];
            l++;
        }
        maxBooks = max(maxBooks, r - l + 1);
    }
    cout << maxBooks << "\\n";
    return 0;
}`,
  },
];

function MentorStudioContent() {
  const { profile, topicWeaknesses, recentSubmissions } = useUser();
  const searchParams = useSearchParams();
  const [persona, setPersona] = useState<MentorPersona>("SOCRATIC");

  // Problem Focus State
  const [problems, setProblems] = useState<ProblemFocus[]>(PRESET_PROBLEMS);
  const [activeProblemKey, setActiveProblemKey] = useState<string>(PRESET_PROBLEMS[0].key);
  const activeProblem =
    problems.find((p) => p.key.toUpperCase() === activeProblemKey.toUpperCase()) || problems[0];

  // Codeforces Search Input State
  const [cfInput, setCfInput] = useState("");
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Progressive Hinting State
  const [unlockedTier, setUnlockedTier] = useState<HintTierLevel>(1);
  const [hints, setHints] = useState<ProgressiveHint[]>([]);
  const [loadingHint, setLoadingHint] = useState(false);

  // Code Review State
  const [sourceCode, setSourceCode] = useState(activeProblem.sampleCode);
  const [reviewReport, setReviewReport] = useState<CodeReviewReport | null>(null);
  const [analyzingCode, setAnalyzingCode] = useState(false);

  // AI Provider & Key State
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    provider?: string;
    model?: string;
    maskedKey?: string;
  }>({ configured: false });
  const [showAiModal, setShowAiModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  // Fetch AI status on mount
  const checkAiStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/mentor/api-key");
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (e) {
      console.warn("Could not check AI key status:", e);
    }
  }, []);

  useEffect(() => {
    checkAiStatus();
  }, [checkAiStatus]);

  // Handle saving API key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || isSavingKey) return;
    setIsSavingKey(true);
    setKeySaveMessage(null);

    try {
      const res = await fetch("/api/mentor/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to connect API key.");
      }

      setKeySaveMessage(`Successfully connected to ${data.provider.toUpperCase()}! Real AI is now active.`);
      setApiKeyInput("");
      await checkAiStatus();

      // Notify in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-conn-${Date.now()}`,
          role: "assistant",
          content: `⚡ **Real AI Successfully Connected (${data.provider.toUpperCase()})!**\n\nI am now running live neural algorithmic intelligence. Ask me any competitive programming question, deep-dive into invariants, or request step-by-step Socratic walkthroughs!`,
          timestampSeconds: Math.floor(Date.now() / 1000),
        },
      ]);

      setTimeout(() => {
        setShowAiModal(false);
        setKeySaveMessage(null);
      }, 1500);
    } catch (err: any) {
      setKeySaveMessage(`Error: ${err.message}`);
    } finally {
      setIsSavingKey(false);
    }
  };

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `Hello ${profile.handle}! I am your AI Competitive Programming Mentor. I know your current rating is **${profile.rating}** (${profile.rank}) and I have analyzed your recent contest and practice submissions.\n\nAsk me for progressive hints, paste your code for an instant bug diagnosis, or set any Codeforces problem into focus above!`,
        timestampSeconds: Math.floor(Date.now() / 1000),
      },
    ]);
  }, [profile.handle, profile.rating, profile.rank]);

  // Select an existing problem
  const selectProblem = (problem: ProblemFocus) => {
    setActiveProblemKey(problem.key);
    setSourceCode(problem.sampleCode);
    setHints([]);
    setUnlockedTier(1);
    setReviewReport(null);
    setFetchError(null);

    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: "assistant",
        content: `Switched active focus to **${problem.key} — ${problem.name}** (${problem.rating} Rating).\n\n• **Tags**: ${
          problem.tags.map((t) => `\`#${t}\``).join(" ") || "General"
        }\n• Optimized starter code loaded. Ask me for progressive hints or submit your code for algorithmic diagnostics!`,
        timestampSeconds: Math.floor(Date.now() / 1000),
      },
    ]);
  };

  // Fetch and focus a problem from Codeforces
  const fetchAndSetProblem = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsFetchingProblem(true);
    setFetchError(null);

    try {
      const res = await fetch("/api/codeforces/problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.problem) {
        throw new Error(data.error || `Could not find problem "${trimmed}" on Codeforces.`);
      }

      const fetchedProblem: ProblemFocus = {
        key: data.problem.key,
        name: data.problem.name,
        rating: data.problem.rating,
        tags: data.problem.tags,
        timeLimit: data.problem.timeLimit || 2.0,
        url: data.problem.url,
        sampleCode: data.problem.sampleCode,
      };

      setProblems((prev) => {
        const filtered = prev.filter(
          (p) => p.key.toUpperCase() !== fetchedProblem.key.toUpperCase()
        );
        return [fetchedProblem, ...filtered];
      });

      setActiveProblemKey(fetchedProblem.key);
      setSourceCode(fetchedProblem.sampleCode);
      setHints([]);
      setUnlockedTier(1);
      setReviewReport(null);
      setCfInput("");

      setMessages((prev) => [
        ...prev,
        {
          id: `cf-focus-${Date.now()}`,
          role: "assistant",
          content: `🎯 **Problem in focus set from Codeforces: ${fetchedProblem.key} — ${fetchedProblem.name}**\n\n• **Difficulty Rating**: ${fetchedProblem.rating}\n• **Algorithmic Topics**: ${
            fetchedProblem.tags.map((t: string) => `\`#${t}\``).join(" ") || "General"
          }\n• [Open problem statement on Codeforces ↗](${fetchedProblem.url})\n\nI have loaded an optimized starter template with Fast I/O into your code diagnostics editor. Feel free to ask for progressive hint tiers, discuss invariants, or verify edge cases!`,
          timestampSeconds: Math.floor(Date.now() / 1000),
        },
      ]);
    } catch (err: any) {
      console.error("Failed to fetch CF problem:", err);
      setFetchError(err.message || "Failed to set problem from Codeforces.");
    } finally {
      setIsFetchingProblem(false);
    }
  }, []);

  // Form submit handler
  const handleSetProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfInput.trim() || isFetchingProblem) return;
    fetchAndSetProblem(cfInput);
  };

  // Handle URL query parameter `?problem=...` once on mount
  const initialHandled = useRef(false);
  useEffect(() => {
    if (initialHandled.current) return;
    const initialQuery = searchParams.get("problem");
    if (initialQuery) {
      initialHandled.current = true;
      fetchAndSetProblem(initialQuery);
    }
  }, [searchParams, fetchAndSetProblem]);

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
              index: activeProblem.key.replace(/^\d+/, "") || "A",
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
          {/* Active Problem Focus Card */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
            {/* Header with Title and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Problem Focus
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-sky-500" />
                  Codeforces
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {activeProblem.rating} Rating
                </span>
                {activeProblem.url && (
                  <a
                    href={activeProblem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-semibold flex items-center gap-1 transition-colors"
                    title="Open problem on Codeforces"
                  >
                    <span>CF</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Set Problem from Codeforces Input Bar */}
            <form onSubmit={handleSetProblemSubmit} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={cfInput}
                    onChange={(e) => {
                      setCfInput(e.target.value);
                      if (fetchError) setFetchError(null);
                    }}
                    placeholder="Enter CF ID (e.g. 1800E2, 71A, 4A) or paste URL..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-xs"
                  />
                  {cfInput && (
                    <button
                      type="button"
                      onClick={() => setCfInput("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!cfInput.trim() || isFetchingProblem}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shrink-0"
                >
                  {isFetchingProblem ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      <span>Focus Problem</span>
                    </>
                  )}
                </button>
              </div>

              {fetchError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between animate-fade-in font-medium">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFetchError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2"
                  >
                    &times;
                  </button>
                </div>
              )}
            </form>

            {/* Selectable Problem Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span className="uppercase tracking-wider">Quick Switch</span>
                <span>{problems.length} problems loaded</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {problems.map((p) => {
                  const isSelected = activeProblem.key.toUpperCase() === p.key.toUpperCase();
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => selectProblem(p)}
                      className={cn(
                        "py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center border shadow-xs flex items-center gap-1.5",
                        isSelected
                          ? "bg-sky-50 text-sky-800 border-sky-300 ring-2 ring-sky-400/20"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900"
                      )}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                      <span>{p.key}</span>
                      <span className="text-[10px] opacity-70 font-normal">({p.rating})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Problem Meta Details */}
            <div className="pt-2 border-t border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{activeProblem.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                    CF {activeProblem.key}
                  </span>
                </div>
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

              {activeProblem.url && (
                <a
                  href={activeProblem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0 border border-slate-200"
                >
                  <span>Statement</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
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
                No hints unlocked yet for <strong>{activeProblem.name}</strong>. Solve on your own first, or unlock Tier 1 for the fundamental problem observation.
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSourceCode(activeProblem.sampleCode)}
                  className="text-[10px] text-slate-400 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors"
                  title="Reset code to current problem template"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Starter</span>
                </button>
                <span className="text-[10px] text-slate-400 font-semibold">C++ / Python / Java</span>
              </div>
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
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", aiStatus.configured ? "bg-emerald-400" : "bg-amber-400")}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", aiStatus.configured ? "bg-emerald-500" : "bg-amber-500")}></span>
              </span>
              <span className="text-xs font-bold text-slate-900">Mentor Intelligence Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-xs",
                  aiStatus.configured
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse"
                )}
                title="Configure Live Real AI Key"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{aiStatus.configured ? `Live AI: ${aiStatus.provider?.toUpperCase()}` : "Connect Real AI"}</span>
              </button>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Persona: <strong className="text-sky-700 capitalize font-bold">{persona.replace(/_/g, " ")}</strong>
              </div>
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
              `Explain the optimal approach for ${activeProblem.name}`,
              `What is the time complexity bottleneck for ${activeProblem.key}?`,
              "Check my code for integer overflow",
              "Give me a gentle hint for this problem",
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
      {/* Real AI API Key Configuration Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-sky-600 fill-sky-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Connect Real AI Engine</h3>
                  <p className="text-[11px] text-slate-500">Google Gemini &bull; OpenAI &bull; Groq</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-base transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Active Engine:</span>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-bold border",
                    aiStatus.configured
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  )}
                >
                  {aiStatus.configured
                    ? `${aiStatus.provider?.toUpperCase()} (${aiStatus.maskedKey})`
                    : "Deterministic Heuristic"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect your API key to activate live reasoning, tailored Socratic hints, algorithm invariant derivations, and deep code diagnostics.
              </p>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste Gemini (AIzaSy...) or OpenAI (sk-...) key..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-mono shadow-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports Google Gemini (recommended), OpenAI, Groq, or OpenRouter keys.
                </p>
              </div>

              {keySaveMessage && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs font-medium border animate-fade-in",
                    keySaveMessage.startsWith("Error")
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  )}
                >
                  {keySaveMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!apiKeyInput.trim() || isSavingKey}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  {isSavingKey ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Save & Connect AI</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MentorStudioSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      <div className="h-12 bg-slate-100 rounded-2xl w-1/3" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="h-48 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-80 bg-slate-100 rounded-2xl" />
        </div>
        <div className="lg:col-span-7 h-[750px] bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}

export default function MentorStudio() {
  return (
    <Suspense fallback={<MentorStudioSkeleton />}>
      <MentorStudioContent />
    </Suspense>
  );
}
