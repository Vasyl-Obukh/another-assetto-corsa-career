import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { ChampionshipRun, SeasonEntry } from '../../../../shared/types';
import { editionsOf } from '../../../../shared/utils/editions';
import { Button } from '@/components/ui/button.tsx';
import { useChampionship } from '@/hooks';
import { useFormat } from '@/i18n';
import { editionName } from '@/lib/edition-names';
import { linkRun, path } from '@/lib/routes';
import type { EnterHint } from '@/screens/championships';

interface NextEditionCardProps {
  /**
   * The edition being looked back on.
   */
  entry: SeasonEntry;
  /**
   * The run after it.
   */
  next: ChampionshipRun;
  /**
   * The year that run falls in.
   */
  year: number;
  /**
   * The day it opens, as an ISO date, when the calendar already holds it.
   */
  opens: string | null;
  /**
   * Whether that run falls in the current season, which is when it can be
   * entered - and when its page is opened on it rather than on its own default.
   */
  open: boolean;
}

/**
 * What comes after the edition: the championship's next run, and the way into
 * its page with this edition's class and car already picked. Entering itself
 * stays the championship page's, which is what lets how a career gets into a
 * championship change without this card changing with it.
 */
export const NextEditionCard = ({
  entry, next, year, opens, open,
}: NextEditionCardProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  // The library's copy, which is what the next run would be entered from.
  const { listing } = useChampionship(entry.series);
  const editions = editionsOf(entry.championship);
  const name = editionName({ year, edition: next.edition, editions }, t);
  const hint: EnterHint = { entry: entry.entry, car: entry.car };
  const title = `${entry.championship.name} ${name}`;

  return (
    <section className="flex flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-sm">
      <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {t(editions > 1 ? 'review.next.edition' : 'review.next.season')}
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      {listing ? (
        <>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t('review.next.opens')}</dt>
              <dd>{opens ? formatDay(opens) : name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{t('review.next.rounds')}</dt>
              <dd>{t('review.next.roundsValue', { count: listing.series.rounds.length })}</dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-1">
            <Link
              to={path.championship(
                { id: entry.series },
                open ? linkRun(next, next.season, editions) : undefined,
              )}
              state={{ enter: hint }}
            >
              {t('review.next.enter', { edition: name })}
              <ArrowRightIcon />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t('review.next.hint', { edition: name })}</p>
        </>
      ) : <p className="text-sm text-muted-foreground">{t('review.next.gone')}</p>}
    </section>
  );
};
