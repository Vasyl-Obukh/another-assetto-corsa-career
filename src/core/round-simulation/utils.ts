// The parts of simulating a round that are not the walk through its sessions.

import {
  CLASS_GAP, LAP_BASE_MS, LAP_JITTER_MS, LAP_MS_PER_LEVEL,
} from './constants.ts';
import type { SimulatedCar, SimulatedPlayer } from './types.ts';
import type {
  Championship, FieldSeat, RaceOut, Round,
} from '../../shared/types/index.ts';
import { SESSION_TYPE } from '../race-ini/index.ts';
import { classOffset, nationOf, seatDraw } from '../series/index.ts';

/**
 * The grid of a simulated round, in the order a real lowering builds it.
 *
 * The player's seat first, then every other seat in entry-list order - so car
 * indices mean what they would have meant had the round been driven, and the
 * event page can read a simulated launch with the plan it already has. With no
 * player, every seat in entry-list order.
 * @param series The championship
 * @param round The round
 * @param salt What seeds a seat's draw when the field does not hold it
 * @param field The season's frozen field, when there is one
 * @param player The player, when the career is in the championship
 * @returns The cars, each with its pace
 */
export const simulatedGrid = (
  series: Championship,
  round: Round,
  salt: string,
  field: readonly FieldSeat[] | undefined,
  player: SimulatedPlayer | undefined,
): SimulatedCar[] => {
  const frozen = new Map((field ?? []).map((one) => [one.seat, one]));

  const cars = series.entries.flatMap((entry, at) => {
    const offset = classOffset(series, entry, round).strength - at * CLASS_GAP;
    const playerSeat = player?.entry === entry.id ? entry.seats.at(-1) : undefined;

    return entry.seats.map((seat) => {
      const own = frozen.get(seat.id);
      const strength = own?.strength ?? seatDraw(series, seat, salt).strength;
      const { nationCode = '', nationality = '' } = nationOf(series, seat);

      return {
        player: seat === playerSeat,
        car: {
          entry: {
            model: own?.model ?? '',
            skin: own?.skin ?? '',
            driver: seat.driver?.name ?? '',
            nationality,
            nationCode,
            setup: '',
            ballast: 0,
            restrictor: 0,
            seat: seat.id,
            entry: entry.id,
            team: seat.team,
          },
          pace: strength + offset,
        },
      };
    });
  });

  return [...cars.filter((one) => one.player), ...cars.filter((one) => !one.player)].map((one) => one.car);
};

/**
 * Orders cars on a rating, best first.
 * @param cars Car indices
 * @param rating Each car's rating, by car index
 * @returns The same cars, highest rating first, ties kept in the order given
 */
export const rankBy = (cars: readonly number[], rating: (car: number) => number): number[] => cars
  .map((car, at) => ({ car, at, value: rating(car) }))
  .sort((left, right) => right.value - left.value || left.at - right.at)
  .map((one) => one.car);

/**
 * A minimal race_out.json for a simulated race.
 *
 * Only what scoring reads off one: each car's best lap, under the race's
 * session type, by its position in the launch's own order. One lap a car, off
 * its pace, which is all the fastest lap needs.
 * @param name The session's name
 * @param gridOrder The cars in the order the launch ran them
 * @param paceOf Each car's pace, by car index
 * @param lapLuck Each car's draw for its lap, between zero and one, by car index
 * @returns What Assetto Corsa would have written, as far as scoring cares
 */
export const simulatedRaceOut = (
  name: string,
  gridOrder: readonly number[],
  paceOf: (car: number) => number,
  lapLuck: (car: number) => number,
): RaceOut => ({
  track: '',
  number_of_sessions: 1,
  players: gridOrder.map(() => ({ name: '', car: '', skin: '' })),
  sessions: [{
    event: 0,
    name,
    type: SESSION_TYPE.race,
    lapsCount: 1,
    duration: 0,
    laps: gridOrder.map((car, at) => ({
      lap: 0,
      car: at,
      sectors: [],
      time: Math.round(LAP_BASE_MS - paceOf(car) * LAP_MS_PER_LEVEL + lapLuck(car) * LAP_JITTER_MS),
      cuts: 0,
      tyre: '',
    })),
    lapstotal: gridOrder.map(() => 1),
    bestLaps: [],
  }],
});
