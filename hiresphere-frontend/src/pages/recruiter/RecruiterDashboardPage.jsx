import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiUsers, FiUserCheck, FiPlus } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { useAuth } from "../../hooks/useAuth";
import { recruiterJobsApi } from "../../api/client";

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

const statusPillStyles = {
  draft: "bg-surface-raised text-ink-faint border-border",
  published: "bg-match/10 text-match border-match/30",
  closed: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function RecruiterDashboardPage() {
  const { user } = useAuth();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => recruiterJobsApi.mine().then((r) => r.data.results || r.data),
  });

  const jobList = jobs || [];
  const published = jobList.filter((j) => j.status === "published");
  const totalApplicants = jobList.reduce((sum, j) => sum + (j.applicants_count || 0), 0);
  const totalViews = jobList.reduce((sum, j) => sum + (j.views_count || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <ScrollReveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Recruiter dashboard</span>
            <h1 className="mt-2 text-3xl font-display font-semibold text-ink">
              Welcome back, {user?.full_name?.split(" ")[0]}
            </h1>
          </div>
          <Link to="/recruiter/jobs/new" className="btn-primary">
            <FiPlus /> Post a job
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard icon={FiBriefcase} label="Active job posts" value={published.length} accent="text-signal-glow bg-signal/10 border-signal/30" />
          <StatCard icon={FiUsers} label="Total applicants" value={totalApplicants} accent="text-match bg-match/10 border-match/30" />
          <StatCard icon={FiUserCheck} label="Total job views" value={totalViews} accent="text-spark bg-spark/10 border-spark/30" />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-semibold text-ink">Your job posts</h2>
          <Link to="/recruiter/jobs" className="text-sm text-signal-glow hover:underline flex items-center gap-1">
            Manage all <FiArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? null : jobList.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-16">
            <FiBriefcase className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No job posts yet</p>
            <p className="text-sm text-ink-muted mt-1">Create your first listing to start receiving applicants.</p>
            <Link to="/recruiter/jobs/new" className="btn-primary mt-5 text-sm">Post a job</Link>
          </div>
        ) : (
          <div className="card divide-y divide-border p-0 overflow-hidden">
            {jobList.slice(0, 6).map((job) => (
              <Link
                key={job.id}
                to={`/recruiter/jobs/${job.slug}/applicants`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-raised transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{job.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{job.applicants_count} applicants · {job.views_count} views</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-mono shrink-0 ${statusPillStyles[job.status]}`}>
                  {job.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
