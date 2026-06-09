import React from "react";
import { motion } from "motion/react";
import { Flame, Calendar, Zap, Trophy } from "lucide-react";

interface DailyStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastClaimDate?: string | null;
  hasClaimedToday?: boolean;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DailyStreakCard({
  currentStreak,
  longestStreak,
  hasClaimedToday = false,
}: DailyStreakCardProps) {
  // Get the next milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m > currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const progressToNext = currentStreak / nextMilestone;
  const bonusAtNext = Math.min(nextMilestone * 2, 50);

  // Determine if current streak is a new record
  const isNewRecord = currentStreak > 1 && currentStreak === longestStreak;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900/60 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          Daily Streak
        </h3>
        {hasClaimedToday && (
          <span className="text-[9px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            Claimed today
          </span>
        )}
      </div>

      {/* Streak counter */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 flex items-center gap-1">
            {currentStreak}
            <Flame size={24} className="text-orange-400" />
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">days</p>
        </div>
      </div>

      {/* Week indicator */}
      <div className="flex justify-center gap-1 mb-4">
        {DAYS.map((day, i) => {
          const isActive = i < (currentStreak % 7) || (currentStreak >= 7 && i < 7);
          const isToday = i === new Date().getDay();

          return (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white"
                  : isToday
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Progress to next milestone */}
      {currentStreak < 100 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-500 font-mono">Next milestone: {nextMilestone} days</span>
            <span className="text-orange-500 font-semibold">+{bonusAtNext} bonus</span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Record display */}
      {isNewRecord && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg py-2"
        >
          <Trophy size={14} className="text-yellow-500" />
          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
            New personal best!
          </span>
        </motion.div>
      )}

      {longestStreak > currentStreak && (
        <p className="text-center text-[10px] text-neutral-400 mt-3">
          Personal best: <span className="font-semibold">{longestStreak} days</span>
        </p>
      )}
    </motion.div>
  );
}
