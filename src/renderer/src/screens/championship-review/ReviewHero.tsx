import { CheckIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { LadderPosition, Round } from '../../../../shared/types';
import { ContentImage, ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { DISCIPLINE_ACCENT, EDITION_ACCENT, resultAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierAccent } from '@/screens/championships';
import { layoutImageSources } from '@/screens/track-browser';

interface ReviewHeroProps {
  /**
   * The championship's display name.
   */
  name: string;
  /**
   * The edition's name - its year, or its half or quarter of one.
   */
  edition: string;
  /**
   * The class's discipline and rung, or null when the class has gone.
   */
  ladder: LadderPosition | null;
  /**
   * The edition's last round, whose circuit the head is pictured with.
   */
  finale: Round | undefined;
  /**
   * What the edition was, a part at a time: its rounds, its races, its dates,
   * the team and the car.
   */
  line: readonly string[];
  /**
   * Whether its last round has run.
   */
  over: boolean;
  /**
   * Where the player finished, or null when they hold no place.
   */
  position: number | null;
  /**
   * How many drivers the class's table holds.
   */
  field: number;
  /**
   * The player's points.
   */
  points: number;
}

/**
 * A review's head: the finale's circuit behind the championship, and the place
 * the player finished in large at its right.
 */
export const ReviewHero = ({
  name, edition, ladder, finale, line, over, position, field, points,
}: ReviewHeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-52 overflow-hidden rounded-xl bg-scrim text-on-scrim">
      {finale ? (
        <ContentImage
          sources={layoutImageSources({ id: finale.track.id, layout: finale.track.layout ?? '' })}
          alt=""
          className="object-cover opacity-90"
          fallback={null}
        />
      ) : null}
      <span className="absolute inset-0 bg-gradient-to-r from-scrim/95 via-scrim/60 to-scrim/25" />

      <div className="relative flex max-w-[calc(100%-9rem)] flex-col gap-2 px-6 py-6">
        <div className="flex flex-wrap items-center gap-1.5">
          {ladder ? (
            <>
              <Badge className={DISCIPLINE_ACCENT[ladder.discipline]}>{t(disciplineKey(ladder.discipline))}</Badge>
              <Badge className={tierAccent(ladder.tier)}>{t('championships.tier', { tier: ladder.tier })}</Badge>
            </>
          ) : null}
          {/* Neutral on purpose: an edition's name is an identifier, not one of a set. */}
          <Badge variant="secondary">{edition}</Badge>
          <Badge className={over ? EDITION_ACCENT.over : EDITION_ACCENT.running}>
            {over ? <CheckIcon /> : null}
            {t(over ? 'review.complete' : 'review.underWay')}
          </Badge>
        </div>
        <h1 className="text-3xl leading-tight font-semibold" data-selectable>{name}</h1>
        <p className="text-sm opacity-85">{line.join(' · ')}</p>
      </div>

      {position === null ? null : (
        <div className="absolute top-1/2 right-6 flex -translate-y-1/2 flex-col items-center gap-1.5 text-center">
          <ResultCell
            position={position}
            scored={points > 0}
            prefixed
            size="lg"
            // A finish that scored nothing has no fill of its own, and would
            // vanish into the photograph; a card's own surface carries it.
            className={cn(
              'h-14 min-w-18 rounded-xl text-3xl shadow-lg',
              resultAccent(position, points > 0) === undefined && 'bg-card text-card-foreground',
            )}
          />
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {position === 1 && over ? <TrophyIcon className="size-4" /> : null}
            {position === 1 && over ? t('review.champion') : t('review.place', { position, count: field })}
          </span>
          <span className="text-xs opacity-85">{t('review.points', { count: points })}</span>
        </div>
      )}
    </section>
  );
};
