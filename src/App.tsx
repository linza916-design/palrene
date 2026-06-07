import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

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

  const [authLoading, setAuthLoading] = useState(true);

  // Initialize app data
  useEffect(() => {
    useStore.getState().initializeDynamicData();
  }, []);

  // Theme handler
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  }, [theme]);

  // Restore existing session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          useStore.setState({
            currentUser: {
              id: session.user.id,
              email: session.user.email ?? "",
              full_name: "",
              username: "",
              avatar_url: "",
            },
          });
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);

      if (session?.user) {
        useStore.setState({
          currentUser: {
            id: session.user.id,
            email: session.user.email ?? "",
            full_name: "",
            username: "",
            avatar_url: "",
          },
        });
      } else {
        useStore.setState({
          currentUser: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

            <div className="flex-1 hidden md:flex">
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

        const ADMIN_EMAILS = ["kamyavince@gmail.com"];

        const isUserAdmin =
          isFirstThreeRegistered ||
          ADMIN_EMAILS.includes(currentUser?.email?.toLowerCase() ?? "");

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

  // Loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />

          <p className="text-sm text-neutral-500">Loading Palrene...</p>
        </div>
      </div>
    );
  }

  // Guest user
  if (!currentUser) {
    return <LandingPage />;
  }

  // Authenticated user
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-black text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
      <Topbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full relative">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-zinc-950/20">
          {renderActiveView()}
        </div>
      </div>

      <MobileNav />

      {registrationStep > 0 && <AuthModal isOpen={true} onClose={() => {}} />}
    </div>
  );
}
