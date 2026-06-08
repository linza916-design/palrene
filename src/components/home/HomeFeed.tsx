import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Smile, Image as ImageIcon, Circle as HelpCircle, Loader, Zap, Eye, X, CirclePlay as PlayCircle, Hash, AtSign } from "lucide-react";
import PostCard from "../feed/PostCard";
import FeedFilters from "../feed/FeedFilters";
import GifModal from "../modals/GifModal";
import UnsplashModal from "../modals/UnsplashModal";
export default function HomeFeed() {
  const { currentUser, posts, createPost, searchQuery, searchFilter } =
    useStore();

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [giphyUrl, setGiphyUrl] = useState<string | undefined>(undefined);
  const [isSensitive, setIsSensitive] = useState(false);

  // Quiz creation state
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", ""]);

  // Modals state
  const [gifOpen, setGifOpen] = useState(false);
  const [unsplashOpen, setUnsplashOpen] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [includeBlurred, setIncludeBlurred] = useState(true);

  const handleFocus = () => {
    setExpanded(true);
  };

  const handleAddQuizOption = () => {
    if (quizOptions.length < 4) {
      setQuizOptions([...quizOptions, ""]);
    }
  };

  const handleRemovalQuizOption = (idx: number) => {
    setQuizOptions(quizOptions.filter((_, i) => i !== idx));
  };

  const handleQuizOptionChange = (idx: number, val: string) => {
    const updated = [...quizOptions];
    updated[idx] = val;
    setQuizOptions(updated);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0 && !giphyUrl) return;

    let quizPayload = undefined;
    if (
      showQuizBuilder &&
      quizQuestion.trim() &&
      quizOptions.filter((o) => o.trim()).length >= 2
    ) {
      quizPayload = {
        question: quizQuestion.trim(),
        options: quizOptions.filter((o) => o.trim()),
      };
    }

    createPost(
      content.trim(),
      mediaUrls.length > 0 ? mediaUrls : undefined,
      giphyUrl,
      undefined, // videoUrl (placeholder for uploads)
      isSensitive,
      quizPayload,
    );

    // Clean slate form parameters
    setContent("");
    setMediaUrls([]);
    setGiphyUrl(undefined);
    setIsSensitive(false);
    setShowQuizBuilder(false);
    setQuizQuestion("");
    setQuizOptions(["", ""]);
    setExpanded(false);
  };

  // Filter posts based on Category hash or search matching
  const filteredPosts = posts.filter((post) => {
    // 1. Search Query Filters
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentMatches = post.content.toLowerCase().includes(q);
      const userMatches =
        post.profile.full_name?.toLowerCase().includes(q) ||
        post.profile.username?.toLowerCase().includes(q);
      if (!contentMatches && !userMatches) return false;
    }

    // 2. Category Filters
    if (selectedCategory !== "all") {
      const tag = selectedCategory.toLowerCase();
      const contentMatchesTag =
        post.content.toLowerCase().includes(`#${tag}`) ||
        post.content.toLowerCase().includes(tag);
      if (!contentMatchesTag) return false;
    }

    // 3. Sensitive content filter toggle
    if (post.is_sensitive && !includeBlurred) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-1 max-w-xl mx-auto p-4 sm:p-5 space-y-5 h-[calc(100vh-70px)] overflow-y-auto pb-24 md:pb-6">
      {/* 1. COLLAPSIBLE POST CREATION SYSTEM CARD */}
      {currentUser && (
        <div className="p-4 bg-white/70 dark:bg-zinc-950/45 border border-neutral-150/40 dark:border-neutral-900 rounded-3xl shadow-sm transition">
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="flex items-start space-x-3">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Share a cinematic resonance, vintage jazz track, or whisper your thoughts..."
                  value={content}
                  onFocus={handleFocus}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-12 p-1.5 text-xs text-neutral-840 dark:text-white bg-transparent outline-none border-none placeholder-neutral-400 focus:ring-0 resize-none font-sans"
                />
              </div>
            </div>

            {/* EXPANDED EXTRA FORM OPTIONS FOR CREATION */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-900/60"
                >
                  {/* Media attached list */}
                  {mediaUrls.length > 0 && (
                    <div className="flex gap-2 p-1.5 overflow-x-auto bg-neutral-50 dark:bg-neutral-900/40 rounded-xl max-h-24">
                      {mediaUrls.map((url, i) => (
                        <div
                          key={i}
                          className="relative aspect-video w-24 rounded-lg overflow-hidden border border-neutral-200 shrink-0"
                        >
                          <img
                            src={url}
                            alt="Uploaded attachment"
                            className="object-cover w-full h-full"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setMediaUrls(mediaUrls.filter((u) => u !== url))
                            }
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/90"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* GIF Attached image preview */}
                  {giphyUrl && (
                    <div className="relative inline-block border border-neutral-200 dark:border-neutral-850 rounded-xl overflow-hidden aspect-video w-36 bg-neutral-950">
                      <img
                        src={giphyUrl}
                        alt="Feeling GIF"
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setGiphyUrl(undefined)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/95"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  {/* QUIZ BUILDER PANEL */}
                  {showQuizBuilder && (
                    <div className="p-4 bg-neutral-50 dark:bg-zinc-900/60 border border-neutral-200/50 dark:border-neutral-850 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          Interactive Inquiry builder
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQuizBuilder(false)}
                          className="text-neutral-400 hover:text-white p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Inquire: e.g. What is your favorite rain song?"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-neutral-200 bg-white placeholder-neutral-400 dark:bg-black dark:border-neutral-850 dark:text-white"
                      />

                      <div className="space-y-2">
                        {quizOptions.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={`Option ${oIdx + 1}`}
                              value={opt}
                              onChange={(e) =>
                                handleQuizOptionChange(oIdx, e.target.value)
                              }
                              className="flex-1 text-xs p-1.5 rounded-lg border border-neutral-200 bg-white dark:bg-black dark:border-neutral-850 dark:text-white"
                            />
                            {quizOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemovalQuizOption(oIdx)}
                                className="text-neutral-400 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {quizOptions.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddQuizOption}
                          className="text-[10px] font-mono text-orange-500 hover:underline"
                        >
                          + Add Inquiry Option
                        </button>
                      )}
                    </div>
                  )}

                  {/* CONTROL BUTTONS FOR MEDIA, GIFS, SENSITIVE TOGGLE */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      {/* Attached Multiple Unsplash Media */}
                      <button
                        type="button"
                        onClick={() => setUnsplashOpen(true)}
                        className="p-2 transition rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-450 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400"
                        title="Attach High-res Unsplash"
                      >
                        <ImageIcon size={16} />
                      </button>

                      {/* Attached Animated Giphy emotion */}
                      <button
                        type="button"
                        onClick={() => setGifOpen(true)}
                        className="p-2 transition rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-450 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400"
                        title="Pick GIPHY feeling"
                      >
                        <Smile size={16} />
                      </button>

                      {/* Trigger quiz generation builder */}
                      <button
                        type="button"
                        onClick={() => setShowQuizBuilder(true)}
                        className="p-2 transition rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-450 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400"
                        title="Attached Inquiry Poll"
                      >
                        <HelpCircle size={16} />
                      </button>

                      {/* Mark Sensitive container toggle button */}
                      <button
                        type="button"
                        onClick={() => setIsSensitive(!isSensitive)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono rounded-full border transition-all ${
                          isSensitive
                            ? "bg-red-500/10 text-red-500 border-red-500/25"
                            : "bg-neutral-50 dark:bg-neutral-900 text-neutral-450 border-neutral-200/50 dark:border-neutral-850 hover:text-red-500 hover:border-red-500/20"
                        }`}
                        title="Trigger sensitive daylight blurring system"
                      >
                        <Eye size={10} />
                        <span>Blurred</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        className="px-3.5 py-1 text-[10px] font-mono text-neutral-500 dark:text-neutral-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !content.trim() && mediaUrls.length === 0 && !giphyUrl
                        }
                        className="px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-650 hover:to-orange-550 transition shadow disabled:opacity-40"
                      >
                        Resonate Post
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      )}

      {/* 2. DYNAMIC ROW METRICS CATEGORY FILTER BAR */}
      <FeedFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showSensitive={includeBlurred}
        onToggleSensitive={() => setIncludeBlurred(!includeBlurred)}
      />

      {/* 3. INFINITE FEED LIST GRID */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-xs text-neutral-400 dark:text-neutral-600 font-mono">
            <p>No ripples matching this frequency.</p>
            <p className="mt-1 text-neutral-300 dark:text-neutral-700">Try a different filter or create a post.</p>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* DETACHED SELECTION POPUPS PANEL */}
      <GifModal
        isOpen={gifOpen}
        onClose={() => setGifOpen(false)}
        onSelect={(url) => setGiphyUrl(url)}
      />

      <UnsplashModal
        isOpen={unsplashOpen}
        onClose={() => setUnsplashOpen(false)}
        onSelectMultiple={(urls) => setMediaUrls([...mediaUrls, ...urls])}
      />
    </div>
  );
}
