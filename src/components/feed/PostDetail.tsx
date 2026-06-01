import React, { useEffect, useState } from "react";
import { useStore } from "../../store";
import { 
  ChevronLeft, 
  Clock, 
  Sparkles, 
  Compass, 
  ExternalLink, 
  HelpCircle, 
  Check, 
  X,
  Target,
  Eye,
  MessageSquare,
  Bookmark,
  Share2,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import CommentSection from "./CommentCard";
import { motion, AnimatePresence } from "motion/react";

export default function PostDetail() {
  const { 
    selectedPostId, 
    posts, 
    selectPostId, 
    voteInQuiz, 
    currentUser, 
    likePost, 
    repostPost, 
    boostPost,
    ads
  } = useStore();

  const [activeSeconds, setActiveSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);

  // Focus Read Time tracking stopwatch simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedPostId]);

  // Find post
  const post = posts.find(p => p.id === selectedPostId);

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <AlertTriangle className="text-orange-500 animate-pulse" size={48} />
        <h2 className="text-lg font-bold">Resonance Lost in Space</h2>
        <p className="text-xs text-neutral-550 max-w-sm">
          We couldn't anchor the specific story you seek. It might have drifted or been deleted.
        </p>
        <button
          onClick={() => selectPostId(null)}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs rounded-full font-bold shadow hover:scale-102 transition"
        >
          Return to Harbor Feed
        </button>
      </div>
    );
  }

  // Double click event for sensitive content
  const shouldBlur = post.is_sensitive && !sensitiveRevealed;
  const handleDoubleClick = () => {
    if (post.is_sensitive) {
      setSensitiveRevealed(true);
    }
  };

  // 1. Quora tailored advertisement choosing based on post category/keywords
  const getTailoredAd = () => {
    const loweredContent = post.content.toLowerCase();
    
    if (loweredContent.includes("chopin") || loweredContent.includes("music") || loweredContent.includes("vinyl")) {
      return {
        title: "Acoustic Vintage Vinyl Store 📻",
        description: "Immerse yourself in authentic analog frequencies. Certified first-press classical & jazz restocked.",
        tag: "Music & Aesthetics Match",
        cta: "Browse Vinyl Catalog",
        link: "https://example.com/vintage-chopin-vinyls",
        img: "https://images.unsplash.com/photo-1539625319135-8d3c9f2b2d39?w=450&auto=format&fit=crop&q=80"
      };
    } else if (loweredContent.includes("cosmic") || loweredContent.includes("philosophy") || loweredContent.includes("universe")) {
      return {
        title: "Cosmic Resonance Retreats 🌌",
        description: "Align your internal vibration with deep space sound bath meditations. Starts July 2026.",
        tag: "Universal Philosophy Match",
        cta: "Claim Sound Bath Trial",
        link: "https://example.com/cosmic-resonance-hub",
        img: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=450&auto=format&fit=crop&q=80"
      };
    } else if (loweredContent.includes("connection") || loweredContent.includes("empathy") || loweredContent.includes("ai")) {
      return {
        title: "Poly Empathy Guidance Premium 🤖🧡",
        description: "Unlock emotional co-piloting for profound mindfulness. 30 days of seamless companion intelligence.",
        tag: "AI Companionship Match",
        cta: "Activate Safe Harbor Pro",
        link: "https://example.com/poly-empathy-coaching",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=450&auto=format&fit=crop&q=80"
      };
    } else {
      // Default lifestyle ad
      return {
        title: "Artisan Tea & Introspection Blends 🍵",
        description: "Organic hand-picked lavender, chamomile and roasted oolong. Quiet moments designed in Kyoto.",
        tag: "Mindful Living Match",
        cta: "Sip Artisan Blends",
        link: "https://example.com/artisan-living",
        img: "https://images.unsplash.com/photo-1514733670139-4d87a19bc177?w=450&auto=format&fit=crop&q=80"
      };
    }
  };

  const ad = getTailoredAd();

  // 2. Curated dynamic suggested related questions matching category
  const getSidebarSuggestions = () => {
    const otherPosts = posts.filter(p => p.id !== post.id);

    if (otherPosts.length > 0) {
      return otherPosts.map(p => {
        let text = p.content;
        if (p.quiz?.question) {
          text = p.quiz.question;
        } else if (text.length > 70) {
          text = text.slice(0, 67) + "...";
        }

        return {
          id: p.id,
          text: text,
          views: `${p.views_count || Math.floor(Math.random() * 200) + 45} views`,
          isReal: true
        };
      }).slice(0, 5);
    }

    return [
      { id: "s-7", text: "How to craft a secure psychological harbor in a hyperactive world?", views: "12k views", isReal: false },
      { id: "s-8", text: "The deep science of sharing silent spaces with loved ones", views: "6.8k views", isReal: false },
      { id: "s-9", text: "When is vulnerable storytelling considered a modern superpower?", views: "15k views", isReal: false }
    ];
  };

  const suggestions = getSidebarSuggestions();

  // Quora Quiz Interactive parameters
  const isQuizVoted = post.quiz?.voted_index !== undefined;
  const votedIndex = post.quiz?.voted_index;
  const correctOptionIndex = post.quiz?.correct_option_index;
  const totalVotes = post.quiz?.votes?.reduce((a, b) => a + b, 0) || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://palrene.harbor/post/${post.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto" id="post-detail-scroll-container">
      {/* Dynamic Simulated Browser URL Navigation Bar */}
      <div className="bg-neutral-50 dark:bg-zinc-900/90 border-b border-neutral-150/50 dark:border-zinc-850 px-4 py-2 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <button
          onClick={() => selectPostId(null)}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-neutral-300 transition flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-semibold font-mono hidden sm:inline">Feed</span>
        </button>

        {/* Address URL simulator */}
        <div className="flex-1 max-w-xl mx-auto py-1 px-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-between text-[11px] font-mono font-medium text-neutral-400 select-all shadow-inner relative">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-green-500 font-bold">🔒</span>
            <span className="text-neutral-500 dark:text-zinc-400 select-text truncate">
              https://palrene.harbor/post/{post.id}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="text-[9px] uppercase tracking-wider text-orange-500 hover:text-orange-600 font-bold font-mono transition pr-1"
          >
            {copiedLink ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Live stopwatch metric */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 dark:text-zinc-500">
          <Clock size={12} className="text-orange-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {Math.floor(activeSeconds / 60)}:{String(activeSeconds % 60).padStart(2, '0')}s
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Dynamic Responsive Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Central content column (takes 8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Extended Main Post container */}
            <div 
              onDoubleClick={handleDoubleClick}
              className="p-6 bg-white dark:bg-zinc-950/45 border border-neutral-150/40 dark:border-neutral-900 rounded-3xl space-y-5 shadow-sm"
            >
              {/* Author header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={post.profile.avatar_url}
                    alt={post.profile.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1 shadow-sm">
                      {post.profile.full_name}
                      {post.profile.is_verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-orange-500/10 text-orange-500 text-[8px] flex items-center justify-center font-bold">✔</span>
                      )}
                    </h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                      @{post.profile.username} • Opened in cosmic focus
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-1 bg-stone-100 dark:bg-zinc-900 font-mono text-[9px] rounded-full text-neutral-450 uppercase tracking-widest text-[8px]">
                    {post.category || "General"}
                  </span>
                </div>
              </div>

              {/* Central post story body */}
              <div className="relative text-stone-700 dark:text-zinc-200 font-serif leading-relaxed text-sm antialiased break-words select-text pt-2">
                {shouldBlur && (
                  <div className="absolute inset-0 z-30 bg-black/10 backdrop-blur-md flex items-center justify-center rounded-2xl pointer-events-none">
                    <span className="flex items-center gap-1 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-white">
                      <Eye size={12} /> Double-Click statement to clear blurry veil
                    </span>
                  </div>
                )}
                
                <p className={`${shouldBlur ? "blur-md select-none hover:blur-sm contrast-125 duration-300" : ""}`}>
                  {post.content}
                </p>
              </div>

              {/* Attachments - Media image */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className={`rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-950 aspect-video relative max-h-96 ${
                  shouldBlur ? "blur-md select-none" : ""
                }`}>
                  {post.media_urls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt="Cosmic focus attachments"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              {/* Giphy attached GIF illustration */}
              {post.giphy_url && (
                <div className={`rounded-xl overflow-hidden max-h-72 border border-neutral-100 dark:border-neutral-950 flex items-center justify-center ${
                  shouldBlur ? "blur-md select-none" : ""
                }`}>
                  <img
                    src={post.giphy_url}
                    alt="Simulated live visual GIF"
                    className="max-h-64 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Quora-style post engagement info bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 dark:text-neutral-500 py-2 border-y border-neutral-100/60 dark:border-neutral-900/60">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye size={12} className="text-neutral-400" />
                    <strong className="text-neutral-700 dark:text-zinc-300">{post.views_count || 15}</strong> views
                  </span>
                  <span>•</span>
                  <span>Created: {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-1 font-bold text-orange-500 uppercase tracking-widest text-[8px] animate-pulse">
                  <Target size={10} />
                  <span>Interactive Spaces Match</span>
                </div>
              </div>

              {/* Quora interactive Quiz Poll module */}
              {post.quiz && (
                <div className="p-5 bg-neutral-50/70 dark:bg-zinc-900/30 border border-neutral-200/50 dark:border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={15} className="text-orange-500 animate-pulse" />
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-orange-500">Interactive Quora Quiz</span>
                    </div>
                    {isQuizVoted && (
                      <span className="text-[9px] font-mono font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full uppercase">
                        Participated!
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-white leading-snug">
                    {post.quiz.question}
                  </h4>

                  {/* Multiple Choice interactive array */}
                  <div className="space-y-2.5">
                    {post.quiz.options.map((opt, idx) => {
                      const votesCount = post.quiz?.votes[idx] || 0;
                      const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                      
                      const selectedThis = votedIndex === idx;
                      const isCorrect = correctOptionIndex === idx;
                      
                      // Quora Style Feedback Color Highlights
                      let borderClass = "border-neutral-200 dark:border-zinc-800 hover:border-orange-500/40 bg-white/50 dark:bg-black/20";
                      let indicatorColor = "text-neutral-400";
                      
                      if (isQuizVoted) {
                        if (isCorrect) {
                          // Correct returns GREEN highlight
                          borderClass = "border-green-500/70 bg-green-500/[0.05] dark:bg-green-950/[0.12]";
                          indicatorColor = "text-green-500 font-bold";
                        } else if (selectedThis) {
                          // Wrong selected returns RED highlight
                          borderClass = "border-red-500/70 bg-red-500/[0.05] dark:bg-red-950/[0.12]";
                          indicatorColor = "text-red-500 font-bold";
                        } else {
                          // Unselected un-correct
                          borderClass = "border-neutral-200 dark:border-zinc-800 bg-neutral-50/20 dark:bg-black/10 opacity-70";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isQuizVoted}
                          onClick={() => voteInQuiz(post.id, idx)}
                          className={`w-full relative overflow-hidden p-3.5 rounded-xl border text-left text-xs outline-none transition duration-300 flex items-center justify-between font-sans ${borderClass} ${
                            !isQuizVoted ? "cursor-pointer" : ""
                          }`}
                        >
                          {/* Vote progress loading overlay */}
                          {isQuizVoted && (
                            <div 
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${
                                isCorrect 
                                  ? "bg-green-500/10 dark:bg-green-500/15" 
                                  : selectedThis 
                                    ? "bg-red-500/10 dark:bg-red-500/15" 
                                    : "bg-neutral-200/10 dark:bg-zinc-800/10"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          )}

                          <div className="relative flex items-center space-x-2.5 z-10">
                            {isQuizVoted && isCorrect && <Check size={14} className="text-green-500" />}
                            {isQuizVoted && selectedThis && !isCorrect && <X size={14} className="text-red-500" />}
                            <span className="font-medium">{opt}</span>
                          </div>

                          {isQuizVoted && (
                            <span className={`relative text-[10px] font-mono ${indicatorColor} z-10`}>
                              {percentage}% ({votesCount} votes)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quora Quizzes: Explanation text box & Lead Generation redirect funnel */}
                  <AnimatePresence>
                    {isQuizVoted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-orange-500/[0.03] dark:bg-zinc-900/60 border border-orange-500/20 rounded-xl space-y-3 mt-1.5"
                      >
                        <div className="flex items-center gap-1.5 text-orange-500">
                          <Lightbulb size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Creator explanation & context</span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-zinc-300 italic font-serif leading-relaxed pl-5 border-l-2 border-orange-500/40">
                          "{post.quiz.explanation || 'Constructed with dynamic stardust parameter guidance. True understanding builds deeper empathy.'}"
                        </p>

                        {/* Business lead generation funnel CTA */}
                        {post.quiz.lead_link && (
                          <div className="pt-2 flex justify-end">
                            <a
                              href={post.quiz.lead_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg text-white shadow-sm hover:shadow flex items-center gap-1 transition-transform hover:scale-102"
                            >
                              <span>Explore Specialized Guide</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Behind-the-scenes algorithm tracking disclosure inside post */}
                  <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400 border-t border-neutral-150/55 dark:border-zinc-800/80 pt-3">
                    <span>⚡ Clicking boosts matching weight in feed</span>
                    <span>🔒 Privacy: Dynamic votes are anonymous</span>
                  </div>
                </div>
              )}

              {/* Standard active action bar */}
              <div className="flex items-center gap-6 text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100/50 dark:border-zinc-850 text-xs font-mono">
                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center space-x-1.5 hover:text-red-500 transition group"
                >
                  <span className="font-bold">{post.likes_count} Likes</span>
                </button>
                <button
                  onClick={() => repostPost(post.id)}
                  className="flex items-center space-x-1.5 hover:text-green-500 transition"
                >
                  <span>{post.reposts_count} Reposts</span>
                </button>
                <button
                  onClick={() => boostPost(post.id)}
                  className={`flex items-center space-x-1.5 hover:text-yellow-400 transition ${post.boosted ? "text-yellow-400 font-bold" : ""}`}
                >
                  <span>{post.boosted ? "Boosted" : "Boost"}</span>
                </button>
              </div>

            </div>

            {/* Quora Style Complete Comments Section displayed right on the page */}
            <div className="bg-white dark:bg-zinc-950/45 p-6 border border-neutral-150/40 dark:border-neutral-900 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100/60 dark:border-neutral-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={15} className="text-orange-500" />
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-white">
                    Thread Comments ({post.comments_count})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Order by: Top Resonance</span>
              </div>

              {/* Mounted comments details section */}
              <CommentSection postId={post.id} commentsCount={post.comments_count} />
            </div>

          </div>

          {/* RIGHT SIDEBAR: Tailor-made Advertisements & Curated Recommendations (takes 4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Read stopwatch dynamic state card */}
            <div className="p-4 bg-orange-500/[0.02] dark:bg-zinc-950/20 border border-orange-500/20 rounded-2xl space-y-3 leading-normal">
              <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest block">Engagement Monitor</span>
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] text-neutral-450">Active Read stopwatch:</span>
                <span className="text-xs font-bold text-orange-400">{activeSeconds} seconds interest time</span>
              </div>
              <p className="text-[9.5px] italic text-neutral-400 font-sans leading-normal">
                Behind the scenes, the algorithm registers this focus duration to scale up this topic in your recommended dashboard.
              </p>
            </div>
            
            {/* 1. Tailor-made Topic targeted Quora Advertisements */}
            <div className="p-4 bg-white dark:bg-zinc-950/45 border border-neutral-150/45 dark:border-neutral-900 rounded-2xl space-y-3 relative overflow-hidden text-left leading-normal">
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-mono font-bold tracking-widest text-[#B92B27] dark:text-[#E04B45] uppercase border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                  Quora SPONSORED
                </span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-neutral-500">
                  {ad.tag}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden aspect-video relative max-h-36 border border-neutral-100 dark:border-neutral-950 bg-black/40">
                <img
                  src={ad.img}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {ad.title}
                </h4>
                <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                  {ad.description}
                </p>
              </div>

              <div className="pt-1 select-none">
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-2 bg-neutral-900 dark:bg-zinc-900 text-white border border-transparent dark:border-zinc-800 hover:border-orange-500/30 rounded-xl transition font-mono text-[9.5px] font-bold uppercase tracking-wider block"
                >
                  {ad.cta} &rarr;
                </a>
              </div>
            </div>

            {/* 2. Suggested More Questions sidebar threads */}
            <div className="p-4 bg-white dark:bg-zinc-950/45 border border-neutral-150/45 dark:border-neutral-900 rounded-2xl space-y-3 text-left leading-normal">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-orange-500">
                <Compass size={11} />
                <span>Related Inquiries</span>
              </div>

              <span className="text-[10px] text-neutral-450 block">Suggested threads from similar spaces:</span>

              <div className="divide-y divide-neutral-100/60 dark:divide-zinc-850 space-y-2.5">
                {suggestions.map((s) => (
                  <div key={s.id} className="pt-2.5 space-y-1 hover:opacity-95 transition">
                    <button
                      onClick={() => {
                        if (s.isReal) {
                          selectPostId(s.id);
                          setSensitiveRevealed(false);
                          setActiveSeconds(0);
                          setTimeout(() => {
                            document.getElementById("post-detail-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
                          }, 50);
                        } else {
                          console.log(`Related click loaded: ${s.text}`);
                          alert(`Loading related Space review: "${s.text}"`);
                        }
                      }}
                      className="text-left text-xs text-neutral-850 dark:text-zinc-200 hover:text-orange-500 font-semibold cursor-pointer block hover:underline"
                    >
                      {s.text}
                    </button>
                    <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                      <span>{s.views}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase text-[7px] tracking-wider font-bold">Trending space</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
