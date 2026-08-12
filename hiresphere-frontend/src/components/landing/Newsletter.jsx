import { useState } from "react";
import toast from "react-hot-toast";
import ScrollReveal from "../ui/ScrollReveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're subscribed. Watch your inbox.");
    setEmail("");
  };

  return (
    <section className="py-20">
      <div className="container-page">
        <ScrollReveal>
          <div className="card bg-signal-gradient/10 border-signal/30 flex flex-col md:flex-row items-center justify-between gap-6 p-10">
            <div>
              <h3 className="font-display font-semibold text-xl text-ink">Get hiring insights in your inbox</h3>
              <p className="mt-1 text-sm text-ink-muted">One email a month. Market data, no spam.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-field md:w-64"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
