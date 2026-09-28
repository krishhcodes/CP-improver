"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ShieldAlert,
  Flame,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PostContestAutopsy } from "@/server/virtual/autopsy-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostContestAutopsyPage({ params }: PageProps) {
  const { id } = use(params);
  const [autopsy, setAutopsy] = useState<PostContestAutopsy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/virtual-contests/${id}/autopsy`)
      .then((res) => {
        if (!res.ok) throw new Error("Autopsy not found");
        return res.json();
      })
      .then((data) => setAutopsy(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Synthesizing post-contest autopsy...</p>
        </div>
      </div>
    );
  }

  if (!autopsy) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-900">Autopsy report not available</h2>
        <Link href="/virtual" className="mt-4 inline-block text-xs text-sky-600 font-bold hover:underline">
          Return to Virtual Contest Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/virtual/${id}`}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Contest Arena
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Post-Contest Strategic Autopsy
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold">
              Diagnostician
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">{autopsy.contestTitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/virtual"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors shadow-xs"
          >
            Virtual Lobby
          </Link>
          <Link
            href="/upsolve"
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Flame className="w-3.5 h-3.5" /> View Upsolve Queue
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Final Rank */}
        <div className="glass-panel border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Final Standings</span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            #{autopsy.finalRank}{" "}
            <span className="text-xs font-normal text-slate-400">/ {autopsy.totalParticipants}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Top {autopsy.rankPercentile}% percentile
          </div>
        </div>

        {/* Virtual Performance Rating */}
        <div className="glass-panel border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Performance Rating</span>
            <Target className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-800 tracking-tight">
            {autopsy.virtualPerformanceRating}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold mt-1">
            {autopsy.ratingDeltaProjection >= 0 ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +{autopsy.ratingDeltaProjection} Delta
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> {autopsy.ratingDeltaProjection} Delta
              </span>
            )}
            <span className="text-slate-400 font-normal">projected</span>
          </div>
        </div>

        {/* Solved Problems */}
        <div className="glass-panel border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Solved Problems</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {autopsy.solvedCount}{" "}
            <span className="text-xs font-normal text-slate-400">/ {autopsy.totalProblems}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round((autopsy.solvedCount / autopsy.totalProblems) * 100)}% completion rate
          </div>
        </div>

        {/* ICPC Penalty */}
        <div className="glass-panel border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Penalty Time</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {autopsy.totalPenaltyMinutes}m
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total ICPC penalty minutes</div>
        </div>
      </div>

      {/* Opportunity Cost Banner */}
      {autopsy.opportunityCost.detected ? (
        <div className="glass-panel border border-amber-300 rounded-2xl p-6 bg-amber-50/70 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Critical Opportunity Cost Detected</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                  High Impact
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {autopsy.opportunityCost.explanation}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-800">
                <span>Immediate Takeaway:</span>
                <span className="text-slate-700 font-normal">
                  Always inspect later problem ratings and community solve counts when hitting a 25-minute plateau.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-emerald-300 rounded-2xl p-6 bg-emerald-50/70 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Optimal Problem Selection</h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {autopsy.opportunityCost.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Allocation Analysis */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-6 space-y-4 bg-white shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Problem Time Allocation & Time Sink Traps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of minutes invested per problem versus calibrated expected solve times.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Minutes Spent</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Time Delta</th>
                <th className="py-3 px-4">Diagnostic Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {autopsy.timeAllocations.map((t) => {
                return (
                  <tr key={t.problemIndex} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Problem {t.problemIndex} ({t.problemName})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                        {t.rating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.isSolved ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Solved
                        </span>
                      ) : t.minutesSpent > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          Failed
                        </span>
                      ) : (
                        <span className="text-slate-400">Unattempted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{t.minutesSpent} mins</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{t.expectedMinutes} mins</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {t.timeDeltaMinutes > 0 ? (
                        <span className="text-amber-700">+{t.timeDeltaMinutes}m</span>
                      ) : (
                        <span className="text-emerald-700">{t.timeDeltaMinutes}m</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.isTimeSink ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold uppercase tracking-wider">
                          Time Sink Trap
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Findings Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Tactical Observations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key behavioural traits and strategic decisions identified during the round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {autopsy.findings.map((f, idx) => {
            const isPos = f.severity === "POSITIVE";
            const isCrit = f.severity === "CRITICAL";

            return (
              <div
                key={idx}
                className={cn(
                  "glass-panel border rounded-2xl p-5 space-y-2 bg-white shadow-sm",
                  isCrit
                    ? "border-rose-300 bg-rose-50/30"
                    : isPos
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-amber-300 bg-amber-50/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      isCrit
                        ? "bg-rose-100 text-rose-800"
                        : isPos
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {f.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {f.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Impact: </span>
                  {f.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Items for Next Contest */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-6 space-y-3 bg-white shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          Tactical Action Directives for Next Round
        </h2>
        <div className="space-y-2">
          {autopsy.actionItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Upsolves from this Contest */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            Curated Post-Contest Upsolve Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Problems missed or unattempted in this round ranked by estimated skill improvement yield.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {autopsy.recommendedUpsolves.map((up) => (
            <div
              key={up.problemIndex}
              className="glass-panel border border-slate-200 hover:border-sky-300 rounded-2xl p-5 space-y-3 transition-all bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center shadow-xs">
                      {up.problemIndex}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{up.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {up.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-rose-600">{up.yieldScore}/100</div>
                  <div className="text-[10px] text-slate-400 font-medium">Yield Score</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{up.reason}</p>

              {/* Theory Curriculum Guide Badge */}
              {up.curriculumGuide && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 text-[11px] truncate">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">
                      Theory: <strong className="text-slate-900">{up.curriculumGuide.name}</strong> ({up.curriculumGuide.bookCitation})
                    </span>
                  </div>
                  <Link
                    href={`/learn/${up.curriculumGuide.slug}`}
                    className="text-sky-600 hover:text-sky-800 font-bold text-[11px] underline underline-offset-2 shrink-0 flex items-center gap-0.5 ml-2"
                  >
                    <span>Guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Rating: {up.rating}</span>
                <a
                  href={`https://codeforces.com/problemset`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
                >
                  Solve on Codeforces <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
