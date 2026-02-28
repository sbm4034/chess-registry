'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading: boolean;
  children: ReactNode;
  loadingText?: ReactNode;
  spinnerClassName?: string;
};

export default function LoadingButton({
  loading,
  children,
  loadingText,
  className = '',
  spinnerClassName = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} inline-flex items-center justify-center gap-2`}
    >
      {loading && <Spinner size="sm" className={spinnerClassName} />}
      <span>{loading ? loadingText ?? children : children}</span>
    </button>
  );
}
