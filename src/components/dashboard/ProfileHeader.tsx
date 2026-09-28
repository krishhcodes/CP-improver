"use client";

import { useState } from "react";
import { CFProfile, PerformanceStats } from "@/types";
import { getCodeforcesRank } from "@/lib/utils";
import { Trophy, Award, Target, Flame, TrendingUp, Sparkles, UserCheck } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: CFProfile;
  stats: PerformanceStats;
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const currentRank = getCodeforcesRank(profile.rating);
  const maxRank = getCodeforcesRank(profile.maxRating);

  const subline = [
    profile.fullName,
    profile.organization,
    profile.country,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-200/90 shadow-sm bg-white">
      {/* Background subtle ambient glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: currentRank.glowColor }}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-10 bg-sky-400 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Handle Info */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl p-[2px] shadow-md flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentRank.glowColor}, rgba(0,0,0,0.05))`,
              }}
            >
              <div className="w-full h-full bg-slate-100 rounded-[14px] overflow-hidden flex items-center justify-center font-black text-2xl text-slate-800">
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
            <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
              <span className="text-xs text-slate-500">
                World Est. <strong className="text-slate-800 font-bold">#{profile.globalRankEstimate.toLocaleString()}</strong>
              </span>
            </div>

            {subline && (
              <p className="text-xs text-slate-600 font-medium mt-1">
                {subline}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rating:</span>
                <span className="font-black text-slate-900 text-base">{profile.rating}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Max Rating:</span>
                <span className={`font-bold ${maxRank.textColor}`}>
                  {profile.maxRating} ({maxRank.name})
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Contribution:</span>
                <span className={profile.contribution >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                  {profile.contribution > 0 ? `+${profile.contribution}` : profile.contribution}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Highlights Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold justify-center sm:justify-start">
              <Target className="w-3.5 h-3.5 text-sky-600" />
              <span>Solved</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">{stats.solvedCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Problems</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold justify-center sm:justify-start">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Contests</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">{stats.contestsCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Best Rank #{stats.bestRank}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold justify-center sm:justify-start">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Upsolve</span>
            </div>
            <p className="text-xl font-black text-emerald-600 mt-1">{stats.upsolveRate}%</p>
            <p className="text-[10px] text-slate-400 font-medium">Post-contest</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold justify-center sm:justify-start">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Avg Rating</span>
            </div>
            <p className="text-xl font-black text-blue-600 mt-1">{stats.avgSolvedRating}</p>
            <p className="text-[10px] text-slate-400 font-medium">Difficulty</p>
          </div>
        </div>
      </div>
    </div>
  );
}
