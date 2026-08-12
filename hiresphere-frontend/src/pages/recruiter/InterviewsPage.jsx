import { useQuery } from "@tanstack/react-query";
import { FiCalendar, FiVideo, FiPhone, FiMapPin } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { interviewsApi } from "../../api/client";

const modeIcons = { video: FiVideo, phone: FiPhone, onsite: FiMapPin };

export default function InterviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-interviews"],
    queryFn: () => interviewsApi.asRecruiter().then((r) => r.data.results || r.data),
  });

  const interviews = data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Calendar</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Interviews</h1>
      </ScrollReveal>

      <div className="mt-8 space-y-4">
        {isLoading ? null : interviews.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-16">
            <FiCalendar className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No interviews scheduled</p>
            <p className="text-sm text-ink-muted mt-1">Schedule one from an applicant's pipeline card.</p>
          </div>
        ) : (
          interviews.map((interview, i) => {
            const ModeIcon = modeIcons[interview.mode] || FiCalendar;
            return (
              <ScrollReveal key={interview.id} delay={Math.min(i * 0.05, 0.3)}>
                <div className="card flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-signal/10 border border-signal/30 flex items-center justify-center text-signal-glow shrink-0">
                      <ModeIcon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{interview.application?.candidate?.full_name}</p>
                      <p className="text-sm text-ink-muted">{interview.application?.job?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink font-mono">
                      {new Date(interview.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="text-xs text-ink-faint capitalize mt-0.5">{interview.status}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })
        )}
      </div>
    </div>
  );
}
