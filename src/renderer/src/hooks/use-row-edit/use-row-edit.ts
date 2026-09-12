import { useState } from 'react';

import { ADDING, SCOPE_SEPARATOR } from './constants.ts';
import type { RowEditState } from './types.ts';

export type { RowEditState } from './types.ts';

/**
 * Holds which row of the editor has its form open.
 *
 * One instance for the whole screen: every list reads the same `editable`, so a
 * seat is not left editable while its class is being renamed.
 *
 * Nothing here holds the row being added, only that one is. The list mints the
 * seed with `nextTeam` and its siblings, and the form, mounted only while open,
 * holds what is typed.
 * @returns What is open, and how to open and close one
 */
export const useRowEdit = (): RowEditState => {
  const [open, setOpen] = useState<string | null>(null);

  /**
   * The key one row is addressed by.
   * @param scope Which list the row belongs to
   * @param id The row's id, or the adding marker
   * @returns The key
   */
  const keyOf = (scope: string, id: string): string => `${scope}${SCOPE_SEPARATOR}${id}`;

  return {
    open,
    editable: open === null,
    editing: (scope, id) => open === keyOf(scope, id),
    adding: (scope) => open === keyOf(scope, ADDING),
    edit: (scope, id) => setOpen(keyOf(scope, id)),
    add: (scope) => setOpen(keyOf(scope, ADDING)),
    close: () => setOpen(null),
  };
};
