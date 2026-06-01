import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Repeat2, Zap, HelpCircle, Check, Eye } from "lucide-react";
import { Post } from "../../types";
import CommentSection from "./CommentCard";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { 
    currentUser, 
    likePost, 
    repostPost, 
    boostPost, 
    voteInQuiz, 
    startConversation, 
    setView,
    toggleFollow,
    profiles,
    selectPostId
  } = useStore();

  const [showComments, setShowComments] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);

  // Sensitive content system: Always start blurred if marked sensitive, double click to reveal
  const shouldBlur = post.is_sensitive && !sensitiveRevealed;

  const handleDoubleClick = () => {
    if (post.is_sensitive) {
      setSensitiveRevealed(true);
    }
  };

  const handleProfileClick = () => {
    setView("profile");
    // If the post belongs to another user, we can simulate profile focus
    // by starting or viewing their details.
    if (post.userId !== currentUser?.id) {
      // Focus profile state if we track active profile index
      localStorage.setItem("palrene_view_profile_id", post.userId);
    }
  };

  const isQuizVoted = post.quiz?.voted_index !== undefined;
  const totalVotes = post.quiz?.votes?.reduce((a, b) => a + b, 0) || 0;
  
  // Calculate index of most voted option safely
  const maxVoteIndex = post.quiz?.votes ? post.quiz.votes.indexOf(Math.max(...post.quiz.votes)) : 0;

  // Find host profile to check follower counts or verification
  const authorProfile = profiles.find((p) => p.id === post.userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onDoubleClick={handleDoubleClick}
      onClick={() => selectPostId(post.id)}
      className={`p-5 mb-5 rounded-3xl border transition-all duration-300 relative overflow-hidden bg-white/70 dark:bg-zinc-950/40 border-neutral-100 dark:border-neutral-900/60 shadow-sm hover:shadow-md cursor-pointer ${
        post.boosted ? "ring-1 ring-orange-500/25 bg-gradient-to-br from-red-500/[0.02] to-orange-500/[0.02] dark:from-red-950/[0.04] dark:to-orange-950/[0.04]" : ""
      }`}
    >
      {/* Boosted badge overlay */}
      {post.boosted && (
        <div className="absolute top-0 right-0 px-3 py-1 text-[8px] font-mono font-bold tracking-widest text-white uppercase bg-gradient-to-r from-red-500 to-orange-500 rounded-bl-xl flex items-center gap-1">
          <Zap size={8} className="fill-current animate-bounce" />
          <span>Boosted resonance</span>
        </div>
      )}

      {/* Profile Info Row with Hover Profile Preview Grid */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-3">
          {/* Hover Avatar */}
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setShowProfileCard(true)}
            onMouseLeave={() => setShowProfileCard(false)}
            onClick={handleProfileClick}
          >
            <img
              src={post.profile.avatar_url}
              alt={post.profile.full_name}
              className="w-11 h-11 rounded-full object-cover border border-neutral-150 dark:border-neutral-850 hover:scale-102 transition shadow-sm"
            />
            {authorProfile?.is_active && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full" />
            )}

            {/* Float profile card preview */}
            <AnimatePresence>
              {showProfileCard && authorProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 bottom-12 z-50 w-64 p-4 border bg-neutral-50 dark:bg-zinc-900 border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl space-y-3 text-left leading-normal"
                >
                  <div className="flex items-start justify-between">
                    <img
                      src={authorProfile.avatar_url}
                      alt={authorProfile.full_name}
                      className="w-12 h-12 rounded-full object-cover border border-orange-500/20"
                    />
                    {currentUser && currentUser.id !== authorProfile.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow(authorProfile.id);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                      {authorProfile.full_name}
                      {authorProfile.is_verified && <span className="text-[10px] text-blue-500 font-bold">✔</span>}
                    </h5>
                    <p className="text-[9px] text-neutral-400 font-mono">@{authorProfile.username}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 italic">
                      "{authorProfile.bio || 'Navigating connections without boundaries.'}"
                    </p>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[9px] font-mono text-neutral-400">
                    <span>{authorProfile.followers_count || 0} Followers</span>
                    <span>{authorProfile.following_count || 0} Following</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details */}
          <div>
            <h4 
              onClick={handleProfileClick}
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer hover:underline font-sans flex items-center gap-1"
            >
              {post.profile.full_name}
              {post.profile.is_verified && (
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500/10 dark:bg-orange-400/10 text-orange-500 dark:text-orange-400 text-[8px] flex items-center justify-center font-bold">✔</span>
              )}
            </h4>
            <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
              <span>@{post.profile.username}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Message request button */}
        {currentUser && currentUser.id !== post.userId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              startConversation(post.userId);
            }}
            className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-orange-500 hover:border-orange-500/40 transition active:scale-97"
          >
            Whisper
          </button>
        )}
      </div>

      {/* Post Text Content - double click targets block reveal */}
      <div 
        onDoubleClick={handleDoubleClick}
        className={`text-xs text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed font-sans select-text break-words cursor-help relative ${
          shouldBlur ? "blur-md select-none hover:blur-sm contrast-125 saturate-50" : ""
        }`}
      >
        {shouldBlur && (
          <div className="absolute inset-0 z-30 bg-black/5 backdrop-blur-sm pointer-events-none flex items-center justify-center">
            <span className="flex items-center gap-1 bg-neutral-950/90 text-white border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono capitalize shadow shadow-orange-900/35">
              <Eye size={10} /> Double-Click key to reveal sensitive story
            </span>
          </div>
        )}
        <p>{post.content}</p>
      </div>

      {/* QUIZ SYSTEM: attached option selection */}
      {post.quiz && (
        <div className="mb-4 p-4 border border-neutral-200/40 dark:border-neutral-850 rounded-2xl bg-neutral-50/40 dark:bg-neutral-950/20 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
            <HelpCircle size={12} className="text-orange-400" />
            <span>Interactive Inquiry Circle</span>
          </div>
          <h5 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
            {post.quiz.question}
          </h5>

          {/* Voting options */}
          <div className="space-y-2">
            {post.quiz.options.map((opt, idx) => {
              const itemVotes = post.quiz?.votes[idx] || 0;
              const percent = totalVotes > 0 ? Math.round((itemVotes / totalVotes) * 100) : 0;
              const isSelected = post.quiz?.voted_index === idx;
              const isMostSelected = idx === maxVoteIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log(`[Quiz Click Capture] Button clicked for post: ${post.id}, choice: "${opt}" at index: ${idx}`);
                    voteInQuiz(post.id, idx);
                  }}
                  disabled={isQuizVoted}
                  className="w-full relative overflow-hidden p-3 rounded-xl border text-left text-xs outline-none transition duration-300 flex items-center justify-between border-neutral-200/50 dark:border-neutral-800 bg-neutral-100/50 dark:bg-black/30 hover:border-orange-500/30 font-sans cursor-pointer z-10"
                >
                  {/* Progress background bar */}
                  {isQuizVoted && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ${
                        isMostSelected 
                          ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/15 dark:to-orange-500/15" 
                          : "bg-neutral-200/20 dark:bg-neutral-800/15"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  )}

                  <div className="relative flex items-center space-x-2">
                    {isSelected && <Check size={12} className="text-orange-500" />}
                    <span className={`font-medium ${isSelected ? "text-orange-500 font-semibold" : "text-neutral-700 dark:text-neutral-300"}`}>
                      {opt}
                    </span>
                  </div>

                  {isQuizVoted && (
                    <span className="relative text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400">
                      {percent}% ({itemVotes})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Most Selected Preview state while scrolling */}
          {isQuizVoted && (
            <div className="flex justify-between text-[9px] font-mono text-neutral-400 dark:text-neutral-500 pt-1">
              <span>Total dynamic votes: {totalVotes}</span>
              <span className="text-orange-400">
                Most resonance: "{post.quiz.options[maxVoteIndex]}"
              </span>
            </div>
          )}
        </div>
      )}

      {/* Post Media Carousel / Attachment */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div 
          onDoubleClick={handleDoubleClick}
          className={`grid grid-cols-1 gap-2 mb-4 rounded-2xl overflow-hidden aspect-video relative max-h-72 border border-neutral-100 dark:border-neutral-900 group ${
            shouldBlur ? "blur-md select-none saturate-50 contrast-125" : ""
          }`}
        >
          {post.media_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt="Social Attachment"
              className="object-cover w-full h-full text-center hover:scale-101 transition duration-500"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      {/* GIPHY attached GIF illustration */}
      {post.giphy_url && (
        <div 
          onDoubleClick={handleDoubleClick}
          className={`rounded-2xl overflow-hidden mb-4 border border-neutral-150 dark:border-neutral-850 bg-black/20 text-center max-h-60 flex items-center justify-center ${
            shouldBlur ? "blur-md select-none saturate-50 contrast-125" : ""
          }`}
        >
          <img
            src={post.giphy_url}
            alt="Feeling attached GIF"
            className="object-contain max-h-56"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Actions Row controls */}
      <div className="flex items-center justify-between pt-1 text-neutral-500 dark:text-neutral-400 border-t border-neutral-100/40 dark:border-neutral-900/40 text-[11px] font-mono">
        
        {/* Heart = LIKES */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            likePost(post.id);
          }}
          className="flex items-center space-x-1.5 hover:text-red-500 group outline-none transition"
        >
          <Heart size={15} className="group-hover:scale-110 group-hover:fill-current transition" />
          <span>{post.likes_count}</span>
        </button>

        {/* Chat = COMMENTS */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          className={`flex items-center space-x-1.5 hover:text-orange-400 group outline-none transition ${
            showComments ? "text-orange-400" : ""
          }`}
        >
          <MessageCircle size={15} className="group-hover:scale-110 transition" />
          <span>{post.comments_count}</span>
        </button>

        {/* Rewind = REPOST */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            repostPost(post.id);
          }}
          className="flex items-center space-x-1.5 hover:text-green-500 group outline-none transition"
        >
          <Repeat2 size={16} className="group-hover:scale-110 transition" />
          <span>{post.reposts_count}</span>
        </button>

        {/* Thunder = BOOST */}
        {currentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              boostPost(post.id);
            }}
            disabled={post.boosted}
            className={`flex items-center space-x-1 hover:text-yellow-400 outline-none transition disabled:opacity-50 disabled:pointer-events-none ${
              post.boosted ? "text-yellow-400 font-bold" : ""
            }`}
            title="Perform Cosmic Post Boost"
          >
            <Zap size={14} className={post.boosted ? "fill-current animate-pulse text-yellow-400" : ""} />
            <span className="hidden sm:inline">Boost</span>
          </button>
        )}

      </div>

      {/* Comment Section Panel */}
      {showComments && (
        <CommentSection postId={post.id} commentsCount={post.comments_count} />
      )}

    </motion.div>
  );
}
