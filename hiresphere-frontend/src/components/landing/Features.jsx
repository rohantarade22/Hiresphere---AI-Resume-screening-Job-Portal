import { FiFileText, FiTarget, FiTrendingUp, FiZap, FiEye, FiBookOpen } from "react-icons/fi";
import ScrollReveal from "../ui/ScrollReveal";

const features = [
  {
    icon: FiFileText,
    title: "Resume parsing that actually reads",
    description: "We extract skills, experience, and education from any PDF resume in seconds — no manual data entry.",
    accent: "signal",
  },
  {
    icon: FiTarget,
    title: "Job-match scoring",
    description: "Every application gets a match percentage based on real skill and experience overlap, not keyword stuffing.",
    accent: "match",
  },
  {
    icon: FiTrendingUp,
    title: "Skill-gap analysis",
    description: "Candidates see exactly which skills separate them from their dream role, with courses to close the gap.",
    accent: "spark",
  },
  {
    icon: FiEye,
    title: "ATS compatibility check",
    description: "Know before you apply whether your resume will even survive the applicant tracking systems recruiters use.",
    accent: "signal",
  },
  {
    icon: FiZap,
    title: "Instant recruiter pipelines",
    description: "Shortlist, reject, and schedule interviews from one hiring pipeline — no spreadsheets, no lost applicants.",
    accent: "match",
  },
  {
    icon: FiBookOpen,
    title: "Recommended learning paths",
    description: "Missing a skill? We surface the exact course to fix it, ranked by how much it moves your match score.",
    accent: "spark",
  },
];

const accentClasses = {
  signal: "text-signal-glow bg-signal/10 border-signal/30",
  match: "text-match bg-match/10 border-match/30",
  spark: "text-spark bg-spark/10 border-spark/30",
};

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container-page">
        <ScrollReveal className="max-w-2xl">
          <span className="eyebrow">Under the hood</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold text-ink">
            Every feature exists to answer one question: <span className="text-signal-glow">is this a fit?</span>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.06}>
              <div className="card h-full hover:border-signal/40 transition-colors duration-300 group">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${accentClasses[feature.accent]}`}>
                  <feature.icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-ink text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
