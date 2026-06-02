import React from "react";
import { useStore } from "../../store";
import {
  Home,
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
  Gift,
} from "lucide-react";

export default function Sidebar() {
  const { currentView, setView, currentUser, logout, profiles } = useStore();

  if (!currentUser) return null;

  const menuItems = [
    { id: "home", label: "Home Base", icon: Home },
    { id: "discover", label: "Discover Souls", icon: Compass },
    { id: "messages", label: "Whisper Chats", icon: MessageCircle },
    { id: "groups", label: "Circles & Tribes", icon: Users },
    { id: "profile", label: "My Resonance", icon: User },
    { id: "notifications", label: "Echoes", icon: Bell },
    { id: "search", label: "Deep Search", icon: Search },
    { id: "ai-poly", label: "Guide Poly AI", icon: Sparkles, accent: true },
    { id: "settings", label: "Payment Plans & Settings", icon: Settings },
  ];

  const dynamicProfile = profiles.find((p) => p.id === currentUser.id);
  const registeredHumans = profiles.filter((p) => p.id !== "poly-ai");
  const isFirstThreeRegistered = registeredHumans
    .slice(0, 3)
    .some((p) => p.id === currentUser.id);
  const isUserAdmin =
    isFirstThreeRegistered ||
    currentUser.email.toLowerCase() === "kamyavince@gmail.com";

  if (isUserAdmin) {
    menuItems.push({ id: "admin", label: "Admin Sceptre", icon: Shield });
  }

  return (
    <aside className="w-64 hidden md:flex flex-col h-[calc(100vh-62px)] sticky top-15.5 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/40 p-4 justify-between transition-colors duration-300">
      {/* Upper Navigation */}
      <div className="space-y-1">
        {/* Connection status card */}
        <div className="p-4 mb-4 rounded-2xl bg-linear-to-br from-red-500/10 to-orange-500/10 border border-red-500/10 dark:border-red-500/15">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-10 h-10 rounded-full object-cover border border-orange-500/20"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-neutral-840 dark:text-white">
                {currentUser.full_name}
              </h4>
              <p className="text-[10px] text-neutral-500 font-mono truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Active subscription tier tag */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {currentUser.subscription_tier
                ? `${currentUser.subscription_tier} Tier`
                : currentUser.email.toLowerCase().includes("pro")
                  ? "Pro Tier"
                  : "Free Explorer"}
            </span>
            <button
              onClick={() => setView("settings")}
              className="text-[9px] font-mono text-neutral-400 hover:text-orange-500 transition underline underline-offset-2"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Dynamic Nav Paths */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition duration-300 transform outline-none border border-transparent ${
                  isActive
                    ? item.accent
                      ? "bg-linear-to-r from-yellow-500/15 to-orange-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 shadow-sm"
                      : "bg-linear-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-orange-400 border-red-500/10 dark:border-red-500/15 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive ? "text-red-500 dark:text-orange-400" : ""
                  }
                />
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Log out */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-300"
        >
          <LogOut size={18} />
          <span>Leave Harbor</span>
        </button>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-600 text-center mt-3 font-mono">
          Palrene v1.4.0 • Built for connection
        </p>
      </div>
    </aside>
  );
}
