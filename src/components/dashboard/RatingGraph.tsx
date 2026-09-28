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
    <div className="rounded-2xl glass-panel p-6 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Rating Trajectory</h2>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md border shadow-sm ${currentRank.bgColor} ${currentRank.borderColor} ${currentRank.textColor}`}
            >
              Current: {currentRating}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical rating progression across official contests with Codeforces rank bands.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 self-start sm:self-auto shadow-xs">
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
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterRange === filter.key
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
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
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No rated contest history found for this handle.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={32}
                axisLine={{ stroke: "#e2e8f0" }}
              />

              <YAxis
                domain={["dataMin - 80", "dataMax + 80"]}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />

              {/* Context-aware Rank Goalpost Thresholds */}
              {maxRating >= 850 && (
                <ReferenceLine y={1200} stroke="#059669" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Pupil (1200)", fill: "#059669", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1150 && (
                <ReferenceLine y={1400} stroke="#0284c7" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Specialist (1400)", fill: "#0284c7", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1350 && (
                <ReferenceLine y={1600} stroke="#2563eb" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Expert (1600)", fill: "#2563eb", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1650 && (
                <ReferenceLine y={1900} stroke="#7c3aed" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Candidate Master (1900)", fill: "#7c3aed", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 1950 && (
                <ReferenceLine y={2100} stroke="#d97706" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Master (2100)", fill: "#d97706", fontSize: 10, position: "insideTopRight" }} />
              )}
              {maxRating >= 2250 && (
                <ReferenceLine y={2400} stroke="#dc2626" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Grandmaster (2400)", fill: "#dc2626", fontSize: 10, position: "insideTopRight" }} />
              )}

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="rating"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#ratingGradient)"
              activeDot={{ r: 6, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Footer Highlights */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-slate-200 text-center">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold">Max Peak</span>
          <p className="text-sm font-extrabold text-slate-900 mt-0.5">{maxRating}</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold">Last Delta</span>
          {(() => {
            const last = data[data.length - 1];
            const delta = formatRatingDelta(last?.ratingChange);
            return (
              <p
                className={`text-sm font-extrabold mt-0.5 ${
                  delta.isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {delta.text}
              </p>
            );
          })()}
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold">Total Tracked</span>
          <p className="text-sm font-extrabold text-sky-700 mt-0.5">{data.length} Contests</p>
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
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs max-w-xs space-y-1.5 z-50">
        <p className="font-extrabold text-slate-900 leading-snug">{point.contestName}</p>
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
          <span>Rank: <strong className="text-slate-900 font-bold">#{point.rank}</strong></span>
          <span>Date: <strong className="text-slate-700">{point.date}</strong></span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Rating:</span>
            <span className={`font-black text-sm ${rankInfo.textColor}`}>{point.rating}</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border shadow-xs ${
              delta.isPositive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
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
