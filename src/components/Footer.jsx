import Link from "next/link";
import { Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-20">
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
                <Link
                  href="/search?filter=packages"
                  className="hover:underline"
                >
                  Care Packages
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/help" className="hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:underline">
                  Safety Information
                </Link>
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
                <Link href="/blog" className="hover:underline">
                  Mental Health Blog
                </Link>
              </li>
              <li>
                <Link href="/founders" className="hover:underline">
                  Our Story
                </Link>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <div className="p-2 bg-white rounded-full border border-gray-200 hover:border-secondary cursor-pointer transition-colors">
                <Instagram size={18} className="text-gray-600" />
              </div>
              <div className="p-2 bg-white rounded-full border border-gray-200 hover:border-secondary cursor-pointer transition-colors">
                <Twitter size={18} className="text-gray-600" />
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
            <Link href="/sitemap" className="hover:underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
