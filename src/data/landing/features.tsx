// data/features.tsx

import { Heart, Sparkles, Users } from "lucide-react";

export const features = [
  {
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200",
    badge: "Relationships",
    title: "Meaningful Relationships",
    description:
      "Meet friends, partners, mentors, and communities through shared values and authentic conversations.",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
        <Heart size={18} className="text-red-500" />
      </div>
    ),
    features: ["Verified Profiles", "Smart Matching", "Private Messaging"],
  },

  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200",
    badge: "Poly AI",
    title: "Relationship Assistant",
    description:
      "Receive conversation ideas, relationship insights, and personalized guidance.",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
        <Sparkles size={18} className="text-orange-500" />
      </div>
    ),
    features: ["AI Guidance", "Smart Suggestions", "Real-Time Support"],
  },

  {
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200",
    badge: "Communities",
    title: "Interest Groups",
    description:
      "Discover communities built around hobbies, careers, causes, and shared experiences.",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
        <Users size={18} className="text-yellow-500" />
      </div>
    ),
    features: ["Interest Groups", "Local Communities", "Ad-Free Spaces"],
  },
];
