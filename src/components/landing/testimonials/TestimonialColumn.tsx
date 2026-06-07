import { motion } from "framer-motion";
import { TestimonialCard } from "./TestimonialsCard";

interface TestimonialColumnProps {
  reviews: Array<{
    name: string;
    avatar: string;
    role: string;
    text: string;
    [key: string]: any;
  }>;
  duration: number;
  reverse: boolean;
  paused: boolean;
}

export default function TestimonialColumn({
  reviews,
  duration,
  reverse,
  paused,
}: TestimonialColumnProps) {
  return (
    <motion.div
      animate={
        paused
          ? {}
          : {
              y: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
            }
      }
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration,
      }}
      className="flex flex-col gap-4"
    >
      {[...reviews, ...reviews].map((review, index) => (
        <TestimonialCard key={`${review.name}-${index}`} review={review} />
      ))}
    </motion.div>
  );
}
