import React, { useState } from "react";
import { useStore } from "../../store";
import { motion, AnimatePresence } from "motion/react";
import { Users, Filter, Plus, Flame, Sparkles, LogIn, Megaphone } from "lucide-react";

export default function GroupsPanel() {
  const { groups, joinGroup, createGroup, currentUser } = useStore();
  const [selectedCat, setSelectedCat] = useState("all");
  
  // Group creation form states
  const [showCreator, setShowCreator] = useState(false);
  const [govName, setGovName] = useState("");
  const [govDesc, setGovDesc] = useState("");
  const [govCategory, setGovCategory] = useState("entertainment");
  const [govPrivate, setGovPrivate] = useState(false);

  // Group announcements board indicators
  const announcements = [
    { title: "Weekly Vinyl Soundbath Concert", circle: "Acoustic Resonances", desc: "Sync in next Wednesday 8 PM UTC for the ambient soundbath stream." },
    { title: "Astrophysics Debate on Dark Energy", circle: "Infinite Cosmos Dialogue", desc: "Debating model timelines of accelerating loops. Everyone welcome." }
  ];

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

  const categories = [
    { id: "all", label: "✨ All Circles" },
    { id: "relationships", label: "Relationships" },
    { id: "music", label: "Music & Beats" },
    { id: "science", label: "Cosmos & Science" },
    { id: "travel", label: "Wanderlust" }
  ];

  const filteredGroups = groups.filter((g) => {
    if (selectedCat !== "all") {
      return g.category === selectedCat;
    }
    return true;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe">
      
      {/* Group listing column */}
      <div className="lg:col-span-2 space-y-6 text-left">
        
        {/* Header containing Filters and Creation CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="text-orange-500" size={20} />
              <span>Circles & Tribes</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Collaborative networks and community circles inspired by Reddit forums.</p>
          </div>

          {currentUser && (
            <button
              onClick={() => setShowCreator(!showCreator)}
              className="px-4.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-550 rounded-xl transition duration-300 transform scale-100 hover:scale-101 active:scale-98 flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Forge Circle</span>
            </button>
          )}
        </div>

        {/* Group Creation Creator HUD */}
        <AnimatePresence>
          {showCreator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 border border-neutral-150/50 dark:border-neutral-850 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 space-y-4 overflow-hidden"
            >
              <h3 className="text-sm font-serif font-bold dark:text-white">Forge a connection circle</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Circle Name</span>
                    <input
                      type="text"
                      placeholder="e.g. Acoustic Vinyl Collectors"
                      value={govName}
                      onChange={(e) => setGovName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-850 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Focus Category</span>
                    <select
                      value={govCategory}
                      onChange={(e) => setGovCategory(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-850 dark:text-white focus:outline-none"
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
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Charter/Purpose Description</span>
                  <textarea
                    placeholder="We seek vinyl records, discuss quantum loops, and practice warm mindfulness..."
                    value={govDesc}
                    onChange={(e) => setGovDesc(e.target.value)}
                    className="w-full h-16 text-xs p-2.5 rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-850 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                    <input
                      type="checkbox"
                      checked={govPrivate}
                      onChange={() => setGovPrivate(!govPrivate)}
                    />
                    <span>Private Circle (Charter only visible to matches)</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreator(false)}
                      className="px-3.5 py-1.5 text-xs font-mono text-neutral-450 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-1.5 font-mono text-xs font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-650 shadow duration-250 transition"
                    >
                      Forge Charter
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Tab selectors */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition cursor-pointer outline-none ${
                selectedCat === cat.id
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-sm focus:ring-1 focus:ring-orange-300"
                  : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-450 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Group list panels grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="p-5 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-white dark:bg-zinc-950/45 space-y-4 relative group hover:shadow-md transition duration-300"
            >
              <div className="flex items-center space-x-3.5">
                <img
                  src={group.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-850"
                />
                <div className="overflow-hidden text-left">
                  <h3 className="text-xs font-bold dark:text-white truncate max-w-[130px]" title={group.name}>
                    {group.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-[9px] font-mono text-neutral-400 capitalize">
                    <span>{group.category}</span>
                    <span>•</span>
                    <span>{group.members_count} Members</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed italic pr-1.5 font-serif">
                "{group.description}"
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => joinGroup(group.id)}
                  className="flex-1 py-1.5 text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-900 dark:text-white hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 rounded-xl transition duration-300 active:scale-98"
                >
                  Join Tribe
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Announcements / active events sidebar columns */}
      <div className="space-y-6">
        
        {/* Forum Announcements panel */}
        <div className="p-5 bg-gradient-to-br from-zinc-900 to-black border border-zinc-850 rounded-3xl shadow-xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/5 blur-3xl rounded-full" />
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5 font-serif">
            <Megaphone size={15} className="text-red-400 fill-current animate-bounce" />
            <span>Circle Announcements</span>
          </h4>

          <div className="space-y-4">
            {announcements.map((ann, idx) => (
              <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1 text-xs">
                <span className="text-[8px] font-mono text-orange-400 leading-none block uppercase font-bold tracking-wider">#{ann.circle}</span>
                <span className="font-bold text-white block">{ann.title}</span>
                <p className="text-zinc-400 leading-relaxed italic">{ann.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guidance tip on joining */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-3xl shadow text-left space-y-2">
          <div className="flex items-center space-x-1.5 text-yellow-500 font-mono text-[9px] uppercase tracking-wider font-bold">
            <Sparkles size={11} className="animate-spin" />
            <span>Tribe wisdom by Poly</span>
          </div>
          <p className="text-xs text-zinc-450 italic leading-relaxed">
            "Entering a tribe means matching frequencies before speaking. Spend your first evening reading the silently pinned charters."
          </p>
        </div>

      </div>

    </div>
  );
}
