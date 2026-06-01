import React, { useState } from "react";
import { useStore } from "../../store";
import { Send, Reply } from "lucide-react";
import { Comment } from "../../types";

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
}

export default function CommentSection({ postId, commentsCount }: CommentSectionProps) {
  const { currentUser, addComment, profiles } = useStore();
  const [commentText, setCommentText] = useState("");
  
  // Create beautiful local inline comments for the post to display
  // Using dynamic state so user sees comments update instantly!
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c-initial-1",
      post_id: postId,
      userId: "user-1",
      profile: {
        full_name: "Clara Moreau",
        username: "clara_aesthetic",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      },
      content: "This feels like a perfect reflection of why relationships need space to breathe. 🧡",
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      post_id: postId,
      userId: currentUser.id,
      profile: {
        full_name: currentUser.full_name,
        username: currentUser.username,
        avatar_url: currentUser.avatar_url
      },
      content: commentText.trim(),
      created_at: new Date().toISOString()
    };

    setComments([...comments, newComment]);
    addComment(postId, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-4">
      {/* List Existing comments */}
      <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
        {comments.map((comm) => (
          <div key={comm.id} className="flex items-start space-x-2.5 text-xs">
            <img
              src={comm.profile.avatar_url}
              alt={comm.profile.full_name}
              className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-850"
            />
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-900/60 p-2.5 rounded-2xl rounded-tl-none border border-neutral-150/40 dark:border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-sans">
                  {comm.profile.full_name}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                {comm.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Write Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center pt-2">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            className="w-7 h-7 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
          />
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Whisper a compassionate reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full py-2 pl-3 pr-10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-full focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/20 transition"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-1.5 top-1 p-1 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-45 disabled:pointer-events-none transition"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      ) : (
        <p className="text-[10px] text-neutral-400 font-mono text-center">
          Join the resonance to comment.
        </p>
      )}
    </div>
  );
}
