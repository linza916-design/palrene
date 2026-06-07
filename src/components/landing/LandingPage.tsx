import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
const ReactPlayerComponent = ReactPlayer as any;
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import CustomSoundCloudPlayer from "../home/CustomSoundCloudPlayer";
import { features } from "../../data/landing/features";
import FeatureCard from "./FeatureCard";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Heart,
  Shield,
  Award,
  Zap,
  Globe,
  Smile,
  Mail,
  Lock,
  User,
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import AuthModal from "../modals/AuthModal";
import Footer from "./Footer";
import TestimonialsSection from "./testimonials/TestimonialsSection";
import AuthCard from "../auth/AuthCard";
import { supabase } from "@/src/lib/supabase";

export default function LandingPage() {
  const { login, signup, registrationStep } = useStore();

  {
    /*real login functionality */
  }
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    console.log("Logged in:", data.user);
  };

  {
    /*real signup functionality */
  }
  const handleSignup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    console.log("Signed up:", data.user);

    setPlaying(false);

    setAuthOpen(true);
  };

  // 1. Audio controls: start as false to comply with browser autoplay policies!
  const [playing, setPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState(
    "https://soundcloud.com/aphina-dog/indila-love-story-sped-up?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
  );
  const [audioError, setAudioError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Hidden high fidelity YouTube background music feed for Indila - Love Story
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.65);

  const toggleAmbientAudio = () => {
    setAmbientPlaying((prev) => !prev);
  };

  // Hero slide show index
  const [currentSlide, setCurrentSlide] = useState(0);

  // States for the inline registration/login section
  const [regMode, setRegMode] = useState<"signup" | "login">("signup");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const slides = [
    {
      title: "Meet Extraordinary People",
      desc: "Form authentic friendships with ambitious, creative, and inspiring individuals.",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80",
    },

    {
      title: "Love Beyond Limits",
      desc: "Find meaningful romantic connections rooted in understanding and genuine chemistry.",
      img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&auto=format&fit=crop&q=80",
    },

    {
      title: "Heal & Grow Together",
      desc: "Navigate relationship challenges with insights, support, and guided conversations.",
      img: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1000&auto=format&fit=crop&q=80",
    },

    {
      title: "Connect Across the World",
      desc: "Build friendships, partnerships, and communities that transcend distance.",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80",
    },

    {
      title: "Relationships Without Boundaries",
      desc: "One platform for friendship, dating, mentorship, networking, and human connection.",
      img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1000&auto=format&fit=crop&q=80",
    },
  ];

  // Auto slideshow carousel loop for top hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Peoples review mock data with lazy loaded avatars
  const reviews = [
    {
      name: "Julian Vance",
      role: "Astrophysicist",
      text: "Finding Palrene was like stumbling upon an underground vinyl jazz bar in Tokyo. Quiet, mature, deeply warm and intelligent.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Sophia Loris",
      role: "Acoustic Musician",
      text: "Poly helped me communicates with a shy seeker in Vienna in a way that felt like cursive poetry. Best relationship platform ever.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Zen Sato",
      role: "Tea practitioner",
      text: "No swipe cascades or flashy rating noise. Just true human resonances aligned without boundaries. Pure gold.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Marcus Aurel",
      role: "Philosophy Dev",
      text: "A truly quiet refuge. Communicating offline-first is amazing, and real identity matches is beautifully executed.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Clara Finch",
      role: "Creative Director",
      text: "Every single page has a meticulous Swiss layout style. Outstanding connection aesthetics compared to corporate swiping slop.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    },
  ];

  // Automatic scrolling setup for reviews section
  const [scrollIndex, setScrollIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  // Handle inline registration submit (Supabase Mock / Store Logic)
  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess(false);

    if (!regEmail || !regPassword) {
      setRegError("All fields must be compiled correctly.");
      return;
    }

    if (regMode === "signup" && regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    setRegLoading(true);

    try {
      if (regMode === "login") {
        const success = await login(regEmail, regPassword);
        if (success) {
          setRegSuccess(true);
        } else {
          setRegError("Invalid credentials or mismatch alignment.");
        }
      } else {
        // Sign Up with Supabase through store action
        await signup(regEmail, regPassword);

        // Music stops playing as requested when a successful registration happens!
        setPlaying(false);
        setRegSuccess(true);
      }
    } catch (err: any) {
      setRegError(err.message || "An auth alignment error occurred.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-neutral-800 dark:text-neutral-150 transition-colors duration-300 leading-normal">
      {/* 4. Sticky top-level luxury bar with BRAND name & Create Account button */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-pink-500 via-red-500 to-orange-500 animate-pulse" />

          <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Palrene
          </h1>

          <span className="text-[9px] font-mono uppercase bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-500 px-1.5 py-0.5 rounded leading-none">
            Relationships Without Boundaries
          </span>
        </div>

        <button
          onClick={() => {
            // Smoothly scroll down directly to bottom registration section as requested
            const regSection = document.getElementById("registration-section");
            if (regSection) {
              regSection.scrollIntoView({ behavior: "smooth" });
            } else {
              setAuthOpen(true);
            }
          }}
          className="px-4.5 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-150 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-neutral-50 dark:hover:bg-zinc-900 transition"
        >
          Find Your People
        </button>
      </header>

      {/* 1. LUXURY HERO BANNER SLIDESHOW - TOP */}
      <section className="relative min-h-210 py-16 w-full flex items-center justify-center overflow-hidden">
        {/* Dynamic Image Slideshow with smooth fade animation */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slides[currentSlide].img}
              alt="Cinematic sliding background"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              loading="lazy"
              className="w-full h-full object-cover filter brightness-[0.32]"
            />
          </AnimatePresence>
        </div>

        {/* Cinematic Red-to-Orange ambient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-red-950/25 dark:from-black" />

        {/* Hero Copy Content */}
        <div className="z-10 text-center max-w-3xl px-6 space-y-6">
          <div className="inline-flex flex-col items-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 select-none">
              <Sparkles
                size={11}
                className="text-yellow-300 fill-current animate-pulse"
              />
              <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">
                A living digital connection universe
              </span>
            </div>
            <p className="text-xs font-mono font-semibold text-orange-400 tracking-wider uppercase select-none">
              "Palrene" relationships no boundaries
            </p>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-none">
            {slides[currentSlide].title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-200 font-sans max-w-2xl mx-auto tracking-wide leading-relaxed">
            {slides[currentSlide].desc}
            <span className="block mt-2 text-xs text-neutral-350 italic">
              Making friends, finding mates, solving relationship issues, making
              connections.
            </span>
          </p>

          {/* Real YouTube Video backing track for Indila - Love Story (fully hidden) */}
          <div className="absolute w-0 h-0 overflow-hidden pointer-events-none select-none">
            <ReactPlayerComponent
              url="https://www.youtube.com/watch?v=DF3XjEhJ40Y"
              playing={ambientPlaying}
              volume={ambientVolume}
              loop={true}
              controls={false}
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                const regSection = document.getElementById(
                  "registration-section",
                );
                if (regSection)
                  regSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 bg-linear-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-550 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 transform hover:scale-103 active:scale-98 shadow shadow-orange-950/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Resonate Today</span>
              <ArrowRight size={13} />
            </button>

            {/* Premium Ambient Soundscape Trigger */}
            <button
              type="button"
              onClick={toggleAmbientAudio}
              className={`px-6 py-3.5 rounded-xl border text-white font-mono text-xs font-bold uppercase tracking-wider transition duration-300 flex items-center gap-2.5 shadow-md cursor-pointer ${
                ambientPlaying
                  ? "bg-linear-to-r from-orange-500 to-amber-500 border-transparent animate-pulse"
                  : "bg-white/10 hover:bg-white/20 border-white/20"
              }`}
            >
              {ambientPlaying ? (
                <Volume2 size={13} className="text-white animate-bounce" />
              ) : (
                <VolumeX size={13} className="text-zinc-300" />
              )}
              <span>
                {ambientPlaying ? "Soundscape On" : "Play Hero Music"}
              </span>

              {/* Animated Sound spectrum waves inside the button */}
              {ambientPlaying && (
                <span className="flex items-end gap-0.5 h-3 ml-1 select-none pointer-events-none">
                  {[1, 2, 3].map((val) => (
                    <span
                      key={val}
                      className="w-0.5 bg-white rounded-t animate-bounce"
                      style={{
                        height: `${30 + val * 20}%`,
                        animationDelay: `${val * 150}ms`,
                        animationDuration: "0.6s",
                      }}
                    />
                  ))}
                </span>
              )}
            </button>
          </div>

          <div className="mt-8 max-w-xl w-full mx-auto relative z-20">
            <CustomSoundCloudPlayer />
          </div>
        </div>
      </section>

      {/* 3. DESCRIBES THE FULL PLATFORM - Bento style grid with cards containing: images, details, and animations */}
      <section className="max-w-7xl mx-auto py-20 px-6 space-y-12 text-center">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-500 block">
            The Palrene Architecture
          </span>
          <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Built for human connection
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            One place to meet people, strengthen relationships, discover
            communities, and create lasting connections.
          </p>
        </div>

        {/* Dynamic modular cards with images, details, and micro-hover animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* 2. AUTO-SCROLLING REVIEWS TESTIMONIALS SECTION */}

      {/* If reviews are zero we would use fallback data. Here we have robust data + auto-scrolling animations */}

      <TestimonialsSection />
      {/* 5. BOTTOM REGISTRATION AREA - Handles login, sign in with Supabase, stops music and goes to progressive modal */}
      <AuthCard onLogin={handleLogin} onSignup={handleSignup} />

      {/* FOOTER COOPERATIVE */}
      <Footer />

      {/* 5. MULTI-STEP PROGRESSIVE ONBOARDING MODAL OVERLAY */}
      {/* isOpen handles both manually triggering it, and auto-opening it when store's registrationStep > 0 */}
      <AuthModal
        isOpen={authOpen || registrationStep > 0}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
