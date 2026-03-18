"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  // If there's no user or they haven't verified their email, do not show bottom navigation
  if (!user || !user.emailVerified) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const active = isActive(href);
    return (
      <Link 
        href={href} 
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative ${
          active ? "text-primary dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
      >
        <div className={`relative flex items-center justify-center transition-all duration-300 ${active ? "-translate-y-2 scale-110" : ""}`}>
          {active && (
            <span className="absolute inset-0 bg-primary/20 dark:bg-primary-light/30 rounded-full scale-150 blur-sm animate-pulse" />
          )}
          {icon}
        </div>
        <span className={`text-[10px] sm:text-xs font-medium mt-1 transition-all duration-300 ${active ? "opacity-100 transform translate-y-0" : "opacity-70"}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-white/40 dark:border-slate-800/50 pb-safe shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-20 px-4">
          <NavItem 
            href="/dashboard" 
            label="Accueil"
            icon={
              <svg className="w-6 h-6 z-10" fill={isActive("/dashboard") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/dashboard") ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            } 
          />
          <NavItem 
            href="/planning" 
            label="Planning"
            icon={
              <svg className="w-6 h-6 z-10" fill={isActive("/planning") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/planning") ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            } 
          />
          
          <NavItem 
            href="/focus" 
            label="Focus"
            icon={
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-lg flex items-center justify-center text-white mb-4 border-4 border-white dark:border-gray-900 transform active:scale-95 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C12 2 7 6.5 7 12C7 15.3137 9.68629 18 13 18C14.6569 18 16.1569 17.3284 17.2426 16.2426M12 2C12 2 15 5.5 15 9.5C15 11.7091 14.1046 13.7091 12.6569 15.1569C11.2091 16.6046 9.20914 17.5 7 17.5C4.79086 17.5 3 15.7091 3 13.5C3 11.2909 4.79086 9.29086 6.24264 7.83911" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            } 
          />
          
          <NavItem 
            href="/stats" 
            label="Stats"
            icon={
              <svg className="w-6 h-6 z-10" fill={isActive("/stats") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/stats") ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            } 
          />
          <NavItem 
            href="/profile" 
            label="Profil"
            icon={
              <svg className="w-6 h-6 z-10" fill={isActive("/profile") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive("/profile") ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } 
          />
        </div>
      </div>
    </>
  );
}
