import { useTranslation } from 'react-i18next';

import { ContentSource } from '../../../../shared/types';
import type { SeriesRequirements } from '../../../../shared/types';
import { ProvenanceBadges, SourceChips } from '@/components';

interface RequirementsProps {
  /**
   * What the championship needs, and what only widens its field.
   */
  requires: SeriesRequirements;
}

export const Requirements = ({ requires }: RequirementsProps) => {
  const { t } = useTranslation();
  const needsOnlyBase = requires.sources.every((source) => source === ContentSource.BASE);
  // A mod nobody is credited with has no maker to name, so it reads as a bare Mod.
  const uncredited = requires.sources.includes(ContentSource.MOD) && requires.makers.length === 0;
  const widens = requires.widenedBy.packs.length > 0 || requires.widenedBy.makers.length > 0;
  const { rounds } = requires;
  const roundsNeed = rounds.packs.length + rounds.makers.length + rounds.distributors.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t('championshipLibrary.needs')}</span>
      {needsOnlyBase ? (
        <ProvenanceBadges
          provenance={{
            source: ContentSource.BASE, pack: null, maker: null, distributor: null,
          }}
        />
      ) : (
        <>
          <SourceChips packs={requires.packs} makers={requires.makers} />
          {uncredited ? (
            <ProvenanceBadges
              provenance={{
                source: ContentSource.MOD, pack: null, maker: null, distributor: null,
              }}
            />
          ) : null}
        </>
      )}

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
          <SourceChips packs={requires.widenedBy.packs} makers={requires.widenedBy.makers} />
        </>
      ) : null}
    </div>
  );
};
