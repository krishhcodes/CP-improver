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
            <h1 className="text-2xl font-black text-white tracking-tight">Upsolve Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>{problems.length} In Queue</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Prioritized backlog of missed contest problems with explainable recommendation rationale.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-white/[0.08] self-start sm:self-auto">
          {["ALL", "HIGH", "MEDIUM"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterPriority === p
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {p === "ALL" ? "All Priorities" : `${p} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/30 border border-indigo-500/20 text-xs text-zinc-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Upsolving Principle: </span>
          <span>
            Solving problems you missed during a contest has 3x higher learning retention than random problemset practice.
            Target problems within +200 rating points of your current rating first.
          </span>
        </div>
      </div>

      {/* Problem Cards or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-16 px-6 text-center glass-panel rounded-2xl border border-white/[0.08] space-y-3 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Problems in Queue</h3>
          <p className="text-xs text-zinc-400">
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
              className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-black text-sm flex items-center justify-center">
                      {problem.index}
                    </span>
                    <div>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-bold text-white hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>{problem.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-indigo-300" />
                      </a>
                      <p className="text-xs text-zinc-500 mt-0.5">{problem.contestName}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold border ${rankInfo.bgColor} ${rankInfo.borderColor} ${rankInfo.textColor}`}
                  >
                    ★ {problem.rating}
                  </span>
                </div>

                {/* Reason Callout */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-900/70 border border-white/[0.04] text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Why Upsolve Now
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{problem.reason}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {problem.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 text-[10px] border border-white/[0.05]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
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
