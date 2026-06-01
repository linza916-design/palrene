import React, { useEffect } from "react";
import { useStore } from "./store";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import LandingPage from "./components/landing/LandingPage";
import HomeFeed from "./components/home/HomeFeed";
import DiscoverMasonry from "./components/discover/DiscoverMasonry";
import ChatList from "./components/chat/ChatList";
import ChatWindow from "./components/chat/ChatWindow";
import GroupsPanel from "./components/groups/GroupsPanel";
import ProfilePanel from "./components/profile/ProfilePanel";
import SettingsPanel from "./components/settings/SettingsPanel";
import NotificationsPanel from "./components/notifications/NotificationsPanel";
import SearchPanel from "./components/search/SearchPanel";
import AdminDashboard from "./components/admin/AdminDashboard";
import PolyChat from "./components/ai/PolyChat";
import AuthModal from "./components/modals/AuthModal";
import PostDetail from "./components/feed/PostDetail";

export default function App() {
  const { currentUser, currentView, registrationStep, theme, profiles } =
    useStore();

  useEffect(() => {
    useStore.getState().initializeDynamicData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  }, [theme]);

  const renderActiveView = () => {
    switch (currentView) {
      case "home":
        return <HomeFeed />;
      case "discover":
        return <DiscoverMasonry />;
      case "messages":
        return (
          <div className="flex-1 flex h-[calc(100vh-62px)] overflow-hidden">
            <ChatList />
            <div className="flex-1 h-full hidden md:flex">
              <ChatWindow />
            </div>
          </div>
        );
      case "groups":
        return <GroupsPanel />;
      case "profile":
        return <ProfilePanel />;
      case "settings":
        return <SettingsPanel />;
      case "notifications":
        return <NotificationsPanel />;
      case "search":
        return <SearchPanel />;
      case "admin": {
        const registeredHumans = (profiles || []).filter(
          (p) => p.id !== "poly-ai",
        );
        const isFirstThreeRegistered = registeredHumans
          .slice(0, 3)
          .some((p) => p.id === currentUser?.id);
        const isUserAdmin =
          isFirstThreeRegistered ||
          currentUser?.email.toLowerCase() === "kamyavince@gmail.com";
        return isUserAdmin ? <AdminDashboard /> : <HomeFeed />;
      }
      case "ai-poly":
        return <PolyChat />;
      case "post-detail":
        return <PostDetail />;
      default:
        return <HomeFeed />;
    }
  };

  // If there is no authenticated harbor user, serve the luxurious musical landing card screen
  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-black text-neutral-800 dark:text-neutral-150 transition-colors duration-300">
      {/* Sticky top-level luxury bar */}
      <Topbar />

      {/* Main viewport layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative select-none">
        {/* Desktop navigation side panel */}
        <Sidebar />

        {/* Dynamic focus dashboard wrapper */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-zinc-950/20">
          {renderActiveView()}
        </div>
      </div>

      {/* Mobile-only responsive low bar navigation */}
      <MobileNav />

      {/* Progressive Registration / Onboarding Modal Force-lock overlay */}
      {registrationStep > 0 && (
        <AuthModal
          isOpen={true}
          onClose={() => {}} // Empty callback to avoid closing on background clicks
        />
      )}
    </div>
  );
}
