import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
const ReactPlayerComponent = ReactPlayer as any;
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import CustomSoundCloudPlayer from "../home/CustomSoundCloudPlayer";

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
  ExternalLink
} from "lucide-react";
import AuthModal from "../modals/AuthModal";

export default function LandingPage() {
  const { login, signup, registrationStep } = useStore();
  
  // 1. Audio controls: start as false to comply with browser autoplay policies!
  const [playing, setPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("https://soundcloud.com/aphina-dog/indila-love-story-sped-up?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing");
  const [audioError, setAudioError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Hidden high fidelity YouTube background music feed for Indila - Love Story
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.65);

  const toggleAmbientAudio = () => {
    setAmbientPlaying(prev => !prev);
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
      title: "Soulful Friendships",
      desc: "Meet travelers, astrophysicists, and vinyl collectors on similar wavelengths.",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80"
    },
    {
      title: "Luxurious Romance",
      desc: "Experience dating refined into a quiet, warm cinematic canvas.",
      img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1000&auto=format&fit=crop&q=80"
    },
    {
      title: "Borderless Tribes",
      desc: "Find deep-spirited channels for philosophy, late-night tea, and quantum physics.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80"
    }
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    { 
      name: "Sophia Loris", 
      role: "Acoustic Musician", 
      text: "Poly helped me communicates with a shy seeker in Vienna in a way that felt like cursive poetry. Best relationship platform ever.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
    },
    { 
      name: "Zen Sato", 
      role: "Tea practitioner", 
      text: "No swipe cascades or flashy rating noise. Just true human resonances aligned without boundaries. Pure gold.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    {
      name: "Marcus Aurel",
      role: "Philosophy Dev",
      text: "A truly quiet refuge. Communicating offline-first is amazing, and real identity matches is beautifully executed.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    {
      name: "Clara Finch",
      role: "Creative Director",
      text: "Every single page has a meticulous Swiss layout style. Outstanding connection aesthetics compared to corporate swiping slop.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    }
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
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse" />
          <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">Palrene</h1>
          <span className="text-[9px] font-mono uppercase bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-500 px-1.5 py-0.5 rounded leading-none select-none">Harbor</span>
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
          Create Account
        </button>
      </header>



      {/* 1. LUXURY HERO BANNER SLIDESHOW - TOP */}
      <section className="relative min-h-[840px] py-16 w-full flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-red-950/25 dark:from-black" />

        {/* Hero Copy Content */}
        <div className="z-10 text-center max-w-3xl px-6 space-y-6">
          <div className="inline-flex flex-col items-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 select-none">
              <Sparkles size={11} className="text-yellow-300 fill-current animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">A living digital connection universe</span>
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
              Making friends, finding mates, solving relationship issues, making connections.
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
                const regSection = document.getElementById("registration-section");
                if (regSection) regSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-550 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 transform hover:scale-103 active:scale-98 shadow shadow-orange-950/20 flex items-center gap-1.5 cursor-pointer"
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
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 border-transparent animate-pulse" 
                  : "bg-white/10 hover:bg-white/20 border-white/20"
              }`}
            >
              {ambientPlaying ? <Volume2 size={13} className="text-white animate-bounce" /> : <VolumeX size={13} className="text-zinc-300" />}
              <span>{ambientPlaying ? "Soundscape On" : "Play Hero Music"}</span>
              
              {/* Animated Sound spectrum waves inside the button */}
              {ambientPlaying && (
                <span className="flex items-end gap-[2px] h-3 ml-1 select-none pointer-events-none">
                  {[1, 2, 3].map((val) => (
                    <span 
                      key={val} 
                      className="w-[2px] bg-white rounded-t animate-bounce" 
                      style={{ 
                        height: `${30 + val * 20}%`, 
                        animationDelay: `${val * 150}ms`,
                        animationDuration: '0.6s'
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
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-500 block">The Palrene Architecture</span>
          <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">Redefining human intimacy, intelligently</h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Palrene is a luxurious, modern fusion of networking, romance, and customized community circles, guided by our emotional twin assistant AI companion, Poly.
          </p>
        </div>

        {/* Dynamic modular cards with images, details, and micro-hover animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition text-left"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=600&auto=format&fit=crop&q=80" 
                alt="Intimacy Waves"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-95"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-lg text-[9px] font-mono text-white tracking-wider uppercase">Authentic matches</span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10">
                    <Heart size={14} className="fill-current" />
                  </div>
                  <h3 className="text-md font-serif font-bold text-neutral-900 dark:text-white leading-none">Warm Romance, Redefined</h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  No swiping cascades or rating fatigue. We replace standard superficial metrics with aligned deep-spirited connection threads, designed purely for quiet communication.
                </p>
              </div>
              <div className="pt-2 font-mono text-[10px] text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                <span>Core Module</span>
                <span>•</span>
                <span>Secure Validation</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition text-left"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80" 
                alt="Poly AI Companion"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-95"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-orange-500 text-[9px] font-mono text-white tracking-wider uppercase font-bold">Emotion Engine</span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/10">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-md font-serif font-bold text-neutral-900 dark:text-white leading-none">Empathy-Guided AI Assistant</h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Let Poly guide your dialogues, suggest beautiful local date configurations, draft smart initial whisper concepts, and align deep emotional support variables.
                </p>
              </div>
              <div className="pt-2 font-mono text-[10px] text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                <span>Gemini API Powered</span>
                <span>•</span>
                <span>Real-time Sync</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col bg-neutral-50 dark:bg-zinc-950 border border-neutral-100 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition text-left"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&auto=format&fit=crop&q=80" 
                alt="Connective Circles"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-95"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-lg text-[9px] font-mono text-white tracking-wider uppercase">Subgroups</span>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/10">
                    <Users size={14} />
                  </div>
                  <h3 className="text-md font-serif font-bold text-neutral-900 dark:text-white leading-none">Subgroup Circles & Tribes</h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Filter into deep-spirited circles for acoustic vinyl beats, philosophical tea-pouring, astrophysics debates, and mutual creative reinforcement networks.
                </p>
              </div>
              <div className="pt-2 font-mono text-[10px] text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                <span>Offline-First Rooms</span>
                <span>•</span>
                <span>No Ads</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. AUTO-SCROLLING REVIEWS TESTIMONIALS SECTION */}
      {/* If reviews are zero we would use fallback data. Here we have robust data + auto-scrolling animations */}
      <section className="bg-neutral-50/50 dark:bg-zinc-950/45 border-y border-neutral-100 dark:border-neutral-900 py-16 text-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-orange-500 block">Echoes of resonance</span>
            <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">What Seekers Inside Our Harbor Say</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Real testimonials from verified subscribers who discovered borderless intimacy.
            </p>
          </div>

          {/* Autoscrolling sliding focus block container */}
          <div className="relative max-w-2xl mx-auto min-h-[240px] sm:min-h-[190px] w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={scrollIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.7 }}
                className="absolute w-full p-6 sm:p-8 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-900 rounded-3xl shadow-sm space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={reviews[scrollIndex].avatar} 
                      alt={reviews[scrollIndex].name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border border-neutral-250 dark:border-neutral-850"
                    />
                    <div>
                      <h4 className="text-xs font-serif font-bold text-neutral-900 dark:text-white leading-tight">
                        {reviews[scrollIndex].name}
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-400">{reviews[scrollIndex].role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-0.5 text-orange-500">
                    <Heart size={9} className="fill-current" />
                    <Heart size={9} className="fill-current" />
                    <Heart size={9} className="fill-current" />
                    <Heart size={9} className="fill-current" />
                    <Heart size={9} className="fill-current" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic font-serif">
                  "{reviews[scrollIndex].text}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Manual navigation indicators track */}
          <div className="flex items-center justify-center space-x-1.5 pt-4">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setScrollIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  scrollIndex === idx ? "bg-orange-500 w-4" : "bg-neutral-300 dark:bg-neutral-800"
                }`}
                title={`Swipe to screen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BOTTOM REGISTRATION AREA - Handles login, sign in with Supabase, stops music and goes to progressive modal */}
      <section id="registration-section" className="max-w-md w-full mx-auto py-20 px-6 scroll-mt-12">
        <div className="bg-neutral-50 dark:bg-zinc-950 border border-neutral-150 dark:border-neutral-905 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
          
          <div className="text-center space-y-1">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Palrene Connection Portal
            </span>
            <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">
              {regMode === "signup" ? "Create Infinite Connection" : "Resonance Log In"}
            </h3>
            <p className="text-xs text-neutral-400">
              {regMode === "signup" ? "Begin the 8-step progressive profile setup." : "Welcome back. Re-align to your secret socket."}
            </p>
          </div>

          {/* Form tab selector toggle inline */}
          <div className="flex bg-neutral-150/45 dark:bg-black/45 p-1 rounded-xl">
            <button
              onClick={() => {
                setRegMode("signup");
                setRegError("");
              }}
              className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                regMode === "signup" 
                  ? "bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              Sign Up / Register
            </button>
            <button
              onClick={() => {
                setRegMode("login");
                setRegError("");
              }}
              className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition ${
                regMode === "login" 
                  ? "bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              Log In
            </button>
          </div>

          {regError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-left text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 block shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          {regSuccess && regMode === "signup" && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-left text-xs text-green-600 dark:text-green-400">
              Registration alignment successful! Progressive profiling is initializing.
            </div>
          )}

          <form onSubmit={handleInlineAuthSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="seeker@resonance.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold flex justify-between">
                <span>Secret Credential</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 dark:text-white"
                />
              </div>
            </div>

            {regMode === "signup" && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Confirm Secret Credential</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 text-xs rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-555 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-55 cursor-pointer flex items-center justify-center space-x-2"
            >
              {regLoading ? (
                <span>Aligning coordinates...</span>
              ) : (
                <>
                  <span>{regMode === "signup" ? "Resonate & Sign Up" : "Authenticate Access"}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

        </div>
      </section>

      {/* FOOTER COOPERATIVE */}
      <footer className="mt-auto py-12 border-t border-neutral-100 dark:border-neutral-900 text-center text-xs text-neutral-400 dark:text-neutral-600 font-mono space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center gap-1"><Shield size={12} /> Borderless Intimacy</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Globe size={12} /> Soul-Searching Harbor</span>
        </div>
        <p>© 2026 Palrene Corp. All boundaries dissolved.</p>
      </footer>

      {/* 5. MULTI-STEP PROGRESSIVE ONBOARDING MODAL OVERLAY */}
      {/* isOpen handles both manually triggering it, and auto-opening it when store's registrationStep > 0 */}
      <AuthModal
        isOpen={authOpen || registrationStep > 0}
        onClose={() => setAuthOpen(false)}
      />

    </div>
  );
}
