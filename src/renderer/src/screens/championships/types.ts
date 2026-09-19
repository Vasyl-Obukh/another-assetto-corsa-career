import type { ParseKeys, TFunction } from 'i18next';

import type { ChampionshipDimension } from '@/hooks';

/**
 * A dimension a championship list narrows by, with what its filter says.
 */
export interface ChampionshipFilter extends ChampionshipDimension {
  /**
   * The catalogue key for the filter's name.
   */
  label: ParseKeys;
  /**
   * Turns one of its values into something readable.
   * @param value The value as the dimension reads it off a championship
   * @param t The translator
   * @returns What the filter list shows
   */
  format(value: string, t: TFunction): string;
}
