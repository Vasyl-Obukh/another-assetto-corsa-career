import { useTranslation } from 'react-i18next';

import type { CalendarEntry, CareerSeason } from '../../../../shared/types';
import { seasonYear } from '../../../../shared/utils/editions';
import { ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { EDITION_ACCENT, ROUND_MARK } from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { editionSummary } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';

interface EditionSwitcherProps {
  /**
   * The championship, by its id.
   */
  series: string;
  /**
   * How many editions it runs a season.
   */
  editions: number;
  /**
   * The season shown, which is the current one.
   */
  season: CareerSeason;
  /**
   * Every event of the season, for when each edition runs.
   */
  events: readonly CalendarEntry[];
  /**
   * The ISO date the career's clock stands at.
   */
  clock: string;
  /**
   * The edition the page is showing.
   */
  selected: number;
  /**
   * Called with the edition picked.
   * @param edition Which of the season's editions, counting from zero
   */
  onSelect: (edition: number) => void;
}

/**
 * The season's editions of a championship that runs more than once a year,
 * side by side: when each runs, how far it has got and the player's part in it.
 * The page below shows whichever is picked.
 */
export const EditionSwitcher = ({
  series, editions, season, events, clock, selected, onSelect,
}: EditionSwitcherProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const year = seasonYear(season);

  return (
    <div
      role="tablist"
      aria-label={t('championships.editions.label')}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${editions}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: editions }, (unused, edition) => {
        const dates = [...new Set(events
          .filter((one) => one.series === series && one.edition === edition)
          .map((one) => one.date))].sort();
        const first = dates[0];
        const last = dates.at(-1);
        const entry = season.entries.find((one) => one.series === series && one.edition === edition && !one.withdrawn);
        const summary = entry ? editionSummary(entry, season.index, clock) : null;
        const nextAt = entry?.events.findIndex((one) => one.status === 'scheduled') ?? -1;

        let status: string | null = null;
        if (summary?.over) {
          status = summary.title
            ? t('championships.editions.won')
            : t('championships.editions.finished', { position: summary.position ?? 0 });
        } else if (entry && nextAt >= 0) status = t('championships.editions.next', { number: nextAt + 1 });
        else if (last !== undefined && last < clock) status = t('championships.editions.over');
        else if (first !== undefined && first <= clock) status = t('championships.editions.running');
        else if (first !== undefined) status = t('championships.editions.opens', { day: formatDayShort(first) });

        return (
          <button
            key={edition}
            type="button"
            role="tab"
            aria-selected={edition === selected}
            onClick={() => onSelect(edition)}
            className={cn(
              'flex min-h-20 min-w-0 flex-col gap-1.5 rounded-lg border bg-card px-3 py-2.5 text-left shadow-sm transition-colors hover:border-primary/50',
              edition === selected && 'border-primary ring-1 ring-primary',
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              {editionName({ year, edition, editions }, t)}
              <span className="ml-auto">
                {summary?.over && summary.position !== null ? (
                  <ResultCell position={summary.position} scored={summary.points > 0} prefixed size="sm" />
                ) : null}
                {entry && !summary?.over ? (
                  <Badge className={EDITION_ACCENT.running}>{t('championships.editions.entered')}</Badge>
                ) : null}
              </span>
            </span>
            {entry ? (
              <span className="flex gap-0.5" aria-hidden>
                {entry.events.map((one, at) => {
                  let mark: keyof typeof ROUND_MARK = 'later';
                  if (one.status === 'raced') mark = 'raced';
                  else if (one.status === 'missed') mark = 'missed';
                  else if (at === nextAt) mark = 'next';

                  return <span key={one.round} className={cn('h-1.5 flex-1 rounded-full', ROUND_MARK[mark])} />;
                })}
              </span>
            ) : null}
            <span className="truncate text-xs text-muted-foreground">
              {[
                first && last ? t('championships.editions.span', { from: formatDayShort(first), to: formatDayShort(last) }) : null,
                status,
              ].filter((part) => part !== null).join(' · ')}
            </span>
          </button>
        );
      })}
    </div>
  );
};
