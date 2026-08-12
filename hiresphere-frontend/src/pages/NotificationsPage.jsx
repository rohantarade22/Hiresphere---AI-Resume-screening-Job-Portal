import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiBell, FiCheckCircle, FiCalendar, FiUsers, FiTarget, FiSettings } from "react-icons/fi";
import ScrollReveal from "../components/ui/ScrollReveal";
import { notificationsApi } from "../api/client";

const typeIcons = {
  application_update: FiCheckCircle,
  interview_scheduled: FiCalendar,
  interview_reminder: FiCalendar,
  new_applicant: FiUsers,
  job_recommendation: FiTarget,
  system: FiSettings,
};

const typeAccents = {
  application_update: "text-match bg-match/10 border-match/30",
  interview_scheduled: "text-signal-glow bg-signal/10 border-signal/30",
  interview_reminder: "text-spark bg-spark/10 border-spark/30",
  new_applicant: "text-signal-glow bg-signal/10 border-signal/30",
  job_recommendation: "text-match bg-match/10 border-match/30",
  system: "text-ink-muted bg-surface-raised border-border",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data.results || r.data),
  });

  const notifications = data || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      /* silent — not critical if a single mark-read fails */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      /* silent */
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <ScrollReveal>
          <span className="eyebrow">Stay in the loop</span>
          <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Notifications</h1>
        </ScrollReveal>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {!isLoading && notifications.length === 0 && (
          <div className="card flex flex-col items-center text-center py-16">
            <FiBell className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No notifications yet</p>
            <p className="text-sm text-ink-muted mt-1">Application updates and interview reminders will show up here.</p>
          </div>
        )}

        {notifications.map((n, i) => {
          const Icon = typeIcons[n.type] || FiBell;
          const Wrapper = n.link ? Link : "div";
          return (
            <ScrollReveal key={n.id} delay={Math.min(i * 0.03, 0.3)}>
              <Wrapper
                to={n.link || undefined}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`card flex items-start gap-4 transition-colors ${
                  n.link ? "hover:border-signal/40 cursor-pointer" : ""
                } ${!n.is_read ? "border-signal/30 bg-signal/5" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeAccents[n.type] || typeAccents.system}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${!n.is_read ? "text-ink font-medium" : "text-ink-muted"}`}>{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-ink-muted mt-0.5">{n.message}</p>
                  <p className="text-xs text-ink-faint mt-2 font-mono">{timeAgo(n.created_at)}</p>
                </div>
              </Wrapper>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
