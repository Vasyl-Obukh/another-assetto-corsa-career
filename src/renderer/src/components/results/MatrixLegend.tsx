import { useTranslation } from 'react-i18next';

import { ResultCell } from './ResultCell.tsx';
import type { StandingsView } from './types.ts';
import type { Championship } from '../../../../shared/types';
import { useFormat } from '@/i18n';

interface MatrixLegendProps {
  /**
   * The championship, whose own bonus rules the legend states.
   */
  series: Championship;
  /**
   * Whether the grid shows teams.
   */
  teams: boolean;
  /**
   * What a driver's cell says.
   */
  view: StandingsView;
  /**
   * Whether a round's heading opens it.
   */
  openable: boolean;
}

/**
 * What the season grid's colours and marks mean. The bonuses are stated as this
 * championship pays them, and one it does not pay is not mentioned at all.
 */
export const MatrixLegend = ({
  series, teams, view, openable,
}: MatrixLegendProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  // Each distinct rule once, however many points systems state it.
  const qualifying = [...new Set(series.pointsSystems
    .map((system) => (system.qualifying ?? []).filter((one) => one > 0).map(formatNumber).join(', '))
    .filter((rule) => rule !== ''))];
  const fastest = [...new Set(series.pointsSystems
    .map((system) => system.fastestLap ?? 0)
    .filter((points) => points > 0))];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-4 py-2.5 text-xs text-muted-foreground">
      {teams ? <span>{t('standings.legend.teams')}</span> : (
        <>
          <span className="flex items-center gap-1">
            <ResultCell size="sm" position={1} scored />
            <ResultCell size="sm" position={2} scored />
            <ResultCell size="sm" position={3} scored />
            {t('standings.legend.podium')}
          </span>
          <span className="flex items-center gap-1.5">
            <ResultCell size="sm" position={6} scored />
            {t('standings.legend.points')}
          </span>
          <span className="flex items-center gap-1.5">
            <ResultCell size="sm" position={14} scored={false} />
            {t('standings.legend.noPoints')}
          </span>
          {view === 'positions' ? (
            <>
              <span className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-session-qualify-foreground" />
                {t('standings.legend.pole')}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-1.5 rounded-full bg-primary" />
                {t('standings.legend.fastestLap')}
              </span>
            </>
          ) : (
            <>
              {qualifying.map((rule) => (
                <span key={rule} className="flex items-center gap-1">
                  <sup className="font-bold text-session-qualify-foreground">{t('standings.bonus.sample')}</sup>
                  {t('championships.detail.qualifyingPays', { points: rule })}
                </span>
              ))}
              {fastest.map((points) => (
                <span key={points} className="flex items-center gap-1">
                  <sup className="font-bold text-primary">{t('standings.bonus.sample')}</sup>
                  {t('championships.detail.fastestLapPays', { points: formatNumber(points) })}
                </span>
              ))}
            </>
          )}
        </>
      )}
      {openable ? <span className="ml-auto">{t('standings.legend.openRound')}</span> : null}
    </div>
  );
};
