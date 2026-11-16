import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LEDGER_FILTER_MEMORY } from './constants.ts';
import { KindBreakdown } from './KindBreakdown.tsx';
import { LedgerTable } from './LedgerTable.tsx';
import { MoneyTile } from './MoneyTile.tsx';
import { SeriesBreakdown } from './SeriesBreakdown.tsx';
import { seasonYear } from '../../../../shared/utils/editions';
import { useSlot } from '@/app';
import { MoneyAmount, ScreenBody, ScreenHeader, Segments } from '@/components';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { usePreference } from '@/hooks';
import { useFormat } from '@/i18n';
import {
  LEDGER_FILTERS, ledgerRows, ledgerSeasons, moneyFigures, shownBy,
} from '@/lib/finances';
import { path } from '@/lib/routes';
import { readOneOf } from '@/lib/stored-preference';

/**
 * The season picker's value for every season at once.
 */
const EVERY_SEASON = 'all';

/**
 * The career's money: what it holds, a season in figures, and every change of
 * it, a line each, saying what moved it. Reached from Home rather than the
 * navigation. The page holds still and only the ledger scrolls.
 *
 * Read off the career the slot already holds, so there is nothing to load.
 */
export const Finances = () => {
  const { t } = useTranslation();
  const { formatDay, formatMoney, formatYear } = useFormat();
  const { career } = useSlot();
  const current = career?.seasons.at(-1)?.index ?? 0;
  const [picked, setPicked] = useState<string>(String(current));
  const [filter, setFilter] = usePreference(LEDGER_FILTER_MEMORY, readOneOf(LEDGER_FILTERS, 'all'));

  const rows = useMemo(() => ledgerRows(career?.ledger ?? []), [career]);
  const seasons = useMemo(() => {
    const held = ledgerSeasons(career?.ledger ?? []);

    return held.includes(current) ? held : [current, ...held];
  }, [career, current]);

  if (!career) return null;

  const season = picked === EVERY_SEASON ? null : Number(picked);
  const inSeason = rows.filter((row) => season === null || row.line.season === season);
  const shown = inSeason.filter((row) => shownBy(row.line, filter)).reverse();
  const lines = inSeason.map((row) => row.line);
  const figures = moneyFigures(rows, season);
  const yearOf = (index: number): string => {
    const held = career.seasons.find((one) => one.index === index);

    return held ? formatYear(seasonYear(held)) : String(index + 1);
  };
  const stretch = season === null ? 'all' : 'season';

  return (
    <ScreenBody className="flex h-full flex-col gap-5 pb-6">
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('finances.title')}</h1>
          <span className="text-sm text-muted-foreground">{t('finances.subtitle')}</span>
        </div>
      </ScreenHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={picked} onValueChange={setPicked}>
          <SelectTrigger className="w-40" aria-label={t('finances.season')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((index) => <SelectItem key={index} value={String(index)}>{yearOf(index)}</SelectItem>)}
            <SelectItem value={EVERY_SEASON}>{t('finances.everySeason')}</SelectItem>
          </SelectContent>
        </Select>
        <Segments
          label={t('finances.show')}
          value={filter}
          onChange={setFilter}
          items={LEDGER_FILTERS.map((id) => ({ id, label: t(`finances.filter.${id}`) }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyTile
          lead="balance"
          label={t('finances.tile.balance')}
          value={formatMoney(career.money)}
          hint={t('finances.tile.on', { date: formatDay(career.date) })}
        />
        <MoneyTile
          label={t(`finances.tile.earned.${stretch}`)}
          value={<MoneyAmount amount={figures.earned} />}
          hint={t('finances.tile.prizes', { count: figures.prizes })}
        />
        <MoneyTile
          label={t(`finances.tile.spent.${stretch}`)}
          value={<MoneyAmount amount={figures.spent} />}
          hint={t('finances.tile.fees', { count: figures.fees })}
        />
        <MoneyTile
          label={t(`finances.tile.net.${stretch}`)}
          value={<MoneyAmount amount={figures.earned + figures.spent} className="text-foreground" />}
          hint={season === null
            ? t('finances.tile.since', { date: formatDay(career.startDate) })
            : t('finances.tile.opened', { amount: formatMoney(figures.opened) })}
        />
      </div>

      {/* Held at a height where the window allows, so only the ledger scrolls;
          a window too short for that lets the page scroll instead. */}
      <div className="flex min-h-80 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)]">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <h2 className="flex items-baseline gap-2 px-4 pt-3 pb-2 text-sm font-semibold">
            {t('finances.ledger')}
            <span className="font-normal text-muted-foreground">{t('finances.lines', { count: shown.length })}</span>
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {shown.length > 0
              ? <LedgerTable rows={shown} career={career} />
              : <p className="px-4 pb-4 text-sm text-muted-foreground">{t('finances.empty')}</p>}
          </div>
        </section>
        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <KindBreakdown lines={lines} />
          <SeriesBreakdown lines={lines} career={career} />
        </aside>
      </div>
    </ScreenBody>
  );
};
