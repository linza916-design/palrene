import React from "react";
import { useStore } from "../../store";
import {
  Home,
  Compass,
  Bell,
  Search,
  User,
  Sparkles,
  Shield,
} from "lucide-react";

export default function MobileNav() {
  const { currentView, setView, currentUser, profiles } = useStore();

  if (!currentUser) return null;

  const dynamicProfile = profiles?.find((p) => p.id === currentUser.id);
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
    { id: "notifications", label: "Echoes", icon: Bell },
    { id: "search", label: "Search", icon: Search },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (isUserAdmin) {
    navItems.push({ id: "admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-150/90 dark:bg-black/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around py-2.5 px-4 pb-safe-bottom shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex flex-col items-center justify-center space-y-0.5 outline-none transition group"
          >
            <div
              className={`p-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-linear-to-r from-red-500/10 to-orange-500/10 text-red-500 dark:text-orange-400 scale-102"
                  : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white"
              }`}
            >
              <Icon size={18} />
            </div>
            <span
              className={`text-[9px] tracking-wide transition-colors ${
                isActive
                  ? "font-bold text-red-500 dark:text-orange-400"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
