"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Bell,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";
import { cn, getCodeforcesRank } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

export function Navbar() {
  const { profile, isSyncing, syncSuccess, isLoading, switchHandle, syncData } = useUser();
  const [handleInput, setHandleInput] = useState(profile.handle);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sync input with active profile handle when profile changes
  useEffect(() => {
    setHandleInput(profile.handle);
  }, [profile.handle]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handleInput.trim()) {
      await switchHandle(handleInput.trim());
    }
  };

  const handleQuickClick = async (targetHandle: string) => {
    setHandleInput(targetHandle);
    await switchHandle(targetHandle);
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-white/[0.07] px-6 lg:px-8 flex items-center justify-between bg-[#0a0e17]/80 backdrop-blur-2xl">
      {/* Search & Handle Switcher */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <form onSubmit={handleFormSubmit} className="relative w-full">
          <div className="relative">
            <Search
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                isSearchFocused ? "text-cyan-400" : "text-zinc-500"
              )}
            />
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search or enter Codeforces handle..."
              className={cn(
                "w-full h-10 pl-10 pr-28 bg-slate-900/60 border rounded-xl text-xs text-white placeholder-zinc-500 transition-all outline-none",
                isSearchFocused
                  ? "border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                  : "border-white/[0.08] hover:border-white/[0.16]"
              )}
            />
            {handleInput && (
              <button
                type="button"
                onClick={() => setHandleInput("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-[11px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all flex items-center gap-1 shadow-md shadow-cyan-500/20 disabled:opacity-50 hover:scale-102 active:scale-98"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : null}
              <span>Switch</span>
            </button>
          </div>
        </form>

        {/* Quick Handles suggestions */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick:</span>
          {["AC_on_first_TRY", "tourist", "Benq", "Alex_Algo"].map((h) => {
            const isCurrent = profile.handle.toLowerCase() === h.toLowerCase();
            return (
              <button
                key={h}
                type="button"
                onClick={() => handleQuickClick(h)}
                className={cn(
                  "px-2.5 py-0.5 text-[11px] font-semibold rounded-lg border transition-all duration-200",
                  isCurrent
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.15]"
                )}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Status Button */}
        <button
          onClick={syncData}
          disabled={isSyncing}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200",
            syncSuccess
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10"
              : "glass-panel-subtle border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]"
          )}
        >
          {syncSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5 text-cyan-400 transition-transform",
                isSyncing && "animate-spin"
              )}
            />
          )}
          <span>
            {isSyncing ? "Syncing CF..." : syncSuccess ? "Synced!" : `Synced ${profile.lastSyncedAt}`}
          </span>
        </button>

        {/* External Codeforces Link */}
        <a
          href={`https://codeforces.com/profile/${profile.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-subtle border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/[0.16] transition-all hover:bg-white/[0.05]"
        >
          <span>Codeforces</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        {/* AI Mentor Callout Button */}
        <Link
          href="/mentor"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border border-emerald-500/35 text-emerald-200 text-xs font-bold cursor-pointer hover:border-emerald-400/60 hover:text-white transition-all duration-300 shadow-md shadow-emerald-500/10 hover:scale-103"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">AI Mentor</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/30 rounded-md text-emerald-200 uppercase font-mono font-bold tracking-wider">
            Live
          </span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl glass-panel-subtle border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.16] transition-all hover:scale-105 active:scale-95">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0a0e17] animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
