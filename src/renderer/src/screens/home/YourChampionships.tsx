import { useTranslation } from 'react-i18next';

import { ChampionshipRow } from './ChampionshipRow.tsx';
import { MarkLegend } from './MarkLegend.tsx';
import type { SeasonProgress } from './types.ts';

interface YourChampionshipsProps {
  /**
   * Every championship entered this season.
   */
  rows: readonly SeasonProgress[];
}

export const YourChampionships = ({ rows }: YourChampionshipsProps) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-3 shadow-sm">
      <header className="flex items-baseline justify-between gap-3 px-2 pt-1 pb-1">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('home.yourChampionships')}
        </h2>
        <span className="text-xs text-muted-foreground">{t('home.entered', { count: rows.length })}</span>
      </header>

      {rows.length === 0 ? (
        <p className="px-2 py-4 text-sm text-muted-foreground">{t('home.noneEntered')}</p>
      ) : rows.map((row) => <ChampionshipRow key={`${row.series}-${row.edition}-${row.entry}`} progress={row} />)}

      {rows.length > 0 ? <MarkLegend /> : null}
    </section>
  );
};
