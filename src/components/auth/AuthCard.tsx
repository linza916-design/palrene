import React, { useState } from "react";
import {
  ArrowRight,
  Mail,
  CircleCheck as CheckCircle,
  Loader,
  Github,
} from "lucide-react";
import { supabase } from "../../lib/supabase"; // adjust path if needed
import PasswordField from "./PasswordField";

interface AuthCardProps {
  onLogin?: (email: string, password: string) => Promise<void>;
  onSignup?: (email: string, password: string) => Promise<void>;
}

export default function AuthCard({ onLogin, onSignup }: AuthCardProps) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await onLogin?.(email, password);
      } else {
        await onSignup?.(email, password);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "GitHub sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <section
      id="registration-section"
      aria-labelledby="auth-heading"
      className="max-w-md mx-auto px-6 py-20"
    >
      <div className="rounded-3xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
        <div className="p-8">
          <header className="text-center mb-8">
            <p className="text-sm font-medium text-orange-600">Join Palrene</p>

            <h2
              id="auth-heading"
              className="mt-2 text-3xl font-serif font-bold text-neutral-900 dark:text-white"
            >
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              {mode === "signup"
                ? "Connect with friends, communities, and meaningful relationships."
                : "Sign in to continue your journey."}
            </p>
          </header>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Authentication options"
            className="flex p-1 rounded-xl bg-neutral-100 dark:bg-zinc-900 mb-6"
          >
            <button
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess(false);
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Sign Up
            </button>

            <button
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess(false);
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white dark:bg-zinc-800 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              Log In
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />

              <p className="font-semibold text-neutral-900 dark:text-white">
                {mode === "signup" ? "Account created!" : "Welcome back!"}
              </p>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {mode === "signup"
                  ? "Check your email to confirm your account."
                  : "You are now signed in."}
              </p>
            </div>
          ) : (
            <>
              {/* Social Auth */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 dark:border-zinc-700 py-3 text-sm font-medium bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={handleGithubSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 dark:border-zinc-700 py-3 text-sm font-medium bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  <Github size={18} />
                  Continue with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200 dark:border-zinc-700" />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-950 px-3 text-neutral-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3 pl-11 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <PasswordField
                  id="auth-password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  required
                />

                {mode === "signup" && (
                  <PasswordField
                    id="auth-confirm-password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    required
                  />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 py-3 text-sm font-semibold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "signup" ? "Create Account" : "Sign In"}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
