import { CarIcon, TrophyIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { seatCar } from './utils.ts';
import type { SeasonEntry } from '../../../../shared/types';
import { carPictureSources, ContentImage, DriverName } from '@/components';
import { seatNation, teamName, teamNation } from '@/lib/season-results';
import type { ClassChampions } from '@/lib/season-review';

interface ChampionsCardProps {
  /**
   * The edition, for its cars and its teams.
   */
  entry: SeasonEntry;
  /**
   * Every class's champions.
   */
  champions: readonly ClassChampions[];
  /**
   * What the player is called, over the name the championship gave their seat.
   */
  playerName: string;
}

/**
 * The edition's champions, a pair to a class: the driver and the team, each in
 * the livery that won it.
 */
export const ChampionsCard = ({ entry, champions, playerName }: ChampionsCardProps) => {
  const { t } = useTranslation();
  const series = entry.championship;

  /**
   * One champion's tile: their car above, what they won under it.
   * @param kind Which title it is
   * @param car The car and livery it was won in, or null for none known
   * @param name Who won it
   * @param detail What they won it with
   * @returns The tile
   */
  const tile = (
    kind: 'driversChampion' | 'teamsChampion',
    car: { model: string; skin?: string } | null,
    name: ReactNode,
    detail: string,
  ): ReactNode => (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border">
      <div className="relative aspect-[16/6] bg-scrim">
        <ContentImage
          sources={car ? carPictureSources(car.model, car.skin) : []}
          alt=""
          className="object-cover"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <CarIcon className="size-6 text-on-scrim/40" />
            </div>
          )}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1 px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-wide text-podium-gold-foreground uppercase">
          <TrophyIcon className="size-3.5" />
          {t(`review.${kind}`)}
        </span>
        <span className="text-sm font-semibold">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{detail}</span>
      </div>
    </div>
  );

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrophyIcon className="size-4" />
          {t('review.champions')}
        </h2>
        {champions.length > 1 ? <span className="text-xs text-muted-foreground">{t('review.championsHint')}</span> : null}
      </header>

      {champions.map((one) => {
        const { driver, team } = one;
        const teamSeat = team ? series.entries.find((held) => held.id === one.entry)?.seats
          .find((seat) => seat.team === team.team) : undefined;

        return (
          <div key={one.entry} className="flex flex-col gap-2">
            {champions.length > 1 ? <h3 className="text-xs font-semibold text-muted-foreground">{one.name}</h3> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {driver ? tile(
                'driversChampion',
                seatCar(entry, driver.seat, driver.player),
                <DriverName
                  name={driver.player ? playerName : driver.driver}
                  nation={seatNation(series, driver.seat)}
                  player={driver.player}
                />,
                [
                  teamName(series, driver.team),
                  t('review.points', { count: driver.points }),
                  t('home.wins', { count: driver.wins }),
                ].filter((part) => part !== null).join(' · '),
              ) : null}
              {team ? tile(
                'teamsChampion',
                teamSeat ? seatCar(entry, teamSeat.id, teamSeat.id === entry.playerSeat) : null,
                <DriverName name={team.name} nation={teamNation(series, team.team)} />,
                [
                  t('review.points', { count: team.points }),
                  t('home.wins', { count: team.wins }),
                ].join(' · '),
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
};
