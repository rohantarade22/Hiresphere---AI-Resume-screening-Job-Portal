import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiMapPin, FiClock, FiBookmark, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { jobsApi, applicationsApi, resumesApi } from "../../api/client";

export default function JobDetailPage() {
  const { slug } = useParams();
  const [applying, setApplying] = useState(false);

  const { data: job, isLoading, refetch } = useQuery({
    queryKey: ["job-detail", slug],
    queryFn: () => jobsApi.detail(slug).then((r) => r.data),
  });

  const { data: resumes } = useQuery({
    queryKey: ["resumes-mine"],
    queryFn: () => resumesApi.list().then((r) => r.data.results || r.data),
    enabled: !job?.has_applied,
  });

  const handleApply = async () => {
    const resumeList = resumes || [];
    if (resumeList.length === 0) {
      toast.error("Upload a resume before applying.");
      return;
    }
    setApplying(true);
    try {
      await applicationsApi.apply({ job: job.id, resume: resumeList[0].id });
      toast.success("Application submitted!");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit application.");
    } finally {
      setApplying(false);
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (job.is_saved) await jobsApi.unsave(job.id);
      else await jobsApi.save(job.id);
      refetch();
    } catch {
      toast.error("Couldn't update saved jobs");
    }
  };

  if (isLoading) return <div className="max-w-4xl mx-auto animate-pulse h-64 card" />;
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/candidate/jobs" className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 mb-6">
        <FiArrowLeft /> Back to search
      </Link>

      <ScrollReveal>
        <div className="card">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-display font-semibold text-xl text-ink">
                {job.company?.name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold text-ink">{job.title}</h1>
                <p className="text-ink-muted">{job.company?.name}</p>
              </div>
            </div>
            <button
              onClick={handleSaveToggle}
              className={`p-3 rounded-xl border transition-colors ${
                job.is_saved ? "border-signal/40 bg-signal/10 text-signal-glow" : "border-border text-ink-faint"
              }`}
              aria-label={job.is_saved ? "Unsave job" : "Save job"}
            >
              <FiBookmark fill={job.is_saved ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 text-sm text-ink-muted font-mono">
            {job.location && <span className="flex items-center gap-1.5"><FiMapPin size={14} /> {job.location}</span>}
            <span className="flex items-center gap-1.5 capitalize"><FiClock size={14} /> {job.work_mode}</span>
            {(job.salary_min || job.salary_max) && (
              <span className="text-match">
                {job.currency} {job.salary_min?.toLocaleString()}–{job.salary_max?.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-8">
            {job.has_applied ? (
              <div className="flex items-center gap-2 text-match font-medium">
                <FiCheckCircle /> You've applied to this role
              </div>
            ) : (
              <button onClick={handleApply} disabled={applying} className="btn-primary disabled:opacity-60">
                {applying ? "Submitting…" : "Apply now"}
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.08} className="mt-6 card">
        <h2 className="font-display font-semibold text-lg text-ink mb-3">About this role</h2>
        <p className="text-ink-muted whitespace-pre-line leading-relaxed">{job.description}</p>
      </ScrollReveal>

      {job.responsibilities && (
        <ScrollReveal delay={0.1} className="mt-6 card">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Responsibilities</h2>
          <p className="text-ink-muted whitespace-pre-line leading-relaxed">{job.responsibilities}</p>
        </ScrollReveal>
      )}

      {job.requirements && (
        <ScrollReveal delay={0.12} className="mt-6 card">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Requirements</h2>
          <p className="text-ink-muted whitespace-pre-line leading-relaxed">{job.requirements}</p>
        </ScrollReveal>
      )}

      {job.skills_required?.length > 0 && (
        <ScrollReveal delay={0.14} className="mt-6 card">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills_required.map((skill) => (
              <span key={skill.id} className="text-xs font-mono px-2.5 py-1 rounded-full bg-surface-raised text-ink-muted">
                {skill.name}
              </span>
            ))}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
