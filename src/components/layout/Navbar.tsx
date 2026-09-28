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
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between bg-white/85 backdrop-blur-xl">
      {/* Search & Handle Switcher */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <form onSubmit={handleFormSubmit} className="relative w-full">
          <div className="relative">
            <Search
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
                isSearchFocused ? "text-sky-600" : "text-slate-400"
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
                "w-full h-10 pl-10 pr-28 bg-slate-100/80 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none",
                isSearchFocused
                  ? "bg-white border-sky-500 ring-2 ring-sky-500/20 shadow-md shadow-sky-500/5"
                  : "border-slate-200/90 hover:border-slate-300"
              )}
            />
            {handleInput && (
              <button
                type="button"
                onClick={() => setHandleInput("")}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-[11px] font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 hover:scale-102 active:scale-98"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : null}
              <span>Switch</span>
            </button>
          </div>
        </form>

        {/* Quick Handles suggestions */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick:</span>
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
                    ? "bg-sky-100 text-sky-800 border-sky-300 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200"
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
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-sm",
            syncSuccess
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/5"
              : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          {syncSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5 text-sky-600 transition-transform",
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
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <span>Codeforces</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* AI Mentor Callout Button */}
        <Link
          href="/mentor"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer hover:border-emerald-300 transition-all duration-300 shadow-sm hover:scale-103"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="hidden sm:inline">AI Mentor</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-200/70 rounded-md text-emerald-900 uppercase font-mono font-bold tracking-wider">
            Live
          </span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm hover:scale-105 active:scale-95">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
