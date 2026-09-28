"use client";

import { useState } from "react";
import { Submission } from "@/types";
import { getVerdictStyle, getCodeforcesRank, formatTimeAgo } from "@/lib/utils";
import { ExternalLink, Filter, CheckCircle2, AlertCircle } from "lucide-react";

interface RecentSubmissionsTableProps {
  submissions: Submission[];
}

export function RecentSubmissionsTable({ submissions }: RecentSubmissionsTableProps) {
  const [filterVerdict, setFilterVerdict] = useState<string>("ALL");

  const filteredSubmissions =
    filterVerdict === "ALL"
      ? submissions
      : submissions.filter((s) => s.verdict.toUpperCase() === filterVerdict);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08]">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Recent Submissions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time feed of latest attempts with verdict analysis and resource profiling.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel-subtle border border-white/[0.06] self-start sm:self-auto flex-wrap">
          {[
            { key: "ALL", label: "All" },
            { key: "OK", label: "Accepted" },
            { key: "WRONG_ANSWER", label: "WA" },
            { key: "TIME_LIMIT_EXCEEDED", label: "TLE" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterVerdict(f.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                filterVerdict === f.key
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-400 font-semibold">
              <th className="pb-3 pl-1">Problem</th>
              <th className="pb-3 px-3">Verdict</th>
              <th className="pb-3 px-3">Rating</th>
              <th className="pb-3 px-3 hidden md:table-cell">Language</th>
              <th className="pb-3 px-3 hidden sm:table-cell">Runtime</th>
              <th className="pb-3 pr-1 text-right">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No submissions found for the selected filter.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub) => {
                const verdictStyle = getVerdictStyle(sub.verdict);
                const rankInfo = getCodeforcesRank(sub.problemRating);

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Problem Column */}
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          {sub.problemIndex}
                        </span>
                        <div>
                          <a
                            href={
                              sub.contestId
                                ? `https://codeforces.com/contest/${sub.contestId}/problem/${sub.problemIndex}`
                                : `https://codeforces.com/problemset/problem/${sub.contestId}/${sub.problemIndex}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                          >
                            <span>{sub.problemName}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {sub.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Verdict */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${verdictStyle.bgColor} ${verdictStyle.borderColor} ${verdictStyle.textColor}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{verdictStyle.label}</span>
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-3">
                      {sub.problemRating && sub.problemRating > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${rankInfo.bgColor} ${rankInfo.borderColor} ${rankInfo.textColor}`}
                        >
                          {sub.problemRating}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium text-zinc-500 bg-white/[0.03] border border-white/[0.05]">
                          —
                        </span>
                      )}
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-3 hidden md:table-cell text-zinc-400 font-mono text-[11px]">
                      {sub.language}
                    </td>

                    {/* Runtime & Memory */}
                    <td className="py-3.5 px-3 hidden sm:table-cell text-zinc-400 text-[11px]">
                      <span>{sub.runtimeMs} ms</span>
                      <span className="text-zinc-600 mx-1">•</span>
                      <span>{Math.round(sub.memoryKb / 1024)} MB</span>
                    </td>

                    {/* Time Ago */}
                    <td className="py-3.5 pr-1 text-right text-zinc-500 text-[11px]">
                      {formatTimeAgo(sub.submittedAtSeconds)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
