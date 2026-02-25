import type { ReactNode } from 'react';

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={`max-w-6xl mx-auto px-6 py-20 ${className}`}>{children}</section>
  );
}
