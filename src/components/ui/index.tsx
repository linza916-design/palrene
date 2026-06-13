import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { Loader as Loader2 } from "lucide-react";

// =============================================================================
// Design System Constants
// =============================================================================

export const spacing = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
};

export const badgeVariants = {
  primary: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
  secondary:
    "bg-white/10 dark:bg-white/5 border border-white/10 text-neutral-700 dark:text-neutral-300",
  success: "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/15 border border-amber-500/20 text-amber-400",
  error: "bg-red-500/15 border border-red-500/20 text-red-400",
  info: "bg-blue-500/15 border border-blue-500/20 text-blue-400",
};

// =============================================================================
// AppCard - Primary container component
// =============================================================================

interface AppCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function AppCard({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  ...props
}: AppCardProps) {
  const variants = {
    default:
      "bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800",
    elevated:
      "bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-900/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800",
    outlined:
      "bg-transparent border border-neutral-200 dark:border-neutral-700",
    glass:
      "bg-white/70 dark:bg-neutral-900/50 backdrop-blur-xl border border-white/20 dark:border-neutral-700/50",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  return (
    <motion.div
      className={`
        rounded-2xl transition-all duration-300
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? "hover:shadow-lg hover:shadow-neutral-900/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// SectionHeader - Page section headers
// =============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500/10 to-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// =============================================================================
// Avatar - User avatar with status indicator
// =============================================================================

interface AvatarProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  verified?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = "md",
  online,
  verified,
  className = "",
}: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-20 h-20 text-base",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src || `https://api.dicebear.com/7.x/adventurer/svg?seed=${alt}`}
        alt={alt}
        width={
          size === "xs"
            ? 24
            : size === "sm"
              ? 32
              : size === "md"
                ? 40
                : size === "lg"
                  ? 56
                  : 80
        }
        height={
          size === "xs"
            ? 24
            : size === "sm"
              ? 32
              : size === "md"
                ? 40
                : size === "lg"
                  ? 56
                  : 80
        }
        className={`${sizes[size]} rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800`}
        loading="lazy"
      />
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizes[size]} rounded-full border-2 border-white dark:border-neutral-900 ${
            online ? "bg-emerald-500" : "bg-neutral-400"
          }`}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Button - Primary and secondary buttons
// =============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20",
      secondary:
        "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700",
      ghost:
        "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
      danger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
      outline:
        "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600",
    };

    const sizes = {
      xs: "px-2.5 py-1 text-[10px] rounded-lg gap-1",
      sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-5 py-2.5 text-sm rounded-xl gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

// =============================================================================
// Input - Form input fields
// =============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 py-2.5 text-sm rounded-xl
              bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-700
              text-neutral-900 dark:text-white
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20
              transition-all duration-200
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

// =============================================================================
// Modal - Dialog modal component
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full ${sizes[size]} bg-white dark:bg-neutral-900
          rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700
          overflow-hidden
        `}
      >
        {(title || description) && (
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            {title && (
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// EmptyState - Placeholder for empty content
// =============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4">
          <span className="text-neutral-400 dark:text-neutral-500">{icon}</span>
        </div>
      )}
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =============================================================================
// SkeletonLoader - Loading placeholder
// =============================================================================

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-2xl h-32",
  };

  return (
    <div
      className={`
        animate-pulse bg-neutral-200 dark:bg-neutral-800
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
}

// =============================================================================
// Badge - Status and label badges
// =============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = "secondary",
  size = "md",
  icon,
  className = "",
}: BadgeProps) {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${badgeVariants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

// =============================================================================
// TabNav - Tab navigation component
// =============================================================================

interface TabNavProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabNav({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabNavProps) {
  return (
    <div
      className={`flex bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl gap-1 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200
            ${
              activeTab === tab.id
                ? "bg-linear-to-r from-red-500 to-orange-500 text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }
          `}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// Re-export ErrorBoundary and NetworkStatus
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as NetworkStatus } from "./NetworkStatus";
