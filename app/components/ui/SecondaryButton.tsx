import Link from 'next/link';
import type { ButtonHTMLAttributes } from 'react';

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  className?: string;
};

export function SecondaryButton({ children, href, className = '', ...props }: SecondaryButtonProps) {
  const baseClassName =
    'border border-brand-gold text-brand-gold font-sans font-medium px-6 py-3 rounded-full hover:bg-brand-gold hover:text-brand-dark transition';

  if (href) {
    return (
      <Link href={href} className={`${baseClassName} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${baseClassName} ${className}`} {...props}>
      {children}
    </button>
  );
}
