'use client';

import { useEffect, useRef, useState } from 'react';

interface TooltipProps {
  x: number;
  y: number;
  children: React.ReactNode;
  visible: boolean;
}

export function Tooltip({ x, y, children, visible }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 12, y: -8 });

  useEffect(() => {
    if (ref.current && visible) {
      const rect = ref.current.getBoundingClientRect();
      const newOffset = { x: 12, y: -8 };
      if (rect.right > window.innerWidth - 10) {
        newOffset.x = -(rect.width + 12);
      }
      if (rect.bottom > window.innerHeight - 10) {
        newOffset.y = -(rect.height + 8);
      }
      setOffset(newOffset);
    }
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg bg-gray-900 border border-border shadow-xl text-sm max-w-xs"
      style={{ left: x + offset.x, top: y + offset.y }}
    >
      {children}
    </div>
  );
}
