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
    <div className="rounded-2xl glass-panel p-6 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Latest Contest Autopsy
              </span>
              <span className="text-xs text-slate-500 font-medium">{autopsy.date}</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-1 tracking-tight">
              {autopsy.contestName}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm ${
                delta.isPositive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {delta.text} Rating
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">Rank #{autopsy.rank}</p>
          </div>
        </div>

        {/* Problems Classification Chips */}
        <div className="flex items-center gap-6 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Solved:</span>
            <div className="flex items-center gap-1">
              {autopsy.solvedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] flex items-center justify-center shadow-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Failed:</span>
            <div className="flex items-center gap-1">
              {autopsy.failedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-bold text-[11px] flex items-center justify-center shadow-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Missed:</span>
            <div className="flex items-center gap-1">
              {autopsy.missedProblems.map((p) => (
                <span
                  key={p}
                  className="w-5 h-5 rounded bg-slate-200 border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center justify-center shadow-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>What Went Well</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              {autopsy.insights.wentWell.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 leading-none font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Where Strategy Failed</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              {autopsy.insights.wentWrong.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600 leading-none font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
          <span className="line-clamp-1">{autopsy.insights.actionItems[0]}</span>
        </div>
        <Link
          href={`/contests/${autopsy.contestId}`}
          className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors shrink-0 ml-2"
        >
          <span>Full Autopsy</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
