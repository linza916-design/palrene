import React from "react";
import { useStore } from "../../store";
import { MessageCircle, Sparkles } from "lucide-react";

export default function ChatList() {
  const { conversations, activeConversationId, setActiveConversation, profiles } = useStore();

  return (
    <div className="w-full md:w-80 h-full border-r border-neutral-200 dark:border-neutral-850 flex flex-col bg-white dark:bg-black/20">
      
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-850 bg-neutral-50/40 dark:bg-neutral-950/20">
        <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
          <MessageCircle size={16} className="text-orange-500" />
          <span>Private Whispers</span>
        </h3>
        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Secure, borderless connection tunnels.</p>
      </div>

      {/* Conversations scroll */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900/60 p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-xs text-neutral-450 font-mono">
            No whispers started yet. Seek a match profile.
          </div>
        ) : (
          conversations.map((conv) => {
            const recipient = conv.participants[0];
            const isActive = activeConversationId === conv.id;
            const liveProfile = profiles.find((p) => p.id === recipient.id);

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/10 dark:border-red-500/15 scale-98"
                    : "hover:bg-neutral-100/60 dark:hover:bg-neutral-900/40 border border-transparent"
                }`}
              >
                {/* Avatar with live status indicator dot */}
                <div className="relative shrink-0">
                  <img
                    src={liveProfile?.avatar_url || recipient.avatar_url}
                    alt={liveProfile?.full_name || recipient.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
                  />
                  {liveProfile?.is_active && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-neutral-800 dark:text-white truncate flex items-center gap-1">
                      {liveProfile?.full_name || recipient.full_name}
                      {liveProfile?.id === "poly-ai" && (
                        <Sparkles size={11} className="text-yellow-400 fill-current animate-pulse" />
                      )}
                    </h4>
                    {conv.last_message_at && (
                      <span className="text-[8px] text-neutral-400 font-mono">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 italic">
                    {conv.last_message || "Silent resonance"}
                  </p>
                </div>

                {/* Unread indicators count badge */}
                {conv.unread_count && conv.unread_count > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
