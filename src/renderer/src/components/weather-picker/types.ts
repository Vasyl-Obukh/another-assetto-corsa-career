import type { ParseKeys } from 'i18next';
import type { LucideIcon } from 'lucide-react';

import type { WeatherType } from '../../../../shared/constants';

/**
 * One kind of weather - skies, rain, snow - and its types, lightest first.
 */
export interface WeatherKind {
  /**
   * The catalogue key for its name.
   */
  label: ParseKeys;
  /**
   * What stands for the kind on its card.
   */
  icon: LucideIcon;
  /**
   * The types it holds, lightest to heaviest.
   */
  types: readonly WeatherType[];
  /**
   * The fill and text a picked type of the kind wears.
   */
  accent: string;
  /**
   * The text colour alone, for the kind's icon.
   */
  tint: string;
}
