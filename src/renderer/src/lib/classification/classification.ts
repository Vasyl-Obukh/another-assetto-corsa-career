// One session's classification, read into rows whatever it was read from: an
// archive Assetto Corsa wrote, the order the career recorded, or both. Joined by
// place rather than by name - the archive's order and the record's are the same
// classification, and Content Manager writes its own profile name over the
// player's - so the career's seats, teams and points line up with the archive's
// laps without trusting a name.

import type {
  ClassificationSource, ClassifiedGap, ClassifiedRow, RacedClass,
} from './types.ts';
import type { Standing } from '../../../../shared/types';
import { seatNation, teamName } from '../season-results/index.ts';

/**
 * How far one archived row is behind the front of the table.
 * @param row The row
 * @param leader The front of the table
 * @param race Whether the session was a race
 * @returns The gap, or null when there is nothing to measure it on
 */
const gapOf = (row: Standing, leader: Standing, race: boolean): ClassifiedGap | null => {
  if (row === leader) return null;
  if (race) {
    if (row.laps < leader.laps) return { laps: leader.laps - row.laps };
    // A race nobody finished a valid lap of has no time to measure a gap on.
    return row.totalTime > 0 && leader.totalTime > 0 ? { ms: row.totalTime - leader.totalTime } : null;
  }

  return row.bestLap === null || leader.bestLap === null ? null : { ms: row.bestLap - leader.bestLap };
};

/**
 * Reads a session into its classification.
 * @param source Whatever is known about the session
 * @returns One row per car, in finishing order
 */
export const classifiedRows = (source: ClassificationSource): ClassifiedRow[] => {
  const {
    record, grid = [], score, startOrder, series, substituted = false,
  } = source;
  const race = source.type === 'race';
  // A driven session joins through its own [CAR_n] order, which is there even
  // for a practice that classified nobody; a simulated one through the order
  // it recorded.
  const carOf = (standing: Standing | undefined, at: number): number | undefined => (
    standing?.slot !== undefined && record ? record.gridOrder[standing.slot] : record?.classification?.[at]
  );
  // The grid says each car's class where it is to hand, and the launch's own
  // record where only the archive is.
  const classOf = (car: number | undefined): string | undefined => (
    car === undefined ? undefined : grid[car]?.entry ?? record?.carClasses?.[car]
  );
  const inClass = (car: number | undefined): boolean => (
    source.entry === undefined || (car !== undefined && classOf(car) === source.entry)
  );
  // A qualifying run apart put the player's class alone on track, so its
  // archive holds that class and the recorded order holds everyone: the rows
  // follow the order, and only the class driven has laps to show.
  // Only with the event's grid to hand, which is what names a car never archived.
  const apart = (record?.simulatedClasses?.length ?? 0) > 0 && source.standings != null && grid.length > 0;
  const drivenAt = (car: number): Standing | undefined => source.standings?.find((one) => (
    one.slot !== undefined && record?.gridOrder[one.slot] === car
  ));
  // A class listed alone is filtered before anything is measured, so its
  // leader, its gaps and its fastest lap are its own.
  const ordered = apart ? record?.classification?.filter((car) => inClass(car)) ?? [] : null;
  const standings = ordered
    ? ordered.map((car) => drivenAt(car))
    : source.standings?.filter((one, at) => inClass(carOf(one, at))) ?? null;
  const order = standings ? null : record?.classification?.filter((car) => inClass(car)) ?? null;
  const cars = ordered ?? (standings
    ? source.standings?.map((one, at) => carOf(one, at)).filter((car) => inClass(car)) ?? []
    : order ?? []);
  const count = standings?.length ?? order?.length ?? 0;
  const leader = standings?.find((one) => one !== undefined);
  const best = Math.min(...(standings ?? []).map((one) => one?.bestLap ?? Infinity));
  const seen = new Map<string, number>();

  return Array.from({ length: count }, (unused, at): ClassifiedRow => {
    const standing = standings?.[at];
    const car = cars[at];
    const entry = car === undefined ? undefined : grid[car];
    const ownClass = classOf(car) ?? null;
    const classPosition = ownClass === null ? null : (seen.get(ownClass) ?? 0) + 1;
    if (ownClass !== null && classPosition !== null) seen.set(ownClass, classPosition);
    const place = score?.places.find((one) => one.seat === entry?.seat && !one.bonusOnly) ?? null;
    const started = car === undefined || !startOrder ? -1 : startOrder.indexOf(car);
    const seat = entry?.seat;

    return {
      key: seat ?? `${at}`,
      position: at + 1,
      driver: entry?.driver || standing?.driver || '',
      nation: entry?.nationCode || (series && seat ? seatNation(series, seat) : undefined),
      team: series ? teamName(series, entry?.team) : null,
      car: entry?.model
        ? { model: entry.model, skin: entry.skin }
        : (standing && { model: standing.car, skin: standing.skin }) ?? null,
      laps: standing?.laps ?? null,
      bestLap: standing?.bestLap ?? null,
      cuts: standing?.cuts ?? null,
      total: race && standing === leader && (standing?.totalTime ?? 0) > 0 ? standing?.totalTime ?? null : null,
      gap: standing && leader ? gapOf(standing, leader, race) : null,
      place,
      started: started < 0 ? null : started + 1,
      fastest: place ? place.fastestLap : standing?.bestLap != null && standing.bestLap === best,
      player: standing?.player ?? (car === 0 && grid.length > 0 && !substituted),
      entry: ownClass,
      classPosition,
    };
  });
};

/**
 * The classes a classification holds cars of, in the event's own order -
 * which is what picks each one's colour.
 * @param rows The classification
 * @param classes Every class of the event, in the order they line up
 * @returns The ones that raced
 */
export const racedClasses = (
  rows: readonly ClassifiedRow[],
  classes: readonly RacedClass[],
): RacedClass[] => {
  const raced = new Set(rows.map((row) => row.entry));

  return classes.filter((one) => raced.has(one.id)).map(({ id, name }) => ({ id, name }));
};
