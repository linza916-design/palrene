import { useState } from "react";
import TestimonialColumn from "./TestimonialColumn";
import { testimonials } from "./testimonials";

export default function TestimonialsSection() {
  const [paused, setPaused] = useState(false);

  const cols = [
    testimonials.slice(0, 5),
    testimonials.slice(5, 10),
    testimonials.slice(10, 15),
    testimonials.slice(15, 20),
  ];

  return (
    <section
      className="
      py-24
      bg-neutral-50/50
      dark:bg-zinc-950
      border-y
      border-neutral-200
      dark:border-zinc-800
      overflow-hidden
      "
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-orange-500 font-medium">
            Testimonials
          </span>

          <h2 className="mt-4 text-4xl font-serif font-bold">
            Trusted by meaningful people
          </h2>

          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Stories from people building friendships, communities,
            relationships, and professional connections on Palrene.
          </p>
        </div>

        <div
          className="relative h-175 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* top fade */}
          <div className="absolute top-0 left-0 right-0 h-32 z-20 bg-linear-to-b from-white dark:from-black to-transparent" />

          {/* bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 z-20 bg-linear-to-t from-white dark:from-black to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <TestimonialColumn
              reviews={cols[0]}
              duration={30}
              paused={paused}
              reverse={false}
            />

            <TestimonialColumn
              reviews={cols[1]}
              duration={38}
              reverse
              paused={paused}
            />

            <TestimonialColumn
              reviews={cols[2]}
              duration={34}
              paused={paused}
              reverse={false}
            />

            <TestimonialColumn
              reviews={cols[3]}
              duration={42}
              reverse
              paused={paused}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
