import React from "react";
import { useStore } from "../../store";
import { Search, Bell, Sun, Moon, Sparkles, LogIn, User } from "lucide-react";

export default function Topbar() {
  const { 
    currentUser, 
    theme, 
    setTheme, 
    currentView, 
    setView, 
    searchQuery, 
    setSearchQuery, 
    notifications 
  } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView !== "search") {
      setView("search");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-red-700/85 via-orange-600/80 to-rose-700/85 backdrop-blur-xl border-b border-white/10 shadow-lg px-4 py-3 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setView(currentUser ? "home" : "landing")} 
          className="flex items-center space-x-2 cursor-pointer select-none group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white text-orange-600 font-bold shadow-md shadow-orange-900/20 group-hover:scale-105 transition duration-300">
            <span className="font-serif text-lg italic bg-gradient-to-br from-red-500 to-orange-600 bg-clip-text text-transparent">P</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-serif font-bold tracking-wider bg-gradient-to-r from-white to-orange-100 bg-clip-text">
              Palrene
            </h1>
            <p className="text-[9px] tracking-widest text-orange-200 uppercase font-mono mt-[-3px]">
              No boundaries
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search matching souls, groups, hashtags..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2 pl-10 pr-4 text-sm text-white placeholder-white/50 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-full focus:outline-none focus:bg-white/20 focus:border-white/35 focus:ring-1 focus:ring-white/25 transition duration-300 shadow-inner"
          />
        </div>

        {/* Utility Items */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Quick AI Trigger */}
          {currentUser && (
            <button
              onClick={() => setView("ai-poly")}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-mono rounded-full bg-white/15 border border-white/25 hover:bg-white/25 hover:scale-103 active:scale-98 transition duration-300 shadow-sm ${
                currentView === "ai-poly" ? "ring-2 ring-yellow-300" : ""
              }`}
            >
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              <span className="hidden md:inline font-bold">Poly AI</span>
            </button>
          )}

          {/* Theme Toggle Button - ALWAYS WHITE TEXT/STYLING on TOPBAR */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
            className="p-2 transition rounded-full hover:bg-white/15 hover:scale-103 active:scale-97"
          >
            {theme === "dark" ? <Sun size={18} className="text-amber-200" /> : <Moon size={18} />}
          </button>

          {/* Notification Alert icon */}
          {currentUser && (
            <button
              onClick={() => setView("notifications")}
              className="relative p-2 transition rounded-full hover:bg-white/15 group"
            >
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border border-white text-[8px] font-bold text-white shadow-sm animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Avatar / Action Trigger */}
          {currentUser ? (
            <div 
              onClick={() => setView("profile")}
              className="flex items-center space-x-2 cursor-pointer select-none group border border-white/20 hover:border-white/40 p-1 pl-1 pr-2.5 rounded-full bg-white/5 hover:bg-white/10 transition"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full object-cover border border-white/20 group-hover:scale-102 transition"
              />
              <span className="hidden lg:inline text-xs font-medium max-w-[80px] truncate">
                {currentUser.full_name.split(" ")[0]}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setView("landing")}
              className="flex items-center space-x-1.5 px-4  py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 bg-white rounded-full hover:bg-orange-50 active:scale-98 transition shadow"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
