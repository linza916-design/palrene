import React from "react";
import { useStore } from "../../store";
import { MessageSquare, Sparkles, Search } from "lucide-react";
import { AppCard, Avatar, EmptyState, Badge, SectionHeader } from "../ui";

export default function ChatList() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    profiles,
    searchQuery,
    setSearchQuery,
  } = useStore();

  return (
    <div className="w-full md:w-80 h-full border-r border-neutral-100 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
        <SectionHeader
          title="Messages"
          subtitle="Private conversations"
          icon={<MessageSquare className="w-5 h-5 text-orange-500" />}
          className="mb-4"
        />

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition"
          />
        </div>
      </div>

      {/* Conversations scroll */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No messages yet"
              description="Start a conversation to connect with others"
              icon={<MessageSquare className="w-6 h-6" />}
            />
          </div>
        ) : (
          conversations.map((conv) => {
            const recipient = conv.participants[0];
            const isActive = activeConversationId === conv.id;
            const liveProfile = profiles.find((p) => p.id === recipient.id);

            return (
              <AppCard
                key={conv.id}
                variant={isActive ? "default" : "outlined"}
                padding="sm"
                hover
                className={`cursor-pointer transition-all ${
                  isActive
                    ? "bg-linear-to-r from-orange-500/10 to-red-500/10 border-orange-500/30"
                    : ""
                }`}
                onClick={() => setActiveConversation(conv.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with status indicator */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={
                        liveProfile?.avatar_url || recipient.avatar_url || ""
                      }
                      alt={
                        liveProfile?.full_name || recipient.full_name || "User"
                      }
                      size="md"
                      online={liveProfile?.is_active}
                      verified={liveProfile?.is_verified}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1">
                        {liveProfile?.full_name || recipient.full_name}
                        {liveProfile?.id === "poly-ai" && (
                          <Sparkles
                            size={12}
                            className="text-amber-500 animate-pulse"
                          />
                        )}
                      </h4>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono shrink-0">
                          {new Date(conv.last_message_at).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {conv.last_message || "No messages yet"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread_count && conv.unread_count > 0 && (
                    <Badge variant="primary" size="sm" className="shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              </AppCard>
            );
          })
        )}
      </div>
    </div>
  );
}
