import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../../store";
import { Send, Sparkles, Smile, Image, Loader, Trash2, HelpCircle } from "lucide-react";
import GifModal from "../modals/GifModal";

export default function ChatWindow() {
  const { 
    currentUser, 
    activeConversationId, 
    conversations, 
    messages, 
    sendMessage, 
    profiles 
  } = useStore();

  const [inputText, setInputText] = useState("");
  const [gifOpen, setGifOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const recipient = activeConv?.participants[0];
  const liveProfile = profiles.find((p) => p.id === recipient?.id);

  // Filter messages for active conversation
  const convMessages = messages.filter((m) => m.conversation_id === activeConversationId);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // If chat recipient is Poly-AI and their last message is from currentUser, set temporary typing simulation!
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

  // Request AI Reply Suggestions from Server Endpoint!
  const loadSuggestions = async () => {
    if (!recipient) return;
    setSuggestionsLoading(true);
    try {
      const historyContext = convMessages.slice(-4).map((m) => ({
        sender_name: m.sender_id === currentUser?.id ? "Me" : recipient.full_name,
        content: m.content
      }));

      const res = await fetch("/api/poly/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipient.full_name,
          lastMessages: historyContext.length > 0 ? historyContext : [{ sender_name: recipient.full_name, content: "Hey! Let's talk." }]
        })
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      setSuggestions([
        "Tell me more about your journey! 🌟",
        "That sounds fascinating, how does it make you feel?",
        "I'd love to explore this vibe further with you!"
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
    setSuggestions([]); // Clear suggestions on send
    await sendMessage(activeConversationId, text);
  };

  const handleGifSelect = async (gifUrl: string) => {
    if (!activeConversationId) return;
    await sendMessage(activeConversationId, "", undefined, gifUrl);
  };

  if (!activeConv || !recipient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50/50 dark:bg-black/5">
        <Sparkles size={36} className="text-neutral-300 dark:text-neutral-800 animate-pulse" />
        <h4 className="text-sm font-serif font-bold text-neutral-400 dark:text-neutral-600 mt-3">Whisper Room Idle</h4>
        <p className="text-[10px] text-neutral-400/80 font-mono mt-1">Select a glowing connection from private whispers list to unfold dialogues.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950/20 relative">
      
      {/* Active Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-850 bg-neutral-50/40 dark:bg-neutral-950/20 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-left">
          <div className="relative">
            <img
              src={liveProfile?.avatar_url || recipient.avatar_url}
              alt={liveProfile?.full_name || recipient.full_name}
              className="w-10 h-10 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
            />
            {liveProfile?.is_active && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-white flex items-center gap-1">
              {liveProfile?.full_name || recipient.full_name}
              {liveProfile?.is_verified && <span className="text-[10px] text-orange-500">✔</span>}
            </h4>
            <p className="text-[9px] text-neutral-400 font-mono">
              {liveProfile?.is_active ? "Online resonance" : "Offline rest"}
            </p>
          </div>
        </div>

        {/* Suggest replies button */}
        <button
          onClick={loadSuggestions}
          disabled={suggestionsLoading}
          className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-mono rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 transition active:scale-97 disabled:opacity-50"
        >
          {suggestionsLoading ? (
            <Loader size={11} className="animate-spin" />
          ) : (
            <HelpCircle size={11} />
          )}
          <span>Get Poly suggestions</span>
        </button>
      </div>

      {/* Message List Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-270px)]">
        {convMessages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end space-x-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse space-x-reverse text-right" : "text-left"}`}
            >
              {!isMe && (
                <img
                  src={liveProfile?.avatar_url || recipient.avatar_url}
                  alt={recipient.full_name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-neutral-100 dark:border-neutral-850"
                />
              )}
              <div className="space-y-1">
                <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-sm ${
                  isMe
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-none shadow shadow-orange-900/10"
                    : "bg-neutral-100 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 rounded-bl-none border border-neutral-150/40 dark:border-neutral-850"
                }`}>
                  {msg.content}

                  {msg.giphy_url && (
                    <img 
                      src={msg.giphy_url} 
                      alt="Private GIF attachment" 
                      className="rounded-lg max-h-40 mt-1 max-w-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="text-[8px] font-mono text-neutral-400 capitalize">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time typing indicators for Poly */}
        {typing && (
          <div className="flex items-end space-x-2.5 max-w-[85%] text-left">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
              alt="Poly Assistant"
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 rounded-2xl rounded-bl-none border border-neutral-150/40 dark:border-neutral-850 flex items-center space-x-1.5">
              <span className="text-[10px] font-mono animate-pulse">Poly is aligning frequency</span>
              <span className="flex space-x-1 items-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI SUGGESTION FEEDBACK OVERLAY */}
      {suggestions.length > 0 && (
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-zinc-950/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[9px] font-mono text-orange-500 dark:text-orange-400 flex items-center gap-0.5 shrink-0 select-none">
            <Sparkles size={11} className="fill-current" /> Auto-Replies:
          </span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(sug)}
              className="text-[11px] font-sans px-3.5 py-1.5 bg-white dark:bg-black rounded-full text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-850 hover:border-orange-500/40 hover:text-orange-500 dark:hover:text-amber-400 whitespace-nowrap outline-none transition duration-200"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input container controls */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center gap-3">
        {/* GIF attach trigger */}
        <button
          type="button"
          onClick={() => setGifOpen(true)}
          className="p-2 transition rounded-full text-neutral-450 hover:text-orange-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 group"
          title="Attach Giphy Feeling"
        >
          <Smile size={18} className="group-hover:scale-105 transition" />
        </button>

        {/* Input Text Box */}
        <input
          type="text"
          placeholder="Whisper connection threads..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-black text-xs text-neutral-850 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/25 transition shadow-inner"
        />

        {/* Submit Action */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-550 disabled:opacity-40 transition outline-none"
        >
          <Send size={15} />
        </button>
      </form>

      {/* GIF MODAL PANEL */}
      <GifModal
        isOpen={gifOpen}
        onClose={() => setGifOpen(false)}
        onSelect={handleGifSelect}
      />

    </div>
  );
}
