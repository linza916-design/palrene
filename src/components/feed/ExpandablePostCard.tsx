import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Zap,
  Bookmark,
  Eye,
  ChevronUp,
  ChevronDown,
  Share2,
  Bell,
  Play,
  Flag,
  Check,
} from "lucide-react";
import { Post } from "../../types";
import SmartCommentSection from "./SmartCommentSection";
import { useStore } from "../../store";
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
  sharePost,
  incrementViewCount,
  type PostWithProfile,
} from "../../lib/posts";
import { supabase } from "../../lib/supabase";
import { spendForBoost } from "../../lib/tokens";

interface ExpandablePostCardProps {
  post: Post;
  onOpenModal?: () => void;
}

export default function ExpandablePostCard({
  post,
  onOpenModal,
}: ExpandablePostCardProps) {
  const {
    currentUser,
    likePost,
    repostPost,
    boostPost,
    startConversation,
    toggleFollow,
    profiles,
  } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [postData, setPostData] = useState<PostWithProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const shouldBlur = post.is_sensitive && !sensitiveRevealed;

  const REPORT_REASONS = [
    "Spam",
    "Harassment",
    "Hate speech",
    "Misinformation",
    "Inappropriate content",
    "Other",
  ];

  const handleReport = async (reason: string) => {
    if (!currentUser) return;
    setShowReportMenu(false);
    try {
      await supabase.from("reports").insert({
        reporter_id: currentUser.id,
        reported_post_id: post.id,
        reported_user_id: post.userId,
        reason,
        status: "pending",
      });
      setReportSubmitted(true);
      setTimeout(() => setReportSubmitted(false), 3000);
    } catch (err) {
      console.error("Report failed:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setShowReportMenu(false);
      }
    };
    if (showReportMenu)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showReportMenu]);

  useEffect(() => {
    const loadInteractionStates = async () => {
      if (!currentUser) return;

      const [reaction, bookmarkStatus, followStatus] = await Promise.all([
        getUserReaction(currentUser.id, post.id),
        isBookmarked(currentUser.id, post.id),
        isFollowingDiscussion(currentUser.id, post.id),
      ]);

      setLiked(!!reaction);
      setBookmarked(bookmarkStatus);
      setFollowing(followStatus);
    };

    loadInteractionStates();

    const postChannel = subscribeToPostUpdates(
      post.id,
      ({ eventType, new: updatedPost }) => {
        if (eventType === "UPDATE") {
          setPostData((prev) => (prev ? { ...prev, ...updatedPost } : null));
        }
      },
    );

    const reactionsChannel = subscribeToReactions(post.id, () => {
      getPostById(post.id).then((updated) => {
        if (updated) setPostData(updated);
      });
    });

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [post.id, currentUser]);

  useEffect(() => {
    getPostById(post.id).then((data) => {
      if (data) setPostData(data);
    });
  }, [post.id]);

  const currentLikes = postData?.likes_count ?? post.likes_count;
  const currentComments = postData?.comments_count ?? post.comments_count;
  const currentReposts = postData?.reposts_count ?? post.reposts_count;
  const currentViews = postData?.views_count ?? post.views_count;

  const handleDoubleClick = () => {
    if (post.is_sensitive) {
      setSensitiveRevealed(true);
    }
  };

  const handleMainClick = () => {
    // Increment view count when post is first expanded
    if (!expanded) {
      incrementViewCount(post.id, currentUser?.id);
      setExpanded(true);
    } else {
      onOpenModal?.();
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleProfileClick = () => {
    useStore.getState().setView("profile");
    if (post.userId !== currentUser?.id) {
      localStorage.setItem("palrene_view_profile_id", post.userId);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    setLiked(true);
    setTimeout(() => setLiked(false), 600);

    likePost(post.id);

    if (currentUser) {
      const { reacted } = await toggleReaction(currentUser.id, post.id);
      setPostData((prev) =>
        prev
          ? {
              ...prev,
              likes_count: reacted
                ? prev.likes_count + 1
                : Math.max(0, prev.likes_count - 1),
            }
          : null,
      );
    }
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    repostPost(post.id);
    setReposted(true);
    setTimeout(() => setReposted(false), 600);
  };

  const handleBoost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || post.boosted) return;

    const result = await spendForBoost(currentUser.id, post.id);
    if (result.success) {
      boostPost(post.id);
      // Refresh post data
      getPostById(post.id).then((data) => {
        if (data) setPostData(data);
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shared = await sharePost(post.id, post.content.slice(0, 50));
    // Could show a toast here
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || actionLoading) return;
    setActionLoading(true);
    const { bookmarked: newStatus } = await toggleBookmark(
      currentUser.id,
      post.id,
    );
    setBookmarked(newStatus);
    setActionLoading(false);
  };

  const handleFollowDiscussion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || actionLoading) return;
    setActionLoading(true);
    const { following: newStatus } = await toggleFollowDiscussion(
      currentUser.id,
      post.id,
    );
    setFollowing(newStatus);
    setActionLoading(false);
  };

  const handleWhisper = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser && currentUser.id !== post.userId) {
      startConversation(post.userId);
    }
  };

  const authorProfile = profiles.find((p) => p.id === post.userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onDoubleClick={handleDoubleClick}
      className={`relative overflow-hidden transition-all duration-300 ${
        expanded ? "rounded-3xl" : "rounded-3xl mb-5"
      } bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900/60 shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-orange-500/3 group ${
        post.boosted
          ? "ring-1 ring-orange-500/25 bg-linear-to-br from-red-500/2 to-orange-500/2 dark:from-red-950/4 dark:to-orange-950/4"
          : ""
      }`}
      whileHover={!expanded ? { y: -1 } : undefined}
    >
      {/* Boosted badge */}
      {post.boosted && (
        <div className="absolute top-0 right-0 px-3 py-1 text-[8px] font-mono font-bold tracking-widest text-white uppercase bg-linear-to-r from-red-500 to-orange-500 rounded-bl-xl z-10 flex items-center gap-1">
          <Zap size={8} className="fill-current animate-bounce" />
          <span>Boosted</span>
        </div>
      )}

      {/* Main clickable area */}
      <div onClick={handleMainClick} className="cursor-pointer">
        {/* Profile row */}
        <div className="flex items-center justify-between mb-4 p-5 pb-0 relative">
          <div className="flex items-center space-x-3">
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setShowProfileCard(true)}
              onMouseLeave={() => setShowProfileCard(false)}
              onClick={handleProfileClick}
            >
              <img
                src={post.profile.avatar_url}
                alt={post.profile.full_name}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover border border-neutral-150 dark:border-neutral-850 hover:scale-102 transition shadow-sm"
              />
              {authorProfile?.is_active && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
              )}

              {/* Profile hover card */}
              <AnimatePresence>
                {showProfileCard && authorProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 bottom-12 z-50 w-64 p-4 border bg-neutral-50 dark:bg-zinc-900 border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl space-y-3 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <img
                        src={authorProfile.avatar_url}
                        alt={authorProfile.full_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-orange-500/20"
                      />
                      {currentUser && currentUser.id !== authorProfile.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollow(authorProfile.id);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-white bg-linear-to-r from-red-500 to-orange-500 rounded-full"
                        >
                          Follow
                        </button>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                        {authorProfile.full_name}
                        {authorProfile.is_verified && (
                          <span className="text-[10px] text-blue-500 font-bold">
                            ✓
                          </span>
                        )}
                      </h5>
                      <p className="text-[9px] text-neutral-400 font-mono">
                        @{authorProfile.username}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 italic">
                        "
                        {authorProfile.bio ||
                          "Navigating connections without boundaries."}
                        "
                      </p>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[9px] font-mono text-neutral-400">
                      <span>
                        {authorProfile.followers_count || 0} Followers
                      </span>
                      <span>
                        {authorProfile.following_count || 0} Following
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <h4
                onClick={handleProfileClick}
                className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer hover:underline font-sans flex items-center gap-1"
              >
                {post.profile.full_name}
                {post.profile.is_verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-500/10 dark:bg-orange-400/10 text-orange-500 dark:text-orange-400 text-[8px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </h4>
              <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                <span>@{post.profile.username}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentUser && currentUser.id !== post.userId && (
              <button
                onClick={handleWhisper}
                className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-orange-500 hover:border-orange-500/40 transition active:scale-97"
              >
                Whisper
              </button>
            )}
            <button
              onClick={handleExpandToggle}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              {expanded ? (
                <ChevronUp size={16} className="text-neutral-400" />
              ) : (
                <ChevronDown size={16} className="text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className={`px-5 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans select-text wrap-break-word cursor-text relative ${
            shouldBlur
              ? "blur-md select-none hover:blur-sm contrast-125 saturate-50"
              : ""
          }`}
        >
          {shouldBlur && (
            <button
              type="button"
              onClick={() => setSensitiveRevealed(true)}
              className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] flex items-center justify-center w-full"
            >
              <span className="flex items-center gap-1.5 bg-neutral-950/90 text-white border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-medium">
                <Eye size={11} /> Sensitive — tap to reveal
              </span>
            </button>
          )}
          <p className={expanded ? "line-clamp-none" : "line-clamp-4"}>
            {post.content}
          </p>
        </div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-3 px-5 relative">
            {shouldBlur && (
              <button
                type="button"
                onClick={() => setSensitiveRevealed(true)}
                className="absolute inset-0 z-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center"
              >
                <span className="flex items-center gap-1.5 bg-neutral-950/90 text-white border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-medium">
                  <Eye size={11} /> Tap to reveal media
                </span>
              </button>
            )}
            <div
              onDoubleClick={handleDoubleClick}
              className={`grid ${
                post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
              } gap-2`}
            >
              {post.media_urls
                .slice(0, expanded ? undefined : 2)
                .map((url, i) => {
                  const isVideo =
                    /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) ||
                    url.includes("video");
                  return isVideo ? (
                    <video
                      key={i}
                      src={url}
                      controls
                      playsInline
                      className={`w-full rounded-xl max-h-80 bg-black ${
                        shouldBlur ? "blur-md" : ""
                      } ${post.media_urls!.length > 2 && !expanded && i === 1 ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      width={400}
                      height={320}
                      className={`w-full object-cover rounded-xl max-h-80 ${
                        shouldBlur ? "blur-md" : ""
                      } ${post.media_urls!.length > 2 && !expanded && i === 1 ? "opacity-50" : ""}`}
                      referrerPolicy="no-referrer"
                    />
                  );
                })}
              {post.media_urls.length > 2 && !expanded && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  +{post.media_urls.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* GIF */}
        {post.giphy_url && (
          <div
            onDoubleClick={handleDoubleClick}
            className={`mt-3 px-5 ${shouldBlur ? "blur-md" : ""}`}
          >
            <img
              src={post.giphy_url}
              alt=""
              className="max-w-full rounded-xl max-h-60"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between px-5 py-3 mt-2 text-neutral-500 dark:text-neutral-400 text-[11px] font-mono border-t border-neutral-100/60 dark:border-neutral-900/40">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Like */}
            <motion.button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 outline-none transition-colors ${liked ? "text-red-500" : "hover:text-red-500"}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
            >
              <motion.div
                animate={
                  liked ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}
                }
                transition={{ duration: 0.4 }}
              >
                <Heart
                  size={15}
                  className={liked ? "fill-current text-red-500" : ""}
                />
              </motion.div>
              <span>{currentLikes}</span>
            </motion.button>

            {/* Comments with expand toggle */}
            <motion.button
              onClick={handleExpandToggle}
              className={`flex items-center space-x-1.5 outline-none transition-colors ${expanded ? "text-orange-400" : "hover:text-orange-400"}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
            >
              <MessageCircle size={15} />
              <span>{currentComments}</span>
            </motion.button>

            {/* Repost */}
            <motion.button
              onClick={handleRepost}
              className={`flex items-center space-x-1.5 outline-none transition-colors sm:flex ${reposted ? "text-green-500" : "hover:text-green-500"}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
            >
              <motion.div
                animate={reposted ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Repeat2 size={16} />
              </motion.div>
              <span>{currentReposts}</span>
            </motion.button>

            {/* Boost */}
            {currentUser && (
              <motion.button
                onClick={handleBoost}
                disabled={post.boosted}
                className={`hidden sm:flex items-center space-x-1 outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none ${post.boosted ? "text-yellow-400" : "hover:text-yellow-400"}`}
                whileHover={post.boosted ? {} : { scale: 1.08 }}
                whileTap={post.boosted ? {} : { scale: 0.88 }}
              >
                <Zap
                  size={14}
                  className={
                    post.boosted
                      ? "fill-current text-yellow-400 animate-pulse"
                      : ""
                  }
                />
                <span>{post.boosted ? "Boosted" : "Boost"}</span>
              </motion.button>
            )}
          </div>

          {/* Secondary actions */}
          <div className="flex items-center gap-1">
            <motion.button
              onClick={handleBookmark}
              disabled={actionLoading}
              className={`p-1.5 rounded-full transition ${bookmarked ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark
                size={14}
                className={bookmarked ? "fill-current" : ""}
              />
            </motion.button>
            <motion.button
              onClick={handleFollowDiscussion}
              disabled={actionLoading}
              className={`p-1.5 rounded-full transition ${following ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={14} />
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 size={14} />
            </motion.button>

            {/* Report */}
            {currentUser && currentUser.id !== post.userId && (
              <div ref={reportRef} className="relative">
                <motion.button
                  onClick={() => setShowReportMenu((v) => !v)}
                  className={`p-1.5 rounded-full transition ${reportSubmitted ? "text-green-500" : "text-neutral-400 hover:text-red-500"}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {reportSubmitted ? <Check size={14} /> : <Flag size={14} />}
                </motion.button>
                <AnimatePresence>
                  {showReportMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.12 }}
                      className="absolute bottom-8 right-0 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-40"
                    >
                      <p className="px-3 py-2 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide border-b border-neutral-100 dark:border-neutral-800">
                        Report reason
                      </p>
                      {REPORT_REASONS.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => handleReport(reason)}
                          className="w-full text-left px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                        >
                          {reason}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded comments section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-neutral-100 dark:border-neutral-900"
          >
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-neutral-400">
                  Click again to open full discussion
                </span>
                <button
                  onClick={onOpenModal}
                  className="text-[10px] font-mono text-orange-500 hover:text-orange-600 transition"
                >
                  Open in focus mode →
                </button>
              </div>
              <div className="max-h-87.5 overflow-hidden rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/30 p-4 border border-neutral-100 dark:border-neutral-850">
                <SmartCommentSection
                  postId={post.id}
                  commentsCount={currentComments}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
