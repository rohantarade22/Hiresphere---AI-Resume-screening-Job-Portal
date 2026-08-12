import { Link } from "react-router-dom";
import { FiMapPin, FiBookmark, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import ScrollReveal from "../ui/ScrollReveal";
import { jobsApi } from "../../api/client";

const workModeLabels = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = (n) => `${Math.round(n / 1000)}k`;
  if (job.salary_min && job.salary_max) return `${job.currency} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  return `${job.currency} ${fmt(job.salary_min || job.salary_max)}+`;
}

export default function JobCard({ job, onToggleSave, index = 0 }) {
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (job.is_saved) {
        await jobsApi.unsave(job.id);
        toast.success("Removed from saved jobs");
      } else {
        await jobsApi.save(job.id);
        toast.success("Saved");
      }
      onToggleSave?.(job.id);
    } catch {
      toast.error("Couldn't update saved jobs");
    }
  };

  const salary = formatSalary(job);

  return (
    <ScrollReveal delay={Math.min(index * 0.04, 0.3)}>
      <Link
        to={`/candidate/jobs/${job.slug}`}
        className="card flex flex-col gap-4 hover:border-signal/40 transition-colors duration-300 group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-display font-semibold text-ink shrink-0">
              {job.company?.name?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-ink truncate group-hover:text-signal-glow transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-ink-muted truncate">{job.company?.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`shrink-0 p-2 rounded-lg border transition-colors ${
              job.is_saved
                ? "border-signal/40 bg-signal/10 text-signal-glow"
                : "border-border text-ink-faint hover:text-ink-muted"
            }`}
            aria-label={job.is_saved ? "Unsave job" : "Save job"}
          >
            <FiBookmark size={16} fill={job.is_saved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted font-mono">
          {job.location && (
            <span className="flex items-center gap-1"><FiMapPin size={12} /> {job.location}</span>
          )}
          <span className="flex items-center gap-1">
            <FiClock size={12} /> {workModeLabels[job.work_mode] || job.work_mode}
          </span>
          {salary && <span className="text-match">{salary}</span>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs px-2.5 py-1 rounded-full bg-surface-raised text-ink-muted capitalize">
            {job.experience_level} level
          </span>
          <span className="text-xs text-ink-faint">{job.applicants_count} applicants</span>
        </div>
      </Link>
    </ScrollReveal>
  );
}
