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
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Synthesizing post-contest autopsy...</p>
        </div>
      </div>
    );
  }

  if (!autopsy) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Autopsy report not available</h2>
        <Link href="/virtual" className="mt-4 inline-block text-xs text-orange-400 hover:underline">
          Return to Virtual Contest Lobby
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/virtual/${id}`}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Contest Arena
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Post-Contest Strategic Autopsy
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Diagnostician
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">{autopsy.contestTitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/virtual"
            className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 rounded-xl transition-colors"
          >
            Virtual Lobby
          </Link>
          <Link
            href="/upsolve"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <Flame className="w-3.5 h-3.5" /> View Upsolve Queue
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Final Rank */}
        <div className="glass-panel border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Final Standings</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            #{autopsy.finalRank}{" "}
            <span className="text-xs font-normal text-zinc-400">/ {autopsy.totalParticipants}</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Top {autopsy.rankPercentile}% percentile
          </div>
        </div>

        {/* Virtual Performance Rating */}
        <div className="glass-panel border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Performance Rating</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 tracking-tight">
            {autopsy.virtualPerformanceRating}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
            {autopsy.ratingDeltaProjection >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +{autopsy.ratingDeltaProjection} Delta
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> {autopsy.ratingDeltaProjection} Delta
              </span>
            )}
            <span className="text-zinc-400 font-normal">projected</span>
          </div>
        </div>

        {/* Solved Problems */}
        <div className="glass-panel border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Solved Problems</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {autopsy.solvedCount}{" "}
            <span className="text-xs font-normal text-zinc-400">/ {autopsy.totalProblems}</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {Math.round((autopsy.solvedCount / autopsy.totalProblems) * 100)}% completion rate
          </div>
        </div>

        {/* ICPC Penalty */}
        <div className="glass-panel border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Penalty Time</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {autopsy.totalPenaltyMinutes}m
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Total ICPC penalty minutes</div>
        </div>
      </div>

      {/* Opportunity Cost Banner */}
      {autopsy.opportunityCost.detected ? (
        <div className="glass-panel border border-amber-500/30 rounded-2xl p-6 bg-gradient-to-r from-amber-950/20 via-orange-950/10 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Critical Opportunity Cost Detected</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  High Impact
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {autopsy.opportunityCost.explanation}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-400">
                <span>Immediate Takeaway:</span>
                <span className="text-zinc-300 font-normal">
                  Always inspect later problem ratings and community solve counts when hitting a 25-minute plateau.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-emerald-500/30 rounded-2xl p-6 bg-emerald-950/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Optimal Problem Selection</h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {autopsy.opportunityCost.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Allocation Analysis */}
      <div className="glass-panel border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Problem Time Allocation & Time Sink Traps
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Breakdown of minutes invested per problem versus calibrated expected solve times.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 uppercase font-semibold">
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Minutes Spent</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Time Delta</th>
                <th className="py-3 px-4">Diagnostic Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {autopsy.timeAllocations.map((t) => {
                return (
                  <tr key={t.problemIndex} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      Problem {t.problemIndex} ({t.problemName})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-medium">
                        {t.rating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.isSolved ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          Solved
                        </span>
                      ) : t.minutesSpent > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">
                          Failed
                        </span>
                      ) : (
                        <span className="text-zinc-400">Unattempted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">{t.minutesSpent} mins</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{t.expectedMinutes} mins</td>
                    <td className="py-3.5 px-4 font-mono">
                      {t.timeDeltaMinutes > 0 ? (
                        <span className="text-amber-400">+{t.timeDeltaMinutes}m</span>
                      ) : (
                        <span className="text-emerald-400">{t.timeDeltaMinutes}m</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.isTimeSink ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                          Time Sink Trap
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">—</span>
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
          <h2 className="text-base font-bold text-white tracking-tight">Tactical Observations</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
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
                  "glass-panel border rounded-2xl p-5 space-y-2",
                  isCrit
                    ? "border-red-500/30 bg-red-950/10"
                    : isPos
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : "border-amber-500/30 bg-amber-950/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      isCrit
                        ? "bg-red-500/20 text-red-300"
                        : isPos
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    )}
                  >
                    {f.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                    {f.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{f.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{f.description}</p>

                <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">Impact: </span>
                  {f.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Items for Next Contest */}
      <div className="glass-panel border border-white/[0.08] rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Tactical Action Directives for Next Round
        </h2>
        <div className="space-y-2">
          {autopsy.actionItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Upsolves from this Contest */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Curated Post-Contest Upsolve Queue
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Problems missed or unattempted in this round ranked by estimated skill improvement yield.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {autopsy.recommendedUpsolves.map((up) => (
            <div
              key={up.problemIndex}
              className="glass-panel border border-white/[0.08] hover:border-orange-500/30 rounded-2xl p-5 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                      {up.problemIndex}
                    </span>
                    <h3 className="text-sm font-bold text-white">{up.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {up.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.05]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-orange-400">{up.yieldScore}/100</div>
                  <div className="text-[10px] text-zinc-400">Yield Score</div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{up.reason}</p>

              {/* Theory Curriculum Guide Badge */}
              {up.curriculumGuide && (
                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] truncate">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      Theory: <strong>{up.curriculumGuide.name}</strong> ({up.curriculumGuide.bookCitation})
                    </span>
                  </div>
                  <Link
                    href={`/learn/${up.curriculumGuide.slug}`}
                    className="text-indigo-400 hover:text-indigo-300 font-bold text-[11px] underline underline-offset-2 shrink-0 flex items-center gap-0.5 ml-2"
                  >
                    <span>Guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-400">Rating: {up.rating}</span>
                <a
                  href={`https://codeforces.com/problemset`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
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
