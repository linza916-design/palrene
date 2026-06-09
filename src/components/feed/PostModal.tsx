import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { X, Heart, MessageCircle, Repeat2, Zap, Bookmark, Bell, Share2, MoveHorizontal as MoreHorizontal, Eye, ChevronLeft, Send, Heart as HeartFilled } from "lucide-react";
import { useStore } from "../../store";
import SmartCommentSection from "./SmartCommentSection";
import {
  getPostById,
  toggleReaction,
  toggleBookmark,
  toggleFollowDiscussion,
  getUserReaction,
  isBookmarked,
  isFollowingDiscussion,
  subscribeToPostUpdates,
  subscribeToReactions,
  type PostWithProfile,
} from "../../lib/posts";
import { supabase } from "../../lib/supabase";

interface PostModalProps {
  postId: string;
  onClose: () => void;
}

export default function PostModal({ postId, onClose }: PostModalProps) {
  const { currentUser } = useStore();
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 150], [1, 0]);
  const scale = useSpring(useTransform(y, [0, 150], [1, 0.95]), { stiffness: 300, damping: 30 });

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      const fetchedPost = await getPostById(postId);
      setPost(fetchedPost);

      if (fetchedPost && currentUser) {
        const [reaction, bookmarkStatus, followStatus] = await Promise.all([
          getUserReaction(currentUser.id, postId),
          isBookmarked(currentUser.id, postId),
          isFollowingDiscussion(currentUser.id, postId),
        ]);
        setLiked(!!reaction);
        setBookmarked(bookmarkStatus);
        setFollowing(followStatus);
      }

      setLoading(false);
    };

    loadPost();

    const postChannel = subscribeToPostUpdates(postId, ({ eventType, new: updatedPost }) => {
      if (eventType === "UPDATE") {
        setPost((prev) => (prev ? { ...prev, ...updatedPost } : null));
      }
    });

    const reactionsChannel = subscribeToReactions(postId, () => {
      getPostById(postId).then((updated) => {
        if (updated) setPost(updated);
      });
    });

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [postId, currentUser]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, []);

  const handleDragEnd = (_: any, info: { offset: { y: number } }) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleLike = async () => {
    if (!currentUser || actionLoading) return;
    setActionLoading(true);
    const { reacted } = await toggleReaction(currentUser.id, postId);
    setLiked(reacted);
    setPost((prev) =>
      prev
        ? { ...prev, likes_count: reacted ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1) }
        : null
    );
    setActionLoading(false);
  };

  const handleBookmark = async () => {
    if (!currentUser || actionLoading) return;
    setActionLoading(true);
    const { bookmarked: newStatus } = await toggleBookmark(currentUser.id, postId);
    setBookmarked(newStatus);
    setActionLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser || actionLoading) return;
    setActionLoading(true);
    const { following: newStatus } = await toggleFollowDiscussion(currentUser.id, postId);
    setFollowing(newStatus);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl">
          <div className="animate-pulse">
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-6 space-y-4">
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Post not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-mono"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  const shouldBlur = post.is_sensitive && !sensitiveRevealed;

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      ref={backdropRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y, opacity, scale }}
        className="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-900 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={post.profiles?.avatar_url || ""}
              alt={post.profiles?.full_name || ""}
              className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
            />
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-white flex items-center gap-1">
                {post.profiles?.full_name}
                {post.profiles?.is_verified && (
                  <span className="text-[10px] text-orange-500">✓</span>
                )}
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                @{post.profiles?.username} • {timeAgo(post.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFollow}
              disabled={actionLoading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono transition ${
                following
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-orange-500/30"
              }`}
            >
              <Bell size={12} />
              {following ? "Following" : "Follow discussion"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition"
            >
              <X size={18} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left side: Post content */}
          <div className="lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-neutral-100 dark:border-neutral-900">
            {/* Content */}
            <div
              onDoubleClick={() => setSensitiveRevealed(true)}
              className={`text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed ${
                shouldBlur ? "blur-lg select-none" : ""
              }`}
            >
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-neutral-900/90 text-white px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2">
                    <Eye size={14} />
                    Double-click to reveal
                  </div>
                </div>
              )}
              <p>{post.content}</p>
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl overflow-hidden">
                {post.media_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className={`w-full object-cover rounded-xl ${shouldBlur ? "blur-lg" : ""}`}
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}

            {/* GIF */}
            {post.giphy_url && (
              <div className="mt-4 rounded-xl overflow-hidden">
                <img
                  src={post.giphy_url}
                  alt=""
                  className={`max-w-full rounded-xl ${shouldBlur ? "blur-lg" : ""}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={actionLoading}
                  className={`flex items-center gap-1.5 text-sm transition ${
                    liked ? "text-red-500" : "text-neutral-500 hover:text-red-500"
                  }`}
                >
                  {liked ? (
                    <HeartFilled size={18} className="fill-current" />
                  ) : (
                    <Heart size={18} />
                  )}
                  <span className="font-mono text-xs">{post.likes_count}</span>
                </button>

                <button className="flex items-center gap-1.5 text-neutral-500 hover:text-green-500 transition text-sm">
                  <Repeat2 size={18} />
                  <span className="font-mono text-xs">{post.reposts_count}</span>
                </button>

                <button className="flex items-center gap-1.5 text-neutral-500 hover:text-yellow-500 transition text-sm">
                  <Zap size={16} />
                  <span className="font-mono text-xs">{post.boosted ? "Boosted" : "Boost"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  disabled={actionLoading}
                  className={`p-2 rounded-full transition ${
                    bookmarked
                      ? "text-orange-500 bg-orange-500/10"
                      : "text-neutral-400 hover:text-orange-500 hover:bg-orange-500/5"
                  }`}
                >
                  <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
                </button>
                <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full transition">
                  <Share2 size={16} />
                </button>
                <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full transition">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Views */}
            <div className="mt-3 text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Eye size={12} />
              {post.views_count || 0} views
            </div>
          </div>

          {/* Right side: Comments */}
          <div className="lg:w-1/2 flex flex-col h-full max-h-[50vh] lg:max-h-none">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-4 flex items-center gap-2">
                <MessageCircle size={14} className="text-orange-500" />
                Discussion
              </h4>
              <SmartCommentSection postId={postId} commentsCount={post.comments_count} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
