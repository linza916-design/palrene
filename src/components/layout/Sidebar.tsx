import React from "react";
import { useStore } from "../../store";
import {
  Hop as Home,
  Compass,
  MessageCircle,
  Users,
  User,
  Bell,
  Search,
  Sparkles,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";

export default function Sidebar() {
  const { currentView, setView, currentUser, logout, profiles } = useStore();

  if (!currentUser) return null;

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "discover", label: "Discover Souls", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "groups", label: "Circles & Tribes", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "search", label: "Search", icon: Search },
    { id: "ai-poly", label: "Poly AI", icon: Sparkles, accent: true },
    { id: "settings", label: "Settings & Plans", icon: Settings },
  ];

  const registeredHumans = profiles.filter((p) => p.id !== "poly-ai");
  const isFirstThreeRegistered = registeredHumans
    .slice(0, 3)
    .some((p) => p.id === currentUser.id);
  const isUserAdmin =
    isFirstThreeRegistered ||
    currentUser.email.toLowerCase() === "kamyavince@gmail.com";

  if (isUserAdmin) {
    menuItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  const tokenBalance = currentUser.token_balance || 0;

  return (
    <aside className="w-60 hidden md:flex flex-col h-[calc(100vh-70px)] sticky top-17.5 border-r border-neutral-100 dark:border-neutral-900 bg-white dark:bg-zinc-950 p-3 justify-between transition-colors duration-300 overflow-y-auto">
      {/* Upper Navigation */}
      <div className="space-y-1">
        {/* Profile compact card */}
        <div className="mb-3 p-3.5 rounded-2xl bg-linear-to-br from-red-500/8 to-orange-500/8 dark:from-red-500/12 dark:to-orange-500/12 border border-orange-500/10 dark:border-orange-500/15">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar_url || "https://dicebear.com"}
                alt={currentUser.full_name || "User Profile"}
                className="w-9 h-9 rounded-xl object-cover border border-orange-500/20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-950" />
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <h4 className="text-xs font-bold truncate text-neutral-900 dark:text-white">
                {currentUser.full_name}
              </h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Tier + token row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {currentUser.subscription_tier
                ? `${currentUser.subscription_tier} Tier`
                : "Free Explorer"}
            </span>
            <button
              onClick={() => setView("settings")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[9px] font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition"
            >
              <span>⬡</span>
              <span className="font-bold">{tokenBalance.toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 outline-none ${
                  isActive
                    ? item.accent
                      ? "bg-linear-to-r from-yellow-500/15 to-orange-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                      : "bg-linear-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-orange-400 border border-red-500/10 dark:border-red-500/15 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/60 border border-transparent"
                }`}
                whileHover={{ x: isActive ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  size={17}
                  className={
                    isActive
                      ? item.accent
                        ? "text-yellow-500 dark:text-yellow-400"
                        : "text-red-500 dark:text-orange-400"
                      : "shrink-0"
                  }
                />
                <span className="tracking-wide text-xs">{item.label}</span>
                {item.id === "ai-poly" && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-900 mt-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-neutral-500 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-200 border border-transparent"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <p className="text-[9px] text-neutral-400 dark:text-neutral-700 text-center mt-2.5 font-mono">
          Palrene v1.5.0
        </p>
      </div>
    </aside>
  );
}
