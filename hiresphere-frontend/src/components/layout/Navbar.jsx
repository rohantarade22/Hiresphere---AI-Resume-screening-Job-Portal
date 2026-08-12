import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base/80 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-ink">
          <span className="w-7 h-7 rounded-lg bg-signal-gradient flex items-center justify-center text-white text-sm">
            H
          </span>
          HireSphere <span className="text-signal-glow">AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <NavLink to="/dashboard" className="btn-secondary text-sm px-4 py-2">
              Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className="text-sm text-ink-muted hover:text-ink transition-colors px-3 py-2">
                Log in
              </NavLink>
              <NavLink to="/register/candidate" className="btn-primary text-sm px-4 py-2">
                Get started
              </NavLink>
            </>
          )}
        </div>

        <button
          className="md:hidden text-ink text-2xl"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-border bg-base"
          >
            <div className="container-page py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-ink-muted" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t border-border">
                <NavLink to="/login" className="text-ink-muted" onClick={() => setMobileOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/register/candidate" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                  Get started
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
