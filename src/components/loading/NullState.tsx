import React from "react";
import { motion } from "motion/react";
import { Sparkles, Moon, Heart, MessageCircle, Users, Compass, Search, Bell, Zap } from "lucide-react";

interface NullStateProps {
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  iconType?: "sparkly" | "empty" | "heart" | "chat" | "users" | "compass" | "search" | "bell" | "zap";
}

const iconComponents = {
  sparkly: Sparkles,
  empty: Moon,
  heart: Heart,
  chat: MessageCircle,
  users: Users,
  compass: Compass,
  search: Search,
  bell: Bell,
  zap: Zap,
};

const iconColors = {
  sparkly: "from-yellow-500/15 to-orange-500/15 border-yellow-500/20 text-yellow-500",
  empty: "from-neutral-500/10 to-neutral-400/10 border-neutral-400/20 text-neutral-400",
  heart: "from-red-500/15 to-pink-500/15 border-red-500/20 text-red-500",
  chat: "from-orange-500/15 to-amber-500/15 border-orange-500/20 text-orange-500",
  users: "from-blue-500/15 to-indigo-500/15 border-blue-500/20 text-blue-400",
  compass: "from-emerald-500/15 to-teal-500/15 border-emerald-500/20 text-emerald-500",
  search: "from-purple-500/15 to-violet-500/15 border-purple-500/20 text-purple-400",
  bell: "from-orange-500/15 to-red-500/15 border-orange-500/20 text-orange-500",
  zap: "from-amber-500/15 to-yellow-500/15 border-amber-500/20 text-amber-500",
};

export default function NullState({
  title,
  description,
  ctaText,
  onCtaClick,
  iconType = "sparkly",
}: NullStateProps) {
  const Icon = iconComponents[iconType];
  const colorClass = iconColors[iconType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center p-8 text-center bg-white/60 dark:bg-zinc-950/40 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900 rounded-3xl space-y-5 shadow-sm max-w-md mx-auto my-6"
    >
      {/* Animated icon */}
      <motion.div
        animate={{
          y: [0, -7, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4.5,
          ease: "easeInOut",
        }}
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center border`}
      >
        <Icon size={28} className="opacity-80" />
      </motion.div>

      {/* Floating orbiting micro-dot */}
      <div className="relative w-16 h-1 -mt-2">
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-orange-400/60 blur-sm"
          animate={{ x: [-24, 24, -24], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: 0, left: "50%" }}
        />
      </div>

      <div className="space-y-1.5 px-2">
        <h4 className="text-base font-serif font-bold text-neutral-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
          {description}
        </p>
      </div>

      {ctaText && onCtaClick && (
        <motion.button
          onClick={onCtaClick}
          className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl transition shadow-md shadow-orange-500/20"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {ctaText}
        </motion.button>
      )}
    </motion.div>
  );
}
