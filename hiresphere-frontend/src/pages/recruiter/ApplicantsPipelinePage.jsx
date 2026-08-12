import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail, FiFileText, FiCalendar, FiUsers, FiDownload } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { recruiterJobsApi, recruiterApplicantsApi, exportApi } from "../../api/client";

const pipeline = [
  { status: "applied", label: "Applied" },
  { status: "under_review", label: "Under Review" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "interview", label: "Interview" },
  { status: "offered", label: "Offered" },
  { status: "hired", label: "Hired" },
  { status: "rejected", label: "Rejected" },
];

const nextActions = {
  applied: [{ to: "under_review", label: "Move to review" }],
  under_review: [{ to: "shortlisted", label: "Shortlist" }, { to: "rejected", label: "Reject" }],
  shortlisted: [{ to: "interview", label: "Schedule interview" }, { to: "rejected", label: "Reject" }],
  interview: [{ to: "offered", label: "Extend offer" }, { to: "rejected", label: "Reject" }],
  offered: [{ to: "hired", label: "Mark hired" }, { to: "rejected", label: "Reject" }],
  hired: [],
  rejected: [],
  withdrawn: [],
};

export default function ApplicantsPipelinePage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);

  const { data: job } = useQuery({
    queryKey: ["job-edit", slug],
    queryFn: () => recruiterJobsApi.detail(slug).then((r) => r.data),
  });

  const { data: applicants, isLoading } = useQuery({
    queryKey: ["job-applicants", job?.id],
    queryFn: () => recruiterApplicantsApi.forJob(job.id).then((r) => r.data.results || r.data),
    enabled: Boolean(job?.id),
  });

  const list = applicants || [];

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await recruiterApplicantsApi.updateStatus(applicationId, { status: newStatus });
      toast.success("Applicant status updated");
      queryClient.invalidateQueries({ queryKey: ["job-applicants", job.id] });
    } catch {
      toast.error("Couldn't update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportApi.jobApplicantsCsv(job.id, job.title?.replace(/\s+/g, "_"));
    } catch {
      toast.error("Couldn't export applicants");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/recruiter/jobs" className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 mb-6">
        <FiArrowLeft /> Back to jobs
      </Link>

      <ScrollReveal>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Hiring pipeline</span>
            <h1 className="mt-2 text-3xl font-display font-semibold text-ink">{job?.title || "Applicants"}</h1>
            <p className="text-ink-muted mt-1">{list.length} total applicants</p>
          </div>
          {list.length > 0 && (
            <button onClick={handleExport} className="btn-secondary text-sm">
              <FiDownload /> Export CSV
            </button>
          )}
        </div>
      </ScrollReveal>

      {!isLoading && list.length === 0 ? (
        <div className="card flex flex-col items-center text-center py-16 mt-8">
          <FiUsers className="text-ink-faint mb-3" size={24} />
          <p className="font-medium text-ink">No applicants yet</p>
          <p className="text-sm text-ink-muted mt-1">Once candidates apply, they'll show up here in the pipeline.</p>
        </div>
      ) : (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {pipeline.map((column) => {
            const columnApplicants = list.filter((a) => a.status === column.status);
            return (
              <div key={column.status} className="min-w-[280px] w-[280px] shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-medium text-ink-muted">{column.label}</h3>
                  <span className="text-xs font-mono text-ink-faint">{columnApplicants.length}</span>
                </div>
                <div className="space-y-3">
                  {columnApplicants.map((app) => (
                    <ApplicantCard
                      key={app.id}
                      application={app}
                      onStatusChange={handleStatusChange}
                      isUpdating={updatingId === app.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplicantCard({ application, onStatusChange, isUpdating }) {
  const candidate = application.candidate;
  const actions = nextActions[application.status] || [];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-signal-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {candidate?.full_name?.[0] || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{candidate?.full_name}</p>
          {application.match_score != null && (
            <p className="text-xs font-mono text-match">{application.match_score}% match</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-ink-faint">
        <a href={`mailto:${candidate?.email}`} className="hover:text-ink-muted" aria-label="Email candidate">
          <FiMail size={14} />
        </a>
        {application.resume?.file && (
          <a href={application.resume.file} target="_blank" rel="noreferrer" className="hover:text-ink-muted" aria-label="View resume">
            <FiFileText size={14} />
          </a>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border">
          {actions.map((action) => (
            <button
              key={action.to}
              disabled={isUpdating}
              onClick={() => onStatusChange(application.id, action.to)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-ink-muted hover:border-signal/40 hover:text-signal-glow transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
