// Racing a round nobody drove: a round the player missed, one run before they
// entered the championship, or one of a championship they never entered at all.
//
// Pure and deterministic. Everything is seeded on the championship, the round,
// the career and the season, so the same round always comes out the same - which
// is what lets a championship the career is not in show standings without
// storing any, and what makes the rounds stored on entering exactly the ones it
// would have shown the day before.
//
// The weekend is walked launch by launch through the same helpers a driven one
// uses - fieldFor for a knockout, composeOrder and reverseFront for a grid - and
// scored by scoreRound, so a simulated round pays qualifying points, fastest
// laps and reverse grids exactly as a driven one does. Only the classifications
// are invented, off each driver's pace and a seeded draw.

import {
  GRID_SLOT_COST, QUALIFY_JITTER, RACE_JITTER,
} from './constants.ts';
import type { SimulatedRound, SimulationRequest } from './types.ts';
import { rankBy, simulatedGrid, simulatedRaceOut } from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  LaunchRecord, RacePlace, WeekendLaunch, WeekendPlan, WeekendState,
} from '../../shared/types/index.ts';
import { scoreRound } from '../season-scoring/index.ts';
import type { LaunchResult } from '../season-scoring/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';
import {
  formatOf, roundOf, roundRaceId, roundSessions,
} from '../series/index.ts';
import {
  chainOf, composeOrder, dayOf, fieldFor, reverseFront,
} from '../weekend/index.ts';

export type { SimulatedPlayer, SimulatedRound, SimulationRequest } from './types.ts';

/**
 * The player's seat in a race the driver it names raced after the player had
 * qualified: that driver's finish, with nothing of the qualifying, and - when
 * qualifying paid - the player's own points for it, as a place of its own.
 * @param place The seat's place as scored
 * @returns The stand-in's place, then the player's bonus where there is one
 */
const standInPlaces = (place: RacePlace): RacePlace[] => {
  const raced: RacePlace = {
    ...place,
    substitute: true,
    qualifyingPosition: null,
    qualifyingPoints: 0,
    points: place.finishPoints + place.fastestLapPoints,
  };
  if (place.qualifyingPoints === 0) return [raced];

  return [raced, {
    ...place,
    position: 0,
    classPosition: 0,
    fastestLap: false,
    finishPoints: 0,
    fastestLapPoints: 0,
    points: place.qualifyingPoints,
    bonusOnly: true,
  }];
};

/**
 * Simulates whatever of a round was not driven, and scores the whole of it.
 * @param request Which round, whose field, and what of it was driven
 * @returns Every launch of the weekend, and the round's score
 * @throws When the round or its weekend format is not in the championship
 */
export const simulateRound = (request: SimulationRequest): SimulatedRound => {
  const {
    series, salt, recordedAt, field, player, completed = [], results = [],
  } = request;
  const round = roundOf(series, request.round);
  const format = formatOf(series, round);
  if (!format) {
    throw new AppError('series.format.unknown', {
      series: series.id,
      round: round.id,
      format: round.weekendFormat ?? series.defaultWeekendFormat,
    });
  }

  const cars = simulatedGrid(series, round, salt, field, player);
  const paceOf = (car: number): number => cars[car]?.pace ?? 0;
  const everyone = cars.map((unused, car) => car);
  const raceId = roundRaceId(series.id, round.id);

  // A plan in the shape scoring and the weekend helpers read. Its launches
  // carry no race to set up, since nothing here is launched.
  const plan: WeekendPlan = {
    raceId,
    raceName: `${series.name} - ${round.name}`,
    grid: cars.map((one) => one.entry),
    launches: roundSessions(format, round).map((session, index): WeekendLaunch => ({
      index,
      day: dayOf(session),
      session,
      race: {
        id: raceId, name: round.name, track: round.track, playerCar: { model: '' },
      },
    })),
  };

  const sessions: LaunchRecord[] = [...completed];
  const simulated: LaunchResult[] = [];
  // The player's seat is raced by the driver it names. Car 0 is that seat,
  // since the grid leads with it whenever there is a player.
  const standIn = player !== undefined;
  // The races whose grid the player set themselves, in a launch they drove.
  const afterDriven = new Set<number>();

  for (let index = completed.length; index < plan.launches.length; index += 1) {
    const { session } = plan.launches[index];
    const state: WeekendState = { raceId, launchCount: plan.launches.length, completed: sessions };
    // Drawn per seat rather than per grid slot, so the round comes out the same
    // whether the player's seat leads the grid or sits in entry-list order -
    // which is what makes a round stored on entering the one shown before it.
    // What varies leads the seed, since seedFrom is a running hash and strings
    // differing only at their end seed within a hair of each other.
    const draws = new Map(cars.map((one, car) => {
      const random = randomFrom(seedFrom(
        `${index}\u0000${one.entry.seat ?? car}\u0000${round.id}\u0000${series.id}\u0000${salt}`,
      ));

      return [car, { luck: random() * 2 - 1, lap: random() }];
    }));
    const luckOf = (car: number): number => draws.get(car)?.luck ?? 0;

    let gridOrder: number[];
    let classification: number[];
    if (session.type === 'race') {
      // Lined up the way startingGrid lines a driven race up, except that with
      // no qualifying behind it the field lines up on pace rather than putting
      // anyone last for having earned nothing.
      const chain = chainOf(plan, index);
      const inherited = composeOrder(chain, sessions, cars.length);
      const lined = inherited ?? rankBy(everyone, (car) => paceOf(car) + luckOf(car));
      const reverse = session.inherit?.reverse;
      gridOrder = inherited && reverse !== undefined ? reverseFront(lined, reverse) : lined;
      // A driver put in after the player qualified set no time of their own, so
      // they start from the back rather than from the player's slot. Only where
      // the player's own launch is what placed the car - the latest one in the
      // chain to classify it, as composeOrder reads it - and not behind a race
      // the stand-in drove themselves.
      const placedBy = chain.find((at) => sessions.find((one) => one.index === at)?.classification?.includes(0));
      if (standIn && placedBy !== undefined && placedBy < completed.length) {
        afterDriven.add(index);
        gridOrder = [...gridOrder.filter((car) => car !== 0), 0];
      }

      const slot = new Map(gridOrder.map((car, at) => [car, at]));
      classification = rankBy(gridOrder, (car) => (
        paceOf(car) + luckOf(car) * RACE_JITTER - (slot.get(car) ?? 0) * GRID_SLOT_COST
      ));
      simulated.push({
        launch: index,
        raceOut: simulatedRaceOut(
          session.name ?? session.type,
          gridOrder,
          paceOf,
          (car) => draws.get(car)?.lap ?? 0,
        ),
      });
    } else {
      gridOrder = fieldFor(plan, state, index) ?? everyone;
      classification = rankBy(gridOrder, (car) => paceOf(car) + luckOf(car) * QUALIFY_JITTER);
    }

    sessions.push({
      index, completedAt: recordedAt, archive: '', gridOrder, classification, skipped: true,
    });
  }

  const state: WeekendState = { raceId, launchCount: plan.launches.length, completed: sessions };
  const score = scoreRound(series, round.id, plan, state, [...results, ...simulated], recordedAt);
  const playerSeat = standIn ? plan.grid[0]?.seat : undefined;

  return {
    sessions,
    score: {
      ...score,
      races: score.races.map((race) => (race.launch < completed.length ? race : {
        ...race,
        simulated: true,
        places: race.places.flatMap((place) => {
          if (place.seat !== playerSeat) return [place];
          if (!afterDriven.has(race.launch)) return [{ ...place, substitute: true }];

          return standInPlaces(place);
        }),
      })),
    },
  };
};
