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
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    color: "text-cyan-400",
    activeBg: "from-cyan-500/15 via-blue-500/10 to-transparent",
    border: "border-cyan-500/40",
  },
  {
    label: "AI CP Mentor",
    href: "/mentor",
    icon: Bot,
    badge: "AI",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    color: "text-emerald-400",
    activeBg: "from-emerald-500/15 via-teal-500/10 to-transparent",
    border: "border-emerald-500/40",
  },
  {
    label: "Virtual Arena",
    href: "/virtual",
    icon: Swords,
    badge: "Live",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    color: "text-rose-400",
    activeBg: "from-rose-500/15 via-pink-500/10 to-transparent",
    border: "border-rose-500/40",
  },
  {
    label: "Contests & History",
    href: "/contests",
    icon: Trophy,
    color: "text-amber-400",
    activeBg: "from-amber-500/15 via-yellow-500/10 to-transparent",
    border: "border-amber-500/40",
  },
  {
    label: "Upsolve Queue",
    href: "/upsolve",
    icon: Flame,
    badge: "Live",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    color: "text-orange-400",
    activeBg: "from-orange-500/15 via-amber-500/10 to-transparent",
    border: "border-orange-500/40",
  },
  {
    label: "Topic Intelligence",
    href: "/topics",
    icon: Target,
    color: "text-violet-400",
    activeBg: "from-violet-500/15 via-purple-500/10 to-transparent",
    border: "border-violet-500/40",
  },
  {
    label: "Recommendations",
    href: "/recommend",
    icon: Sparkles,
    color: "text-sky-400",
    activeBg: "from-sky-500/15 via-blue-500/10 to-transparent",
    border: "border-sky-500/40",
  },
  {
    label: "Training Plan",
    href: "/training",
    icon: CalendarCheck,
    color: "text-emerald-400",
    activeBg: "from-emerald-500/15 via-cyan-500/10 to-transparent",
    border: "border-emerald-500/40",
  },
  {
    label: "Knowledge Base",
    href: "/learn",
    icon: BookOpen,
    color: "text-teal-400",
    activeBg: "from-teal-500/15 via-emerald-500/10 to-transparent",
    border: "border-teal-500/40",
  },
  {
    label: "Spaced Revision",
    href: "/revision",
    icon: Repeat,
    badge: "3 Due",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    color: "text-pink-400",
    activeBg: "from-pink-500/15 via-rose-500/10 to-transparent",
    border: "border-pink-500/40",
  },
];

export function Sidebar({ profile: propProfile }: SidebarProps) {
  const pathname = usePathname();
  const context = useUser();
  const profile = propProfile || context.profile;
  const rank = getCodeforcesRank(profile.rating);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 glass-panel border-r border-white/[0.08] flex flex-col justify-between select-none bg-[#0a0e17]/90 backdrop-blur-2xl">
      {/* Brand Header */}
      <div>
        <Link
          href="/"
          className="h-16 px-5 flex items-center gap-3 border-b border-white/[0.07] hover:bg-white/[0.03] transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-amber-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/15 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                CP Intelligence
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 rounded tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Analytics & Learning</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                  isActive
                    ? cn(
                        "bg-gradient-to-r text-white font-semibold border shadow-md",
                        item.activeBg,
                        item.border,
                        "shadow-cyan-500/5 translate-x-1"
                      )
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-1"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                      isActive ? item.color : "text-zinc-500 group-hover:text-zinc-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[9px] font-bold rounded-md border",
                      item.badgeColor
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
      <div className="p-3 border-t border-white/[0.07]">
        <Link
          href="/login"
          className="block p-3 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-cyan-300 transition-colors">
              Active Profile
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border overflow-hidden shadow-sm",
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
                <p className={cn("text-xs font-bold leading-none truncate group-hover:text-white transition-colors", rank.textColor)}>
                  {profile.handle}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                  {rank.name} • <span className="font-semibold text-zinc-200">{profile.rating}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>
      </div>
    </aside>
  );
}
