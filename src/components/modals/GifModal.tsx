import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Loader } from "lucide-react";

interface GifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function GifModal({ isOpen, onClose, onSelect }: GifModalProps) {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const GIPHY_API_KEY = (import.meta as any).env?.VITE_GIPHY_API_KEY || "kZMxRXW1yiJqIrk3u7hzVLRjnVk7sFsl";

  useEffect(() => {
    if (!isOpen) return;
    fetchTrending();
  }, [isOpen]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error(e);
      setGifs(getFallbackGifs());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchTrending();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(search)}&limit=12&rating=g`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error(e);
      setGifs(getFallbackGifs(search));
    } finally {
      setLoading(false);
    }
  };

  // Graceful mockup fallback if API key rate-limited or fails
  const getFallbackGifs = (query = "") => {
    const urls = [
      "https://media.giphy.com/media/t3Mzdx0O5pA9b92RjN/giphy.gif",
      "https://media.giphy.com/media/K1tgb1AeBO5EP6W3v5/giphy.gif",
      "https://media.giphy.com/media/VbnUQpnihPSIgIXbZ1/giphy.gif",
      "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
      "https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif",
      "https://media.giphy.com/media/X3Yj4Xf8v8xuo/giphy.gif",
    ];
    return urls.map((url, i) => ({
      id: `fallback_${i}`,
      images: {
        fixed_height: { url }
      },
      title: `${query || 'emotional'} gif`
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
            className="w-full max-w-lg overflow-hidden border bg-neutral-900 border-neutral-800 rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/40">
              <h3 className="text-lg font-medium text-white font-sans bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                Pick a GIPHY Emotion
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 transition rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="p-4 border-b border-neutral-800 bg-neutral-900/60">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Query feelings... (e.g. cozy, wanderlust, warmth)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm text-white rounded-xl bg-neutral-950 border border-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 px-3 py-1 text-xs text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600"
                >
                  Seek
                </button>
              </div>
            </form>

            {/* Results Grid */}
            <div className="p-4 overflow-y-auto max-h-[350px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs text-neutral-400 font-mono">Fibrillating channels...</p>
                </div>
              ) : gifs.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No digital resonance found. Seek another option.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gifs.map((gif) => (
                    <motion.div
                      key={gif.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelect(gif.images.fixed_height.url);
                        onClose();
                      }}
                      className="relative overflow-hidden cursor-pointer rounded-xl aspect-square bg-neutral-950 border border-neutral-800/40 hover:border-orange-500 transition-colors group"
                    >
                      <img
                        src={gif.images.fixed_height.url}
                        alt={gif.title}
                        className="object-cover w-full h-full pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white/90 truncate font-mono">
                          {gif.title || "Giphy"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
