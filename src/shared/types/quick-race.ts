// A race event of the player's own, outside any championship: the Race tab
// holds as many as they like, each with its own sessions, progress and results.
//
// Written as little as possible: a track, a car, the classes the field is drawn
// from and the sessions. The core lowers one into a one-round championship and
// runs it through the same lowering a round takes, which is what gives a quick
// race a multi-class field, AI offsets over the player's difficulty, liveries
// and class positions without any of them being written twice.

import type { EventSession } from './career.ts';
import type { EventPlan, LaunchRecord } from './event.ts';
import type { RaceStatus } from './race-run.ts';
import type { Conditions, GridEntry, SessionDefinition } from './race.ts';
import type {
  Championship, Eligibility, Regulations, SeriesGrid,
} from './series.ts';
import type { RoundScore } from './standings.ts';
import type { AppErrorInfo } from '../errors/index.ts';

/**
 * One class of a quick race's field.
 */
export interface QuickClass {
  /**
   * Stable identifier, unique within the race.
   */
  id: string;
  /**
   * Display name.
   */
  name: string;
  /**
   * What the class may be driven in: a catalogued grid or a list of cars.
   */
  eligibility: Eligibility;
  /**
   * How many cars race in it, the player's included when it is theirs.
   */
  cars: number;
  /**
   * How much stronger or weaker its drivers are than the race's own field.
   */
  grid?: SeriesGrid;
  /**
   * Set while the class is named after the player's car, as one made by
   * picking a car is. A class following the car is renamed with it until the
   * player names it themselves.
   */
  fromCar?: boolean;
}

/**
 * A race event of the player's own.
 */
export interface QuickRace {
  /**
   * Format version, always 1 until the first release.
   */
  version: number;
  /**
   * Stable identifier, which also names its file and its race.
   */
  id: string;
  /**
   * What the player called it, or nothing to go by its track.
   */
  name?: string;
  /**
   * When it was made, as an ISO timestamp.
   */
  createdAt: string;
  /**
   * When anything about it last changed, a launch included, as an ISO
   * timestamp.
   */
  updatedAt: string;
  /**
   * The layout it races on, or null until one is picked.
   */
  track: {
    /**
     * Folder name under content/tracks.
     */
    id: string;
    /**
     * Layout folder, for a track that has several.
     */
    layout?: string;
  } | null;
  /**
   * The player's car and livery, or null until one is picked.
   */
  car: {
    /**
     * Folder name under content/cars.
     */
    model: string;
    /**
     * Livery folder, or nothing for whichever the car lists first.
     */
    skin?: string;
  } | null;
  /**
   * The classes the field is drawn from, in the order they line up.
   */
  classes: readonly QuickClass[];
  /**
   * Which class the player races in, by its id, or null while there is none.
   */
  playerClass: string | null;
  /**
   * How much stronger or weaker the whole field is than the player's
   * difficulty in settings.
   */
  grid?: SeriesGrid;
  /**
   * What the race allows, and what it does about the rules being broken.
   */
  regulations?: Regulations;
  /**
   * The sessions, in the order they run. Each is a launch of its own.
   */
  sessions: readonly SessionDefinition[];
  /**
   * What every session runs in unless it says otherwise.
   */
  conditions: Conditions;
}

/**
 * Where a quick race is up to.
 */
export type QuickRacePhase = 'setup' | 'running' | 'finished';

/**
 * One launch of a race event of the player's own that wrote an archive, as the
 * race recorded it - which says what class each car of the archive raced in.
 */
export interface QuickRaceLaunch extends LaunchRecord {
  /**
   * The session's own name, or null for one named only by its kind.
   */
  name: string | null;
}

/**
 * A race event of the player's own as the Results page links to it: what it
 * goes by and the archives its launches wrote. Read off its file alone, so it
 * answers without planning the race - and for one that can no longer be.
 */
export interface QuickRaceArchives {
  /**
   * The race's id, which opens its page.
   */
  id: string;
  /**
   * The name it goes by: its own, or its layout's when it has none.
   */
  title: string;
  /**
   * How many sessions it runs.
   */
  sessions: number;
  /**
   * How many of them have run, simulated ones included.
   */
  run: number;
  /**
   * Its classes, in the order they line up, which picks each one's colour.
   */
  classes: readonly Pick<QuickClass, 'id' | 'name'>[];
  /**
   * Every launch that wrote an archive, in the order they ran.
   */
  launches: readonly QuickRaceLaunch[];
}

/**
 * A quick race as the Race tab lists it and its page shows it: the race, what
 * it plans into, what has run and what it paid.
 */
export interface QuickRaceView {
  /**
   * The race as written.
   */
  race: QuickRace;
  /**
   * The name it goes by: its own, or its layout's when it has none.
   */
  title: string;
  /**
   * The one-round championship it lowers through, for the result tables, or
   * null when it cannot be built yet.
   */
  championship: Championship | null;
  /**
   * Its launches, or null when it cannot be planned yet.
   */
  plan: EventPlan | null;
  /**
   * Every session, with what it left behind.
   */
  sessions: readonly EventSession[];
  /**
   * Every car on the grid, the player's first, in the order a launch writes
   * them, so a classification can be joined to seats, teams and classes.
   */
  grid: readonly GridEntry[];
  /**
   * What it paid, by class position, once anything has run.
   */
  score: RoundScore | null;
  /**
   * Everything stopping it from being launched, in the order it is worth
   * fixing.
   */
  problems: readonly AppErrorInfo[];
  /**
   * Where it is up to.
   */
  phase: QuickRacePhase;
  /**
   * The launch in flight, when it is one of this race's.
   */
  status: RaceStatus | null;
  /**
   * When a session of it last ran, or null when none has.
   */
  lastRaced: string | null;
}
