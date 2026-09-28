"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Flame,
  Target,
  Sparkles,
  CalendarCheck,
  BookOpen,
  Repeat,
  Swords,
  Bot,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { cn, getCodeforcesRank } from "@/lib/utils";
import { CFProfile } from "@/types";
import { useUser } from "@/context/UserContext";

interface SidebarProps {
  profile?: CFProfile;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "AI CP Mentor", href: "/mentor", icon: Bot, badge: "AI" },
  { label: "Virtual Arena", href: "/virtual", icon: Swords, badge: "Live" },
  { label: "Contests & History", href: "/contests", icon: Trophy },
  { label: "Upsolve Queue", href: "/upsolve", icon: Flame, badge: "Live" },
  { label: "Topic Intelligence", href: "/topics", icon: Target },
  { label: "Recommendations", href: "/recommend", icon: Sparkles },
  { label: "Training Plan", href: "/training", icon: CalendarCheck },
  { label: "Knowledge Base", href: "/learn", icon: BookOpen },
  { label: "Spaced Revision", href: "/revision", icon: Repeat, badge: "3 Due" },
];

export function Sidebar({ profile: propProfile }: SidebarProps) {
  const pathname = usePathname();
  const context = useUser();
  const profile = propProfile || context.profile;
  const rank = getCodeforcesRank(profile.rating);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 glass-panel border-r border-white/[0.08] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <Link
          href="/"
          className="h-16 px-5 flex items-center gap-3 border-b border-white/[0.08] hover:bg-white/[0.03] transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">CP Intelligence</span>
              <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Analytics & Learning</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
            Platform
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/10 text-white font-semibold border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-semibold rounded-md",
                      item.badge.includes("Live")
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.badge.includes("New")
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Handle Footer Card */}
      <div className="p-3 border-t border-white/[0.08]">
        <Link
          href="/login"
          className="block p-3 rounded-xl glass-panel-subtle border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">
              Active Profile
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border overflow-hidden",
                  rank.bgColor,
                  rank.borderColor,
                  rank.textColor
                )}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.handle.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="truncate max-w-[120px]">
                <p className={cn("text-xs font-bold leading-none truncate", rank.textColor)}>
                  {profile.handle}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  {rank.name} • <span className="font-semibold text-zinc-300">{profile.rating}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
          </div>
        </Link>
      </div>
    </aside>
  );
}
