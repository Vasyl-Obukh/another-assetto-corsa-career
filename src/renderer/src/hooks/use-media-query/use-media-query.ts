import { useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query matches, kept current as the window changes.
 *
 * For a layout that has to change what it renders rather than only how it
 * looks - a panel that becomes a sheet - which a Tailwind breakpoint cannot do.
 * @param query The media query, as CSS writes it
 * @returns Whether it matches now
 */
export const useMediaQuery = (query: string): boolean => useSyncExternalStore(
  (changed) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', changed);

    return () => list.removeEventListener('change', changed);
  },
  () => window.matchMedia(query).matches,
);
