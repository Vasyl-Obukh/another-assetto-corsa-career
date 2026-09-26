import { useTranslation } from 'react-i18next';

import { NeedsChips } from './NeedsChips.tsx';
import type { SeriesRequirements } from '../../../../shared/types';
import { SourceChips } from '@/components';

interface RequirementsProps {
  /**
   * What the championship needs, and what only widens its field.
   */
  requires: SeriesRequirements;
}

export const Requirements = ({ requires }: RequirementsProps) => {
  const { t } = useTranslation();
  const { widenedBy, rounds } = requires;
  const widens = widenedBy.packs.length + widenedBy.makers.length + widenedBy.distributors.length > 0;
  const roundsNeed = rounds.packs.length + rounds.makers.length + rounds.distributors.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t('championshipLibrary.needs')}</span>
      <NeedsChips requires={requires} />

      {/* Apart from Needs: missing one of these costs the rounds raced on it
          and leaves the rest of the calendar running. */}
      {roundsNeed ? (
        <>
          <span className="ml-2">{t('championshipLibrary.roundsNeed')}</span>
          <SourceChips
            packs={rounds.packs}
            makers={rounds.makers}
            distributors={rounds.distributors}
          />
        </>
      ) : null}

      {widens ? (
        <>
          <span className="ml-2">{t('championshipLibrary.optional')}</span>
          <SourceChips packs={widenedBy.packs} makers={widenedBy.makers} distributors={widenedBy.distributors} />
        </>
      ) : null}
    </div>
  );
};
