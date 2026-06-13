import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";
import {
  Heart,
  X,
  Eye,
  MapPin,
  Zap,
  ChevronRight,
  CircleCheck as CheckCircle2,
} from "lucide-react";
import { Profile, RelationshipStatus } from "../../types";
import { Avatar, Badge, Button } from "../ui";
import ConnectionButton from "../connections/ConnectionButton";

const rsColors: Record<RelationshipStatus, string> = {
  Single: "text-blue-400 bg-blue-500/10",
  Dating: "text-rose-400 bg-rose-500/10",
  Married: "text-amber-400 bg-amber-500/10",
  Complicated: "text-orange-400 bg-orange-500/10",
  "Open Relationship": "text-purple-400 bg-purple-500/10",
  Searching: "text-emerald-400 bg-emerald-500/10",
  Private: "text-neutral-400 bg-neutral-500/10",
};

function computeCompatibility(user: Profile | null, target: Profile): number {
  if (!user) return 50;
  let score = 0;
  const sharedInterests = (user.interests || []).filter((i) =>
    (target.interests || []).includes(i),
  );
  score += Math.min(sharedInterests.length * 10, 40);
  const sharedGoals = (user.recognition_goals || []).filter((g) =>
    (target.recognition_goals || []).includes(g),
  );
  score += Math.min(sharedGoals.length * 15, 30);
  if (target.is_verified) score += 10;
  if (target.is_active) score += 10;
  if (
    target.location &&
    user.location &&
    target.location.toLowerCase() === user.location.toLowerCase()
  )
    score += 10;
  return Math.max(Math.min(score, 99), 35);
}

function compatibilityColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-orange-400";
}

interface SwipeCardProps {
  profile: Profile;
  compatibility: number;
  sharedInterests: string[];
  isTop: boolean;
  stackOffset: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onViewProfile: () => void;
}

function SwipeCard({
  profile,
  compatibility,
  sharedInterests,
  isTop,
  stackOffset,
  onSwipeLeft,
  onSwipeRight,
  onViewProfile,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const connectOpacity = useTransform(x, [30, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, -30], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipeRight();
    } else if (info.offset.x < -100) {
      onSwipeLeft();
    }
  };

  const rs = (profile.relationship_status || "Private") as RelationshipStatus;

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - stackOffset * 0.04,
        y: stackOffset * 12,
        zIndex: 10 - stackOffset,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className="absolute inset-0 w-full cursor-grab active:cursor-grabbing select-none"
      whileHover={!isTop ? {} : { scale: 1.01 }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-black/10 dark:shadow-black/40 flex flex-col">
        {/* Banner / Image section */}
        <div className="relative h-56 overflow-hidden bg-linear-to-br from-orange-500/20 to-red-500/10 shrink-0">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/30 via-red-500/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          rotate-20
          {/* Swipe indicators */}
          {isTop && (
            <>
              <motion.div
                style={{ opacity: connectOpacity }}
                className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border-2 border-white/30 rotate-[-20deg]"
              >
                <Heart className="w-4 h-4 fill-current" /> CONNECT
              </motion.div>
              <motion.div
                style={{ opacity: skipOpacity }}
                className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border-2 border-white/30 rotate-20"
              >
                <X className="w-4 h-4" /> SKIP
              </motion.div>
            </>
          )}
          {/* Avatar */}
          <div className="absolute bottom-4 left-5">
            <Avatar
              src={profile.avatar_url || ""}
              alt={profile.full_name || "User"}
              size="xl"
              verified={profile.is_verified}
              online={profile.is_active}
              className="border-4 border-white shadow-xl"
            />
          </div>
          {/* Compatibility badge */}
          <div className="absolute bottom-4 right-5">
            <div className="bg-black/60 backdrop-blur-sm text-white rounded-2xl px-3 py-2 text-center min-w-17.5">
              <p
                className={`text-xl font-black leading-none ${compatibilityColor(compatibility)}`}
              >
                {compatibility}%
              </p>
              <p className="text-[9px] text-white/60 font-medium mt-0.5">
                Match
              </p>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                  {profile.full_name}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  @{profile.username}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${rsColors[rs]}`}
              >
                {rs}
              </span>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Shared interests */}
          {sharedInterests.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mr-0.5">
                In common:
              </span>
              {sharedInterests.slice(0, 3).map((i) => (
                <Badge key={i} variant="success" size="sm">
                  #{i}
                </Badge>
              ))}
            </div>
          )}

          {/* All interests */}
          {(profile.interests || []).length > 0 &&
            sharedInterests.length === 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {(profile.interests || []).slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

          {profile.location && (
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface SwipeDiscoveryProps {
  profiles: Profile[];
  currentUser: Profile | null;
  onViewProfile: (id: string) => void;
  onConnect: (id: string) => void;
}

export default function SwipeDiscovery({
  profiles,
  currentUser,
  onViewProfile,
  onConnect,
}: SwipeDiscoveryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<"connect" | "skip" | null>(null);

  const sorted = [...profiles].sort(
    (a, b) =>
      computeCompatibility(currentUser, b) -
      computeCompatibility(currentUser, a),
  );

  const remaining = sorted.slice(currentIndex);

  const handleSkip = () => {
    setLastAction("skip");
    setCurrentIndex((i) => i + 1);
    setTimeout(() => setLastAction(null), 1000);
  };

  const handleConnect = () => {
    const profile = remaining[0];
    if (profile) {
      onConnect(profile.id);
      setLastAction("connect");
      setHistory((h) => [...h, profile.id]);
    }
    setCurrentIndex((i) => i + 1);
    setTimeout(() => setLastAction(null), 1000);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setHistory((h) => h.slice(0, -1));
    }
  };

  if (remaining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
          <Heart className="w-8 h-8 text-orange-500" />
        </div>
        bg-linear-to-br
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          You've seen everyone!
        </h3>
        <p className="text-sm text-neutral-500 mb-6 max-w-xs">
          Check back later as new members join.
        </p>
        <Button
          onClick={() => setCurrentIndex(0)}
          icon={<ChevronRight className="w-4 h-4" />}
        >
          Start Over
        </Button>
      </div>
    );
  }

  const topProfile = remaining[0];
  const nextProfile = remaining[1];
  const compatibility = computeCompatibility(currentUser, topProfile);
  const sharedInterests = (currentUser?.interests || []).filter((i) =>
    (topProfile.interests || []).includes(i),
  );

  return (
    <div className="flex flex-col items-center">
      {/* Card stack */}
      <div className="relative w-full max-w-sm mx-auto" style={{ height: 520 }}>
        <AnimatePresence mode="popLayout">
          {nextProfile && (
            <SwipeCard
              key={nextProfile.id}
              profile={nextProfile}
              compatibility={computeCompatibility(currentUser, nextProfile)}
              sharedInterests={(currentUser?.interests || []).filter((i) =>
                (nextProfile.interests || []).includes(i),
              )}
              isTop={false}
              stackOffset={1}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              onViewProfile={() => onViewProfile(nextProfile.id)}
            />
          )}
          <SwipeCard
            key={topProfile.id}
            profile={topProfile}
            compatibility={compatibility}
            sharedInterests={sharedInterests}
            isTop
            stackOffset={0}
            onSwipeLeft={handleSkip}
            onSwipeRight={handleConnect}
            onViewProfile={() => onViewProfile(topProfile.id)}
          />
        </AnimatePresence>
      </div>

      {/* Action feedback */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
              lastAction === "connect" ? "text-emerald-500" : "text-neutral-500"
            }`}
          >
            {lastAction === "connect" ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Connection request sent!
              </>
            ) : (
              <>
                <X className="w-4 h-4" /> Skipped
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex items-center gap-4 mt-4">
        {currentIndex > 0 && (
          <button
            onClick={handleUndo}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
        )}
        <motion.button
          onClick={handleSkip}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border-2 border-red-400 text-red-400 shadow-lg shadow-red-500/10 flex items-center justify-center"
        >
          <X className="w-7 h-7" />
        </motion.button>
        <motion.button
          onClick={() => onViewProfile(topProfile.id)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500 shadow-md flex items-center justify-center"
        >
          <Eye className="w-5 h-5" />
        </motion.button>
        <motion.button
          onClick={handleConnect}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          bg-linear-to-br
          className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center"
        >
          <Heart className="w-7 h-7 fill-current" />
        </motion.button>
        {remaining.length > 1 && (
          <button
            onClick={handleSkip}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <Zap className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-neutral-400 mt-4">
        Swipe right to connect · Swipe left to skip · {remaining.length}{" "}
        remaining
      </p>
    </div>
  );
}
