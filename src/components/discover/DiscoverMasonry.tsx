import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Image, Heart, Users } from "lucide-react";
import {
  AppCard,
  Avatar,
  Button,
  Badge,
  EmptyState,
  SectionHeader,
  TabNav,
} from "../ui";
import SwipeDiscovery from "./SwipeDiscovery";

export default function DiscoverMasonry() {
  const {
    posts,
    groups,
    profiles,
    currentUser,
    setView,
    joinGroup,
    sendConnectionRequest,
  } = useStore();
  const [activeTab, setActiveTab] = useState<"media" | "groups" | "souls">(
    "media",
  );

  const mediaPosts = posts.filter(
    (p) => (p.media_urls && p.media_urls.length > 0) || p.giphy_url,
  );

  const handleProfileClick = (id: string) => {
    localStorage.setItem("palrene_view_profile_id", id);
    setView("profile");
  };

  const tabs = [
    { id: "media", label: "Media", icon: <Image className="w-3.5 h-3.5" /> },
    { id: "groups", label: "Circles", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "souls", label: "Souls", icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              title="Discover"
              subtitle="Explore media, circles, and kindred spirits"
              icon={<Compass className="w-5 h-5 text-orange-500" />}
            />
            <TabNav
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as any)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
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
                <div className="col-span-full">
                  <EmptyState
                    title="No media posts yet"
                    description="When users share photos and GIFs, they'll appear here"
                    icon={<Image className="w-6 h-6" />}
                    action={
                      <Button
                        onClick={() => setView("home")}
                        icon={<Compass className="w-4 h-4" />}
                      >
                        Browse Feed
                      </Button>
                    }
                  />
                </div>
              ) : (
                mediaPosts.map((post, i) => {
                  const thumb = post.media_urls?.[0] || post.giphy_url;
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="break-inside-avoid"
                    >
                      <AppCard
                        variant="default"
                        padding="none"
                        hover
                        className="overflow-hidden group cursor-pointer"
                        onClick={() => handleProfileClick(post.userId)}
                      >
                        <img
                          src={thumb}
                          alt={`Post by ${post.profile.username}`}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-xs text-white/90 font-medium line-clamp-2 mb-2">
                            {post.content.slice(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between border-t border-white/10 pt-2">
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                src={post.profile.avatar_url || ""}
                                alt={post.profile.username || ""}
                                size="xs"
                              />
                              <span className="text-[10px] text-white/70 font-medium truncate max-w-20">
                                {post.profile.username}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/60 flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {post.likes_count}
                            </span>
                          </div>
                        </div>

                        {/* Category badge */}
                        {post.category && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" size="sm">
                              {post.category}
                            </Badge>
                          </div>
                        )}
                      </AppCard>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* GROUPS */}
          {activeTab === "groups" && (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {groups.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    title="No circles yet"
                    description="Community circles will appear here as they're created"
                    icon={<Users className="w-6 h-6" />}
                  />
                </div>
              ) : (
                groups.map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <AppCard
                      variant="default"
                      padding="none"
                      hover
                      className="overflow-hidden group cursor-pointer"
                      onClick={() => setView("groups")}
                    >
                      {/* Banner */}
                      <div className="h-24 overflow-hidden relative bg-linear-to-br from-orange-500/20 to-red-500/10">
                        {group.banner_url && (
                          <img
                            src={group.banner_url}
                            alt=""
                            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white dark:to-neutral-900" />
                      </div>

                      <div className="p-4 -mt-8 relative">
                        <div className="flex items-end gap-3 mb-3">
                          <Avatar
                            src={group.avatar_url}
                            alt={group.name}
                            size="lg"
                            className="border-4 border-white dark:border-neutral-900 shadow-lg"
                          />
                          <div className="flex-1 min-w-0 pb-1">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                              {group.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {group.members_count.toLocaleString()} members
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                          {group.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="info" size="sm">
                            #{group.category}
                          </Badge>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              joinGroup(group.id);
                            }}
                          >
                            Join Circle
                          </Button>
                        </div>
                      </div>
                    </AppCard>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* SOULS — Swipe Discovery */}
          {activeTab === "souls" && (
            <motion.div
              key="souls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {profiles.filter(
                (p) => p.id !== "poly-ai" && p.id !== currentUser?.id,
              ).length === 0 ? (
                <EmptyState
                  title="No souls discovered"
                  description="Other members will appear here once they join"
                  icon={<Heart className="w-6 h-6" />}
                />
              ) : (
                <SwipeDiscovery
                  profiles={profiles.filter(
                    (p) => p.id !== "poly-ai" && p.id !== currentUser?.id,
                  )}
                  currentUser={currentUser}
                  onViewProfile={handleProfileClick}
                  onConnect={(id) => sendConnectionRequest(id)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
