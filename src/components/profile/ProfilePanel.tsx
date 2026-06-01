import React, { useState } from "react";
import { useStore } from "../../store";
import { motion } from "motion/react";
import { 
  Camera, 
  MapPin, 
  Settings, 
  Award, 
  Heart, 
  Users, 
  Eye,
  Plus,
  Compass,
  FileCheck
} from "lucide-react";
import VerificationModal from "../modals/VerificationModal";
import PostCard from "../feed/PostCard";

export default function ProfilePanel() {
  const { 
    currentUser, 
    profiles, 
    posts, 
    updateProfileSettings, 
    toggleFollow, 
    setView 
  } = useStore();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nameVal, setNameVal] = useState(currentUser?.full_name || "");
  const [bioVal, setBioVal] = useState(currentUser?.bio || "");
  const [locVal, setLocVal] = useState(currentUser?.location || "");

  // Find if we are viewing a target profile that is NOT ourselves
  const viewProfileId = localStorage.getItem("palrene_view_profile_id");
  const isSelf = !viewProfileId || viewProfileId === currentUser?.id;

  const targetProfile = isSelf 
    ? currentUser 
    : profiles.find(p => p.id === viewProfileId) || currentUser;

  const handleSave = () => {
    if (!currentUser) return;
    updateProfileSettings({
      full_name: nameVal,
      bio: bioVal,
      location: locVal
    });
    setEditMode(false);
  };

  const handleReturnSelf = () => {
    localStorage.removeItem("palrene_view_profile_id");
    // Trigger re-render by setting view or quick storage sync
    setView("profile");
  };

  if (!targetProfile) return null;

  // Filter posts created by this profile
  const authorPosts = posts.filter((p) => p.userId === targetProfile.id);

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe text-left">
      
      {/* Upper Banner Image and Avatar Overlay card */}
      <div className="relative">
        <div className="h-44 w-full bg-cover bg-center overflow-hidden bg-gradient-to-r from-red-850 via-rose-950 to-orange-950">
          <img 
            src={targetProfile.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"} 
            alt="Profile Banner backdrop" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="max-w-xl mx-auto px-5 relative -mt-14 flex items-end justify-between">
          <div className="relative group">
            <img
              src={targetProfile.avatar_url}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-950 shadow-md bg-stone-100"
            />
            {isSelf && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                <Camera size={18} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pb-2">
            {!isSelf ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReturnSelf}
                  className="px-4 py-2 text-xs font-mono rounded-xl bg-neutral-100 dark:bg-neutral-900 border dark:border-neutral-800 text-neutral-800 dark:text-neutral-300"
                >
                  My Profile
                </button>
                <button
                  onClick={() => toggleFollow(targetProfile.id)}
                  className="px-4 py-2 text-xs font-mono font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
                >
                  Follow
                </button>
              </div>
            ) : editMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4.5 py-2 text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 text-xs font-mono font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow"
                >
                  Save Settings
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {/* Trigger passport ID upload manual verification popup */}
                {!targetProfile.is_verified && (
                  <button
                    onClick={() => setVerifyOpen(true)}
                    className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-500 hover:text-white border border-orange-500/30 hover:bg-orange-500 rounded-xl transition duration-300 flex items-center gap-1 leading-none shadow"
                  >
                    <Award size={13} className="animate-pulse" />
                    <span>Verify Identity</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setNameVal(targetProfile.full_name);
                    setBioVal(targetProfile.bio || "");
                    setLocVal(targetProfile.location || "");
                    setEditMode(true);
                  }}
                  className="p-2.5 rounded-xl border border-neutral-250 dark:border-neutral-800 text-neutral-500 hover:text-orange-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                  title="Config details"
                >
                  <Settings size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Details section */}
      <div className="max-w-xl mx-auto px-5 pt-4 space-y-4">
        {editMode ? (
          <div className="p-4 bg-neutral-50 dark:bg-zinc-900/60 border border-neutral-150 rounded-2xl space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-400">Full Display Name</span>
              <input
                type="text"
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-400">Personal Bio</span>
              <textarea
                value={bioVal}
                onChange={(e) => setBioVal(e.target.value)}
                className="w-full h-16 text-xs p-2 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-400">City location</span>
              <input
                type="text"
                value={locVal}
                onChange={(e) => setLocVal(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-neutral-250 bg-white dark:bg-black dark:border-neutral-850 dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Display Name with Verified Seal Badge */}
            <h1 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 leading-none">
              <span>{targetProfile.full_name}</span>
              {targetProfile.is_verified && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 text-[8px] uppercase tracking-wider font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded">
                  <FileCheck size={8} /> Verified Seek
                </span>
              )}
            </h1>

            <p className="text-xs text-neutral-400 font-mono">@{targetProfile.username}</p>

            {targetProfile.location && (
              <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-serif">
                <MapPin size={11} className="text-neutral-400" />
                <span>{targetProfile.location}</span>
              </span>
            )}

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 italic pt-2 font-serif leading-relaxed whitespace-pre-wrap">
              "{targetProfile.bio || 'Navigating connections without boundaries.'}"
            </p>
          </div>
        )}

        {/* Followers / Views stats banner row */}
        <div className="flex border-y border-neutral-150/45 dark:border-neutral-900/60 py-3.5 justify-around text-center text-xs font-mono">
          <div>
            <span className="text-sm font-bold text-neutral-800 dark:text-white block">{targetProfile.followers_count || 0}</span>
            <span className="text-[10px] text-neutral-400 uppercase">Followers</span>
          </div>
          <div className="w-px bg-neutral-150 dark:bg-neutral-900/60" />
          <div>
            <span className="text-sm font-bold text-neutral-800 dark:text-white block">{targetProfile.following_count || 0}</span>
            <span className="text-[10px] text-neutral-400 uppercase">Following</span>
          </div>
          <div className="w-px bg-neutral-150 dark:bg-neutral-900/60" />
          <div>
            <span className="text-sm font-bold text-neutral-800 dark:text-white block">{targetProfile.views_count || 1}</span>
            <span className="text-[10px] text-neutral-400 uppercase">Energy Views</span>
          </div>
        </div>

        {/* Interests & Goals List panels */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Resonant Interests alignment</span>
          <div className="flex gap-2 flex-wrap">
            {(targetProfile.interests || ["music", "relationships", "science"]).map((int) => (
              <span key={int} className="px-2.5 py-1 text-[10px] font-mono bg-neutral-50 dark:bg-zinc-950 border border-neutral-150/50 dark:border-neutral-850 text-neutral-500 dark:text-neutral-440 rounded-xl">
                #{int}
              </span>
            ))}
          </div>
        </div>

        {/* Seeker Post History list */}
        <div className="pt-4 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-900 pb-2">Resonance History Timeline</h3>
          {authorPosts.length === 0 ? (
            <p className="text-xs text-neutral-400 font-mono text-center py-12">This seeker hasn't released ripples yet.</p>
          ) : (
            authorPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>

      </div>

      {/* VERIFICATION MODAL MANUAL UPLOADING DIALOGUE */}
      <VerificationModal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
      />

    </div>
  );
}
