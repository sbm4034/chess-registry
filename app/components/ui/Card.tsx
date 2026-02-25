import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
