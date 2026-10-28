import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ContractTable } from './ContractTable.tsx';
import { CurrentContract } from './CurrentContract.tsx';
import type { ContractPay } from '../../../../shared/types';
import { useSlot } from '@/app';
import {
  MoneyAmount, ScreenBody, ScreenHeader, Segments,
} from '@/components';
import { contractFigures, contractRows } from '@/lib/contracts';
import { path } from '@/lib/routes';
import { MoneyTile } from '@/screens/finances';

/**
 * Which contracts the table lists: all of them, or those paying on one basis.
 */
type PayFilter = 'all' | ContractPay;

export const Contracts = () => {
  const { t } = useTranslation();
  const { career } = useSlot();
  const [filter, setFilter] = useState<PayFilter>('all');
  const rows = useMemo(() => (career ? contractRows(career) : []), [career]);

  if (!career) return null;

  const figures = contractFigures(rows);
  const current = career.seasons.at(-1)?.index;
  const running = rows.filter((row) => row.end === 'running');
  const listed = rows.filter((row) => filter === 'all' || row.contract.pay === filter);
  // How the contracts came, naming only the ways that brought any.
  const origins = (['offered', 'renewal', 'bought', 'lifeline'] as const)
    .filter((origin) => figures.origins[origin] > 0)
    .map((origin) => t(`contracts.figures.${origin}`, { count: figures.origins[origin] }))
    .join(' · ');

  return (
    <ScreenBody className="flex flex-col gap-5 pb-6">
      <ScreenHeader back={{ to: path.home(), label: t('back.home') }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('contracts.title')}</h1>
          <span className="text-sm text-muted-foreground">{t('contracts.subtitle')}</span>
        </div>
      </ScreenHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyTile lead label={t('contracts.figures.signed')} value={figures.signed} hint={origins || t('contracts.figures.none')} />
        <MoneyTile label={t('contracts.figures.teams')} value={figures.teams} hint={t('contracts.figures.teamsHint')} />
        <MoneyTile
          label={t('contracts.figures.earned')}
          value={<MoneyAmount amount={figures.earned} />}
          hint={t('contracts.figures.earnedHint')}
        />
        <MoneyTile
          label={t('contracts.figures.paid')}
          value={<MoneyAmount amount={figures.paid} />}
          hint={t('contracts.figures.paidHint')}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('contracts.current')}
        </h2>
        {running.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {running.map((row) => (
              <CurrentContract key={`${row.season.index}:${row.entry.series}:${row.entry.edition}`} row={row} current={current} />
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">{t('contracts.noneCurrent')}</p>}
      </section>

      <section className="flex flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 pb-2">
          <h2 className="text-sm font-semibold">{t('contracts.every')}</h2>
          <Segments
            label={t('contracts.show')}
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'all', label: t('contracts.filter.all') },
              { id: 'salary', label: t('contracts.filter.salary') },
              { id: 'free', label: t('contracts.filter.free') },
              { id: 'seat', label: t('contracts.filter.seat') },
            ]}
          />
        </div>
        {listed.length > 0
          ? <ContractTable rows={listed} current={current} />
          : <p className="px-4 pb-4 text-sm text-muted-foreground">{t('contracts.empty')}</p>}
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">{t('contracts.netHint')}</p>
      </section>
    </ScreenBody>
  );
};
