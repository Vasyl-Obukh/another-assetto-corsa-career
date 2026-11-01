import type {
  Sponsor, SponsorGoalKind, SponsorPerkKind, SponsorSlot, SponsorTargetKind, SponsorTrade,
} from '../../shared/types/index.ts';
import type { FormBand } from '../../shared/utils/sponsors/index.ts';

/**
 * How likely a round raced is to bring a sponsor's offer, as a percentage, by
 * the career's form.
 */
export const FORM_CHANCE: Record<FormBand, number> = {
  top: 35, upper: 22, lower: 12, bottom: 5,
};

/**
 * What a standout result adds to that chance, as a percentage: a class win in
 * the round, a class title it settled, or a new rung it opened.
 */
export const STANDOUT_CHANCE = { win: 15, title: 25, rung: 25 } as const;

/**
 * The forms a main sponsor writes to: the upper half and the top quarter.
 */
export const MAIN_FORMS: readonly FormBand[] = ['top', 'upper'];

/**
 * What the chance is multiplied by for an offer to replace a deal, when every
 * slot is filled.
 */
export const REPLACE_FACTOR = 0.5;

/**
 * How long an offer stays open, in days.
 */
export const OFFER_DAYS = 30;

/**
 * Where on its rung a rating has to stand for an offer drawn on it to be
 * basic, and where for it to be generous.
 */
export const QUALITY = { low: 0.25, high: 0.75 } as const;

/**
 * Where inside each perk's range a figure starts for each quality, before a
 * hard target or goal raises it and a seeded jitter moves it.
 */
export const QUALITY_BASE = { low: 0.15, mid: 0.45, high: 0.75 } as const;

/**
 * How far either way a seeded jitter moves a figure inside its range.
 */
export const JITTER = 0.15;

/**
 * Every trade, in a fixed order the draw picks from.
 */
export const TRADES: readonly SponsorTrade[] = ['oil', 'tyres', 'tech', 'drinks', 'watch', 'finance', 'parts', 'dealer', 'apparel'];

/**
 * What each trade leans on: whether it covers a discipline rather than any
 * racing, the perks it draws from, the targets it asks and the goals it sets.
 * A main sponsor's signature is drawn from the first of its perks that is one.
 */
export const TRADE_LEAN: Record<SponsorTrade, {
  discipline: boolean;
  signatures: readonly SponsorPerkKind[];
  perks: readonly SponsorPerkKind[];
  targets: readonly SponsorTargetKind[];
  goals: readonly SponsorGoalKind[];
}> = {
  oil: {
    discipline: true, signatures: ['climbs', 'championship'], perks: ['podium', 'points'], targets: ['classPlace', 'start'], goals: ['championshipPlace', 'resultCount'],
  },
  tyres: {
    discipline: true, signatures: ['championship', 'climbs'], perks: ['pole', 'podium'], targets: ['qualifying', 'classPlace'], goals: ['resultCount'],
  },
  tech: {
    discipline: true, signatures: ['championship', 'climbs'], perks: ['win', 'podium'], targets: ['classPlace'], goals: ['resultCount', 'championshipPlace'],
  },
  drinks: {
    discipline: false, signatures: ['carBacking', 'championship'], perks: ['signing', 'points'], targets: ['start'], goals: ['racesStarted'],
  },
  watch: {
    discipline: true, signatures: ['climbs', 'carBacking'], perks: ['pole', 'win'], targets: ['qualifying'], goals: ['resultCount'],
  },
  finance: {
    discipline: false, signatures: ['carBacking', 'climbs'], perks: ['prizeMatch', 'signing'], targets: ['clean'], goals: ['onTarget'],
  },
  parts: {
    discipline: false, signatures: ['championship', 'carBacking'], perks: ['points', 'podium'], targets: ['start', 'clean'], goals: ['racesStarted', 'onTarget'],
  },
  dealer: {
    discipline: true, signatures: ['carBacking', 'climbs'], perks: ['podium', 'win'], targets: ['classPlace'], goals: ['championshipPlace'],
  },
  apparel: {
    discipline: false, signatures: ['climbs', 'carBacking'], perks: ['points', 'win'], targets: ['teammate'], goals: ['onTarget'],
  },
};

/**
 * The perks a basic offer - one drawn on a rating low on its rung - draws from.
 */
export const BASIC_PERKS: readonly SponsorPerkKind[] = ['points', 'podium'];

/**
 * The perks only a main sponsor gives.
 */
export const MAIN_ONLY: readonly SponsorPerkKind[] = ['signing'];

/**
 * How many perks an offer draws beside its race pay - and beside a main
 * sponsor's signature and goal bonus - as the fewest and the most.
 */
export const PERK_COUNT = { main: [1, 2], partner: [0, 1] } as const;

/**
 * Each perk's range, in typical entry fees of the rung it is drawn on - a
 * Bronze round's fee being $3,000 - for a main sponsor and a partner.
 */
export const PERK_RANGE: Partial<Record<SponsorPerkKind, Record<SponsorSlot, readonly [number, number]>>> = {
  racePay: { main: [0.23, 0.57], partner: [0.07, 0.17] },
  signing: { main: [2, 5], partner: [0, 0] },
  win: { main: [2, 4], partner: [0.5, 1] },
  podium: { main: [0.7, 1.5], partner: [0.3, 0.7] },
  points: { main: [0.15, 0.3], partner: [0.1, 0.2] },
  pole: { main: [0.5, 1], partner: [0.3, 0.85] },
  goalBonus: { main: [6.7, 13.3], partner: [0, 0] },
};

/**
 * A prize match's share, as a percentage, for a main sponsor and a partner.
 */
export const MATCH_RANGE = { main: [15, 25], partner: [10, 15] } as const;

/**
 * Car purchase backing's share of a car's price, as a percentage.
 */
export const CAR_BACKING_SHARE = 50;

/**
 * The shares of the class a place target may ask, from the top, by quality.
 */
export const PLACE_SHARES = { low: [1 / 2], mid: [1 / 2, 1 / 3], high: [1 / 3, 1 / 4] } as const;

/**
 * The shares a qualifying target may ask.
 */
export const QUALIFYING_SHARES: readonly number[] = [1 / 2, 1 / 3];

/**
 * The cut laps a clean racing target allows, at most.
 */
export const CLEAN_CUTS = [2, 4] as const;

/**
 * What a target raises its figures by, by how hard it is.
 */
export const TARGET_HARDNESS: Record<SponsorTargetKind, number> = {
  classPlace: 0.1, qualifying: 0.15, teammate: 0.1, clean: 0.05, start: -0.15,
};

/**
 * What a goal raises its figures by, by how hard it is.
 */
export const GOAL_HARDNESS: Record<SponsorGoalKind, number> = {
  championshipPlace: 0.1, resultCount: 0.15, onTarget: 0.05, racesStarted: -0.1,
};

/**
 * The counts a count of results asks, by result, as the fewest and the most.
 */
export const RESULT_COUNTS = { podium: [2, 5], win: [1, 3], pole: [2, 4] } as const;

/**
 * The races a goal to start races asks, as the fewest and the most.
 */
export const RACES_STARTED = [20, 40] as const;

/**
 * The shares of races on target a goal may ask.
 */
export const ON_TARGET_SHARES: readonly number[] = [1 / 2, 3 / 4];

/**
 * The place a championship place goal asks, or a share of the class.
 */
export const CHAMPIONSHIP_PLACE = { top: 3, share: 1 / 2 } as const;

/**
 * Rounds an amount to a figure a sponsor would write: to the nearest hundred
 * under ten thousand, the nearest five hundred above.
 */
export const ROUND_TO = { below: 10_000, small: 100, large: 500 } as const;

/**
 * Who each trade's sponsors are: invented names, each with the nation it
 * comes from.
 */
export const SPONSOR_BOOK: Record<SponsorTrade, readonly Omit<Sponsor, 'trade'>[]> = {
  oil: [
    { name: 'Halden Lubricants', nation: 'GBR' }, { name: 'Castlebridge Fuels', nation: 'GBR' },
    { name: 'Nordvik Oil', nation: 'NOR' }, { name: 'Petrolia Avanti', nation: 'ITA' },
    { name: 'Rheinmark Schmierstoffe', nation: 'DEU' }, { name: 'Sable Motor Oils', nation: 'USA' },
    { name: 'Corbeau Carburants', nation: 'FRA' }, { name: 'Takumi Lube', nation: 'JPN' },
  ],
  tyres: [
    { name: 'Vantor Tyres', nation: 'DEU' }, { name: 'Morrow Rubber', nation: 'GBR' },
    { name: 'Pneus Lacroix', nation: 'FRA' }, { name: 'Gommeria Ardente', nation: 'ITA' },
    { name: 'Kurogane Tire', nation: 'JPN' }, { name: 'Ridgeline Tire Co', nation: 'USA' },
    { name: 'Bergmann Reifen', nation: 'AUT' },
  ],
  tech: [
    { name: 'Corvane Telecom', nation: 'IRL' }, { name: 'Lumen Data', nation: 'USA' },
    { name: 'Helix Systems', nation: 'GBR' }, { name: 'Nexora Software', nation: 'SWE' },
    { name: 'Kaiden Electronics', nation: 'JPN' }, { name: 'Datastrom', nation: 'DEU' },
    { name: 'Quantis Networks', nation: 'NLD' },
  ],
  drinks: [
    { name: 'Brightwater Cider', nation: 'GBR' }, { name: 'Alder Springs', nation: 'CAN' },
    { name: 'Volta Energy', nation: 'AUT' }, { name: 'Cantina Serrano', nation: 'ESP' },
    { name: 'Brauerei Falkner', nation: 'DEU' }, { name: 'Maré Agua', nation: 'PRT' },
    { name: 'Highfield Gin', nation: 'SCT' },
  ],
  watch: [
    { name: 'Kestrel Timing', nation: 'CHE' }, { name: 'Maison Varre', nation: 'CHE' },
    { name: 'Orrell Chronographs', nation: 'GBR' }, { name: 'Sekai Watch', nation: 'JPN' },
    { name: 'Lindqvist Horologe', nation: 'SWE' }, { name: 'Tempo Milano', nation: 'ITA' },
  ],
  finance: [
    { name: 'Moorgate Insurance', nation: 'GBR' }, { name: 'Fenwick Capital', nation: 'GBR' },
    { name: 'Aurum Bank', nation: 'LUX' }, { name: 'Hansa Versicherung', nation: 'DEU' },
    { name: 'Meridian Assurance', nation: 'USA' }, { name: 'Banca Solare', nation: 'ITA' },
    { name: 'Nordhavn Invest', nation: 'DNK' },
  ],
  parts: [
    { name: 'Ridgeway Motor Factors', nation: 'GBR' }, { name: 'Brakeline', nation: 'USA' },
    { name: 'Kessler Autoteile', nation: 'DEU' }, { name: 'Pièces Marchand', nation: 'FRA' },
    { name: 'Tanaka Parts', nation: 'JPN' }, { name: 'Ricambi Ferraresi', nation: 'ITA' },
  ],
  dealer: [
    { name: 'Sutton Motor Group', nation: 'GBR' }, { name: 'Ostwald Automobile', nation: 'DEU' },
    { name: 'Auto Bellini', nation: 'ITA' }, { name: 'Garage Lemaire', nation: 'FRA' },
    { name: 'Lakeside Motors', nation: 'USA' }, { name: 'Haugen Bil', nation: 'NOR' },
  ],
  apparel: [
    { name: 'Northpeak Outdoor', nation: 'CAN' }, { name: 'Kilner & Co', nation: 'GBR' },
    { name: 'Vela Sportswear', nation: 'ESP' }, { name: 'Strada Moda', nation: 'ITA' },
    { name: 'Fjell Apparel', nation: 'NOR' }, { name: 'Brandt Textil', nation: 'DEU' },
  ],
};
