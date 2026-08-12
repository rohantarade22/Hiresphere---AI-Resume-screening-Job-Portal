import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

/** Animated statistic counter — counts from 0 to `value` once it scrolls
 * into view. Backs the landing page's Stats section. */
export default function CountUp({ value, suffix = "", duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return (
    <motion.span ref={ref} className="font-mono">
      {display.toLocaleString()}{suffix}
    </motion.span>
  );
}
