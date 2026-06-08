import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { motion } from "motion/react";

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

function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Light mode: warm white with subtle peach blobs */}
      <div className="absolute inset-0 bg-neutral-50 dark:bg-zinc-950 transition-colors duration-500" />
      <motion.div
        className="absolute w-150 h-150 rounded-full bg-orange-400/5 dark:bg-orange-500/6 blur-3xl"
        animate={{ x: [-80, 80, -80], y: [-60, 60, -60] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "5%", left: "-10%" }}
      />
      <motion.div
        className="absolute w-125 h-125 rounded-full bg-red-400/5 dark:bg-red-500/5 blur-3xl"
        animate={{ x: [60, -60, 60], y: [40, -40, 40] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        style={{ bottom: "10%", right: "-8%" }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-amber-400/4 dark:bg-amber-500/5 blur-3xl"
        animate={{ x: [-40, 40, -40], y: [-30, 60, -30] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8,
        }}
        style={{ top: "40%", left: "35%" }}
      />
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}

export default function App() {
  const { currentUser, currentView, registrationStep, theme, profiles } =
    useStore();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    useStore.getState().initializeDynamicData();
  }, []);

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

  useEffect(() => {
    let isMounted = true;
    // Grab the safe setter from your Zustand store
    const setCurrentUser = useStore.getState().setCurrentUser;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      if (session?.user) {
        // Use your dedicated action to cleanly sync state and localStorage together
        setCurrentUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: "",
          username: "",
          avatar_url: "",
        });
      } else {
        setCurrentUser(null);
      }

      if (authLoading) {
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [authLoading]);

  const renderActiveView = () => {
    switch (currentView) {
      case "home":
        return <HomeFeed />;
      case "discover":
        return <DiscoverMasonry />;
      case "messages":
        return (
          <div className="flex-1 flex h-[calc(100vh-70px)] overflow-hidden">
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
        const isUserAdmin =
          isFirstThreeRegistered ||
          ["kamyavince@gmail.com"].includes(
            currentUser?.email?.toLowerCase() ?? "",
          );
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950">
        <GlobalBackground />
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="font-serif text-xl font-bold text-white italic">
                P
              </span>
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-orange-400/60 animate-ping" />
          </div>
          <p className="text-sm font-mono text-neutral-500 dark:text-neutral-500 tracking-wider animate-pulse">
            Loading Palrene...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
      <GlobalBackground />
      <Topbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">{renderActiveView()}</div>
      </div>
      <MobileNav />
      {registrationStep > 0 && <AuthModal isOpen={true} onClose={() => {}} />}
    </div>
  );
}
