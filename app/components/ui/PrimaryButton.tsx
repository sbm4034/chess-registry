import Link from 'next/link'
import type { ButtonHTMLAttributes } from 'react'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  className?: string
}

export function PrimaryButton({
  children,
  href,
  className = '',
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const baseClassName =
    'bg-primary text-primary-foreground font-sans font-medium px-6 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:bg-accent hover:text-accent-foreground'

  if (href) {
    return (
      <Link href={href} className={`${baseClassName} ${className}`}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={`${baseClassName} ${className}`}
      disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  )
}