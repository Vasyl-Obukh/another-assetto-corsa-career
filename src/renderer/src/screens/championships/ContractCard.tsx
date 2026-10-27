import { CarIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { TerminateDialog } from './TerminateDialog.tsx';
import type {
  Career, CareerSeason, Contract, SeasonEntry,
} from '../../../../shared/types';
import { coveredFee } from '../../../../shared/utils/contracts';
import {
  BudgetBadge, carPictureSources, ContentImage,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { bonusLine } from '@/lib/inbox';
import { path } from '@/lib/routes';

interface ContractCardProps {
  /**
   * The career, whose ledger says what the contract has paid so far.
   */
  career: Career;
  /**
   * The season the edition falls in.
   */
  season: CareerSeason;
  /**
   * The edition raced under the contract.
   */
  entry: SeasonEntry;
  /**
   * The contract.
   */
  contract: Contract;
  /**
   * Whether the edition is still being raced, which is when it can be
   * terminated.
   */
  live: boolean;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to terminate it, once the player has confirmed what that costs.
   */
  onTerminate: () => void;
}

// The contract a championship is raced under, where the Enter panel stands for
// one entered on the player's own: the team's car, every term in a figure, and
// what it has come to so far - and the way out of it.
export const ContractCard = ({
  career, season, entry, contract, live, busy, onTerminate,
}: ContractCardProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const carName = useCarNames([entry.car.model]);
  const [terminating, setTerminating] = useState(false);

  const raced = entry.events.filter((event) => event.status === 'raced');
  const salaries = new Set(entry.events.map((event) => `salary:${event.raceId}`));
  const lines = career.ledger.filter((line) => line.season === season.index);
  const salary = lines.filter((line) => salaries.has(line.key)).reduce((sum, line) => sum + line.amount, 0);
  const prizes = lines
    .filter((line) => (line.kind === 'race' || line.kind === 'standings')
      && line.series === entry.series && line.edition === entry.edition)
    .reduce((sum, line) => sum + line.amount, 0);
  const covered = raced.reduce((sum, event) => sum + coveredFee(contract, event.entryFee ?? 0), 0);

  let pay: [string, string] = [t('championships.contract.pay'), t('championships.contract.free')];
  if (contract.pay === 'salary') {
    pay = [t('championships.contract.salary'), t('championships.contract.salaryValue', { amount: formatMoney(contract.amount) })];
  } else if (contract.pay === 'seat') {
    pay = [t('championships.contract.seat'), t('championships.contract.seatValue', { amount: formatMoney(contract.amount) })];
  }
  const bonus = bonusLine(contract.bonus, t, formatMoney);
  const terms: [string, string][] = [
    pay,
    [
      t('championships.contract.fees'),
      t(contract.feeCover >= 1 ? 'championships.contract.covered' : 'championships.contract.half'),
    ],
    [t('championships.contract.share'), t('championships.contract.shareValue', { share: contract.prizeShare })],
    ...(bonus ? [[t('championships.contract.bonus'), bonus] as [string, string]] : []),
    [
      t('championships.contract.missed'),
      t(contract.pay === 'seat' ? 'championships.contract.noFine' : 'championships.contract.fine'),
    ],
  ];
  const soFar: [string, string][] = [
    ...(contract.pay === 'salary' ? [[
      t('championships.contract.salarySoFar'),
      t('championships.contract.salarySoFarValue', { paid: formatMoney(salary), total: formatMoney(contract.amount) }),
    ] as [string, string]] : []),
    [t('championships.contract.prizesSoFar'), formatMoney(prizes)],
    [t('championships.contract.feesPaid'), formatMoney(covered)],
  ];

  return (
    <Card className="gap-0 overflow-hidden border-t-3 border-t-contract-solid py-0">
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{t('championships.contract.title')}</span>
          <BudgetBadge budget={contract.budget} />
        </div>
        <div className="flex items-center gap-3">
          <span className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            <ContentImage
              sources={carPictureSources(entry.car.model, entry.car.skin)}
              alt={carName(entry.car.model)}
              className="object-cover"
              fallback={(
                <span className="absolute inset-0 grid place-items-center">
                  <CarIcon className="size-4 text-muted-foreground/40" />
                </span>
              )}
            />
          </span>
          <span className="flex min-w-0 flex-col text-sm">
            <span className="truncate font-medium">{carName(entry.car.model)}</span>
            <span className="truncate text-xs text-muted-foreground">{contract.teamName}</span>
          </span>
        </div>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t pt-2.5 text-xs">
          {terms.map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t pt-2.5 text-xs">
          <dt className="col-span-2 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('championships.contract.soFar', { raced: raced.length, count: entry.events.length })}
          </dt>
          {soFar.map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        {live ? (
          <Button variant="ghost" size="sm" className="-ml-2" disabled={busy} onClick={() => setTerminating(true)}>
            {t('championships.contract.terminate')}
          </Button>
        ) : <span />}
        <Link
          to={path.inbox(contract.offer)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <MailIcon className="size-3.5" />
          {t('championships.contract.read')}
        </Link>
      </div>

      <TerminateDialog
        open={terminating}
        entry={entry}
        contract={contract}
        busy={busy}
        onClose={() => setTerminating(false)}
        onConfirm={() => {
          setTerminating(false);
          onTerminate();
        }}
      />
    </Card>
  );
};
