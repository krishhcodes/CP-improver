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
    color: "text-sky-600",
    activeBg: "bg-sky-50/80 text-sky-950 font-bold border-sky-200 shadow-sm",
  },
  {
    label: "AI CP Mentor",
    href: "/mentor",
    icon: Bot,
    badge: "AI",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    color: "text-emerald-600",
    activeBg: "bg-emerald-50/80 text-emerald-950 font-bold border-emerald-200 shadow-sm",
  },
  {
    label: "Virtual Arena",
    href: "/virtual",
    icon: Swords,
    badge: "Live",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    color: "text-rose-600",
    activeBg: "bg-rose-50/80 text-rose-950 font-bold border-rose-200 shadow-sm",
  },
  {
    label: "Contests & History",
    href: "/contests",
    icon: Trophy,
    color: "text-amber-600",
    activeBg: "bg-amber-50/80 text-amber-950 font-bold border-amber-200 shadow-sm",
  },
  {
    label: "Upsolve Queue",
    href: "/upsolve",
    icon: Flame,
    badge: "Live",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    color: "text-orange-600",
    activeBg: "bg-orange-50/80 text-orange-950 font-bold border-orange-200 shadow-sm",
  },
  {
    label: "Topic Intelligence",
    href: "/topics",
    icon: Target,
    color: "text-violet-600",
    activeBg: "bg-violet-50/80 text-violet-950 font-bold border-violet-200 shadow-sm",
  },
  {
    label: "Recommendations",
    href: "/recommend",
    icon: Sparkles,
    color: "text-blue-600",
    activeBg: "bg-blue-50/80 text-blue-950 font-bold border-blue-200 shadow-sm",
  },
  {
    label: "Training Plan",
    href: "/training",
    icon: CalendarCheck,
    color: "text-teal-600",
    activeBg: "bg-teal-50/80 text-teal-950 font-bold border-teal-200 shadow-sm",
  },
  {
    label: "Knowledge Base",
    href: "/learn",
    icon: BookOpen,
    color: "text-cyan-600",
    activeBg: "bg-cyan-50/80 text-cyan-950 font-bold border-cyan-200 shadow-sm",
  },
  {
    label: "Spaced Revision",
    href: "/revision",
    icon: Repeat,
    badge: "3 Due",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    color: "text-pink-600",
    activeBg: "bg-pink-50/80 text-pink-950 font-bold border-pink-200 shadow-sm",
  },
];

export function Sidebar({ profile: propProfile }: SidebarProps) {
  const pathname = usePathname();
  const context = useUser();
  const profile = propProfile || context.profile;
  const rank = getCodeforcesRank(profile.rating);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 glass-panel border-r border-slate-200/80 flex flex-col justify-between select-none bg-white/95 backdrop-blur-2xl">
      {/* Brand Header */}
      <div>
        <Link
          href="/"
          className="h-16 px-5 flex items-center gap-3 border-b border-slate-200/80 hover:bg-slate-50 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-emerald-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                CP Intelligence
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-sky-100 text-sky-800 border border-sky-300 rounded tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Analytics & Learning</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border",
                  isActive
                    ? cn(item.activeBg, "translate-x-1")
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-1"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                      isActive ? item.color : "text-slate-400 group-hover:text-slate-700"
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
      <div className="p-3 border-t border-slate-200/80">
        <Link
          href="/login"
          className="block p-3 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-sky-700 transition-colors">
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
                <p className={cn("text-xs font-bold leading-none truncate group-hover:text-slate-900 transition-colors", rank.textColor)}>
                  {profile.handle}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  {rank.name} • <span className="font-bold text-slate-700">{profile.rating}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>
      </div>
    </aside>
  );
}
