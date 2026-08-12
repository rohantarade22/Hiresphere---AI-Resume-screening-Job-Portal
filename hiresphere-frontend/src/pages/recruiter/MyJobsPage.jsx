import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSend, FiBriefcase, FiUsers } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { recruiterJobsApi } from "../../api/client";

const statusPillStyles = {
  draft: "bg-surface-raised text-ink-faint border-border",
  published: "bg-match/10 text-match border-match/30",
  closed: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function MyJobsPage() {
  const queryClient = useQueryClient();
  const [deletingSlug, setDeletingSlug] = useState(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => recruiterJobsApi.mine().then((r) => r.data.results || r.data),
  });

  const jobList = jobs || [];

  const handlePublish = async (slug) => {
    try {
      await recruiterJobsApi.publish(slug);
      toast.success("Job published");
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    } catch {
      toast.error("Couldn't publish job");
    }
  };

  const handleDelete = async (slug) => {
    setDeletingSlug(slug);
    try {
      await recruiterJobsApi.remove(slug);
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
    } catch {
      toast.error("Couldn't delete job");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Job management</span>
            <h1 className="mt-2 text-3xl font-display font-semibold text-ink">My jobs</h1>
          </div>
          <Link to="/recruiter/jobs/new" className="btn-primary">
            <FiPlus /> Post a job
          </Link>
        </div>
      </ScrollReveal>

      <div className="mt-8 space-y-4">
        {isLoading ? null : jobList.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-16">
            <FiBriefcase className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No job posts yet</p>
            <p className="text-sm text-ink-muted mt-1">Create your first listing to start receiving applicants.</p>
            <Link to="/recruiter/jobs/new" className="btn-primary mt-5 text-sm">Post a job</Link>
          </div>
        ) : (
          jobList.map((job, i) => (
            <ScrollReveal key={job.id} delay={Math.min(i * 0.04, 0.3)}>
              <div className="card flex items-center justify-between flex-wrap gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-ink truncate">{job.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-mono shrink-0 ${statusPillStyles[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mt-1 flex items-center gap-1.5">
                    <FiUsers size={13} /> {job.applicants_count} applicants · {job.views_count} views
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {job.status === "draft" && (
                    <button onClick={() => handlePublish(job.slug)} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
                      <FiSend size={14} /> Publish
                    </button>
                  )}
                  <Link to={`/recruiter/jobs/${job.slug}/applicants`} className="btn-secondary text-xs px-3 py-2">
                    Applicants
                  </Link>
                  <Link to={`/recruiter/jobs/${job.slug}/edit`} className="p-2 rounded-lg border border-border text-ink-muted hover:text-ink" aria-label="Edit job">
                    <FiEdit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(job.slug)}
                    disabled={deletingSlug === job.slug}
                    className="p-2 rounded-lg border border-border text-ink-faint hover:text-red-400 disabled:opacity-50"
                    aria-label="Delete job"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
}
