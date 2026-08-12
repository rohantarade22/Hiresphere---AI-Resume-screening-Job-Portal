import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";

import AuthLayout from "../../components/layout/AuthLayout";
import FormField from "../../components/ui/FormField";
import { authApi } from "../../api/client";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-match/10 border border-match/30 flex items-center justify-center text-match">
            <FiCheckCircle size={28} />
          </div>
          <p className="text-sm text-ink-muted">
            If that email is registered, we've sent a link to reset your password. It expires in 1 hour.
          </p>
          <Link to="/login" className="btn-secondary mt-2">Back to login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to get back in"
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="text-signal-glow hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <FormField label="Email" error={errors.email?.message}>
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

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
