"use client";

import Link from "next/link";
import { ContestAutopsy } from "@/types";
import { formatRatingDelta } from "@/lib/utils";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

interface ContestAutopsyWidgetProps {
  autopsy: ContestAutopsy;
}

export function ContestAutopsyWidget({ autopsy }: ContestAutopsyWidgetProps) {
  const delta = formatRatingDelta(autopsy.ratingChange);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Latest Contest Autopsy
              </span>
              <span className="text-xs text-zinc-500">{autopsy.date}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1 tracking-tight">
              {autopsy.contestName}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                delta.isPositive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {delta.text} Rating
            </span>
            <p className="text-[11px] text-zinc-500 mt-1">Rank #{autopsy.rank}</p>
          </div>
        </div>

        {/* Problems Classification Chips */}
        <div className="flex items-center gap-6 mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">Solved:</span>
            <div className="flex items-center gap-1">
              {autopsy.solvedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center justify-center"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">Failed:</span>
            <div className="flex items-center gap-1">
              {autopsy.failedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-[11px] flex items-center justify-center"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">Missed:</span>
            <div className="flex items-center gap-1">
              {autopsy.missedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 font-bold text-[11px] flex items-center justify-center"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl glass-panel-subtle border border-emerald-500/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>What Went Well</span>
            </div>
            <ul className="space-y-1 text-zinc-400 text-[11px]">
              {autopsy.insights.wentWell.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 leading-none">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl glass-panel-subtle border border-rose-500/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Where Strategy Failed</span>
            </div>
            <ul className="space-y-1 text-zinc-400 text-[11px]">
              {autopsy.insights.wentWrong.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-500 leading-none">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-indigo-300">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">{autopsy.insights.actionItems[0]}</span>
        </div>
        <Link
          href={`/contests/${autopsy.contestId}`}
          className="text-xs font-bold text-white hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Full Autopsy</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
