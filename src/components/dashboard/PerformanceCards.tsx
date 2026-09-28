"use client";

import { PerformanceStats } from "@/types";
import {
  Trophy,
  Flame,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface PerformanceCardsProps {
  stats: PerformanceStats;
}

export function PerformanceCards({ stats }: PerformanceCardsProps) {
  const cards = [
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      subtitle: `${stats.solvedCount} solved / ${stats.attemptedCount} attempts`,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      trend: `${stats.solvedCount} unique ACs`,
      trendPositive: true,
    },
    {
      title: "Average Problem Difficulty",
      value: `${stats.avgSolvedRating}`,
      subtitle: "Avg. difficulty of solved problems",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: stats.avgSolvedRating >= 1200 ? "Above Pupil tier" : "Targeting Pupil (1200)",
      trendPositive: stats.avgSolvedRating >= 1000,
    },
    {
      title: "Upsolve Clearance",
      value: `${stats.upsolveRate}%`,
      subtitle: "Missed contest problems solved",
      icon: Flame,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      borderColor: "border-rose-200",
      trend: `${stats.contestsCount} official contests`,
      trendPositive: stats.contestsCount > 5,
    },
    {
      title: "Active Practice Streak",
      value: `${stats.currentStreakDays} Days`,
      subtitle: "Consecutive daily practice",
      icon: Zap,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      borderColor: "border-amber-200",
      trend: stats.currentStreakDays >= 3 ? "Active streak ongoing" : "Start your streak today",
      trendPositive: stats.currentStreakDays >= 2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl glass-panel p-5 border border-slate-200/90 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group bg-white shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${card.iconBg} ${card.borderColor} ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px]">
              <span className="text-slate-400">{card.subtitle}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  card.trendPositive ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <span>{card.trend}</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
