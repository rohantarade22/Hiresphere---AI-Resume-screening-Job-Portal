import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";

const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "For Candidates", "For Recruiters"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "API Docs", "Status", "Guides"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 mt-24">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg text-ink">
              <span className="w-7 h-7 rounded-lg bg-signal-gradient flex items-center justify-center text-white text-sm">
                H
              </span>
              HireSphere AI
            </Link>
            <p className="mt-4 text-sm text-ink-muted max-w-xs">
              Smart hiring powered by artificial intelligence. Matching candidates and companies faster, with data instead of guesswork.
            </p>
            <div className="flex gap-4 mt-6 text-ink-muted">
              <a href="https://github.com/rohantarade22" aria-label="GitHub" className="hover:text-ink transition-colors"><FiGithub size={18} /></a>
              <a href="https://www.linkedin.com/in/rohantarade22/" aria-label="LinkedIn" className="hover:text-ink transition-colors"><FiLinkedin size={18} /></a>
              <a href="https://www.instagram.com/rohan_tarade2210/" aria-label="Twitter" className="hover:text-ink transition-colors"><FiTwitter size={18} /></a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-xs uppercase tracking-wide text-ink-muted mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ink-muted hover:text-ink transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} HireSphere AI. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-ink-faint">
            <a href="#" className="hover:text-ink-muted">Privacy</a>
            <a href="#" className="hover:text-ink-muted">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
