"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  ShieldAlert,
} from "lucide-react";

export default function AdminNav({ user }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Therapists", href: "/admin/therapists", icon: UserCheck },
    { name: "Booking Audit", href: "/admin/bookings", icon: FileText },
    { name: "User Base", href: "/admin/users", icon: Users },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* DESKTOP SIDEBAR - Clean & Professional */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 tracking-wide">
                Admin Console
              </h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-gray-100 text-gray-900 font-bold border border-gray-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={18}
                className={
                  isActive(item.href)
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-900"
                }
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MOBILE HEADER - Simplified */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 fixed top-20 w-full z-40 flex overflow-x-auto gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full border ${
              isActive(item.href)
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </>
  );
}
