import { DicesIcon, PlusIcon } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { SeatSheetRow } from './SeatSheetRow.tsx';
import {
  namesIn, nationsIn, nextSeat, seatRuns,
} from './utils.ts';
import type { Championship, ClassEntry, Seat, Team } from '../../../../shared/types';
import { fillDrivers } from '../../../../shared/utils/driver-names';
import { useSettings } from '@/app';
import { NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useRowDrag } from '@/hooks';
import { TEAM_BUDGET_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { TEAM_BUDGET_LABEL } from '@/screens/championships';
import { moveAt, moveTo } from '@/screens/race';

interface SeatSheetProps {
  /**
   * The championship, for the seat ids it already spends - a seat id is unique
   * across every class, not within one.
   */
  series: Championship;
  /**
   * The class entry whose seats these are.
   */
  entry: ClassEntry;
  /**
   * Every team the championship fields.
   */
  teams: readonly Team[];
  /**
   * Every car the class may field at some point in the season.
   */
  fieldable: readonly string[];
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the whole class entry whenever its seats change.
   * @param next The entry to apply
   */
  onChange: (next: ClassEntry) => void;
}

/**
 * The grid of one class as a sheet, one line per seat and every field typed
 * into directly, headed by the team fielding each run of seats.
 *
 * Order matters: the player takes the last seat of the class they enter.
 */
export const SeatSheet = ({
  series, entry, teams, fieldable, locked, nameOf, onChange,
}: SeatSheetProps) => {
  const { t } = useTranslation();
  const { seats } = entry;
  const empty = seats.filter((seat) => !seat.driver?.name).length;
  const used = nationsIn(series);
  const { settings } = useSettings();
  // What the class races at before a seat's own offset.
  const under = {
    strength: settings.opponents.strength + (series.grid?.strength ?? 0) + (entry.grid?.strength ?? 0),
    aggression: settings.opponents.aggression + (series.grid?.aggression ?? 0) + (entry.grid?.aggression ?? 0),
  };

  /**
   * Puts the seats back on the class entry.
   * @param next The seats, in order
   */
  const apply = (next: readonly Seat[]): void => onChange({ ...entry, seats: next });

  const drag = useRowDrag({
    count: seats.length,
    locked,
    onMove: (from, to) => apply(moveTo([...seats], from, to)),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[72rem] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-normal" aria-hidden />
              <th className="pr-1 text-right font-normal" aria-hidden />
              <th className="pb-1 pl-1 font-normal">{t('editor.seats.driver')}</th>
              <th className="pb-1 pl-1 font-normal">{t('editor.nation.nation')}</th>
              <th className="pb-1 pl-1 font-normal">{t('editor.seats.team')}</th>
              <th className="pb-1 pl-1 font-normal">{t('editor.seats.car')}</th>
              <th className="pb-1 pl-1 text-center font-normal">{t('editor.seats.strengthShort')}</th>
              <th className="pb-1 pl-2 text-right font-normal">{t('editor.seats.racesAt')}</th>
              <th className="pb-1 pl-1 text-center font-normal">{t('editor.seats.aggressionShort')}</th>
              <th className="pb-1 pl-2 text-right font-normal">{t('editor.seats.racesAt')}</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {seatRuns(seats).map((run, at) => {
              const team = teams.find((one) => one.id === run.team);

              return (
                <Fragment key={run.seats[0].seat.id}>
                  {/* A run of seats rather than every seat of a team: the order
                      is the grid's own, so a team split across it heads twice. */}
                  <tr>
                    <td colSpan={11} className={cn('pb-1 pl-9 text-xs font-semibold text-muted-foreground', at > 0 ? 'pt-4' : 'pt-2')}>
                      <span className="flex items-center gap-2">
                        {team?.nationCode === undefined ? null : <NationFlag code={team.nationCode} />}
                        {team?.name ?? t('editor.seats.noTeam')}
                        {team?.budget === undefined ? null : (
                          <Badge className={TEAM_BUDGET_ACCENT[team.budget]}>{t(TEAM_BUDGET_LABEL[team.budget])}</Badge>
                        )}
                      </span>
                    </td>
                  </tr>

                  {run.seats.map(({ seat, index }) => (
                    <SeatSheetRow
                      key={seat.id}
                      under={under}
                      seat={seat}
                      index={index}
                      count={seats.length}
                      teams={teams}
                      fieldable={fieldable}
                      used={used}
                      locked={locked}
                      drag={drag}
                      nameOf={nameOf}
                      onChange={(next) => apply(seats.map((one) => (one.id === seat.id ? next : one)))}
                      onMove={(by) => apply(moveAt([...seats], index, by))}
                      onRemove={() => apply(seats.filter((one) => one.id !== seat.id))}
                    />
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={() => apply([...seats, nextSeat(series, entry)])}
        >
          <PlusIcon />
          {t('editor.seats.add')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={locked || empty === 0}
          onClick={() => onChange(fillDrivers(entry, teams, namesIn(series)))}
        >
          <DicesIcon />
          {t('editor.seats.fillNames')}
        </Button>
        {empty === 0 ? null : (
          <span className="text-xs text-muted-foreground">{t('editor.seats.emptyCount', { count: empty })}</span>
        )}
        <span className="text-xs text-muted-foreground">{t('editor.seats.hint')}</span>
      </div>
    </div>
  );
};
