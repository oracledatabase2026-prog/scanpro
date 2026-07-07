import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/format';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] transition-shadow duration-300',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx('px-6 py-5', className)} {...rest}>
      {children}
    </div>
  );
}

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export function Badge({
  tone = 'neutral',
  children,
  dot = false,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const toneMap: Record<BadgeTone, string> = {
    primary: 'bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]',
    success: 'bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[color-mix(in_oklab,var(--color-success)_75%,black)]',
    warning: 'bg-[color-mix(in_oklab,var(--color-warning)_16%,transparent)] text-[color-mix(in_oklab,var(--color-warning)_65%,black)]',
    danger: 'bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]',
    neutral: 'bg-[color-mix(in_oklab,var(--color-muted)_14%,transparent)] text-[var(--color-muted)]',
  };
  const dotMap: Record<BadgeTone, string> = {
    primary: 'bg-[var(--color-primary)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
    neutral: 'bg-[var(--color-muted)]',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold',
        toneMap[tone],
        className
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', dotMap[tone])} />}
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cx('h-px bg-[var(--color-border)]', className)} />;
}
