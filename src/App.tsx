import React, { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "./lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";

import { useStore } from "./store";
import {
  getOnboardingProfile,
  ensureOnboardingProfile,
  isOnboardingComplete,
  type OnboardingProfile,
} from "./lib/onboarding";

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

import AuthModal from "./components/modals/AuthModal";

import PostDetail from "./components/feed/PostDetail";
import PostModal from "./components/feed/PostModal";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";

import { ErrorBoundary, NetworkStatus, Skeleton } from "./components/ui";

// Lazy load heavy components for code splitting
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const PolyChat = lazy(() => import("./components/ai/PolyChat"));

type AppPhase = "loading" | "landing" | "onboarding" | "main";

function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
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
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [modalPostId, setModalPostId] = useState<string | null>(null);

  useEffect(() => {
    useStore.getState().initializeDynamicData();
  }, []);

  useEffect(() => {
    const checkPostUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const queryPostId = params.get("post");
      if (queryPostId) {
        setModalPostId(queryPostId);
        return;
      }
      const hash = window.location.hash;
      if (hash.startsWith("#/post/")) {
        const postId = hash.replace("#/post/", "");
        if (postId) setModalPostId(postId);
      }
    };
    checkPostUrl();
    window.addEventListener("hashchange", checkPostUrl);
    return () => window.removeEventListener("hashchange", checkPostUrl);
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

  // Main auth + onboarding state derivation
  // This is the single source of truth for app phase
  useEffect(() => {
    let isMounted = true;

    const resolvePhase = async (session: Session | null) => {
      if (!isMounted) return;

      // No session → landing page
      if (!session?.user) {
        useStore.getState().setCurrentUser(null);
        setPhase("landing");
        return;
      }

      const user = session.user;

      // Fetch or create the onboarding profile
      const profile = await ensureOnboardingProfile(user.id);

      if (!isMounted) return;

      if (!profile) {
        // Profile fetch/create failed — still set user so they aren't stuck
        // but show onboarding so they can try again
        useStore.getState().setCurrentUser({
          id: user.id,
          email: user.email ?? "",
          full_name:
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
          username: "",
          avatar_url: user.user_metadata?.avatar_url ?? "",
        });
        setPhase("onboarding");
        return;
      }

      // Derive onboarding state from the DB profile, not local state
      if (isOnboardingComplete(profile)) {
        // Onboarding complete → main app
        useStore.getState().setCurrentUser({
          id: user.id,
          email: user.email ?? "",
          full_name: profile.full_name ?? "",
          username: profile.username ?? "",
          avatar_url: profile.avatar_url ?? "",
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests,
          recognition_goals: profile.recognition_goals,
          token_balance: (profile as any).token_balance,
          subscription_tier: (profile as any).subscription_tier,
        });
        setPhase("main");
      } else {
        // Onboarding incomplete → show wizard (resumes from saved step)
        useStore.getState().setCurrentUser({
          id: user.id,
          email: user.email ?? "",
          full_name:
            profile.full_name ??
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            "",
          username: profile.username ?? "",
          avatar_url:
            profile.avatar_url ?? user.user_metadata?.avatar_url ?? "",
        });
        setPhase("onboarding");
      }
    };

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        resolvePhase(session);
      });

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        resolvePhase(session);
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = async () => {
    // Re-derive state from DB after onboarding completes
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await getOnboardingProfile(session.user.id);
      if (profile && isOnboardingComplete(profile)) {
        useStore.getState().setCurrentUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: profile.full_name ?? "",
          username: profile.username ?? "",
          avatar_url: profile.avatar_url ?? "",
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests,
          recognition_goals: profile.recognition_goals,
          token_balance: (profile as any).token_balance,
          subscription_tier: (profile as any).subscription_tier,
        });
      }
    }
    setPhase("main");
  };

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
        return isUserAdmin ? (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="space-y-4 w-full max-w-md">
                  <Skeleton variant="rectangular" className="h-12 w-full" />
                  <Skeleton variant="card" className="w-full" />
                  <Skeleton variant="card" className="w-full" />
                </div>
              </div>
            }
          >
            <AdminDashboard />
          </Suspense>
        ) : (
          <HomeFeed />
        );
      }
      case "ai-poly":
        return (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="space-y-4 w-full max-w-md">
                  <Skeleton variant="rectangular" className="h-32 w-full" />
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
              </div>
            }
          >
            <PolyChat />
          </Suspense>
        );
      case "post-detail":
        return <PostDetail />;
      default:
        return <HomeFeed />;
    }
  };

  // Phase: Loading
  if (phase === "loading") {
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

  // Phase: No auth → Landing
  if (phase === "landing") {
    return <LandingPage />;
  }

  // Phase: Authenticated but onboarding incomplete
  if (phase === "onboarding") {
    return (
      <>
        <GlobalBackground />
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // Phase: Main app
  return (
    <ErrorBoundary>
      <NetworkStatus />
      <div className="min-h-screen flex flex-col text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
        <GlobalBackground />
        <Topbar />
        <div className="flex-1 flex max-w-7xl mx-auto w-full relative">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {renderActiveView()}
          </div>
        </div>
        <MobileNav />
        {registrationStep > 0 && <AuthModal isOpen={true} onClose={() => {}} />}
        <AnimatePresence>
          {modalPostId && (
            <PostModal
              postId={modalPostId}
              onClose={() => setModalPostId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
