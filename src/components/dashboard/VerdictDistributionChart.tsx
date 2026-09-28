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
    <div className="rounded-2xl glass-panel p-6 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Verdict Distribution</h2>
        <p className="text-xs text-slate-500 mt-0.5">
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
              stroke="#ffffff"
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
          <span className="text-2xl font-black text-slate-900">{totalSubmissions.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total</span>
        </div>
      </div>

      {/* Verdict Items Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
        {verdicts.map((v) => (
          <div
            key={v.verdict}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: v.color }}
              />
              <span className="text-xs text-slate-700 font-bold truncate">{v.verdict}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900">{v.count}</span>
              <span className="text-[10px] text-slate-400 ml-1 font-medium">({v.percentage}%)</span>
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
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span>{data.verdict}</span>
        </div>
        <p className="text-slate-600 text-[11px]">
          Count: <strong className="text-slate-900">{data.count.toLocaleString()}</strong> ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}
