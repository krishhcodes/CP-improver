"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getCodeforcesRank } from "@/lib/utils";
import { Flame, ExternalLink, CheckCircle2, ArrowUpDown, Filter, Sparkles, RefreshCw } from "lucide-react";

export default function UpsolvePage() {
  const { upsolveProblems, profile, isLoading } = useUser();
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [problems, setProblems] = useState(upsolveProblems);

  useEffect(() => {
    setProblems(upsolveProblems);
  }, [upsolveProblems]);

  const filtered =
    filterPriority === "ALL"
      ? problems
      : problems.filter((p) => p.priority === filterPriority);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Upsolve Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>{problems.length} In Queue</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized backlog of missed contest problems with explainable recommendation rationale.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto shadow-xs">
          {["ALL", "HIGH", "MEDIUM"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterPriority === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {p === "ALL" ? "All Priorities" : `${p} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 border border-sky-200 text-xs text-slate-700 flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Upsolving Principle: </span>
          <span>
            Solving problems you missed during a contest has 3x higher learning retention than random problemset practice.
            Target problems within +200 rating points of your current rating first.
          </span>
        </div>
      </div>

      {/* Problem Cards or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-2xl border border-slate-200 space-y-3 max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No Problems in Queue</h3>
          <p className="text-xs text-slate-500">
            All contest problems within your current target range are solved, or you have cleared your upsolve backlog!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((problem) => {
          const rankInfo = getCodeforcesRank(problem.rating);
          const isHighPriority = problem.priority === "HIGH";

          return (
            <div
              key={problem.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 font-black text-sm flex items-center justify-center shadow-xs">
                      {problem.index}
                    </span>
                    <div>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors flex items-center gap-1.5"
                      >
                        <span>{problem.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                      </a>
                      <p className="text-xs text-slate-500 mt-0.5">{problem.contestName}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border shadow-xs ${rankInfo.bgColor} ${rankInfo.borderColor} ${rankInfo.textColor}`}
                  >
                    ★ {problem.rating}
                  </span>
                </div>

                {/* Reason Callout */}
                <div className="mt-3.5 p-3 rounded-xl bg-sky-50/80 border border-sky-100 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    Why Upsolve Now
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{problem.reason}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {problem.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-xs"
                >
                  Solve on Codeforces
                </a>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
