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
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading virtual contest arena...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-900">Contest session not found</h2>
        <Link href="/virtual" className="mt-4 inline-block text-xs text-sky-600 font-bold hover:underline">
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
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Sticky Contest Arena HUD Header */}
      <div className="glass-panel border border-slate-200/90 rounded-2xl p-5 sticky top-20 z-30 shadow-md backdrop-blur-xl bg-white/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Contest Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                {session.division}
              </span>
              <span className="text-xs text-slate-500 font-medium">Scoring: {session.scoringMode}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">{session.contestTitle}</h1>
          </div>

          {/* Metrics & Countdown Clock */}
          <div className="flex flex-wrap items-center gap-3 md:gap-5">
            {/* Rank Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Rank</div>
                <div className="text-sm font-black text-slate-900">
                  #{user?.rank || 1} <span className="text-xs text-slate-400 font-normal">/ {session.participants.length}</span>
                </div>
              </div>
            </div>

            {/* Solved Count */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Solved</div>
                <div className="text-sm font-black text-emerald-700">
                  {user?.solvedCount || 0}{" "}
                  <span className="text-xs text-slate-400 font-normal">/ {session.problems.length}</span>
                </div>
              </div>
            </div>

            {/* Penalty or Points */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 shadow-xs">
              <Clock className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {session.scoringMode === "CF" ? "Points" : "Penalty"}
                </div>
                <div className="text-sm font-black text-sky-800">
                  {session.scoringMode === "CF" ? user?.totalPoints || 0 : `${user?.totalPenaltyMinutes || 0}m`}
                </div>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="px-4 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 shadow-xs">
              <Timer className="w-5 h-5 text-amber-600 animate-pulse" />
              <div>
                <div className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">
                  {session.status === "COMPLETED" ? "Contest Finished" : "Time Remaining"}
                </div>
                <div className="text-base font-mono font-black text-amber-900">
                  {formatTime(remainingSeconds)}
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? "Resume simulation" : "Pause simulation"}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-xs"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleFastForward(5)}
                title="Fast forward 5 minutes"
                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors shadow-xs"
              >
                <FastForward className="w-3 h-3" /> +5m
              </button>
              <button
                onClick={() => handleFastForward(15)}
                title="Fast forward 15 minutes"
                className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors shadow-xs"
              >
                <FastForward className="w-3 h-3" /> +15m
              </button>
              <button
                onClick={handleFinishContest}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors ml-1 shadow-xs"
              >
                <Flag className="w-3 h-3" /> Finish
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-200/80">
          <div
            className="bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("problems")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "problems"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-xs"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Problems ({session.problems.length})
        </button>
        <button
          onClick={() => setActiveTab("standings")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "standings"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-xs"
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          Live Standings ({session.participants.length})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "submissions"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-xs"
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
                    "glass-panel border rounded-2xl p-5 transition-all bg-white shadow-sm",
                    isSolved
                      ? "border-emerald-300 bg-emerald-50/40"
                      : hasTried
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-slate-200"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl font-black flex items-center justify-center text-sm shadow-xs",
                            isSolved
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-sky-100 text-sky-800 border border-sky-200"
                          )}
                        >
                          {prob.index}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors">
                          {prob.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                          {prob.rating} Rating
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{prob.points} pts</span>
                      </div>

                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                        {prob.statementSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {prob.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
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
                          <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Solved (+{res.solveTimeMinutes}m)
                          </span>
                          {res.rejectedAttempts > 0 && (
                            <div className="text-[10px] text-slate-500 mt-1 font-medium">
                              {res.rejectedAttempts} failed attempts
                            </div>
                          )}
                        </div>
                      ) : hasTried ? (
                        <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shadow-xs">
                          Tried ({res?.rejectedAttempts || 0} WA)
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Not attempted</span>
                      )}

                      <button
                        onClick={() => {
                          setSelectedProblem(prob.index);
                          setShowSubmitModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
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
        <div className="glass-panel border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
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
              <tbody className="divide-y divide-slate-100">
                {session.participants.map((p) => {
                  const isCurrentUser = p.isUser;
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "transition-colors",
                        isCurrentUser ? "bg-sky-50/70 font-semibold" : "hover:bg-slate-50/80"
                      )}
                    >
                      <td className="py-3.5 px-4 font-black text-slate-900">#{p.rank}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", getCodeforcesRank(p.rating).textColor)}>
                            {p.handle}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {p.solvedCount}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 font-mono">
                        {session.scoringMode === "CF" ? p.totalPoints : `${p.totalPenaltyMinutes}m`}
                      </td>
                      {session.problems.map((prob) => {
                        const res = p.results[prob.index];
                        if (res?.isSolved) {
                          return (
                            <td key={prob.index} className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                +{res.rejectedAttempts > 0 ? res.rejectedAttempts : ""}
                              </span>
                            </td>
                          );
                        } else if ((res?.rejectedAttempts || 0) > 0) {
                          return (
                            <td key={prob.index} className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                                -{res.rejectedAttempts}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td key={prob.index} className="py-3 px-2 text-center text-slate-300">
                            •
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
        <div className="glass-panel border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {session.submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No submissions yet. Solve problems to record submission verdicts!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Passed</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {session.submissions.map((sub) => {
                    const isOk = sub.verdict === "OK";
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          +{Math.floor(sub.submittedAtSeconds / 60)}m
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          Problem {sub.problemIndex}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs border",
                              isOk
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            )}
                          >
                            {isOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                            {sub.verdict === "OK" ? "Accepted" : sub.verdict.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{sub.passedCount} tests</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{sub.timeConsumedMs} ms</td>
                        <td className="py-3.5 px-4 text-slate-500">{sub.language}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative bg-white">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" />
              Submit Solution — Problem {selectedProblem}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select problem verdict and language to record virtual contest submission.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Problem
                  </label>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                  >
                    {session.problems.map((p) => (
                      <option key={p.index} value={p.index}>
                        Problem {p.index} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Target Verdict
                  </label>
                  <select
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as SubmissionVerdict)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
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
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="GNU C++20">GNU C++20 (64 bit)</option>
                  <option value="Python 3">Python 3.10</option>
                  <option value="Java 17">Java 17</option>
                  <option value="Rust 2021">Rust 2021</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Source Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
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
