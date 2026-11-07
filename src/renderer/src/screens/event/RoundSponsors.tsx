import { SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Career, CareerEventView } from '../../../../shared/types';
import {
  coversEntry, dealCovers, dealScale, goalStanding, judgedRaces,
} from '../../../../shared/utils/sponsors';
import { MoneyAmount, SIGNATURES, SponsorMark, SponsorPerks } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { CAUTION_ACCENT, KEEP_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface RoundSponsorsProps {
  /**
   * The career.
   */
  career: Career;
  /**
   * The round, as its page shows it.
   */
  view: Pick<CareerEventView, 'series' | 'season' | 'edition' | 'round'>;
}

/**
 * What a round means to the career's sponsors: before it runs, each sponsor's
 * prices and conditions and its goal's standing; once the player has driven
 * it, what each paid, session by session.
 */
export const RoundSponsors = ({ career, view }: RoundSponsorsProps) => {
  const { t } = useTranslation();
  const entry = career.seasons
    .find((one) => one.index === view.season)?.entries
    .find((one) => one.series === view.series && one.edition === view.edition && !one.withdrawn);
  const event = entry?.events.find((one) => one.round === view.round);
  if (!entry || !event) return null;

  const deals = career.sponsors.filter((deal) => coversEntry(deal, entry) && dealCovers(deal, event.date));
  if (deals.length === 0) return null;

  const lines = career.ledger.filter((line) => (
    line.sponsor && line.season === view.season && line.series === view.series
    && line.edition === view.edition && line.round === view.round
  ));
  const driven = deals.some((deal) => judgedRaces(career, deal).some((one) => one.event.raceId === event.raceId));
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <Card className="gap-2 py-3">
      <CardHeader className="px-3">
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-sponsor-foreground" />
          {t('event.sponsors.title')}
          {driven ? <MoneyAmount amount={total} className="ml-auto text-sm" /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col px-0">
        {deals.map((deal) => {
          const races = judgedRaces(career, deal).filter((one) => one.event.raceId === event.raceId);
          const own = lines.filter((line) => line.sponsor?.deal === deal.id);
          const on = goalStanding(career, deal).onCourse;
          const mark = on === true ? 'kept' : on === false ? 'short' : null;

          return (
            <div
              key={deal.id}
              className={cn(
                'flex flex-col gap-2 border-t px-3 py-2.5',
                deal.slot === 'main' ? 'shadow-[inset_3px_0_0_var(--sponsor-solid)]' : 'shadow-[inset_3px_0_0_var(--partner-solid)]',
              )}
            >
              <div className="flex items-center gap-2">
                <SponsorMark sponsor={deal.sponsor} slot={deal.slot} small />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{deal.sponsor.name}</span>
                {driven
                  ? <MoneyAmount amount={own.reduce((sum, line) => sum + line.amount, 0)} className="text-sm" />
                  : null}
                {!driven && mark ? <Badge className={KEEP_ACCENT[mark]}>{t(`championships.contract.mark.${mark}`)}</Badge> : null}
              </div>
              {driven ? (
                <div className="flex flex-col gap-1.5">
                  {races.filter((one) => one.paid).map((one) => {
                    const pay = own.find((line) => line.sponsor?.perk === 'racePay' && line.key.endsWith(`:${one.race.launch}`));
                    const qualifying = deal.target.kind === 'qualifying';

                    return (
                      <div key={one.race.launch} className="grid grid-cols-[max-content_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                        <Badge className={cn('px-1.5 py-0 text-[0.65rem]', SESSION_ACCENT[qualifying ? 'qualify' : 'race'])}>
                          {qualifying ? t('championships.sessionShort.qualify') : one.race.name}
                        </Badge>
                        <span className="truncate text-muted-foreground">
                          {t(one.onTarget ? 'event.sponsors.onTarget' : 'event.sponsors.short', {
                            place: qualifying ? one.place.qualifyingPosition ?? 0 : one.place.classPosition,
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {pay?.sponsor?.half ? <Badge className={CAUTION_ACCENT}>{t('event.sponsors.half')}</Badge> : null}
                          <MoneyAmount amount={pay?.amount ?? 0} className="text-sm" />
                        </span>
                      </div>
                    );
                  })}
                  {own.filter((line) => line.sponsor?.perk !== 'racePay').map((line) => (
                    <div key={line.key} className="grid grid-cols-[max-content_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                      <Badge className={cn('px-1.5 py-0 text-[0.65rem]', SESSION_ACCENT[line.sponsor?.perk === 'pole' ? 'qualify' : 'race'])}>
                        {line.sponsor?.perk === 'pole' ? t('championships.sessionShort.qualify') : line.race ?? ''}
                      </Badge>
                      <span className="truncate text-muted-foreground">{t(`event.sponsors.bonus.${(line.sponsor?.perk ?? 'podium') as 'win' | 'podium' | 'points' | 'pole'}`)}</span>
                      <MoneyAmount amount={line.amount} className="text-sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <SponsorPerks terms={deal} scale={dealScale(deal, career.level)} without={[...SIGNATURES, 'goalBonus']} />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
