import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ToastVariant } from '../../types';

const ICONS: Record<ToastVariant, ReactElement> = {
  success: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
  error: <XCircle className="h-5 w-5 text-[var(--color-danger)]" />,
  warning: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
  info: <Info className="h-5 w-5 text-[var(--color-primary)]" />,
  loading: <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />,
};

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-[min(360px,calc(100vw-2.5rem))]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 shadow-[var(--shadow-elevated)]"
            role="status"
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.variant]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">{t.title}</p>
              {t.description && <p className="text-xs text-[var(--color-muted)] mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
