import ScrollReveal from "../ui/ScrollReveal";

const testimonials = [
  {
    quote: "We cut our time-to-shortlist from two weeks to two days. The match scores are eerily accurate.",
    name: "Priya Anand",
    role: "Head of Talent, Nimbus Cloud",
  },
  {
    quote: "I finally understood why my resume wasn't landing interviews — the skill-gap breakdown fixed it in a weekend.",
    name: "Marcus Webb",
    role: "Frontend Engineer",
  },
  {
    quote: "The hiring pipeline view alone replaced three spreadsheets and a Slack channel.",
    name: "Elena Fischer",
    role: "Recruiter, Fintra",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="container-page">
        <ScrollReveal className="max-w-xl">
          <span className="eyebrow">Word on the street</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold text-ink">
            Hiring teams and candidates, both happier
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.08}>
              <div className="card h-full flex flex-col justify-between">
                <p className="text-ink-muted leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
