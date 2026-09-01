import type { ReactNode } from 'react';

import { FIELD_GRID } from '@/lib/layout';

interface FieldGridProps {
  /**
   * The rows, normally `FieldRow` or `ToggleRow`.
   */
  children: ReactNode;
}

/**
 * The two-column field layout every settings card shares.
 *
 * A component rather than a class, so the grid is always its own element.
 * Putting the classes straight on `CardContent` looks identical but is not:
 * `CardContent` carries `px-6`, so the width cap lands on the border box and
 * that card's columns come out 48px narrower than everyone else's.
 */
export const FieldGrid = ({ children }: FieldGridProps) => (
  <div className={FIELD_GRID}>{children}</div>
);
