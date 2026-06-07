import { Heart } from "lucide-react";

interface Review {
  avatar: string;
  name: string;
  role: string;
  text: string;
}

export function TestimonialCard({ review }: { review: Review }) {
  return (
    <article
      className="
      bg-white dark:bg-zinc-950
      border border-neutral-200 dark:border-zinc-800
      rounded-3xl
      p-5
      shadow-sm
      hover:shadow-lg
      transition-all
      duration-300
      "
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
            {review.name}
          </h4>

          <p className="text-xs text-neutral-500">{review.role}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        "{review.text}"
      </p>

      <div className="flex gap-1 mt-4 text-orange-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Heart key={i} size={12} fill="currentColor" />
        ))}
      </div>
    </article>
  );
}
