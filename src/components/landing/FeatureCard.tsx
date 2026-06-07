// components/FeatureCard.tsx

import { motion } from "framer-motion";

interface FeatureCardProps {
  image: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

export default function FeatureCard({
  image,
  badge,
  title,
  description,
  icon,
  features,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group flex flex-col bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl overflow-hidden text-left"
    >
      <div className="h-52 overflow-hidden relative">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />

        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-xs font-medium text-white">
          {badge}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center gap-3">
          {icon}

          <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>

        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-300 dark:border-zinc-700"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
