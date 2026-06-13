import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const adContent = [
  {
    brand: "Mindful Space",
    headline: "Find your calm in 5 minutes",
    subline: "Guided meditation for modern life",
    color: "from-indigo-900 to-purple-900",
    emoji: "🧘",
  },
  {
    brand: "NovaTech Pro",
    headline: "Build the future, today",
    subline: "The productivity suite that adapts to you",
    color: "from-blue-900 to-cyan-900",
    emoji: "🚀",
  },
  {
    brand: "Wanderlust",
    headline: "Every journey begins here",
    subline: "Curated travel experiences worldwide",
    color: "from-emerald-900 to-teal-900",
    emoji: "✈️",
  },
];

export default function RewardedAdModal({
  isOpen,
  onClose,
}: RewardedAdModalProps) {
  const { watchRewardedAd } = useStore();
  const [phase, setPhase] = useState<"watching" | "complete">("watching");
  const [countdown, setCountdown] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [adIndex] = useState(() =>
    Math.floor(Math.random() * adContent.length),
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ad = adContent[adIndex];

  useEffect(() => {
    if (!isOpen) return;
    setPhase("watching");
    setCountdown(15);
    setCanSkip(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("complete");
          return 0;
        }
        if (prev <= 11) setCanSkip(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = () => {
    watchRewardedAd();
    onClose();
    setPhase("watching");
    setCountdown(15);
    setCanSkip(false);
  };

  const handleSkip = () => {
    if (!canSkip) return;
    onClose();
    setPhase("watching");
    setCountdown(15);
    setCanSkip(false);
  };

  const progress = ((15 - countdown) / 15) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Rewarded advertisement"
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <AnimatePresence mode="wait">
              {phase === "watching" ? (
                <motion.div
                  key="watching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Ad display */}
                  <div
                    className={`relative h-56 bg-linear-to-br ${ad.color} flex flex-col items-center justify-center p-6`}
                  >
                    <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80">
                      Ad
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-amber-400 text-xs font-bold">
                        +15 tokens
                      </span>
                    </div>

                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      aria-hidden="true"
                    >
                      {ad.emoji}
                    </motion.div>

                    <h3 className="text-white font-bold text-xl text-center mb-1">
                      {ad.headline}
                    </h3>
                    <p className="text-white/60 text-sm text-center">
                      {ad.subline}
                    </p>
                    <p className="text-white/40 text-xs mt-3">{ad.brand}</p>
                  </div>

                  {/* Progress bar and controls */}
                  <div className="bg-zinc-900 p-5">
                    <div
                      className="relative h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={100 - countdown * (100 / 15)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-amber-400 rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-white/60 text-sm">
                        {countdown > 0 ? (
                          <span>Watch {countdown}s for your reward</span>
                        ) : (
                          <span className="text-amber-400">
                            Ready to claim!
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleSkip}
                        disabled={!canSkip}
                        className={`text-xs px-3 py-1 rounded-full transition-all ${canSkip ? "text-white/60 hover:text-white/90 bg-white/10 hover:bg-white/15" : "text-white/20 cursor-not-allowed"}`}
                        aria-label={
                          canSkip
                            ? "Skip advertisement"
                            : `Skip available in ${countdown - 10}s`
                        }
                      >
                        {canSkip
                          ? "Skip"
                          : `Skip in ${Math.max(0, countdown - 10)}s`}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900 p-8 flex flex-col items-center text-center"
                >
                  {/* Celebration */}
                  <motion.div
                    className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mb-4 text-3xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    aria-hidden="true"
                  >
                    ⬡
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-black text-white mb-1">
                      +15 Tokens!
                    </h3>
                    <p className="text-white/50 text-sm mb-6">
                      You've earned your reward. Keep watching ads to earn more!
                    </p>

                    <motion.button
                      onClick={handleClaim}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-base transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Claim 15 token reward"
                    >
                      Claim Reward
                    </motion.button>
                  </motion.div>

                  {/* Floating particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-amber-400 text-xs font-bold pointer-events-none"
                      initial={{ opacity: 1, y: 0, x: 0 }}
                      animate={{
                        opacity: 0,
                        y: -60 - Math.random() * 40,
                        x: (Math.random() - 0.5) * 120,
                        scale: 0.5,
                      }}
                      transition={{
                        duration: 1.5 + Math.random(),
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                      aria-hidden="true"
                    >
                      +15
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
