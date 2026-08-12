import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import MatchConstellation from "../../components/landing/MatchConstellation";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-24 pb-20">
      <div className="container-page grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            Smart hiring, powered by AI
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-4xl md:text-6xl font-display font-semibold leading-[1.05] text-ink"
          >
            Stop guessing.
            <br />
            Start <span className="bg-signal-gradient bg-clip-text text-transparent">matching.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-ink-muted max-w-md"
          >
            HireSphere AI reads every resume and every job post the way a great recruiter would —
            then tells you exactly how well they fit, before anyone sends a single email.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link to="/register/candidate" className="btn-primary">
              Find your next role <FiArrowRight />
            </Link>
            <Link to="/register/recruiter" className="btn-secondary">
              Hire with HireSphere
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-xs text-ink-faint font-mono uppercase tracking-wide"
          >
            <span>No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-ink-faint" />
            <span>Free for candidates</span>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <MatchConstellation size="large" />
        </div>
      </div>
    </section>
  );
}
