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
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      trend: `${stats.solvedCount} unique ACs`,
      trendPositive: true,
    },
    {
      title: "Average Problem Difficulty",
      value: `${stats.avgSolvedRating}`,
      subtitle: "Avg. difficulty of solved problems",
      icon: TrendingUp,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      trend: stats.avgSolvedRating >= 1200 ? "Above Pupil tier" : "Targeting Pupil (1200)",
      trendPositive: stats.avgSolvedRating >= 1000,
    },
    {
      title: "Upsolve Clearance",
      value: `${stats.upsolveRate}%`,
      subtitle: "Missed contest problems solved",
      icon: Flame,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      trend: `${stats.contestsCount} official contests`,
      trendPositive: stats.contestsCount > 5,
    },
    {
      title: "Active Practice Streak",
      value: `${stats.currentStreakDays} Days`,
      subtitle: "Consecutive daily practice",
      icon: Zap,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
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
            className="rounded-2xl glass-panel p-5 border border-white/[0.08] hover:border-white/[0.15] transition-all relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400">{card.title}</p>
                <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.iconBg} ${card.borderColor} ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05] text-[11px]">
              <span className="text-zinc-500">{card.subtitle}</span>
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  card.trendPositive ? "text-emerald-400" : "text-amber-400"
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
