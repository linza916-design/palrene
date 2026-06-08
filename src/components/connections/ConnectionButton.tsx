import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useStore } from "../../store";
import { ConnectionStatus } from "../../types";

interface ConnectionButtonProps {
  profileId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onConnectionSent?: () => void;
}

const statusConfig: Record<ConnectionStatus, { label: string; icon: string; className: string }> = {
  none: {
    label: "Connect",
    icon: "M12 4.5v15m7.5-7.5h-15",
    className: "bg-blue-500 hover:bg-blue-600 text-white"
  },
  pending_sent: {
    label: "Pending",
    icon: "M12 6v6l4 2",
    className: "bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-default"
  },
  pending_received: {
    label: "Accept",
    icon: "M5 13l4 4L19 7",
    className: "bg-emerald-500 hover:bg-emerald-600 text-white"
  },
  connected: {
    label: "Connected",
    icon: "M5 13l4 4L19 7",
    className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
  },
  declined: {
    label: "Connect",
    icon: "M12 4.5v15m7.5-7.5h-15",
    className: "bg-blue-500/70 hover:bg-blue-500 text-white"
  },
  blocked: {
    label: "Blocked",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636",
    className: "bg-red-500/20 text-red-400 border border-red-500/40 cursor-default"
  }
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2.5"
};

const iconSizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

export default function ConnectionButton({ profileId, size = "md", className = "", onConnectionSent }: ConnectionButtonProps) {
  const { currentUser, getConnectionStatus, sendConnectionRequest, acceptConnection, connections } = useStore();
  const [isPulsing, setIsPulsing] = useState(false);

  if (!currentUser || currentUser.id === profileId) return null;

  const status = getConnectionStatus(profileId);
  const config = statusConfig[status];
  const isInteractive = status === "none" || status === "pending_received" || status === "declined";

  const handleClick = async () => {
    if (!isInteractive) return;
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);

    if (status === "none" || status === "declined") {
      sendConnectionRequest(profileId);
      onConnectionSent?.();
    } else if (status === "pending_received") {
      const conn = connections.find(c => c.requester_id === profileId && c.recipient_id === currentUser.id && c.status === "pending");
      if (conn) acceptConnection(conn.id);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isInteractive}
      className={`relative flex items-center rounded-full font-semibold transition-all select-none ${sizeClasses[size]} ${config.className} ${className}`}
      whileHover={isInteractive ? { scale: 1.04 } : {}}
      whileTap={isInteractive ? { scale: 0.96 } : {}}
      aria-label={`${config.label} with user`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
          </svg>
          {config.label}
        </motion.span>
      </AnimatePresence>

      {isPulsing && (
        <motion.span
          className="absolute inset-0 rounded-full bg-white/30"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
