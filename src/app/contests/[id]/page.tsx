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
        <p className="text-xs text-slate-500">Loading contest autopsy and timeline analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-slate-600">Contest not found</p>
        <Link href="/contests" className="text-xs text-sky-600 font-bold hover:underline">
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
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800">
            Contest Intelligence & Autopsy
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{metrics.contestName}</h1>
        </div>
      </div>

      {/* Overview Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
              Round #{metrics.contestId}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Official Div. 2 Contest
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1 font-medium">
            <span>
              Final Rank: <strong className="text-slate-900 font-bold">#{metrics.rank}</strong>
            </span>
            <span>•</span>
            <span>
              Rating: <strong className={currentRank.textColor}>{metrics.newRating}</strong>
            </span>
            <span>•</span>
            <span
              className={`font-black ${
                delta.isPositive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {delta.text} Delta
            </span>
          </div>
        </div>

        {/* Key Metrics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Solved Live</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">
              {metrics.solvedDuringContestCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Failed</span>
            <p className="text-lg font-black text-rose-700 mt-0.5">
              {metrics.failedDuringContestCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">First AC</span>
            <p className="text-lg font-black text-sky-700 mt-0.5">
              {metrics.timeToFirstAcMinutes !== null ? `${metrics.timeToFirstAcMinutes}m` : "N/A"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Penalty Time</span>
            <p className="text-lg font-black text-amber-800 mt-0.5">
              {metrics.totalPenaltyTimeMinutes}m
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 inline-flex gap-1 text-xs font-bold shadow-xs">
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
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Contest Timeline */}
      {activeTab === "TIMELINE" && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Chronological Submission Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact chronological progression of all attempts made during the 2-hour official contest window.
            </p>
          </div>

          <div className="relative pl-6 space-y-4 border-l border-slate-200 my-4 ml-2">
            {metrics.timeline.map((event, idx) => {
              const verdictStyle = getVerdictStyle(event.verdict);

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <span
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                      event.isAccepted ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 hover:bg-white transition-all flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-sky-700">
                        {event.formattedTime}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-sky-100 border border-sky-200 text-sky-800 font-black text-[11px] flex items-center justify-center shadow-xs">
                          {event.problemIndex}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{event.problemName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${verdictStyle.bgColor} ${verdictStyle.borderColor} ${verdictStyle.textColor}`}
                      >
                        {verdictStyle.label}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
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
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : isFailed
              ? "bg-rose-100 text-rose-800 border-rose-300"
              : isUpsolved
              ? "bg-sky-100 text-sky-800 border-sky-300"
              : "bg-slate-100 text-slate-600 border-slate-200";

            return (
              <div
                key={prob.index}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 font-black text-sm flex items-center justify-center shadow-xs">
                        {prob.index}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">{prob.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Rating: <strong className="text-slate-800 font-bold">{prob.rating ?? "Unrated"}</strong>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border shadow-xs ${badgeBg}`}>
                      {prob.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase">Contest Attempts</span>
                      <strong className="text-slate-900 text-sm font-extrabold">{prob.attemptsDuringContest}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase">Solve Time</span>
                      <strong className="text-slate-900 text-sm font-extrabold">
                        {prob.timeSpentMinutes !== null ? `${prob.timeSpentMinutes} mins` : "Unsolved"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {prob.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`https://codeforces.com/contest/${metrics.contestId}/problem/${prob.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-700 hover:text-sky-800 flex items-center gap-1 font-bold"
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
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>What Went Well</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {insights.wentWell.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 leading-tight font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Where Strategy Failed</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {insights.wentWrong.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 leading-tight font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
              <Zap className="w-5 h-5 text-sky-600" />
              <span>Targeted Action Items</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {insights.actionItems.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-700 font-black">#{i + 1}</span>
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
