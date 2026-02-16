'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { ybpToOverview, overviewToYBP } from '@/lib/time/scales';
import { BIG_BANG_YBP, ERAS } from '@/lib/time/constants';

const MINIMAP_HEIGHT = 24;

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useAppStore(s => s.viewport);
  const setViewport = useAppStore(s => s.setViewport);
  const theme = useAppStore(s => s.theme);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = MINIMAP_HEIGHT;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#e5e7eb';
    ctx.fillRect(0, 0, width, height);

    // Era bands
    ERAS.forEach(era => {
      const x1 = ybpToOverview(era.startYBP, width);
      const x2 = ybpToOverview(era.endYBP, width);
      ctx.fillStyle = era.color.replace('0.15', '0.4');
      ctx.fillRect(x1, 0, x2 - x1, height);
    });

    // Viewport indicator
    const vpX1 = ybpToOverview(viewport.startYBP, width);
    const vpX2 = ybpToOverview(viewport.endYBP, width);
    const vpWidth = Math.max(2, vpX2 - vpX1);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX1, 1, vpWidth, height - 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.fillRect(vpX1, 1, vpWidth, height - 2);
  }, [viewport, theme]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(() => draw());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const width = rect.width;
    const clickYBP = overviewToYBP(x, width);
    const span = viewport.endYBP - viewport.startYBP;
    setViewport({
      ...viewport,
      startYBP: clickYBP - span / 2,
      endYBP: clickYBP + span / 2,
    });
  };

  return (
    <div ref={containerRef} className="w-full bg-surface border-t border-border cursor-pointer" onClick={handleClick}>
      <canvas ref={canvasRef} height={MINIMAP_HEIGHT} className="w-full block" />
    </div>
  );
}
