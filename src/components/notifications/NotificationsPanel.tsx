import React from "react";
import { useStore } from "../../store";
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Award, 
  Sparkles, 
  Mail,
  Trash2
} from "lucide-react";

export default function NotificationsPanel() {
  const { notifications, setView, deleteNotification } = useStore();

  const handleNotificationClick = (notif: any) => {
    if (notif.type === "message") {
      setView("messages");
    } else if (notif.type === "follow") {
      setView("profile");
    } else if (notif.type === "ai_recommendation") {
      setView("ai-poly");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={14} className="text-red-500 fill-current" />;
      case "comment":
        return <MessageSquare size={14} className="text-orange-500" />;
      case "follow":
        return <UserPlus size={14} className="text-blue-500" />;
      case "ai_recommendation":
        return <Sparkles size={14} className="text-yellow-500 fill-current" />;
      case "verification":
        return <Award size={14} className="text-green-500" />;
      default:
        return <Bell size={14} className="text-neutral-500" />;
    }
  };

  return (
    <div className="flex-1 max-w-lg mx-auto p-4 sm:p-5 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe text-left space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="text-orange-500" size={20} />
            <span>Echoes</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Echoes of emotional connections, likes, follows, and Poly AI signals.</p>
        </div>
      </div>

      {/* Notifications scroll list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-24 text-xs text-neutral-450 font-mono space-y-2">
            <Bell size={24} className="text-neutral-300 dark:text-neutral-800 mx-auto animate-pulse" />
            <p>Your connection timeline is silent. Join tribes to trigger ripples.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const sender = notif.sender;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 bg-white/70 dark:bg-zinc-950/45 border border-neutral-150/40 dark:border-neutral-900 rounded-3xl flex items-start space-x-3.5 transition duration-300 select-none cursor-pointer hover:border-orange-500/30 ${
                  !notif.read ? "ring-1 ring-orange-500/10 bg-gradient-to-r from-orange-500/[0.01]" : ""
                }`}
              >
                {/* Visual Icon Indicator */}
                <div className="p-1.5 rounded-full bg-neutral-100 dark:bg-zinc-900 shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Avatar */}
                {sender && (
                  <img
                    src={sender.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-150"
                  />
                )}

                {/* Content text */}
                <div className="flex-1 text-xs">
                  <div>
                    {sender && (
                      <span className="font-bold text-neutral-800 dark:text-neutral-150 font-sans mr-1">
                        {sender.full_name}
                      </span>
                    )}
                    <span className="text-neutral-600 dark:text-neutral-400 font-serif">
                      {notif.content}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-mono text-neutral-400 pt-1.5">
                    <span>{new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    
                    {/* Simulated email delivery signature indicator */}
                    {notif.content.includes("[Simulated Email]") && (
                      <span className="flex items-center gap-1 text-[8px] text-orange-500 uppercase font-bold tracking-widest leading-none">
                        <Mail size={8} /> Auto-dispatched to inbox
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete notification button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-850 hover:border-red-500/30 bg-neutral-50/70 hover:bg-rose-500/10 dark:bg-black/30 text-neutral-400 hover:text-red-500 transition cursor-pointer self-center"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
