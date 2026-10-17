import { PlayIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerSummary } from '../../../../shared/types';
import { ContentImage, NationFlag, trackPictureSources } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { MODE_ACCENT } from '@/lib/accents';

interface CareerHeroProps {
  /**
   * The career picked.
   */
  career: CareerSummary;
  /**
   * Whether a command is in flight, which holds the button.
   */
  busy: boolean;
  /**
   * Called to open it where it was left.
   */
  onContinue: () => void;
}

/**
 * The career picked, over its track's photograph, with the way back into it.
 */
export const CareerHero = ({ career, busy, onContinue }: CareerHeroProps) => {
  const { t } = useTranslation();
  const {
    formatAgo, formatDay, formatDayShort, formatYear,
  } = useFormat();
  const { next } = career;

  return (
    <section className="relative min-h-52 overflow-hidden rounded-xl bg-scrim text-on-scrim">
      {career.track ? (
        <ContentImage sources={trackPictureSources(career.track)} alt="" className="object-cover" fallback={null} />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-scrim/95 via-scrim/70 to-scrim/10" />

      <div className="relative flex max-w-2xl flex-col gap-2 px-6 py-5">
        <div className="flex items-center gap-1.5">
          <Badge className={MODE_ACCENT.career}>{t('start.mode.career')}</Badge>
          {/* A year is an identifier rather than one of a set, so it stays
              neutral. */}
          <Badge variant="secondary">{t('careers.season', { year: formatYear(career.year) })}</Badge>
        </div>
        <div className="flex items-center gap-2.5">
          <NationFlag code={career.driver.nation ?? undefined} className="h-[18px] w-[27px] rounded-[3px]" />
          <h2 className="text-2xl font-semibold">{career.driver.name}</h2>
        </div>
        <p className="text-sm text-on-scrim/85">
          {t('careers.seasons', { count: career.seasons, day: formatDay(career.date) })}
        </p>
        <p className="text-sm text-on-scrim/85">
          {next ? t(next.historic ? 'careers.nextHistoric' : 'careers.next', {
            series: next.seriesName, round: next.roundName, day: formatDayShort(next.date),
          }) : t('careers.nothingNext')}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={busy} onClick={onContinue}>
            <PlayIcon />
            {t('careers.continue')}
          </Button>
          <span className="text-sm text-on-scrim/80">{t('careers.played', { ago: formatAgo(career.playedAt) })}</span>
        </div>
      </div>
    </section>
  );
};
