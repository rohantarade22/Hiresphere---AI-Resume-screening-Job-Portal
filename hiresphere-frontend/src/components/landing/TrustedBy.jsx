import ScrollReveal from "../ui/ScrollReveal";

const companies = ["Nimbus Cloud", "Fintra", "PixelForge", "Vantage Labs", "Northwind", "Cobalt"];

export default function TrustedBy() {
  return (
    <section className="py-14 border-y border-border bg-surface/30">
      <div className="container-page">
        <ScrollReveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-faint mb-8">
            Trusted by hiring teams at
          </p>
        </ScrollReveal>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          {companies.map((name, i) => (
            <ScrollReveal key={name} delay={i * 0.05}>
              <span className="font-display text-lg text-ink-faint hover:text-ink-muted transition-colors">
                {name}
              </span>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
