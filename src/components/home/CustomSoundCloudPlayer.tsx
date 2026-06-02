import { useState } from "react";
import { Music, ExternalLink, Radio, Play } from "lucide-react";

export default function CustomSoundCloudPlayer() {
  const [activeTab, setActiveTab] = useState<"soundcloud" | "external">(
    "soundcloud",
  );

  const [hasInteracted, setHasInteracted] = useState(false);

  const trackUrl =
    "https://soundcloud.com/aphina-dog/indila-love-story-sped-up";

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    trackUrl,
  )}&color=%23f97316&auto_play=${
    hasInteracted ? "true" : "false"
  }&hide_related=true&show_comments=false&show_user=true&show_reposts=false`;

  return (
    <section className="max-w-xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_0_80px_rgba(249,115,22,0.12)]">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6">
          {/* Artwork */}
          <div className="relative overflow-hidden rounded-2xl aspect-square mb-5">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"
              alt="Album Artwork"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />

            {!hasInteracted && (
              <button
                onClick={() => setHasInteracted(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                  <Play size={32} fill="white" className="text-white ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Song Info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Love Story (Sped Up)
            </h2>

            <p className="text-neutral-400 mt-1">Indila</p>

            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />

              <span className="text-xs font-medium text-orange-400">
                LIVE AUDIO FEED
              </span>
            </div>
          </div>

          {/* Animated Waveform */}

          <div className="flex justify-center items-end gap-1 h-12 mt-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-orange-500 animate-pulse"
                style={{
                  height: `${10 + Math.random() * 30}px`,
                  animationDelay: `${i * 70}ms`,
                }}
              />
            ))}
          </div>

          {/* Tabs */}

          <div className="grid grid-cols-2 gap-2 mt-6 p-1 rounded-xl bg-black/40 border border-white/5">
            <button
              onClick={() => setActiveTab("soundcloud")}
              className={`h-11 rounded-lg text-sm font-medium transition ${
                activeTab === "soundcloud"
                  ? "bg-orange-500 text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Radio size={16} />
                SoundCloud
              </div>
            </button>

            <button
              onClick={() => setActiveTab("external")}
              className={`h-11 rounded-lg text-sm font-medium transition ${
                activeTab === "external"
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ExternalLink size={16} />
                Open Direct
              </div>
            </button>
          </div>

          {/* Content */}

          <div className="mt-5 rounded-2xl overflow-hidden border border-white/5 bg-black/30">
            {activeTab === "soundcloud" && (
              <iframe
                title="SoundCloud"
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={embedUrl}
              />
            )}

            {activeTab === "external" && (
              <div className="p-8 text-center">
                <Music size={36} className="mx-auto text-orange-500 mb-4" />

                <h3 className="text-white font-semibold">
                  Listen on SoundCloud
                </h3>

                <p className="text-sm text-neutral-400 mt-2 mb-5">
                  Open the track directly if your browser blocks embedded
                  playback.
                </p>

                <a
                  href={trackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
                >
                  Open Track
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
            <span>🎵 INDILA — LOVE STORY</span>

            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              STREAM ACTIVE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
