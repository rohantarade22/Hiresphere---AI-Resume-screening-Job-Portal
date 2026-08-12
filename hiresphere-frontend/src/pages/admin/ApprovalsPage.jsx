import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiCheckSquare, FiCheck, FiX } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { adminApi } from "../../api/client";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pending-recruiters"],
    queryFn: () => adminApi.pendingRecruiters().then((r) => r.data.results || r.data),
  });

  const pending = data || [];

  const handleApprove = async (id) => {
    try {
      await adminApi.approveRecruiter(id);
      toast.success("Recruiter approved");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-recruiters"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch {
      toast.error("Couldn't approve recruiter");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.rejectRecruiter(id);
      toast.success("Recruiter rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-recruiters"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch {
      toast.error("Couldn't reject recruiter");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Administration</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Recruiter approvals</h1>
        <p className="text-ink-muted mt-1">New recruiter accounts wait here until an admin approves them.</p>
      </ScrollReveal>

      <div className="mt-8 space-y-4">
        {!isLoading && pending.length === 0 && (
          <div className="card flex flex-col items-center text-center py-16">
            <FiCheckSquare className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">All caught up</p>
            <p className="text-sm text-ink-muted mt-1">No pending recruiter approvals right now.</p>
          </div>
        )}

        {pending.map((recruiter, i) => (
          <ScrollReveal key={recruiter.id} delay={Math.min(i * 0.05, 0.3)}>
            <div className="card flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-signal-gradient flex items-center justify-center text-white font-semibold shrink-0">
                  {recruiter.full_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-ink">{recruiter.full_name}</p>
                  <p className="text-sm text-ink-muted">{recruiter.email}</p>
                  {recruiter.company_name && (
                    <p className="text-xs text-ink-faint mt-0.5">{recruiter.company_name}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(recruiter.id)}
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-match/10 text-match border border-match/30 hover:bg-match/20 transition-colors"
                >
                  <FiCheck size={14} /> Approve
                </button>
                <button
                  onClick={() => handleReject(recruiter.id)}
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  <FiX size={14} /> Reject
                </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
