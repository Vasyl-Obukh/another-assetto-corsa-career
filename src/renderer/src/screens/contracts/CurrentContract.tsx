import { CarIcon, ChevronRightIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import {
  BudgetBadge, carPictureSources, ContentImage, NationFlag,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, DISCIPLINE_ACCENT } from '@/lib/accents';
import type { ContractRow } from '@/lib/contracts';
import { editionName } from '@/lib/edition-names';
import { linkRun, path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, KeepBlock, tierAccent } from '@/screens/championships';

interface CurrentContractProps {
  /**
   * The contract, still being raced.
   */
  row: ContractRow;
  /**
   * The season the career is in, which a link to the championship leaves
   * unsaid.
   */
  current: number | undefined;
}

// A contract the career holds now: the team and its car, what it pays, how far
// through the season it is and where the player stands - and what keeps them
// on, beside where they stand against it.
export const CurrentContract = ({ row, current }: CurrentContractProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const {
    entry, contract, season, standing,
  } = row;
  const carName = useCarNames([entry.car.model]);
  const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;
  const entryName = entry.championship.entries.find((one) => one.id === entry.entry)?.name ?? entry.entry;
  const editions = editionsOf(entry.championship);
  const run = editionName({ year: seasonYear(season), edition: entry.edition, editions }, t);

  let pay: [string, string] = [t('contracts.tile.free'), t('contracts.tile.freeHint')];
  if (contract.pay === 'salary') {
    pay = [formatMoney(contract.amount), t('contracts.tile.salaryHint')];
  } else if (contract.pay === 'seat') {
    pay = [formatMoney(contract.amount), t(contract.bought ? 'contracts.tile.bought' : 'contracts.tile.seatHint')];
  }
  const tiles: [string, string, string][] = [
    [t(contract.pay === 'seat' ? 'contracts.tile.seat' : 'contracts.tile.pay'), ...pay],
    [t('contracts.tile.earned'), formatMoney(row.earned), t('contracts.tile.earnedHint')],
    [t('contracts.tile.rounds'), t('contracts.tile.roundsValue', { raced: row.raced, count: entry.events.length }), ''],
    [
      t('contracts.tile.standing'),
      standing.place === null ? t('contracts.table.none') : t('championships.contract.place', { place: standing.place }),
      standing.mate === null ? '' : t('contracts.tile.mate', { place: standing.mate }),
    ],
  ];

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-t-3 border-t-contract-solid bg-card">
      <div className="flex items-center gap-3 border-b bg-muted/30 p-3">
        <span className="relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-md bg-muted">
          <ContentImage
            sources={carPictureSources(entry.car.model, entry.car.skin)}
            alt={carName(entry.car.model)}
            className="object-cover"
            fallback={(
              <span className="absolute inset-0 grid place-items-center">
                <CarIcon className="size-5 text-muted-foreground/40" />
              </span>
            )}
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-1">
            <BudgetBadge budget={contract.budget} />
            {ladder ? (
              <Badge className={DISCIPLINE_ACCENT[ladder.discipline]}>{t(disciplineKey(ladder.discipline))}</Badge>
            ) : null}
            {ladder ? <Badge className={tierAccent(ladder.tier)}>{t('championships.tier', { tier: ladder.tier })}</Badge> : null}
            {contract.renews ? (
              <Badge className={cn('gap-1', CONTRACT_ACCENT)}>
                <RefreshCwIcon className="size-3" />
                {t('contracts.origin.renewal')}
              </Badge>
            ) : null}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 font-semibold">
            <span className="truncate">{contract.teamName}</span>
            {contract.nation ? <NationFlag code={contract.nation} /> : null}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {[`${entry.championship.name} ${run}`, entryName, carName(entry.car.model)].join(' · ')}
          </span>
        </span>
        <Link
          to={path.championship(
            { id: entry.series },
            linkRun({ season: season.index, edition: entry.edition }, current, editions),
          )}
          className="flex shrink-0 items-center gap-0.5 self-start text-xs text-muted-foreground hover:text-foreground"
        >
          {t('contracts.open')}
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5 border-r px-3 py-2.5 last:border-r-0">
            <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="truncate font-semibold tabular-nums">{value}</dd>
            {hint ? <dd className="truncate text-xs text-muted-foreground">{hint}</dd> : null}
          </div>
        ))}
      </dl>
      <div className="border-t p-3">
        <KeepBlock contract={contract} standing={standing} />
      </div>
    </section>
  );
};
