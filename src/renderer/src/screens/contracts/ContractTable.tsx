import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import { BudgetBadge, MoneyAmount } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_END_ACCENT, DISCIPLINE_ACCENT, resultAccent } from '@/lib/accents';
import type { ContractRow } from '@/lib/contracts';
import { editionName } from '@/lib/edition-names';
import { offerSummary } from '@/lib/inbox';
import { linkRun, path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface ContractTableProps {
  /**
   * Every contract to list, the newest first.
   */
  rows: readonly ContractRow[];
  /**
   * The season the career is in, which a link to a championship leaves unsaid.
   */
  current: number | undefined;
}

// Every contract the career signed, a season at a time: the championship and
// the class, the team, its terms, how it came, where the player finished, what
// it came to and how it ended.
export const ContractTable = ({ rows, current }: ContractTableProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney, formatYear } = useFormat();
  const seasons = [...new Set(rows.map((row) => row.season))];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          <th className="px-3 py-2 font-medium">{t('contracts.table.season')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.championship')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.team')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.terms')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.how')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.result')}</th>
          <th className="px-3 py-2 text-right font-medium">{t('contracts.table.net')}</th>
          <th className="px-3 py-2 font-medium">{t('contracts.table.ended')}</th>
        </tr>
      </thead>
      <tbody>
        {seasons.map((season) => (
          <Fragment key={season.index}>
            <tr className="border-b bg-muted/40">
              <td colSpan={8} className="px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {formatYear(seasonYear(season))}
              </td>
            </tr>
            {rows.filter((row) => row.season === season).map((row) => {
              const { entry, contract } = row;
              const editions = editionsOf(entry.championship);
              const classEntry = entry.championship.entries.find((one) => one.id === entry.entry);
              // Where the player finished, once the season is over.
              const finished = row.end === 'running' ? null : row.standing.place;
              let sub: string | null = null;
              if (row.end === 'running') sub = t('contracts.table.raced', { raced: row.raced, count: entry.events.length });
              else if (row.end === 'terminated' && contract.ended) sub = t('contracts.table.terminatedOn', { day: formatDayShort(contract.ended) });
              else if (row.renewal) sub = t(`contracts.table.renewal.${row.renewal}`);

              return (
                <tr key={`${entry.series}:${entry.edition}`} className="border-b last:border-b-0">
                  <td className="px-3 py-2 align-middle tabular-nums">
                    {editionName({ year: seasonYear(season), edition: entry.edition, editions }, t)}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <Link
                      to={path.championship(
                        { id: entry.series },
                        linkRun({ season: season.index, edition: entry.edition }, current, editions),
                      )}
                      className="font-semibold hover:underline"
                    >
                      {entry.championship.name}
                    </Link>
                    <span className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      {classEntry ? (
                        <>
                          <Badge className={DISCIPLINE_ACCENT[classEntry.ladder.discipline]}>
                            {t(disciplineKey(classEntry.ladder.discipline))}
                          </Badge>
                          <Badge className={tierAccent(classEntry.ladder.tier)}>{t('championships.tier', { tier: classEntry.ladder.tier })}</Badge>
                          <span>{classEntry.name}</span>
                        </>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <span className="block font-semibold">{contract.teamName}</span>
                    <BudgetBadge budget={contract.budget} className="mt-1" />
                  </td>
                  <td className="px-3 py-2 align-middle text-xs">{offerSummary(contract, t, formatMoney)}</td>
                  <td className="px-3 py-2 align-middle text-xs text-muted-foreground">{t(`contracts.origin.${row.origin}`)}</td>
                  <td className="px-3 py-2 align-middle">
                    {/* Fourth and below stay unfilled, as every result does. */}
                    {finished !== null ? (
                      <Badge variant="outline" className={cn('tabular-nums', resultAccent(finished, false))}>
                        {t('championships.contract.place', { place: finished })}
                      </Badge>
                    ) : <span className="text-muted-foreground">{t('contracts.table.none')}</span>}
                  </td>
                  <td className="px-3 py-2 text-right align-middle">
                    <MoneyAmount amount={row.earned + row.paid} />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <Badge className={CONTRACT_END_ACCENT[row.end]}>{t(`contracts.ended.${row.end}`)}</Badge>
                    {sub ? <span className="mt-1 block text-xs text-muted-foreground">{sub}</span> : null}
                  </td>
                </tr>
              );
            })}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};
