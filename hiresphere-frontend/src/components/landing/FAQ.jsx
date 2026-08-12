import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import ScrollReveal from "../ui/ScrollReveal";

const faqs = [
  {
    q: "Is HireSphere AI really free for candidates?",
    a: "Yes — creating a profile, uploading resumes, getting AI feedback, and applying to jobs is free for candidates, permanently.",
  },
  {
    q: "How does the AI match score actually work?",
    a: "We compare the skills, experience level, and requirements extracted from your resume against each job's parsed requirements, and weight the overlap into a single percentage.",
  },
  {
    q: "Can I cancel my recruiter plan anytime?",
    a: "Yes, monthly plans can be cancelled anytime from your billing settings with no penalty.",
  },
  {
    q: "Do you support applicant tracking system (ATS) exports?",
    a: "You can export applicant data as CSV or PDF at any point in the hiring pipeline.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-24">
      <div className="container-page max-w-3xl">
        <ScrollReveal>
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold text-ink">Questions, answered</h2>
        </ScrollReveal>

        <div className="mt-10 divide-y divide-border border-t border-b border-border">
          {faqs.map((item, i) => (
            <div key={item.q}>
              <button
                className="w-full flex items-center justify-between py-5 text-left"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span className="font-medium text-ink">{item.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-signal-glow shrink-0 ml-4">
                  <FiPlus size={18} />
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-ink-muted leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
