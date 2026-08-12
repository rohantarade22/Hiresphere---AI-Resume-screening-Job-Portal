import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import JobCard from "../../components/jobs/JobCard";
import ScrollReveal from "../../components/ui/ScrollReveal";
import { jobsApi } from "../../api/client";

const jobTypes = [
  { value: "", label: "Any type" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const workModes = [
  { value: "", label: "Any location type" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const experienceLevels = [
  { value: "", label: "Any experience" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead / Principal" },
];

const initialFilters = { search: "", location: "", job_type: "", work_mode: "", experience_level: "" };

export default function JobSearchPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["jobs-search", filters],
    queryFn: ({ pageParam = 1 }) =>
      jobsApi
        .list({ ...cleanFilters(filters), page: pageParam })
        .then((r) => r.data),
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    initialPageParam: 1,
  });

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const jobs = data?.pages.flatMap((page) => page.results || page) || [];

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">Find your next role</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">Search jobs</h1>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Job title, skill, or company"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-secondary md:hidden flex items-center gap-2 px-4"
          >
            <FiSliders /> {activeFilterCount > 0 && <span className="font-mono text-xs">{activeFilterCount}</span>}
          </button>
        </div>
      </ScrollReveal>

      <div className="mt-8 grid md:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden md:block">
          <FilterPanel filters={filters} updateFilter={updateFilter} onReset={() => setFilters(initialFilters)} />
        </aside>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-base md:hidden overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-ink">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <FiX size={22} className="text-ink-muted" />
              </button>
            </div>
            <FilterPanel filters={filters} updateFilter={updateFilter} onReset={() => setFilters(initialFilters)} />
            <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full mt-6">
              Show results
            </button>
          </div>
        )}

        <div>
          {isLoading ? (
            <JobListSkeleton />
          ) : jobs.length === 0 ? (
            <div className="card flex flex-col items-center text-center py-16">
              <p className="font-medium text-ink">No jobs match your filters</p>
              <p className="text-sm text-ink-muted mt-1">Try widening your search or clearing filters.</p>
              <button onClick={() => setFilters(initialFilters)} className="btn-secondary mt-5 text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                {jobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i % 6} />
                ))}
              </div>
              <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-6">
                {isFetchingNextPage && <span className="text-xs text-ink-faint font-mono">Loading more…</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function cleanFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
}

function FilterPanel({ filters, updateFilter, onReset }) {
  return (
    <div className="space-y-6 sticky top-24">
      <FilterSelect label="Location" value={filters.location} onChange={(v) => updateFilter("location", v)} freeText />
      <FilterSelect label="Job type" value={filters.job_type} onChange={(v) => updateFilter("job_type", v)} options={jobTypes} />
      <FilterSelect label="Work mode" value={filters.work_mode} onChange={(v) => updateFilter("work_mode", v)} options={workModes} />
      <FilterSelect label="Experience" value={filters.experience_level} onChange={(v) => updateFilter("experience_level", v)} options={experienceLevels} />
      <button onClick={onReset} className="text-sm text-signal-glow hover:underline">
        Reset all filters
      </button>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, freeText }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wide text-ink-faint">{label}</label>
      {freeText ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City or 'Remote'"
          className="input-field mt-2 text-sm"
        />
      ) : (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field mt-2 text-sm">
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function JobListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface-raised" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-2/3 bg-surface-raised rounded" />
              <div className="h-3 w-1/3 bg-surface-raised rounded" />
            </div>
          </div>
          <div className="h-3 w-1/2 bg-surface-raised rounded" />
          <div className="h-3 w-full bg-surface-raised rounded" />
        </div>
      ))}
    </div>
  );
}
