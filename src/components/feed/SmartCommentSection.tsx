import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  ChevronDown,
  ChevronUp,
  Heart,
  MoveHorizontal as MoreHorizontal,
  Loader as Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  getComments,
  getReplies,
  createComment,
  toggleReaction,
  getUserReaction,
  subscribeToComments,
  type CommentWithProfile,
} from "../../lib/posts";
import { subscribeToTyping, setTyping, clearTyping } from "../../lib/typing";
import { useStore } from "../../store";
import MentionsInput from "./MentionsInput";

interface SmartCommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
}

type SortOption = "top" | "newest" | "oldest";

const TYPING_TIMEOUT = 3000;

const SORT_LABELS: Record<SortOption, string> = {
  top: "Top",
  newest: "Newest",
  oldest: "Oldest",
};

export default function SmartCommentSection({
  postId,
  commentsCount: initialCount,
  onCommentsCountChange,
}: SmartCommentSectionProps) {
  const { currentUser } = useStore();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortOption>("top");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalComments, setTotalComments] = useState(initialCount);
  const [typingUsers, setTypingUsers] = useState<
    { user_id: string; username: string; avatar_url: string }[]
  >([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadComments = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        setComments([]);
      } else {
        setLoadingMore(true);
      }

      const offset = reset ? 0 : comments.length;
      const fetched = await getComments(postId, offset, 5);

      if (reset) {
        setComments(fetched);
        setLoading(false);
      } else {
        setComments((prev) => [...prev, ...fetched]);
        setLoadingMore(false);
      }

      setHasMore(fetched.length === 5);
    },
    [postId, comments.length],
  );

  useEffect(() => {
    loadComments(true);

    const channel = subscribeToComments(postId, (payload) => {
      if (payload.eventType === "INSERT") {
        setTotalComments((prev) => prev + 1);
        onCommentsCountChange?.(totalComments + 1);
      } else if (payload.eventType === "DELETE") {
        setTotalComments((prev) => Math.max(0, prev - 1));
        onCommentsCountChange?.(Math.max(0, totalComments - 1));
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToTyping(postId, currentUser.id, (users) => {
      setTypingUsers(users);
    });

    return unsubscribe;
  }, [postId, currentUser]);

  const handleTyping = () => {
    if (!currentUser) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTyping(postId, {
      id: currentUser.id,
      username: currentUser.username,
      avatar_url: currentUser.avatar_url,
    });

    typingTimeoutRef.current = setTimeout(() => {
      clearTyping(postId);
    }, TYPING_TIMEOUT);
  };

  const handleCommentChange = (value: string) => {
    setCommentText(value);
    if (value.trim()) {
      handleTyping();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || submitting) return;

    setSubmitting(true);
    const newComment = await createComment(
      currentUser.id,
      postId,
      commentText.trim(),
    );

    if (newComment) {
      setComments((prev) => [
        { ...newComment, profiles: newComment.profiles as any },
        ...prev,
      ]);
      setTotalComments((prev) => prev + 1);
      onCommentsCountChange?.(totalComments + 1);
      setCommentText("");
    }

    setSubmitting(false);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    const sorted = [...comments].sort((a, b) => {
      if (newSort === "top") return b.likes_count - a.likes_count;
      if (newSort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    setComments(sorted);
  };

  if (loading) {
    return (
      <div className="pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-4">
      {/* Header with sort options */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {totalComments} {totalComments === 1 ? "comment" : "comments"}
        </span>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {(["top", "newest", "oldest"] as SortOption[]).map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`px-2 py-0.5 rounded-full transition ${
                sort === s
                  ? "bg-orange-500/10 text-orange-500 font-bold"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Comment input */}
      {currentUser && (
        <form
          onSubmit={handleSubmitComment}
          className="flex gap-2 items-center"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-7 h-7 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
          />
          <div className="relative flex-1">
            <MentionsInput
              value={commentText}
              onChange={handleCommentChange}
              onSubmit={() => {}}
              placeholder="Add a comment... (@ to mention)"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-orange-500 hover:text-orange-600 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 px-2"
          >
            <div className="flex -space-x-1.5">
              {typingUsers.slice(0, 3).map((user) => (
                <img
                  key={user.user_id}
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-4 h-4 rounded-full border border-white dark:border-zinc-900"
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {typingUsers.length === 1
                ? `${typingUsers[0].username} is typing`
                : typingUsers.length === 2
                  ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
                  : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing`}
              <span className="inline-flex ml-0.5">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse delay-75">.</span>
                <span className="animate-pulse delay-150">.</span>
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments list */}
      <div className="space-y-4 max-h-100 overflow-y-auto pr-1">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentWithReplies
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUser?.id}
              currentUser={currentUser ?? undefined}
            />
          ))}
        </AnimatePresence>

        {/* Load more button */}
        {hasMore && comments.length > 0 && (
          <button
            onClick={() => loadComments(false)}
            disabled={loadingMore}
            className="w-full py-2 text-xs text-orange-500 hover:text-orange-600 font-mono flex items-center justify-center gap-1 transition"
          >
            {loadingMore ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Load more comments
              </>
            )}
          </button>
        )}

        {!hasMore && comments.length > 0 && (
          <p className="text-center text-[10px] text-neutral-400 font-mono py-2">
            All comments loaded
          </p>
        )}
      </div>

      {comments.length === 0 && !loading && (
        <div className="text-center py-6 text-xs text-neutral-400 dark:text-neutral-600">
          <p>No comments yet.</p>
          <p className="mt-0.5 text-neutral-300 dark:text-neutral-700">
            Be the first to share your thoughts.
          </p>
        </div>
      )}
    </div>
  );
}

function CommentWithReplies({
  comment,
  postId,
  currentUserId,
  currentUser,
}: {
  comment: CommentWithProfile;
  postId: string;
  currentUserId?: string;
  currentUser?: { avatar_url?: string | null };
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentWithProfile[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count);

  useEffect(() => {
    if (currentUserId) {
      getUserReaction(currentUserId, undefined, comment.id).then((reaction) => {
        setLiked(!!reaction);
      });
    }
  }, [currentUserId, comment.id]);

  const loadReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      const fetched = await getReplies(comment.id, 0, 3);
      setReplies(fetched);
      setHasMoreReplies(fetched.length === 3);
      setShowReplies(true);
      setLoadingReplies(false);
    } else {
      setShowReplies(false);
    }
  };

  const loadMoreReplies = async () => {
    setLoadingReplies(true);
    const fetched = await getReplies(comment.id, replies.length, 3);
    setReplies((prev) => [...prev, ...fetched]);
    setHasMoreReplies(fetched.length === 3);
    setLoadingReplies(false);
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    const { reacted } = await toggleReaction(
      currentUserId,
      undefined,
      comment.id,
    );
    setLiked(reacted);
    setLikesCount((prev) => (reacted ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId || submittingReply) return;

    setSubmittingReply(true);
    const newReply = await createComment(
      currentUserId,
      postId,
      replyText.trim(),
      comment.id,
    );

    if (newReply) {
      setReplies((prev) => [...prev, newReply]);
      setReplyText("");
      setShowReplyInput(false);
    }

    setSubmittingReply(false);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <div className="flex items-start gap-2.5">
        <img
          src={comment.profiles?.avatar_url || ""}
          alt={comment.profiles?.full_name || ""}
          className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-neutral-100 dark:bg-neutral-900/60 p-2.5 rounded-2xl rounded-tl-none border border-neutral-150/40 dark:border-neutral-850">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                {comment.profiles?.full_name}
                {comment.profiles?.is_verified && (
                  <span className="ml-1 text-[8px] text-orange-500">✓</span>
                )}
              </span>
              <span className="text-[9px] text-neutral-400 font-mono shrink-0">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed wrap-break-word">
              {comment.content}
            </p>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-neutral-400 ml-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition ${
                liked ? "text-red-500" : ""
              }`}
            >
              <Heart size={11} className={liked ? "fill-current" : ""} />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {currentUserId && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="hover:text-neutral-600 dark:hover:text-neutral-300 transition"
              >
                Reply
              </button>
            )}

            {comment.replies_count > 0 && (
              <button
                onClick={loadReplies}
                className="flex items-center gap-1 hover:text-orange-500 transition"
              >
                {showReplies ? (
                  <ChevronUp size={11} />
                ) : (
                  <ChevronDown size={11} />
                )}
                <span>
                  {comment.replies_count}{" "}
                  {comment.replies_count === 1 ? "reply" : "replies"}
                </span>
              </button>
            )}
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && currentUserId && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReply}
                className="mt-2 flex gap-2 items-center overflow-hidden"
              >
                <img
                  src={currentUser?.avatar_url || ""}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 py-1.5 px-2.5 text-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full focus:outline-none focus:border-orange-500/60"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submittingReply}
                  className="text-orange-500 hover:text-orange-600 disabled:opacity-40"
                >
                  {submittingReply ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2.5 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                {loadingReplies && replies.length === 0 ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2
                      size={14}
                      className="animate-spin text-neutral-400"
                    />
                  </div>
                ) : (
                  replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <img
                        src={reply.profiles?.avatar_url || ""}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-neutral-50 dark:bg-neutral-900/40 p-2 rounded-xl text-[10px]">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            {reply.profiles?.full_name}
                          </span>
                          <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 wrap-break-word">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {hasMoreReplies && replies.length > 0 && (
                  <button
                    onClick={loadMoreReplies}
                    disabled={loadingReplies}
                    className="text-[10px] text-orange-500 hover:text-orange-600 font-mono flex items-center gap-1 ml-7"
                  >
                    {loadingReplies ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <ChevronDown size={10} />
                    )}
                    Load more replies
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
