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
      <div className="w-full h-64 flex items-center justify-center text-xs text-slate-500">
        Loading skill radar...
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            stroke="#e2e8f0"
          />
          <Tooltip content={<RadarCustomTooltip />} />
          <Radar
            name="Proficiency"
            dataKey="proficiency"
            stroke="#0284c7"
            strokeWidth={2}
            fill="#38bdf8"
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
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
        <span className="font-extrabold text-slate-900 block">{item.subject}</span>
        <p className="text-slate-600">
          Proficiency:{" "}
          <strong className="text-sky-600 font-black">{item.proficiency}</strong>
          <span className="text-slate-400">/100</span>
        </p>
      </div>
    );
  }
  return null;
}
