"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Calendar, Zap, BarChart3, User } from "lucide-react";

export default function BottomNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // If there's no user or they haven't verified their email, do not show bottom navigation
  if (!user || !user.emailVerified) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Accueil", icon: <LayoutDashboard size={22} className="z-10" /> },
    { href: "/planning", label: "Planning", icon: <Calendar size={22} className="z-10" /> },
    { href: "/focus", label: "Focus", icon: <Zap size={20} fill="currentColor" /> },
    { href: "/stats", label: "Stats", icon: <BarChart3 size={22} className="z-10" /> },
    { href: "/profile", label: "Profil", icon: <User size={22} className="z-10" /> },
  ];

  const activeIndex = navItems.findIndex(item => isActive(item.href));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-white/40 dark:border-slate-800/50 pb-safe shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
      <div className="relative flex items-center justify-around h-[4.5rem] px-2">
        {/* Moving Indicator Pill */}
        <div
          className="absolute top-2 bottom-2 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          style={{
            width: `${100 / navItems.length}%`,
            left: `${(activeIndex === -1 ? 0 : activeIndex) * (100 / navItems.length)}%`,
            padding: '0 8px'
          }}
        >
          <div className="w-full h-full bg-primary/10 dark:bg-primary-light/10 rounded-2xl border border-primary/20 dark:border-primary-light/20" />
        </div>

        {navItems.map((item, idx) => {
          const active = activeIndex === idx;
          const isFocus = item.href === "/focus";

          if (isFocus) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative z-10 active:scale-90"
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-lg flex items-center justify-center text-white mb-5 border-4 border-white dark:border-gray-900 transition-all duration-500 ${active ? "scale-110 -translate-y-1 shadow-orange-500/40" : ""}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${active ? "text-primary dark:text-orange-400" : "text-gray-500 dark:text-gray-400 opacity-70"}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative z-10 active:scale-90 ${active ? "text-primary dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
            >
              <div className={`relative flex items-center justify-center transition-all duration-500 ${active ? "-translate-y-1" : ""}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${active ? "opacity-100" : "opacity-70"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
