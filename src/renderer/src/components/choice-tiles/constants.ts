// The theme picker's pictures and icons, one per choice.

import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ThemeChoice } from '../../../../shared/types';

/**
 * The icon beside each theme's name.
 */
export const THEME_ICON = {
  system: LaptopIcon,
  light: SunIcon,
  dark: MoonIcon,
} as const satisfies Record<ThemeChoice, LucideIcon>;

/**
 * Each theme's page and card colour, as a picture of the app in it. The system
 * choice is drawn as both, split down the middle.
 */
export const THEME_PREVIEW = {
  system: {
    page: 'bg-[linear-gradient(90deg,var(--preview-light-page)_50%,var(--preview-dark-page)_50%)]',
    card: 'bg-[linear-gradient(90deg,var(--preview-light-card)_50%,var(--preview-dark-card)_50%)]',
  },
  light: { page: 'bg-preview-light-page', card: 'bg-preview-light-card' },
  dark: { page: 'bg-preview-dark-page', card: 'bg-preview-dark-card' },
} as const satisfies Record<ThemeChoice, { page: string; card: string }>;
