"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Swords,
  Timer,
  Trophy,
  Users,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PresetContest {
  id: number;
  title: string;
  division: string;
  durationMinutes: number;
  problemCount: number;
  competitorCount: number;
  problems: {
    index: string;
    name: string;
    rating: number;
    tags: string[];
    points: number;
  }[];
}

export default function VirtualContestsLobby() {
  const router = useRouter();
  const { profile } = useUser();
  const [presets, setPresets] = useState<PresetContest[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [scoringMode, setScoringMode] = useState<"ICPC" | "CF">("ICPC");

  useEffect(() => {
    fetch("/api/virtual-contests")
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresets(data.presets);
        if (data.activeSession) setActiveSession(data.activeSession);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStartContest = async (contestId: number) => {
    try {
      setStartingId(contestId);
      const res = await fetch("/api/virtual-contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId,
          scoringMode,
          userHandle: profile.handle,
          userRating: profile.rating,
        }),
      });

      if (!res.ok) throw new Error("Failed to start virtual contest");
      const session = await res.json();
      router.push(`/virtual/${session.id}`);
    } catch (err) {
      console.error(err);
      alert("Error starting virtual contest. Please try again.");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
              <Swords className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Virtual Contest Arena
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                  Simulation
                </span>
              </h1>
              <p className="text-sm text-zinc-400">
                Train under authentic contest pressure with ticking clocks, dynamic bot rivals, and post-contest autopsy diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#0d131f] border border-white/[0.08] p-1.5 rounded-xl self-start md:self-auto">
          <span className="text-xs font-medium text-zinc-400 px-2">Scoring:</span>
          <button
            onClick={() => setScoringMode("ICPC")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              scoringMode === "ICPC"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            ICPC (Penalty)
          </button>
          <button
            onClick={() => setScoringMode("CF")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              scoringMode === "CF"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Codeforces (Decay)
          </button>
        </div>
      </div>

      {/* Active Session Resume Banner */}
      {activeSession && (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/30 via-amber-950/20 to-black p-6 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Contest Session in Progress
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeSession.contestTitle}</h2>
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-zinc-400" />
                  Elapsed: {Math.floor(activeSession.elapsedSeconds / 60)} / {activeSession.durationMinutes} mins
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Solved: {activeSession.participants?.find((p: any) => p.isUser)?.solvedCount || 0} /{" "}
                  {activeSession.problems?.length}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Current Rank: #{activeSession.participants?.find((p: any) => p.isUser)?.rank || 1}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/virtual/${activeSession.id}`}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Resume Arena
              </Link>
              <Link
                href={`/virtual/${activeSession.id}/autopsy`}
                className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 font-medium text-sm rounded-xl border border-white/[0.08] transition-all"
              >
                View Autopsy
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Available Contests Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Available Virtual Contests</h2>
          <p className="text-xs text-zinc-400">
            Select a verified round to simulate against calibrated competitor bots with dynamic submission timelines.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="glass-panel border border-white/[0.08] hover:border-orange-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {preset.division}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-zinc-400" />
                        {preset.durationMinutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {preset.competitorCount} competitors
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                    {preset.title}
                  </h3>

                  {/* Problem difficulty list */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Problems ({preset.problemCount})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preset.problems.map((p) => (
                        <div
                          key={p.index}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-1.5"
                        >
                          <span className="font-bold text-zinc-300">{p.index}</span>
                          <span className="text-[11px] text-zinc-400">({p.rating})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    Mode: <span className="font-semibold text-zinc-300">{scoringMode}</span>
                  </div>
                  <button
                    onClick={() => handleStartContest(preset.id)}
                    disabled={startingId === preset.id}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {startingId === preset.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Launch Virtual Contest
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Autopsy & Strategy Explainer Card */}
      <div className="glass-panel border border-white/[0.08] rounded-2xl p-6 bg-gradient-to-br from-indigo-950/20 via-transparent to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Why Virtual Contests Matter</h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Competitive programming performance in official rounds is rarely limited by theoretical knowledge alone.
              Most rating loss occurs due to <strong className="text-amber-300">Time Sink Traps</strong> (spending 50+ minutes stuck on a problem with 3 WA) and <strong className="text-amber-300">Opportunity Cost</strong> (never reading an easier Problem D because you were fixated on Problem C).
              Every Virtual Contest automatically generates a <strong className="text-indigo-300">Strategic Post-Contest Autopsy</strong> dissecting your time allocation, penalties, and tactical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
