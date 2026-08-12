import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiSearch, FiEyeOff, FiDownload } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { adminApi, exportApi } from "../../api/client";

const statusStyles = {
  draft: "bg-surface-raised text-ink-faint border-border",
  published: "bg-match/10 text-match border-match/30",
  closed: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function ManageJobsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs", search],
    queryFn: () => adminApi.jobs(search ? { search } : {}).then((r) => r.data.results || r.data),
  });

  const jobs = data || [];

  const handleUnpublish = async (id) => {
    try {
      await adminApi.unpublishJob(id);
      toast.success("Job unpublished");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch {
      toast.error("Couldn't unpublish job");
    }
  };

  const handleExport = async () => {
    try {
      await exportApi.adminJobsCsv();
    } catch {
      toast.error("Couldn't export jobs");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Administration</span>
            <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Manage jobs</h1>
          </div>
          <button onClick={handleExport} className="btn-secondary text-sm">
            <FiDownload /> Export CSV
          </button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="relative mt-6 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search by title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-6">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-faint font-mono text-xs uppercase">
                  <th className="px-6 py-3">Job</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Applicants</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!isLoading && jobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">No jobs found.</td>
                  </tr>
                )}
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4 text-ink font-medium">{job.title}</td>
                    <td className="px-6 py-4 text-ink-muted">{job.company_name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-mono ${statusStyles[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-faint font-mono text-xs">{job.applicants_count}</td>
                    <td className="px-6 py-4 text-right">
                      {job.status === "published" && (
                        <button
                          onClick={() => handleUnpublish(job.id)}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-ink-muted hover:border-red-400/40 hover:text-red-400 transition-colors"
                        >
                          <FiEyeOff size={13} /> Unpublish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
