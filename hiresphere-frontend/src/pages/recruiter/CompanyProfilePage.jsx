import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ScrollReveal from "../../components/ui/ScrollReveal";
import FormField from "../../components/ui/FormField";
import { companyApi } from "../../api/client";

export default function CompanyProfilePage() {
  const queryClient = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["my-company"],
    queryFn: () => companyApi.mine().then((r) => r.data),
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: company
      ? {
          website: company.website,
          industry: company.industry,
          headquarters: company.headquarters,
          description: company.description,
          founded_year: company.founded_year,
          logo_url: company.logo_url,
        }
      : undefined,
  });

  const onSubmit = async (data) => {
    try {
      await companyApi.update(data);
      toast.success("Company profile updated");
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
    } catch {
      toast.error("Couldn't save company profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-display font-semibold text-xl text-ink">
            {company?.name?.[0] || "?"}
          </div>
          <div>
            <span className="eyebrow">Company profile</span>
            <h1 className="mt-1 text-2xl font-display font-semibold text-ink">{company?.name}</h1>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-5">
          <FormField label="Logo URL">
            <input className="input-field" placeholder="https://…" {...register("logo_url")} />
          </FormField>
          <FormField label="Website">
            <input className="input-field" placeholder="https://yourcompany.com" {...register("website")} />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField label="Industry">
              <input className="input-field" placeholder="e.g. Fintech" {...register("industry")} />
            </FormField>
            <FormField label="Founded year">
              <input type="number" className="input-field" placeholder="2015" {...register("founded_year")} />
            </FormField>
          </div>
          <FormField label="Headquarters">
            <input className="input-field" placeholder="City, Country" {...register("headquarters")} />
          </FormField>
          <FormField label="About the company">
            <textarea className="input-field min-h-[120px]" placeholder="What does your company do?" {...register("description")} />
          </FormField>

          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </ScrollReveal>
    </div>
  );
}
