import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { recruiterAnalyticsApi } from "../../api/client";

const funnelStages = [
  { key: "applied", label: "Applied", color: "#7C6FFF" },
  { key: "shortlisted", label: "Shortlisted", color: "#A79CFF" },
  { key: "interview", label: "Interview", color: "#2DD4BF" },
  { key: "hired", label: "Hired", color: "#1FA895" },
];

const chartTooltipStyle = {
  background: "#1B1F38",
  border: "1px solid #262B4A",
  borderRadius: 8,
  color: "#F5F6FA",
  fontSize: 12,
};

export default function AnalyticsPage() {
  const { data: stats } = useQuery({
    queryKey: ["recruiter-analytics"],
    queryFn: () => recruiterAnalyticsApi.stats().then((r) => r.data),
  });

  const applicantsByJob = useMemo(
    () =>
      (stats?.top_jobs || []).map((j) => ({
        name: j.title.length > 18 ? j.title.slice(0, 18) + "…" : j.title,
        applicants: j.applicants_count,
      })),
    [stats]
  );

  // Real per-status counts from the backend's hiring_funnel aggregation —
  // no more client-side estimation.
  const funnelData = useMemo(() => {
    const funnel = stats?.hiring_funnel || {};
    return funnelStages.map((stage) => ({ ...stage, value: funnel[stage.key] || 0 }));
  }, [stats]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <ScrollReveal>
        <span className="eyebrow">Insights</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Analytics</h1>
      </ScrollReveal>

      <div className="grid lg:grid-cols-2 gap-6">
        <ScrollReveal delay={0.05}>
          <div className="card">
            <h2 className="font-display font-semibold text-ink mb-1">Applicants by job</h2>
            <p className="text-xs text-ink-muted mb-6">Your top listings by applicant volume</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={applicantsByJob} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B4A" horizontal={false} />
                <XAxis type="number" stroke="#5B6284" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#5B6284" fontSize={11} width={120} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(124,111,255,0.08)" }} />
                <Bar dataKey="applicants" fill="#7C6FFF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card">
            <h2 className="font-display font-semibold text-ink mb-1">Hiring funnel</h2>
            <p className="text-xs text-ink-muted mb-6">From applied to hired, across all jobs</p>
            <ResponsiveContainer width="100%" height={280}>
              <FunnelChart>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" dataKey="label" fill="#9CA3C0" fontSize={12} />
                  {funnelData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
