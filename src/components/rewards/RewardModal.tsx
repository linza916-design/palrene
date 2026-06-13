import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Play,
  Gift,
  Zap,
  Clock,
  CircleCheck as CheckCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useStore } from "../../store";
import {
  canWatchAd,
  recordAdEvent,
  getUserTokens,
  type UserTokens,
} from "../../lib/tokens";
import { Button, Badge } from "../ui";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (reward: number) => void;
}

type ModalStep = "intro" | "watching" | "rewarded" | "limit_reached";

const REWARD_AMOUNT = 10;

export default function RewardModal({
  isOpen,
  onClose,
  onComplete,
}: RewardModalProps) {
  const { currentUser } = useStore();
  const [step, setStep] = useState<ModalStep>("intro");
  const [canWatch, setCanWatch] = useState(true);
  const [adsWatched, setAdsWatched] = useState(0);
  const [remaining, setRemaining] = useState(20);
  const [adProgress, setAdProgress] = useState(0);
  const [userTokens, setUserTokens] = useState<UserTokens | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      checkAdEligibility();
      loadUserTokens();
    }
  }, [isOpen, currentUser]);

  const checkAdEligibility = async () => {
    if (!currentUser) return;
    const status = await canWatchAd(currentUser.id);
    setCanWatch(status.canWatch);
    setAdsWatched(status.adsWatched);
    setRemaining(status.remaining);
    if (!status.canWatch) {
      setStep("limit_reached");
    }
  };

  const loadUserTokens = async () => {
    if (!currentUser) return;
    const tokens = await getUserTokens(currentUser.id);
    setUserTokens(tokens);
  };

  const handleStartAd = () => {
    setStep("watching");
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleAdComplete();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleAdComplete = async () => {
    if (!currentUser) return;

    setLoading(true);
    const result = await recordAdEvent(currentUser.id, true, REWARD_AMOUNT);
    setLoading(false);

    if (result.success && result.reward) {
      setStep("rewarded");
      onComplete?.(result.reward);
      loadUserTokens();
    }
  };

  const handleClose = () => {
    setStep("intro");
    setAdProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
        >
          {step === "intro" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Gift className="text-orange-500" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Earn Free Tokens
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition"
                >
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              <div className="bg-linear-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5 rounded-xl p-6 border border-orange-500/20 text-center">
                <Zap className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-500">
                  +{REWARD_AMOUNT}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Tokens
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">
                  Watch a short video to earn tokens. Completely optional.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartAd}
                  icon={<Play className="w-4 h-4" />}
                  className="w-full"
                >
                  Watch Ad Now
                </Button>

                <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
                  {remaining} ads remaining today
                </p>
              </div>

              {userTokens && (
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Your balance
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {userTokens.balance} tokens
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "watching" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-500 animate-pulse" size={20} />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Watching...
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition"
                >
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>

              {/* Simulated ad display */}
              <div className="aspect-video bg-linear-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 animate-pulse" />
                <div className="relative text-center">
                  <Sparkles
                    size={40}
                    className="text-orange-400 mx-auto mb-2"
                  />
                  <p className="text-white font-semibold">Premium Content</p>
                  <p className="text-neutral-400 text-xs">
                    Ad will complete shortly
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-r from-red-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${adProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                  {adProgress}% complete
                </p>
              </div>
            </div>
          )}

          {step === "rewarded" && (
            <div className="p-6 space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
              >
                <CheckCircle size={40} className="text-white" />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                  Tokens Earned!
                </h2>
                <p className="text-3xl font-bold text-orange-500">
                  +{REWARD_AMOUNT}
                </p>
              </div>

              {userTokens && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      New Balance
                    </span>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" />
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {userTokens.balance + REWARD_AMOUNT}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setStep("intro");
                    checkAdEligibility();
                  }}
                  icon={<Play className="w-4 h-4" />}
                  className="w-full"
                >
                  Watch Another ({remaining - 1} left)
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClose}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {step === "limit_reached" && (
            <div className="p-6 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <TrendingUp size={32} className="text-neutral-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                  Daily Limit Reached
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  You've watched all 20 ads for today. Come back tomorrow!
                </p>
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={handleClose}
                className="w-full"
              >
                Got it
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
