// Kept at @/lib/utils, where the shadcn CLI expects it, so `shadcn add` keeps
// generating components that import cn from the right place.

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names, with later Tailwind utilities beating earlier ones.
 * @param inputs Class names, arrays or conditional objects
 * @returns The merged class string
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
