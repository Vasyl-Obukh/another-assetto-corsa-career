import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { nameVisit } from '@/lib/nav-history';

/**
 * Names the page the window is on, so Back on whichever page comes next can say
 * where it returns to - "Imola · Italian F4 Championship" rather than "Round".
 * A page showing one thing calls it once that thing has loaded; a list needs
 * nothing, since its route already names it.
 * @param name The page's name, already translated, or null while it is unknown
 */
export const usePageName = (name: string | null): void => {
  const { key } = useLocation();

  useEffect(() => {
    if (name) nameVisit(key, name);
  }, [key, name]);
};
