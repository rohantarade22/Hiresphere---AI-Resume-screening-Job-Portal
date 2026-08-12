import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { adminApi } from "../../api/client";

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "login", label: "Login" },
  { value: "register", label: "Register" },
  { value: "job_created", label: "Job created" },
  { value: "job_updated", label: "Job updated" },
  { value: "application_submitted", label: "Application submitted" },
  { value: "application_status_changed", label: "Application status changed" },
  { value: "resume_uploaded", label: "Resume uploaded" },
  { value: "interview_scheduled", label: "Interview scheduled" },
];

export default function SystemLogsPage() {
  const [action, setAction] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", action],
    queryFn: () => adminApi.logs(action ? { action } : {}).then((r) => r.data.results || r.data),
  });

  const logs = data || [];

  return (
    <div className="max-w-5xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Administration</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">System logs</h1>
        <p className="text-ink-muted mt-1">Full audit trail of platform activity.</p>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="input-field mt-6 max-w-xs text-sm">
          {actionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-6">
        <div className="card p-0 overflow-hidden max-h-[600px] overflow-y-auto">
          <div className="divide-y divide-border">
            {!isLoading && logs.length === 0 && (
              <p className="px-6 py-10 text-center text-ink-muted">No log entries found.</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-3.5 text-sm">
                <div className="min-w-0">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-raised text-signal-glow capitalize">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="ml-3 text-ink-muted truncate">{log.description}</span>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-ink-faint">{log.user_email || "system"}</p>
                  <p className="text-xs text-ink-faint font-mono">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
