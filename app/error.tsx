'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md bg-surface border border-border rounded-2xl p-8 text-center space-y-4 shadow-md">
        <h2 className="font-serif text-xl text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}