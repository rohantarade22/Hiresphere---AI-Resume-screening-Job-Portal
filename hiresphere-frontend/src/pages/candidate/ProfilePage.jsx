import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiUpload, FiFile, FiTrash2 } from "react-icons/fi";
import ScrollReveal from "../../components/ui/ScrollReveal";
import FormField from "../../components/ui/FormField";
import ProfileCompletionRing from "../../components/dashboard/ProfileCompletionRing";
import { candidateApi, resumesApi } from "../../api/client";

function ScoreMeter({ label, value, accent = "signal" }) {
  const colorClass = accent === "match" ? "text-match" : "text-signal-glow";
  const barClass = accent === "match" ? "bg-match" : "bg-signal";
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className={`text-xs font-mono font-semibold ${colorClass}`}>{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: () => candidateApi.profile().then((r) => r.data),
  });

  const { data: resumes } = useQuery({
    queryKey: ["resumes-mine"],
    queryFn: () => resumesApi.list().then((r) => r.data.results || r.data),
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: profile
      ? {
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          portfolio_url: profile.portfolio_url,
          years_of_experience: profile.years_of_experience,
        }
      : undefined,
  });

  const onSubmit = async (data) => {
    try {
      await candidateApi.updateProfile(data);
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    } catch {
      toast.error("Couldn't save profile");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF resumes are accepted");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      await resumesApi.upload(formData);
      toast.success("Resume uploaded — AI analysis in progress");
      queryClient.invalidateQueries({ queryKey: ["resumes-mine"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await resumesApi.remove(id);
      queryClient.invalidateQueries({ queryKey: ["resumes-mine"] });
      toast.success("Resume removed");
    } catch {
      toast.error("Couldn't remove resume");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ScrollReveal>
        <div className="flex items-center gap-5">
          <ProfileCompletionRing percent={profile?.profile_completion ?? 0} size={72} />
          <div>
            <span className="eyebrow">Your profile</span>
            <h1 className="mt-1 text-2xl font-display font-semibold text-ink">Edit profile</h1>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Resume</h2>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-signal/40 transition-colors">
            <FiUpload className="text-signal-glow" size={22} />
            <span className="text-sm text-ink-muted">{uploading ? "Uploading…" : "Drag & drop or click to upload PDF"}</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {resumes?.length > 0 && (
            <div className="mt-4 space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="rounded-xl bg-surface-raised border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FiFile className="text-ink-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{resume.original_filename || "resume.pdf"}</p>
                        <p className="text-xs text-ink-faint capitalize">{resume.parse_status}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteResume(resume.id)} className="text-ink-faint hover:text-red-400 shrink-0" aria-label="Delete resume">
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {resume.parse_status === "completed" && (
                    <div className="px-4 pb-4 pt-1 border-t border-border">
                      <div className="flex gap-6 mt-3">
                        <ScoreMeter label="Resume score" value={resume.resume_score} />
                        <ScoreMeter label="ATS score" value={resume.ats_score} accent="match" />
                      </div>
                      {resume.ai_feedback && (
                        <p className="text-xs text-ink-muted mt-3 leading-relaxed">{resume.ai_feedback}</p>
                      )}
                      {resume.missing_keywords?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-1.5">Missing skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {resume.missing_keywords.slice(0, 6).map((kw) => (
                              <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-spark/10 text-spark border border-spark/30">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {resume.recommended_courses?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-mono uppercase tracking-wide text-ink-faint mb-1.5">Recommended courses</p>
                          <ul className="space-y-1">
                            {resume.recommended_courses.slice(0, 3).map((rec) => (
                              <li key={rec.skill} className="text-xs text-ink-muted">
                                <span className="text-signal-glow">{rec.skill}</span> — {rec.course}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {resume.parse_status === "processing" && (
                    <p className="px-4 pb-4 text-xs text-ink-faint">Analyzing your resume…</p>
                  )}
                  {resume.parse_status === "failed" && resume.ai_feedback && (
                    <p className="px-4 pb-4 text-xs text-red-400">{resume.ai_feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <h2 className="font-display font-semibold text-lg text-ink">About you</h2>

          <FormField label="Headline">
            <input className="input-field" placeholder="e.g. Full Stack Developer" {...register("headline")} />
          </FormField>

          <FormField label="Bio">
            <textarea className="input-field min-h-[100px]" placeholder="A short summary about you" {...register("bio")} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-5">
            <FormField label="Location">
              <input className="input-field" placeholder="City, Country" {...register("location")} />
            </FormField>
            <FormField label="Years of experience">
              <input type="number" min="0" className="input-field" {...register("years_of_experience")} />
            </FormField>
          </div>

          <FormField label="GitHub">
            <input className="input-field" placeholder="https://github.com/you" {...register("github_url")} />
          </FormField>
          <FormField label="LinkedIn">
            <input className="input-field" placeholder="https://linkedin.com/in/you" {...register("linkedin_url")} />
          </FormField>
          <FormField label="Portfolio">
            <input className="input-field" placeholder="https://yoursite.com" {...register("portfolio_url")} />
          </FormField>

          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </ScrollReveal>
    </div>
  );
}
