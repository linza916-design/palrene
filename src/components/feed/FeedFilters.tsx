import React from "react";

interface FeedFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  showSensitive: boolean;
  onToggleSensitive: () => void;
}

export default function FeedFilters({
  selectedCategory,
  onSelectCategory,
  showSensitive,
  onToggleSensitive,
}: FeedFiltersProps) {
  const categories = [
    { id: "all", label: "✨ All Resonance" },
    { id: "relationships", label: "❤️ Relationships" },
    { id: "music", label: "🎵 Vinyl & Beats" },
    { id: "science", label: "🔬 Cosmos & Quantum" },
    { id: "travel", label: "🧭 Wanderlust" },
    { id: "books", label: "📚 Philosophy" },
    { id: "memes", label: "🎭 Memes" },
    { id: "foods", label: "🍜 Culinary Arts" },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-2 border-b border-neutral-100 dark:border-neutral-900">
      {/* Scrollable Horizontal Filter Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition duration-300 outline-none ${
              selectedCategory === cat.id
                ? "bg-linear-to-r from-red-500 to-orange-500 text-white font-semibold shadow-sm focus:ring-1 focus:ring-orange-300"
                : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sensitive Content Filter Toggle */}
      <div className="flex items-center justify-between px-1.5 py-0.5">
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-mono tracking-widest leading-none">
          Ambient Filters Enabled
        </span>
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSensitive}
            onChange={onToggleSensitive}
            className="sr-only peer"
          />
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 peer-checked:text-orange-500 transition-colors">
            Include Blurred Stories
          </span>
          <div className="relative w-8 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full peer-checked:bg-orange-500/80 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>
    </div>
  );
}
