import React, { useState } from "react";
import { useStore } from "../../store";
import { motion } from "motion/react";
import { Compass, Image, Smile, Heart, Users, ExternalLink } from "lucide-react";

export default function DiscoverMasonry() {
  const { posts, groups, profiles, setView, startConversation } = useStore();
  const [activeTab, setActiveTab] = useState<"media" | "groups" | "souls">("media");

  // Collect posts with images or gifs for visual masonry
  const mediaPosts = posts.filter(p => p.media_urls || p.giphy_url);

  const handleProfileClick = (id: string) => {
    setView("profile");
    localStorage.setItem("palrene_view_profile_id", id);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4 text-left">
        <div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Compass className="text-orange-500 animate-pulse" size={20} />
            <span>Pinterest Discovery Masonry</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Discover media resonance, creative circles, and companion souls without boundaries.</p>
        </div>

        {/* Filters Tabs on Discovery */}
        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
          {[
            { id: "media", label: "Media Stack", icon: Image },
            { id: "groups", label: "Circles", icon: Users },
            { id: "souls", label: "Companion Souls", icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            const chosen = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer outline-none ${
                  chosen
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. MEDIA MASONRY STACK VIEW */}
      {activeTab === "media" && (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {mediaPosts.map((post) => {
            const thumb = post.media_urls?.[0] || post.giphy_url;
            return (
              <motion.div
                key={post.id}
                whileHover={{ y: -4 }}
                className="break-inside-avoid relative rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-900 bg-neutral-100 dark:bg-zinc-950 group cursor-pointer shadow-xs"
                onClick={() => handleProfileClick(post.userId)}
              >
                <img
                  src={thumb}
                  alt="Discovery attached"
                  className="w-full h-auto object-cover max-h-80 transition duration-500 group-hover:scale-101"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating translucent feedback card on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                  <p className="text-[11px] text-white font-medium line-clamp-3 italic mb-2">
                    "{post.content}"
                  </p>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[9px] font-mono text-white/70">
                    <div className="flex items-center space-x-1">
                      <img src={post.profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate max-w-[80px]">{post.profile.username}</span>
                    </div>
                    <span>❤️ {post.likes_count}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 2. SUBGROUPS / CIRCLES VIEW */}
      {activeTab === "groups" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
          {groups.map((group) => (
            <div 
              key={group.id}
              className="p-5 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 space-y-4 relative overflow-hidden group hover:shadow-md transition"
            >
              <div className="absolute top-0 right-0 px-3 py-1 text-[8px] font-mono font-bold tracking-widest text-white uppercase bg-neutral-200 dark:bg-neutral-800 rounded-bl-xl">
                #{group.category}
              </div>
              
              <div className="flex items-center space-x-3.5">
                <img src={group.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover border border-neutral-250 dark:border-neutral-850" />
                <div>
                  <h3 className="text-sm font-semibold dark:text-white truncate max-w-[150px]">{group.name}</h3>
                  <p className="text-[9px] font-mono text-neutral-400">{group.members_count || 0} Companion members</p>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed font-serif italic">
                "{group.description}"
              </p>

              <button
                onClick={() => setView("groups")}
                className="w-full py-2 text-xs font-mono bg-neutral-100 hover:bg-orange-500 hover:text-white dark:bg-neutral-900 dark:hover:bg-orange-500 text-neutral-600 dark:text-neutral-450 rounded-xl transition duration-300"
              >
                Unfold Circle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. COMPANION SOULS GRID MATCH VIEW */}
      {activeTab === "souls" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
          {profiles.filter(p => p.id !== "poly-ai").map((profile) => (
            <div
              key={profile.id}
              className="p-5 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 space-y-4 transition hover:shadow-md relative overflow-hidden group"
            >
              {/* Profile card picture banner backdrop */}
              <div className="h-16 -mx-5 -mt-5 bg-gradient-to-br from-red-500/10 to-orange-500/10 pointer-events-none" />

              <div className="flex items-end space-x-3 -mt-8 relative">
                <img 
                  src={profile.avatar_url} 
                  alt="" 
                  className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-zinc-950" 
                />
                <div className="pb-1.5">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1">
                    {profile.full_name}
                    {profile.is_verified && <span className="text-[10px] text-orange-500">✔</span>}
                  </h4>
                  <p className="text-[9px] text-neutral-400 font-mono">@{profile.username}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed italic">
                "{profile.bio || 'Navigating connections without boundaries.'}"
              </p>

              <div className="flex gap-1 flex-wrap">
                {(profile.interests || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] font-mono px-2 py-0.5 bg-neutral-200/50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-450 border border-neutral-150/20 dark:border-neutral-850 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleProfileClick(profile.id)}
                  className="flex-1 py-2 text-xs font-mono border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-450 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
                >
                  Inspect Soul
                </button>
                <button
                  onClick={() => startConversation(profile.id)}
                  className="p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:scale-102 active:scale-98 transition text-center"
                  title="Whisper message"
                >
                  <Smile size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
