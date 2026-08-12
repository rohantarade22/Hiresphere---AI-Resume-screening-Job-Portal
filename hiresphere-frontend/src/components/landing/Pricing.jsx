import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import ScrollReveal from "../ui/ScrollReveal";

const plans = [
  {
    name: "Candidate",
    price: "Free",
    description: "Always free for job seekers.",
    features: ["Unlimited applications", "AI resume scoring", "Skill-gap analysis", "Job match recommendations"],
    cta: "Create free account",
    to: "/register/candidate",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    description: "For growing teams hiring regularly.",
    features: ["Up to 10 active job posts", "Full hiring pipeline", "Candidate comparison", "Analytics dashboard"],
    cta: "Start free trial",
    to: "/register/recruiter",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume hiring orgs.",
    features: ["Unlimited job posts", "SSO & permissions", "Dedicated support", "Custom integrations"],
    cta: "Talk to sales",
    to: "/register/recruiter",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-surface/30 border-y border-border">
      <div className="container-page">
        <ScrollReveal className="max-w-xl mx-auto text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold text-ink">
            Simple pricing, no surprises
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.08}>
              <div
                className={`rounded-2xl p-8 border h-full flex flex-col ${
                  plan.highlighted
                    ? "border-signal bg-surface-raised shadow-glow scale-[1.02]"
                    : "border-border bg-surface/60"
                }`}
              >
                {plan.highlighted && (
                  <span className="self-start mb-4 text-xs font-mono px-2.5 py-1 rounded-full bg-signal/20 text-signal-glow">
                    Most popular
                  </span>
                )}
                <h3 className="font-display font-semibold text-lg text-ink">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-semibold text-ink">{plan.price}</span>
                  {plan.period && <span className="text-ink-muted text-sm">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-ink-muted">{plan.description}</p>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                      <FiCheck className="text-match mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.to}
                  className={plan.highlighted ? "btn-primary mt-8 w-full" : "btn-secondary mt-8 w-full"}
                >
                  {plan.cta}
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
