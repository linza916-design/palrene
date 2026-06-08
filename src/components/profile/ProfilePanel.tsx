import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Camera, MapPin, Settings, Award, Heart, Users, Eye, FileCheck } from "lucide-react";
import VerificationModal from "../modals/VerificationModal";
import PostCard from "../feed/PostCard";
import ConnectionButton from "../connections/ConnectionButton";
import { RelationshipStatus } from "../../types";

const RELATIONSHIP_STATUS_CONFIG: Record<RelationshipStatus, { color: string; icon: string }> = {
  Single: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "🌱" },
  Dating: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: "💞" },
  Married: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: "💍" },
  Complicated: { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: "🌀" },
  "Open Relationship": { color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: "🔓" },
  Searching: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: "🔍" },
  Private: { color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", icon: "🔒" }
};

const ALL_RELATIONSHIP_STATUSES: RelationshipStatus[] = ["Single", "Dating", "Married", "Complicated", "Open Relationship", "Searching", "Private"];

const subscriptionBadge: Record<string, { label: string; color: string }> = {
  Pro: { label: "Pro", color: "bg-gradient-to-r from-amber-500 to-orange-500 text-black" },
  Starter: { label: "Starter", color: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  Free: { label: "Free", color: "bg-white/5 text-white/40 border border-white/10" }
};

export default function ProfilePanel() {
  const {
    currentUser,
    profiles,
    posts,
    connections,
    updateProfileSettings,
    updateRelationshipStatus,
    toggleFollow,
    setView,
    startConversation
  } = useStore();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameVal, setNameVal] = useState(currentUser?.full_name || "");
  const [bioVal, setBioVal] = useState(currentUser?.bio || "");
  const [locVal, setLocVal] = useState(currentUser?.location || "");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const viewProfileId = localStorage.getItem("palrene_view_profile_id");
  const isSelf = !viewProfileId || viewProfileId === currentUser?.id;

  const targetProfile = isSelf
    ? currentUser
    : profiles.find((p) => p.id === viewProfileId) || currentUser;

  const handleSave = () => {
    if (!currentUser) return;
    updateProfileSettings({ full_name: nameVal, bio: bioVal, location: locVal });
    setEditMode(false);
  };

  const handleReturnSelf = () => {
    localStorage.removeItem("palrene_view_profile_id");
    setView("profile");
  };

  const handleMessage = async () => {
    if (!targetProfile) return;
    await startConversation(targetProfile.id);
  };

  if (!targetProfile) return null;

  const authorPosts = posts.filter((p) => p.userId === targetProfile.id);
  const connectionStatus = !isSelf && currentUser ? (() => {
    const conn = connections.find(c =>
      (c.requester_id === currentUser.id && c.recipient_id === targetProfile.id) ||
      (c.requester_id === targetProfile.id && c.recipient_id === currentUser.id)
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'connected';
    if (conn.status === 'pending') return conn.requester_id === currentUser.id ? 'pending_sent' : 'pending_received';
    return conn.status;
  })() : null;

  const canMessage = isSelf || connectionStatus === 'connected' || targetProfile.id === 'poly-ai';
  const rsStatus = targetProfile.relationship_status || 'Private';
  const rsConfig = RELATIONSHIP_STATUS_CONFIG[rsStatus];
  const tierConfig = subscriptionBadge[targetProfile.subscription_tier || 'Free'];

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe text-left">
      {/* Banner */}
      <div className="relative">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={targetProfile.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" aria-hidden="true" />
        </div>

        <div className="max-w-xl mx-auto px-5 relative -mt-14 flex items-end justify-between">
          <div className="relative group">
            <motion.img
              src={targetProfile.avatar_url}
              alt={`${targetProfile.full_name}'s avatar`}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-zinc-950 shadow-xl bg-zinc-800"
              whileHover={{ scale: 1.03 }}
            />
            {isSelf && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                <Camera size={18} className="text-white" />
              </div>
            )}
            {targetProfile.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-950" aria-label="Verified account">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pb-2">
            {!isSelf ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReturnSelf}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/80 transition"
                >
                  My Profile
                </button>

                {canMessage && (
                  <motion.button
                    onClick={handleMessage}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition flex items-center gap-1.5"
                    whileTap={{ scale: 0.96 }}
                    aria-label={`Message ${targetProfile.full_name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message
                  </motion.button>
                )}

                <ConnectionButton profileId={targetProfile.id} size="sm" />
              </div>
            ) : editMode ? (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="px-4 py-1.5 text-xs font-medium bg-white/5 text-white/50 rounded-xl">Cancel</button>
                <button onClick={handleSave} className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-orange-400 to-rose-500 rounded-xl shadow">Save</button>
              </div>
            ) : (
              <div className="flex gap-2">
                {!targetProfile.is_verified && (
                  <button
                    onClick={() => setVerifyOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-white border border-orange-500/30 hover:bg-orange-500 rounded-xl transition flex items-center gap-1"
                    aria-label="Verify your identity"
                  >
                    <Award size={12} className="animate-pulse" />
                    Verify
                  </button>
                )}
                <button
                  onClick={() => { setNameVal(targetProfile.full_name); setBioVal(targetProfile.bio || ""); setLocVal(targetProfile.location || ""); setEditMode(true); }}
                  className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/5 transition"
                  aria-label="Edit profile"
                >
                  <Settings size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-xl mx-auto px-5 pt-4 space-y-4">
        {editMode ? (
          <motion.div
            className="p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { label: "Display Name", val: nameVal, set: setNameVal, tag: "input" },
              { label: "Personal Bio", val: bioVal, set: setBioVal, tag: "textarea" },
              { label: "City / Location", val: locVal, set: setLocVal, tag: "input" }
            ].map(({ label, val, set, tag }) => (
              <div key={label} className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">{label}</span>
                {tag === "textarea" ? (
                  <textarea
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="w-full h-16 text-sm p-2.5 rounded-xl border border-white/10 bg-white/5 text-white resize-none focus:outline-none focus:border-orange-500/40"
                    aria-label={label}
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-orange-500/40"
                    aria-label={label}
                  />
                )}
              </div>
            ))}

            {/* Relationship status picker */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-white/40 uppercase">Relationship Status</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select relationship status">
                {ALL_RELATIONSHIP_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => updateRelationshipStatus(s)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      (targetProfile.relationship_status || 'Private') === s
                        ? RELATIONSHIP_STATUS_CONFIG[s].color + " font-semibold"
                        : "border-white/10 text-white/40 hover:border-white/20"
                    }`}
                    aria-pressed={(targetProfile.relationship_status || 'Private') === s}
                  >
                    {RELATIONSHIP_STATUS_CONFIG[s].icon} {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white leading-none">{targetProfile.full_name}</h1>
              {targetProfile.is_verified && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1">
                  <FileCheck size={9} /> Verified
                </span>
              )}
              {targetProfile.subscription_tier && targetProfile.subscription_tier !== 'Free' && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tierConfig.color}`}>
                  {tierConfig.label}
                </span>
              )}
            </div>

            <p className="text-sm text-white/40 font-mono">@{targetProfile.username}</p>

            {/* Relationship status badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${rsConfig.color}`}>
                <span aria-hidden="true">{rsConfig.icon}</span>
                {rsStatus}
              </span>

              {targetProfile.location && (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <MapPin size={11} />
                  {targetProfile.location}
                </span>
              )}

              {/* Token balance for own profile */}
              {isSelf && (targetProfile.token_balance || 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  ⬡ {(targetProfile.token_balance || 0).toLocaleString()} tokens
                </span>
              )}
            </div>

            {targetProfile.bio && (
              <p className="text-sm text-white/70 leading-relaxed italic">
                "{targetProfile.bio}"
              </p>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          {[
            { label: "Followers", value: targetProfile.followers_count || 0, icon: <Users size={13} /> },
            { label: "Following", value: targetProfile.following_count || 0, icon: <Heart size={13} /> },
            { label: "Views", value: targetProfile.views_count || 1, icon: <Eye size={13} /> }
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex flex-col items-center py-4 bg-zinc-950/50">
              <span className="text-base font-bold text-white">{value.toLocaleString()}</span>
              <span className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">{icon}{label}</span>
            </div>
          ))}
        </div>

        {/* Recognition Goals */}
        {(targetProfile.recognition_goals || []).length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Here for</span>
            <div className="flex flex-wrap gap-2">
              {(targetProfile.recognition_goals || []).map(goal => (
                <span key={goal} className="px-3 py-1 text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-full">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Interests</span>
          <div className="flex flex-wrap gap-2">
            {(targetProfile.interests || ["music", "relationships", "science"]).map(int => (
              <span key={int} className="px-2.5 py-1 text-[11px] font-mono bg-white/5 border border-white/10 text-white/50 rounded-xl">
                #{int}
              </span>
            ))}
          </div>
        </div>

        {/* Post History */}
        <div className="pt-4 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/30 border-b border-white/5 pb-2">
            Timeline
          </h3>
          {authorPosts.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-12">No posts yet.</p>
          ) : (
            authorPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>

      <VerificationModal isOpen={verifyOpen} onClose={() => setVerifyOpen(false)} />
    </div>
  );
}
