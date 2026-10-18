import { PlayIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerSummary } from '../../../../shared/types';
import { ContentImage, NationFlag, trackPictureSources } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { EDITION_ACCENT, MODE_ACCENT } from '@/lib/accents';
import {
  isChampion, progressLine, standaloneName, standingLine,
} from '@/lib/standalone-wording';
import { cn } from '@/lib/utils.ts';
import { LadderChip } from '@/screens/championships';

interface StandaloneHeroProps {
  /**
   * The standalone championship picked.
   */
  career: CareerSummary;
  /**
   * Whether a command is in flight, which holds the button.
   */
  busy: boolean;
  /**
   * Called to open it where it was left - on its review, once it is over.
   */
  onContinue: () => void;
}

/**
 * The standalone championship picked, over its track's photograph, with the
 * way back into it - or, once its one season is over, the way to look back on
 * it.
 */
export const StandaloneHero = ({ career, busy, onContinue }: StandaloneHeroProps) => {
  const { t } = useTranslation();
  const {
    formatAgo, formatDayShort, formatNumber, formatYear,
  } = useFormat();
  const championship = career.championships[0];
  const { next, standing } = career;
  const over = standing?.over ?? false;
  const standingText = standing && standingLine(standing, t, formatNumber);

  return (
    <section className="relative min-h-52 overflow-hidden rounded-xl bg-scrim text-on-scrim">
      {career.track ? (
        <ContentImage sources={trackPictureSources(career.track)} alt="" className="object-cover" fallback={null} />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-scrim/95 via-scrim/70 to-scrim/10" />

      <div className="relative flex max-w-2xl flex-col gap-2 px-6 py-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={MODE_ACCENT.championship}>{t('start.mode.championship')}</Badge>
          {championship ? <LadderChip ladder={championship.ladder} /> : null}
          {standing && isChampion(standing) ? (
            <Badge className={cn('gap-1', EDITION_ACCENT.title)}>
              <TrophyIcon className="size-3" />
              {t('standalone.champion')}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <NationFlag code={career.driver.nation ?? undefined} className="h-[18px] w-[27px] rounded-[3px]" />
          <h2 className="text-2xl font-semibold">
            {standaloneName(career, t, formatYear)}
          </h2>
        </div>
        <p className="text-sm text-on-scrim/85">
          {t(standingText ? 'standalone.driverStanding' : 'standalone.driverLine', {
            driver: career.driver.name, progress: standing ? progressLine(standing, t) : '', standing: standingText,
          })}
        </p>
        {next ? (
          <p className="text-sm text-on-scrim/85">
            {t('standalone.next', { round: next.roundName, day: formatDayShort(next.date) })}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={busy} onClick={onContinue}>
            {over ? <TrophyIcon /> : <PlayIcon />}
            {over ? t('standalone.lookBack') : t('careers.continue')}
          </Button>
          <span className="text-sm text-on-scrim/80">
            {over ? t('standalone.overNote') : t('careers.played', { ago: formatAgo(career.playedAt) })}
          </span>
        </div>
      </div>
    </section>
  );
};
