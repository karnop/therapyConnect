"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Linkedin } from "lucide-react";

// Helper for fake links
const ComingSoonLink = ({ children }) => (
  <span className="relative group cursor-not-allowed text-gray-400">
    {children}
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      Coming Soon
    </span>
  </span>
);

export default function Footer() {
  const pathname = usePathname();
  const isTherapistRoute = pathname?.startsWith("/therapist");

  return (
    <footer
      className={`bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-20 transition-all duration-300 ${
        isTherapistRoute ? "md:ml-72" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="text-lg font-bold text-primary">
                TherapyConnect
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Making mental healthcare accessible, transparent, and safe for
              everyone in Delhi NCR.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-primary mb-4">Discover</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/search?mode=online" className="hover:underline">
                  Online Therapy
                </Link>
              </li>
              <li>
                <Link href="/search?mode=offline" className="hover:underline">
                  In-Person Clinics
                </Link>
              </li>
              <li>
                <ComingSoonLink>Care Packages</ComingSoonLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <ComingSoonLink>Help Center</ComingSoonLink>
              </li>
              <li>
                <ComingSoonLink>Safety Information</ComingSoonLink>
              </li>
              <li>
                <Link href="/cancellation" className="hover:underline">
                  Cancellation Options
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-4">Community</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <ComingSoonLink>Mental Health Blog</ComingSoonLink>
              </li>
              <li>
                <ComingSoonLink>Our Story</ComingSoonLink>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <div className="p-2 bg-white rounded-full border border-gray-200 hover:border-secondary cursor-pointer transition-colors group">
                <Instagram
                  size={18}
                  className="text-gray-600 group-hover:text-secondary"
                />
              </div>
              <div className="p-2 bg-white rounded-full border border-gray-200 hover:border-secondary cursor-pointer transition-colors group">
                <Twitter
                  size={18}
                  className="text-gray-600 group-hover:text-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2025 TherapyConnect India Pvt Ltd.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <ComingSoonLink>Sitemap</ComingSoonLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
