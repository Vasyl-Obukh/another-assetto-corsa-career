import type { ClassId, SpecId } from '../../../../shared/types';

/**
 * What the classify form holds between its two steps.
 */
export interface ClassPicks {
  /**
   * The classes chosen, in catalogue order.
   */
  classes: ClassId[];
  /**
   * The spec chosen for each class, where one has been.
   */
  specs: Partial<Record<ClassId, SpecId>>;
}
