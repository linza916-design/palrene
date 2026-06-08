import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, Sparkles, Megaphone, Lock, Globe, ChevronRight } from "lucide-react";

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
  const { groups, joinGroup, createGroup, currentUser } = useStore();
  const [selectedCat, setSelectedCat] = useState("all");
  const [showCreator, setShowCreator] = useState(false);
  const [govName, setGovName] = useState("");
  const [govDesc, setGovDesc] = useState("");
  const [govCategory, setGovCategory] = useState("entertainment");
  const [govPrivate, setGovPrivate] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!govName.trim() || !govDesc.trim()) return;
    createGroup(
      govName.trim(),
      govDesc.trim(),
      govCategory,
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80",
      govPrivate
    );
    setGovName("");
    setGovDesc("");
    setGovCategory("entertainment");
    setGovPrivate(false);
    setShowCreator(false);
  };

  const filteredGroups = selectedCat === "all" ? groups : groups.filter((g) => g.category === selectedCat);

  return (
    <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-70px)] overflow-y-auto pb-24 md:pb-6">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-5 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              Circles & Tribes
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Collaborative networks and community circles.
            </p>
          </div>
          {currentUser && (
            <motion.button
              onClick={() => setShowCreator(!showCreator)}
              className="flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 transition-all duration-300 shrink-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={13} />
              Forge Circle
            </motion.button>
          )}
        </div>

        {/* Creator form */}
        <AnimatePresence>
          {showCreator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 border border-orange-500/20 rounded-2xl bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm shadow-sm space-y-4">
                <h3 className="text-sm font-serif font-bold text-neutral-900 dark:text-white">
                  Forge a connection circle
                </h3>
                <form onSubmit={handleCreateSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Circle Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acoustic Vinyl Collectors"
                        value={govName}
                        onChange={(e) => setGovName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Category</label>
                      <select
                        value={govCategory}
                        onChange={(e) => setGovCategory(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 dark:text-white focus:outline-none focus:border-orange-500 transition"
                      >
                        <option value="entertainment">Entertainment</option>
                        <option value="relationships">Relationships</option>
                        <option value="music">Music & Vinyl</option>
                        <option value="science">Cosmos & Quantum</option>
                        <option value="travel">Travel</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Purpose Description</label>
                    <textarea
                      placeholder="We seek vinyl records, discuss quantum loops, and practice warm mindfulness..."
                      value={govDesc}
                      onChange={(e) => setGovDesc(e.target.value)}
                      className="w-full h-16 text-xs p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 dark:text-white focus:outline-none focus:border-orange-500 transition resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-mono text-neutral-400">
                      <input
                        type="checkbox"
                        checked={govPrivate}
                        onChange={() => setGovPrivate(!govPrivate)}
                        className="rounded accent-orange-500"
                      />
                      <Lock size={10} />
                      Private Circle
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreator(false)}
                        className="px-3.5 py-1.5 text-xs font-mono text-neutral-500 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4.5 py-1.5 font-mono text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl hover:opacity-90 shadow transition"
                      >
                        Forge Charter
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 outline-none border ${
                selectedCat === cat.id
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold border-transparent shadow-sm"
                  : "bg-white dark:bg-zinc-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-500/40 hover:text-orange-500"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Group grid */}
        {filteredGroups.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={28} className="text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm font-serif text-neutral-500 dark:text-neutral-400">No circles in this category yet.</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">Be the first to forge one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredGroups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900 rounded-2xl overflow-hidden hover:border-orange-500/25 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                {/* Banner strip */}
                <div className="h-14 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 relative overflow-hidden">
                  <img
                    src={group.avatar_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                  {group.is_private && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-[8px] font-mono text-white/80 backdrop-blur-sm">
                      <Lock size={8} />
                      Private
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={group.avatar_url}
                      alt={group.name}
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 -mt-7 shrink-0 shadow-sm"
                    />
                    <div className="overflow-hidden min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{group.name}</h3>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 mt-0.5">
                        <Globe size={9} />
                        <span className="capitalize">{group.category}</span>
                        <span>·</span>
                        <Users size={9} />
                        <span>{group.members_count} members</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed italic">
                    "{group.description}"
                  </p>

                  <button
                    onClick={() => joinGroup(group.id)}
                    className="w-full py-2 text-xs font-mono font-bold rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <span>Join Tribe</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-5 text-left">
        {/* Announcements */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/6 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full pointer-events-none" />

          <h4 className="text-sm font-serif font-semibold text-white mb-4 flex items-center gap-2">
            <Megaphone size={14} className="text-orange-400" />
            Circle Announcements
          </h4>

          <div className="space-y-3">
            {announcements.map((ann, idx) => (
              <motion.div
                key={idx}
                className="p-3 bg-white/5 rounded-xl border border-white/8 space-y-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ x: 2 }}
              >
                <span className="text-[8px] font-mono text-orange-400 uppercase font-bold tracking-wider block">
                  #{ann.circle}
                </span>
                <span className="text-xs font-bold text-white block">{ann.title}</span>
                <p className="text-[10px] text-white/50 leading-relaxed">{ann.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Poly AI tribe wisdom */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/8 to-orange-500/8 border border-yellow-500/15 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
              <Sparkles size={13} className="text-yellow-500" />
            </div>
            <span className="text-[10px] font-mono font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">
              Poly Wisdom
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
            "Entering a tribe means matching frequencies before speaking. Spend your first evening reading the silently pinned charters."
          </p>
        </div>
      </div>
    </div>
  );
}
