import React, { useState } from "react";
import { useStore } from "../../store";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Heart,
  Tag,
  MessageSquare,
  Smile,
} from "lucide-react";

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
    setView("profile");
  };

  // Compile active tag options from profile interests
  const allInterests = Array.from(
    new Set(profiles.flatMap((p) => p.interests || [])),
  );

  // Perform matchmaking logic
  const matchPerformance = profiles.filter((prof) => {
    // Prevent self listing
    if (prof.id === currentUser?.id) return false;
    // Allow Poly AI as dedicated helper but exclude from pure romance seekers search
    if (prof.id === "poly-ai") return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatches =
        prof.full_name.toLowerCase().includes(q) ||
        prof.username.toLowerCase().includes(q);
      const bioMatches = (prof.bio || "").toLowerCase().includes(q);
      if (!nameMatches && !bioMatches) return false;
    }

    // Gender identification match
    if (genderFilter !== "all" && prof.gender !== genderFilter) {
      return false;
    }

    // Interests list matches
    if (
      interestFilter !== "all" &&
      !(prof.interests || []).includes(interestFilter)
    ) {
      return false;
    }

    // DOB age matches
    if (prof.dob) {
      const birthYear = new Date(prof.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age > ageLimit) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-62px)] overflow-y-auto pb-c-safe">
      {/* Search and Filters workspace */}
      <div className="lg:col-span-1 p-5 rounded-3xl bg-neutral-50 dark:bg-zinc-950/45 border border-neutral-150/45 dark:border-neutral-900 shadow-sm space-y-6 text-left">
        <div className="space-y-1">
          <h2 className="text-md font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <SlidersHorizontal size={16} className="text-orange-500" />
            <span>Connection Alignment Workspace</span>
          </h2>
          <p className="text-[11px] text-neutral-400">
            Calibrate filters to identify humans reflecting your precise
            frequency.
          </p>
        </div>

        {/* Query Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Search keywords
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-3 text-neutral-450"
            />
            <input
              type="text"
              placeholder="e.g. vintage, vinyl, space"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-neutral-250 bg-white placeholder-neutral-400 dark:bg-black dark:border-neutral-850 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Gender Filters */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Gender Identity Filter
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {["all", "Male", "Female"].map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`py-1.5 text-[10px] font-mono rounded-lg border transition ${
                  genderFilter === g
                    ? "bg-orange-500 border-transparent text-white font-semibold"
                    : "bg-white dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-300"
                }`}
              >
                {g === "all" ? "Any" : g}
              </button>
            ))}
          </div>
        </div>

        {/* Interests dropdown tag */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Resonant Interest tag
          </label>
          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-200 dark:bg-black dark:border-neutral-850 dark:text-white outline-none focus:border-orange-500"
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
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-550">
            <span>Age Bound</span>
            <span className="font-bold text-orange-500">
              Under {ageLimit} yrs
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

        {/* Alignment summary count */}
        <p className="text-[10px] font-mono text-neutral-405 italic pt-2 border-t border-neutral-150/45 dark:border-neutral-900/60 leading-none">
          Matched resonance: {matchPerformance.length} companion souls
        </p>
      </div>

      {/* Result list grids */}
      <div className="lg:col-span-2 text-left space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 py-1">
          Alignment metrics results
        </h3>

        {matchPerformance.length === 0 ? (
          <div className="text-center py-20 text-xs text-neutral-450 font-mono">
            No soul circles found with these exact boundaries. Loosen bounds.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matchPerformance.map((prof) => (
              <div
                key={prof.id}
                className="p-5 border border-neutral-150/50 dark:border-neutral-900 rounded-3xl bg-white dark:bg-zinc-950/45 space-y-4 hover:shadow hover:border-orange-500/20 transition duration-300 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 text-left">
                    <img
                      src={prof.avatar_url}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover border border-neutral-100 dark:border-neutral-850"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-150 flex items-center gap-1 leading-none">
                        {prof.full_name}
                        {prof.is_verified && (
                          <span className="text-[10px] text-orange-500">✔</span>
                        )}
                      </h4>
                      <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                        @{prof.username}
                      </p>
                      {prof.location && (
                        <span className="flex items-center gap-0.5 text-[8.5px] text-neutral-400 font-serif leading-none mt-1">
                          <MapPin size={9} /> {prof.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[8.5px] font-mono bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded uppercase font-bold leading-none select-none">
                    {prof.gender}
                  </span>
                </div>

                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed italic line-clamp-2">
                  "{prof.bio || "Seeking borderless resonances."}"
                </p>

                {/* Match percentage / goal indicator */}
                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-450 dark:text-neutral-500 border-t border-neutral-100/40 dark:border-neutral-900/40 pt-3">
                  <span className="capitalize">
                    Goal: {prof.recognition_goals?.[0] || "Friendship"}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProfileInspect(prof.id)}
                      className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition"
                    >
                      Audit
                    </button>
                    <button
                      onClick={async () => { await startConversation(prof.id); }}
                      className="p-1 px-2.5 bg-linear-to-r from-red-500 to-orange-500 text-white rounded hover:scale-101 transition"
                    >
                      Whisper
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
