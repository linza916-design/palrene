import React, { useState } from "react";
import {
  Music,
  Radio,
  ExternalLink,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export default function CustomSoundCloudPlayer() {
  const [activePlayerTab, setActivePlayerTab] = useState<
    "soundcloud" | "external"
  >("soundcloud");
  const [hasInteracted, setHasInteracted] = useState(false);

  // 1. Define the web URL (without the silent #t=3:54 timestamp or tracking query params)
  const webUrl = "https://soundcloud.com/aphina-dog/indila-love-story-sped-up";

  // 2. Point to the official SoundCloud Widget stream API
  const streamEndpoint = `https://w.soundcloud.com/player/?url=${encodeURIComponent(webUrl)}`;

  // 3. Clean UI parameters (hides comments, related tracks, and matches theme orange color)
  // Force auto_play=true on click to ensure instant starting once browser unblocks
  const playerSettings = `&color=%23f97316&auto_play=${hasInteracted ? "true" : "false"}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

  return (
    <div
      id="custom-soundcloud-player"
      className="bg-neutral-900/60 border border-neutral-850 p-5 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl max-w-xl mx-auto my-4 text-left"
    >
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-950 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-inner">
            <Music size={16} className="animate-pulse text-orange-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold flex items-center gap-1.5">
              <span>Acoustic Sync Station</span>
              <span className="text-[8px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold border border-orange-500/25 tracking-wider uppercase leading-none">
                Resilience Engine
              </span>
            </h3>
            <p className="text-[10px] text-neutral-500 font-serif leading-tight mt-0.5">
              Dual-source acoustic feed for cross-origin sensory harmony.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] font-mono bg-neutral-950/60 px-2 py-1 rounded-lg border border-neutral-850 text-neutral-450 self-start sm:self-center">
          <Radio size={11} className="text-orange-500 animate-pulse" />
          <span>AUDIO SYSTEM READY</span>
        </div>
      </div>

      {/* Robust Fallback Tabs Selector */}
      <div className="flex items-center bg-black/50 p-1 rounded-xl border border-neutral-950 mb-4 text-xs font-mono">
        <button
          id="btn-tab-soundcloud"
          type="button"
          onClick={() => setActivePlayerTab("soundcloud")}
          className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            activePlayerTab === "soundcloud"
              ? "bg-orange-605 bg-orange-600 text-white font-bold shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Radio size={12} />
          <span>SoundCloud</span>
        </button>
        <button
          id="btn-tab-external"
          type="button"
          onClick={() => setActivePlayerTab("external")}
          className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            activePlayerTab === "external"
              ? "bg-neutral-850 border border-neutral-800 text-white font-bold shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <ExternalLink size={12} />
          <span>Direct Launch</span>
        </button>
      </div>

      {/* Tab Panels Content */}
      <div className="rounded-2xl overflow-hidden border border-neutral-950 shadow-2xl bg-black/40 min-h-40 flex flex-col justify-center">
        {activePlayerTab === "soundcloud" && (
          <div className="relative w-full min-h-[166px] flex flex-col justify-center bg-neutral-950/80 rounded-2xl overflow-hidden">
            {!hasInteracted ? (
              <div
                id="soundcloud-unlock-backdrop"
                className="p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer select-none group relative overflow-hidden h-[166px]"
                onClick={() => setHasInteracted(true)}
              >
                {/* Visual Cover Art overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950/90 to-black opacity-80 z-0" />

                {/* Pulsating background ambient soundwave design */}
                <div className="absolute inset-x-0 bottom-2 flex items-end justify-center space-x-1 h-12 opacity-15 pointer-events-none">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-t bg-orange-500 animate-pulse"
                      style={{
                        height: `${30 + Math.random() * 70}%`,
                        animationDelay: `${i * 80}ms`,
                        animationDuration: `${600 + Math.random() * 800}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white border-4 border-black shadow-2xl transition-all duration-300 scale-100 group-hover:scale-110 active:scale-95">
                    <span className="text-xl ml-1">▶</span>
                  </div>
                  <h4 className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                    CLICK TO UNLOCK & PLAY AUDIO
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5 max-w-85 leading-snug">
                    Bypasses browser sandboxing constraints to play Indila -
                    Love Story instantly with authorized user interaction.
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                id="soundcloud-iframe"
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay; encrypted-media"
                src={`${streamEndpoint}${playerSettings}`}
                title="SoundCloud Player"
                className="opacity-95 hover:opacity-100 transition-opacity duration-300 h-[166px]"
              />
            )}
          </div>
        )}

        {activePlayerTab === "external" && (
          <div className="p-6 text-center space-y-4">
            <ExternalLink
              size={24}
              className="mx-auto text-orange-400 animate-bounce"
            />
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Launch Sandbox Override
              </h4>
              <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-normal">
                If third-party cookies or browser extensions restrict inline
                playback on this domain, listening directly in a secure separate
                window will play without restrictions.
              </p>
            </div>
            <a
              id="snd-direct-link"
              href={webUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-xl transition-all shadow-lg mx-auto"
            >
              <span>Listen Directly on SoundCloud</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      {/* Highly explanatory alert block detailing container sandboxing issues */}
      <div className="mt-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-[10px] font-mono leading-relaxed space-y-2">
        <div className="flex items-center space-x-1 text-amber-400 font-bold">
          <ShieldAlert size={12} />
          <span>RESOLVED SOUND FIX & TIMESTAMPS</span>
        </div>
        <p className="text-neutral-400">
          The link you provided previously included a timestamp parameter (
          <code className="text-amber-400 font-semibold">#t=3:54</code>) from
          sharing. Because the sped-up track ends before 3:54, the player
          started after the song was already over, resulting in total silence!
        </p>
        <p className="text-neutral-400">
          We have updated the player to target the correct streaming server{" "}
          <code className="text-orange-400 font-semibold">
            w.soundcloud.com
          </code>{" "}
          and stripped the late timestamp so it plays from{" "}
          <strong className="text-white">0:00 (beginning)</strong> perfectly.
        </p>
        <p className="text-neutral-400">
          💡 <strong className="text-white">Note:</strong> If sound is still
          blocked on your device due to secure browser cookie constraints inside
          sandbox environments:
          <br />
          1. Use the{" "}
          <strong
            className="text-neutral-300 cursor-pointer hover:underline"
            onClick={() => setActivePlayerTab("external")}
          >
            Direct Launch
          </strong>{" "}
          tab to play without restrictions!
        </p>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-[9px] font-mono text-neutral-500 border-t border-neutral-950 pt-3">
        <span className="truncate max-w-70">🎵 INDILA — LOVE STORY</span>
        <span className="flex items-center space-x-1 text-orange-500/95 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block" />
          <span>SENSORY FEED STATUS</span>
        </span>
      </div>
    </div>
  );
}
