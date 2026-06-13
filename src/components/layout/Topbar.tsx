import React, { useState, memo } from "react";
import { useStore } from "../../store";
import { Search, Bell, Sun, Moon, Sparkles, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import RewardedAdModal from "../tokens/RewardedAdModal";

export const Topbar = memo(function Topbar() {
  // Select atomic properties individually to avoid state subscription thrashing
  const currentUser = useStore((state) => state.currentUser);
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const currentView = useStore((state) => state.currentView);
  const setView = useStore((state) => state.setView);
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);
  const notifications = useStore((state) => state.notifications);

  const [adModalOpen, setAdModalOpen] = useState(false);

  // Safety fallback values
  const tokenBalance = currentUser?.token_balance || 0;
  const unreadCount = notifications
    ? notifications.filter((n) => !n.read).length
    : 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== "search") setView("search");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-linear-to-r from-red-700/90 via-orange-600/85 to-rose-700/90 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 rounded-2xl px-4 py-2.5 text-white">
          {/* Brand Logo */}
          <div
            onClick={() => setView(currentUser ? "home" : "landing")}
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-md shadow-orange-900/30 group-hover:scale-105 transition duration-300">
              <span className="font-serif text-base italic font-bold bg-linear-to-br from-red-500 to-orange-600 bg-clip-text text-transparent">
                P
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-300 animate-ping opacity-80" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-serif font-bold tracking-wide text-white leading-none">
                Palrene
              </h1>
              <p className="text-[8px] tracking-widest text-orange-200 uppercase font-mono">
                No boundaries
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Search souls, groups, hashtags..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/45 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl focus:outline-none focus:bg-white/20 focus:border-white/35 focus:ring-1 focus:ring-white/20 transition duration-300"
            />
          </div>

          {/* Right utility items */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Token balance */}
            {currentUser && (
              <motion.button
                onClick={() => setAdModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/25 hover:bg-amber-500/30 transition"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                title="Earn tokens by watching an ad"
                aria-label={`Token balance: ${tokenBalance}. Click to earn more.`}
              >
                <span className="text-amber-300 text-sm" aria-hidden="true">
                  ⬡
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tokenBalance}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-amber-200 font-bold text-xs tabular-nums hidden sm:block"
                  >
                    {tokenBalance.toLocaleString()}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            )}

            {/* Poly AI quick trigger */}
            {currentUser && (
              <button
                onClick={() => setView("ai-poly")}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition duration-300 ${
                  currentView === "ai-poly"
                    ? "ring-2 ring-yellow-300/60 bg-white/20"
                    : ""
                }`}
              >
                <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                <span className="hidden md:inline font-bold">Poly AI</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className="p-2 rounded-xl hover:bg-white/15 transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={17} className="text-amber-200" />
              ) : (
                <Moon size={17} className="text-white" />
              )}
            </button>

            {/* Notifications */}
            {currentUser && (
              <button
                onClick={() => setView("notifications")}
                className="relative p-2 rounded-xl hover:bg-white/15 transition group"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <Bell
                  size={17}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border border-white/20 text-[8px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile avatar / Sign in */}
            {currentUser ? (
              <div
                onClick={() => setView("profile")}
                className="flex items-center space-x-2 cursor-pointer select-none group border border-white/20 hover:border-white/40 p-1 pl-1 pr-2.5 rounded-xl bg-white/8 hover:bg-white/15 transition"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-lg object-cover border border-white/20 group-hover:scale-105 transition"
                />
                <span className="hidden lg:inline text-xs font-medium max-w-20 truncate">
                  {currentUser.full_name
                    ? currentUser.full_name.split(" ")[0]
                    : ""}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setView("landing")}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 bg-white rounded-xl hover:bg-orange-50 active:scale-98 transition shadow"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
      />
    </>
  );
});

export default Topbar;
