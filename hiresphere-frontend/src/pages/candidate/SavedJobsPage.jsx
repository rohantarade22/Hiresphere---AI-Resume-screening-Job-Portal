import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBookmark } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import JobCard from "../../components/jobs/JobCard";
import { jobsApi } from "../../api/client";
import { Link } from "react-router-dom";

export default function SavedJobsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => jobsApi.saved().then((r) => r.data.results || r.data),
  });

  const saved = data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Bookmarks</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Saved jobs</h1>
      </ScrollReveal>

      <div className="mt-8">
        {isLoading ? null : saved.length === 0 ? (
          <div className="card flex flex-col items-center text-center py-16">
            <FiBookmark className="text-ink-faint mb-3" size={24} />
            <p className="font-medium text-ink">No saved jobs yet</p>
            <p className="text-sm text-ink-muted mt-1">Bookmark roles while browsing to keep track of them here.</p>
            <Link to="/candidate/jobs" className="btn-secondary mt-5 text-sm">Browse jobs</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map((item, i) => (
              <JobCard
                key={item.id}
                job={item.job}
                index={i}
                onToggleSave={() => queryClient.invalidateQueries({ queryKey: ["saved-jobs"] })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
