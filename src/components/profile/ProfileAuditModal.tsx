import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShieldCheck,
  Star,
  Clock,
  Zap,
  Users,
  Eye,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
} from "lucide-react";
import { Profile } from "../../types";
import { spendTokens, getUserTokens } from "../../lib/tokens";
import { Button, Avatar, Badge } from "../ui";

interface ProfileAuditModalProps {
  target: Profile;
  currentUser: Profile;
  onClose: () => void;
}

function computeTrustScore(profile: Profile): number {
  let score = 0;
  if (profile.is_verified) score += 30;
  if (profile.avatar_url) score += 15;
  if (profile.bio?.trim()) score += 15;
  if (profile.banner_url) score += 10;
  if (profile.interests?.length) score += 10;
  if (profile.location?.trim()) score += 10;
  if (profile.is_active) score += 10;
  return Math.min(score, 100);
}

function getAccountAge(createdAt?: string): string {
  if (!createdAt) return "Unknown";
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86400000,
  );
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""}`;
}

export default function ProfileAuditModal({
  target,
  currentUser,
  onClose,
}: ProfileAuditModalProps) {
  const [step, setStep] = useState<"preview" | "loading" | "result" | "error">(
    "preview",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const AUDIT_COST = 15;
  const trustScore = computeTrustScore(target);
  const commonInterests = (currentUser.interests || []).filter((i) =>
    (target.interests || []).includes(i),
  );

  const completenessItems = [
    !!target.avatar_url,
    !!target.banner_url,
    !!target.bio?.trim(),
    !!target.location?.trim(),
    !!target.interests?.length,
    !!target.is_verified,
  ];
  const completeness = Math.round(
    (completenessItems.filter(Boolean).length / completenessItems.length) * 100,
  );

  const handleConfirm = async () => {
    setStep("loading");
    const result = await spendTokens(
      currentUser.id,
      AUDIT_COST,
      "profile_audit",
      `Profile audit for ${target.full_name}`,
    );
    if (result.success) {
      setStep("result");
    } else {
      setErrorMsg(result.error || "Insufficient tokens");
      setStep("error");
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getTrustLabel = (score: number) => {
    if (score >= 80) return "Highly Trustworthy";
    if (score >= 60) return "Trustworthy";
    if (score >= 40) return "Building Trust";
    return "New / Unverified";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Profile Audit
              </h3>
              <p className="text-[10px] text-neutral-500">
                Trust & compatibility insight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {step === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={target.avatar_url || ""}
                    alt={target.full_name || "User"}
                    size="md"
                    verified={target.is_verified}
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {target.full_name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      @{target.username}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                    You'll see:
                  </p>
                  {[
                    "Verification tier & badges",
                    "Trust score (0–100)",
                    "Profile completion",
                    "Account age & activity",
                    "Common interests with you",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    icon={<Zap className="w-4 h-4" />}
                  >
                    Audit for {AUDIT_COST} PAL
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                <p className="text-sm text-neutral-500">Analyzing profile...</p>
              </motion.div>
            )}

            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Trust Score */}
                <div className="text-center py-3">
                  <p
                    className={`text-5xl font-black ${getTrustColor(trustScore)}`}
                  >
                    {trustScore}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500 mt-1">
                    {getTrustLabel(trustScore)}
                  </p>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trustScore}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${trustScore >= 80 ? "bg-emerald-500" : trustScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                        Verification
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {target.is_verified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                        Completion
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {completeness}%
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                        Member for
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {getAccountAge(target.created_at)}
                    </p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">
                        Activity
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {target.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                {/* Common Interests */}
                {commonInterests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 mb-2">
                      Common Interests
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {commonInterests.map((interest) => (
                        <Badge key={interest} variant="success" size="sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onClose}
                >
                  Close
                </Button>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 text-center space-y-3"
              >
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Audit Failed
                </p>
                <p className="text-xs text-neutral-500">{errorMsg}</p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
