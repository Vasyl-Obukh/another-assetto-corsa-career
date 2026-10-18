import { useSyncExternalStore } from 'react';

import { viewportScale } from './utils.ts';

/**
 * How far to scale a screen designed for one window size so it reads the same
 * at any other - the same picture at 1080p and at 4K, only sharper - read
 * again whenever the window is resized.
 * @param design The window's shorter side the screen was designed at, in CSS
 * pixels
 * @param min The least it is scaled by
 * @param max The most it is scaled by
 * @returns The scale, one at the design size
 */
export const useViewportScale = (design: number, min: number, max: number): number => useSyncExternalStore(
  (changed) => {
    window.addEventListener('resize', changed);

    return () => window.removeEventListener('resize', changed);
  },
  () => viewportScale(Math.min(window.innerWidth, window.innerHeight), design, min, max),
);
