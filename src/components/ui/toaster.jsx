import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

/**
 * Drop-in Toaster — place once in main.jsx (or App.jsx) outside all routes.
 * Handles: success (default), destructive (red), and info variants.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // When toast.open becomes false, fade out
  useEffect(() => {
    if (!toast.open) setVisible(false);
  }, [toast.open]);

  const isDestructive = toast.variant === "destructive";
  const isSuccess     = !isDestructive; // default = success/info

  return (
    <div
      style={{
        transition:  "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        opacity:     visible && toast.open ? 1 : 0,
        transform:   visible && toast.open ? "translateX(0)" : "translateX(20px)",
        pointerEvents: "auto",
      }}
      className={[
        "flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl",
        "border text-sm font-medium",
        isDestructive
          ? "bg-red-950/90 border-red-500/30 text-red-200"
          : "bg-[#0f0f0f]/95 border-white/10 text-white",
      ].join(" ")}
    >
      {/* Icon */}
      <span className="text-base mt-0.5 shrink-0">
        {isDestructive ? "✗" : "✓"}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold leading-tight mb-0.5">{toast.title}</p>
        )}
        {toast.description && (
          <p className={`leading-snug ${toast.title ? "text-white/60 text-xs" : ""}`}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 mt-0.5 opacity-40 hover:opacity-80 transition-opacity text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
