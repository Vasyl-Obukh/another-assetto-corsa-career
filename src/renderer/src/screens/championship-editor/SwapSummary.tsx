import { useTranslation } from 'react-i18next';

import type { Championship, Round } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { carsOf } from '../../../../shared/utils/eligibility';

interface SwapSummaryProps {
  /**
   * The championship, for naming the classes the round overrides.
   */
  series: Championship;
  /**
   * The round whose overrides these are.
   */
  round: Round;
  /**
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
}

/**
 * Which class runs what at one round, in a line each.
 *
 * What the calendar's Cars badge says when hovered, so a season's swaps can be
 * read down the calendar rather than opened one dialog at a time.
 */
export const SwapSummary = ({ series, round, nameOf }: SwapSummaryProps) => {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-1">
      {(round.eligibility ?? []).map((override) => {
        const entry = series.entries.find((one) => one.id === override.entry);

        return (
          <li key={override.entry}>
            {t('editor.calendar.swapLine', {
              entry: entry?.name ?? override.entry,
              // A spec is a grid the catalogue names, so naming it beats
              // listing the thirty cars it happens to hold.
              cars: override.eligibility.kind === 'spec'
                ? carSpecName(override.eligibility.spec)
                : carsOf(override.eligibility).map(nameOf).join(', '),
            })}
          </li>
        );
      })}
    </ul>
  );
};
