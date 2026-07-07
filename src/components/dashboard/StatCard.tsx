import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Primitives';
import { cx } from '../../utils/format';

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  tone = 'primary',
  index = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  index?: number;
}) {
  const toneColor: Record<string, string> = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <Card className="p-5 hover:shadow-[var(--shadow-card-hover)] cursor-default">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
          <div
            className="h-9 w-9 rounded-[10px] grid place-items-center shrink-0"
            style={{ background: `color-mix(in oklab, ${toneColor[tone]} 12%, transparent)` }}
          >
            <Icon className="h-[18px] w-[18px]" style={{ color: toneColor[tone] }} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
            <span
              className={cx(
                'inline-flex items-center gap-0.5',
                trend >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              )}
            >
              {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[var(--color-muted)] font-normal">{trendLabel}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
