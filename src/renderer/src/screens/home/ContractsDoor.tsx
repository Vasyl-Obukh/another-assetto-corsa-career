import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT, DOOR_LINES } from './constants.ts';
import { Door } from './Door.tsx';
import type { Career } from '../../../../shared/types';
import { MoneyAmount } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { KEEP_ACCENT } from '@/lib/accents';
import { contractFigures, contractRows, keepMark } from '@/lib/contracts';
import { path } from '@/lib/routes';

interface ContractsDoorProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Home's way into Contracts, previewing the teams the career races for now -
 * each with where the player stands against what keeps them on - and what
 * every contract it signed came to.
 */
export const ContractsDoor = ({ career }: ContractsDoorProps) => {
  const { t } = useTranslation();
  const rows = contractRows(career);
  const figures = contractFigures(rows);
  const running = rows.filter((row) => row.end === 'running').slice(0, DOOR_LINES - 1);

  return (
    <Door
      to={path.contracts()}
      accent={DOOR_ACCENT.contracts}
      icon="contracts"
      title={t('home.doors.contracts.title')}
      hint={t('home.doors.contracts.hint')}
      kicker={t('home.doors.contracts.current')}
    >
      {running.length === 0 ? <p className="text-sm text-muted-foreground">{t('home.doors.contracts.none')}</p> : null}
      {running.map((row) => {
        const mark = keepMark(row.contract, row.standing);

        return (
          <p key={`${row.entry.series}:${row.entry.edition}`} className="flex min-w-0 items-center justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">
              {t('home.doors.contracts.line', { team: row.contract.teamName, series: row.entry.championship.name })}
            </span>
            {mark
              ? <Badge className={KEEP_ACCENT[mark]}>{t(`championships.contract.mark.${mark}`)}</Badge>
              : <span className="shrink-0 text-xs text-muted-foreground">{t('championships.contract.unplaced')}</span>}
          </p>
        );
      })}
      <p className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-muted-foreground">{t('home.doors.contracts.signed', { count: figures.signed })}</span>
        <MoneyAmount amount={figures.earned + figures.paid} className="text-sm" />
      </p>
    </Door>
  );
};
