import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { editionAhead, racedLastSeason } from './utils.ts';
import type { CalendarEntry, CareerSeason } from '../../../../shared/types';
import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import { ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT, disciplineDot } from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { linkRun, path } from '@/lib/routes';
import { editionSummary } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';
import type { EnterHint } from '@/screens/championships';
import { disciplineKey } from '@/screens/championships';

interface NewSeasonProps {
  /**
   * The season just closed.
   */
  previous: CareerSeason;
  /**
   * The year now open.
   */
  year: number;
  /**
   * Every event of the new season, for when each championship opens.
   */
  events: readonly CalendarEntry[];
  /**
   * The ISO date the career's clock stands at.
   */
  clock: string;
  /**
   * Called to find a championship to enter.
   */
  onFind: () => void;
}

/**
 * What stands where the next event would at the start of a season nothing is
 * entered in yet: last season's championships, each a way into its page with
 * the class and car it was raced in already picked. Entering stays the page's
 * own, so how a career gets into a championship can change without this.
 */
export const NewSeason = ({
  previous, year, events, clock, onFind,
}: NewSeasonProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const raced = racedLastSeason(previous);

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm">
      <span className="text-[0.65rem] font-semibold tracking-wide text-primary uppercase">{t('home.newSeason.kicker')}</span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('home.newSeason.title', { year })}</h2>
        <p className="text-sm text-muted-foreground">{t('home.newSeason.hint')}</p>
      </div>

      <ul className="flex flex-col overflow-hidden rounded-lg border">
        {raced.flatMap((entry) => {
          // Offered at the edition still to come, so one already over this
          // year is passed for the next rather than opened to nothing.
          const ahead = editionAhead(events, entry.series, clock);
          if (!ahead) return [];
          const summary = editionSummary(entry, previous.index, clock);
          const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;
          const editions = editionsOf(entry.championship);
          const edition = editionName({ year, edition: ahead.edition, editions }, t);
          const opens = ahead.opens >= clock ? ahead.opens : null;
          const hint: EnterHint = { entry: entry.entry, car: entry.car };

          return [(
            <li key={`${entry.series}-${entry.entry}`} className="border-t first:border-t-0">
              <Link
                to={path.championship(
                  { id: entry.series },
                  linkRun({ season: 0, edition: ahead.edition }, 0, editions),
                )}
                state={{ enter: hint }}
                className="grid grid-cols-[0.25rem_minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <span
                  aria-hidden
                  className={cn('self-stretch rounded-full', disciplineDot(ladder))}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">{entry.championship.name}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {t('home.newSeason.lastYear')}
                    {summary.position === null
                      ? t('home.noPosition')
                      : <ResultCell position={summary.position} scored={summary.points > 0} prefixed size="sm" />}
                    {opens ? <span>{t('home.newSeason.opens', { edition, day: formatDayShort(opens) })}</span> : null}
                  </span>
                </span>
                {ladder ? (
                  <Badge className={DISCIPLINE_ACCENT[ladder.discipline]}>{t(disciplineKey(ladder.discipline))}</Badge>
                ) : <span />}
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  {t('home.newSeason.enter', { edition })}
                  <ChevronRightIcon className="size-4" />
                </span>
              </Link>
            </li>
          )];
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onFind}>{t('home.newSeason.find')}</Button>
        <Button asChild variant="ghost" className="text-primary">
          <Link to={path.yearReview({ season: previous.index })}>
            {t('home.newSeason.lookBack', { year: seasonYear(previous) })}
            <ChevronRightIcon />
          </Link>
        </Button>
      </div>
    </section>
  );
};
