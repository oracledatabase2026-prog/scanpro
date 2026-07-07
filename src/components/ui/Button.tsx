import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-card)] disabled:opacity-50',
  secondary:
    'bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] hover:bg-[color-mix(in_oklab,var(--color-primary)_16%,transparent)]',
  outline:
    'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)]',
  ghost: 'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-110 shadow-[var(--shadow-card)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center font-medium rounded-[var(--radius-control)] transition-colors duration-200 whitespace-nowrap select-none disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...(rest as any)}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      )}
    </motion.button>
  );
}
