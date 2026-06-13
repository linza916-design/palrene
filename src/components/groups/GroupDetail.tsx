import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Plus,
  Send,
  Image as ImageIcon,
  Upload,
  Sparkles,
  X,
  Settings,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { Group } from "../../types";
import { useStore } from "../../store";
import { AppCard, Avatar, Button, Badge, EmptyState, TabNav } from "../ui";
import { createPost, getGroupPosts } from "../../lib/posts";
import { uploadToCloudinary } from "../../utils/cloudinary";
import PostCard from "../feed/PostCard";

interface GroupDetailProps {
  group: Group;
  onBack: () => void;
}

const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  member: {
    label: "Member",
    icon: User,
    color: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
  },
};

export default function GroupDetail({ group, onBack }: GroupDetailProps) {
  const { currentUser, profiles, posts, joinGroup } = useStore();
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">(
    "feed",
  );
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const isOwner = group.created_by === currentUser?.id;
  const localPosts = posts.filter((p) => p.group_id === group.id);
  const allGroupPosts = [
    ...groupPosts,
    ...localPosts.filter((lp) => !groupPosts.find((gp) => gp.id === lp.id)),
  ];

  useEffect(() => {
    setLoading(true);
    getGroupPosts(group.id).then((data) => {
      setGroupPosts(data);
      setLoading(false);
    });
  }, [group.id]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentUser ||
      (!postContent.trim() && mediaUrls.length === 0) ||
      posting
    )
      return;
    setPosting(true);
    try {
      await createPost(currentUser.id, postContent.trim(), {
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        group_id: group.id,
        category: group.category,
      });
      useStore
        .getState()
        .createPost(
          postContent.trim(),
          mediaUrls.length > 0 ? mediaUrls : undefined,
        );
      const updated = useStore
        .getState()
        .posts.find((p) => p.content === postContent.trim() && !p.group_id);
      if (updated) {
        useStore.setState((s) => ({
          posts: s.posts.map((p) =>
            p.id === updated.id ? { ...p, group_id: group.id } : p,
          ),
        }));
      }
      setPostContent("");
      setMediaUrls([]);
    } catch (err) {
      console.error("Group post error:", err);
    }
    setPosting(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingMedia(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setMediaUrls((prev) => [...prev, ...urls].slice(0, 4));
    } catch {}
    setUploadingMedia(false);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const memberProfiles = profiles
    .filter(
      (p) =>
        p.id !== "poly-ai" &&
        (p.id === group.created_by || p.interests?.includes(group.category)),
    )
    .slice(0, 20);

  const tabs = [
    { id: "feed", label: "Feed", icon: <Sparkles className="w-3.5 h-3.5" /> },
    {
      id: "members",
      label: "Members",
      icon: <Users className="w-3.5 h-3.5" />,
    },
    { id: "about", label: "About", icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      {/* Banner */}
      <div className="relative h-48 sm:h-60 overflow-hidden bg-linear-to-br from-orange-500/20 to-red-500/10">
        {group.banner_url && (
          <img
            src={group.banner_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/80 via-transparent to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Group header */}
        <div className="flex items-end gap-4 -mt-12 mb-6 relative">
          <Avatar
            src={group.avatar_url}
            alt={group.name}
            size="xl"
            className="border-4 border-white dark:border-neutral-950 shadow-xl"
          />
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-min-h-15utral-900 dark:text-white">
                {group.name}
              </h1>
              {group.is_private ? (
                <Badge variant="secondary" size="sm">
                  <Lock className="w-3 h-3 mr-0.5" />
                  Private
                </Badge>
              ) : (
                <Badge variant="info" size="sm">
                  <Globe className="w-3 h-3 mr-0.5" />
                  Public
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members_count.toLocaleString()} members
              </span>
              <Badge variant="secondary" size="sm">
                #{group.category}
              </Badge>
            </div>
          </div>
          {!isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => joinGroup(group.id)}
              icon={<Plus className="w-4 h-4" />}
            >
              Join
            </Button>
          )}
          {isOwner && (
            <Badge
              variant="warning"
              size="md"
              icon={<Crown className="w-3 h-3" />}
            >
              Owner
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800 mb-6">
          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* FEED TAB */}
          {activeTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Post creation */}
              {currentUser && (
                <AppCard variant="glass" padding="md">
                  <form onSubmit={handlePost} className="space-y-3">
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={currentUser.avatar_url || ""}
                        alt={currentUser.full_name || ""}
                        size="sm"
                      />
                      <textarea
                        placeholder={`Share something with ${group.name}...`}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="flex-1 min-h-15 p-3 text-sm bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                    {mediaUrls.length > 0 && (
                      <div className="flex gap-2 flex-wrap ml-9">
                        {mediaUrls.map((url, i) => (
                          <div
                            key={i}
                            className="relative w-16 h-16 rounded-lg overflow-hidden group bg-black"
                          >
                            <img
                              src={url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setMediaUrls(
                                  mediaUrls.filter((_, j) => j !== i),
                                )
                              }
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between ml-9">
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
                        type="submit"
                        size="sm"
                        loading={posting}
                        icon={<Send className="w-4 h-4" />}
                      >
                        Post
                      </Button>
                    </div>
                  </form>
                </AppCard>
              )}

              {/* Posts */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <AppCard key={i} variant="default" padding="md">
                      <div className="animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                      </div>
                    </AppCard>
                  ))}
                </div>
              ) : allGroupPosts.length === 0 ? (
                <EmptyState
                  title="No posts yet"
                  description="Be the first to share something in this circle"
                  icon={<Sparkles className="w-6 h-6" />}
                />
              ) : (
                allGroupPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </motion.div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-xs text-neutral-500 mb-2">
                {group.members_count} members
              </p>
              {memberProfiles.length === 0 ? (
                <EmptyState
                  title="No members yet"
                  description="Invite people to join this circle"
                  icon={<Users className="w-6 h-6" />}
                />
              ) : (
                memberProfiles.map((profile) => {
                  const role =
                    profile.id === group.created_by ? "owner" : "member";
                  const roleConfig = ROLE_CONFIG[role];
                  const RoleIcon = roleConfig.icon;
                  return (
                    <AppCard
                      key={profile.id}
                      variant="outlined"
                      padding="sm"
                      className="flex items-center gap-3"
                    >
                      <Avatar
                        src={profile.avatar_url || ""}
                        alt={profile.full_name || ""}
                        size="sm"
                        verified={profile.is_verified}
                        online={profile.is_active}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">
                          @{profile.username}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${roleConfig.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig.label}
                      </span>
                    </AppCard>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <AppCard variant="outlined" padding="md">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                  About this Circle
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {group.description}
                </p>
              </AppCard>

              <div className="grid grid-cols-2 gap-3">
                <AppCard variant="outlined" padding="md">
                  <p className="text-xs text-neutral-500 mb-1">Category</p>
                  <Badge variant="info" size="md">
                    #{group.category}
                  </Badge>
                </AppCard>
                <AppCard variant="outlined" padding="md">
                  <p className="text-xs text-neutral-500 mb-1">Privacy</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-white">
                    {group.is_private ? (
                      <>
                        <Lock className="w-4 h-4" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" /> Public
                      </>
                    )}
                  </div>
                </AppCard>
                <AppCard variant="outlined" padding="md">
                  <p className="text-xs text-neutral-500 mb-1">Members</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {group.members_count.toLocaleString()}
                  </p>
                </AppCard>
                <AppCard variant="outlined" padding="md">
                  <p className="text-xs text-neutral-500 mb-1">Posts</p>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {group.posts_count.toLocaleString()}
                  </p>
                </AppCard>
              </div>

              <AppCard variant="outlined" padding="md">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                  Circle Rules
                </h3>
                <ol className="space-y-2">
                  {[
                    "Be respectful and kind to all members",
                    "No spam, self-promotion, or advertising",
                    "Stay on topic and contribute meaningfully",
                    "Report content that violates guidelines",
                  ].map((rule, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </AppCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
