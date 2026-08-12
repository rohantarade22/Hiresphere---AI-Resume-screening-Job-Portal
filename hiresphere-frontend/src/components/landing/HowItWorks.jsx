import ScrollReveal from "../ui/ScrollReveal";

const steps = [
  {
    n: "01",
    title: "Upload your resume",
    description: "Drop in a PDF. Our parser extracts your skills, experience, and education in seconds.",
  },
  {
    n: "02",
    title: "Get your match scores",
    description: "See a resume strength score, ATS compatibility, and match percentage against live job posts.",
  },
  {
    n: "03",
    title: "Apply with confidence",
    description: "Apply to roles you're actually a fit for, and track every application on one timeline.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface/30 border-y border-border">
      <div className="container-page">
        <ScrollReveal className="max-w-xl mx-auto text-center">
          <span className="eyebrow">The process</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold text-ink">How it works</h2>
        </ScrollReveal>

        <div className="mt-16 grid md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-border" />
          {steps.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 0.1}>
              <div className="relative text-center md:text-left">
                <span className="font-mono text-sm text-signal-glow">{step.n}</span>
                <h3 className="mt-3 font-display font-semibold text-xl text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
