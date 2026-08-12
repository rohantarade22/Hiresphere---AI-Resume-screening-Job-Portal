import { motion } from "framer-motion";

/** Wraps children in a scroll-triggered fade/slide reveal. Used throughout
 * the landing page instead of hand-rolling the same motion props everywhere. */
export default function ScrollReveal({ children, delay = 0, y = 24, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
