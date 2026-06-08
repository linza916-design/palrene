import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Image, Heart, Users } from "lucide-react";
import ConnectionButton from "../connections/ConnectionButton";
import { RelationshipStatus } from "../../types";

const rsColors: Record<RelationshipStatus, string> = {
  Single: "text-blue-400",
  Dating: "text-rose-400",
  Married: "text-amber-400",
  Complicated: "text-orange-400",
  "Open Relationship": "text-purple-400",
  Searching: "text-emerald-400",
  Private: "text-zinc-400"
};

const rsIcons: Record<RelationshipStatus, string> = {
  Single: "🌱", Dating: "💞", Married: "💍", Complicated: "🌀",
  "Open Relationship": "🔓", Searching: "🔍", Private: "🔒"
};

export default function DiscoverMasonry() {
  const { posts, groups, profiles, currentUser, setView, startConversation, getConnectionStatus, joinGroup } = useStore();
  const [activeTab, setActiveTab] = useState<"media" | "groups" | "souls">("media");

  const mediaPosts = posts.filter(p => (p.media_urls && p.media_urls.length > 0) || p.giphy_url);

  const handleProfileClick = (id: string) => {
    setView("profile");
  };

  const tabs = [
    { id: "media", label: "Media", icon: Image },
    { id: "groups", label: "Circles", icon: Users },
    { id: "souls", label: "Souls", icon: Heart }
  ];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-5 py-4 flex items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="text-orange-400" size={18} />
            Discover
          </h2>
          <p className="text-xs text-white/40 hidden sm:block">Media, groups, and people waiting to connect.</p>
        </div>

        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1" role="tablist" aria-label="Discover filters">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {/* MEDIA MASONRY */}
          {activeTab === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
            >
              {mediaPosts.length === 0 ? (
                <p className="text-white/30 text-center py-12 col-span-full text-sm">No media posts yet.</p>
              ) : mediaPosts.map((post, i) => {
                const thumb = post.media_urls?.[0] || post.giphy_url;
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="break-inside-avoid relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer shadow-lg"
                    onClick={() => handleProfileClick(post.userId)}
                  >
                    <img
                      src={thumb}
                      alt={`Post by ${post.profile.username}`}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
                      <p className="text-xs text-white/90 font-medium line-clamp-3 mb-2">
                        {post.content.slice(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between border-t border-white/10 pt-2">
                        <div className="flex items-center gap-1.5">
                          <img src={post.profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-[10px] text-white/70 font-medium truncate max-w-[70px]">{post.profile.username}</span>
                        </div>
                        <span className="text-[10px] text-white/60">❤ {post.likes_count}</span>
                      </div>
                    </div>

                    {/* Category badge */}
                    {post.category && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[9px] text-white/70 font-medium">
                        {post.category}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* GROUPS */}
          {activeTab === "groups" && (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left"
            >
              {groups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                  onClick={() => setView("groups")}
                >
                  {/* Banner */}
                  {group.banner_url && (
                    <div className="h-24 overflow-hidden">
                      <img src={group.banner_url} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900" aria-hidden="true" />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={group.avatar_url} alt={group.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{group.name}</h3>
                        <p className="text-[10px] text-white/40 font-mono">{group.members_count.toLocaleString()} members · #{group.category}</p>
                      </div>
                    </div>

                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{group.description}</p>

                    <button
                      onClick={(e) => { e.stopPropagation(); joinGroup(group.id); }}
                      className="w-full py-2 text-xs font-semibold rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500 hover:text-black transition-all">
                      Join Circle
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* SOULS */}
          {activeTab === "souls" && (
            <motion.div
              key="souls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left"
            >
              {profiles.filter(p => p.id !== "poly-ai" && p.id !== currentUser?.id).map((profile, i) => {
                const rs = (profile.relationship_status || 'Private') as RelationshipStatus;
                const rsColor = rsColors[rs];
                const rsIcon = rsIcons[rs];

                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Mini banner */}
                    <div className="h-20 overflow-hidden bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-zinc-900">
                      {profile.banner_url && (
                        <img src={profile.banner_url} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                      )}
                    </div>

                    <div className="px-4 pb-4 -mt-8">
                      <div className="flex items-end justify-between mb-3">
                        <div className="relative">
                          <motion.img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-14 h-14 rounded-2xl object-cover border-3 border-zinc-900 shadow-xl"
                            whileHover={{ scale: 1.05 }}
                          />
                          {profile.is_verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {profile.subscription_tier && profile.subscription_tier !== 'Free' && (
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${profile.subscription_tier === 'Pro' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {profile.subscription_tier}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-bold text-white leading-none">{profile.full_name}</h4>
                          <p className="text-[10px] text-white/40 font-mono">@{profile.username}</p>
                        </div>

                        {/* Relationship status */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${rsColor}`}>
                          <span aria-hidden="true">{rsIcon}</span>
                          {rs}
                        </span>

                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {profile.bio || "Navigating connections without boundaries."}
                        </p>

                        {/* Interest tags */}
                        <div className="flex gap-1.5 flex-wrap">
                          {(profile.interests || []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-white/40 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Location */}
                        {profile.location && (
                          <p className="text-[10px] text-white/30 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {profile.location}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleProfileClick(profile.id)}
                            className="flex-1 py-1.5 text-xs font-medium rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition"
                          >
                            View Profile
                          </button>
                          <ConnectionButton profileId={profile.id} size="sm" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
