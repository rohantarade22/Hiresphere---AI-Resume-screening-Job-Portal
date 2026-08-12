import { motion } from "framer-motion";

const skills = ["React", "Django", "PostgreSQL", "Docker", "TypeScript"];

/**
 * The signature visual for HireSphere AI: two nodes (Candidate / Job)
 * connected by a pulsing "match" line with a live-looking percentage,
 * orbited by skill chips. This isn't decorative — it's the literal
 * product mechanic (AI matching) rendered as the hero visual, and it
 * recurs at smaller scale in the stats section.
 */
export default function MatchConstellation({ size = "large" }) {
  const dims = size === "large" ? 560 : 320;
  const nodeR = size === "large" ? 34 : 22;

  return (
    <div className="relative flex items-center justify-center" style={{ width: dims, height: dims }}>
      {/* orbiting skill chips */}
      <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: "50s" }}>
        {skills.map((skill, i) => {
          const angle = (i / skills.length) * 2 * Math.PI;
          const radius = dims / 2 - 10;
          const x = dims / 2 + radius * Math.cos(angle);
          const y = dims / 2 + radius * Math.sin(angle);
          return (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] md:text-xs
                         px-2.5 py-1 rounded-full border border-border bg-surface/80 text-ink-muted whitespace-nowrap backdrop-blur-sm"
              style={{ left: x, top: y }}
            >
              {skill}
            </motion.div>
          );
        })}
      </div>

      {/* connecting line + match badge */}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${dims} ${dims}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.line
          x1={dims * 0.28}
          y1={dims * 0.5}
          x2={dims * 0.72}
          y2={dims * 0.5}
          stroke="url(#matchGradient)"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-pulse-line"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <defs>
          <linearGradient id="matchGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C6FFF" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
      </svg>

      {/* candidate node */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute flex flex-col items-center gap-2"
        style={{ left: dims * 0.28, top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div
          className="rounded-full bg-surface-raised border border-signal/40 shadow-glow flex items-center justify-center font-display font-semibold text-ink"
          style={{ width: nodeR * 2, height: nodeR * 2 }}
        >
          C
        </div>
        <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wide">Candidate</span>
      </motion.div>

      {/* job node */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute flex flex-col items-center gap-2"
        style={{ left: dims * 0.72, top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div
          className="rounded-full bg-surface-raised border border-match/40 shadow-glow-teal flex items-center justify-center font-display font-semibold text-ink"
          style={{ width: nodeR * 2, height: nodeR * 2 }}
        >
          J
        </div>
        <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wide">Job</span>
      </motion.div>

      {/* match percentage badge, floating above the line */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute font-mono font-semibold text-sm md:text-base px-3 py-1 rounded-full
                   bg-base border border-match/50 text-match animate-float"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -220%)" }}
      >
        94% match
      </motion.div>
    </div>
  );
}
