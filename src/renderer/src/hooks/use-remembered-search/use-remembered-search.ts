import { useEffect, useState } from 'react';

import { readBrowserMemory, rememberBrowser } from '@/lib/browser-memory';

/**
 * A list's search box, opened on what was last typed into it while the window
 * has been open. A restart clears it, unlike the list's filters.
 * @param id Which list, or undefined for one that remembers nothing - a picker
 * @returns The text and its setter
 */
export const useRememberedSearch = (id: string | undefined): [string, (next: string) => void] => {
  const [search, setSearch] = useState(() => readBrowserMemory(id).search);

  useEffect(() => {
    rememberBrowser(id, { search });
  }, [id, search]);

  return [search, setSearch];
};
