import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../../store";
import {
  Search,
  MapPin,
  Heart,
  UserPlus,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  AppCard,
  Avatar,
  Button,
  Badge,
  EmptyState,
  SectionHeader,
  Input,
  TabNav,
} from "../ui";
import ConnectionButton from "../connections/ConnectionButton";

export default function SearchPanel() {
  const {
    profiles,
    currentUser,
    startConversation,
    setView,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [genderFilter, setGenderFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");
  const [ageLimit, setAgeLimit] = useState(60);

  const handleProfileInspect = (id: string) => {
    localStorage.setItem("palrene_view_profile_id", id);
    setView("profile");
  };

  // Compile active tag options from profile interests
  const allInterests = Array.from(
    new Set(profiles.flatMap((p) => p.interests || [])),
  );

  // Filter profiles
  const matchResults = profiles.filter((prof) => {
    if (prof.id === currentUser?.id) return false;
    if (prof.id === "poly-ai") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatches =
        prof.full_name?.toLowerCase().includes(q) ||
        prof.username?.toLowerCase().includes(q);
      const bioMatches = (prof.bio || "").toLowerCase().includes(q);
      if (!nameMatches && !bioMatches) return false;
    }

    if (genderFilter !== "all" && prof.gender !== genderFilter) {
      return false;
    }

    if (
      interestFilter !== "all" &&
      !(prof.interests || []).includes(interestFilter)
    ) {
      return false;
    }

    if (prof.dob) {
      const birthYear = new Date(prof.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age > ageLimit) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SectionHeader
              title="Search & Filter"
              subtitle="Find kindred spirits"
              icon={<Search className="w-5 h-5 text-orange-500" />}
              className="mb-0"
            />

            <AppCard variant="outlined" padding="lg">
              <div className="space-y-5">
                {/* Query Input */}
                <Input
                  label="Search keywords"
                  placeholder="e.g. vintage, vinyl, space"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />

                {/* Gender Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["all", "Male", "Female"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderFilter(g)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                          genderFilter === g
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                        }`}
                      >
                        {g === "all" ? "Any" : g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Interest
                  </label>
                  <select
                    value={interestFilter}
                    onChange={(e) => setInterestFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="all">Any aligned interest</option>
                    {allInterests.map((interest) => (
                      <option key={interest} value={interest}>
                        #{interest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age limit slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Age Limit
                    </label>
                    <span className="text-xs font-bold text-orange-500">
                      Under {ageLimit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={ageLimit}
                    onChange={(e) => setAgeLimit(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Results count */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                    {matchResults.length} soul
                    {matchResults.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
            </AppCard>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader
              title="Results"
              subtitle={`${matchResults.length} match${matchResults.length !== 1 ? "es" : ""}`}
              icon={<Heart className="w-5 h-5 text-orange-500" />}
              className="mb-0"
            />

            {matchResults.length === 0 ? (
              <EmptyState
                title="No souls found"
                description="Try adjusting your filters to discover more kindred spirits"
                icon={<Heart className="w-6 h-6" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchResults.map((prof) => (
                  <motion.div
                    key={prof.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AppCard
                      variant="default"
                      padding="lg"
                      hover
                      className="group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={prof.avatar_url || ""}
                            alt={prof.full_name || "User"}
                            size="lg"
                            verified={prof.is_verified}
                            online={prof.is_active}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                              {prof.full_name}
                              {prof.is_verified && (
                                <span className="text-orange-500 text-[10px]">
                                  ✔
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                              @{prof.username}
                            </p>
                            {prof.location && (
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {prof.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <Badge variant="secondary" size="sm">
                          {prof.gender}
                        </Badge>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                        "{prof.bio || "Seeking borderless resonances."}"
                      </p>

                      {/* Interest tags */}
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {(prof.interests || []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="info" size="sm">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Goal: {prof.recognition_goals?.[0] || "Friendship"}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleProfileInspect(prof.id)}
                          >
                            View
                          </Button>
                          <ConnectionButton profileId={prof.id} size="sm" />
                        </div>
                      </div>
                    </AppCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
