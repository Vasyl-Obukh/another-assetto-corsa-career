import { useTranslation } from 'react-i18next';

import { HERO_TRACK } from './constants.ts';
import { laddersOf } from './utils.ts';
import type { SeriesListing } from '../../../../shared/types';
import { ContentImage, trackPictureSources } from '@/components';
import { fieldSize, LadderChip } from '@/screens/championships';

interface SeasonHeroProps {
  /**
   * The championship picked.
   */
  listing: SeriesListing;
}

/**
 * The championship picked, over its opening round's photograph: its rungs, its
 * name and how big a season it is.
 */
export const SeasonHero = ({ listing }: SeasonHeroProps) => {
  const { t } = useTranslation();
  const { series } = listing;

  return (
    <section className="relative min-h-38 overflow-hidden rounded-xl bg-scrim text-on-scrim">
      <ContentImage
        sources={trackPictureSources(series.rounds[0]?.track ?? HERO_TRACK)}
        alt=""
        className="object-cover"
        fallback={null}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-scrim/95 via-scrim/70 to-scrim/10" />
      <div className="relative flex flex-col gap-1.5 px-5 py-4">
        <div className="flex flex-wrap gap-1">
          {laddersOf(listing).map((ladder) => (
            <LadderChip key={`${ladder.discipline}-${ladder.tier}`} ladder={ladder} />
          ))}
        </div>
        <h2 className="text-xl font-semibold">{series.name}</h2>
        <p className="text-sm text-on-scrim/85">
          {t('newChampionship.summary', {
            rounds: t('newChampionship.rounds', { count: series.rounds.length }),
            cars: t('newChampionship.cars', { count: fieldSize(series) }),
            classes: t('newChampionship.classes', { count: series.entries.length }),
          })}
        </p>
      </div>
    </section>
  );
};
