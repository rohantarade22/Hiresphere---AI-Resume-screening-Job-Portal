import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

import AuthLayout from "../../components/layout/AuthLayout";
import FormField from "../../components/ui/FormField";
import { authApi } from "../../api/client";
import { setCredentials } from "../../store/authSlice";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await authApi.loginCandidate(data);
      const { access, refresh, user } = response.data;
      dispatch(setCredentials({ user, access, refresh }));
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}.`);

      if (user.role === "recruiter") navigate("/recruiter/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/candidate/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password.";
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your dashboard"
      footer={
        <>
          New to HireSphere?{" "}
          <Link to="/register/candidate" className="text-signal-glow hover:underline">
            Create an account
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

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input-field pr-11"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
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

        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-xs text-signal-glow hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
