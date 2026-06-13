import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import {
  Send,
  Sparkles,
  Smile,
  Loader as Loader2,
  Lock,
  Zap,
} from "lucide-react";
import GifModal from "../modals/GifModal";
import ConnectionButton from "../connections/ConnectionButton";
import { motion, AnimatePresence } from "motion/react";
import { AppCard, Avatar, Button, EmptyState } from "../ui";

export default function ChatWindow() {
  const {
    currentUser,
    activeConversationId,
    conversations,
    messages,
    sendMessage,
    profiles,
    spendTokens,
    getConnectionStatus,
  } = useStore();

  const [inputText, setInputText] = useState("");
  const [gifOpen, setGifOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const recipient = activeConv?.participants[0];
  const liveProfile = profiles.find((p) => p.id === recipient?.id);

  const isPolyAI = recipient?.id === "poly-ai";
  const connectionStatus =
    recipient && recipient.id && currentUser
      ? getConnectionStatus(recipient.id)
      : "none";
  const isConnected = isPolyAI || connectionStatus === "connected";
  const tokenBalance = currentUser?.token_balance || 0;
  const DM_UNLOCK_COST = 20;

  const handleUnlockWithTokens = async () => {
    if (!recipient || !currentUser) return;
    setUnlocking(true);
    const success = spendTokens(
      DM_UNLOCK_COST,
      "dm_unlock",
      `Premium DM unlock — ${liveProfile?.full_name || "user"}`,
    );
    if (!success) {
      alert("Insufficient tokens. Earn more tokens to unlock messaging!");
    }
    setUnlocking(false);
  };

  // Filter messages for active conversation
  const convMessages = messages.filter(
    (m) => m.conversation_id === activeConversationId,
  );

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Poly-AI typing simulation
  useEffect(() => {
    if (!recipient || recipient.id !== "poly-ai") {
      setTyping(false);
      return;
    }
    const lastMsg = convMessages[convMessages.length - 1];
    if (lastMsg && lastMsg.sender_id === currentUser?.id) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  }, [messages, activeConversationId]);

  // Request AI Reply Suggestions
  const loadSuggestions = async () => {
    if (!recipient) return;
    setSuggestionsLoading(true);
    try {
      const historyContext = convMessages.slice(-4).map((m) => ({
        sender_name:
          m.sender_id === currentUser?.id ? "Me" : recipient.full_name,
        content: m.content,
      }));

      const res = await fetch("/api/poly/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipient.full_name,
          lastMessages:
            historyContext.length > 0
              ? historyContext
              : [
                  {
                    sender_name: recipient.full_name,
                    content: "Hey! Let's talk.",
                  },
                ],
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      setSuggestions([
        "Tell me more about your journey!",
        "That sounds fascinating, how does it make you feel?",
        "I'd love to explore this vibe further with you!",
      ]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const text = inputText.trim();
    setInputText("");
    setSuggestions([]);
    await sendMessage(activeConversationId, text);
  };

  const handleGifSelect = async (gifUrl: string) => {
    if (!activeConversationId) return;
    await sendMessage(activeConversationId, "", undefined, gifUrl);
  };

  if (!activeConv || !recipient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center mb-4">
          <Sparkles
            size={32}
            className="text-neutral-400 dark:text-neutral-600"
          />
        </div>
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the list to start messaging"
          icon={<Sparkles className="w-6 h-6" />}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 relative overflow-hidden">
      {/* Active Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={liveProfile?.avatar_url || recipient.avatar_url || ""}
            alt={liveProfile?.full_name || recipient.full_name || "User"}
            size="md"
            online={liveProfile?.is_active}
            verified={liveProfile?.is_verified}
          />
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
              {liveProfile?.full_name || recipient.full_name}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {liveProfile?.is_active ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Suggest replies button */}
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestions}
          loading={suggestionsLoading}
          icon={
            suggestionsLoading ? undefined : <Sparkles className="w-4 h-4" />
          }
        >
          Suggestions
        </Button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {convMessages.length === 0 ? (
          <EmptyState
            title="Start the conversation"
            description="Send a message to begin chatting"
          />
        ) : (
          convMessages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isMe && (
                  <Avatar
                    src={liveProfile?.avatar_url || recipient.avatar_url || ""}
                    alt={recipient.full_name || "User"}
                    size="sm"
                  />
                )}
                <div className="space-y-1">
                  <AppCard
                    variant={isMe ? "default" : "outlined"}
                    padding="sm"
                    className={`${
                      isMe
                        ? "bg-linear-to-r from-red-500 to-orange-500 text-white border-none"
                        : ""
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.giphy_url && (
                      <img
                        src={msg.giphy_url}
                        alt="GIF attachment"
                        className="rounded-lg max-h-40 mt-2 max-w-full"
                        loading="lazy"
                      />
                    )}
                  </AppCard>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2 max-w-[85%]">
            <Avatar
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
              alt="Poly Assistant"
              size="sm"
            />
            <AppCard
              variant="outlined"
              padding="sm"
              className="flex items-center gap-2"
            >
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Poly is typing
              </span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
              </span>
            </AppCard>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
          >
            <p className="text-[10px] text-orange-500 dark:text-orange-400 font-medium mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Suggested replies
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {suggestions.map((sug, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="sm"
                  onClick={() => setInputText(sug)}
                  className="whitespace-nowrap"
                >
                  {sug}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Gate */}
      {!isConnected && recipient && (
        <motion.div
          className="absolute inset-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Lock size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            Connection Required
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-xs mb-6">
            Connect with {liveProfile?.full_name || recipient.full_name} to
            start messaging, or unlock instantly with tokens.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <ConnectionButton
              profileId={recipient.id!}
              size="md"
              className="justify-center w-full"
            />

            <div className="flex items-center gap-2 text-neutral-300 dark:text-neutral-700 text-xs">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span>or</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleUnlockWithTokens}
              disabled={unlocking || tokenBalance < DM_UNLOCK_COST}
              loading={unlocking}
              icon={<Zap className="w-4 h-4" />}
              className="w-full"
            >
              {tokenBalance >= DM_UNLOCK_COST
                ? `Unlock with ${DM_UNLOCK_COST} tokens`
                : `Need ${DM_UNLOCK_COST} tokens`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setGifOpen(true)}
          icon={<Smile className="w-5 h-5" />}
          aria-label="Attach GIF"
        />

        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition"
        />

        <Button
          type="submit"
          disabled={!inputText.trim()}
          icon={<Send className="w-4 h-4" />}
          aria-label="Send message"
        />
      </form>

      {/* GIF Modal */}
      <GifModal
        isOpen={gifOpen}
        onClose={() => setGifOpen(false)}
        onSelect={handleGifSelect}
      />
    </div>
  );
}
