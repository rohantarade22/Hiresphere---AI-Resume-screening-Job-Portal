import ScrollReveal from "../ui/ScrollReveal";
import CountUp from "../ui/CountUp";

const stats = [
  { value: 48000, suffix: "+", label: "Candidates matched" },
  { value: 3200, suffix: "+", label: "Companies hiring" },
  { value: 94, suffix: "%", label: "Average match accuracy" },
  { value: 11, suffix: " days", label: "Median time to hire" },
];

export default function Stats() {
  return (
    <section className="py-20">
      <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} delay={i * 0.08}>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-display font-semibold text-ink">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-ink-muted">{stat.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
