import React, { useState, useRef } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  MapPin,
  Settings,
  Award,
  Heart,
  Users,
  Eye,
  MessageSquare,
  ArrowLeft,
  Crown,
  Loader as Loader2,
  MoveHorizontal as MoreHorizontal,
  Flag,
  ShieldBan,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AppCard,
  Avatar,
  Button,
  Input,
  Badge,
  EmptyState,
  SectionHeader,
  Skeleton,
} from "../ui";
import VerificationModal from "../modals/VerificationModal";
import PostCard from "../feed/PostCard";
import ConnectionButton from "../connections/ConnectionButton";
import ProfileAuditModal from "./ProfileAuditModal";
import { RelationshipStatus } from "../../types";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { supabase } from "../../lib/supabase";

const RELATIONSHIP_CONFIG: Record<
  RelationshipStatus,
  { color: string; icon: string }
> = {
  Single: { color: "text-blue-400 bg-blue-500/10", icon: "🌱" },
  Dating: { color: "text-rose-400 bg-rose-500/10", icon: "💞" },
  Married: { color: "text-amber-400 bg-amber-500/10", icon: "💍" },
  Complicated: { color: "text-orange-400 bg-orange-500/10", icon: "🌀" },
  "Open Relationship": {
    color: "text-purple-400 bg-purple-500/10",
    icon: "🔓",
  },
  Searching: { color: "text-emerald-400 bg-emerald-500/10", icon: "🔍" },
  Private: { color: "text-neutral-400 bg-neutral-500/10", icon: "🔒" },
};

const STATUSES: RelationshipStatus[] = [
  "Single",
  "Dating",
  "Married",
  "Complicated",
  "Open Relationship",
  "Searching",
  "Private",
];

const TIERS: Record<string, { label: string; color: string }> = {
  Pro: {
    label: "Pro",
    color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  },
  Starter: {
    label: "Starter",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
  Free: { label: "", color: "" },
};

export default function ProfilePanel() {
  const {
    currentUser,
    profiles,
    posts,
    connections,
    updateProfileSettings,
    updateRelationshipStatus,
    setView,
    startConversation,
    blockUser,
  } = useStore();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameVal, setNameVal] = useState(currentUser?.full_name || "");
  const [bioVal, setBioVal] = useState(currentUser?.bio || "");
  const [locVal, setLocVal] = useState(currentUser?.location || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      updateProfileSettings({ avatar_url: url });
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadToCloudinary(file);
      updateProfileSettings({ banner_url: url });
    } catch (err) {
      console.error("Banner upload failed:", err);
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [reportUserDone, setReportUserDone] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const viewProfileId = localStorage.getItem("palrene_view_profile_id");
  const isSelf = !viewProfileId || viewProfileId === currentUser?.id;
  const targetProfile = isSelf
    ? currentUser
    : profiles.find((p) => p.id === viewProfileId) || currentUser;

  const handleReportUser = async () => {
    if (!currentUser || !targetProfile) return;
    setShowMoreMenu(false);
    try {
      await supabase.from("reports").insert({
        reporter_id: currentUser.id,
        reported_user_id: targetProfile.id,
        reason: "User report",
        status: "pending",
      });
      setReportUserDone(true);
      setTimeout(() => setReportUserDone(false), 3000);
    } catch (err) {
      console.error("Report user failed:", err);
    }
  };

  const handleBlockUser = () => {
    if (!targetProfile) return;
    blockUser(targetProfile.id);
    setShowMoreMenu(false);
  };

  const handleSave = () => {
    if (!currentUser) return;
    updateProfileSettings({
      full_name: nameVal,
      bio: bioVal,
      location: locVal,
    });
    setEditMode(false);
  };

  const handleMessage = async () => {
    if (!targetProfile) return;
    await startConversation(targetProfile.id);
  };

  if (!targetProfile) return null;

  const completenessItems = [
    { label: "Profile photo", done: !!targetProfile.avatar_url },
    { label: "Banner image", done: !!targetProfile.banner_url },
    { label: "Bio", done: !!targetProfile.bio?.trim() },
    { label: "Location", done: !!targetProfile.location?.trim() },
    { label: "Interests", done: !!targetProfile.interests?.length },
    { label: "Verification", done: !!targetProfile.is_verified },
  ];
  const completenessScore = Math.round(
    (completenessItems.filter((i) => i.done).length /
      completenessItems.length) *
      100,
  );

  const authorPosts = posts.filter((p) => p.userId === targetProfile.id);
  const connectionStatus =
    !isSelf && currentUser
      ? (() => {
          const conn = connections.find(
            (c) =>
              (c.requester_id === currentUser.id &&
                c.recipient_id === targetProfile.id) ||
              (c.requester_id === targetProfile.id &&
                c.recipient_id === currentUser.id),
          );
          if (!conn) return "none";
          if (conn.status === "accepted") return "connected";
          if (conn.status === "pending")
            return conn.requester_id === currentUser.id
              ? "pending_sent"
              : "pending_received";
          return conn.status;
        })()
      : null;

  const canMessage =
    isSelf ||
    connectionStatus === "connected" ||
    targetProfile.id === "poly-ai";
  const rsStatus = targetProfile.relationship_status || "Private";
  const rsConfig = RELATIONSHIP_CONFIG[rsStatus];
  const tierConfig = TIERS[targetProfile.subscription_tier || "Free"];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerUpload}
      />

      {/* Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden group/banner">
        <img
          src={
            targetProfile.banner_url ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
          }
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-transparent to-transparent" />
        {isSelf && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all opacity-0 group-hover/banner:opacity-100"
          >
            {uploadingBanner ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            {uploadingBanner ? "Uploading..." : "Change Banner"}
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-16 relative">
        {/* Avatar Row */}
        <div className="flex items-end gap-4 mb-6">
          <div className="relative group">
            <Avatar
              src={targetProfile.avatar_url || ""}
              alt={targetProfile.full_name || "User"}
              size="xl"
              verified={targetProfile.is_verified}
              online={targetProfile.is_active}
            />
            {isSelf && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 pb-2">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isSelf ? (
                <>
                  {canMessage && (
                    <Button
                      onClick={handleMessage}
                      variant="secondary"
                      size="sm"
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      Message
                    </Button>
                  )}
                  <ConnectionButton profileId={targetProfile.id} size="sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditOpen(true)}
                    icon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Audit
                  </Button>
                  {/* More options: report + block */}
                  <div ref={moreMenuRef} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMoreMenu((v) => !v)}
                      icon={
                        reportUserDone ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <MoreHorizontal className="w-4 h-4" />
                        )
                      }
                    />
                    <AnimatePresence>
                      {showMoreMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.12 }}
                          className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-37.5"
                        >
                          <button
                            onClick={handleReportUser}
                            className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" /> Report user
                          </button>
                          <button
                            onClick={handleBlockUser}
                            className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                          >
                            <ShieldBan className="w-3.5 h-3.5" /> Block user
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : editMode ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {!targetProfile.is_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerifyOpen(true)}
                      icon={<Award className="w-4 h-4" />}
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setNameVal(targetProfile.full_name || "");
                      setBioVal(targetProfile.bio || "");
                      setLocVal(targetProfile.location || "");
                      setEditMode(true);
                    }}
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <AppCard variant="glass" padding="lg" className="mb-6">
          {editMode ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Input
                label="Display Name"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Bio
                </label>
                <textarea
                  value={bioVal}
                  onChange={(e) => setBioVal(e.target.value)}
                  className="w-full h-20 p-3 text-sm rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <Input
                label="Location"
                value={locVal}
                onChange={(e) => setLocVal(e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
              />
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Relationship Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateRelationshipStatus(s)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        rsStatus === s
                          ? RELATIONSHIP_CONFIG[s].color + " font-semibold"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      {RELATIONSHIP_CONFIG[s].icon} {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Name & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {targetProfile.full_name}
                </h1>
                {targetProfile.is_verified && (
                  <Badge variant="info" size="sm">
                    <Award className="w-3 h-3" /> Verified
                  </Badge>
                )}
                {tierConfig.label && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tierConfig.color}`}
                  >
                    {tierConfig.label}
                  </span>
                )}
              </div>

              {/* Username */}
              <p className="text-sm text-neutral-500 font-mono">
                @{targetProfile.username}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 text-xs font-medium rounded-full ${rsConfig.color}`}
                >
                  {rsConfig.icon} {rsStatus}
                </span>
                {targetProfile.location && (
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {targetProfile.location}
                  </span>
                )}
                {isSelf && (targetProfile.token_balance || 0) > 0 && (
                  <Badge variant="warning" size="sm">
                    <Zap className="w-3 h-3" />
                    {targetProfile.token_balance?.toLocaleString()} tokens
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {targetProfile.bio && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic border-l-2 border-orange-500/30 pl-4">
                  "{targetProfile.bio}"
                </p>
              )}

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {(targetProfile.interests || []).map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </AppCard>

        {/* Profile Completeness — only for own profile */}
        {isSelf && completenessScore < 100 && (
          <AppCard variant="outlined" padding="sm" className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Profile Completeness
              </p>
              <span className="text-xs font-bold text-orange-500">
                {completenessScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completenessScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-red-500 to-orange-500 rounded-full"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {completenessItems
                .filter((i) => !i.done)
                .map((item) => (
                  <span
                    key={item.label}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  >
                    + {item.label}
                  </span>
                ))}
            </div>
          </AppCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Followers",
              value: targetProfile.followers_count || 0,
              icon: <Users className="w-4 h-4" />,
            },
            {
              label: "Following",
              value: targetProfile.following_count || 0,
              icon: <Heart className="w-4 h-4" />,
            },
            {
              label: "Views",
              value: targetProfile.views_count || 0,
              icon: <Eye className="w-4 h-4" />,
            },
          ].map(({ label, value, icon }) => (
            <AppCard
              key={label}
              variant="outlined"
              padding="md"
              className="text-center"
            >
              <p className="text-xl font-bold text-neutral-900 dark:text-white">
                {value.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1 mt-1">
                {icon}
                {label}
              </p>
            </AppCard>
          ))}
        </div>

        {/* Recognition Goals */}
        {(targetProfile.recognition_goals || []).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Looking For
            </h3>
            <div className="flex flex-wrap gap-2">
              {(targetProfile.recognition_goals || []).map((goal) => (
                <Badge key={goal} variant="primary" size="md">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Posts Timeline */}
        <SectionHeader
          title="Timeline"
          subtitle={`${authorPosts.length} posts`}
          className="mb-4"
        />
        <div className="space-y-4">
          {authorPosts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="When this user shares something, it will appear here"
            />
          ) : (
            authorPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>

      <VerificationModal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
      />

      <AnimatePresence>
        {auditOpen && !isSelf && currentUser && targetProfile && (
          <ProfileAuditModal
            target={targetProfile}
            currentUser={currentUser}
            onClose={() => setAuditOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
