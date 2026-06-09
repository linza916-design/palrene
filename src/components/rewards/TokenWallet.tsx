import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, TrendingUp, TrendingDown, Clock, Gift, Flame, ChevronRight, History, Sparkles } from "lucide-react";
import { useStore } from "../../store";
import {
  getUserTokens,
  getTokenTransactions,
  canWatchAd,
  subscribeToTokenUpdates,
  type UserTokens,
  type TokenTransaction,
} from "../../lib/tokens";
import RewardModal from "./RewardModal";

interface TokenWalletProps {
  compact?: boolean;
}

export default function TokenWallet({ compact = false }: TokenWalletProps) {
  const { currentUser } = useStore();
  const [tokens, setTokens] = useState<UserTokens | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [adStatus, setAdStatus] = useState({ canWatch: true, adsWatched: 0, remaining: 20 });

  useEffect(() => {
    if (!currentUser) return;

    loadData();

    const subscription = subscribeToTokenUpdates(currentUser.id, (updatedTokens) => {
      setTokens(updatedTokens);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    const [tokensData, transactionsData, adStatusData] = await Promise.all([
      getUserTokens(currentUser.id),
      getTokenTransactions(currentUser.id, 20),
      canWatchAd(currentUser.id),
    ]);

    setTokens(tokensData);
    setTransactions(transactionsData);
    setAdStatus(adStatusData);
    setLoading(false);
  };

  const handleRewardComplete = (reward: number) => {
    loadData();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "rewarded_ad":
        return <Gift size={12} className="text-purple-500" />;
      case "daily_streak":
      case "daily_login":
        return <Flame size={12} className="text-orange-500" />;
      case "post_creation":
      case "helpful_comment":
        return <TrendingUp size={12} className="text-green-500" />;
      case "boost_post":
      case "premium_reaction":
        return <Sparkles size={12} className="text-blue-500" />;
      default:
        return amount >= 0 ? (
          <TrendingUp size={12} className="text-green-500" />
        ) : (
          <TrendingDown size={12} className="text-red-500" />
        );
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-4">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowRewardModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-500/20 rounded-full hover:border-orange-500/40 transition"
        >
          <Zap size={14} className="text-yellow-500" />
          <span className="text-xs font-semibold text-neutral-800 dark:text-white">
            {tokens?.balance || 0}
          </span>
        </button>

        <RewardModal
          isOpen={showRewardModal}
          onClose={() => setShowRewardModal(false)}
          onComplete={handleRewardComplete}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900/60 rounded-2xl overflow-hidden">
        {/* Header with balance */}
        <div className="p-5 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 dark:from-orange-500/3 dark:to-yellow-500/3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white flex items-center gap-2">
              <Zap className="text-yellow-500" size={18} />
              Token Wallet
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-[10px] text-orange-500 font-mono hover:text-orange-600 transition flex items-center gap-1"
            >
              <History size={12} />
              {showHistory ? "Hide" : "History"}
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-neutral-800 dark:text-white">
                  {tokens?.balance?.toLocaleString() || 0}
                </span>
                <Zap size={18} className="text-yellow-500 mb-1" />
              </div>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                Available tokens
              </p>
            </div>

            {tokens && (
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-green-500">
                  <TrendingUp size={12} />
                  <span className="text-xs font-semibold">
                    +{tokens.lifetime_earned?.toLocaleString() || 0}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">lifetime earned</p>
              </div>
            )}
          </div>

          {/* Streak */}
          {tokens && tokens.current_streak > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-xl px-3 py-2">
              <Flame size={16} className="text-orange-500" />
              <div>
                <span className="text-sm font-bold text-neutral-800 dark:text-white">
                  {tokens.current_streak} day streak
                </span>
                {tokens.longest_streak > tokens.current_streak && (
                  <span className="text-[10px] text-neutral-400 ml-2">
                    Best: {tokens.longest_streak}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Earn more section */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-900">
          <button
            onClick={() => setShowRewardModal(true)}
            disabled={!adStatus.canWatch}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              adStatus.canWatch
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <Gift size={18} />
            {adStatus.canWatch ? "Earn Free Tokens" : "Daily Limit Reached"}
          </button>

          <p className="text-center text-[10px] text-neutral-400 font-mono mt-2">
            {adStatus.canWatch
              ? `${adStatus.remaining} ads remaining today · +10 each`
              : "Come back tomorrow for more"}
          </p>
        </div>

        {/* Transaction history */}
        <AnimatePresence>
          {showHistory && transactions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-neutral-100 dark:border-neutral-900"
            >
              <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-900 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {getSourceIcon(tx.source)}
                      <div>
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {tx.description || tx.source.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {timeAgo(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        tx.amount > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onComplete={handleRewardComplete}
      />
    </>
  );
}
