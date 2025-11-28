"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Sparkles,
  Inbox,
  Users,
} from "lucide-react";

export default function TherapistNav({ user }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/therapist/dashboard", icon: LayoutDashboard },
    { name: "Requests", href: "/therapist/requests", icon: Inbox },
    { name: "My Clients", href: "/therapist/clients", icon: Users }, // NEW
    { name: "My Schedule", href: "/therapist/schedule", icon: Calendar },
    { name: "Settings", href: "/therapist/settings", icon: Settings },
  ];

  // Helper for active state styles
  const isActive = (path) => pathname === path;

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 bg-[#F2F5F4] border-r border-gray-200/60 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30">
        {/* Header: User Card */}
        <div className="p-6 pb-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                {user?.full_name?.charAt(0) || "T"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate">
                  Dr. {user?.full_name?.split(" ")[0] || "Therapist"}
                </p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Menu
          </p>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive(item.href)
                  ? "bg-white text-secondary shadow-soft font-semibold"
                  : "text-gray-500 hover:bg-white/60 hover:text-secondary"
              }`}
            >
              <item.icon
                size={20}
                className={
                  isActive(item.href)
                    ? "text-secondary"
                    : "text-gray-400 group-hover:text-secondary transition-colors"
                }
                strokeWidth={isActive(item.href) ? 2.5 : 2}
              />
              <span className="tracking-wide text-sm">{item.name}</span>
            </Link>
          ))}

          {/* Decorative Promo */}
          <div className="mt-8 mx-2 bg-gradient-to-br from-secondary/80 to-secondary text-white p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-secondary/20">
            <Sparkles
              className="absolute top-2 right-2 text-white/20"
              size={40}
            />
            <h4 className="font-bold text-sm relative z-10">Pro Tip</h4>
            <p className="text-xs text-white/90 mt-1 relative z-10 leading-relaxed">
              Accept requests within 2 hours to boost your ranking.
            </p>
          </div>
        </nav>
      </aside>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-4 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] safe-area-pb">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              isActive(item.href) ? "text-secondary scale-105" : "text-gray-400"
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-all ${
                isActive(item.href) ? "bg-secondary/10" : "bg-transparent"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive(item.href) ? 2.5 : 2}
                className={isActive(item.href) ? "fill-secondary/20" : ""}
              />
            </div>
          </Link>
        ))}
        <Link
          href="/therapist/settings"
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
            isActive("/therapist/settings") ? "text-secondary" : "text-gray-400"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-xs font-bold text-gray-600">
              {user?.full_name?.charAt(0)}
            </span>
          </div>
        </Link>
      </div>
    </>
  );
}
