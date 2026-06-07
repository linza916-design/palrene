// components/landing/Footer.tsx

import {
  Globe,
  Shield,
  HeartHandshake,
  Mail,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-linear-to-r from-pink-500 to-orange-500" />

              <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
                Palrene
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Relationships without boundaries. Discover friendships, meaningful
              relationships, communities, and connections that matter.
            </p>

            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <HeartHandshake size={16} />
              Human connection first
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Platform
            </h4>

            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="#features"
                  className="hover:text-orange-500 transition"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#communities"
                  className="hover:text-orange-500 transition"
                >
                  Communities
                </a>
              </li>

              <li>
                <a href="#poly" className="hover:text-orange-500 transition">
                  Poly AI
                </a>
              </li>

              <li>
                <a href="#pricing" className="hover:text-orange-500 transition">
                  Membership
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Company
            </h4>

            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Trust & Safety
            </h4>

            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Verified Profiles
              </div>

              <div className="flex items-center gap-2">
                <Globe size={16} />
                Global Community
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} />
                support@palrene.com
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            © 2026 Palrene. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-500">
            <a href="/privacy" className="hover:text-orange-500 transition">
              Privacy
            </a>

            <a href="/terms" className="hover:text-orange-500 transition">
              Terms
            </a>

            <a href="/guidelines" className="hover:text-orange-500 transition">
              Community Guidelines
            </a>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <Instagram size={18} />
            <Linkedin size={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}
