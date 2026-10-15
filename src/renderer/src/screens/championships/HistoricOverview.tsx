import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { FormatStrip } from './FormatStrip.tsx';
import type { Championship, SeriesAvailability } from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { ClimateBadge } from '@/components';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { raceLength } from '@/lib/session-labels';
import { LayoutMap } from '@/screens/track-browser';

interface HistoricOverviewProps {
  /**
   * The historic event.
   */
  event: Championship;
  /**
   * What the install can race of it, which says how long its race comes to.
   */
  availability: SeriesAvailability;
}

/**
 * The small heading every tile of the overview wears.
 */
const TILE_LABEL = 'text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase';

// What a historic event says about itself, and where and how it runs: its
// track, its format, how long its race is and where its weather comes from.
export const HistoricOverview = ({ event, availability }: HistoricOverviewProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const round = event.rounds[0];
  const format = round ? formatOf(event, round) : null;
  const days = new Set(format?.sessions.map((session) => session.day ?? 0) ?? []).size;
  const races = availability.rounds[0]?.races ?? [];
  const climate = event.generatedWeather && round ? round.climate ?? event.generatedWeather.climate : null;

  return (
    <div className="flex flex-col gap-4">
      {event.description ? (
        <div className="flex flex-col gap-1 border-l-2 pl-3">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('historic.about.title')}
          </span>
          <p className="text-sm">{event.description}</p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {round ? (
          <Link
            to={path.track({ id: round.track.id }, round.track.layout)}
            title={t('historic.about.openTrack')}
            className="flex items-center gap-3 rounded-lg border p-2.5 hover-outline"
          >
            <span className="relative block aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <LayoutMap track={round.track} alt={round.name} className="p-1" />
            </span>
            <span className={TILE_LABEL}>{t('historic.about.track')}</span>
          </Link>
        ) : null}

        <div className="flex flex-col gap-1 rounded-lg border p-2.5">
          <span className={TILE_LABEL}>{t('historic.about.format')}</span>
          {format ? <FormatStrip sessions={format.sessions} /> : null}
          <span className="text-xs text-muted-foreground">{t('historic.about.days', { count: Math.max(1, days) })}</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border p-2.5">
          <span className={TILE_LABEL}>{t('historic.about.race')}</span>
          {races.map((race, at) => (
            // A race's name may repeat across a format, so its place is the key.
            // eslint-disable-next-line react/no-array-index-key
            <span key={at} className="text-sm font-semibold tabular-nums">{raceLength(race, t, formatNumber)}</span>
          ))}
        </div>

        <div className="flex flex-col items-start gap-1 rounded-lg border p-2.5">
          <span className={TILE_LABEL}>{t('historic.about.weather')}</span>
          {climate ? <ClimateBadge climate={climate} /> : null}
          <span className="text-xs text-muted-foreground">
            {t(climate ? 'historic.about.drawn' : 'historic.about.authored')}
          </span>
        </div>
      </div>
    </div>
  );
};
