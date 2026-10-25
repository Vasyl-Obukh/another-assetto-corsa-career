import { useTranslation } from 'react-i18next';

import { SUMMARY_TRACK } from './constants.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Discipline } from '../../../../shared/types';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';
import {
  ContentImage, NationFlag, Shimmer, trackPictureSources,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface SummaryPanelProps {
  /**
   * The driver's name, as typed so far.
   */
  name: string;
  /**
   * The driver's nation, or null for none.
   */
  nation: string | null;
  /**
   * The year the first season opens.
   */
  year: number;
  /**
   * The money it starts with.
   */
  money: number;
  /**
   * What every prize it earns is multiplied by.
   */
  prizeSpeed: number;
  /**
   * What every change of its rating is multiplied by.
   */
  ratingSpeed: number;
  /**
   * The rung it starts on, or null while the library is read.
   */
  level: number | null;
  /**
   * How many championships that rung opens per discipline, or null while the
   * library is read.
   */
  open: readonly { discipline: Discipline; count: number }[] | null;
}

/**
 * What a new career adds up to: who, when, what it starts with and how much of
 * the ladder that opens in each discipline.
 */
export const SummaryPanel = ({
  name, nation, year, money, prizeSpeed, ratingSpeed, level, open,
}: SummaryPanelProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney, formatNumber } = useFormat();

  return (
    <aside className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative h-30 bg-scrim text-on-scrim">
        <ContentImage sources={trackPictureSources(SUMMARY_TRACK)} alt="" className="object-cover" fallback={null} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent to-scrim/85" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <NationFlag code={nation ?? undefined} className="h-[18px] w-[27px] rounded-[3px]" />
          <span className="text-lg font-semibold [text-shadow:0_1px_3px_var(--scrim)]">{name.trim() || '-'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">{t('newCareer.summary.firstSeason')}</dt>
          <dd className="font-semibold tabular-nums">{year}</dd>
          <dt className="text-muted-foreground">{t('newCareer.summary.startsOn')}</dt>
          <dd className="font-semibold">{formatDay(`${year}-01-01`)}</dd>
          <dt className="text-muted-foreground">{t('newCareer.summary.money')}</dt>
          <dd className="font-semibold tabular-nums">{formatMoney(money)}</dd>
          <dt className="text-muted-foreground">{t('newCareer.summary.prizeSpeed')}</dt>
          <dd className="font-semibold tabular-nums">{t('finances.speed', { speed: formatNumber(prizeSpeed) })}</dd>
          <dt className="text-muted-foreground">{t('newCareer.summary.ratingSpeed')}</dt>
          <dd className="font-semibold tabular-nums">{t('finances.speed', { speed: formatNumber(ratingSpeed) })}</dd>
          <dt className="text-muted-foreground">{t('newCareer.summary.rating')}</dt>
          <dd className="font-semibold tabular-nums">
            {level === null ? <Shimmer className="h-4 w-12" /> : formatNumber(ratingFloor(level))}
          </dd>
        </dl>

        <div className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('newCareer.summary.openAt')}
          {level === null
            ? <Shimmer className="h-5 w-14 rounded-md" />
            : <Badge className={cn('normal-case', tierAccent(level))}>{t('championships.tier', { tier: level })}</Badge>}
        </div>
        <ul className="flex flex-col gap-1.5">
          {DISCIPLINES.map((discipline) => {
            const count = open?.find((one) => one.discipline === discipline)?.count;

            return (
              <li key={discipline} className="flex items-center gap-2 text-sm">
                <Badge className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
                <span className="ml-auto text-muted-foreground">
                  {count === undefined
                    ? <Shimmer className="h-3.5 w-24" />
                    : t('newCareer.summary.championships', { count })}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="rounded-r-md border-l-3 border-primary bg-primary/6 px-3 py-2 text-xs text-muted-foreground">
          {t('newCareer.summary.note')}
        </p>
      </div>
    </aside>
  );
};
