import type { ResolvedTheme } from '../../shared/types/index.ts';

/**
 * Painted behind the renderer before first paint, so startup does not flash.
 * Kept in step with the background token in the renderer's globals.css.
 */
export const WINDOW_BACKGROUND: Record<ResolvedTheme, string> = {
  light: '#f7f7f8',
  dark: '#131417',
};
