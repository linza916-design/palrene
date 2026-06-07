import { ArrowRight, Mail } from "lucide-react";

import PasswordField from "./PasswordField";

export default function AuthCard() {
  return (
    <section
      id="registration-section"
      aria-labelledby="auth-heading"
      className="max-w-md mx-auto px-6 py-20"
    >
      <div
        className="
        rounded-3xl
        border
        border-neutral-200
        dark:border-zinc-800
        bg-white
        dark:bg-zinc-950
        shadow-xl
        overflow-hidden
        "
      >
        <div className="p-8">
          <header className="text-center mb-8">
            <p className="text-sm font-medium text-orange-600">Join Palrene</p>

            <h2
              id="auth-heading"
              className="mt-2 text-3xl font-serif font-bold text-neutral-900 dark:text-white"
            >
              Create your account
            </h2>

            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Connect with friends, communities, and meaningful relationships.
            </p>
          </header>

          {/* Tabs */}

          <div
            role="tablist"
            aria-label="Authentication options"
            className="
            flex
            p-1
            rounded-xl
            bg-neutral-100
            dark:bg-zinc-900
            mb-6
            "
          >
            <button
              role="tab"
              aria-selected="true"
              className="
                flex-1
                rounded-lg
                py-2.5
                text-sm
                font-medium
                bg-white
                dark:bg-zinc-800
              "
            >
              Sign Up
            </button>

            <button
              role="tab"
              aria-selected="false"
              className="
                flex-1
                rounded-lg
                py-2.5
                text-sm
                font-medium
              "
            >
              Log In
            </button>
          </div>

          {/* Errors */}

          <div role="alert" aria-live="polite" className="hidden" />

          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="
                  block
                  text-sm
                  font-medium
                  text-neutral-700
                  dark:text-neutral-300
                  mb-2
                "
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-neutral-400
                  "
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-neutral-300
                    dark:border-zinc-700
                    bg-white
                    dark:bg-zinc-900
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    focus:ring-2
                    focus:ring-orange-500
                    focus:border-orange-500
                  "
                />
              </div>
            </div>

            <PasswordField
              id="password"
              label="Password"
              value=""
              onChange={() => {}}
              required
            />

            <button
              type="submit"
              className="
                w-full
                rounded-xl
                bg-linear-to-r
                from-red-500
                to-orange-500
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:opacity-90
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500
                focus:ring-offset-2
              "
            >
              <span className="flex items-center justify-center gap-2">
                Create Account
                <ArrowRight size={16} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
