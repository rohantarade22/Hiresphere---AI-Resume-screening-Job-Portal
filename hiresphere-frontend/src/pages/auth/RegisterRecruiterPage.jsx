import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiInfo } from "react-icons/fi";

import AuthLayout from "../../components/layout/AuthLayout";
import FormField from "../../components/ui/FormField";
import { authApi } from "../../api/client";

export default function RegisterRecruiterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await authApi.registerRecruiter(data);
      toast.success("Account created! It's pending admin approval.");
      navigate("/login");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors && typeof errors === "object" ? Object.values(errors)[0] : null;
      toast.error(Array.isArray(firstError) ? firstError[0] : "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your recruiter account"
      subtitle="Post jobs, manage pipelines, hire faster"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-signal-glow hover:underline">
            Log in
          </Link>
          <span className="mx-2 text-ink-faint">·</span>
          Looking for a job?{" "}
          <Link to="/register/candidate" className="text-signal-glow hover:underline">
            Candidate signup
          </Link>
        </>
      }
    >
      <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-spark/10 border border-spark/30 text-xs text-spark">
        <FiInfo className="shrink-0 mt-0.5" />
        Recruiter accounts require admin approval before you can post jobs. We'll email you once approved.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <FormField label="Full name" error={errors.full_name?.message}>
          <input
            type="text"
            className="input-field"
            placeholder="Jordan Reyes"
            {...register("full_name", { required: "Full name is required" })}
          />
        </FormField>

        <FormField label="Work email" error={errors.email?.message}>
          <input
            type="email"
            className="input-field"
            placeholder="you@company.com"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
        </FormField>

        <FormField label="Company name" error={errors.company_name?.message}>
          <input
            type="text"
            className="input-field"
            placeholder="Acme Inc."
            {...register("company_name", { required: "Company name is required" })}
          />
        </FormField>

        <FormField label="Phone (optional)">
          <input type="tel" className="input-field" placeholder="+1 555 000 0000" {...register("phone")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input-field pr-11"
              placeholder="At least 8 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Must be at least 8 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirm password" error={errors.password_confirm?.message}>
          <input
            type={showPassword ? "text" : "password"}
            className="input-field"
            placeholder="Re-enter your password"
            {...register("password_confirm", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
        </FormField>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? "Creating account…" : "Create recruiter account"}
        </button>
      </form>
    </AuthLayout>
  );
}
