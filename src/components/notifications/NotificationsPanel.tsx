import React from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Award,
  Sparkles,
  Trash2,
  Zap,
  Users,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  like: <Heart size={14} className="text-red-500 fill-current" />,
  comment: <MessageSquare size={14} className="text-orange-500" />,
  follow: <UserPlus size={14} className="text-blue-400" />,
  connection_request: <Users size={14} className="text-blue-400" />,
  connection_accepted: <Users size={14} className="text-green-400" />,
  ai_recommendation: <Sparkles size={14} className="text-yellow-500 fill-current" />,
  verification: <Award size={14} className="text-green-500" />,
  token_earned: <Zap size={14} className="text-amber-400 fill-current" />,
};

const colorMap: Record<string, string> = {
  like: "bg-red-500/12 border-red-500/15",
  comment: "bg-orange-500/12 border-orange-500/15",
  follow: "bg-blue-500/12 border-blue-500/15",
  connection_request: "bg-blue-500/12 border-blue-500/15",
  connection_accepted: "bg-green-500/12 border-green-500/15",
  ai_recommendation: "bg-yellow-500/12 border-yellow-500/15",
  verification: "bg-green-500/12 border-green-500/15",
  token_earned: "bg-amber-500/12 border-amber-500/20",
};

export default function NotificationsPanel() {
  const { notifications, setView, deleteNotification } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: any) => {
    if (notif.type === "message") setView("messages");
    else if (["follow", "connection_request", "connection_accepted"].includes(notif.type)) setView("profile");
    else if (notif.type === "ai_recommendation") setView("ai-poly");
  };

  return (
    <div className="flex-1 max-w-lg mx-auto p-4 sm:p-5 h-[calc(100vh-70px)] overflow-y-auto pb-24 md:pb-6 text-left space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
        <div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <div className="relative">
              <Bell size={20} className="text-orange-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>Notifications</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Likes, connections, AI signals, and token rewards.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/12 to-red-500/12 border border-orange-500/20 flex items-center justify-center mb-4"
            >
              <Bell size={28} className="text-orange-400/60" />
            </motion.div>
            <h4 className="text-sm font-serif font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              All caught up
            </h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 max-w-xs leading-relaxed">
              Your notification stream is quiet. Engage with the community to start receiving echoes.
            </p>
            <button
              onClick={() => setView("discover")}
              className="mt-5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition shadow-md shadow-orange-500/20"
            >
              Discover Souls
            </button>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notif, i) => {
              const sender = notif.sender;
              const iconBg = colorMap[notif.type] ?? "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800";
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -16, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative p-4 rounded-2xl flex items-start gap-3.5 cursor-pointer transition-all duration-200 select-none border ${
                    !notif.read
                      ? "bg-white dark:bg-zinc-950 border-orange-500/20 dark:border-orange-500/15 shadow-sm shadow-orange-500/5"
                      : "bg-white/60 dark:bg-zinc-950/40 border-neutral-100 dark:border-neutral-900 hover:border-orange-500/20"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {!notif.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-red-500 to-orange-500" />
                  )}

                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${iconBg}`}>
                    {iconMap[notif.type] ?? <Bell size={14} className="text-neutral-500" />}
                  </div>

                  {sender && (
                    <img
                      src={sender.avatar_url}
                      alt={sender.full_name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-800"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {sender && (
                        <span className="font-bold text-neutral-900 dark:text-white mr-1">
                          {sender.full_name}
                        </span>
                      )}
                      {notif.content}
                    </p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString()} at{" "}
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                    className="shrink-0 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-all self-center"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
