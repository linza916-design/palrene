import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Loader, Check } from "lucide-react";

interface UnsplashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMultiple: (urls: string[]) => void;
}

export default function UnsplashModal({
  isOpen,
  onClose,
  onSelectMultiple,
}: UnsplashModalProps) {
  const [search, setSearch] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const ACCESS_KEY =
    (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY ||
    "q4SkW5ZwIn0qb-T716jeRqLaiS33nKSO0aZteFgOzhw";

  useEffect(() => {
    if (!isOpen) return;
    fetchEditorial();
    setSelectedUrls([]);
  }, [isOpen]);

  const fetchEditorial = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos?client_id=${ACCESS_KEY}&per_page=12&order_by=popular`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setImages(data);
      } else {
        setImages(getFallbackImages());
      }
    } catch {
      setImages(getFallbackImages());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchEditorial();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?client_id=${ACCESS_KEY}&query=${encodeURIComponent(search)}&per_page=12`,
      );
      const data = await res.json();
      setImages(data.results || getFallbackImages(search));
    } catch {
      setImages(getFallbackImages(search));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const handleDone = () => {
    onSelectMultiple(selectedUrls);
    onClose();
  };

  const getFallbackImages = (query = "") => {
    const urls = [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    ];
    return urls.map((url, i) => ({
      id: `fallback_un_${i}`,
      urls: {
        regular: `${url}?w=800&auto=format&fit=crop&q=80`,
        thumb: `${url}?w=200&auto=format&fit=crop&q=80`,
      },
      alt_description: `${query || "romance"} scenery`,
      user: {
        name: "Cinematic Artist",
      },
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl overflow-hidden border bg-neutral-900 border-neutral-800 rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/40">
              <div>
                <h3 className="text-lg font-medium text-white font-sans bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
                  Select Cinematic Images
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Select multiple images to attach to your post.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 transition rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search relationships, vintage jazz, retro landscapes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm text-white rounded-xl bg-neutral-950 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition shadow-inner"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-3.5 text-neutral-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 shadow"
              >
                Seek
              </button>
            </form>

            {/* Content Masonry/Grid */}
            <div className="p-5 overflow-y-auto max-h-95">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs text-neutral-400 font-mono">
                    Syncing lens...
                  </p>
                </div>
              ) : images.length === 0 ? (
                <div className="py-16 text-center text-sm text-neutral-500">
                  Unable to source graphics. Try a simpler query.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img) => {
                    const isSelected = selectedUrls.includes(img.urls.regular);
                    return (
                      <div
                        key={img.id}
                        onClick={() => toggleSelect(img.urls.regular)}
                        className={`relative overflow-hidden cursor-pointer rounded-xl aspect-4/3 bg-neutral-950 border transition-all duration-300 group ${
                          isSelected
                            ? "ring-2 ring-orange-500 border-transparent scale-98"
                            : "border-neutral-800/40 hover:border-neutral-700 hover:scale-101"
                        }`}
                      >
                        <img
                          src={img.urls.thumb}
                          alt={img.alt_description}
                          className="object-cover w-full h-full pointer-events-none transition duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {/* Selector indicator */}
                        <div
                          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center border text-white transition-all ${
                            isSelected
                              ? "bg-orange-500 border-transparent"
                              : "bg-black/40 border-white/20 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <Check
                            size={12}
                            className={isSelected ? "opacity-100" : "opacity-0"}
                          />
                        </div>
                        {/* Artist Tag */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white/80 font-mono truncate">
                            By {img.user.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer containing CTA */}
            <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-950/40">
              <span className="text-xs text-neutral-400 font-mono">
                {selectedUrls.length} image
                {selectedUrls.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  disabled={selectedUrls.length === 0}
                  className="px-5 py-2 text-xs font-mono font-bold text-white bg-linear-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 transition disabled:opacity-45 disabled:pointer-events-none"
                >
                  Attach to Post
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
