import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smile,
  Image as ImageIcon,
  Loader as Loader2,
  AtSign,
} from "lucide-react";
import { useStore } from "../../store";

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function MentionsInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add a comment...",
  disabled = false,
  autoFocus = false,
  className = "",
}: MentionsInputProps) {
  const { profiles, currentUser } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  // Filter profiles for mentions (exclude current user)
  const filteredProfiles = profiles
    .filter((p) => p.id !== currentUser?.id && p.id !== "poly-ai")
    .filter((p) => {
      if (!mentionQuery) return true;
      const query = mentionQuery.toLowerCase();
      return (
        p.username?.toLowerCase().includes(query) ||
        p.full_name?.toLowerCase().includes(query)
      );
    })
    .slice(0, 5);

  // Detect @ mentions
  useEffect(() => {
    if (!inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after the @ (meaning it's not a mention)
      if (!textAfterAt.includes(" ") && textAfterAt.length <= 20) {
        setMentionStartPos(lastAtIndex);
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
        setMentionStartPos(null);
      }
    } else {
      setShowMentions(false);
      setMentionStartPos(null);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredProfiles.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredProfiles.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredProfiles.length - 1,
        );
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        selectMention(filteredProfiles[selectedMentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const selectMention = (profile: {
    username?: string;
    full_name?: string;
  }) => {
    if (mentionStartPos === null) return;

    const username =
      profile.username ||
      profile.full_name?.split(" ").join("").toLowerCase() ||
      "";
    const newValue =
      value.slice(0, mentionStartPos) +
      `@${username} ` +
      value.slice(inputRef.current?.selectionStart || value.length);

    onChange(newValue);
    setShowMentions(false);
    setMentionStartPos(null);

    // Move cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = mentionStartPos + username.length + 2;
        inputRef.current.setSelectionRange(newPos, newPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className="w-full py-2 pl-3 pr-20 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full focus:outline-none focus:border-orange-500/60 transition disabled:opacity-50"
          />

          {/* Formatting hints */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-neutral-400">
            <AtSign
              size={12}
              className="cursor-pointer hover:text-orange-500 transition"
              onClick={() => {
                const pos = inputRef.current?.selectionStart || value.length;
                onChange(value.slice(0, pos) + "@" + value.slice(pos));
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Mentions dropdown */}
      <AnimatePresence>
        {showMentions && filteredProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 bottom-full mb-2 w-full max-w-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-1.5 text-[9px] text-neutral-400 font-mono uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
              Mention someone
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredProfiles.map((profile, idx) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => selectMention(profile)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-left transition ${
                    idx === selectedMentionIndex
                      ? "bg-orange-500/10 dark:bg-orange-500/5"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <img
                    src={profile.avatar_url || ""}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-neutral-800 dark:text-white truncate">
                      {profile.full_name}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-mono">
                      @{profile.username}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-1.5 text-[9px] text-neutral-400 font-mono border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span>↑↓ to navigate</span>
              <span>↵ or Tab to select</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
