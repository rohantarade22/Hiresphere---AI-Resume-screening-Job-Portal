import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

import AuthLayout from "../../components/layout/AuthLayout";
import FormField from "../../components/ui/FormField";
import { authApi } from "../../api/client";

export default function RegisterCandidatePage() {
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
      await authApi.registerCandidate(data);
      toast.success("Account created! Check your email to verify.");
      navigate("/login");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors && typeof errors === "object" ? Object.values(errors)[0] : null;
      toast.error(Array.isArray(firstError) ? firstError[0] : "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your candidate account"
      subtitle="Free forever. Get AI resume scoring in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-signal-glow hover:underline">
            Log in
          </Link>
          <span className="mx-2 text-ink-faint">·</span>
          Hiring instead?{" "}
          <Link to="/register/recruiter" className="text-signal-glow hover:underline">
            Recruiter signup
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <FormField label="Full name" error={errors.full_name?.message}>
          <input
            type="text"
            className="input-field"
            placeholder="Jordan Lee"
            {...register("full_name", { required: "Full name is required" })}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
