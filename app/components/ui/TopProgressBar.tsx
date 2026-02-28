'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const mounted = useRef(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setVisible(true);
    setProgress(18);

    const phaseOne = window.setTimeout(() => {
      setProgress(72);
    }, 80);

    const phaseTwo = window.setTimeout(() => {
      setProgress(100);
    }, 220);

    const complete = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 430);

    return () => {
      window.clearTimeout(phaseOne);
      window.clearTimeout(phaseTwo);
      window.clearTimeout(complete);
    };
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-50 h-[3px] w-full">
      <div
        className={`h-full bg-accent transition-all duration-300 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
