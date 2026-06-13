import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  Sparkles,
  Megaphone,
  Lock,
  Globe,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  AppCard,
  Avatar,
  Button,
  Badge,
  EmptyState,
  SectionHeader,
  Input,
} from "../ui";
import GroupDetail from "./GroupDetail";
import { Group } from "../../types";

const categories = [
  { id: "all", label: "All Circles" },
  { id: "relationships", label: "Relationships" },
  { id: "music", label: "Music & Beats" },
  { id: "science", label: "Cosmos & Science" },
  { id: "travel", label: "Wanderlust" },
  { id: "entertainment", label: "Entertainment" },
];

const announcements = [
  {
    title: "Weekly Vinyl Soundbath Concert",
    circle: "Acoustic Resonances",
    desc: "Sync in next Wednesday 8 PM UTC for the ambient soundbath stream.",
  },
  {
    title: "Astrophysics Debate on Dark Energy",
    circle: "Infinite Cosmos Dialogue",
    desc: "Debating model timelines of accelerating loops. Everyone welcome.",
  },
];

export default function GroupsPanel() {
  const {
    groups,
    joinGroup,
    createGroup,
    currentUser,
    searchQuery,
    setSearchQuery,
  } = useStore();
  const [selectedCat, setSelectedCat] = useState("all");
  const [showCreator, setShowCreator] = useState(false);
  const [govName, setGovName] = useState("");
  const [govDesc, setGovDesc] = useState("");
  const [govCategory, setGovCategory] = useState("entertainment");
  const [govPrivate, setGovPrivate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!govName.trim() || !govDesc.trim()) return;
    createGroup(
      govName.trim(),
      govDesc.trim(),
      govCategory,
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80",
      govPrivate,
    );
    setGovName("");
    setGovDesc("");
    setGovCategory("entertainment");
    setGovPrivate(false);
    setShowCreator(false);
  };

  const filteredGroups =
    selectedCat === "all"
      ? groups
      : groups.filter((g) => g.category === selectedCat);

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-62px)] overflow-y-auto pb-24 md:pb-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <SectionHeader
            title="Circles & Tribes"
            subtitle="Collaborative networks and community circles"
            icon={<Users className="w-5 h-5 text-orange-500" />}
          />
          {currentUser && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreator(!showCreator)}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Circle
            </Button>
          )}
        </div>

        {/* Creator Form */}
        <AnimatePresence>
          {showCreator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <AppCard
                variant="elevated"
                padding="lg"
                className="border-orange-500/20"
              >
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
                  Create a new circle
                </h3>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Circle Name"
                      placeholder="e.g. Acoustic Vinyl Collectors"
                      value={govName}
                      onChange={(e) => setGovName(e.target.value)}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Category
                      </label>
                      <select
                        value={govCategory}
                        onChange={(e) => setGovCategory(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      >
                        <option value="entertainment">Entertainment</option>
                        <option value="relationships">Relationships</option>
                        <option value="music">Music & Vinyl</option>
                        <option value="science">Cosmos & Quantum</option>
                        <option value="travel">Travel</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Purpose Description
                    </label>
                    <textarea
                      placeholder="We seek vinyl records, discuss quantum loops, and practice warm mindfulness..."
                      value={govDesc}
                      onChange={(e) => setGovDesc(e.target.value)}
                      className="w-full h-20 p-3 text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={govPrivate}
                        onChange={() => setGovPrivate(!govPrivate)}
                        className="w-4 h-4 rounded accent-orange-500"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <Lock className="w-3.5 h-3.5" />
                        Private Circle
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreator(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Create Circle
                      </Button>
                    </div>
                  </div>
                </form>
              </AppCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    selectedCat === cat.id
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Group grid */}
            {filteredGroups.length === 0 ? (
              <EmptyState
                title="No circles in this category"
                description="Be the first to create one!"
                icon={<Users className="w-6 h-6" />}
                action={
                  <Button
                    onClick={() => setShowCreator(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Create Circle
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGroups.map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <AppCard
                      variant="default"
                      padding="none"
                      hover
                      className="overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedGroup(group)}
                    >
                      {/* Banner */}
                      <div className="h-14 relative overflow-hidden bg-linear-to-r from-orange-500/20 via-red-500/10 to-amber-500/20">
                        <img
                          src={group.avatar_url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                        />
                        {group.is_private && (
                          <Badge
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                          >
                            <Lock className="w-3 h-3" /> Private
                          </Badge>
                        )}
                      </div>

                      <div className="p-4 -mt-4 relative">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar
                            src={group.avatar_url}
                            alt={group.name}
                            size="lg"
                            className="border-4 border-white dark:border-neutral-900 shadow-md"
                          />
                          <div className="flex-1 min-w-0 pt-4">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                              {group.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5" />
                              {group.category}
                              <span className="text-neutral-300 dark:text-neutral-700">
                                ·
                              </span>
                              <Users className="w-3.5 h-3.5" />
                              {group.members_count} members
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                          "{group.description}"
                        </p>

                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            joinGroup(group.id);
                          }}
                          icon={<ChevronRight className="w-4 h-4" />}
                          iconPosition="right"
                        >
                          Join Tribe
                        </Button>
                      </div>
                    </AppCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Announcements */}
            <AppCard
              variant="elevated"
              padding="lg"
              className="bg-linear-to-br from-neutral-900 to-neutral-950 text-white border-neutral-800"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-orange-400" />
                </div>
                <h4 className="text-sm font-semibold">Circle Announcements</h4>
              </div>

              <div className="space-y-3">
                {announcements.map((ann, idx) => (
                  <motion.div
                    key={idx}
                    className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 2 }}
                  >
                    <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">
                      #{ann.circle}
                    </span>
                    <span className="text-xs font-bold text-white block">
                      {ann.title}
                    </span>
                    <p className="text-[10px] text-white/50 leading-relaxed">
                      {ann.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </AppCard>

            {/* Poly AI wisdom */}
            <AppCard
              variant="outlined"
              padding="md"
              className="bg-linear-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Poly Wisdom
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
                "Entering a tribe means matching frequencies before speaking.
                Spend your first evening reading the silently pinned charters."
              </p>
            </AppCard>
          </div>
        </div>
      </div>
    </div>
  );
}
