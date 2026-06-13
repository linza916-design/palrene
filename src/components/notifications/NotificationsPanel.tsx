import React from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Heart, MessageSquare, UserPlus, Award, Sparkles, Trash2, Zap, Users, Compass } from "lucide-react";
import { AppCard, Avatar, Button, EmptyState, Badge, SectionHeader } from "../ui";

const iconMap: Record<string, React.ReactNode> = {
  like: <Heart className="w-4 h-4 text-red-500" />,
  comment: <MessageSquare className="w-4 h-4 text-orange-500" />,
  follow: <UserPlus className="w-4 h-4 text-blue-500" />,
  connection_request: <Users className="w-4 h-4 text-blue-500" />,
  connection_accepted: <Users className="w-4 h-4 text-emerald-500" />,
  ai_recommendation: <Sparkles className="w-4 h-4 text-amber-500" />,
  verification: <Award className="w-4 h-4 text-emerald-500" />,
  token_earned: <Zap className="w-4 h-4 text-amber-500" />,
  system: <Bell className="w-4 h-4 text-neutral-500" />,
};

const bgMap: Record<string, string> = {
  like: "bg-red-500/10",
  comment: "bg-orange-500/10",
  follow: "bg-blue-500/10",
  connection_request: "bg-blue-500/10",
  connection_accepted: "bg-emerald-500/10",
  ai_recommendation: "bg-amber-500/10",
  verification: "bg-emerald-500/10",
  token_earned: "bg-amber-500/10",
  system: "bg-neutral-500/10",
};

export default function NotificationsPanel() {
  const { notifications, connections, currentUser, setView, deleteNotification, acceptConnection, declineConnection } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    if (notif.type === "message") setView("messages");
    else if (["follow", "connection_request", "connection_accepted"].includes(notif.type)) setView("profile");
    else if (notif.type === "ai_recommendation") setView("ai-poly");
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto p-4 sm:p-6 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      {/* Header */}
      <SectionHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        icon={<Bell className="w-5 h-5 text-orange-500" />}
        action={
          unreadCount > 0 && (
            <Badge variant="warning" size="md">
              {unreadCount} new
            </Badge>
          )
        }
        className="mb-6"
      />

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="When you receive likes, comments, or new connections, they'll show up here"
            icon={<Bell className="w-6 h-6" />}
            action={
              <Button onClick={() => setView("discover")} icon={<Compass className="w-4 h-4" />}>
                Discover People
              </Button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notif, i) => {
              const sender = notif.sender;
              const Icon = iconMap[notif.type] || iconMap.system;
              const bg = bgMap[notif.type] || bgMap.system;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <AppCard
                    variant={notif.read ? "outlined" : "default"}
                    padding="sm"
                    className={`cursor-pointer group ${
                      !notif.read ? "border-l-4 border-l-orange-500" : ""
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                    hover
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        {Icon}
                      </div>

                      {/* Avatar (if sender) */}
                      {sender && (
                        <Avatar
                          src={sender.avatar_url || ""}
                          alt={sender.full_name || "User"}
                          size="sm"
                          className="shrink-0"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {sender && (
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {sender.full_name}{" "}
                            </span>
                          )}
                          {notif.content}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(notif.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })} at{" "}
                          {new Date(notif.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {notif.type === "connection_request" && sender && currentUser && (() => {
                          const conn = connections.find(
                            (c) => c.requester_id === sender.id && c.recipient_id === currentUser.id && c.status === "pending"
                          );
                          if (!conn) return null;
                          return (
                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="xs"
                                variant="primary"
                                onClick={() => acceptConnection(conn.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => declineConnection(conn.id)}
                              >
                                Decline
                              </Button>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all shrink-0"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AppCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
