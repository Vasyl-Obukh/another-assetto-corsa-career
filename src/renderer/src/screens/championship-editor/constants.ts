// What the editor's own controls are bounded by and start from, the sentinel a
// select needs where "not set" means "whatever the championship says", and the
// layout classes more than one of its components share.

import type { ParseKeys } from 'i18next';

import type {
  ClassSection, ConditionGroup, EditorTab, LengthUnit, PointsTemplate, PurseShape, RoadKind, RoundTab, StartKind,
} from './types.ts';
import { MAX_EVENT_DAYS } from '../../../../shared/constants';
import {
  Climate, Hemisphere, SeasonLength, TeamBudget, Weekday,
} from '../../../../shared/types';
import type { Championship, Conditions } from '../../../../shared/types';

/**
 * The value a select carries when the answer is the championship's default.
 *
 * Radix cannot hold an empty string, so an unset select needs a value of its
 * own. Distinct from the race screen's NOT_SET, which means *nothing at all*:
 * a round naming no event format runs the default one, which is not the same
 * as a seat naming no team. A championship naming no race day races on its
 * tier's, which is the default the same way.
 *
 * Safe as a value because the editor mints every sub-id itself and none may
 * ever be typed, so no round or points system can be called this.
 */
export const DEFAULT_REF = '/default';

/**
 * How long an entry fee, a prize or a drop count may be.
 *
 * Only ever a floor. What a championship is worth is the author's business,
 * which is why validateSeries refuses a negative figure and nothing else.
 */
export const MIN_MONEY = 0;

/**
 * The lowest tier there is. Tier 1 is the top of a ladder.
 */
export const MIN_TIER = 1;

/**
 * Which rung a class entry is put on when it is first added.
 *
 * Deliberately not MIN_TIER: tier 1 is the top of a discipline, and a new class
 * entry claiming the top flight by default is a number nobody chose. Mid-ladder
 * is wrong too, but it is wrong in a way that reads as a placeholder.
 */
export const DEFAULT_TIER = 5;

/**
 * The shortest a session may be asked to run for. Saying nothing about a
 * length is a real thing to say, but a session given zero runs for no time at
 * all.
 */
export const MIN_SESSION_LENGTH = 1;

/**
 * What a session switched to another unit starts at. Laps and minutes are the
 * race screen's own defaults, restated because its module reaches react-router
 * and this one is tested; a distance starts at a sprint's 100 km.
 */
export const DEFAULT_LENGTH: Readonly<Record<LengthUnit, number>> = {
  laps: 5,
  minutes: 15,
  distance: 100,
};

/**
 * The last day a session may be put on.
 *
 * One less than MAX_EVENT_DAYS, which counts days rather than offsets - and
 * the same ceiling validateFormat reports against, so the field refuses what
 * the document would be told off for.
 */
export const MAX_DAY = MAX_EVENT_DAYS - 1;

/**
 * The fewest cars a session may carry over from the qualifying it follows.
 *
 * A segment advancing nobody has no field, which validateFormat refuses as
 * `series.inherit.topInvalid`.
 */
export const MIN_INHERIT_TOP = 1;

/**
 * The fewest points a position may be worth. Zero is a position that scores
 * nothing, which a real table below the top ten says all the time.
 */
export const MIN_POINTS = 0;

/**
 * What a new points system pays, the winner first.
 *
 * Formula 1's own table since 2010, because a points system has to start as
 * something recognisable: an author who wants another one is editing a table
 * rather than building one from nothing, and ten scoring positions is the
 * shape most championships are some variation of.
 */
export const DEFAULT_POINTS: readonly number[] = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/**
 * The lowest ballast or intake restriction a balance-of-performance row may
 * carry. Zero is a row that says nothing, which is still a row.
 */
export const MIN_BOP = 0;

/**
 * The most ballast a car's card steps up to, in kilograms. A ceiling for the
 * buttons rather than a rule: AC takes whatever it is given.
 */
export const MAX_BALLAST = 200;

/**
 * The most intake restriction a car's card steps up to, as a percentage.
 */
export const MAX_RESTRICTOR = 100;

/**
 * How far one press of a card's ballast buttons moves it, in kilograms.
 */
export const BALLAST_STEP = 5;

/**
 * How few distinct models a spec may be asked to have installed.
 *
 * One is a grid of clones and the whole reason DEFAULT_MIN_MODELS exists, but
 * it is a coherent thing to ask for - a series raced against a single model is
 * a one-make series written the lazy way - so it is the floor rather than an
 * error.
 */
export const MIN_MODELS = 1;

/**
 * How well funded a team may be, from the best off down.
 */
export const TEAM_BUDGETS: readonly TeamBudget[] = Object.values(TeamBudget);

/**
 * The climates a championship or a round may expect, driest first.
 */
export const CLIMATES: readonly Climate[] = Object.values(Climate);

/**
 * The halves of the world a round may be raced in, north first.
 */
export const HEMISPHERES: readonly Hemisphere[] = Object.values(Hemisphere);

/**
 * How much of a career's year a championship may fill, longest first.
 */
export const SEASON_LENGTHS: readonly SeasonLength[] = Object.values(SeasonLength);

/**
 * The days a championship may race on, Monday first.
 */
export const WEEKDAYS: readonly Weekday[] = Object.values(Weekday);


/**
 * The climate generated weather starts from when it is switched on.
 *
 * The middle of the four, and what most of the shipped calendar races in.
 */
export const DEFAULT_CLIMATE = Climate.MEDITERRANEAN;

/**
 * Which half of the world a championship's rounds are raced in unless one says
 * otherwise. North, where all but two of the circuits we ship sit.
 */
export const DEFAULT_HEMISPHERE = Hemisphere.NORTH;

/**
 * The grip's column in a calendar row, reserved whether or not a grip is in
 * it, so the columns stay put when a locked calendar drops its grips.
 */
export const ROW_GRIP = 'size-9 shrink-0';

/**
 * The position number's column in a calendar row.
 */
export const ROW_NUMBER = 'w-6 shrink-0 text-right text-xs text-muted-foreground';

/**
 * The gap between a calendar row's columns, which its heading repeats to line
 * up with them.
 */
export const ROW_GAP = 'gap-3';

/**
 * Which list the open dialog edits a row of. Rows are addressed by scope and
 * id together, because the edit state is one value for the whole editor - see
 * useRowEdit.
 */
export const ROW_SCOPE = {
  TEAMS: 'teams',
  ENTRIES: 'entries',
} as const;

/**
 * Every unit a race may be measured in, in the order the select offers them.
 *
 * Minutes are not among them: Assetto Corsa runs a timed race on a server
 * alone, so an offline race is laps, or a distance that becomes laps at each
 * round's track.
 */
export const LENGTH_UNITS: readonly LengthUnit[] = ['laps', 'distance'];

/**
 * What each unit is called, as a field label and as a select option.
 */
export const LENGTH_LABEL = {
  laps: 'editor.sessions.laps',
  minutes: 'editor.sessions.minutes',
  distance: 'editor.sessions.distance',
} as const satisfies Record<LengthUnit, ParseKeys>;

/**
 * The editor's tabs, in the order they are offered.
 */
export const EDITOR_TABS: readonly EditorTab[] = [
  'overview', 'teams', 'classes', 'calendar', 'formats', 'scoring',
];

/**
 * The tabs that list things and so carry a count beside their name - what the
 * header's skeleton holds a count's place on.
 */
export const COUNTED_TABS: readonly EditorTab[] = ['teams', 'classes', 'calendar', 'formats'];

/**
 * Which of a championship's fields each tab edits, so a tab can say it holds
 * something unsaved.
 */
export const TAB_FIELDS: Readonly<Record<EditorTab, readonly (keyof Championship)[]>> = {
  overview: [
    'name', 'description', 'entryFee', 'seasonLength', 'raceWeekday', 'generatedWeather', 'grid', 'regulations',
  ],
  teams: ['teams'],
  classes: ['entries'],
  calendar: ['rounds'],
  formats: ['eventFormats', 'defaultEventFormat'],
  scoring: ['pointsSystems', 'defaultPointsSystem', 'prizes'],
};

/**
 * Which tab a problem is fixed on, by the subject its code names - the
 * segment after `series.`. Anything unlisted is the overview's.
 */
export const PROBLEM_TAB: Readonly<Record<string, EditorTab>> = {
  team: 'teams',
  entries: 'classes',
  entry: 'classes',
  tier: 'classes',
  seats: 'classes',
  seat: 'classes',
  car: 'classes',
  bop: 'classes',
  spec: 'classes',
  rounds: 'calendar',
  round: 'calendar',
  season: 'calendar',
  formats: 'formats',
  format: 'formats',
  sessions: 'formats',
  days: 'formats',
  inherit: 'formats',
  race: 'formats',
  length: 'formats',
  distance: 'formats',
  startingPosition: 'formats',
  points: 'scoring',
  prizes: 'scoring',
};

/**
 * The parts of a class entry, in the order its panel offers them.
 */
export const CLASS_SECTIONS: readonly ClassSection[] = ['cars', 'seats', 'performance', 'prizes'];

/**
 * The fixed columns of a calendar row, shared with the heading above them so
 * the two line up. Only the round's name flexes, so a row's badges go before
 * these, or a column would shift on whichever rows carry one.
 */
export const ROUND_COLUMN = {
  MAP: 'w-16 shrink-0',
  EVENT: 'hidden w-60 shrink-0 xl:flex',
  RACES: 'hidden w-36 shrink-0 lg:block',
  OWN: 'flex w-80 shrink-0 flex-wrap gap-1',
  FEE: 'w-20 shrink-0 text-right',
  // Room for a row's menu.
  ACTIONS: 'w-9 shrink-0',
} as const;

/**
 * The shapes a purse may be generated along, steepest first.
 */
export const PURSE_SHAPES: readonly PurseShape[] = ['steep', 'gentle', 'linear', 'winner'];

/**
 * How a shape's icon draws it: five bars, tallest ten.
 */
export const PURSE_SHAPE_BARS: Readonly<Record<PurseShape, readonly number[]>> = {
  steep: [10, 7, 5, 3.5, 2.5],
  gentle: [10, 8.7, 7.6, 6.6, 5.7],
  linear: [10, 8, 6, 4, 2],
  winner: [10, 2.5, 2, 1.6, 1.3],
};

/**
 * How much of a pot each place of a shape takes, before it is scaled to the pot.
 */
export const PURSE_WEIGHT: Readonly<Record<PurseShape, (place: number, places: number) => number>> = {
  steep: (place) => 0.72 ** place,
  gentle: (place) => 0.87 ** place,
  linear: (place, places) => places - place,
  // The winner takes about a third of a ten-place purse, the rest falling away.
  winner: (place) => (place === 0 ? 3.2 : 0.8 ** place),
};

/**
 * What a generated place may be rounded to.
 */
export const PURSE_ROUNDING: readonly number[] = [1, 50, 100, 500, 1000];

/**
 * How many places a purse pays when it is generated from nothing.
 */
export const DEFAULT_PURSE_PLACES = 10;

/**
 * The most places a purse may pay, which is where the places buttons stop.
 */
export const MAX_PURSE_PLACES = 40;

/**
 * What a class starting a purse of its own may scale the championship's by.
 */
export const PURSE_SCALES: readonly number[] = [0.5, 1, 1.5, 2];

/**
 * The rungs a class's dialog offers as medals, bottom rung first, the order
 * the Championships page lays the ladder out in. Deeper ones are typed.
 */
export const RUNGS_OFFERED: readonly number[] = [5, 4, 3, 2, 1];

/**
 * How many seats a new class starts with.
 */
export const DEFAULT_CLASS_SEATS = 10;

/**
 * The most seats a new class may start with, which is where its buttons stop.
 */
export const MAX_CLASS_SEATS = 60;

/**
 * Real championships' tables a points system may start from, each as the
 * series itself pays it. Lead-lap and most-laps-led bonuses are left out,
 * since nothing here scores them.
 */
export const POINTS_TEMPLATES: readonly PointsTemplate[] = [
  { id: 'f1', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 1 },
  {
    id: 'indycar',
    positions: [
      50, 40, 35, 32, 30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6,
      5, 5, 5, 5, 5, 5, 5, 5, 5,
    ],
    qualifying: [1],
  },
  {
    id: 'imsa',
    positions: [
      350, 320, 300, 280, 260, 250, 240, 230, 220, 210, 200, 190, 180, 170, 160,
      150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10,
    ],
  },
  { id: 'motogp', positions: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  { id: 'dtm', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [3, 2, 1] },
  { id: 'btcc', positions: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], qualifying: [1], fastestLap: 1 },
  { id: 'sprint', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
  { id: 'blank', positions: [] },
];

/**
 * How many places a strip of points shows before the rest is folded away.
 */
export const POINTS_SHOWN = 15;

/**
 * The most a fastest lap may be worth, which is where its buttons stop.
 */
export const MAX_BONUS_POINTS = 100;

/**
 * The groups conditions are set in, in the order they are offered, each with
 * the fields it owns. A group is set or left as a whole: weather is one answer
 * of three fields, and half a wind is no wind.
 */
export const CONDITION_GROUPS: Readonly<Record<ConditionGroup, readonly (keyof Conditions)[]>> = {
  weather: ['weather', 'weatherType', 'weatherController', 'weatherSteps'],
  time: ['timeOfDay'],
  temperature: ['ambient', 'road'],
  track: ['trackState'],
  wind: ['windMin', 'windMax', 'windDirection'],
};

/**
 * The groups, in the order a conditions editor lists them.
 */
export const CONDITION_GROUP_ORDER: readonly ConditionGroup[] = ['weather', 'time', 'temperature', 'track', 'wind'];

/**
 * What a group starts at when it is switched on, before anything is chosen.
 * Weather starts from the first type on offer instead, which is not a constant.
 */
export const CONDITION_SEEDS: Readonly<Record<Exclude<ConditionGroup, 'weather'>, Conditions>> = {
  time: { timeOfDay: '14:00' },
  temperature: { ambient: 20 },
  track: { trackState: 'fast' },
  wind: { windMin: 0, windMax: 10, windDirection: 0 },
};

/**
 * The span of the air temperature slider, in degrees Celsius.
 */
export const AMBIENT_RANGE = { min: -5, max: 45 } as const;

/**
 * The span of the road temperature slider, in degrees Celsius - wider than the
 * air's at the top, since a sunny track runs well above it.
 */
export const ROAD_RANGE = { min: -5, max: 60 } as const;

/**
 * The two ways a road temperature is stated, in the order they are offered.
 */
export const ROAD_KINDS: readonly RoadKind[] = ['follows', 'set'];

/**
 * The most wind a round or a session may ask for, in kilometres an hour.
 */
export const MAX_WIND = 60;

/**
 * Where the time-of-day bar's jump buttons land, as a clock.
 */
export const TIME_PRESETS = {
  dawn: '06:30',
  morning: '09:30',
  midday: '12:30',
  afternoon: '15:30',
  dusk: '19:30',
  night: '22:00',
} as const;

/**
 * How many minutes a time-of-day bar moves in one step.
 */
export const TIME_STEP_MINUTES = 5;

/**
 * A round dialog's tabs, in the order it offers them.
 */
export const ROUND_TABS: readonly RoundTab[] = ['basics', 'conditions', 'cars'];

/**
 * Where a player can start a race with nothing to line it up, in the order
 * they are offered.
 */
export const START_KINDS: readonly StartKind[] = ['last', 'pole', 'position', 'random'];

/**
 * What each start is called.
 */
export const START_LABEL = {
  last: 'editor.sessions.start.last',
  pole: 'editor.sessions.start.pole',
  position: 'editor.sessions.start.position',
  random: 'editor.sessions.start.random',
} as const satisfies Record<StartKind, ParseKeys>;

/**
 * A panel's own tabs as a row of pills under its head, rather than the page's
 * underlined tabs: the list's classes.
 */
export const PILL_TAB_LIST = 'h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b bg-transparent px-3 py-2 sm:px-4';

/**
 * One of those pills.
 */
export const PILL_TAB = 'h-auto flex-none rounded-full px-3 py-1 text-muted-foreground shadow-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none dark:text-muted-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/15 dark:data-[state=active]:text-primary';

/**
 * The most slots a start slider numbers under itself before it numbers only
 * its ends.
 */
export const TICKED_SLOTS = 16;

/**
 * What the track-limits allowance is when it leaves Assetto Corsa's own
 * per-track answer alone.
 */
export const TRACK_DEFAULT = -1;

/**
 * The track-limits allowances offered: the track's own, or how many wheels
 * may leave it.
 */
export const TYRES_OUT_CHOICES: readonly number[] = [TRACK_DEFAULT, 1, 2, 3];

/**
 * The jump start penalties offered, in seconds of drive-through - none, and
 * the lengths the shipped championships use and either side of them.
 */
export const JUMP_START_CHOICES: readonly number[] = [0, 5, 10, 15, 30];
