import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { features } from "../../data/landing/features";
import FeatureCard from "./FeatureCard";
import { ArrowRight, Heart, Shield, Sparkles, Users, MessageCircle, Zap, Volume2, VolumeX, Globe, CircleCheck as CheckCircle, TrendingUp, Award, ChevronRight, Radio } from "lucide-react";
import AuthModal from "../modals/AuthModal";
import Footer from "./Footer";
import TestimonialsSection from "./testimonials/TestimonialsSection";
import AuthCard from "../auth/AuthCard";
import { supabase } from "@/src/lib/supabase";

const SC_TRACK_URL = "https://soundcloud.com/aphina-dog/indila-love-story-sped-up";
const scEmbedUrl = (autoplay: boolean) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(SC_TRACK_URL)}&color=%23f97316&auto_play=${autoplay ? "true" : "false"}&hide_related=true&show_comments=false&show_user=true&show_reposts=false`;

// Animated stat counter
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Floating ambient particles
function AmbientParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-orange-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Floating social proof card
function FloatingCard({
  children,
  className = "",
  delay = 0,
  floatY = 8,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  floatY?: number;
}) {
  return (
    <motion.div
      className={`absolute bg-white/10 dark:bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/20 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [-floatY / 2, floatY / 2, -floatY / 2] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Rotating headline words
const subHeadlines = [
  "Find Your People",
  "Build Real Connections",
  "Discover Meaningful Bonds",
  "Heal & Grow Together",
  "Love Without Limits",
  "Connect Across the World",
];

export default function LandingPage() {
  const { login, signup, registrationStep } = useStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [scInteracted, setScInteracted] = useState(false);
  const [subIndex, setSubIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubIndex((prev) => (prev + 1) % subHeadlines.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log("Logged in:", data.user);
  };

  const handleSignup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    console.log("Signed up:", data.user);
    setAuthOpen(true);
  };

  const scrollToReg = () => {
    document.getElementById("registration-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { value: 10000, suffix: "+", label: "Meaningful Connections" },
    { value: 2000000, suffix: "+", label: "Messages Sent" },
    { value: 120, suffix: "+", label: "Communities" },
    { value: 98, suffix: "%", label: "Positive Experiences" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-neutral-800 dark:text-neutral-100 overflow-x-hidden">

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-4 mt-3 mb-1 rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-neutral-200/60 dark:border-white/10 shadow-lg shadow-black/5 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-orange-500/30">
              <span className="font-serif text-sm font-bold text-white italic">P</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-300 animate-ping opacity-80" />
            </div>
            <div>
              <span className="text-base font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
                Palrene
              </span>
              <span className="ml-2 hidden sm:inline text-[9px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-widest">
                Relationships Without Boundaries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScInteracted((p) => !p)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border transition-all duration-300 ${
                scInteracted
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-orange-500/50 hover:text-orange-500"
              }`}
            >
              {scInteracted ? <Volume2 size={11} className="animate-pulse" /> : <Radio size={11} />}
              {scInteracted ? "Music On" : "Play Music"}
            </button>

            <button
              onClick={scrollToReg}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 transition-all duration-300 hover:scale-105 active:scale-98"
            >
              <span>Join Free</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── CINEMATIC HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-950">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(239,68,68,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(249,115,22,0.12) 0%, transparent 60%)",
                "radial-gradient(ellipse 80% 60% at 60% 20%, rgba(239,68,68,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 20% 80%, rgba(249,115,22,0.15) 0%, transparent 60%)",
                "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(239,68,68,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(249,115,22,0.12) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Warm ambient blobs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-red-500/8 blur-3xl"
            animate={{ x: [-60, 60, -60], y: [-40, 40, -40] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "10%", left: "5%" }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-orange-500/10 blur-3xl"
            animate={{ x: [40, -40, 40], y: [30, -30, 30] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            style={{ bottom: "15%", right: "8%" }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-amber-500/6 blur-3xl"
            animate={{ x: [-30, 30, -30], y: [-20, 50, -20] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            style={{ top: "50%", left: "40%" }}
          />
        </div>
        <AmbientParticles />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          style={{ y: heroParallax, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* LEFT — Headline & CTAs */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                <Sparkles size={11} className="text-yellow-300 fill-current animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/80">
                  A living digital connection universe
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.02] tracking-tight">
                Relationships
                <br />
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Without
                </span>
                <br />
                Boundaries.
              </h1>

              {/* Animated rotating subheadline */}
              <div className="mt-5 h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={subIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="text-lg sm:text-xl font-sans text-orange-300/90 font-medium"
                  >
                    {subHeadlines[subIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <p className="mt-4 text-sm sm:text-base text-white/55 leading-relaxed max-w-lg">
                One platform for friendship, dating, mentorship, healing, and every form of human connection. Built for people who believe that every bond matters.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={scrollToReg}
                className="group flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 active:scale-98"
              >
                <span>Start for Free</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setScInteracted((p) => !p)}
                className={`flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  scInteracted
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/8 border-white/15 text-white/70 hover:bg-white/15 hover:border-white/30 hover:text-white"
                }`}
              >
                {scInteracted ? (
                  <>
                    <Radio size={14} className="animate-pulse text-orange-300" />
                    <span>Music Playing</span>
                    <span className="flex items-end gap-0.5 h-3">
                      {[1, 2, 3, 4].map((v) => (
                        <span
                          key={v}
                          className="w-0.5 bg-orange-300 rounded-t animate-bounce"
                          style={{
                            height: `${25 + v * 18}%`,
                            animationDelay: `${v * 120}ms`,
                            animationDuration: "0.7s",
                          }}
                        />
                      ))}
                    </span>
                  </>
                ) : (
                  <>
                    <Radio size={14} />
                    <span>Play Hero Music</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* SoundCloud floating player — visible after user clicks Play */}
            <AnimatePresence>
              {scInteracted && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/40"
                >
                  <iframe
                    title="Palrene Hero Music — Indila Love Story"
                    width="100%"
                    height="140"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={scEmbedUrl(true)}
                    className="block"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust indicators */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {[
                { icon: Shield, text: "Verified Profiles" },
                { icon: CheckCircle, text: "Free to Join" },
                { icon: Globe, text: "Global Community" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/50 text-[11px] font-mono">
                  <Icon size={12} className="text-green-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Floating social cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px]">
            {/* Base glow orb */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 blur-3xl" />

            {/* Profile card — top left */}
            <FloatingCard className="top-4 left-0 w-56 p-4" delay={0.4} floatY={10}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-400/40"
                    alt="User"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/20" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Julian Vance</p>
                  <p className="text-[10px] text-white/50 font-mono">Astrophysicist · NYC</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/20 rounded-xl">
                <Heart size={10} className="text-red-400 fill-current" />
                <span className="text-[10px] text-white/70 font-mono">98% compatibility match</span>
              </div>
            </FloatingCard>

            {/* Connection request card — top right */}
            <FloatingCard className="top-12 right-0 w-52 p-3.5" delay={0.6} floatY={12}>
              <div className="flex items-center gap-2 mb-2.5">
                <Users size={13} className="text-orange-400" />
                <span className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-wider">New Connection</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  className="w-8 h-8 rounded-full object-cover"
                  alt="Sophia"
                />
                <div>
                  <p className="text-[11px] font-semibold text-white">Sophia Loris</p>
                  <p className="text-[9px] text-white/50">wants to connect</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="flex-1 py-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold font-mono uppercase tracking-wider">Accept</button>
                <button className="flex-1 py-1 rounded-lg bg-white/10 text-white/60 text-[9px] font-mono uppercase tracking-wider">Later</button>
              </div>
            </FloatingCard>

            {/* Token reward card — center */}
            <FloatingCard className="top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-48 p-3.5" delay={0.5} floatY={6}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 text-lg">⬡</span>
                <div>
                  <p className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-wider">Token Earned</p>
                  <p className="text-[9px] text-white/40">Daily reward claimed</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-500/15 rounded-xl border border-amber-500/20">
                <span className="text-[10px] text-amber-300 font-mono font-bold">+50 tokens</span>
                <Zap size={11} className="text-amber-400 animate-pulse" />
              </div>
            </FloatingCard>

            {/* Message preview card — bottom left */}
            <FloatingCard className="bottom-20 left-2 w-56 p-3.5" delay={0.7} floatY={9}>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={12} className="text-orange-400" />
                <span className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-wider">New Message</span>
                <span className="ml-auto text-[9px] text-white/30 font-mono">2m ago</span>
              </div>
              <div className="flex items-start gap-2">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                  alt="Zen"
                />
                <div>
                  <p className="text-[11px] font-semibold text-white">Zen Sato</p>
                  <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">
                    "Your perspective on this resonates deeply with me..."
                  </p>
                </div>
              </div>
            </FloatingCard>

            {/* AI recommendation — bottom right */}
            <FloatingCard className="bottom-8 right-0 w-52 p-3.5" delay={0.8} floatY={11}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-yellow-400 fill-current animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-wider">Poly AI Suggests</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                3 new soul matches based on your interests in music and philosophy.
              </p>
              <button className="mt-2 flex items-center gap-1 text-[10px] font-mono text-orange-400 hover:text-orange-300 transition">
                <span>View matches</span>
                <ChevronRight size={10} />
              </button>
            </FloatingCard>

            {/* Active users badge — floating */}
            <FloatingCard className="bottom-2 left-1/2 -translate-x-1/2 px-4 py-2" delay={0.9} floatY={5}>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=40&auto=format&fit=crop&q=80",
                  ].map((src, i) => (
                    <img key={i} src={src} className="w-6 h-6 rounded-full border-2 border-white/10 object-cover" alt="" />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-white/70">
                  <span className="text-green-400 font-bold">1,247</span> online now
                </span>
              </div>
            </FloatingCard>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-white/40"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── ANIMATED STATS ─── */}
      <section className="relative py-16 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="text-3xl sm:text-4xl font-serif font-bold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs font-mono text-white/70 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="max-w-7xl mx-auto py-24 px-6 space-y-14">
        <motion.div
          className="text-center space-y-3 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 block">
            The Palrene Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
            Built for human connection
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            One place to meet people, strengthen relationships, discover communities, and create lasting connections.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection />

      {/* ─── PLATFORM PREVIEW STRIP ─── */}
      <section className="py-20 bg-neutral-50 dark:bg-zinc-950 overflow-hidden">
        <motion.div
          className="text-center mb-12 px-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 block mb-2">
            Experience the Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white">
            Every connection, one place
          </h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-5">
          {[
            {
              img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
              label: "Discover Souls",
              desc: "Find people who resonate with your frequency",
              accent: "from-red-500/80 to-orange-500/80",
              icon: Users,
            },
            {
              img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80",
              label: "Meaningful Bonds",
              desc: "Build real friendships and romantic connections",
              accent: "from-pink-500/80 to-red-500/80",
              icon: Heart,
            },
            {
              img: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=600&auto=format&fit=crop&q=80",
              label: "AI-Guided Healing",
              desc: "Navigate relationships with Poly AI by your side",
              accent: "from-amber-500/80 to-orange-500/80",
              icon: Sparkles,
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                className="relative rounded-3xl overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.accent} to-transparent opacity-70`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-white" />
                      <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">{card.label}</span>
                    </div>
                    <p className="text-[11px] text-white/75 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── WHY PALRENE ─── */}
      <section className="max-w-5xl mx-auto py-20 px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 block mb-2">
            Why Palrene
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white">
            Different by design
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Shield, title: "Verified Profiles", desc: "Every member is verified for authentic, safe connections.", color: "text-green-500" },
            { icon: Sparkles, title: "AI-Powered Matching", desc: "Poly AI finds your compatibility beyond surface metrics.", color: "text-yellow-500" },
            { icon: Heart, title: "All Relationship Types", desc: "Friendship, romance, mentorship — no judgment, no limits.", color: "text-red-500" },
            { icon: TrendingUp, title: "Token Rewards", desc: "Earn tokens for positive engagement and connection.", color: "text-amber-500" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-neutral-100 dark:border-neutral-900 hover:border-orange-500/30 dark:hover:border-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${item.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-zinc-900 to-neutral-950">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 70% 50% at 30% 50%, rgba(239,68,68,0.12) 0%, transparent 70%)",
                "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)",
                "radial-gradient(ellipse 70% 50% at 30% 50%, rgba(239,68,68,0.12) 0%, transparent 70%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <AmbientParticles />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center px-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
            <Award size={11} className="text-yellow-300" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/70">
              Join 10,000+ connected souls
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            Your people are{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              already here.
            </span>
          </h2>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Start your journey toward authentic connection. Free forever, no credit card needed.
          </p>
          <button
            onClick={scrollToReg}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-mono text-sm font-bold uppercase tracking-wider rounded-2xl shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105 active:scale-98"
          >
            <span>Resonate Today</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ─── AUTH CARD ─── */}
      <AuthCard onLogin={handleLogin} onSignup={handleSignup} />

      {/* ─── FOOTER ─── */}
      <Footer />

      {/* ─── ONBOARDING MODAL ─── */}
      <AuthModal
        isOpen={authOpen || registrationStep > 0}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}
