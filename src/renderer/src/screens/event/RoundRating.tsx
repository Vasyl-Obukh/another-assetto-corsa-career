import { InfoIcon, MedalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RATING_K } from '../../../../shared/constants';
import type { RatingLine } from '../../../../shared/types';
import { fieldRating } from '../../../../shared/utils/career-eligibility';
import { RatingChange } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { sessionName } from '@/lib/session-labels';
import { disciplineKey, TierMedal, tierMetalKey } from '@/screens/championships';

interface RoundRatingProps {
  /**
   * What the round moved, oldest first: a line per session, and any rung it
   * opened.
   */
  lines: readonly RatingLine[];
}

/**
 * What a round did to the career's rating: a line per session with the place
 * against the place expected, its full working a click away, the round's total
 * for the discipline and the global rating, and any rung it opened.
 */
export const RoundRating = ({ lines }: RoundRatingProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatSigned } = useFormat();
  const sessions = lines.filter((line) => line.kind === 'race' || line.kind === 'qualifying');
  const promoted = lines.filter((line) => line.kind === 'promotion');
  const first = sessions[0];
  const last = sessions.at(-1);
  const discipline = first?.discipline;
  if (!first || !last || !discipline) return null;

  const before = (first.rating ?? 0) - first.change;
  const after = last.rating ?? 0;
  const globalBefore = first.global - first.globalChange;
  const percent = (share: number): string => formatNumber(Math.round(share * 100));

  return (
    <Card className="gap-2 py-3">
      <CardHeader className="px-3">
        <CardTitle className="flex items-center gap-2">
          <MedalIcon className="size-4 text-podium-gold-foreground" />
          {t('event.rating.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col px-3">
        {sessions.map((line) => {
          const { working } = line;
          const name = sessionName({ name: line.sessionName, type: line.kind === 'race' ? 'race' : 'qualify' }, t);
          const place = line.kind === 'race' ? 'event.rating.racePlace' : 'event.rating.qualifyingPlace';

          return (
            <div key={line.key} className="flex items-center gap-2 border-b py-2 text-sm">
              <div className="flex min-w-0 flex-1 flex-col">
                <span>
                  {t('event.rating.session', { name })}
                  <span className="font-semibold">{working ? t(place, { place: working.place, of: working.of }) : ''}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {working ? t(line.kind === 'race' ? 'event.rating.expectedRace' : 'event.rating.expectedQualifying', {
                    expected: working.expected, field: formatNumber(working.field),
                  }) : ''}
                </span>
              </div>
              <RatingChange change={line.change} />
              {working ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7" aria-label={t('event.rating.working')}>
                      <InfoIcon className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="left" align="start" className="flex w-80 flex-col gap-2 text-xs">
                    <span className="text-sm font-semibold">
                      {t('event.rating.session', { name })}
                      <RatingChange change={line.change} className="text-sm" />
                    </span>
                    <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                      <dt className="text-muted-foreground">{t('event.rating.from', { discipline: t(disciplineKey(discipline)) })}</dt>
                      <dd className="text-right font-semibold tabular-nums">{formatNumber((line.rating ?? 0) - line.change)}</dd>
                      <dt className="text-muted-foreground">{t('event.rating.classmates')}</dt>
                      <dd className="text-right font-semibold">
                        {t('event.rating.offsets', {
                          count: working.of - 1,
                          low: formatSigned(working.offsetLow),
                          high: formatSigned(working.offsetHigh),
                        })}
                      </dd>
                      <dt className="text-muted-foreground">{t('event.rating.rated')}</dt>
                      <dd className="text-right font-semibold tabular-nums">{formatNumber(working.field)}</dd>
                      <dd className="col-span-2 text-muted-foreground">
                        {t(line.historic ? 'event.rating.rungHistoric' : 'event.rating.rung', {
                          metal: t(tierMetalKey(working.rung)),
                          field: formatNumber(fieldRating(working.rung)),
                          tier: working.rung,
                        })}
                      </dd>
                      <dt className="text-muted-foreground">{t('event.rating.expectedLabel')}</dt>
                      <dd className="text-right font-semibold">
                        {t('event.rating.beat', { place: working.expected, share: percent(working.expectedShare) })}
                      </dd>
                      <dt className="text-muted-foreground">{t('event.rating.finished')}</dt>
                      <dd className="text-right font-semibold">
                        {t('event.rating.beat', { place: working.place, share: percent(working.beaten) })}
                      </dd>
                      <dt className="text-muted-foreground">{t('event.rating.weight')}</dt>
                      <dd className="text-right font-semibold">
                        {line.kind === 'race' ? t('event.rating.full') : t('event.rating.quarter')}
                      </dd>
                      <dt className="text-muted-foreground">{t('settings.ratingSpeed')}</dt>
                      <dd className="text-right font-semibold">{t('finances.speed', { speed: formatNumber(working.speed) })}</dd>
                    </dl>
                    <div className="flex items-center gap-2 border-t pt-2 font-mono">
                      {t('event.rating.sum', {
                        beaten: working.beaten.toFixed(2),
                        expected: working.expectedShare.toFixed(2),
                        k: formatNumber(RATING_K * working.weight),
                        speed: formatNumber(working.speed),
                      })}
                      <RatingChange change={line.change} className="ml-auto" />
                    </div>
                    {working.uncapped === undefined ? null : (
                      <span className="text-muted-foreground">
                        {t('event.rating.held', { from: formatNumber(working.uncapped) })}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {t('event.rating.global', {
                        from: formatNumber(line.global - line.globalChange), change: formatSigned(line.globalChange),
                      })}
                    </span>
                  </PopoverContent>
                </Popover>
              ) : null}
            </div>
          );
        })}
        <div className="flex items-center gap-2 border-b py-2 text-sm font-semibold">
          <Badge className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
          <span className="tabular-nums">{t('event.rating.fromTo', { from: formatNumber(before), to: formatNumber(after) })}</span>
          <RatingChange change={after - before} className="ml-auto" />
        </div>
        <div className="flex items-center gap-2 py-2 text-sm">
          {/* Neutral on purpose: the global rating belongs to no discipline. */}
          <Badge variant="secondary">{t('rating.global')}</Badge>
          <span className="tabular-nums">{t('event.rating.fromTo', { from: formatNumber(globalBefore), to: formatNumber(last.global) })}</span>
          <RatingChange change={last.global - globalBefore} className="ml-auto" />
        </div>
        {promoted.map((line) => (
          <div key={line.key} className={`mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${DISCIPLINE_ACCENT[discipline]}`}>
            <TierMedal tier={line.tier ?? 1} className="size-7 text-xs" />
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{t('event.rating.promoted', { tier: line.tier ?? 1 })}</span>
              {t('event.rating.promotedDetail', { metal: t(tierMetalKey(line.tier ?? 1)) })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
