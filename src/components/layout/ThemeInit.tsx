'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('spacetime-theme');
    const theme = stored === 'dark' ? 'dark' : 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    useAppStore.setState({ theme });
  }, []);

  return null;
}
