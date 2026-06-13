import React, { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Image as ImageIcon,
  Upload,
  Loader as Loader2,
  Zap,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import { AppCard, Avatar, Button, EmptyState, Skeleton } from "../ui";
import ExpandablePostCard from "../feed/ExpandablePostCard";
import PostModal from "../feed/PostModal";
import GifModal from "../modals/GifModal";
import UnsplashModal from "../modals/UnsplashModal";
import { SponsoredPost, RewardModal } from "../rewards";
import { createPost } from "../../lib/posts";
import {
  getUserTokens,
  updateDailyStreak,
  type UserTokens,
} from "../../lib/tokens";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function HomeFeed() {
  const { currentUser, posts, searchQuery } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [giphyUrl, setGiphyUrl] = useState<string | undefined>();
  const [isSensitive, setIsSensitive] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [unsplashOpen, setUnsplashOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<UserTokens | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const [visibleCount, setVisibleCount] = useState(10);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingMedia(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      setMediaUrls((prev) => [...prev, ...urls].slice(0, 4));
    } catch (err) {
      console.error("Media upload failed:", err);
    } finally {
      setUploadingMedia(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "relationships", label: "Relationships" },
    { id: "music", label: "Music" },
    { id: "travel", label: "Travel" },
    { id: "science", label: "Science" },
  ];

  const filteredPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !post.content.toLowerCase().includes(q) &&
        !post.profile.full_name?.toLowerCase().includes(q) &&
        !post.profile.username?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (
      activeCategory !== "all" &&
      post.category?.toLowerCase() !== activeCategory
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!currentUser) return;
    getUserTokens(currentUser.id).then(setUserTokens);
    updateDailyStreak(currentUser.id).then(() => {
      getUserTokens(currentUser.id).then(setUserTokens);
    });
  }, [currentUser]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredPosts.length) {
          setVisibleCount((prev) => Math.min(prev + 5, filteredPosts.length));
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [visibleCount, filteredPosts.length]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentUser ||
      (!content.trim() && mediaUrls.length === 0 && !giphyUrl) ||
      posting
    )
      return;

    setPosting(true);
    try {
      await createPost(currentUser.id, content.trim(), {
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        giphy_url: giphyUrl,
        is_sensitive: isSensitive,
      });

      useStore
        .getState()
        .createPost(
          content.trim(),
          mediaUrls.length > 0 ? mediaUrls : undefined,
          giphyUrl,
          undefined,
          isSensitive,
        );
      setContent("");
      setMediaUrls([]);
      setGiphyUrl(undefined);
      setIsSensitive(false);
      setExpanded(false);
    } catch (err) {
      console.error("Post creation error:", err);
    }
    setPosting(false);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto p-4 sm:p-6 space-y-6 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      {/* Token Balance Header */}
      {currentUser && userTokens && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {userTokens.balance.toLocaleString()} tokens
              </p>
              {userTokens.current_streak > 1 && (
                <p className="text-xs text-orange-500 font-medium">
                  {userTokens.current_streak} day streak
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRewardModal(true)}
          >
            Earn More
          </Button>
        </motion.div>
      )}

      {/* Create Post Card */}
      {currentUser && (
        <AppCard variant="glass" padding="md">
          <form onSubmit={handlePublish} className="space-y-4">
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleDeviceUpload}
            />
            <div className="flex items-start gap-3">
              <Avatar
                src={currentUser.avatar_url || ""}
                alt={currentUser.full_name || "User"}
                size="md"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Share your thoughts, discover connections..."
                  value={content}
                  onFocus={() => setExpanded(true)}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-15 p-3 text-sm text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  aria-label="Post content"
                />
              </div>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4 border-t border-neutral-100 dark:border-neutral-800 pt-4"
                >
                  {/* Media Preview */}
                  {(mediaUrls.length > 0 || giphyUrl) && (
                    <div className="flex gap-2 flex-wrap">
                      {mediaUrls.map((url, i) => {
                        const isVideo =
                          /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) ||
                          url.includes("video");
                        return (
                          <div
                            key={i}
                            className="relative w-20 h-20 rounded-xl overflow-hidden group bg-black"
                          >
                            {isVideo ? (
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <img
                                src={url}
                                alt="Attachment"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setMediaUrls(mediaUrls.filter((u) => u !== url))
                              }
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        );
                      })}
                      {giphyUrl && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden group">
                          <img
                            src={giphyUrl}
                            alt="GIF"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setGiphyUrl(undefined)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        loading={uploadingMedia}
                        onClick={() => mediaInputRef.current?.click()}
                        icon={<Upload className="w-4 h-4" />}
                      >
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUnsplashOpen(true)}
                        icon={<ImageIcon className="w-4 h-4" />}
                      >
                        Photo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setGifOpen(true)}
                        icon={<Sparkles className="w-4 h-4" />}
                      >
                        GIF
                      </Button>
                      <button
                        type="button"
                        onClick={() => setIsSensitive(!isSensitive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all ${
                          isSensitive
                            ? "bg-red-500/10 border-red-500/20 text-red-500"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-red-500/20 hover:text-red-500"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Sensitive
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          (!content.trim() &&
                            mediaUrls.length === 0 &&
                            !giphyUrl) ||
                          posting
                        }
                        loading={posting}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </AppCard>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Be the first to share something with the community"
            icon={<Plus className="w-6 h-6" />}
            action={
              <Button onClick={() => setExpanded(true)}>Create Post</Button>
            }
          />
        ) : (
          filteredPosts.slice(0, visibleCount).map((post, index) => (
            <React.Fragment key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExpandablePostCard
                  post={post}
                  onOpenModal={() => setModalPostId(post.id)}
                />
              </motion.div>
              {(index + 1) % 6 === 0 && index > 0 && <SponsoredPost />}
            </React.Fragment>
          ))
        )}

        {/* Load More */}
        {visibleCount < filteredPosts.length && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading more...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GifModal
        isOpen={gifOpen}
        onClose={() => setGifOpen(false)}
        onSelect={setGiphyUrl}
      />
      <UnsplashModal
        isOpen={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelectMultiple={(urls) => setMediaUrls([...mediaUrls, ...urls])}
      />
      <AnimatePresence>
        {modalPostId && (
          <PostModal
            postId={modalPostId}
            onClose={() => setModalPostId(null)}
          />
        )}
      </AnimatePresence>
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        onComplete={async () => {
          if (currentUser) {
            getUserTokens(currentUser.id).then(setUserTokens);
          }
        }}
      />
    </div>
  );
}
