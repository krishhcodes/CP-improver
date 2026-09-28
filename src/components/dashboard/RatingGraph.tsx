"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { RatingPoint } from "@/types";
import { getCodeforcesRank, formatRatingDelta } from "@/lib/utils";
import { TrendingUp, Award, Calendar } from "lucide-react";

interface RatingGraphProps {
  data: RatingPoint[];
}

export function RatingGraph({ data }: RatingGraphProps) {
  const [filterRange, setFilterRange] = useState<"ALL" | "RECENT_10" | "RECENT_5">("ALL");

  const filteredData =
    filterRange === "RECENT_5"
      ? data.slice(-5)
      : filterRange === "RECENT_10"
      ? data.slice(-10)
      : data;

  const currentRating = data[data.length - 1]?.rating ?? 1500;
  const maxRating = data.length > 0 ? Math.max(...data.map((d) => d.rating)) : currentRating;
  const currentRank = getCodeforcesRank(currentRating);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Rating Trajectory</h2>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${currentRank.bgColor} ${currentRank.borderColor} ${currentRank.textColor}`}
            >
              Current: {currentRating}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Historical rating progression across official contests with Codeforces rank bands.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel-subtle border border-white/[0.06] self-start sm:self-auto">
          {(
            [
              { key: "ALL", label: "All History" },
              { key: "RECENT_10", label: "Last 10" },
              { key: "RECENT_5", label: "Last 5" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterRange(filter.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                filterRange === filter.key
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            No rated contest history found for this handle.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={32}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />

              <YAxis
                domain={["dataMin - 80", "dataMax + 80"]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />

              {/* Context-aware Rank Goalpost Thresholds */}
              {maxRating >= 850 && (
                <ReferenceLine y={1200} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Pupil (1200)", fill: "#34d399", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1150 && (
                <ReferenceLine y={1400} stroke="#22d3ee" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Specialist (1400)", fill: "#22d3ee", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1350 && (
                <ReferenceLine y={1600} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Expert (1600)", fill: "#60a5fa", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1650 && (
                <ReferenceLine y={1900} stroke="#c084fc" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Candidate Master (1900)", fill: "#c084fc", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1950 && (
                <ReferenceLine y={2100} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Master (2100)", fill: "#fbbf24", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 2250 && (
                <ReferenceLine y={2400} stroke="#f87171" strokeDasharray="3 3" strokeOpacity={0.35} label={{ value: "Grandmaster (2400)", fill: "#f87171", fontSize: 10, position: "insideTopRight" }} />
              )}

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="rating"
              stroke="#818cf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#ratingGradient)"
              activeDot={{ r: 6, fill: "#818cf8", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Footer Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-white/[0.06] text-center">
        <div>
          <span className="text-[11px] text-zinc-500">Max Peak</span>
          <p className="text-sm font-bold text-white mt-0.5">{maxRating}</p>
        </div>
        <div>
          <span className="text-[11px] text-zinc-500">Last Delta</span>
          {(() => {
            const last = data[data.length - 1];
            const delta = formatRatingDelta(last?.ratingChange);
            return (
              <p
                className={`text-sm font-bold mt-0.5 ${
                  delta.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {delta.text}
              </p>
            );
          })()}
        </div>
        <div>
          <span className="text-[11px] text-zinc-500">Total Tracked</span>
          <p className="text-sm font-bold text-indigo-300 mt-0.5">{data.length} Contests</p>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const point: RatingPoint = payload[0].payload;
    const delta = formatRatingDelta(point.ratingChange);
    const rankInfo = getCodeforcesRank(point.rating);

    return (
      <div className="glass-panel p-3.5 rounded-xl border border-white/[0.15] shadow-2xl text-xs max-w-xs space-y-1.5 z-50">
        <p className="font-bold text-white leading-snug">{point.contestName}</p>
        <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-white/[0.08]">
          <span>Rank: <strong className="text-white">#{point.rank}</strong></span>
          <span>Date: <strong className="text-zinc-300">{point.date}</strong></span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Rating:</span>
            <span className={`font-black text-sm ${rankInfo.textColor}`}>{point.rating}</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
              delta.isPositive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {delta.text}
          </span>
        </div>
      </div>
    );
  }
  return null;
}
