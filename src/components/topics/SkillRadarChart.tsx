"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarSkill {
  subject: string;
  proficiency: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: RadarSkill[];
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-xs text-zinc-500">
        Loading skill radar...
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 9 }}
            stroke="rgba(255, 255, 255, 0.05)"
          />
          <Tooltip content={<RadarCustomTooltip />} />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke="#818cf8"
            strokeWidth={2}
            fill="#6366f1"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RadarCustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload as RadarSkill;
    return (
      <div className="glass-panel p-2.5 rounded-xl border border-white/[0.15] shadow-2xl text-xs space-y-1">
        <span className="font-bold text-white block">{item.subject}</span>
        <p className="text-zinc-300">
          Proficiency:{" "}
          <strong className="text-indigo-400 font-extrabold">{item.proficiency}</strong>
          <span className="text-zinc-500">/100</span>
        </p>
      </div>
    );
  }
  return null;
}
