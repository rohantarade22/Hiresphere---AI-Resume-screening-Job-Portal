import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiSearch, FiUserX, FiUserCheck, FiDownload } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { adminApi, exportApi } from "../../api/client";

const roleTabs = [
  { value: "", label: "All" },
  { value: "candidate", label: "Candidates" },
  { value: "recruiter", label: "Recruiters" },
  { value: "admin", label: "Admins" },
];

export default function ManageUsersPage() {
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", role, search],
    queryFn: () =>
      adminApi.users({ ...(role && { role }), ...(search && { search }) }).then((r) => r.data.results || r.data),
  });

  const users = data || [];

  const toggleActive = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      toast.success(user.is_active ? "User deactivated" : "User reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Couldn't update user");
    }
  };

  const handleExport = async () => {
    try {
      await exportApi.adminUsersCsv();
    } catch {
      toast.error("Couldn't export users");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Administration</span>
            <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Manage users</h1>
          </div>
          <button onClick={handleExport} className="btn-secondary text-sm">
            <FiDownload /> Export CSV
          </button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRole(tab.value)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  role === tab.value ? "bg-signal/15 text-signal-glow border-signal/30" : "border-border text-ink-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="mt-6">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-ink-faint font-mono text-xs uppercase">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">No users found.</td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-ink font-medium">{user.full_name}</p>
                      <p className="text-xs text-ink-faint">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-ink-muted">{user.role}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                        user.is_active ? "bg-match/10 text-match border-match/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {user.is_active ? "active" : "deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-faint text-xs font-mono">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleActive(user)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-ink-muted hover:border-signal/40 hover:text-signal-glow transition-colors"
                      >
                        {user.is_active ? <><FiUserX size={13} /> Deactivate</> : <><FiUserCheck size={13} /> Reactivate</>}
                      </button>
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
