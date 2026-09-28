"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Flame,
  Award,
  Zap,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ContestMetrics, ProblemStatus } from "@/server/analytics/contest-analytics";
import { formatRatingDelta, getCodeforcesRank, getVerdictStyle } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

export default function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { handle } = useUser();
  const [metrics, setMetrics] = useState<ContestMetrics | null>(null);
  const [insights, setInsights] = useState<{
    wentWell: string[];
    wentWrong: string[];
    actionItems: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "PROBLEMS" | "AUTOPSY">("TIMELINE");

  useEffect(() => {
    async function loadContest() {
      setLoading(true);
      try {
        const queryHandle = handle ? `?handle=${encodeURIComponent(handle)}` : "";
        const res = await fetch(`/api/contests/${id}${queryHandle}`);
        const data = await res.json();
        if (data.contest) {
          setMetrics(data.contest);
          setInsights(data.insights ?? null);
        }
      } catch (err) {
        console.error("Error loading contest:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContest();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Loading contest autopsy and timeline analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-zinc-400">Contest not found</p>
        <Link href="/contests" className="text-xs text-indigo-400 hover:underline">
          Return to Contests List
        </Link>
      </div>
    );
  }

  const delta = formatRatingDelta(metrics.ratingChange);
  const currentRank = getCodeforcesRank(metrics.newRating);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/contests"
          className="p-2 rounded-xl glass-panel-subtle border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
            Contest Intelligence & Autopsy
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">{metrics.contestName}</h1>
        </div>
      </div>

      {/* Overview Header Card */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Round #{metrics.contestId}
            </span>
            <span className="text-xs text-zinc-400">
              Official Div. 2 Contest
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap pt-1">
            <span>
              Final Rank: <strong className="text-white">#{metrics.rank}</strong>
            </span>
            <span>•</span>
            <span>
              Rating: <strong className={currentRank.textColor}>{metrics.newRating}</strong>
            </span>
            <span>•</span>
            <span
              className={`font-black ${
                delta.isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {delta.text} Delta
            </span>
          </div>
        </div>

        {/* Key Metrics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl glass-panel-subtle border border-white/[0.05] text-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Solved Live</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {metrics.solvedDuringContestCount}
            </p>
          </div>
          <div className="p-3 rounded-xl glass-panel-subtle border border-white/[0.05] text-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Failed</span>
            <p className="text-lg font-black text-rose-400 mt-0.5">
              {metrics.failedDuringContestCount}
            </p>
          </div>
          <div className="p-3 rounded-xl glass-panel-subtle border border-white/[0.05] text-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">First AC</span>
            <p className="text-lg font-black text-indigo-300 mt-0.5">
              {metrics.timeToFirstAcMinutes !== null ? `${metrics.timeToFirstAcMinutes}m` : "N/A"}
            </p>
          </div>
          <div className="p-3 rounded-xl glass-panel-subtle border border-white/[0.05] text-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Penalty Time</span>
            <p className="text-lg font-black text-amber-300 mt-0.5">
              {metrics.totalPenaltyTimeMinutes}m
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-1 rounded-xl glass-panel border border-white/[0.08] inline-flex gap-1 text-xs font-semibold">
        {(
          [
            { key: "TIMELINE", label: "Contest Timeline" },
            { key: "PROBLEMS", label: "Problem Breakdown" },
            { key: "AUTOPSY", label: "Strategic Autopsy" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Contest Timeline */}
      {activeTab === "TIMELINE" && (
        <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Chronological Submission Timeline
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Exact chronological progression of all attempts made during the 2-hour official contest window.
            </p>
          </div>

          <div className="relative pl-6 space-y-4 border-l border-white/[0.08] my-4 ml-2">
            {metrics.timeline.map((event, idx) => {
              const verdictStyle = getVerdictStyle(event.verdict);

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <span
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[#090d16] flex items-center justify-center ${
                      event.isAccepted ? "bg-emerald-400" : "bg-rose-500"
                    }`}
                  />

                  <div className="p-3.5 rounded-xl glass-panel-subtle border border-white/[0.06] hover:border-white/[0.15] transition-all flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {event.formattedTime}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-[11px] flex items-center justify-center">
                          {event.problemIndex}
                        </span>
                        <span className="text-xs font-bold text-white">{event.problemName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${verdictStyle.bgColor} ${verdictStyle.borderColor} ${verdictStyle.textColor}`}
                      >
                        {verdictStyle.label}
                      </span>
                      <span className="text-[11px] text-zinc-500 hidden sm:inline">
                        Test #{event.passedTestCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Problems Breakdown */}
      {activeTab === "PROBLEMS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.problemAnalyses.map((prob) => {
            const isSolved = prob.status === "SOLVED_DURING_CONTEST";
            const isFailed = prob.status === "FAILED_DURING_CONTEST";
            const isUpsolved = prob.status === "UPSOLVED_LATER";

            const badgeBg = isSolved
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : isFailed
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : isUpsolved
              ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
              : "bg-zinc-800 text-zinc-400 border-white/[0.08]";

            return (
              <div
                key={prob.index}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-black text-sm flex items-center justify-center">
                        {prob.index}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white">{prob.name}</h3>
                        <p className="text-xs text-zinc-500">
                          Rating: <strong className="text-zinc-300">{prob.rating ?? "Unrated"}</strong>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${badgeBg}`}>
                      {prob.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-zinc-400">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block font-medium">Contest Attempts</span>
                      <strong className="text-white text-sm">{prob.attemptsDuringContest}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block font-medium">Solve Time</span>
                      <strong className="text-white text-sm">
                        {prob.timeSpentMinutes !== null ? `${prob.timeSpentMinutes} mins` : "Unsolved"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {prob.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 text-[10px] border border-white/[0.05]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`https://codeforces.com/contest/${metrics.contestId}/problem/${prob.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Codeforces</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Autopsy Insights */}
      {activeTab === "AUTOPSY" && insights && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>What Went Well</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {insights.wentWell.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 leading-tight">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Where Strategy Failed</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {insights.wentWrong.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 leading-tight">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Zap className="w-5 h-5" />
              <span>Targeted Action Items</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              {insights.actionItems.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">#{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
