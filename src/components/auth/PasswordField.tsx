import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PasswordField({ id, label, value, onChange, required, placeholder, className }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder || "••••••••"}
          className={`w-full rounded-xl border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3 pl-4 pr-11 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${className || ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
