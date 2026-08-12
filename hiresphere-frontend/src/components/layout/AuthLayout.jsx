import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-semibold text-lg text-ink mb-8">
          <span className="w-7 h-7 rounded-lg bg-signal-gradient flex items-center justify-center text-white text-sm">
            H
          </span>
          HireSphere AI
        </Link>

        <div className="card">
          <h1 className="text-2xl font-display font-semibold text-ink text-center">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-muted text-center">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}
