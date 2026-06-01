import React from "react";
import { motion } from "motion/react";
import { Sparkles, Moon } from "lucide-react";

interface NullStateProps {
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  iconType?: "sparkly" | "empty" | "heart" | "chat";
}

export default function NullState({ title, description, ctaText, onCtaClick, iconType = "sparkly" }: NullStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-black/20 border border-neutral-100 dark:border-neutral-900 rounded-3xl space-y-5 shadow-sm max-w-md mx-auto my-6">
      
      {/* Animated Icon Illustration */}
      <motion.div
        animate={{ 
          y: [0, -6, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "easeInOut" 
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center border border-red-500/10 dark:border-red-500/30 text-red-500 dark:text-orange-400"
      >
        {iconType === "sparkly" ? (
          <Sparkles className="w-8 h-8 animate-pulse" />
        ) : (
          <Moon className="w-8 h-8 text-neutral-400" />
        )}
      </motion.div>

      {/* Title & Desc */}
      <div className="space-y-1.5 p-1">
        <h4 className="text-base font-serif font-semibold text-neutral-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
          {description}
        </p>
      </div>

      {/* Button CTA */}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl transition shadow hover:shadow-orange-500/10 duration-300"
        >
          {ctaText}
        </button>
      )}

    </div>
  );
}
