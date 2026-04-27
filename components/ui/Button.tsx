import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost-dark' | 'ghost-light' | 'pacific';
type Size = 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ember text-bone shadow-cta hover:bg-ember-warm hover:-translate-y-0.5',
  'ghost-dark':
    'bg-white/5 text-bone border border-line-dark hover:bg-white/10 hover:border-line-darker',
  'ghost-light':
    'bg-transparent text-inlet-navy border border-line-mid hover:border-inlet-navy hover:bg-inlet-deep/5',
  pacific:
    'bg-pacific text-bone shadow-md hover:bg-teal-glow hover:-translate-y-0.5',
};

const sizeClasses: Record<Size, string> = {
  md: 'px-5 py-2.5 text-[0.9375rem]',
  lg: 'px-7 py-3.5 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', href, icon, className, children, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold tabular-nums transition-all duration-300',
    'focus-visible:outline-2 focus-visible:outline-pacific focus-visible:outline-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
      {icon}
    </button>
  );
});
