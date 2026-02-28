'use client';

type SpinnerSize = 'sm' | 'md' | 'lg';

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      viewBox="0 0 24 24"
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
        fill="none"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
        fill="none"
      />
    </svg>
  );
}
