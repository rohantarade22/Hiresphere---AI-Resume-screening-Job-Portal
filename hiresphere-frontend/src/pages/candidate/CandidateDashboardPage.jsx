import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFileText, FiTarget, FiBookmark } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import ProfileCompletionRing from "../../components/dashboard/ProfileCompletionRing";
import JobCard from "../../components/jobs/JobCard";
import { useAuth } from "../../hooks/useAuth";
import { candidateApi, jobsApi, applicationsApi } from "../../api/client";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-ink font-mono">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

export default function CandidateDashboardPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: () => candidateApi.profile().then((r) => r.data),
  });

  const { data: recommended } = useQuery({
    queryKey: ["recommended-jobs"],
    queryFn: () => jobsApi.recommended().then((r) => r.data),
  });

  const { data: applications } = useQuery({
    queryKey: ["applications-mine", "recent"],
    queryFn: () => applicationsApi.mine().then((r) => r.data),
  });

  const applicationList = applications?.results || applications || [];
  const recommendedList = recommended?.results || recommended || [];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <ScrollReveal>
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="mt-2 text-3xl font-display font-semibold text-ink">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="grid md:grid-cols-4 gap-5">
          <div className="card flex items-center gap-5 md:col-span-1">
            <ProfileCompletionRing percent={profile?.profile_completion ?? 0} />
            <div>
              <p className="text-sm font-medium text-ink">Profile strength</p>
              <Link to="/candidate/profile" className="text-xs text-signal-glow hover:underline flex items-center gap-1 mt-1">
                Complete it <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
          <StatCard
            icon={FiFileText}
            label="Applications sent"
            value={applicationList.length}
            accent="text-signal-glow bg-signal/10 border-signal/30"
          />
          <StatCard
            icon={FiTarget}
            label="Recommended matches"
            value={recommendedList.length}
            accent="text-match bg-match/10 border-match/30"
          />
          <StatCard
            icon={FiBookmark}
            label="Saved jobs"
            value={profile?.saved_jobs_count ?? "—"}
            accent="text-spark bg-spark/10 border-spark/30"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-semibold text-ink">Recommended for you</h2>
          <Link to="/candidate/jobs" className="text-sm text-signal-glow hover:underline flex items-center gap-1">
            Browse all jobs <FiArrowRight size={14} />
          </Link>
        </div>
        {recommendedList.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Add skills to your profile and we'll surface roles that actually fit."
            actionLabel="Update profile"
            actionTo="/candidate/profile"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedList.slice(0, 6).map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        )}
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-semibold text-ink">Recent applications</h2>
          <Link to="/candidate/applications" className="text-sm text-signal-glow hover:underline flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {applicationList.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Once you apply to a role, you'll be able to track its status here."
            actionLabel="Find jobs"
            actionTo="/candidate/jobs"
          />
        ) : (
          <div className="card divide-y divide-border p-0 overflow-hidden">
            {applicationList.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{app.job?.title}</p>
                  <p className="text-xs text-ink-muted truncate">{app.job?.company?.name}</p>
                </div>
                <StatusPill status={app.status} />
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}

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

function StatusPill({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-mono ${statusStyles[status] || statusStyles.applied}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="card flex flex-col items-center text-center py-14">
      <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4">
        <FiTarget className="text-ink-faint" size={20} />
      </div>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-sm text-ink-muted mt-1 max-w-xs">{description}</p>
      <Link to={actionTo} className="btn-secondary mt-5 text-sm">{actionLabel}</Link>
    </div>
  );
}
