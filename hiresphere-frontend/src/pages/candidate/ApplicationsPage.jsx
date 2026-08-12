import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiFileText, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { applicationsApi } from "../../api/client";

const tabs = [
  { value: "", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "In review" },
  { value: "interview", label: "Interview" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

const statusStyles = {
  applied: "bg-surface-raised text-ink-muted border-border",
  under_review: "bg-spark/10 text-spark border-spark/30",
  shortlisted: "bg-signal/10 text-signal-glow border-signal/30",
  interview: "bg-signal/10 text-signal-glow border-signal/30",
  offered: "bg-match/10 text-match border-match/30",
  hired: "bg-match/10 text-match border-match/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  withdrawn: "bg-surface-raised text-ink-faint border-border",
};

export default function ApplicationsPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["applications-mine", status],
    queryFn: () => applicationsApi.mine(status ? { status } : {}).then((r) => r.data.results || r.data),
  });

  const applications = data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Track applications</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Your applications</h1>
      </ScrollReveal>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
              status === tab.value
                ? "bg-signal/15 text-signal-glow border-signal/30"
                : "border-border text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? null : applications.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-16">
            <FiFileText className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No applications here yet</p>
            <p className="text-sm text-ink-muted mt-1">Once you apply to a role, its status timeline shows up here.</p>
            <Link to="/candidate/jobs" className="btn-secondary mt-5 text-sm">Find jobs</Link>
          </div>
        ) : (
          applications.map((app, i) => (
            <ScrollReveal key={app.id} delay={Math.min(i * 0.04, 0.3)}>
              <div className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-ink">{app.job?.title}</h3>
                    <p className="text-sm text-ink-muted">{app.job?.company?.name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-mono shrink-0 ${statusStyles[app.status] || statusStyles.applied}`}>
                    {app.status?.replace("_", " ")}
                  </span>
                </div>

                {app.status_history?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {app.status_history.map((h) => (
                        <div key={h.id} className="text-xs text-ink-faint font-mono">
                          <span className="text-ink-muted capitalize">{h.status.replace("_", " ")}</span>
                          {" — "}
                          {new Date(h.created_at).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to={`/candidate/jobs/${app.job?.slug}`}
                  className="text-xs text-signal-glow hover:underline flex items-center gap-1 mt-4 w-fit"
                >
                  View job <FiExternalLink size={12} />
                </Link>
              </div>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
}
