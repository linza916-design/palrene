import React from "react";
import { motion } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";

interface SponsoredPostProps {
  ad?: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link_url: string;
    sponsor_name: string;
    sponsor_logo?: string;
  };
}

export const DEFAULT_ADS = [
  {
    id: "ad-1",
    title: "Master Emotional Intelligence",
    description:
      "Unlock deeper connections with AI-powered relationship coaching. Start your journey today.",
    image_url:
      "https://images.unsplash.com/photo-1517245386807-bb43f4025cc3?w=600&auto=format&fit=crop&q=80",
    link_url: "#",
    sponsor_name: "Connected Minds",
    sponsor_logo: undefined,
  },
  {
    id: "ad-2",
    title: "Premium Vinyl Collection",
    description:
      "Discover rare classical and jazz records. Hand-curated selections for audiophiles.",
    image_url:
      "https://images.unsplash.com/photo-1539625319135-8d3c9f2b2d39?w=600&auto=format&fit=crop&q=80",
    link_url: "#",
    sponsor_name: "Vinyl Dreams",
    sponsor_logo: undefined,
  },
  {
    id: "ad-3",
    title: "Mindful Meditation Retreats",
    description:
      "Find your inner peace at our exclusive wellness destinations worldwide.",
    image_url:
      "https://images.unsplash.com/photo-1506905925346-21bda4d68885?w=600&auto=format&fit=crop&q=80",
    link_url: "#",
    sponsor_name: "Serene Spaces",
    sponsor_logo: undefined,
  },
];

export default function SponsoredPost({ ad }: SponsoredPostProps) {
  const adData =
    ad || DEFAULT_ADS[Math.floor(Math.random() * DEFAULT_ADS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden bg-white/80 dark:bg-zinc-950/50 backdrop-blur-sm border border-neutral-100 dark:border-neutral-900/60 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      {/* Sponsored badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full border border-neutral-200/50 dark:border-neutral-800">
        <Sparkles size={10} className="text-orange-500" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Sponsored
        </span>
      </div>

      {/* Ad content */}
      <a
        href={adData.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block cursor-pointer"
      >
        {/* Image */}
        <div className="aspect-4/3 overflow-hidden rounded-t-3xl">
          <img
            src={adData.image_url}
            alt={adData.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {adData.sponsor_logo ? (
              <img
                src={adData.sponsor_logo}
                alt={adData.sponsor_name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[8px] font-bold">
                {adData.sponsor_name.charAt(0)}
              </div>
            )}
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
              {adData.sponsor_name}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-neutral-800 dark:text-white line-clamp-2">
            {adData.title}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {adData.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-orange-500 font-mono flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn More
              <ExternalLink size={10} />
            </span>
          </div>
        </div>
      </a>

      {/* Disclosure */}
      <div className="px-4 pb-3">
        <p className="text-[8px] text-neutral-400 dark:text-neutral-600 font-mono">
          Ads help keep Palrene free for everyone. Tap to support our community.
        </p>
      </div>
    </motion.div>
  );
}
