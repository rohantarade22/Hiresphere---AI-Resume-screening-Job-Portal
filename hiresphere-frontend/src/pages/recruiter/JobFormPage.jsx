import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ScrollReveal from "../../components/ui/ScrollReveal";
import FormField from "../../components/ui/FormField";
import { recruiterJobsApi } from "../../api/client";

const jobTypes = ["full_time", "part_time", "contract", "internship"];
const workModes = ["onsite", "remote", "hybrid"];
const experienceLevels = ["entry", "mid", "senior", "lead"];

export default function JobFormPage() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();

  const { data: existingJob } = useQuery({
    queryKey: ["job-edit", slug],
    queryFn: () => recruiterJobsApi.detail(slug).then((r) => r.data),
    enabled: isEditing,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    values: existingJob
      ? {
          title: existingJob.title,
          category: existingJob.category,
          description: existingJob.description,
          responsibilities: existingJob.responsibilities,
          requirements: existingJob.requirements,
          job_type: existingJob.job_type,
          work_mode: existingJob.work_mode,
          experience_level: existingJob.experience_level,
          location: existingJob.location,
          salary_min: existingJob.salary_min,
          salary_max: existingJob.salary_max,
        }
      : { job_type: "full_time", work_mode: "onsite", experience_level: "mid" },
  });

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      salary_min: data.salary_min ? Number(data.salary_min) : null,
      salary_max: data.salary_max ? Number(data.salary_max) : null,
    };
    try {
      if (isEditing) {
        await recruiterJobsApi.update(slug, payload);
        toast.success("Job updated");
        navigate("/recruiter/jobs");
      } else {
        const { data: created } = await recruiterJobsApi.create(payload);
        toast.success("Job saved as draft — publish it when you're ready");
        navigate(`/recruiter/jobs/${created.slug}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ScrollReveal>
        <span className="eyebrow">{isEditing ? "Edit job" : "New job"}</span>
        <h1 className="mt-2 text-3xl font-display font-semibold text-ink">
          {isEditing ? "Edit job posting" : "Post a new job"}
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-5">
          <FormField label="Job title" error={errors.title?.message}>
            <input className="input-field" placeholder="e.g. Senior Full Stack Engineer" {...register("title", { required: "Title is required" })} />
          </FormField>

          <FormField label="Category">
            <input className="input-field" placeholder="e.g. Engineering, Design, Sales" {...register("category")} />
          </FormField>

          <div className="grid sm:grid-cols-3 gap-5">
            <FormField label="Job type">
              <select className="input-field" {...register("job_type")}>
                {jobTypes.map((v) => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
              </select>
            </FormField>
            <FormField label="Work mode">
              <select className="input-field" {...register("work_mode")}>
                {workModes.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Experience level">
              <select className="input-field" {...register("experience_level")}>
                {experienceLevels.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Location">
            <input className="input-field" placeholder="City, Country or 'Remote'" {...register("location")} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-5">
            <FormField label="Salary min (annual)">
              <input type="number" className="input-field" placeholder="90000" {...register("salary_min")} />
            </FormField>
            <FormField label="Salary max (annual)">
              <input type="number" className="input-field" placeholder="130000" {...register("salary_max")} />
            </FormField>
          </div>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              className="input-field min-h-[120px]"
              placeholder="What's the role about?"
              {...register("description", { required: "Description is required" })}
            />
          </FormField>

          <FormField label="Responsibilities">
            <textarea className="input-field min-h-[100px]" placeholder="One per line" {...register("responsibilities")} />
          </FormField>

          <FormField label="Requirements">
            <textarea className="input-field min-h-[100px]" placeholder="One per line" {...register("requirements")} />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
              {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Save as draft"}
            </button>
          </div>
        </form>
      </ScrollReveal>
    </div>
  );
}
