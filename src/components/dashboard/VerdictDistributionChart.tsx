"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { VerdictCount } from "@/types";
import { CheckCircle2, AlertCircle, Clock, Zap, Cpu, AlertTriangle } from "lucide-react";

interface VerdictDistributionChartProps {
  verdicts: VerdictCount[];
}

export function VerdictDistributionChart({ verdicts }: VerdictDistributionChartProps) {
  const totalSubmissions = verdicts.reduce((acc, v) => acc + v.count, 0);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Verdict Distribution</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Submission outcomes breakdown across all practice and contest problems.
        </p>
      </div>

      {/* Donut Chart with Center Label */}
      <div className="relative w-full h-56 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={verdicts}
              dataKey="count"
              nameKey="verdict"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={2}
            >
              {verdicts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<VerdictTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-white">{totalSubmissions.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Total</span>
        </div>
      </div>

      {/* Verdict Items Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
        {verdicts.map((v) => (
          <div
            key={v.verdict}
            className="flex items-center justify-between p-2 rounded-lg glass-panel-subtle border border-white/[0.04]"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: v.color }}
              />
              <span className="text-xs text-zinc-300 font-medium truncate">{v.verdict}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-white">{v.count}</span>
              <span className="text-[10px] text-zinc-500 ml-1">({v.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerdictTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data: VerdictCount = payload[0].payload;
    return (
      <div className="glass-panel p-2.5 rounded-lg border border-white/[0.15] shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span>{data.verdict}</span>
        </div>
        <p className="text-zinc-300 text-[11px]">
          Count: <strong className="text-white">{data.count.toLocaleString()}</strong> ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}
