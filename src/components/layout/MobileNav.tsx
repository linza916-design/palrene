import React from "react";
import { useStore } from "../../store";
import {
  Hop as Home,
  Compass,
  Bell,
  MessageCircle,
  User,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

export default function MobileNav() {
  const { currentView, setView, currentUser, profiles, notifications } =
    useStore();

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const registeredHumans = (profiles || []).filter((p) => p.id !== "poly-ai");
  const isFirstThreeRegistered = registeredHumans
    .slice(0, 3)
    .some((p) => p.id === currentUser?.id);
  const isUserAdmin =
    isFirstThreeRegistered ||
    currentUser.email.toLowerCase() === "kamyavince@gmail.com";

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "ai-poly", label: "Poly", icon: Sparkles, accent: true },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (isUserAdmin) {
    navItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-zinc-950/95 backdrop-blur-2xl border-t border-neutral-200/60 dark:border-neutral-800/60 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-around px-2 py-2 pb-safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="relative flex flex-col items-center justify-center min-w-12 outline-none group"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? item.accent
                      ? "bg-linear-to-br from-yellow-500/20 to-orange-500/20 text-yellow-500 dark:text-yellow-400"
                      : "bg-linear-to-br from-red-500/12 to-orange-500/12 text-red-500 dark:text-orange-400"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
                whileTap={{ scale: 0.88 }}
              >
                <Icon size={20} />

                {/* Notification badge */}
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {/* Poly AI pulse */}
                {item.accent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                )}
              </motion.div>

              <span
                className={`text-[9px] font-mono mt-0.5 transition-colors leading-none ${
                  isActive
                    ? item.accent
                      ? "font-bold text-yellow-500 dark:text-yellow-400"
                      : "font-bold text-red-500 dark:text-orange-400"
                    : "text-neutral-400 dark:text-neutral-600"
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className={`absolute -bottom-0.5 w-4 h-0.5 rounded-full ${
                    item.accent
                      ? "bg-yellow-400"
                      : "bg-linear-to-r from-red-500 to-orange-500"
                  }`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
