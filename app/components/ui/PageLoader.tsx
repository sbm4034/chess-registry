'use client';

import Spinner from './Spinner';

type PageLoaderProps = {
  label?: string;
};

export default function PageLoader({ label = 'Loading' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-primary">
        <Spinner size="lg" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
