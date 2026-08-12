import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler,
} from "chart.js";
import { FiUsers, FiBriefcase, FiFileText, FiClock, FiArrowRight } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { adminApi } from "../../api/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const chartTextColor = "#9CA3C0";
const chartGridColor = "#262B4A";

const lineOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: chartTextColor, font: { family: "JetBrains Mono", size: 11 } }, grid: { display: false } },
    y: { ticks: { color: chartTextColor, font: { family: "JetBrains Mono", size: 11 } }, grid: { color: chartGridColor } },
  },
};

const barOptions = {
  ...lineOptions,
  indexAxis: "y",
};

function StatCard({ icon: Icon, label, value, accent, to }) {
  const Wrapper = to ? Link : "div";
  return (
    <Wrapper to={to} className="card flex items-center gap-4 hover:border-signal/40 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-ink font-mono">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </Wrapper>
  );
}

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const growthLabels = stats?.candidate_growth?.map((d) => d.month) || [];
  const growthData = {
    labels: growthLabels,
    datasets: [
      {
        label: "New candidates",
        data: stats?.candidate_growth?.map((d) => d.count) || [],
        borderColor: "#7C6FFF",
        backgroundColor: "rgba(124,111,255,0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#7C6FFF",
      },
    ],
  };

  const skillsData = {
    labels: stats?.top_skills?.map((s) => s.name) || [],
    datasets: [
      {
        label: "Jobs requiring this skill",
        data: stats?.top_skills?.map((s) => s.job_count) || [],
        backgroundColor: "#2DD4BF",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <ScrollReveal>
        <span className="eyebrow">Platform overview</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Admin dashboard</h1>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={FiUsers} label="Total users" value={stats?.total_users ?? "—"} accent="text-signal-glow bg-signal/10 border-signal/30" to="/admin/users" />
          <StatCard icon={FiBriefcase} label="Published jobs" value={stats?.published_jobs ?? "—"} accent="text-match bg-match/10 border-match/30" to="/admin/jobs" />
          <StatCard icon={FiFileText} label="Total applications" value={stats?.total_applications ?? "—"} accent="text-spark bg-spark/10 border-spark/30" />
          <StatCard icon={FiClock} label="Pending approvals" value={stats?.pending_recruiter_approvals ?? "—"} accent="text-red-400 bg-red-500/10 border-red-500/30" to="/admin/approvals" />
        </div>
      </ScrollReveal>

      {stats?.pending_recruiter_approvals > 0 && (
        <ScrollReveal delay={0.08}>
          <div className="card flex items-center justify-between bg-spark/5 border-spark/30">
            <p className="text-sm text-ink">
              <span className="font-semibold text-spark">{stats.pending_recruiter_approvals}</span> recruiter account(s) waiting for approval.
            </p>
            <Link to="/admin/approvals" className="btn-secondary text-sm flex items-center gap-1">
              Review <FiArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.1}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display font-semibold text-ink mb-4">Candidate growth (6 mo)</h2>
            {growthLabels.length > 0 ? (
              <Line data={growthData} options={lineOptions} height={220} />
            ) : (
              <p className="text-sm text-ink-faint py-16 text-center">Not enough data yet.</p>
            )}
          </div>
          <div className="card">
            <h2 className="font-display font-semibold text-ink mb-4">Top skills in demand</h2>
            {stats?.top_skills?.length > 0 ? (
              <Bar data={skillsData} options={barOptions} height={220} />
            ) : (
              <p className="text-sm text-ink-faint py-16 text-center">No job skill data yet.</p>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
