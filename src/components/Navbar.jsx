"use client";

import Link from "next/link";
import React, { useState } from "react";
import { User, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/actions/auth";

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* --- LOGO --- */}
          <div className="flex shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                TherapyConnect
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/search"
              className="text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              Find a Therapist
            </Link>
            <Link
              href="/for-therapists"
              className="text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              For Therapists
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              How it Works
            </Link>
          </div>

          {/* --- RIGHT SIDE (Auth + Mobile Toggle) --- */}
          <div className="flex items-center gap-4">
            {/* Auth Button (Always visible) */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <button className="bg-primary text-white rounded-full p-2 hover:bg-gray-800 hover:shadow-md transition-all">
                    <User size={20} />
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary py-2 px-4 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="bg-secondary py-2.5 px-6 rounded-full shadow-soft text-white text-sm font-medium hover:shadow-lg hover:opacity-90 transition-all">
                  Sign In
                </button>
              </Link>
            )}

            {/* Hamburger Icon (Visible on mobile only) */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-primary focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU (Dropdown from Top) --- */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface border-b border-gray-100 shadow-lg z-40">
          <div className="flex flex-col p-4 space-y-4 items-center pb-8">
            <Link
              href="/search"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium text-primary hover:text-secondary"
            >
              Find a Therapist
            </Link>
            <Link
              href="/for-therapists"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium text-primary hover:text-secondary"
            >
              For Therapists
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-medium text-primary hover:text-secondary"
            >
              How it Works
            </Link>

            {user ? (
              <div className="flex flex-col gap-4 w-full px-4 pt-2">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full bg-primary text-white py-3 rounded-xl">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-100 text-primary py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-secondary font-medium"
                >
                  Login / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
