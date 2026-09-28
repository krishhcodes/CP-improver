"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Timer,
  Trophy,
  Play,
  Pause,
  FastForward,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Flag,
  ChevronRight,
  Code2,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn, getCodeforcesRank } from "@/lib/utils";
import {
  SubmissionVerdict,
  VirtualContestProblem,
  VirtualContestSession,
  VirtualParticipant,
  VirtualSubmission,
} from "@/server/virtual/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VirtualContestArena({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<VirtualContestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problems" | "standings" | "submissions">("problems");
  const [isPaused, setIsPaused] = useState(false);

  // Submission Form State
  const [submitting, setSubmitting] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string>("A");
  const [verdict, setVerdict] = useState<SubmissionVerdict>("OK");
  const [language, setLanguage] = useState("GNU C++20");
  const [code, setCode] = useState("// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    \n    return 0;\n}");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Fetch session on load
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/virtual-contests/${id}`);
      if (!res.ok) throw new Error("Contest session not found");
      const data: VirtualContestSession = await res.json();
      setSession(data);
      if (data.status === "PAUSED") setIsPaused(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  // Live timer tick every 1000ms
  useEffect(() => {
    if (!session || isPaused || session.status === "COMPLETED") return;

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.status === "COMPLETED") return prev;
        const nextElapsed = prev.elapsedSeconds + 1;
        const maxSeconds = prev.durationMinutes * 60;
        if (nextElapsed >= maxSeconds) {
          clearInterval(interval);
          return { ...prev, elapsedSeconds: maxSeconds, status: "COMPLETED" };
        }
        return { ...prev, elapsedSeconds: nextElapsed };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, session?.status]);

  // Periodically sync elapsedSeconds with server every 10 seconds to update bot events
  useEffect(() => {
    if (!session || isPaused || session.status === "COMPLETED") return;

    const syncInterval = setInterval(() => {
      fetch(`/api/virtual-contests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elapsedSeconds: session.elapsedSeconds }),
      })
        .then((res) => res.json())
        .then((updated) => {
          if (updated && !updated.error) setSession(updated);
        })
        .catch((err) => console.error("Sync error:", err));
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [id, isPaused, session?.elapsedSeconds, session?.status]);

  // Fast forward simulation clock
  const handleFastForward = async (minutes: number) => {
    if (!session) return;
    const newElapsed = Math.min(
      session.durationMinutes * 60,
      session.elapsedSeconds + minutes * 60
    );

    try {
      const res = await fetch(`/api/virtual-contests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elapsedSeconds: newElapsed }),
      });
      const updated = await res.json();
      if (!updated.error) setSession(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Solution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/virtual-contests/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemIndex: selectedProblem,
          verdict,
          language,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      setSession(data.session);
      setShowSubmitModal(false);
      setActiveTab("submissions");
    } catch (err) {
      console.error(err);
      alert("Submission error. Please check parameters.");
    } finally {
      setSubmitting(false);
    }
  };

  // Finish Contest & Navigate to Autopsy
  const handleFinishContest = async () => {
    if (!confirm("Are you sure you want to finish this virtual contest and view the post-contest autopsy?")) {
      return;
    }

    try {
      const res = await fetch(`/api/virtual-contests/${id}/finish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to finish contest");
      router.push(`/virtual/${id}/autopsy`);
    } catch (err) {
      console.error(err);
      alert("Error finishing contest.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Loading virtual contest arena...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Contest session not found</h2>
        <Link href="/virtual" className="mt-4 inline-block text-xs text-orange-400 hover:underline">
          Return to Virtual Contest Lobby
        </Link>
      </div>
    );
  }

  const user = session.participants.find((p) => p.isUser);
  const totalSeconds = session.durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalSeconds - session.elapsedSeconds);
  const progressPercent = Math.min(100, (session.elapsedSeconds / totalSeconds) * 100);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Sticky Contest Arena HUD Header */}
      <div className="glass-panel border border-white/[0.08] rounded-2xl p-5 sticky top-20 z-30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Contest Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                {session.division}
              </span>
              <span className="text-xs text-zinc-400 font-medium">Scoring: {session.scoringMode}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">{session.contestTitle}</h1>
          </div>

          {/* Metrics & Countdown Clock */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            {/* Rank Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Rank</div>
                <div className="text-sm font-bold text-white">
                  #{user?.rank || 1} <span className="text-xs text-zinc-400 font-normal">/ {session.participants.length}</span>
                </div>
              </div>
            </div>

            {/* Solved Count */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Solved</div>
                <div className="text-sm font-bold text-emerald-400">
                  {user?.solvedCount || 0}{" "}
                  <span className="text-xs text-zinc-400 font-normal">/ {session.problems.length}</span>
                </div>
              </div>
            </div>

            {/* Penalty or Points */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                  {session.scoringMode === "CF" ? "Points" : "Penalty"}
                </div>
                <div className="text-sm font-bold text-indigo-300">
                  {session.scoringMode === "CF" ? user?.totalPoints || 0 : `${user?.totalPenaltyMinutes || 0}m`}
                </div>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 flex items-center gap-3">
              <Timer className="w-5 h-5 text-orange-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-orange-400/80 uppercase font-bold tracking-wider">
                  {session.status === "COMPLETED" ? "Contest Finished" : "Time Remaining"}
                </div>
                <div className="text-base font-mono font-bold text-orange-300">
                  {formatTime(remainingSeconds)}
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? "Resume simulation" : "Pause simulation"}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleFastForward(5)}
                title="Fast forward 5 minutes"
                className="px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-semibold text-zinc-300 border border-white/[0.06] flex items-center gap-1 transition-colors"
              >
                <FastForward className="w-3 h-3" /> +5m
              </button>
              <button
                onClick={() => handleFastForward(15)}
                title="Fast forward 15 minutes"
                className="px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-semibold text-zinc-300 border border-white/[0.06] flex items-center gap-1 transition-colors"
              >
                <FastForward className="w-3 h-3" /> +15m
              </button>
              <button
                onClick={handleFinishContest}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-1"
              >
                <Flag className="w-3 h-3" /> Finish
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.06] h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab("problems")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2",
            activeTab === "problems"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white bg-white/[0.02]"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Problems ({session.problems.length})
        </button>
        <button
          onClick={() => setActiveTab("standings")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2",
            activeTab === "standings"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white bg-white/[0.02]"
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          Live Standings ({session.participants.length})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2",
            activeTab === "submissions"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-zinc-400 hover:text-white bg-white/[0.02]"
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          Submissions ({session.submissions.length})
        </button>
      </div>

      {/* TAB 1: PROBLEMS */}
      {activeTab === "problems" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {session.problems.map((prob) => {
              const res = user?.results[prob.index];
              const isSolved = res?.isSolved;
              const hasTried = (res?.rejectedAttempts || 0) > 0;

              return (
                <div
                  key={prob.index}
                  className={cn(
                    "glass-panel border rounded-2xl p-5 transition-all",
                    isSolved
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : hasTried
                      ? "border-amber-500/30 bg-amber-950/10"
                      : "border-white/[0.08]"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm",
                            isSolved
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/[0.06] text-white border border-white/[0.08]"
                          )}
                        >
                          {prob.index}
                        </div>
                        <h3 className="text-base font-bold text-white hover:text-orange-400 transition-colors">
                          {prob.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-medium">
                          {prob.rating} Rating
                        </span>
                        <span className="text-xs text-zinc-400">{prob.points} pts</span>
                      </div>

                      <p className="text-xs text-zinc-300 pt-1 leading-relaxed">
                        {prob.statementSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {prob.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.05]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                      {isSolved ? (
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved (+{res.solveTimeMinutes}m)
                          </span>
                          {res.rejectedAttempts > 0 && (
                            <div className="text-[10px] text-zinc-400 mt-1">
                              {res.rejectedAttempts} failed attempts
                            </div>
                          )}
                        </div>
                      ) : hasTried ? (
                        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                          Tried ({res?.rejectedAttempts || 0} WA)
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">Not attempted</span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedProblem(prob.index);
                          setShowSubmitModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3 h-3" /> Submit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE STANDINGS / SCOREBOARD */}
      {activeTab === "standings" && (
        <div className="glass-panel border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 uppercase font-semibold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4 text-center">Solved</th>
                  <th className="py-3 px-4 text-center">
                    {session.scoringMode === "CF" ? "Points" : "Penalty"}
                  </th>
                  {session.problems.map((p) => (
                    <th key={p.index} className="py-3 px-3 text-center">
                      {p.index}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {session.participants.map((p) => {
                  const isCurrentUser = p.isUser;
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "transition-colors",
                        isCurrentUser ? "bg-indigo-950/20 font-semibold" : "hover:bg-white/[0.02]"
                      )}
                    >
                      <td className="py-3.5 px-4 font-bold text-white">#{p.rank}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", getCodeforcesRank(p.rating).textColor)}>
                            {p.handle}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        {p.solvedCount}
                      </td>
                      <td className="py-3.5 px-4 text-center text-zinc-300 font-mono">
                        {session.scoringMode === "CF" ? p.totalPoints : `${p.totalPenaltyMinutes}m`}
                      </td>
                      {session.problems.map((prob) => {
                        const res = p.results[prob.index];
                        if (res?.isSolved) {
                          return (
                            <td key={prob.index} className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                                +{res.rejectedAttempts > 0 ? res.rejectedAttempts : ""}
                              </span>
                            </td>
                          );
                        } else if ((res?.rejectedAttempts || 0) > 0) {
                          return (
                            <td key={prob.index} className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[11px] font-bold">
                                -{res.rejectedAttempts}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={prob.index} className="py-3 px-2 text-center text-zinc-400">
                            .
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="glass-panel border border-white/[0.08] rounded-2xl overflow-hidden">
          {session.submissions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No submissions yet. Solve problems to record submission verdicts!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 uppercase font-semibold">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Passed</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {session.submissions.map((sub) => {
                    const isOk = sub.verdict === "OK";
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          +{Math.floor(sub.submittedAtSeconds / 60)}m
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          Problem {sub.problemIndex}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5",
                              isOk
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            )}
                          >
                            {isOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {sub.verdict === "OK" ? "Accepted" : sub.verdict.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">{sub.passedCount} tests</td>
                        <td className="py-3.5 px-4 text-zinc-400 font-mono">{sub.timeConsumedMs} ms</td>
                        <td className="py-3.5 px-4 text-zinc-400">{sub.language}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel border border-white/[0.12] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-400" />
              Submit Solution — Problem {selectedProblem}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select problem verdict and language to record virtual contest submission.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase block mb-1">
                    Problem
                  </label>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {session.problems.map((p) => (
                      <option key={p.index} value={p.index}>
                        Problem {p.index} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase block mb-1">
                    Target Verdict
                  </label>
                  <select
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as SubmissionVerdict)}
                    className="w-full bg-[#0a0f1d] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="OK">Accepted (OK)</option>
                    <option value="WRONG_ANSWER">Wrong Answer (WA)</option>
                    <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded (TLE)</option>
                    <option value="MEMORY_LIMIT_EXCEEDED">Memory Limit Exceeded (MLE)</option>
                    <option value="COMPILATION_ERROR">Compilation Error (CE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase block mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="GNU C++20">GNU C++20 (64 bit)</option>
                  <option value="Python 3">Python 3.10</option>
                  <option value="Java 17">Java 17</option>
                  <option value="Rust 2021">Rust 2021</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 uppercase block mb-1">
                  Source Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  className="w-full bg-[#070b14] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {submitting ? "Judging..." : "Submit Solution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
