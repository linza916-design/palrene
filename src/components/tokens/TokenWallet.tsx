import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useStore } from "../../store";
import { TokenTransaction } from "../../types";
import {
  Gift,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
  MessageSquare,
  Zap,
  Award,
  Users,
  Crown,
} from "lucide-react";
import RewardedAdModal from "./RewardedAdModal";
import { AppCard, Button, Badge, EmptyState } from "../ui";

const sourceLabels: Record<TokenTransaction["source"], string> = {
  rewarded_ad: "Rewarded Ad",
  daily_login: "Daily Login",
  subscription: "Subscription Bonus",
  referral: "Referral",
  engagement: "Engagement",
  boost_post: "Post Boost",
  dm_unlock: "DM Unlock",
  ai_chat: "AI Chat",
  profile_boost: "Profile Boost",
  ad_request: "Ad Request",
  post_boost: "Post Boost",
  premium_reaction: "Premium Reaction",
  welcome_bonus: "Welcome Bonus",
};

const sourceIcons: Record<TokenTransaction["source"], React.ReactNode> = {
  rewarded_ad: <Gift className="w-4 h-4" />,
  daily_login: <Calendar className="w-4 h-4" />,
  subscription: <Crown className="w-4 h-4" />,
  referral: <Users className="w-4 h-4" />,
  engagement: <Heart className="w-4 h-4" />,
  boost_post: <TrendingUp className="w-4 h-4" />,
  dm_unlock: <MessageSquare className="w-4 h-4" />,
  ai_chat: <Sparkles className="w-4 h-4" />,
  profile_boost: <Award className="w-4 h-4" />,
  ad_request: <Zap className="w-4 h-4" />,
  post_boost: <TrendingUp className="w-4 h-4" />,
  premium_reaction: <Heart className="w-4 h-4" />,
  welcome_bonus: <Gift className="w-4 h-4" />,
};

function TokenCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8, scale: 1.2 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="tabular-nums"
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

interface TokenWalletProps {
  compact?: boolean;
}

export default function TokenWallet({ compact = false }: TokenWalletProps) {
  const {
    currentUser,
    tokenTransactions,
    claimDailyReward,
    lastDailyReward,
    setView,
  } = useStore();
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [claimPulse, setClaimPulse] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);

  if (!currentUser) return null;

  const balance = currentUser.token_balance || 0;
  const myTransactions = tokenTransactions
    .filter((t) => t.userId === currentUser.id)
    .slice(0, 20);
  const earned = myTransactions
    .filter((t) => t.type === "earn")
    .reduce((a, b) => a + b.amount, 0);
  const spent = myTransactions
    .filter((t) => t.type === "spend")
    .reduce((a, b) => a + b.amount, 0);
  const today = new Date().toDateString();
  const canClaimDaily = lastDailyReward !== today;

  const handleDailyClaim = async () => {
    const success = await claimDailyReward();
    if (success) {
      setClaimPulse(true);
      setTimeout(() => setClaimPulse(false), 1200);
    }
  };

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors"
        whileHover={{ scale: 1.03 }}
        aria-label={`Token balance: ${balance}`}
      >
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="text-amber-300 font-bold text-sm">
          <TokenCounter value={balance} />
        </span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
      />

      {/* Balance Card */}
      <AppCard
        variant="elevated"
        padding="lg"
        className="bg-linear-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/20 border-amber-500/30 relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-3xl rounded-full"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-amber-400/70 font-medium uppercase tracking-wider mb-1">
                Token Balance
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-amber-300">
                  <TokenCounter value={balance} />
                </span>
                <span className="text-amber-500/60 mb-1 text-sm font-medium">
                  PAL
                </span>
              </div>
            </div>
            <motion.div
              className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-6 h-6 text-amber-400" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <AppCard
              variant="outlined"
              padding="md"
              className="bg-emerald-500/10 border-emerald-500/20"
            >
              <p className="text-xs text-emerald-400/70 mb-0.5">Total Earned</p>
              <p className="text-emerald-300 font-bold text-lg">
                +{earned.toLocaleString()}
              </p>
            </AppCard>
            <AppCard
              variant="outlined"
              padding="md"
              className="bg-red-500/10 border-red-500/20"
            >
              <p className="text-xs text-red-400/70 mb-0.5">Total Spent</p>
              <p className="text-red-300 font-bold text-lg">
                -{spent.toLocaleString()}
              </p>
            </AppCard>
          </div>

          {/* Daily Reward Button */}
          <motion.button
            onClick={handleDailyClaim}
            disabled={!canClaimDaily}
            className={`relative w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canClaimDaily
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                : "bg-amber-500/10 text-amber-500/40 cursor-default border border-amber-500/20"
            }`}
            whileHover={canClaimDaily ? { scale: 1.02 } : {}}
            whileTap={canClaimDaily ? { scale: 0.98 } : {}}
          >
            <AnimatePresence>
              {claimPulse && (
                <motion.span
                  className="absolute inset-0 rounded-xl bg-white/40"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0, scale: 1.3 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </AnimatePresence>
            <Gift className="w-4 h-4" />
            {canClaimDaily
              ? "Claim Daily Reward (+25)"
              : "Daily Reward Claimed"}
          </motion.button>
        </div>
      </AppCard>

      {/* Tabs */}
      <div
        className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 gap-1"
        role="tablist"
      >
        {(["overview", "history"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            {t === "overview" ? "Earn Tokens" : "History"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-2"
          >
            {[
              {
                icon: <Gift className="w-5 h-5" />,
                label: "Watch a Rewarded Ad",
                reward: "+15 tokens",
                onClick: () => setAdModalOpen(true),
              },
              {
                icon: <Calendar className="w-5 h-5" />,
                label: "Daily Login Streak",
                reward: "+25 tokens",
                onClick: handleDailyClaim,
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                label: "Post Quality Content",
                reward: "+5 tokens",
                onClick: () => setView("home"),
              },
              {
                icon: <Users className="w-5 h-5" />,
                label: "Accept a Connection",
                reward: "+10 tokens",
                onClick: () => setView("notifications"),
              },
              {
                icon: <Users className="w-5 h-5" />,
                label: "Join a Community",
                reward: "+5 tokens",
                onClick: () => setView("groups"),
              },
              {
                icon: <Crown className="w-5 h-5" />,
                label: "Upgrade Subscription",
                reward: "Up to +500",
                onClick: () => setView("settings"),
              },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-left"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    {item.icon}
                  </div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {item.label}
                  </span>
                </div>
                <Badge variant="success">+{item.reward.replace("+", "")}</Badge>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2 max-h-72 overflow-y-auto"
          >
            {myTransactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Earn tokens to see your activity here"
              />
            ) : (
              myTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "earn"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {sourceIcons[tx.source] || <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                        {tx.description}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {sourceLabels[tx.source]} ·{" "}
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.type === "earn" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "earn" ? "+" : "-"}
                    {tx.amount}
                  </span>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
