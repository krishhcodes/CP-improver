"use client";

import { useState } from "react";
import { CFProfile, PerformanceStats } from "@/types";
import { Trophy, Award, Target, Flame, TrendingUp, Sparkles, UserCheck } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: CFProfile;
  stats: PerformanceStats;
}

// Dark-themed rank badge tokens for hero card
function getDarkRankStyle(rating: number | null | undefined) {
  if (!rating || rating <= 0) {
    return {
      name: "Unrated",
      textColor: "text-slate-300",
      bgColor: "bg-slate-800/90",
      borderColor: "border-slate-700",
      glowColor: "rgba(148, 163, 184, 0.2)",
    };
  }
  if (rating >= 3000) {
    return {
      name: "Legendary Grandmaster",
      textColor: "text-rose-400",
      bgColor: "bg-rose-950/60",
      borderColor: "border-rose-500/40",
      glowColor: "rgba(244, 63, 94, 0.35)",
    };
  }
  if (rating >= 2400) {
    return {
      name: "Grandmaster",
      textColor: "text-rose-400",
      bgColor: "bg-rose-950/60",
      borderColor: "border-rose-500/40",
      glowColor: "rgba(244, 63, 94, 0.3)",
    };
  }
  if (rating >= 2100) {
    return {
      name: "Master",
      textColor: "text-amber-400",
      bgColor: "bg-amber-950/60",
      borderColor: "border-amber-500/40",
      glowColor: "rgba(251, 191, 36, 0.3)",
    };
  }
  if (rating >= 1900) {
    return {
      name: "Candidate Master",
      textColor: "text-purple-400",
      bgColor: "bg-purple-950/60",
      borderColor: "border-purple-500/40",
      glowColor: "rgba(192, 132, 252, 0.3)",
    };
  }
  if (rating >= 1600) {
    return {
      name: "Expert",
      textColor: "text-blue-400",
      bgColor: "bg-blue-950/60",
      borderColor: "border-blue-500/40",
      glowColor: "rgba(96, 165, 250, 0.3)",
    };
  }
  if (rating >= 1400) {
    return {
      name: "Specialist",
      textColor: "text-cyan-400",
      bgColor: "bg-cyan-950/60",
      borderColor: "border-cyan-500/40",
      glowColor: "rgba(34, 211, 238, 0.3)",
    };
  }
  if (rating >= 1200) {
    return {
      name: "Pupil",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-950/60",
      borderColor: "border-emerald-500/40",
      glowColor: "rgba(52, 211, 153, 0.3)",
    };
  }
  return {
    name: "Newbie",
    textColor: "text-slate-300",
    bgColor: "bg-slate-800/90",
    borderColor: "border-slate-700",
    glowColor: "rgba(148, 163, 184, 0.2)",
  };
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const currentRank = getDarkRankStyle(profile.rating);
  const maxRank = getDarkRankStyle(profile.maxRating);

  const subline = [
    profile.fullName,
    profile.organization,
    profile.country,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background ambient glow highlights */}
      <div
        className="absolute -top-28 -right-28 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: currentRank.glowColor }}
      />
      <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full blur-3xl opacity-15 bg-sky-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Handle Info */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl p-[2px] shadow-lg flex items-center justify-center bg-gradient-to-tr from-sky-500/40 via-indigo-500/30 to-purple-500/40"
            >
              <div className="w-full h-full bg-slate-900 rounded-[14px] overflow-hidden flex items-center justify-center font-black text-2xl text-white">
                {profile.avatar && !imgError ? (
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.handle.slice(0, 2).toUpperCase()
                )}
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-200 shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CF</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${currentRank.textColor}`}>
                {profile.handle}
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${currentRank.bgColor} ${currentRank.borderColor} ${currentRank.textColor}`}
              >
                {currentRank.name}
              </div>
              <span className="text-xs text-slate-400">
                World Est. <strong className="text-white font-bold">#{profile.globalRankEstimate.toLocaleString()}</strong>
              </span>
            </div>

            {subline && (
              <p className="text-xs text-slate-400 font-medium mt-1">
                {subline}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Rating:</span>
                <span className="font-black text-white text-base">{profile.rating}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Max Rating:</span>
                <span className={`font-bold ${maxRank.textColor}`}>
                  {profile.maxRating} ({maxRank.name})
                </span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Contribution:</span>
                <span className={profile.contribution >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {profile.contribution > 0 ? `+${profile.contribution}` : profile.contribution}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Highlights Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50 transition-all text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold justify-center sm:justify-start">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>Solved</span>
            </div>
            <p className="text-2xl font-black text-white mt-1">{stats.solvedCount}</p>
            <p className="text-[10px] text-slate-500 font-medium">Problems</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50 transition-all text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold justify-center sm:justify-start">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Contests</span>
            </div>
            <p className="text-2xl font-black text-white mt-1">{stats.contestsCount}</p>
            <p className="text-[10px] text-slate-500 font-medium">Best Rank #{stats.bestRank}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50 transition-all text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold justify-center sm:justify-start">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Upsolve</span>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.upsolveRate}%</p>
            <p className="text-[10px] text-slate-500 font-medium">Post-contest</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50 transition-all text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold justify-center sm:justify-start">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Avg Rating</span>
            </div>
            <p className="text-2xl font-black text-sky-400 mt-1">{stats.avgSolvedRating}</p>
            <p className="text-[10px] text-slate-500 font-medium">Difficulty</p>
          </div>
        </div>
      </div>
    </div>
  );
}
