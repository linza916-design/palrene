import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useStore } from "../../store";
import { TokenTransaction } from "../../types";
import RewardedAdModal from "./RewardedAdModal";

const sourceLabels: Record<TokenTransaction['source'], string> = {
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
  welcome_bonus: "Welcome Bonus"
};

const sourceIcons: Record<TokenTransaction['source'], string> = {
  rewarded_ad: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  daily_login: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  subscription: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  referral: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  engagement: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  boost_post: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  dm_unlock: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  ai_chat: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  profile_boost: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  ad_request: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  post_boost: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  premium_reaction: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  welcome_bonus: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
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
  const { currentUser, tokenTransactions, claimDailyReward, lastDailyReward, setView } = useStore();
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [claimPulse, setClaimPulse] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);

  if (!currentUser) return null;

  const balance = currentUser.token_balance || 0;
  const myTransactions = tokenTransactions.filter(t => t.userId === currentUser.id).slice(0, 20);
  const earned = myTransactions.filter(t => t.type === "earn").reduce((a, b) => a + b.amount, 0);
  const spent = myTransactions.filter(t => t.type === "spend").reduce((a, b) => a + b.amount, 0);
  const today = new Date().toDateString();
  const canClaimDaily = lastDailyReward !== today;

  const handleDailyClaim = () => {
    const success = claimDailyReward();
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
        <span className="text-amber-400 text-base" aria-hidden="true">⬡</span>
        <span className="text-amber-300 font-bold text-sm">
          <TokenCounter value={balance} />
        </span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <RewardedAdModal isOpen={adModalOpen} onClose={() => setAdModalOpen(false)} />
      {/* Balance Card */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/20 border border-amber-500/30"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-3xl rounded-full" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-amber-400/70 font-medium uppercase tracking-wider mb-1">Token Balance</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-amber-300">
                  <TokenCounter value={balance} />
                </span>
                <span className="text-amber-500/60 mb-1 text-sm font-medium">PAL</span>
              </div>
            </div>
            <motion.div
              className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              ⬡
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-xs text-emerald-400/70 mb-0.5">Total Earned</p>
              <p className="text-emerald-300 font-bold">+{earned.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-red-400/70 mb-0.5">Total Spent</p>
              <p className="text-red-300 font-bold">-{spent.toLocaleString()}</p>
            </div>
          </div>

          {/* Daily Reward Button */}
          <motion.button
            onClick={handleDailyClaim}
            disabled={!canClaimDaily}
            className={`relative w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              canClaimDaily
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                : "bg-amber-500/10 text-amber-500/40 cursor-default border border-amber-500/20"
            }`}
            whileHover={canClaimDaily ? { scale: 1.02 } : {}}
            whileTap={canClaimDaily ? { scale: 0.98 } : {}}
            aria-label={canClaimDaily ? "Claim daily reward of 25 tokens" : "Daily reward already claimed"}
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
            </svg>
            {canClaimDaily ? "Claim Daily Reward (+25)" : "Daily Reward Claimed ✓"}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1" role="tablist" aria-label="Token wallet sections">
        {(["overview", "history"] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"}`}
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
            role="tabpanel"
          >
            {[
              { icon: "📺", label: "Watch a Rewarded Ad", reward: "+15 tokens", color: "blue", onClick: () => setAdModalOpen(true) },
              { icon: "📅", label: "Daily Login Streak", reward: "+25 tokens", color: "amber", onClick: handleDailyClaim },
              { icon: "✍️", label: "Post Quality Content", reward: "+5 tokens", color: "purple", onClick: () => setView("home") },
              { icon: "🤝", label: "Accept a Connection", reward: "+10 tokens", color: "emerald", onClick: () => setView("notifications") },
              { icon: "👥", label: "Join a Community", reward: "+5 tokens", color: "cyan", onClick: () => setView("groups") },
              { icon: "💳", label: "Upgrade Subscription", reward: "Up to +500", color: "rose", onClick: () => setView("settings") }
            ].map((item, i) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors w-full text-left cursor-pointer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">{item.icon}</span>
                  <span className="text-sm text-white/80">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{item.reward}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2 max-h-72 overflow-y-auto pr-1"
            role="tabpanel"
          >
            {myTransactions.length === 0 ? (
              <p className="text-center text-white/40 py-8 text-sm">No transactions yet.</p>
            ) : myTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "earn" ? "bg-emerald-500/20" : "bg-red-500/20"}`}
                    aria-hidden="true"
                  >
                    <svg className={`w-4 h-4 ${tx.type === "earn" ? "text-emerald-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={sourceIcons[tx.source] || "M12 6v6l4 2"} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-white/40">{sourceLabels[tx.source]} · {new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ml-2 ${tx.type === "earn" ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.type === "earn" ? "+" : "-"}{tx.amount}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
