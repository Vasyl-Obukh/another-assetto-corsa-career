import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassTeams } from './ClassTeams.tsx';
import { CLASS_CARS_SHOWN, CLASS_TEAMS_SHOWN } from './constants.ts';
import { EntryCars } from './EntryCars.tsx';
import { TierMedal } from './TierMedal.tsx';
import { disciplineKey, teamGroups } from './utils.ts';
import type { ClassEntry, EntryAvailability, Team } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { useCars, useUnits } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface ClassRowProps {
  /**
   * The class the row describes.
   */
  entry: ClassEntry;
  /**
   * What it can field against the installed content.
   */
  availability: EntryAvailability | undefined;
  /**
   * Every team the championship fields, for naming the one behind each seat.
   */
  teams: readonly Team[];
  /**
   * Whether to name its discipline, which only says anything on a grid that
   * mixes them.
   */
  showDiscipline: boolean;
  /**
   * The seat the player took, when a career races this class - which also
   * outlines the row.
   */
  playerSeat?: string;
  /**
   * What the player is called in the entry list.
   */
  playerName: string;
}

// One class of the grid across the page: who it is, what it drives, who is
// entered. Held to a line of cars and a few teams, so a nine-class grid
// stays readable, with a strip along its foot that opens the whole row.
export const ClassRow = ({
  entry, availability, teams, showDiscipline, playerSeat, playerName,
}: ClassRowProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const { catalogue } = useClasses();
  const [open, setOpen] = useState(false);
  const eligible = availability?.eligible ?? [];
  // One lookup for both the pictures and the balance table's names.
  const cars = useCars([...eligible, ...(entry.bop ?? []).map((bop) => bop.car)]);
  const fielded = eligible
    .flatMap((id) => cars.get(id) ?? [])
    .sort((left, right) => left.name.localeCompare(right.name));
  const groups = teamGroups(entry.seats, teams);
  const teamCount = groups.filter((group) => group.team !== null).length;
  const hiddenCars = Math.max(0, fielded.length - CLASS_CARS_SHOWN);
  const hiddenTeams = Math.max(0, groups.length - CLASS_TEAMS_SHOWN);
  const hidden = [
    hiddenCars > 0 ? t('championships.detail.moreCars', { count: hiddenCars }) : null,
    hiddenTeams > 0 ? t('championships.detail.moreTeams', { count: hiddenTeams }) : null,
  ].filter((part) => part !== null);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-sm',
        // The class a career races, and nothing to do with what is open.
        playerSeat !== undefined && 'border-primary ring-1 ring-primary',
      )}
    >
      <div className="grid lg:grid-cols-[13rem_minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col gap-2 bg-muted/40 p-4">
          <TierMedal tier={entry.ladder.tier} className="size-8" />
          <span className="text-base font-semibold">{entry.name}</span>
          <span className="text-xs text-muted-foreground">
            {t('championships.detail.gridSize', {
              cars: t('championships.cars', { count: entry.seats.length }),
              teams: t('championships.teams', { count: teamCount }),
            })}
          </span>
          <div className="flex flex-wrap gap-1">
            {showDiscipline ? (
              <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
                {t(disciplineKey(entry.ladder.discipline))}
              </Badge>
            ) : null}
            {/* Neutral on purpose: specs are an open set the user can add to, so
                no palette could give each its own colour. */}
            {entry.eligibility.kind === 'spec' ? (
              <Badge variant="outline">{carSpecName(entry.eligibility.spec, catalogue)}</Badge>
            ) : (
              <Badge variant="outline">{t('championships.entries.cars')}</Badge>
            )}
            <Badge variant={availability?.enough ? 'success' : 'destructive'}>
              {t('championships.entries.eligible', { count: eligible.length })}
            </Badge>
          </div>
          {availability && !availability.enough ? (
            <p className="text-sm text-destructive">{t('championships.entries.notEnough')}</p>
          ) : null}
          {entry.bop?.length ? (
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="text-muted-foreground">{t('championships.entries.bop')}</span>
              {entry.bop.map((bop) => (
                <span key={bop.car}>
                  {t('championships.entries.bopRow', {
                    car: cars.get(bop.car)?.name ?? bop.car,
                    adjustments: [
                      bop.ballast ? units.format('weight', bop.ballast) : null,
                      bop.restrictor
                        ? t('championships.entries.restrictor', { value: bop.restrictor })
                        : null,
                    ].filter(Boolean).join(', '),
                  })}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t p-4 lg:border-t-0 lg:border-l">
          <span className="text-xs font-medium text-muted-foreground">{t('championships.detail.cars')}</span>
          {fielded.length > 0 ? (
            <EntryCars
              cars={open ? fielded : fielded.slice(0, CLASS_CARS_SHOWN)}
              className="grid-cols-3"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-1 border-t p-4 lg:border-t-0 lg:border-l">
          <span className="text-xs font-medium text-muted-foreground">{t('championships.entries.seats')}</span>
          <ClassTeams
            groups={open ? groups : groups.slice(0, CLASS_TEAMS_SHOWN)}
            playerSeat={playerSeat}
            playerName={playerName}
          />
        </div>
      </div>

      {/* The whole row opens at once, and only a row with something held back
          carries the strip at all. */}
      {hidden.length > 0 ? (
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-2 border-t bg-muted/30 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open
            ? t('championships.detail.showLess')
            : t('championships.detail.showMore', {
              what: hidden.length > 1
                ? t('championships.detail.both', { first: hidden[0], second: hidden[1] })
                : hidden[0],
            })}
          {open ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
        </button>
      ) : null}
    </section>
  );
};
