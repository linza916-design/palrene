import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Gift, Zap, Clock, CircleCheck as CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { useStore } from "../../store";
import { canWatchAd, recordAdEvent, getUserTokens, type UserTokens } from "../../lib/tokens";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (reward: number) => void;
}

type ModalStep = "intro" | "watching" | "rewarded" | "limit_reached";

const REWARD_AMOUNT = 10;

export default function RewardModal({ isOpen, onClose, onComplete }: RewardModalProps) {
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

    // Simulate ad progress (in production, this would be real ad SDK)
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
          className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl"
        >
          {step === "intro" && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="text-orange-500" size={24} />
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
                    Earn Free Tokens
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition"
                >
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5 rounded-2xl p-5 border border-orange-500/20">
                <div className="flex items-center justify-center gap-3">
                  <Zap className="text-yellow-500" size={32} />
                  <div>
                    <div className="text-3xl font-bold text-orange-500">+{REWARD_AMOUNT}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Tokens</div>
                  </div>
                </div>
                <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                  Watch a short video to earn tokens. Completely optional.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartAd}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Play size={18} />
                  Watch Ad Now
                </button>

                <p className="text-center text-[10px] text-neutral-400 font-mono">
                  {remaining} ads remaining today
                </p>
              </div>

              {userTokens && (
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-900">
                  <span className="text-xs text-neutral-500">Your balance</span>
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="font-semibold text-neutral-800 dark:text-white">
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
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition"
                >
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>

              {/* Simulated ad display */}
              <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 animate-pulse" />
                <div className="relative text-center">
                  <Sparkles size={40} className="text-orange-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">Premium Content</p>
                  <p className="text-neutral-400 text-xs">Ad will complete shortly</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${adProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-mono text-center">
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
                className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"
              >
                <CheckCircle size={40} className="text-white" />
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-1">
                  Tokens Earned!
                </h2>
                <p className="text-3xl font-bold text-orange-500">+{REWARD_AMOUNT}</p>
              </div>

              {userTokens && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">New Balance</span>
                    <div className="flex items-center gap-1.5">
                      <Zap size={16} className="text-yellow-500" />
                      <span className="font-bold text-neutral-800 dark:text-white">
                        {userTokens.balance + REWARD_AMOUNT}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep("intro");
                    checkAdEligibility();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Watch Another ({remaining - 1} left)
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === "limit_reached" && (
            <div className="p-6 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <TrendingUp size={32} className="text-neutral-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-neutral-800 dark:text-white mb-1">
                  Daily Limit Reached
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  You've watched all 20 ads for today. Come back tomorrow!
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-xl transition"
              >
                Got it
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
