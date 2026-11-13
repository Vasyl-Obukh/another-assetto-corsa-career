import { describe, expect, it, jest } from '@jest/globals';

import { addDays } from '../../../core/season-calendar/index.ts';
import { OFFER_DAYS } from '../../../core/sponsor-offers/index.ts';
import {
  DEFAULT_CAREER_SETTINGS, DEFAULT_SETTINGS, MAX_START_YEAR, MIN_START_YEAR,
} from '../../../shared/constants/index.ts';
import {
  Climate, Discipline, Hemisphere, SeasonLength, TeamBudget, Weekday,
} from '../../../shared/types/index.ts';
import type {
  CalendarInvitation,
  Career,
  CareerSeason,
  Contract,
  ContractTerms,
  GridEntry,
  HistoricDraw,
  InvitationDraw,
  LaunchRecord,
  Mail,
  RacePlace,
  RatingLine,
  RoundForecast,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeasonStandings,
  SeatOffer,
  SeriesSession,
  SessionForecast,
  SponsorDeal,
  SponsorOffer,
} from '../../../shared/types/index.ts';
import { noticeId, offerId } from '../../../shared/utils/contracts/index.ts';
import { invitationId } from '../../../shared/utils/inbox/index.ts';
import {
  climbNewsId, goalNewsId, sponsorMailId, sponsorNewsId, sponsorRenewalId,
} from '../../../shared/utils/sponsors/index.ts';
import {
  advanceSkips,
  advanceStop,
  archivesOf,
  backupName,
  calendarEntry,
  calendarInvitation,
  checkedDriver,
  checkEdition,
  checkedNewCareer,
  checkedNewChampionship,
  checkedYear,
  classCars,
  clockTime,
  closeSeason,
  composeCalendar,
  currentSeason,
  declineOffers,
  deliver,
  drawnCars,
  drawnEvent,
  drawOf,
  editionAt,
  endSponsor,
  endSponsorYears,
  enteredEntry,
  enteredEvent,
  eventName,
  eventSessions,
  eventStrength,
  experiencedAt,
  goalsDue,
  heldRaceable,
  historicDraws,
  historicFee,
  historicInvitation,
  inProgressEvent,
  invitationMail,
  invitationState,
  isListed,
  issueForecast,
  issueForecasts,
  keptInBackup,
  launchBlock,
  launchSkips,
  lostName,
  markMissed,
  materialiseEvents,
  noticeMail,
  offerMail,
  openSeason,
  previousRun,
  profileOf,
  readBackup,
  readProfile,
  readState,
  saleSeats,
  scheduledEvents,
  seasonEndDate,
  seasonOf,
  seasonSalt,
  sendClimbNews,
  sendSponsorOffers,
  signedContract,
  signSponsor,
  simulatedEvent,
  skipCost,
  skippedRound,
  stateOf,
  strengthStep,
  summarise,
  unansweredSkips,
  wantsRewards,
  winnerPrize,
  withGoalMet,
  withKept,
  withLapsed,
  withReply,
  withSeason,
} from '../utils.ts';
import {
  makeAvailability,
  makeCareer,
  makeChampionship,
  makeClassEntry,
  makeEntry,
  makeEvent,
  makeListing,
  makePlan,
  makeRound,
  makeSeason,
} from './fixtures.ts';

/**
 * A career with one season, one entry and one dated event in it.
 * @returns The career, whole enough for readProfile and readState to accept
 */
const wholeCareer = () => makeCareer({
  seasons: [makeSeason({
    entries: [makeEntry({ events: [makeEvent('one', '2026-03-01')] })],
  })],
});

/**
 * Whether an ISO date falls on a Sunday, which is what a race day is.
 * @param date An ISO YYYY-MM-DD date
 * @returns True when it is a Sunday
 */
const isSunday = (date: string): boolean => new Date(`${date}T00:00:00Z`).getUTCDay() === 0;

/**
 * A record of one launch having run.
 * @param index Which launch it records
 * @param classification Car indices in the order it classified them
 * @returns The record
 */
const makeRecord = (index: number, classification: number[] | null = null): LaunchRecord => ({
  index,
  completedAt: '2026-03-08T16:00:00.000Z',
  archive: `${index}.json`,
  gridOrder: [0, 1, 2, 3],
  classification,
});

// The historic event the invitation tests draw: one round and two classes, the
// first at the career's own rung and its first seat a named driver's.
const HISTORIC = makeChampionship({
  id: 'british-gp-1967',
  name: 'British Grand Prix 1967',
  rounds: [makeRound('one')],
  teams: [{ id: 'lotus', name: 'Team Lotus' }],
  entries: [
    makeClassEntry({ seats: [{ id: 'seat-1', team: 'lotus', driver: { name: 'Jim Clark' } }, { id: 'seat-2' }] }),
    makeClassEntry({ id: 'pro', name: 'Pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 }, entryFee: 900 }),
  ],
});

// Invitations sent, drawn on a rung other than the career's own, so a test can
// tell the chance recorded from the one the career's rungs give now.
const INVITED: InvitationDraw = {
  on: '2026-06-14', outcome: 'invited', discipline: Discipline.ROAD, rung: 3, chance: 60,
};

/**
 * Builds the season's draw of the historic event.
 * @param over Whatever the test wants said differently
 * @returns The draw
 */
const makeDraw = (over: Partial<HistoricDraw> = {}): HistoricDraw => ({
  series: 'british-gp-1967',
  championship: HISTORIC,
  round: 'one',
  raceId: 'british-gp-1967/one@0.0',
  date: '2026-07-12',
  invitations: '2026-06-14',
  ...over,
});

/**
 * Builds the mail inviting the player to a drawn event, still to be answered.
 * @param draw The event it invites to
 * @param over Whatever the test wants said differently
 * @returns The mail
 */
const makeMail = (draw: HistoricDraw, over: Partial<Mail> = {}): Mail => ({
  id: invitationId(draw.raceId),
  kind: 'invitation',
  season: 0,
  arrived: draw.invitations,
  opened: false,
  deadline: draw.date,
  invitation: {
    series: draw.series, raceId: draw.raceId, entry: 'main', seat: 'seat-1', car: { model: 'test_car' },
  },
  ...over,
});

/**
 * Builds the player's entry into the historic event, in the seat an
 * invitation offers unless the test says otherwise.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
const makeHistoricEntry = (over: Partial<SeasonEntry> = {}): SeasonEntry => makeEntry({
  series: 'british-gp-1967',
  championship: HISTORIC,
  playerSeat: 'seat-1',
  events: [makeEvent('one', '2026-07-12', { raceId: 'british-gp-1967/one@0.0' })],
  historic: true,
  ...over,
});

/**
 * Builds what a team offers: a free seat in the class, every fee covered.
 * @param over Whatever the test wants said differently
 * @returns The terms
 */
const makeTerms = (over: Partial<ContractTerms> = {}): ContractTerms => ({
  team: 'rivals',
  teamName: 'Rivals Racing',
  budget: TeamBudget.INDEPENDENT,
  entry: 'main',
  seat: 'seat-2',
  car: { model: 'test_car' },
  pay: 'free',
  amount: 0,
  feeCover: 1,
  prizeShare: 50,
  ...over,
});

/**
 * Builds a mail of seat offers for an edition of the test championship.
 * @param edition Which of the season's editions
 * @param over Whatever the test wants said differently
 * @returns The mail
 */
const makeOfferMail = (edition: number, over: Partial<Mail> = {}): Mail => ({
  id: offerId('test-cup', 0, edition),
  kind: 'offer',
  season: 0,
  arrived: '2026-01-04',
  opened: false,
  deadline: '2026-01-18',
  offers: [{
    ...makeTerms(),
    series: 'test-cup',
    seriesName: 'Test Cup',
    season: 0,
    edition,
    opener: '2026-03-01',
    rounds: 2,
    editions: 1,
    entryName: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 4 },
    fees: 2000,
    rent: 300,
  }],
  ...over,
});

/**
 * A seat's place in a race of the cup's one class.
 * @param seat The seat
 * @param classPosition Where it finished in its class
 * @returns The place
 */
const placeOf = (seat: string, classPosition: number): RacePlace => ({
  seat,
  entry: 'main',
  team: null,
  driver: seat,
  position: classPosition,
  classPosition,
  qualifyingPosition: classPosition,
  fastestLap: false,
  finishPoints: 0,
  fastestLapPoints: 0,
  qualifyingPoints: 0,
  points: 0,
});

/**
 * A round of the cup raced, the player in the second seat.
 * @param round The round's id
 * @param date The ISO date it was raced on
 * @param won Whether the player won it rather than finished second
 * @param simulated Whether nobody drove it
 * @returns The event
 */
const racedRound = (round: string, date: string, won = true, simulated = false): SeasonEvent => makeEvent(round, date, {
  status: 'raced',
  score: {
    round,
    recordedAt: `${date}T16:00:00.000Z`,
    races: [{
      launch: 2,
      session: null,
      name: 'Race',
      pointsSystem: 'standard',
      ...(simulated ? { simulated: true } : {}),
      places: won ? [placeOf('seat-2', 1), placeOf('seat-1', 2)] : [placeOf('seat-1', 1), placeOf('seat-2', 2)],
    }],
  },
});

/**
 * The cup's table with the player leading it.
 */
const LEADING: SeasonStandings = {
  classes: [{
    entry: 'main',
    name: 'Main',
    teams: [],
    drivers: [{
      seat: 'seat-2', driver: 'Test Driver', team: null, position: 1, points: 25, wins: 1, podiums: 1, bestFinish: 1, races: 1,
    }],
  }],
  updatedAt: '2026-03-01T16:00:00.000Z',
};

/**
 * The line saying a race opened a new rung.
 * @param date The ISO date of the race
 * @returns The line
 */
const promotion = (date: string): RatingLine => ({
  key: `promotion:${date}`, kind: 'promotion', date, season: 0, change: 0, globalChange: 0, global: 2000,
});

/**
 * A career that has just won the cup's last round, settling its title and
 * opening a rung on the way - which is certain of a sponsor's offer.
 * @param date Where the clock stands
 * @param over Whatever the test wants said differently
 * @returns The career
 */
const inForm = (date = '2026-03-01', over: Partial<Career> = {}): Career => makeCareer({
  date,
  ratingLog: [promotion('2026-03-01')],
  seasons: [makeSeason({ entries: [makeEntry({ events: [racedRound('one', '2026-03-01')], standings: LEADING })] })],
  ...over,
});

/**
 * Builds what a sponsor offers: a main sponsor of oil paying for every race
 * started, with a year's goal of one race.
 * @param over Whatever the test wants said differently
 * @returns The offer
 */
const makeSponsorOffer = (over: Partial<SponsorOffer> = {}): SponsorOffer => ({
  sponsor: { name: 'Halden Lubricants', trade: 'oil', nation: 'GBR' },
  slot: 'main',
  covers: null,
  perks: [{ kind: 'racePay', amount: 500 }],
  target: { kind: 'start' },
  goal: { kind: 'racesStarted', count: 1 },
  rung: 4,
  ...over,
});

/**
 * Builds a deal signed on the career's opening day, for a year.
 * @param over Whatever the test wants said differently
 * @returns The deal
 */
const makeDeal = (over: Partial<SponsorDeal> = {}): SponsorDeal => ({
  ...makeSponsorOffer(),
  id: 'sponsor:test-cup/zero',
  signed: '2026-01-04',
  until: '2027-01-04',
  ...over,
});

/**
 * Builds a sponsor's offer as its mail, open until the end of March.
 * @param offer What it offers
 * @param over Whatever the test wants said differently
 * @returns The mail
 */
const makeSponsorMail = (offer: SponsorOffer = makeSponsorOffer(), over: Partial<Mail> = {}): Mail => ({
  id: sponsorMailId('test-cup/one'),
  kind: 'sponsor',
  season: 0,
  arrived: '2026-03-01',
  opened: false,
  deadline: '2026-03-31',
  sponsor: offer,
  ...over,
});

describe('main/career-store/utils', () => {
  describe('profileOf', () => {
    it('keeps who races the career, when it began and how it is set up, and nothing of where it has got to', () => {
      const career = wholeCareer();

      expect(profileOf(career)).toEqual({
        version: 1,
        id: career.id,
        kind: career.kind,
        createdAt: career.createdAt,
        playedAt: career.playedAt,
        driver: career.driver,
        startDate: career.startDate,
        settings: career.settings,
      });
    });
  });

  describe('stateOf', () => {
    it('keeps where the career has got to, and nothing of who races it', () => {
      const career = wholeCareer();

      expect(stateOf(career)).toEqual({
        version: 1,
        date: career.date,
        money: career.money,
        ledger: career.ledger,
        garage: career.garage,
        rating: career.rating,
        globalRating: career.globalRating,
        level: career.level,
        ratingLog: career.ratingLog,
        seasons: career.seasons,
        inbox: career.inbox,
        sponsors: career.sponsors,
      });
    });

    it('joins back with the profile into the career it was split from', () => {
      const career = wholeCareer();

      expect({ ...profileOf(career), ...stateOf(career) }).toEqual(career);
    });

    it('keeps the car sale the career holds, once there is one', () => {
      const sale = { week: '2027-03-08', headline: { model: 'deal_car', off: 60 }, deals: [] };

      expect(stateOf({ ...wholeCareer(), sale }).sale).toEqual(sale);
      expect('sale' in stateOf(wholeCareer())).toBe(false);
    });

    it('keeps the day news starts from, once there is one', () => {
      expect(stateOf({ ...wholeCareer(), newsFrom: '2026-01-04' }).newsFrom).toBe('2026-01-04');
      expect('newsFrom' in stateOf(wholeCareer())).toBe(false);
    });
  });

  describe('deliver', () => {
    /**
     * A mail that wants no answer.
     * @param id Its id
     * @param arrived The day it came
     * @returns The mail
     */
    const mail = (id: string, arrived: string): Mail => ({
      id, kind: 'rung', season: 0, arrived, opened: false,
    });

    it('puts new mail in by the day it arrived', () => {
      const career = makeCareer({ inbox: [mail('a', '2026-01-04'), mail('c', '2026-03-01')] });

      expect(deliver(career, [mail('b', '2026-02-01')]).inbox.map((one) => one.id)).toEqual(['a', 'b', 'c']);
    });

    it('drops what the inbox already holds, and the same mail handed twice', () => {
      const career = makeCareer({ inbox: [{ ...mail('a', '2026-01-04'), opened: true }] });
      const delivered = deliver(career, [mail('a', '2026-01-04'), mail('b', '2026-02-01'), mail('b', '2026-02-01')]);

      expect(delivered.inbox).toEqual([{ ...mail('a', '2026-01-04'), opened: true }, mail('b', '2026-02-01')]);
    });

    it('hands back the same career when nothing was new', () => {
      const career = makeCareer({ inbox: [mail('a', '2026-01-04')] });

      expect(deliver(career, [mail('a', '2026-01-04')])).toBe(career);
      expect(deliver(career, [])).toBe(career);
    });
  });

  describe('readState', () => {
    it('accepts a state this build wrote', () => {
      const career = wholeCareer();

      expect(readState(career)).toEqual(stateOf(career));
    });

    // A save is a state, so a driver riding along in one would come back over
    // the profile when it was loaded.
    it('leaves out the profile and anything else the file holds', () => {
      const state = readState({ ...wholeCareer(), stray: true });

      expect(state).not.toHaveProperty('driver');
      expect(state).not.toHaveProperty('stray');
    });

    it('refuses anything that is not an object', () => {
      expect(readState(null)).toBeNull();
      expect(readState('career')).toBeNull();
      expect(readState(42)).toBeNull();
      expect(readState(undefined)).toBeNull();
    });

    it('refuses a career written against another revision of the format', () => {
      expect(readState({ ...wholeCareer(), version: 2 })).toBeNull();
    });

    it('refuses a garage holding a car with no listed price to repaint it from', () => {
      expect(readState({
        ...wholeCareer(), garage: [{ model: 'test_car', paid: 40_000, bought: '2026-01-04' }],
      })).toBeNull();
    });

    it('refuses a sale that is not one, and accepts a career holding none', () => {
      expect(readState({ ...wholeCareer(), sale: { week: '2027-03-08' } })).toBeNull();
      expect(readState({ ...wholeCareer(), sale: undefined })).not.toBeNull();
    });

    it('refuses a state missing the day its clock stands at', () => {
      expect(readState({ ...wholeCareer(), date: undefined })).toBeNull();
    });

    // typeof null is "object", so a level of null has to be refused by name or
    // it reads as a whole record of discipline levels.
    it('refuses a career whose ladder levels are missing or null', () => {
      expect(readState({ ...wholeCareer(), level: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), level: null })).toBeNull();
    });

    // A state written before cars cost money has no garage, and reads as a
    // career to be deleted rather than one with nothing bought.
    it('refuses a state whose garage is not a list', () => {
      expect(readState({ ...wholeCareer(), garage: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), garage: {} })).toBeNull();
    });

    // A state written before the rating has neither, and reads as a career to
    // be deleted rather than one rated nowhere.
    it('refuses a state missing its global rating or its rating log', () => {
      expect(readState({ ...wholeCareer(), globalRating: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), globalRating: '2000' })).toBeNull();
      expect(readState({ ...wholeCareer(), ratingLog: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), ratingLog: {} })).toBeNull();
    });

    it('refuses a career whose seasons are not a list', () => {
      expect(readState({ ...wholeCareer(), seasons: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), seasons: {} })).toBeNull();
    });

    it('refuses a season whose entries are not a list', () => {
      const season = { ...makeSeason(), entries: undefined } as unknown as CareerSeason;

      expect(readState(makeCareer({ seasons: [season] }))).toBeNull();
    });

    // Checked at load rather than the first time a round is opened, which is
    // where a half-understood file would otherwise fail.
    it('refuses an entry carrying no championship of its own', () => {
      const entry = { ...makeEntry(), championship: undefined } as unknown as SeasonEntry;

      expect(readState(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
      expect(readState(makeCareer({
        seasons: [makeSeason({
          entries: [{ ...makeEntry(), championship: null } as unknown as SeasonEntry],
        })],
      }))).toBeNull();
    });

    it('refuses an entry whose events are not a list', () => {
      const entry = { ...makeEntry(), events: undefined } as unknown as SeasonEntry;

      expect(readState(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('refuses an event carrying no session records', () => {
      const event = {
        ...makeEvent('one', '2026-03-01'), sessions: undefined,
      } as unknown as SeasonEvent;
      const entry = makeEntry({ events: [event] });

      expect(readState(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    // A career written while an event spanned several days dates its events
    // with firstDay and lastDay, and its championships' formats under another
    // name - quarantined at load rather than failing on the first sort.
    it('refuses an event with no day to race on', () => {
      const event = {
        ...makeEvent('one', '2026-03-01'), date: undefined, firstDay: '2026-02-27',
      } as unknown as SeasonEvent;
      const entry = makeEntry({ events: [event] });

      expect(readState(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('refuses an entry whose championship holds no event formats', () => {
      const { eventFormats: unused, ...championship } = makeChampionship();
      const entry = makeEntry({ championship: championship as unknown as SeasonEntry['championship'] });

      expect(readState(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toBeNull();
    });

    it('accepts a career that has entered nothing yet', () => {
      const career = makeCareer({ seasons: [makeSeason()] });

      expect(readState(career)).toEqual(stateOf(career));
    });

    // A career written while a season was fifty-two weeks long would close a
    // day early, and every season after it would drift a day further.
    it('refuses a season that is not a calendar year', () => {
      const weeks = makeSeason({ startDate: '2026-01-04', endDate: '2027-01-02' });
      const short = makeSeason({ endDate: '2026-12-30' });

      expect(readState(makeCareer({ seasons: [weeks] }))).toBeNull();
      expect(readState(makeCareer({ seasons: [short] }))).toBeNull();
    });

    it('refuses an entry that says nothing of which edition it is', () => {
      const { edition: unused, ...entry } = makeEntry();

      expect(readState(makeCareer({
        seasons: [makeSeason({ entries: [entry as SeasonEntry] })],
      }))).toBeNull();
    });

    it('refuses a state missing its money or rating', () => {
      expect(readState({ ...wholeCareer(), money: '100000' })).toBeNull();
      expect(readState({ ...wholeCareer(), rating: null })).toBeNull();
    });

    // A state written before the economy holds money and no ledger saying
    // where it came from.
    it('refuses a state whose ledger is not a list', () => {
      expect(readState({ ...wholeCareer(), ledger: undefined })).toBeNull();
      expect(readState({ ...wholeCareer(), ledger: {} })).toBeNull();
    });

    // No migration: a state written before the inbox is out of date, and
    // refused like any other.
    it('refuses a state with no inbox, or one that is not a list', () => {
      const { inbox: unused, ...career } = wholeCareer();

      expect(readState(career)).toBeNull();
      expect(readState({ ...wholeCareer(), inbox: {} })).toBeNull();
    });

    it('refuses a historic event its season holds no draw of, as seasons kept before draws were', () => {
      const held = makeHistoricEntry();
      const season = (draws: HistoricDraw[]) => makeSeason({ entries: [held], historicEvents: draws });

      expect(readState({ ...wholeCareer(), seasons: [season([])] })).toBeNull();
      expect(readState({ ...wholeCareer(), seasons: [season([makeDraw()])] })).not.toBeNull();
    });

    it('keeps the mail a state holds', () => {
      const mail = makeMail(makeDraw());

      expect(readState({ ...wholeCareer(), inbox: [mail] })?.inbox).toEqual([mail]);
    });

    it('reads a state holding no sponsors as one with none signed', () => {
      expect(readState({ ...wholeCareer(), sponsors: undefined })?.sponsors).toEqual([]);
    });

    it('keeps the deals a state holds, and refuses sponsors that are not a list', () => {
      const deal = makeDeal();

      expect(readState({ ...wholeCareer(), sponsors: [deal] })?.sponsors).toEqual([deal]);
      expect(readState({ ...wholeCareer(), sponsors: {} })).toBeNull();
    });
  });

  describe('readProfile', () => {
    it('accepts a profile this build wrote', () => {
      const career = wholeCareer();

      expect(readProfile(career)).toEqual(profileOf(career));
    });

    it('leaves out the state and anything else the file holds', () => {
      const profile = readProfile({ ...wholeCareer(), stray: true });

      expect(profile).not.toHaveProperty('seasons');
      expect(profile).not.toHaveProperty('stray');
    });

    it('refuses anything that is not an object', () => {
      expect(readProfile(null)).toBeNull();
      expect(readProfile('career')).toBeNull();
    });

    it('refuses a profile written against another revision of the format', () => {
      expect(readProfile({ ...wholeCareer(), version: 2 })).toBeNull();
    });

    it('refuses a profile missing its id, driver, start or when it was made or last played', () => {
      expect(readProfile({ ...wholeCareer(), id: undefined })).toBeNull();
      expect(readProfile({ ...wholeCareer(), driver: undefined })).toBeNull();
      expect(readProfile({ ...wholeCareer(), driver: { nation: 'GBR' } })).toBeNull();
      expect(readProfile({ ...wholeCareer(), startDate: undefined })).toBeNull();
      expect(readProfile({ ...wholeCareer(), createdAt: undefined })).toBeNull();
      expect(readProfile({ ...wholeCareer(), playedAt: undefined })).toBeNull();
    });

    // A career.json written before a career had settings of its own still
    // reads, on the defaults, rather than going unreadable.
    it('reads its settings field by field, falling back rather than refusing the profile', () => {
      expect(readProfile({ ...wholeCareer(), settings: undefined })?.settings).toEqual(DEFAULT_CAREER_SETTINGS);
      expect(readProfile({ ...wholeCareer(), settings: { historicFrequency: 'daily', allowSameDayEvents: true } })?.settings)
        .toEqual({ ...DEFAULT_CAREER_SETTINGS, allowSameDayEvents: true });
    });

    it("keeps a standalone championship's kind", () => {
      expect(readProfile({ ...wholeCareer(), kind: 'championship' })?.kind).toBe('championship');
    });

    // A career.json written before there were standalone championships says
    // no kind, and is a career.
    it('reads a profile with no kind, or one it does not know, as a career', () => {
      expect(readProfile({ ...wholeCareer(), kind: undefined })?.kind).toBe('career');
      expect(readProfile({ ...wholeCareer(), kind: 'ladder' })?.kind).toBe('career');
    });
  });

  describe('checkedDriver', () => {
    it('trims the name and keeps the nation', () => {
      expect(checkedDriver({ name: '  Oksana Melnyk ', nation: 'UKR' })).toEqual({ name: 'Oksana Melnyk', nation: 'UKR' });
    });

    it('lets a driver race under no flag', () => {
      expect(checkedDriver({ name: 'Eterry', nation: null })).toEqual({ name: 'Eterry', nation: null });
    });

    it('refuses a driver with no name', () => {
      expect(() => checkedDriver({ name: '   ', nation: null }))
        .toThrow(expect.objectContaining({ code: 'career.driver.unnamed' }));
      expect(() => checkedDriver({ name: 7 as unknown as string, nation: null }))
        .toThrow(expect.objectContaining({ code: 'career.driver.unnamed' }));
    });

    it('refuses a nation Assetto Corsa has no flag for', () => {
      expect(() => checkedDriver({ name: 'Eterry', nation: 'XYZ' }))
        .toThrow(expect.objectContaining({ code: 'career.driver.nation' }));
    });
  });

  describe('checkedNewCareer', () => {
    const request = {
      driver: { name: ' Eterry ', nation: 'GBR' }, year: 2027, level: 4, money: 100_000,
    };

    it('passes a request a career can start from, its driver tidied', () => {
      expect(checkedNewCareer(request)).toEqual({ ...request, driver: { name: 'Eterry', nation: 'GBR' } });
    });

    it('refuses a year outside the range a season may open in', () => {
      for (const year of [MIN_START_YEAR - 1, MAX_START_YEAR + 1, 2027.5]) {
        expect(() => checkedNewCareer({ ...request, year }))
          .toThrow(expect.objectContaining({ code: 'career.year.invalid' }));
      }
    });

    it('accepts the first and last years a season may open in', () => {
      expect(checkedNewCareer({ ...request, year: MIN_START_YEAR }).year).toBe(MIN_START_YEAR);
      expect(checkedNewCareer({ ...request, year: MAX_START_YEAR }).year).toBe(MAX_START_YEAR);
    });

    it('refuses a level that is no rung of the ladder', () => {
      for (const level of [0, -1, 2.5]) {
        expect(() => checkedNewCareer({ ...request, level }))
          .toThrow(expect.objectContaining({ code: 'career.level.invalid' }));
      }
    });

    it('refuses money that is negative or not a number', () => {
      for (const money of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(() => checkedNewCareer({ ...request, money }))
          .toThrow(expect.objectContaining({ code: 'career.money.invalid' }));
      }
    });

    it('checks the driver too', () => {
      expect(() => checkedNewCareer({ ...request, driver: { name: '', nation: null } }))
        .toThrow(expect.objectContaining({ code: 'career.driver.unnamed' }));
    });
  });

  describe('checkedYear', () => {
    it('passes a whole year within the range a season may open in', () => {
      expect(checkedYear(MIN_START_YEAR)).toBe(MIN_START_YEAR);
      expect(checkedYear(MAX_START_YEAR)).toBe(MAX_START_YEAR);
    });

    it('refuses a year outside the range, or one that is not whole', () => {
      for (const year of [MIN_START_YEAR - 1, MAX_START_YEAR + 1, 2027.5, Number.NaN]) {
        expect(() => checkedYear(year)).toThrow(expect.objectContaining({ code: 'career.year.invalid' }));
      }
    });
  });

  describe('checkedNewChampionship', () => {
    const request = {
      driver: { name: ' Eterry ', nation: 'GBR' }, year: 2027, series: 'test-cup', entry: 'main', car: { model: 'test_car' },
    };

    it('passes a request a standalone championship can start from, its driver tidied', () => {
      expect(checkedNewChampionship(request)).toEqual({ ...request, driver: { name: 'Eterry', nation: 'GBR' } });
    });

    it('refuses a year outside the range a season may open in', () => {
      expect(() => checkedNewChampionship({ ...request, year: MAX_START_YEAR + 1 }))
        .toThrow(expect.objectContaining({ code: 'career.year.invalid' }));
    });

    it('checks the driver too', () => {
      expect(() => checkedNewChampionship({ ...request, driver: { name: '', nation: null } }))
        .toThrow(expect.objectContaining({ code: 'career.driver.unnamed' }));
    });
  });

  describe('summarise', () => {
    it('says who races it, where its clock stands and how many seasons it has run', () => {
      const career = makeCareer({
        date: '2027-05-02',
        seasons: [makeSeason(), makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' })],
      });

      expect(summarise(career)).toMatchObject({
        id: career.id, driver: career.driver, year: 2027, date: '2027-05-02', playedAt: career.playedAt, seasons: 2,
      });
    });

    it('names the earliest event still to come as next, and pictures its track', () => {
      const career = makeCareer({
        date: '2026-03-10',
        seasons: [makeSeason({
          entries: [makeEntry({
            events: [
              makeEvent('one', '2026-03-01', { status: 'raced' }),
              makeEvent('two', '2026-04-05'),
            ],
          })],
        })],
      });

      expect(summarise(career)).toMatchObject({
        next: {
          seriesName: 'Test Cup', roundName: 'Round two', track: { id: 'track_two' }, date: '2026-04-05', historic: false,
        },
        track: { id: 'track_two' },
      });
    });

    it('says when the next event is a historic one', () => {
      const career = makeCareer({
        seasons: [makeSeason({ entries: [makeEntry({ historic: true, events: [makeEvent('one', '2026-03-01')] })] })],
      });

      expect(summarise(career).next?.historic).toBe(true);
    });

    it('pictures the last round raced once nothing is left to come', () => {
      const career = makeCareer({
        date: '2026-11-01',
        seasons: [makeSeason({
          entries: [makeEntry({
            events: [
              makeEvent('one', '2026-03-01', { status: 'raced' }),
              makeEvent('two', '2026-04-05', { status: 'raced' }),
            ],
          })],
        })],
      });

      expect(summarise(career)).toMatchObject({ next: null, track: { id: 'track_two' } });
    });

    it('passes over an event behind the clock and a championship pulled out of', () => {
      const career = makeCareer({
        date: '2026-03-10',
        seasons: [makeSeason({
          entries: [
            makeEntry({ events: [makeEvent('one', '2026-03-01')] }),
            makeEntry({ series: 'other-cup', withdrawn: true, events: [makeEvent('two', '2026-03-15')] }),
          ],
        })],
      });

      expect(summarise(career)).toMatchObject({ next: null, track: null });
    });

    it('lists the championships entered this season at the rung entered, without historic events', () => {
      const career = makeCareer({
        seasons: [makeSeason({
          entries: [
            makeEntry(),
            makeEntry({ series: 'old-race', historic: true }),
            makeEntry({ series: 'gone-cup', withdrawn: true }),
          ],
        })],
      });

      expect(summarise(career).championships).toEqual([
        { series: 'test-cup', name: 'Test Cup', ladder: { discipline: Discipline.ROAD, tier: 4 } },
      ]);
    });

    // A half-year championship is two entries of one season, and was listed
    // twice before.
    it('lists a championship once however many of its editions were entered', () => {
      const career = makeCareer({
        seasons: [makeSeason({ entries: [makeEntry({ edition: 0 }), makeEntry({ edition: 1 })] })],
      });

      expect(summarise(career).championships.map((one) => one.series)).toEqual(['test-cup']);
    });

    it('says which kind of career it is, and where a standalone championship stands', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-04-05')] });

      expect(summarise(makeCareer({ seasons: [makeSeason({ entries: [entry] })] }))).toMatchObject({
        kind: 'career', standing: null,
      });
      expect(summarise(makeCareer({ kind: 'championship', seasons: [makeSeason({ entries: [entry] })] })))
        .toMatchObject({ kind: 'championship', standing: { rounds: 2, done: 0, over: false } });
    });
  });

  describe('seasonEndDate', () => {
    it('closes a season on the 31 December of the year it opens', () => {
      expect(seasonEndDate('2026-01-01')).toBe('2026-12-31');
    });

    it('closes a leap year on its own last day too', () => {
      expect(seasonEndDate('2024-01-01')).toBe('2024-12-31');
    });
  });

  describe('currentSeason', () => {
    it('reads the season a career is in as its last', () => {
      const first = makeSeason({ index: 0 });
      const second = makeSeason({ index: 1, startDate: '2027-01-03' });

      expect(currentSeason(makeCareer({ seasons: [first, second] }))).toBe(second);
    });

    it('reads nothing from a career with no season yet', () => {
      expect(currentSeason(makeCareer())).toBeNull();
    });
  });

  describe('seasonOf', () => {
    const first = makeSeason({ index: 0 });
    const second = makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' });
    const career = makeCareer({ seasons: [first, second] });

    it('reads the current season when it is not asked for another', () => {
      expect(seasonOf(career)).toBe(second);
    });

    it('finds a season by its index', () => {
      expect(seasonOf(career, 0)).toBe(first);
    });

    it('finds nothing for a season the career has not reached', () => {
      expect(seasonOf(career, 2)).toBeNull();
    });
  });

  describe('openSeason', () => {
    it('opens a calendar year with nothing entered in it', () => {
      expect(openSeason(1, '2027-01-01')).toEqual({
        index: 1, startDate: '2027-01-01', endDate: '2027-12-31', entries: [],
      });
    });
  });

  describe('materialiseEvents', () => {
    const season = makeSeason();

    it('dates every round on the day of the week its championship races', () => {
      const events = materialiseEvents(makeChampionship({ raceWeekday: Weekday.SUNDAY }), season, 0, season.startDate);

      expect(events).toHaveLength(2);
      expect(events.every((event) => isSunday(event.date))).toBe(true);
      expect(events[0].date < events[1].date).toBe(true);
    });

    it('carries the race id each round archives its results under', () => {
      const events = materialiseEvents(makeChampionship(), season, 0, season.startDate);

      expect(events.map((event) => event.raceId)).toEqual(['test-cup/one@0.0', 'test-cup/two@0.0']);
    });

    it('holds the whole calendar inside the career year it is entered in', () => {
      const events = materialiseEvents(makeChampionship(), season, 0, season.startDate);

      expect(events[0].date >= season.startDate).toBe(true);
      expect(events[1].date <= seasonEndDate(season.startDate)).toBe(true);
    });

    it('records a round whose day has already gone by as missed', () => {
      const dated = materialiseEvents(makeChampionship(), season, 0, season.startDate);
      const events = materialiseEvents(
        makeChampionship(), season, 0, addDays(dated[0].date, 1),
      );

      expect(events.map((event) => event.status)).toEqual(['missed', 'scheduled']);
    });

    it('records every round as missed for a season already over', () => {
      const events = materialiseEvents(makeChampionship(), season, 0, '2099-01-01');

      expect(events.map((event) => event.status)).toEqual(['missed', 'missed']);
    });

    it('takes a round entry fee over the championship-wide one', () => {
      const series = makeChampionship({
        entryFee: 500,
        rounds: [makeRound('one'), makeRound('two', { entryFee: 750 })],
      });

      expect(materialiseEvents(series, season, 0, season.startDate).map((one) => one.entryFee))
        .toEqual([500, 750]);
    });

    it("charges the class entered its own fee over the championship's, and a round's over both", () => {
      const series = makeChampionship({
        entryFee: 500,
        entries: [makeClassEntry({ entryFee: 650 }), makeClassEntry({ id: 'second', name: 'Second' })],
        rounds: [makeRound('one'), makeRound('two', { entryFee: 750 })],
      });
      const fees = (entry: string) => materialiseEvents(series, season, 0, season.startDate, entry)
        .map((one) => one.entryFee);

      expect(fees('main')).toEqual([650, 750]);
      expect(fees('second')).toEqual([500, 750]);
    });

    // The offset is seeded off the championship's id, so the forecast shown and
    // the season entered have to be one draw however often it is asked for.
    it('dates a championship identically every time it is asked', () => {
      const series = makeChampionship();

      expect(materialiseEvents(series, season, 0, season.startDate))
        .toEqual(materialiseEvents(series, season, 0, season.startDate));
    });

    it('opens two championships on different days', () => {
      const one = materialiseEvents(makeChampionship({ id: 'alpha-cup' }), season, 0, '2026-01-04');
      const two = materialiseEvents(makeChampionship({ id: 'zebra-trophy' }), season, 0, '2026-01-04');

      expect(one[0].date).not.toBe(two[0].date);
    });

    it('names the run each round is raced in', () => {
      const later = makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' });

      expect(materialiseEvents(makeChampionship(), later, 0, later.startDate).map((event) => event.raceId))
        .toEqual(['test-cup/one@1.0', 'test-cup/two@1.0']);
    });

    it('gives each edition of a quarter-length championship its own quarter of the year', () => {
      const series = makeChampionship({ seasonLength: SeasonLength.QUARTER });
      const quarters = [0, 1, 2, 3].map((edition) => materialiseEvents(series, season, edition, season.startDate));
      const quarter = 13 * 7;

      quarters.forEach((events, edition) => {
        expect(events[0].date >= addDays(season.startDate, edition * quarter)).toBe(true);
        expect(events[1].date < addDays(season.startDate, (edition + 1) * quarter)).toBe(true);
      });
      expect(quarters[3][1].date <= season.endDate).toBe(true);
    });

    it('opens the second edition of a half-year championship in the second half', () => {
      const series = makeChampionship({ seasonLength: SeasonLength.HALF_YEAR });
      const [one] = materialiseEvents(series, season, 1, season.startDate);

      expect(one.date >= addDays(season.startDate, 26 * 7)).toBe(true);
    });
  });

  describe('editionAt', () => {
    const season = makeSeason();
    const quarterly = makeChampionship({ seasonLength: SeasonLength.QUARTER });

    it('is the only edition of a championship that runs once a year', () => {
      expect(editionAt(makeChampionship(), season, '2026-11-30')).toBe(0);
    });

    it('is the first edition whose last round is still ahead', () => {
      const [, last] = materialiseEvents(quarterly, season, 0, season.startDate);

      expect(editionAt(quarterly, season, season.startDate)).toBe(0);
      expect(editionAt(quarterly, season, last.date)).toBe(0);
      expect(editionAt(quarterly, season, addDays(last.date, 1))).toBe(1);
    });

    it('is the last edition of the season once every one of them has run', () => {
      expect(editionAt(quarterly, season, season.endDate)).toBe(3);
    });
  });

  describe('scheduledEvents', () => {
    it('returns only the events still to be raced', () => {
      const entry = makeEntry({
        events: [
          makeEvent('one', '2026-03-01', { status: 'raced' }),
          makeEvent('two', '2026-04-05'),
          makeEvent('three', '2026-05-03', { status: 'missed' }),
        ],
      });

      expect(scheduledEvents(makeSeason({ entries: [entry] })).map(({ event }) => event.round))
        .toEqual(['two']);
    });

    it('leaves out a championship the career pulled out of', () => {
      const raced = makeEntry({ series: 'other-cup', events: [makeEvent('x', '2026-03-01')], withdrawn: true });
      const kept = makeEntry({ events: [makeEvent('one', '2026-04-05')] });

      expect(scheduledEvents(makeSeason({ entries: [raced, kept] })).map(({ event }) => event.round))
        .toEqual(['one']);
    });

    it('orders events of different championships earliest first', () => {
      const late = makeEntry({ series: 'late-cup', events: [makeEvent('late', '2026-06-07')] });
      const early = makeEntry({ series: 'early-cup', events: [makeEvent('early', '2026-02-01')] });

      expect(scheduledEvents(makeSeason({ entries: [late, early] })).map(({ event }) => event.round))
        .toEqual(['early', 'late']);
    });

    it('carries the entry each event belongs to', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-04-05')] });

      expect(scheduledEvents(makeSeason({ entries: [entry] }))[0].entry).toBe(entry);
    });
  });

  describe('advanceStop', () => {
    const season = makeSeason({
      entries: [makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      })],
    });

    it('stops on the day of the first enrolled event on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-06-07')).toBe('2026-03-01');
    });

    it('moves the whole way when nothing entered is on the way', () => {
      expect(advanceStop(season, '2026-01-04', '2026-02-01')).toBe('2026-02-01');
    });

    it('stops at an event on the day asked for', () => {
      expect(advanceStop(season, '2026-01-04', '2026-03-01')).toBe('2026-03-01');
    });

    // Otherwise the clock could never leave the event it is standing in.
    it('does not stop again at the event on the day the clock stands at', () => {
      expect(advanceStop(season, '2026-03-01', '2026-04-05')).toBe('2026-04-05');
    });

    it('ignores an event that has already been raced', () => {
      const raced = makeSeason({
        entries: [makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] })],
      });

      expect(advanceStop(raced, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
    });

    it('moves the whole way when there is no season at all', () => {
      expect(advanceStop(null, '2026-01-04', '2026-06-07')).toBe('2026-06-07');
    });
  });

  describe('seasonSalt', () => {
    it('salts each season of each career differently', () => {
      const career = makeCareer();
      const other = { ...career, id: 'another-career' };

      expect(seasonSalt(career, 0)).not.toBe(seasonSalt(career, 1));
      expect(seasonSalt(career, 0)).not.toBe(seasonSalt(other, 0));
    });

    it('is the same salt every time it is asked for one season', () => {
      expect(seasonSalt(makeCareer(), 2)).toBe(seasonSalt(makeCareer(), 2));
    });

    // Spelled as a season always was, so a year-long championship draws the
    // fields and the weather it drew before editions existed.
    it('salts the first edition exactly as the season', () => {
      expect(seasonSalt(makeCareer(), 1, 0)).toBe(seasonSalt(makeCareer(), 1));
    });

    it('salts each edition of a season apart', () => {
      expect(seasonSalt(makeCareer(), 1, 1)).not.toBe(seasonSalt(makeCareer(), 1, 0));
    });
  });

  describe('issueForecast', () => {
    const GENERATED = makeChampionship({ generatedWeather: { climate: Climate.OCEANIC } });
    const CLOCK = '2026-03-01';
    const FIRST = { season: 0, edition: 0 };

    it('draws an event the clock has come within a week of', () => {
      const issued = issueForecast(makeCareer(), FIRST, GENERATED, makeEvent('one', addDays(CLOCK, 7)), CLOCK);

      expect(issued.forecast).toMatchObject({ series: 'test-cup', round: 'one', climate: Climate.OCEANIC });
      expect(issued.forecast?.sessions).toHaveLength(3);
    });

    it('leaves an event further out than a week undrawn', () => {
      const event = makeEvent('one', addDays(CLOCK, 8));

      expect(issueForecast(makeCareer(), FIRST, GENERATED, event, CLOCK)).toBe(event);
    });

    it('never redraws a forecast already issued', () => {
      const event = issueForecast(makeCareer(), FIRST, GENERATED, makeEvent('one', CLOCK), CLOCK);

      expect(issueForecast(makeCareer({ id: 'career-2' }), { season: 1, edition: 0 }, GENERATED, event, CLOCK)).toBe(event);
    });

    it('draws an event the clock has already passed, so it shows the weather it had', () => {
      const event = makeEvent('one', '2026-02-01', { status: 'missed' });

      expect(issueForecast(makeCareer(), FIRST, GENERATED, event, CLOCK).forecast).toBeDefined();
    });

    it('draws nothing for a championship that authors its weather', () => {
      const event = makeEvent('one', CLOCK);

      expect(issueForecast(makeCareer(), FIRST, makeChampionship(), event, CLOCK)).toBe(event);
    });

    it('draws nothing for a round the championship no longer has', () => {
      const event = makeEvent('gone', CLOCK);

      expect(issueForecast(makeCareer(), FIRST, GENERATED, event, CLOCK)).toBe(event);
    });

    it('draws each career and each season its own weather', () => {
      const draw = (career: string, season: number): string => JSON.stringify(
        issueForecast(makeCareer({ id: career }), { season, edition: 0 }, GENERATED, makeEvent('one', CLOCK), CLOCK)
          .forecast,
      );

      expect(draw('career-1', 0)).toBe(draw('career-1', 0));
      expect(draw('career-1', 0)).not.toBe(draw('career-2', 0));
      expect(draw('career-1', 0)).not.toBe(draw('career-1', 1));
    });

    it('draws a southern round for its own season', () => {
      const south = makeChampionship({
        generatedWeather: { climate: Climate.OCEANIC, hemisphere: Hemisphere.SOUTH },
      });
      const ambientOf = (series: typeof south): number | undefined => (
        issueForecast(makeCareer(), FIRST, series, makeEvent('one', '2026-01-16'), '2026-01-16')
          .forecast?.sessions[0].ambient
      );

      // January is midsummer in the south, and the swing is several degrees.
      expect(ambientOf(south)).toBeGreaterThan(ambientOf(GENERATED) ?? Infinity);
    });

    it('draws each edition of a season its own weather', () => {
      const draw = (edition: number): string => JSON.stringify(
        issueForecast(makeCareer(), { season: 0, edition }, GENERATED, makeEvent('one', CLOCK), CLOCK).forecast,
      );

      expect(draw(1)).not.toBe(draw(0));
    });
  });

  describe('issueForecasts', () => {
    it('draws every event of every entry that is close enough, and no other', () => {
      const championship = makeChampionship({ generatedWeather: { climate: Climate.OCEANIC } });
      const season = makeSeason({
        entries: [makeEntry({
          championship,
          events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-04-05')],
        })],
      });

      const issued = issueForecasts(makeCareer(), season, '2026-02-25');

      expect(issued.entries[0].events.map((event) => event.forecast !== undefined))
        .toEqual([true, false]);
    });
  });

  describe('withSeason', () => {
    it('replaces the season with the same index and leaves the rest alone', () => {
      const first = makeSeason({ index: 0 });
      const second = makeSeason({ index: 1, startDate: '2027-01-03' });
      const replaced = makeSeason({ index: 1, startDate: '2027-01-10' });

      expect(withSeason(makeCareer({ seasons: [first, second] }), replaced).seasons)
        .toEqual([first, replaced]);
    });
  });

  describe('enteredEntry', () => {
    const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

    it('finds the edition the career is racing', () => {
      expect(enteredEntry(makeSeason({ entries: [entry] }), 'test-cup', 0)).toBe(entry);
    });

    it('finds nothing in a championship the career never entered', () => {
      expect(enteredEntry(makeSeason({ entries: [entry] }), 'other-cup', 0)).toBeNull();
    });

    it('finds nothing in an edition the career pulled out of', () => {
      const gone = makeEntry({ withdrawn: true });

      expect(enteredEntry(makeSeason({ entries: [gone] }), 'test-cup', 0)).toBeNull();
    });

    it('finds the edition asked for rather than another of the same championship', () => {
      const second = makeEntry({ edition: 1 });

      expect(enteredEntry(makeSeason({ entries: [entry, second] }), 'test-cup', 1)).toBe(second);
    });

    it('finds the edition re-entered rather than the one the career left', () => {
      const left = makeEntry({ withdrawn: true });

      expect(enteredEntry(makeSeason({ entries: [left, entry] }), 'test-cup', 0)).toBe(entry);
    });
  });

  describe('enteredEvent', () => {
    const event = makeEvent('one', '2026-03-01');
    const entry = makeEntry({ events: [event, makeEvent('two', '2026-05-03')] });
    const season = makeSeason({ entries: [entry] });

    it('finds the entry and the round by their ids', () => {
      expect(enteredEvent(season, 'test-cup', 'one', 0)).toEqual({ entry, event });
    });

    it('finds nothing in a championship the career never entered', () => {
      expect(enteredEvent(season, 'other-cup', 'one', 0)).toBeNull();
    });

    it('finds nothing in a championship the career pulled out of', () => {
      const gone = makeSeason({ entries: [makeEntry({ events: [event], withdrawn: true })] });

      expect(enteredEvent(gone, 'test-cup', 'one', 0)).toBeNull();
    });

    it('finds nothing for a round that championship does not run', () => {
      expect(enteredEvent(season, 'test-cup', 'three', 0)).toBeNull();
    });

    it('finds the round of the edition asked for rather than another', () => {
      const second = makeEntry({ edition: 1, events: [makeEvent('one', '2026-05-03')] });
      const held = makeSeason({ entries: [entry, second] });

      expect(enteredEvent(held, 'test-cup', 'one', 1)?.entry).toBe(second);
    });

    // Guards a bug: read back, the first match was the entry left rather than
    // the one re-entered, while the same page's standings read the re-entered.
    it('reads back the edition re-entered over the one the career left', () => {
      const left = makeEntry({ events: [event], withdrawn: true });
      const back = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });

      expect(enteredEvent(makeSeason({ entries: [left, back] }), 'test-cup', 'one', 0, true)?.entry).toBe(back);
    });

    it('reads back an edition the career pulled out of, when asked to', () => {
      const gone = makeSeason({ entries: [makeEntry({ events: [event], withdrawn: true })] });

      expect(enteredEvent(gone, 'test-cup', 'one', 0, true)?.event).toBe(event);
    });
  });

  describe('inProgressEvent', () => {
    it('finds the event that has sessions recorded against it', () => {
      const started = makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] });
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01'), started] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))?.event).toBe(started);
    });

    it('finds nothing when no event has been started', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))).toBeNull();
    });

    // An event that has been scored is over, whatever it left behind.
    it('ignores the records of an event that is already raced', () => {
      const done = makeEvent('one', '2026-03-01', { status: 'raced', sessions: [makeRecord(0)] });
      const entry = makeEntry({ events: [done] });

      expect(inProgressEvent(makeSeason({ entries: [entry] }))).toBeNull();
    });
  });

  describe('eventName', () => {
    it('names the championship and the round it belongs to', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(eventName({ entry, event: entry.events[0] })).toBe('Test Cup - Round one');
    });

    it('falls back to the round id when the championship no longer runs it', () => {
      const entry = makeEntry({ events: [makeEvent('bygone', '2026-03-01')] });

      expect(eventName({ entry, event: entry.events[0] })).toBe('Test Cup - bygone');
    });
  });

  describe('heldRaceable', () => {
    it("races a round the install can race in the player's own car", () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });

      expect(heldRaceable(makeAvailability(entry.championship), { entry, event: entry.events[0] })).toBe(true);
    });

    it("refuses a round in a car of the player's that is no longer installed", () => {
      const entry = makeEntry({ car: { model: 'gone_car' }, events: [makeEvent('one', '2026-03-01')] });

      expect(heldRaceable(makeAvailability(entry.championship), { entry, event: entry.events[0] })).toBe(false);
    });

    it('refuses a round the install cannot race in any car', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      // Too few of the class's cars installed to field it.
      const availability = makeAvailability(entry.championship, {
        entries: [{
          entry: 'main', eligible: ['test_car'], missing: [], enough: false,
        }],
      });

      expect(heldRaceable(availability, { entry, event: entry.events[0] })).toBe(false);
    });
  });

  describe('launchBlock', () => {
    /**
     * A season holding one championship over the events given.
     * @param events The dated events, in calendar order
     * @returns The season and the entry inside it
     */
    const heldSeason = (events: readonly SeasonEvent[]) => {
      const entry = makeEntry({ events });

      return { entry, season: makeSeason({ entries: [entry] }) };
    };

    it('allows the next session of an event nothing stands in the way of', () => {
      const { entry, season } = heldSeason([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    it('refuses an event that has already been raced or passed', () => {
      const { entry, season } = heldSeason([makeEvent('one', '2026-03-01', { status: 'missed' })]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)?.code)
        .toBe('career.event.closed');
    });

    it('refuses a round the installed content cannot race', () => {
      const { entry, season } = heldSeason([makeEvent('one', '2026-03-01')]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, false, false)?.code)
        .toBe('series.round.unavailable');
    });

    it('allows the event that is itself part-way through', () => {
      const { entry, season } = heldSeason([
        makeEvent('one', '2026-03-01', { sessions: [makeRecord(0)] }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    // Racing one event of a day gives up the rest of it, so one entered after
    // the day was already raced cannot be driven as well.
    it('refuses an event on a day the career has already raced', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toMatchObject({
        code: 'career.event.sameDay', params: { event: 'Other Cup - Round one' },
      });
    });

    it('allows an event on a raced day while two events on one day are allowed', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, true)).toBeNull();
    });

    it('ignores a day raced in a championship the career left', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const left = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01', { status: 'raced' })],
        withdrawn: true,
      });
      const season = makeSeason({ entries: [entry, left] });

      expect(launchBlock(season, { entry, event: entry.events[0] }, true, false)).toBeNull();
    });

    // The checks are ordered so the button and the command always agree on
    // which refusal to say first.
    it('says an event is over before it says anything else about it', () => {
      const { entry, season } = heldSeason([
        makeEvent('one', '2026-03-01'),
        makeEvent('two', '2026-05-03', { status: 'raced' }),
      ]);

      expect(launchBlock(season, { entry, event: entry.events[1] }, false, false)?.code)
        .toBe('career.event.closed');
    });

    // Compared by entry rather than by championship, now that two editions of
    // one championship are two entries of a season.
    it('refuses an event on a day another edition of the same championship was raced', () => {
      const raced = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });
      const other = makeEntry({ edition: 1, events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [raced, other] });

      expect(launchBlock(season, { entry: other, event: other.events[0] }, true, false)?.code)
        .toBe('career.event.sameDay');
    });
  });

  describe('skippedRound', () => {
    it('names and numbers the round, dated as the season holds it', () => {
      const event = makeEvent('two', '2026-05-03');

      expect(skippedRound(makeChampionship(), 'main', 0, event, 'skipped')).toEqual({
        series: 'test-cup',
        edition: 0,
        seriesName: 'Test Cup',
        round: 'two',
        roundName: 'Round two',
        number: 2,
        ladder: { discipline: Discipline.ROAD, tier: 4 },
        date: '2026-05-03',
        reason: 'skipped',
        historic: false,
        fine: null,
      });
    });

    it('wears the ladder of the class the career is in', () => {
      const series = makeChampionship({
        entries: [
          makeClassEntry(),
          makeClassEntry({ id: 'pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } }),
        ],
      });

      expect(skippedRound(series, 'pro', 0, makeEvent('one', '2026-03-01'), 'behind').ladder)
        .toEqual({ discipline: Discipline.SPORTSCAR, tier: 2 });
    });

    it('falls back to the round id for a round the championship no longer runs', () => {
      const lost = skippedRound(makeChampionship(), 'main', 0, makeEvent('bygone', '2026-03-01'), 'clash');

      expect(lost.roundName).toBe('bygone');
      expect(lost.number).toBe(0);
    });

    it('says which edition the round was lost from', () => {
      expect(skippedRound(makeChampionship(), 'main', 2, makeEvent('one', '2026-03-01'), 'skipped').edition).toBe(2);
    });

    it('says when what was lost is a historic event rather than a championship round', () => {
      expect(skippedRound(makeChampionship(), 'main', 0, makeEvent('one', '2026-03-01'), 'clash', true).historic)
        .toBe(true);
    });

    it('carries what losing the round costs under its contract', () => {
      expect(skippedRound(makeChampionship(), 'main', 0, makeEvent('one', '2026-03-01'), 'skipped', false, 800).fine)
        .toBe(800);
    });
  });

  describe('checkEdition', () => {
    const quarterly = makeChampionship({ seasonLength: SeasonLength.QUARTER });

    it('accepts every edition the championship runs', () => {
      expect(() => [0, 1, 2, 3].forEach((edition) => checkEdition(quarterly, edition))).not.toThrow();
    });

    it('refuses an edition it does not run', () => {
      expect(() => checkEdition(quarterly, 4)).toThrow(expect.objectContaining({ code: 'career.edition.unknown' }));
      expect(() => checkEdition(makeChampionship(), 1)).toThrow(expect.objectContaining({ code: 'career.edition.unknown' }));
    });

    it('refuses an edition that is no edition at all', () => {
      expect(() => checkEdition(quarterly, -1)).toThrow(expect.objectContaining({ code: 'career.edition.unknown' }));
      expect(() => checkEdition(quarterly, 1.5)).toThrow(expect.objectContaining({ code: 'career.edition.unknown' }));
    });
  });

  describe('lostName', () => {
    it('names a lost round by its championship and its own name', () => {
      expect(lostName(skippedRound(makeChampionship(), 'main', 0, makeEvent('two', '2026-05-03'), 'skipped')))
        .toBe('Test Cup - Round two');
    });
  });

  describe('advanceSkips', () => {
    const entry = makeEntry({
      events: [
        makeEvent('one', '2026-03-01'),
        makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] }),
      ],
    });
    const season = makeSeason({ entries: [entry] });

    it('lists every event of the career\'s over by the date', () => {
      expect(advanceSkips(season, '2026-06-01').map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped'], ['two', 'partway']]);
    });

    it('costs nothing for an event on the date itself', () => {
      expect(advanceSkips(season, '2026-03-01')).toEqual([]);
    });

    it('leaves out what is already raced and what was given up', () => {
      const withdrawn = makeEntry({ withdrawn: true, events: [makeEvent('one', '2026-03-01')] });
      const raced = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });

      expect(advanceSkips(makeSeason({ entries: [withdrawn, raced] }), '2026-06-01')).toEqual([]);
    });
  });

  describe('launchSkips', () => {
    it('loses every earlier event still unraced', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });

      expect(launchSkips(season, { entry, event: entry.events[1] }, false).map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped']]);
    });

    it('loses an event left part-way, even one later than this', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] })],
      });
      const season = makeSeason({ entries: [entry] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, false).map((one) => [one.round, one.reason]))
        .toEqual([['two', 'partway']]);
    });

    it('loses an event on the same day as a clash', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, false).map((one) => [one.series, one.reason]))
        .toEqual([['other-cup', 'clash']]);
    });

    it('leaves an event on the same day alone while two on one day are allowed', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(launchSkips(season, { entry, event: entry.events[0] }, true)).toEqual([]);
    });

    it('costs nothing for an event raced in its turn', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });

      expect(launchSkips(makeSeason({ entries: [entry] }), { entry, event: entry.events[0] }, false)).toEqual([]);
    });

    it('marks a historic event it loses as historic, whether earlier or on the same day', () => {
      const entry = makeEntry({ events: [makeEvent('two', '2026-05-03')] });
      const earlier = makeEntry({
        series: 'british-gp-1967',
        championship: makeChampionship({ id: 'british-gp-1967', name: 'British Grand Prix 1967' }),
        events: [makeEvent('one', '2026-03-01')],
        historic: true,
      });
      const sameDay = makeEntry({
        series: 'monaco-gp-1961',
        championship: makeChampionship({ id: 'monaco-gp-1961', name: 'Monaco Grand Prix 1961' }),
        events: [makeEvent('one', '2026-05-03')],
        historic: true,
      });
      const season = makeSeason({ entries: [entry, earlier, sameDay] });

      const lost = launchSkips(season, { entry, event: entry.events[0] }, false);

      expect(lost.map((one) => [one.series, one.reason, one.historic]))
        .toEqual([['british-gp-1967', 'skipped', true], ['monaco-gp-1961', 'clash', true]]);
    });

    it('leaves a championship round it loses unmarked', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });

      expect(launchSkips(season, { entry, event: entry.events[1] }, false)[0].historic).toBe(false);
    });
  });

  describe('skipCost', () => {
    it('costs the round itself last, after every earlier round still unraced', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });

      expect(skipCost(season, { entry, event: entry.events[1] }).map((one) => [one.round, one.reason]))
        .toEqual([['one', 'skipped'], ['two', 'unraceable']]);
    });

    it('costs an event left part-way, as launching would', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03', { sessions: [makeRecord(0)] })],
      });
      const season = makeSeason({ entries: [entry] });

      expect(skipCost(season, { entry, event: entry.events[0] }).map((one) => [one.round, one.reason]))
        .toEqual([['two', 'partway'], ['one', 'unraceable']]);
    });

    it('leaves an event on the same day to be raced, whatever the settings say', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const other = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [entry, other] });

      expect(skipCost(season, { entry, event: entry.events[0] }).map((one) => one.series)).toEqual(['test-cup']);
    });

    it('marks a historic event skipped as historic', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')], historic: true });

      expect(skipCost(makeSeason({ entries: [entry] }), { entry, event: entry.events[0] })[0].historic).toBe(true);
    });
  });

  describe('markMissed', () => {
    it('marks the rounds listed as non-starts and leaves the rest', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });
      const marked = markMissed(season, [skippedRound(entry.championship, 'main', 0, entry.events[0], 'skipped')]);

      expect(marked.entries[0].events.map((one) => one.status)).toEqual(['missed', 'scheduled']);
    });

    it('touches only scheduled rounds, never one already raced', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01', { status: 'raced' })] });
      const season = makeSeason({ entries: [entry] });
      const marked = markMissed(season, [skippedRound(entry.championship, 'main', 0, entry.events[0], 'skipped')]);

      expect(marked.entries[0].events[0].status).toBe('raced');
    });

    it('leaves a withdrawn entry as it is', () => {
      const entry = makeEntry({ withdrawn: true, events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [entry] });

      expect(markMissed(season, [skippedRound(entry.championship, 'main', 0, entry.events[0], 'skipped')]).entries[0])
        .toBe(entry);
    });

    it('matches on the championship as well as the round', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [entry] });
      const elsewhere = { ...skippedRound(entry.championship, 'main', 0, entry.events[0], 'skipped'), series: 'other-cup' };

      expect(markMissed(season, [elsewhere]).entries[0].events[0].status).toBe('scheduled');
    });

    it('matches on the edition as well as the championship and the round', () => {
      const first = makeEntry({ events: [makeEvent('one', '2026-03-01')] });
      const second = makeEntry({ edition: 1, events: [makeEvent('one', '2026-06-07')] });
      const season = makeSeason({ entries: [first, second] });
      const marked = markMissed(season, [skippedRound(second.championship, 'main', 1, second.events[0], 'skipped')]);

      expect(marked.entries.map((one) => one.events[0].status)).toEqual(['scheduled', 'missed']);
    });

    it('marks a round lost because the install could not race it as unraceable, and no other', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01'), makeEvent('two', '2026-05-03')],
      });
      const season = makeSeason({ entries: [entry] });
      const marked = markMissed(season, [
        skippedRound(entry.championship, 'main', 0, entry.events[0], 'unraceable'),
        skippedRound(entry.championship, 'main', 0, entry.events[1], 'skipped'),
      ]);

      expect(marked.entries[0].events.map((one) => [one.status, one.unraceable])).toEqual([
        ['missed', true],
        ['missed', undefined],
      ]);
    });
  });

  describe('closeSeason', () => {
    it('stands the clock on the last day of the season', () => {
      const season = makeSeason();

      expect(closeSeason(makeCareer({ date: '2026-10-01', seasons: [season] }), season).date).toBe('2026-12-31');
    });

    it('gives up every round of the career still to run, and leaves the raced ones be', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2026-03-01', { status: 'raced' }), makeEvent('two', '2026-11-29')],
      });
      const season = makeSeason({ entries: [entry] });
      const closed = closeSeason(makeCareer({ date: '2026-10-01', seasons: [season] }), season);

      expect(closed.seasons[0].entries[0].events.map((one) => one.status)).toEqual(['raced', 'missed']);
    });

    it('draws the weather of every round it passes, so each shows the weather it had', () => {
      const championship = makeChampionship({ generatedWeather: { climate: Climate.OCEANIC } });
      const entry = makeEntry({ championship, events: [makeEvent('two', '2026-11-29')] });
      const season = makeSeason({ entries: [entry] });
      const closed = closeSeason(makeCareer({ date: '2026-10-01', seasons: [season] }), season);

      expect(closed.seasons[0].entries[0].events[0].forecast).toBeDefined();
    });

    // Guards a fix: the year closing used to give these up as plain non-starts,
    // which a contract then fined.
    it('marks a round handed over as one the install cannot race', () => {
      const entry = makeEntry({ events: [makeEvent('two', '2026-11-29')] });
      const season = makeSeason({ entries: [entry] });
      const lost = advanceSkips(season, '2027-01-01').map((one) => ({ ...one, reason: 'unraceable' as const }));
      const closed = closeSeason(makeCareer({ date: '2026-10-01', seasons: [season] }), season, lost);

      expect(closed.seasons[0].entries[0].events[0]).toMatchObject({ status: 'missed', unraceable: true });
    });
  });

  describe('clockTime', () => {
    it('says nothing when the event does not say when a session starts', () => {
      expect(clockTime(undefined)).toBeNull();
    });

    it('passes a time the event already wrote as "HH:MM" through', () => {
      expect(clockTime('08:45')).toBe('08:45');
    });

    it('writes a whole number of hours as a clock time', () => {
      expect(clockTime(14)).toBe('14:00');
    });

    it('writes a half hour as thirty minutes past', () => {
      expect(clockTime(14.5)).toBe('14:30');
    });

    it('pads an hour before ten to two digits', () => {
      expect(clockTime(9.25)).toBe('09:15');
      expect(clockTime(0)).toBe('00:00');
    });

    it('wraps midnight round to the start of the day', () => {
      expect(clockTime(24)).toBe('00:00');
    });
  });

  describe('eventSessions', () => {
    const SESSIONS: SeriesSession[] = [
      { type: 'practice', name: 'Practice', minutes: 30 },
      {
        type: 'qualify', id: 'q', name: 'Qualifying', minutes: 15, day: 1,
      },
      {
        type: 'race',
        name: 'Race',
        laps: 78,
        day: 2,
        inherit: { from: 'q' },
        conditions: { timeOfDay: 14.5 },
      },
    ];

    // What the round states, before its distance was turned into laps.
    const STATED: SeriesSession[] = [
      SESSIONS[0],
      SESSIONS[1],
      {
        type: 'race', name: 'Race', day: 2, distance: 305, inherit: { from: 'q' },
      },
    ];


    /**
     * Runs eventSessions over the three-session event above.
     * @param records What has run so far
     * @param live Whether the career can still run this event
     * @param score What the event has paid, when it has been scored
     * @param forecast The round's generated weather, when it has one
     * @param pending Whether that weather is generated but not yet forecast
     * @returns The sessions as the event page would show them
     */
    const sessionsOf = (
      records: readonly LaunchRecord[],
      live = true,
      score: RoundScore | undefined = undefined,
      forecast: RoundForecast | null = null,
      pending = false,
    ) => eventSessions(
      makePlan(SESSIONS), STATED, records, forecast, pending, score, 'seat-2', live,
    );

    it('marks what has run, what runs next and what waits on it', () => {
      expect(sessionsOf([makeRecord(0)]).map((one) => one.status))
        .toEqual(['done', 'next', 'later']);
    });

    it('marks nothing next while the career cannot run the event', () => {
      expect(sessionsOf([makeRecord(0)], false).map((one) => one.status))
        .toEqual(['done', 'later', 'later']);
    });

    it('says which day of the event each session runs on', () => {
      expect(sessionsOf([]).map((one) => one.day)).toEqual([0, 1, 2]);
    });

    it('says when a session starts only where the event says so', () => {
      expect(sessionsOf([]).map((one) => one.startsAt)).toEqual([null, null, '14:30']);
    });

    it('names the session a race takes its grid from', () => {
      const sessions = sessionsOf([]);

      expect(sessions[0].inherit).toBeNull();
      expect(sessions[1].inherit).toBeNull();
      expect(sessions[2].inherit).toEqual({ from: 'Qualifying', reverse: undefined });
    });

    describe('a field of several classes', () => {
      const GRID = ['pro', 'pro', 'am', 'am'].map((entry, at) => (
        { driver: `Driver ${at}`, aiLevel: 95 - at, entry } as GridEntry
      ));

      /**
       * Runs eventSessions over sessions of a two-class field, with nothing run.
       * @param sessions The event's sessions
       * @param grid The field, two classes unless the test says otherwise
       * @returns The sessions as the event page would show them
       */
      const multi = (sessions: SeriesSession[], grid: GridEntry[] = GRID) => eventSessions(
        makePlan(sessions, { grid }), sessions, [], null, false, undefined, 'seat-2', true,
      );

      it('marks a qualifying whose classes run apart', () => {
        const sessions = multi([{ type: 'qualify', classes: 'apart' }, { type: 'qualify' }]);

        expect(sessions.map((one) => one.apart)).toEqual([true, false]);
      });

      it('marks nothing apart in a field of one class', () => {
        const [one] = multi([{ type: 'qualify', classes: 'apart' }], GRID.map((car) => ({ ...car, entry: 'pro' })));

        expect(one.apart).toBe(false);
      });

      it('says how a race lines its classes up, one nothing sets the grid of included', () => {
        const sessions = multi([
          { type: 'race' },
          { id: 'q', type: 'qualify' },
          { type: 'race', inherit: { from: 'q' }, classGrid: 'mixed' },
        ]);

        expect(sessions.map((one) => one.classGrid)).toEqual(['byClass', undefined, 'mixed']);
      });

      it('says a race behind a qualifying run apart lines up by class, whatever it says', () => {
        const sessions = multi([
          { id: 'q', type: 'qualify', classes: 'apart' },
          { type: 'race', inherit: { from: 'q' }, classGrid: 'mixed' },
        ]);

        expect(sessions[1].classGrid).toBe('byClass');
      });

      it('says nothing of classes for a field of one', () => {
        const [race] = multi([{ type: 'race' }], GRID.map((car) => ({ ...car, entry: 'pro' })));

        expect(race).not.toHaveProperty('classGrid');
      });
    });

    it('keeps the distance a race was stated as alongside its lap count', () => {
      const race = sessionsOf([])[2];

      expect(race.laps).toBe(78);
      expect(race.distance).toBe(305);
      expect(race.minutes).toBeUndefined();
    });

    it('measures a timed session in minutes rather than laps', () => {
      const practice = sessionsOf([])[0];

      expect(practice.minutes).toBe(30);
      expect(practice.laps).toBeUndefined();
    });

    it('says where the player starts only for the race that runs next', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0])]);

      expect(sessions.map((one) => one.status)).toEqual(['done', 'done', 'next']);
      expect(sessions[2].startSlot).toBe(4);
      expect(sessions[0].startSlot).toBeNull();
    });

    it('hands back the record of a session that has run', () => {
      const record = makeRecord(0);

      expect(sessionsOf([record])[0].record).toBe(record);
      expect(sessionsOf([record])[1].record).toBeNull();
    });

    it('carries the forecast drawn for each session', () => {
      const forecast: RoundForecast = {
        series: 'test-cup',
        round: 'one',
        climate: Climate.TEMPERATE,
        sessions: [{ index: 1, ambient: 18 } as SessionForecast],
      };
      const sessions = sessionsOf([], true, undefined, forecast);

      expect(sessions[1].forecast).toEqual({ index: 1, ambient: 18 });
      expect(sessions[0].forecast).toBeNull();
    });

    it('says on every session that a forecast is still to come', () => {
      expect(sessionsOf([], true, undefined, null, true).map((one) => one.pending))
        .toEqual([true, true, true]);
      expect(sessionsOf([]).map((one) => one.pending)).toEqual([false, false, false]);
    });

    it('carries what the player took from a race that has been scored', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2,
          session: null,
          name: 'Race',
          pointsSystem: 'standard',
          places: [
            { seat: 'seat-1', position: 1, points: 25 } as RacePlace,
            { seat: 'seat-2', position: 3, points: 15 } as RacePlace,
          ],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].place).toMatchObject({ seat: 'seat-2', position: 3 });
      expect(sessions[2].points).toEqual([{ position: 1, points: 25 }, { position: 3, points: 15 }]);
      expect(sessions[0].place).toBeNull();
      expect(sessions[0].points).toEqual([]);
    });

    it('hands the race\'s score to the race and nothing to any other session', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2, session: null, name: 'Race', pointsSystem: 'standard', places: [],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].score).toBe(score.races[0]);
      expect(sessions[1].score).toBeNull();
    });

    it('never calls a place the player\'s when the driver their seat names took it', () => {
      const score: RoundScore = {
        round: 'one',
        recordedAt: '2026-03-08T16:00:00.000Z',
        races: [{
          launch: 2,
          session: null,
          name: 'Race',
          pointsSystem: 'standard',
          places: [{
            seat: 'seat-2', position: 1, points: 25, substitute: true,
          } as RacePlace],
        }],
      };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1), makeRecord(2)], true, score);

      expect(sessions[2].place).toBeNull();
      expect(sessions[2].points).toEqual([{ position: 1, points: 25 }]);
    });

    it('starts a driven race in the order its qualifying set', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0]), makeRecord(2, [1, 2, 3, 0])]);

      expect(sessions[2].startOrder).toEqual([1, 2, 3, 0]);
    });

    // A simulated launch's car order is its grid already: no [CAR_n] list put
    // the player first.
    it('starts a simulated race in the order it records', () => {
      const simulated = { ...makeRecord(2, [3, 2, 1, 0]), gridOrder: [3, 1, 2, 0], skipped: true };
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0]), simulated]);

      expect(sessions[2].startOrder).toEqual([3, 1, 2, 0]);
    });

    it('gives no start order to anything but a race that has run', () => {
      const sessions = sessionsOf([makeRecord(0), makeRecord(1, [1, 2, 3, 0])]);

      expect(sessions.map((one) => one.startOrder)).toEqual([null, null, null]);
    });
  });

  describe('calendarEntry', () => {
    const career = makeCareer();
    const INVITATION: CalendarInvitation = {
      state: 'accepted', invitations: '2026-04-05', chance: 60, team: null, car: null,
    };

    it('reads a round into the row the calendar shows', () => {
      const series = makeChampionship();
      const event = makeEvent('two', '2026-05-03');

      const row = calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, event, career, true,
      );

      expect(row).toMatchObject({
        series: 'test-cup',
        edition: 0,
        seriesName: 'Test Cup',
        entry: 'main',
        round: 'two',
        roundName: 'Round two',
        track: { id: 'track_two' },
        gridSize: 2,
        enrolled: true,
        eligible: true,
        raceable: true,
        clash: false,
      });
    });

    it('numbers a round by where it sits in the calendar', () => {
      const series = makeChampionship();
      const availability = makeAvailability(series);

      const numbers = series.rounds.map((round) => calendarEntry(
        series,
        availability,
        series.entries[0],
        0,
        makeEvent(round.id, '2026-05-03'),
        career,
        true,
      ).number);

      expect(numbers).toEqual([1, 2]);
    });

    // A round already raced must not disappear off the calendar because the
    // championship was edited under it.
    it('keeps a round the season copy no longer runs, under its own id', () => {
      const series = makeChampionship();
      const event = makeEvent('bygone', '2026-05-03');

      const row = calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, event, career, true,
      );

      expect(row.round).toBe('bygone');
      expect(row.roundName).toBe('bygone');
      expect(row.number).toBe(1);
      expect(row.track).toEqual({ id: '' });
      expect(row.races).toEqual([]);
      expect(row.raceable).toBe(false);
    });

    it('pays a class its own purse over the championship-wide one', () => {
      const entry = makeClassEntry({ prizes: { positions: [9000] } });
      const series = makeChampionship({ prizes: { positions: [100] }, entries: [entry] });

      const paid = calendarEntry(
        series,
        makeAvailability(series),
        entry,
        0,
        makeEvent('one', '2026-05-03'),
        career,
        true,
      );

      expect(paid.prize).toBe(9000);
    });

    it('pays the championship purse to a class stating none of its own', () => {
      const series = makeChampionship({ prizes: { positions: [100] } });

      const paid = calendarEntry(
        series,
        makeAvailability(series),
        series.entries[0],
        0,
        makeEvent('one', '2026-05-03'),
        career,
        true,
      );

      expect(paid.prize).toBe(100);
    });

    it('says when a class shares its calendar with another of the championship', () => {
      const single = makeChampionship();
      const multi = makeChampionship({
        entries: [makeClassEntry(), makeClassEntry({ id: 'second', name: 'Second' })],
      });
      const event = makeEvent('one', '2026-05-03');

      expect(calendarEntry(
        single, makeAvailability(single), single.entries[0], 0, event, career, true,
      ).multiClass).toBe(false);
      expect(calendarEntry(
        multi, makeAvailability(multi), multi.entries[0], 0, event, career, true,
      ).multiClass).toBe(true);
    });

    it('says a class above the career level is not one it may enter', () => {
      const entry = makeClassEntry({ ladder: { discipline: Discipline.ROAD, tier: 1 } });
      const series = makeChampionship({ entries: [entry] });

      expect(calendarEntry(
        series,
        makeAvailability(series),
        entry,
        0,
        makeEvent('one', '2026-05-03'),
        career,
        false,
      ).eligible).toBe(false);
    });

    it('marks a historic event, which the career may race whatever its level', () => {
      const entry = makeClassEntry({ ladder: { discipline: Discipline.ROAD, tier: 1 } });
      const series = makeChampionship({ entries: [entry] });

      expect(calendarEntry(
        series, makeAvailability(series), entry, 0, makeEvent('one', '2026-05-03'), career, true, INVITATION,
      )).toMatchObject({ historic: true, eligible: true, invitation: INVITATION });
    });

    it('keeps a historic event open to enter whatever became of its invitation', () => {
      const series = makeChampionship();

      expect(calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, makeEvent('one', '2026-05-03'), career, false,
        { ...INVITATION, state: 'declined' },
      ).eligible).toBe(true);
    });

    it('leaves a championship round unmarked', () => {
      const series = makeChampionship();

      expect(calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, makeEvent('one', '2026-05-03'), career, true,
      ).historic).toBe(false);
    });

    it('carries no invitation on a championship round', () => {
      const series = makeChampionship();

      expect(calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, makeEvent('one', '2026-05-03'), career, true,
      )).not.toHaveProperty('invitation');
    });

    it('says which edition the round belongs to and how many the championship runs', () => {
      const series = makeChampionship({ seasonLength: SeasonLength.QUARTER });

      expect(calendarEntry(
        series, makeAvailability(series), series.entries[0], 2, makeEvent('one', '2026-07-05'), career, false,
      )).toMatchObject({ edition: 2, editions: 4 });
    });

    it("pays the prize at the career's progression speed", () => {
      const series = makeChampionship({ prizes: { positions: [1000] } });
      const fast = makeCareer({ settings: { ...career.settings, prizeSpeed: 2 } });

      expect(calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, makeEvent('one', '2026-05-03'), fast, true,
      ).prize).toBe(2000);
    });

    it('says what a round costs to enter, a historic event entered at its own cost included', () => {
      const series = makeChampionship();
      const event = makeEvent('one', '2026-05-03', { entryFee: 1500 });
      const row = (invitation?: CalendarInvitation) => calendarEntry(
        series, makeAvailability(series), series.entries[0], 0, event, career, true, invitation,
      );

      expect(row().entryFee).toBe(1500);
      expect(row({ ...INVITATION, state: 'entered' }).entryFee).toBe(1500);
    });
  });

  describe('winnerPrize', () => {
    const series = makeChampionship({ prizes: { positions: [1000, 500] } });

    it("pays a win at the career's progression speed", () => {
      const career = makeCareer({ settings: { ...makeCareer().settings, prizeSpeed: 1.5 } });

      expect(winnerPrize(career, series, 'main')).toBe(1500);
    });

    it('reads the purse as it stands in a standalone championship, which has no money', () => {
      const career = makeCareer({ kind: 'championship', settings: { ...makeCareer().settings, prizeSpeed: 1.5 } });

      expect(winnerPrize(career, series, 'main')).toBe(1000);
    });

    it("pays a class its own purse over the championship's", () => {
      const own = makeChampionship({
        prizes: { positions: [100] }, entries: [makeClassEntry({ prizes: { positions: [9000] } })],
      });

      expect(winnerPrize(makeCareer(), own, 'main')).toBe(9000);
    });

    it('says nothing where the championship pays nothing', () => {
      expect(winnerPrize(makeCareer(), makeChampionship(), 'main')).toBeNull();
    });
  });

  describe('historicDraws', () => {
    it('lists the historic events the season drew', () => {
      const draws = [makeDraw(), makeDraw({ series: 'italian-gp-1967', date: '2026-09-06' })];

      expect(historicDraws(makeSeason({ historicEvents: draws }))).toEqual(draws);
    });

    it('lists none for a season that drew none', () => {
      expect(historicDraws(makeSeason())).toEqual([]);
    });
  });

  describe('drawOf', () => {
    const draw = makeDraw();
    const season = makeSeason({ historicEvents: [makeDraw({ series: 'italian-gp-1967' }), draw] });

    it('finds a historic event the season drew by its id', () => {
      expect(drawOf(season, 'british-gp-1967')).toBe(draw);
    });

    it('says nothing of an event the season did not draw', () => {
      expect(drawOf(season, 'monaco-gp-1961')).toBeNull();
      expect(drawOf(makeSeason(), 'british-gp-1967')).toBeNull();
    });
  });

  describe('historicFee', () => {
    it("charges a class its own fee over the event's, and the round's over both", () => {
      const event = { ...HISTORIC, entryFee: 300 };

      expect(historicFee(event, 'pro')).toBe(900);
      expect(historicFee(event, 'main')).toBe(300);
      expect(historicFee({ ...event, rounds: [makeRound('one', { entryFee: 1200 })] }, 'pro')).toBe(1200);
    });

    it('says nothing where entering costs nothing', () => {
      expect(historicFee(HISTORIC, 'main')).toBeNull();
      expect(historicFee({ ...HISTORIC, entryFee: 0 }, 'main')).toBeNull();
    });
  });

  describe('drawnEvent', () => {
    it('reads a drawn event as the event its one round is, charging the fee of its class', () => {
      expect(drawnEvent(makeDraw(), '2026-06-20', 'pro')).toEqual({
        round: 'one',
        raceId: 'british-gp-1967/one@0.0',
        date: '2026-07-12',
        entryFee: 900,
        status: 'scheduled',
        sessions: [],
      });
    });

    it('carries no fee for a class that enters for nothing', () => {
      expect(drawnEvent(makeDraw(), '2026-06-20', 'main')).not.toHaveProperty('entryFee');
    });

    it('passes the event by once its day is behind the clock, and not on the day itself', () => {
      expect(drawnEvent(makeDraw(), '2026-07-12', 'main').status).toBe('scheduled');
      expect(drawnEvent(makeDraw(), '2026-07-13', 'main').status).toBe('missed');
    });
  });

  describe('invitationMail', () => {
    const draw = makeDraw();

    it('finds the mail inviting the player to the event', () => {
      const mail = makeMail(draw);
      const other = makeMail(makeDraw({ raceId: 'italian-gp-1967/one@0.0' }));

      expect(invitationMail(makeCareer({ inbox: [other, mail] }), draw)).toBe(mail);
    });

    it('says nothing while no invitation to it came', () => {
      const other = makeMail(makeDraw({ raceId: 'italian-gp-1967/one@0.0' }));

      expect(invitationMail(makeCareer({ inbox: [other] }), draw)).toBeNull();
    });
  });

  describe('withReply', () => {
    it('answers the mail on the day the clock stands at and opens it, leaving the rest alone', () => {
      const mail = makeMail(makeDraw());
      const other = makeMail(makeDraw({ raceId: 'italian-gp-1967/one@0.0' }));
      const career = makeCareer({ date: '2026-06-20', inbox: [mail, other] });

      expect(withReply(career, mail, 'declined').inbox).toEqual([
        { ...mail, opened: true, reply: { answer: 'declined', on: '2026-06-20' } },
        other,
      ]);
      expect(career.inbox[0]).toBe(mail);
    });

    it('names the offer accepted on a seat offer', () => {
      const mail = makeOfferMail(0);
      const career = makeCareer({ date: '2026-01-10', inbox: [mail] });

      expect(withReply(career, mail, 'accepted', { entry: 'main', team: 'rivals' }).inbox[0].reply).toEqual({
        answer: 'accepted', on: '2026-01-10', offer: { entry: 'main', team: 'rivals' },
      });
    });
  });

  describe('offerMail', () => {
    const series = makeChampionship({
      entries: [
        makeClassEntry(),
        makeClassEntry({ id: 'pro', name: 'Pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } }),
      ],
    });
    const season = makeSeason({ index: 2 });
    const mainEvents = [
      { date: '2026-03-08', entryFee: 500 },
      { date: '2026-04-05', entryFee: 700 },
    ];
    const proEvents = [{ date: '2026-03-01', entryFee: 900 }, { date: '2026-04-05' }];

    it('mails every class of the edition as one mail, each offer stamped with its own class', () => {
      const mail = offerMail(season, series, 1, [
        { terms: makeTerms(), events: mainEvents, rent: 300 },
        { terms: makeTerms({ entry: 'pro', team: 'works' }), events: proEvents, rent: 0 },
      ], '2026-01-04');

      expect(mail).toMatchObject({
        id: offerId('test-cup', 2, 1), kind: 'offer', season: 2, arrived: '2026-01-04', opened: false,
      });
      expect(mail.offers?.map((one) => ({
        entry: one.entry,
        entryName: one.entryName,
        ladder: one.ladder,
        opener: one.opener,
        rounds: one.rounds,
        fees: one.fees,
        rent: one.rent,
        series: one.series,
        seriesName: one.seriesName,
        season: one.season,
        edition: one.edition,
        editions: one.editions,
      }))).toEqual([
        {
          entry: 'main',
          entryName: 'Main',
          ladder: { discipline: Discipline.ROAD, tier: 4 },
          opener: '2026-03-08',
          rounds: 2,
          fees: 1200,
          rent: 300,
          series: 'test-cup',
          seriesName: 'Test Cup',
          season: 2,
          edition: 1,
          editions: 1,
        },
        {
          entry: 'pro',
          entryName: 'Pro',
          ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
          opener: '2026-03-01',
          rounds: 2,
          fees: 900,
          rent: 0,
          series: 'test-cup',
          seriesName: 'Test Cup',
          season: 2,
          edition: 1,
          editions: 1,
        },
      ]);
    });

    it('stands a fortnight from the day it arrives', () => {
      const mail = offerMail(season, series, 0, [{ terms: makeTerms(), events: mainEvents, rent: 0 }], '2026-01-04');

      expect(mail.deadline).toBe('2026-01-18');
    });

    it('lapses on the eve of the earliest opener of any class when that comes sooner', () => {
      const mail = offerMail(season, series, 0, [
        { terms: makeTerms(), events: mainEvents, rent: 0 },
        { terms: makeTerms({ entry: 'pro' }), events: proEvents, rent: 0 },
      ], '2026-02-22');

      expect(mail.deadline).toBe('2026-02-28');
    });
  });

  describe('signedContract', () => {
    it('copies the terms as offered, naming the mail and the day it was signed', () => {
      const terms = makeTerms({
        nation: 'ITA', bonus: [{ upTo: 1, amount: 2000 }], lifeline: true,
      });

      expect(signedContract(makeOfferMail(0), terms, '2026-01-10')).toEqual({
        ...terms, offer: offerId('test-cup', 0, 0), signed: '2026-01-10',
      });
    });

    it('copies what keeps the player on, what it renews, and a bought seat\'s rounds', () => {
      const renews = {
        season: 0, edition: 0, place: 3, amount: 0, feeCover: 0.5, prizeShare: 45,
      };
      const terms = makeTerms({
        keep: 4, renews, bought: true, pricedRounds: 2,
      });

      expect(signedContract(makeOfferMail(0), terms, '2026-01-10')).toMatchObject({
        keep: 4, renews, bought: true, pricedRounds: 2,
      });
    });

    it('keeps nothing of the offer but its terms', () => {
      const mail = makeOfferMail(0);
      const offer = mail.offers?.[0] as SeatOffer;
      const contract = signedContract(mail, offer, '2026-01-10');

      expect(Object.keys(contract).sort()).toEqual([
        'amount', 'budget', 'car', 'entry', 'feeCover', 'offer', 'pay', 'prizeShare', 'seat', 'signed', 'team', 'teamName',
      ]);
    });
  });

  describe('previousRun', () => {
    /**
     * An edition of the test championship raced under a contract.
     * @param edition Which of the season's editions
     * @param contract What to change about the contract
     * @returns The entry
     */
    const raced = (edition: number, contract: Partial<Contract> = {}): SeasonEntry => makeEntry({
      edition, contract: { ...makeTerms(), offer: offerId('test-cup', 0, edition), signed: '2026-01-10', ...contract },
    });

    it('finds the edition before in the same season', () => {
      const halves = makeChampionship({ seasonLength: SeasonLength.HALF_YEAR });
      const season = makeSeason({ entries: [raced(0)] });

      expect(previousRun(makeCareer({ seasons: [season] }), season, halves, 1)?.entry.edition).toBe(0);
    });

    it('finds last season\'s last edition for the first of a season', () => {
      const last = makeSeason({ entries: [raced(0)] });
      const next = makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' });
      const found = previousRun(makeCareer({ seasons: [last, next] }), next, makeChampionship(), 0);

      expect(found?.season).toBe(last);
    });

    it('finds nothing raced on the player\'s own, terminated or decided already', () => {
      const championship = makeChampionship();
      const next = makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' });
      for (const entry of [makeEntry(), raced(0, { ended: '2026-05-01' }), raced(0, { kept: 'offered' })]) {
        const career = makeCareer({ seasons: [makeSeason({ entries: [entry] }), next] });

        expect(previousRun(career, next, championship, 0)).toBeNull();
      }
    });

    // Guards a fix: a seat terminated and bought again left two entries of the
    // run, and the first - the terminated one - hid the contract in force.
    it('finds the contract still in force beside one terminated in the same run', () => {
      const next = makeSeason({ index: 1, startDate: '2027-01-01', endDate: '2027-12-31' });
      const last = makeSeason({ entries: [raced(0, { ended: '2026-05-01' }), raced(0, { team: 'again' })] });
      const found = previousRun(makeCareer({ seasons: [last, next] }), next, makeChampionship(), 0);

      expect(found?.entry.contract.team).toBe('again');
    });
  });

  describe('withKept', () => {
    it('writes what came of the team deciding onto that run\'s contract alone', () => {
      const entry = makeEntry({ contract: { ...makeTerms(), offer: 'offer:test-cup:0.0', signed: '2026-01-10' } });
      const other = makeEntry({ series: 'other-cup' });
      const career = makeCareer({ seasons: [makeSeason({ entries: [entry, other] })] });
      const [kept, untouched] = withKept(career, 0, 'test-cup', 0, 'released').seasons[0].entries;

      expect(kept.contract?.kept).toBe('released');
      expect(untouched).toBe(other);
    });

    it('leaves a terminated contract of the run as it ended', () => {
      const ended = makeEntry({ contract: { ...makeTerms(), offer: 'x', signed: '2026-01-10', ended: '2026-04-01' } });
      const career = makeCareer({ seasons: [makeSeason({ entries: [ended] })] });

      expect(withKept(career, 0, 'test-cup', 0, 'renewed').seasons[0].entries[0].contract?.kept).toBeUndefined();
    });
  });

  describe('noticeMail', () => {
    it('is team news about the run, wanting no answer, saying what the team asked and where the player stood', () => {
      const entry = makeEntry({
        contract: {
          ...makeTerms({ nation: 'ITA', keep: 4 }), offer: 'offer:test-cup:0.0', signed: '2026-01-10',
        },
      });
      const standing = {
        place: 7, mate: 2, size: 12, kept: false,
      };
      const mail = noticeMail(makeSeason(), { ...entry, contract: entry.contract as Contract }, standing, '2027-01-03', 1);

      expect(mail).toEqual({
        id: noticeId('test-cup', 0, 0),
        kind: 'notice',
        season: 1,
        arrived: '2027-01-03',
        opened: false,
        notice: {
          series: 'test-cup',
          seriesName: 'Test Cup',
          season: 0,
          edition: 0,
          editions: 1,
          team: 'rivals',
          teamName: 'Rivals Racing',
          nation: 'ITA',
          entryName: 'Main',
          keep: 4,
          standing,
        },
      });
      expect(mail.deadline).toBeUndefined();
      expect(mail.from).toBeUndefined();
    });

    it('says who wrote it, where the team\'s boss is named', () => {
      const entry = makeEntry({
        contract: { ...makeTerms(), offer: 'offer:test-cup:0.0', signed: '2026-01-10' },
      });
      const from = { role: 'owner' as const, name: 'Pat Owner', teamName: 'Rivals Racing' };
      const mail = noticeMail(makeSeason(), { ...entry, contract: entry.contract as Contract }, {
        place: 7, mate: 2, size: 12, kept: false,
      }, '2027-01-03', 1, from);

      expect(mail.from).toEqual(from);
    });
  });

  describe('saleSeats', () => {
    const championship = makeChampionship({
      teams: [
        { id: 'priv', name: 'Privateer Garage', budget: TeamBudget.PRIVATEER },
        { id: 'works', name: 'Works Racing', budget: TeamBudget.WORKS },
      ],
      entries: [makeClassEntry({
        seats: [
          { id: 'p-1', team: 'priv' }, { id: 'p-2', team: 'priv' }, { id: 'w-1', team: 'works' }, { id: 'w-2', team: 'works' },
        ],
      })],
      rounds: [makeRound('one'), makeRound('two', { entryFee: 3_000 })],
      entryFee: 1_000,
    });
    const season = makeSeason();
    const [classEntry] = championship.entries;

    it('sells the class\'s privateer seats for the edition, priced off its fees', () => {
      const seats = saleSeats(makeCareer(), season, championship, makeAvailability(championship), classEntry, 0);

      expect(seats.map((seat) => seat.team)).toEqual(['priv']);
      expect(seats[0].amount).toBeGreaterThanOrEqual(5_200);
      expect(seats[0].amount).toBeLessThanOrEqual(6_000);
      expect(seats[0].pricedRounds).toBeUndefined();
    });

    it('prices on the rounds still to race, and sells nothing once none is', () => {
      const events = materialiseEvents(championship, season, 0, '2026-01-04', classEntry.id);
      const between = addDays(events[0].date, 1);
      const available = makeAvailability(championship);
      const late = saleSeats(makeCareer({ date: between }), season, championship, available, classEntry, 0);
      const over = addDays(events[1].date, 1);

      expect(late[0].pricedRounds).toBe(1);
      expect(saleSeats(makeCareer({ date: over }), season, championship, makeAvailability(championship), classEntry, 0))
        .toEqual([]);
    });
  });

  describe('declineOffers', () => {
    const season = makeSeason();

    it('turns down the offers for the edition still waiting, on the day the clock stands at', () => {
      const mail = makeOfferMail(0);
      const career = makeCareer({ date: '2026-01-10', inbox: [mail] });

      expect(declineOffers(career, season, 'test-cup', 0).inbox[0]).toEqual({
        ...mail, opened: true, reply: { answer: 'declined', on: '2026-01-10' },
      });
    });

    it('leaves offers for another edition, and those already answered or lapsed, alone', () => {
      const other = makeOfferMail(1);
      const answered = makeOfferMail(0, { reply: { answer: 'accepted', on: '2026-01-05' } });
      const lapsed = makeOfferMail(0, { deadline: '2026-01-08' });

      for (const inbox of [[other], [answered], [lapsed]]) {
        const career = makeCareer({ date: '2026-01-10', inbox });

        expect(declineOffers(career, season, 'test-cup', 0)).toBe(career);
      }
    });

    it('matches the season as well as the championship and the edition', () => {
      const career = makeCareer({ date: '2026-01-10', inbox: [makeOfferMail(0)] });

      expect(declineOffers(career, makeSeason({ index: 1 }), 'test-cup', 0)).toBe(career);
    });
  });

  describe('experiencedAt', () => {
    const raced = [
      makeEvent('one', '2026-03-01', { status: 'raced' }),
      makeEvent('two', '2026-05-03', { status: 'missed' }),
    ];
    const at = (entry: SeasonEntry) => makeCareer({
      date: '2026-06-01', seasons: [makeSeason({ entries: [entry] })],
    });

    it('counts an edition run its course at the rung', () => {
      expect(experiencedAt(at(makeEntry({ events: raced })), Discipline.ROAD, 4)).toBe(true);
    });

    it('counts a rung above the one asked about, and never one below it', () => {
      const career = at(makeEntry({ events: raced }));

      expect(experiencedAt(career, Discipline.ROAD, 5)).toBe(true);
      expect(experiencedAt(career, Discipline.ROAD, 3)).toBe(false);
    });

    it('counts only the discipline asked about', () => {
      expect(experiencedAt(at(makeEntry({ events: raced })), Discipline.TOURING, 4)).toBe(false);
    });

    it('counts no edition still running, withdrawn from or historic', () => {
      const running = [raced[0], makeEvent('two', '2026-07-05')];

      expect(experiencedAt(at(makeEntry({ events: running })), Discipline.ROAD, 4)).toBe(false);
      expect(experiencedAt(at(makeEntry({ events: raced, withdrawn: true })), Discipline.ROAD, 4)).toBe(false);
      expect(experiencedAt(at(makeEntry({ events: raced, historic: true })), Discipline.ROAD, 4)).toBe(false);
    });
  });

  describe('invitationState', () => {
    const draw = makeDraw();
    const sent = makeDraw({ invitation: INVITED });
    const season = makeSeason({ historicEvents: [sent] });

    it('is pending until invitations go out', () => {
      expect(invitationState(makeCareer(), makeSeason({ historicEvents: [draw] }), draw)).toBe('pending');
    });

    it('awaits an answer to an invitation sent, up to and on its day', () => {
      const inbox = [makeMail(sent)];

      expect(invitationState(makeCareer({ date: '2026-06-20', inbox }), season, sent)).toBe('awaiting');
      expect(invitationState(makeCareer({ date: '2026-07-12', inbox }), season, sent)).toBe('awaiting');
    });

    it('says how an invitation was answered', () => {
      const answered = (answer: 'accepted' | 'declined') => makeCareer({
        date: '2026-06-20', inbox: [makeMail(sent, { reply: { answer, on: '2026-06-18' } })],
      });

      expect(invitationState(answered('accepted'), season, sent)).toBe('accepted');
      expect(invitationState(answered('declined'), season, sent)).toBe('declined');
    });

    it('lapses an invitation left unanswered past its day', () => {
      expect(invitationState(makeCareer({ date: '2026-07-13', inbox: [makeMail(sent)] }), season, sent))
        .toBe('lapsed');
    });

    it('says none came where the draw sent none', () => {
      const missed = makeDraw({ invitation: { ...INVITED, outcome: 'uninvited' } });

      expect(invitationState(makeCareer({ date: '2026-06-20' }), makeSeason({ historicEvents: [missed] }), missed))
        .toBe('uninvited');
    });

    it('is closed where none was drawn for because the player had entered, once they are no longer in it', () => {
      const closed = makeDraw({ invitation: { on: '2026-06-14', outcome: 'entered' } });

      expect(invitationState(makeCareer({ date: '2026-06-20' }), makeSeason({ historicEvents: [closed] }), closed))
        .toBe('closed');
    });

    it('says the player is in it at their own cost, whatever an invitation still waiting says', () => {
      const paid = makeSeason({
        historicEvents: [sent],
        entries: [makeHistoricEntry({ car: { model: 'test_car', source: 'rented' } })],
      });

      expect(invitationState(makeCareer({ date: '2026-06-20', inbox: [makeMail(sent)] }), paid, sent))
        .toBe('entered');
    });

    it('reads the player in it in a car that came with an invitation as accepted', () => {
      const invited = makeSeason({ historicEvents: [sent], entries: [makeHistoricEntry()] });

      expect(invitationState(makeCareer({ date: '2026-06-20' }), invited, sent)).toBe('accepted');
    });
  });

  describe('drawnCars', () => {
    it("lists the installed cars each class may race, the round's own over the event's", () => {
      const availability = makeAvailability(HISTORIC, {
        entries: [
          {
            entry: 'main', eligible: ['a', 'b'], missing: [], enough: true,
          },
          {
            entry: 'pro', eligible: ['c'], missing: [], enough: true,
          },
        ],
        rounds: [{
          round: 'one',
          track: null,
          pitboxes: null,
          entries: [{
            entry: 'main', eligible: ['a'], missing: [], enough: true,
          }],
          races: [],
        }],
      });

      expect(drawnCars(makeDraw(), availability)).toEqual(new Map([['main', ['a']], ['pro', ['c']]]));
    });

    it('lists no cars for a class the install cannot field', () => {
      expect(drawnCars(makeDraw(), makeAvailability(HISTORIC, { entries: [] })))
        .toEqual(new Map([['main', []], ['pro', []]]));
    });
  });

  describe('historicInvitation', () => {
    const availability = makeAvailability(HISTORIC);

    it("gives the chance the player's rung gives now, before invitations go out", () => {
      const draw = makeDraw();

      expect(historicInvitation(makeCareer(), makeSeason({ historicEvents: [draw] }), draw, availability, null))
        .toEqual({
          state: 'pending',
          invitations: '2026-06-14',
          chance: 40,
          discipline: Discipline.ROAD,
          rung: 4,
          team: null,
          car: null,
          mail: null,
          offer: null,
          answered: null,
          fee: null,
        });
    });

    it('keeps the chance the invitations were drawn on once they have gone out', () => {
      const missed = makeDraw({ invitation: { ...INVITED, outcome: 'uninvited' } });

      expect(historicInvitation(
        makeCareer({ date: '2026-06-20' }), makeSeason({ historicEvents: [missed] }), missed, availability, null,
      )).toMatchObject({
        state: 'uninvited', chance: 60, discipline: Discipline.ROAD, rung: 3, offer: null,
      });
    });

    it('gives no chance where no class of the event can field a car', () => {
      const draw = makeDraw();

      expect(historicInvitation(
        makeCareer(), makeSeason({ historicEvents: [draw] }), draw, makeAvailability(HISTORIC, { entries: [] }), null,
      )).toMatchObject({ chance: null, discipline: null, rung: null });
    });

    it('names the seat an invitation offers - its class, team and car', () => {
      const sent = makeDraw({ invitation: INVITED });
      const career = makeCareer({ date: '2026-06-20', inbox: [makeMail(sent)] });

      expect(historicInvitation(career, makeSeason({ historicEvents: [sent] }), sent, availability, null))
        .toMatchObject({
          state: 'awaiting',
          mail: invitationId(sent.raceId),
          team: 'Team Lotus',
          car: 'test_car',
          offer: {
            entry: 'main', entryName: 'Main', seat: 'seat-1', car: { model: 'test_car' },
          },
          answered: null,
        });
    });

    it('says the day an invitation was answered', () => {
      const sent = makeDraw({ invitation: INVITED });
      const career = makeCareer({
        date: '2026-06-20', inbox: [makeMail(sent, { reply: { answer: 'declined', on: '2026-06-18' } })],
      });

      expect(historicInvitation(career, makeSeason({ historicEvents: [sent] }), sent, availability, null))
        .toMatchObject({ state: 'declined', answered: '2026-06-18' });
    });

    it('reads the seat of an invitation accepted as the one offered', () => {
      const draw = makeDraw({ invitation: INVITED });
      const accepted = makeMail(draw, { reply: { answer: 'accepted', on: '2026-06-15' } });
      const held = makeHistoricEntry();

      expect(historicInvitation(
        makeCareer({ date: '2026-06-20', inbox: [accepted] }),
        makeSeason({ historicEvents: [draw], entries: [held] }),
        draw,
        availability,
        held,
      )).toMatchObject({
        state: 'accepted',
        team: 'Team Lotus',
        car: 'test_car',
        mail: accepted.id,
        answered: '2026-06-15',
        offer: {
          entry: 'main', seat: 'seat-1', car: { model: 'test_car' },
        },
      });
    });

    it('offers no seat to a player in it at their own cost', () => {
      const closed = makeDraw({ invitation: { on: '2026-06-14', outcome: 'entered' } });
      const held = makeHistoricEntry({ car: { model: 'test_car', source: 'owned' } });

      expect(historicInvitation(
        makeCareer({ date: '2026-06-20' }), makeSeason({ historicEvents: [closed], entries: [held] }), closed,
        availability, held,
      )).toMatchObject({
        state: 'entered', team: null, car: null, offer: null, chance: null,
      });
    });

    it('charges the fee of the class offered, else the class entered, else the first', () => {
      const event = { ...HISTORIC, entryFee: 300 };
      const draw = makeDraw({ championship: event, invitation: INVITED });
      const season = makeSeason({ historicEvents: [draw] });
      const offered = makeMail(draw, {
        invitation: {
          series: draw.series, raceId: draw.raceId, entry: 'pro', seat: 'seat-1', car: { model: 'test_car' },
        },
      });
      const held = makeHistoricEntry({ championship: event, entry: 'pro', car: { model: 'test_car', source: 'rented' } });

      expect(historicInvitation(makeCareer({ inbox: [offered] }), season, draw, availability, null).fee).toBe(900);
      expect(historicInvitation(makeCareer(), season, draw, availability, held).fee).toBe(900);
      expect(historicInvitation(makeCareer(), season, draw, availability, null).fee).toBe(300);
    });

    // Guards a fix: the declined invitation's seat and class fee were reported
    // over the class the player went on to pay their way into.
    it('says nothing of a declined seat once the player paid into another class', () => {
      const event = { ...HISTORIC, entryFee: 300 };
      const draw = makeDraw({ championship: event, invitation: INVITED });
      const declined = makeMail(draw, { reply: { answer: 'declined', on: '2026-06-15' } });
      const held = makeHistoricEntry({ championship: event, entry: 'pro', car: { model: 'test_car', source: 'rented' } });
      const season = makeSeason({ historicEvents: [draw], entries: [held] });

      expect(historicInvitation(makeCareer({ inbox: [declined] }), season, draw, availability, held)).toMatchObject({
        state: 'entered', team: null, car: null, offer: null, fee: 900,
      });
    });
  });

  describe('calendarInvitation', () => {
    it("narrows the page's invitation to what the calendar shows", () => {
      const sent = makeDraw({ invitation: INVITED });
      const career = makeCareer({ date: '2026-06-20', inbox: [makeMail(sent)] });
      const season = makeSeason({ historicEvents: [sent] });
      const availability = makeAvailability(HISTORIC);
      const {
        state, invitations, chance, team, car,
      } = historicInvitation(career, season, sent, availability, null);

      expect(calendarInvitation(career, season, sent, availability, null)).toEqual({
        state, invitations, chance, team, car,
      });
      expect(state).toBe('awaiting');
    });
  });

  describe('unansweredSkips', () => {
    const british = makeDraw({ invitation: INVITED });
    const italian = makeDraw({
      series: 'italian-gp-1967',
      championship: { ...HISTORIC, id: 'italian-gp-1967', name: 'Italian Grand Prix 1967' },
      raceId: 'italian-gp-1967/one@0.0',
      date: '2026-09-06',
      invitations: '2026-08-09',
      invitation: INVITED,
    });
    const season = makeSeason({ historicEvents: [british, italian] });
    const toPro = makeMail(british, {
      invitation: {
        series: british.series, raceId: british.raceId, entry: 'pro', seat: 'seat-1', car: { model: 'test_car' },
      },
    });
    const career = makeCareer({ date: '2026-06-20', inbox: [toPro, makeMail(italian)] });

    it('lists every invitation still to be answered whose event the move passes by, earliest first', () => {
      const lost = unansweredSkips(career, season, '2026-12-01');

      expect(lost.map((one) => one.series)).toEqual(['british-gp-1967', 'italian-gp-1967']);
      expect(lost[0]).toEqual({
        series: 'british-gp-1967',
        edition: 0,
        seriesName: 'British Grand Prix 1967',
        round: 'one',
        roundName: 'Round one',
        number: 1,
        ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
        date: '2026-07-12',
        reason: 'unanswered',
        historic: true,
        fine: null,
      });
    });

    it('loses nothing on the day itself, unless an event that day is lost too', () => {
      expect(unansweredSkips(career, season, '2026-07-12')).toEqual([]);
      expect(unansweredSkips(career, season, '2026-07-12', true).map((one) => one.series))
        .toEqual(['british-gp-1967']);
    });

    it('leaves out the event the move answers rather than passes', () => {
      expect(unansweredSkips(career, season, '2026-12-01', true, british.raceId).map((one) => one.series))
        .toEqual(['italian-gp-1967']);
    });

    it('leaves out an invitation answered, one never sent, and an event the player is in', () => {
      const pending = makeDraw({ series: 'monaco-gp-1961', raceId: 'monaco-gp-1961/one@0.0', date: '2026-08-02' });
      const answered = makeCareer({
        date: '2026-06-20',
        inbox: [makeMail(british, { reply: { answer: 'declined', on: '2026-06-18' } }), makeMail(italian)],
      });
      const entered = makeSeason({
        historicEvents: [british, italian, pending],
        entries: [makeHistoricEntry({
          series: 'italian-gp-1967', championship: italian.championship, car: { model: 'test_car', source: 'rented' },
        })],
      });

      expect(unansweredSkips(answered, entered, '2026-12-01')).toEqual([]);
    });
  });

  describe('withLapsed', () => {
    const round = (date: string) => skippedRound(makeChampionship(), 'main', 0, makeEvent('one', date), 'skipped');
    const lapsed = (date: string) => skippedRound(HISTORIC, 'main', 0, { round: 'one', date }, 'unanswered', true);

    it('keeps the rounds as they are when nothing lapses', () => {
      const rounds = [round('2026-03-01'), round('2026-05-03')];

      expect(withLapsed(rounds, [])).toEqual(rounds);
    });

    it('merges what lapses in among the rounds by date', () => {
      const merged = withLapsed([round('2026-03-01'), round('2026-09-06')], [lapsed('2026-07-12')]);

      expect(merged.map((one) => [one.date, one.reason])).toEqual([
        ['2026-03-01', 'skipped'],
        ['2026-07-12', 'unanswered'],
        ['2026-09-06', 'skipped'],
      ]);
    });

    it('lists a round lost ahead of an invitation lapsing on the same day', () => {
      expect(withLapsed([round('2026-07-12')], [lapsed('2026-07-12')]).map((one) => one.reason))
        .toEqual(['skipped', 'unanswered']);
    });
  });

  describe('composeCalendar', () => {
    it('draws a class the career entered from the season own copy of it', () => {
      const entered = makeChampionship({ name: 'Test Cup (as entered)' });
      const held = makeEntry({
        championship: entered, events: [makeEvent('one', '2026-03-01')],
      });
      const season = makeSeason({ entries: [held] });
      const library = [makeListing(makeChampionship({ name: 'Test Cup (edited since)' }))];

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        library,
        new Map([[held, makeAvailability(entered)]]), new Map(),
        false,
      );

      expect(calendar.events).toHaveLength(1);
      expect(calendar.events[0]).toMatchObject({
        seriesName: 'Test Cup (as entered)', date: '2026-03-01', enrolled: true,
      });
    });

    it('marks a historic event the season drew as historic', () => {
      const event = makeChampionship({ id: 'british-gp-1967', name: 'British Grand Prix 1967' });
      const held = makeEntry({
        series: 'british-gp-1967', championship: event, events: [makeEvent('one', '2026-03-01')], historic: true,
      });
      const season = makeSeason({ entries: [held], historicEvents: [makeDraw({ championship: event })] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [], new Map([[held, makeAvailability(event)]]), new Map(), false,
      );

      expect(calendar.events.map((one) => [one.series, one.historic])).toEqual([['british-gp-1967', true]]);
    });

    it('draws a class the career did not enter from the library', () => {
      const season = makeSeason();
      const other = makeChampionship({ id: 'other-cup', name: 'Other Cup' });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [makeListing(other)], new Map(), new Map(), false,
      );

      expect(calendar.events).toHaveLength(2);
      expect(calendar.events.every((event) => !event.enrolled)).toBe(true);
      expect(calendar.events.map((event) => event.round)).toEqual(['one', 'two']);
    });

    it('lists the other class of a championship the career is already in', () => {
      const series = makeChampionship({
        entries: [makeClassEntry(), makeClassEntry({ id: 'second', name: 'Second' })],
        rounds: [makeRound('one')],
      });
      const held = makeEntry({ championship: series, events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [makeListing(series)],
        new Map([[held, makeAvailability(series)]]), new Map(),
        false,
      );

      expect(calendar.events.map((event) => [event.entry, event.enrolled]))
        .toEqual(expect.arrayContaining([['main', true], ['second', false]]));
      expect(calendar.events.filter((event) => event.entry === 'main')).toHaveLength(1);
    });

    it('reports the season it drew and the day the clock stands at', () => {
      const season = makeSeason({ index: 2 });
      const career = makeCareer({ date: '2026-06-07', seasons: [season] });

      expect(composeCalendar(career, season, [], new Map(), new Map(), false)).toMatchObject({
        season: 2, from: '2026-01-01', to: '2026-12-31', date: '2026-06-07', events: [],
      });
    });

    it('orders events by day, then by championship name', () => {
      const zebra = makeEntry({
        series: 'zebra-cup',
        championship: makeChampionship({ id: 'zebra-cup', name: 'Zebra Cup' }),
        events: [makeEvent('one', '2026-05-03')],
      });
      const alpha = makeEntry({
        series: 'alpha-cup',
        championship: makeChampionship({ id: 'alpha-cup', name: 'Alpha Cup' }),
        events: [makeEvent('one', '2026-05-03'), makeEvent('two', '2026-02-01')],
      });
      const season = makeSeason({ entries: [zebra, alpha] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [zebra, makeAvailability(zebra.championship)],
          [alpha, makeAvailability(alpha.championship)],
        ]), new Map(),
        false,
      );

      expect(calendar.events.map((event) => [event.date, event.seriesName])).toEqual([
        ['2026-02-01', 'Alpha Cup'],
        ['2026-05-03', 'Alpha Cup'],
        ['2026-05-03', 'Zebra Cup'],
      ]);
    });

    it('marks enrolled events on the same day as another', () => {
      const first = makeEntry({
        events: [makeEvent('one', '2026-06-07'), makeEvent('two', '2026-07-05')],
      });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]), new Map(),
        false,
      );

      expect(calendar.events.map((event) => [event.series, event.round, event.clash])).toEqual([
        ['other-cup', 'one', true],
        ['test-cup', 'one', true],
        ['test-cup', 'two', false],
      ]);
    });

    // Once one of the two was given up there is nothing left to choose.
    it('does not mark a pair one of which was given up', () => {
      const first = makeEntry({ events: [makeEvent('one', '2026-06-07', { status: 'raced' })] });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07', { status: 'missed' })],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]), new Map(),
        false,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    it('marks nothing while two events on one day are allowed', () => {
      const first = makeEntry({ events: [makeEvent('one', '2026-06-07')] });
      const second = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
      });
      const season = makeSeason({ entries: [first, second] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [first, makeAvailability(first.championship)],
          [second, makeAvailability(second.championship)],
        ]), new Map(),
        true,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    // A season the career pulled out of is not one it can be double-booked
    // against, however its events fall.
    it('does not clash an event against a championship the career left', () => {
      const kept = makeEntry({ events: [makeEvent('one', '2026-06-07')] });
      const left = makeEntry({
        series: 'other-cup',
        championship: makeChampionship({ id: 'other-cup', name: 'Other Cup' }),
        events: [makeEvent('one', '2026-06-07')],
        withdrawn: true,
      });
      const season = makeSeason({ entries: [kept, left] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([
          [kept, makeAvailability(kept.championship)],
          [left, makeAvailability(left.championship)],
        ]), new Map(),
        false,
      );

      expect(calendar.events.every((event) => !event.clash)).toBe(true);
    });

    it('leaves out an entry whose class the championship copy no longer holds', () => {
      const held = makeEntry({ entry: 'gone', events: [makeEvent('one', '2026-03-01')] });
      const season = makeSeason({ entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [],
        new Map([[held, makeAvailability(held.championship)]]), new Map(),
        false,
      );

      expect(calendar.events).toEqual([]);
    });

    it('lists every edition of a championship that runs more than once a year', () => {
      const season = makeSeason();
      const quarterly = makeChampionship({ id: 'quarterly', seasonLength: SeasonLength.QUARTER });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [makeListing(quarterly)], new Map(), new Map(), false,
      );

      expect(calendar.events.map((event) => event.edition)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    });

    it('leaves the other editions of a class the career entered on offer', () => {
      const quarterly = makeChampionship({ seasonLength: SeasonLength.QUARTER, rounds: [makeRound('one')] });
      const held = makeEntry({ championship: quarterly, events: [makeEvent('one', '2026-01-04')] });
      const season = makeSeason({ entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }),
        season,
        [makeListing(quarterly)],
        new Map([[held, makeAvailability(quarterly)]]), new Map(),
        false,
      );

      expect(calendar.events.map((event) => [event.edition, event.enrolled]))
        .toEqual([[0, true], [1, false], [2, false], [3, false]]);
    });

    it('charges each class of a library championship its own fee', () => {
      const series = makeChampionship({
        entryFee: 200,
        rounds: [makeRound('one')],
        entries: [makeClassEntry(), makeClassEntry({ id: 'second', name: 'Second', entryFee: 900 })],
      });
      const season = makeSeason();

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [makeListing(series)], new Map(), new Map(), false,
      );

      expect(calendar.events.map((event) => [event.entry, event.entryFee]))
        .toEqual(expect.arrayContaining([['main', 200], ['second', 900]]));
    });

    it('puts a historic event drawn and not entered on the calendar for anyone to enter, through its first class', () => {
      const draw = makeDraw({ championship: { ...HISTORIC, entryFee: 300 } });
      const season = makeSeason({ historicEvents: [draw] });

      const calendar = composeCalendar(
        makeCareer({ seasons: [season] }), season, [], new Map(),
        new Map([[draw, makeAvailability(draw.championship)]]), false,
      );

      expect(calendar.events).toHaveLength(1);
      expect(calendar.events[0]).toMatchObject({
        series: 'british-gp-1967',
        edition: 0,
        entry: 'main',
        date: '2026-07-12',
        status: 'scheduled',
        entryFee: 300,
        enrolled: false,
        eligible: true,
        historic: true,
        clash: false,
        invitation: { state: 'pending', chance: 40 },
      });
    });

    it('shows a drawn event through the class its invitation offers', () => {
      const draw = makeDraw({ invitation: INVITED });
      const season = makeSeason({ historicEvents: [draw] });
      const mail = makeMail(draw, {
        invitation: {
          series: draw.series, raceId: draw.raceId, entry: 'pro', seat: 'seat-1', car: { model: 'test_car' },
        },
      });

      const calendar = composeCalendar(
        makeCareer({ date: '2026-06-20', seasons: [season], inbox: [mail] }), season, [], new Map(),
        new Map([[draw, makeAvailability(HISTORIC)]]), false,
      );

      expect(calendar.events.map((event) => [event.entry, event.entryFee, event.invitation?.state]))
        .toEqual([['pro', 900, 'awaiting']]);
    });

    it('lists a drawn event the player is in once, as their own', () => {
      const draw = makeDraw({ invitation: INVITED });
      const held = makeHistoricEntry();
      const season = makeSeason({ historicEvents: [draw], entries: [held] });

      const calendar = composeCalendar(
        makeCareer({ date: '2026-06-20', seasons: [season] }), season, [],
        new Map([[held, makeAvailability(HISTORIC)]]), new Map([[draw, makeAvailability(HISTORIC)]]), false,
      );

      expect(calendar.events.map((event) => [event.series, event.enrolled, event.invitation?.state]))
        .toEqual([['british-gp-1967', true, 'accepted']]);
    });

    it('passes a drawn event by once its day is behind the clock', () => {
      const draw = makeDraw();
      const season = makeSeason({ historicEvents: [draw] });

      const calendar = composeCalendar(
        makeCareer({ date: '2026-07-13', seasons: [season] }), season, [], new Map(),
        new Map([[draw, makeAvailability(HISTORIC)]]), false,
      );

      expect(calendar.events[0].status).toBe('missed');
    });

    it('leaves off a drawn event the install says nothing of', () => {
      const season = makeSeason({ historicEvents: [makeDraw()] });

      expect(composeCalendar(makeCareer({ seasons: [season] }), season, [], new Map(), new Map(), false).events)
        .toEqual([]);
    });
  });

  describe('simulatedEvent', () => {
    const missed = makeEvent('one', '2026-03-01', { status: 'missed' });

    it('races a round behind the clock and pays it', () => {
      const event = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(event.simulated).toBe(true);
      expect(event.sessions).toHaveLength(3);
      expect(event.score?.races[0].places.map((place) => place.seat).sort()).toEqual(['seat-1', 'seat-2']);
    });

    // Nobody is the player in a championship the career is not in, so no seat
    // is raced by a stand-in.
    it('marks no place as a substitute\'s', () => {
      const event = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(event.score?.races.flatMap((race) => race.places).some((place) => place.substitute)).toBe(false);
    });

    it('comes out the same every time it is asked', () => {
      const once = simulatedEvent(makeChampionship(), missed, 'salt');
      const again = simulatedEvent(makeChampionship(), missed, 'salt');

      expect(again.sessions.map((one) => one.classification)).toEqual(once.sessions.map((one) => one.classification));
    });

    it('leaves a round still to come as it is', () => {
      const scheduled = makeEvent('one', '2026-03-01');

      expect(simulatedEvent(makeChampionship(), scheduled, 'salt')).toBe(scheduled);
    });

    it('leaves a round it cannot simulate as a plain non-start', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const unknown = makeEvent('bygone', '2026-03-01', { status: 'missed' });

      expect(simulatedEvent(makeChampionship(), unknown, 'salt')).toBe(unknown);
    });
  });

  describe('strengthStep', () => {
    it('adds the step for the round to the step for the season', () => {
      const entry = makeEntry({ strength: -2 });

      expect(strengthStep({ entry, event: makeEvent('one', '2026-03-01', { strength: 3 }) })).toBe(1);
    });

    it('takes either step alone where the other is none', () => {
      expect(strengthStep({ entry: makeEntry({ strength: -2 }), event: makeEvent('one', '2026-03-01') })).toBe(-2);
      expect(strengthStep({ entry: makeEntry(), event: makeEvent('one', '2026-03-01', { strength: 4 }) })).toBe(4);
    });

    it('is no step at all where neither says one', () => {
      expect(strengthStep({ entry: makeEntry(), event: makeEvent('one', '2026-03-01') })).toBe(0);
    });
  });

  describe('eventStrength', () => {
    it('says every layer the round races over, with the steps of the player last', () => {
      const championship = makeChampionship({
        grid: { strength: 4 },
        entries: [
          makeClassEntry({ grid: { strength: -1 } }),
          makeClassEntry({ id: 'second', name: 'Second', grid: { strength: 2 } }),
        ],
        rounds: [makeRound('one', { grid: { strength: 1 } }), makeRound('two')],
      });
      const entry = makeEntry({ championship, strength: -2 });
      const event = makeEvent('one', '2026-03-01', { strength: 3 });

      expect(eventStrength({ entry, event }, true)).toEqual({
        championship: 4,
        classes: [
          { entry: 'main', name: 'Main', offset: -1 },
          { entry: 'second', name: 'Second', offset: 2 },
        ],
        round: 1,
        season: -2,
        step: 3,
        editable: true,
      });
    });

    it('says nothing where a layer states nothing', () => {
      const strength = eventStrength({ entry: makeEntry(), event: makeEvent('two', '2026-05-03') }, false);

      expect(strength).toMatchObject({
        championship: 0, round: 0, season: 0, step: 0, editable: false,
      });
      expect(strength.classes).toEqual([{ entry: 'main', name: 'Main', offset: 0 }]);
    });
  });

  describe('archivesOf', () => {
    it("names every archive the career's launches wrote, by file name", () => {
      const career = makeCareer({
        seasons: [makeSeason({
          entries: [makeEntry({
            events: [
              makeEvent('one', '2026-03-01', {
                sessions: [
                  { ...makeRecord(0), archive: 'D:\\careers\\one\\results\\2026-03-01T10-00-00.json' },
                  { ...makeRecord(1), archive: 'results/2026-03-01T11-00-00.json' },
                ],
              }),
              makeEvent('two', '2026-04-01', { sessions: [makeRecord(0)] }),
            ],
          })],
        })],
      });

      expect([...archivesOf(career)].sort()).toEqual(['0.json', '2026-03-01T10-00-00.json', '2026-03-01T11-00-00.json']);
    });

    it('passes over a launch that archived nothing, as a skipped one does', () => {
      const career = makeCareer({
        seasons: [makeSeason({
          entries: [makeEntry({ events: [makeEvent('one', '2026-03-01', { sessions: [{ ...makeRecord(0), archive: '' }] })] })],
        })],
      });

      expect(archivesOf(career).size).toBe(0);
    });
  });
  describe('keptInBackup', () => {
    it("keeps a career's two files, its saves and its archived results", () => {
      ['career.json', 'state.json', 'saves/quicksave.json', 'saves/autosave-2.json',
        'saves/00000000-0000-4000-8000-000000000009.json', 'results/2027-03-01T10-00-00.json']
        .forEach((name) => expect(keptInBackup(name)).toBe(true));
    });

    it('leaves out anything else, and anything that would land outside its folder', () => {
      ['backup.json', 'career.json.tmp', 'saves/notes.txt', 'saves/hand-named.json', 'results/.hidden.json',
        'results/hand-copied.json', 'results/nested/one.json', 'other/one.json', '../career.json', 'saves/../../career.json', 'saves', 'saves/']
        .forEach((name) => expect(keptInBackup(name)).toBe(false));
    });
  });

  describe('readBackup', () => {
    const career = wholeCareer();

    /**
     * One file of a backup, holding JSON.
     * @param name Its path in the backup
     * @param value What it holds
     * @returns The entry
     */
    const entry = (name: string, value: unknown) => ({ name, data: Buffer.from(JSON.stringify(value)) });

    /**
     * A save's file holding the career's state, taken at a given moment.
     * @param savedAt When it was taken
     * @param date Where the clock stood
     * @returns What the save's file holds
     */
    const save = (savedAt: string, date: string) => ({
      version: 1, savedAt, date, name: null, state: stateOf({ ...career, date }),
    });

    it('reads the profile, the state and how many saves and results it holds', () => {
      const read = readBackup([
        entry('backup.json', { version: 1, kind: 'career', backedUpAt: '2027-06-14T21:40:00.000Z' }),
        entry('career.json', profileOf(career)),
        entry('state.json', stateOf(career)),
        entry('saves/quicksave.json', save('2027-01-02T00:00:00.000Z', '2027-01-02')),
        entry('results/2027-03-07T10-00-00.json', {}),
        entry('results/2027-04-04T10-00-00.json', {}),
        entry('stray.txt', 'nothing'),
      ]);

      expect(read).toMatchObject({
        profile: profileOf(career),
        state: stateOf(career),
        backedUpAt: '2027-06-14T21:40:00.000Z',
        saves: 1,
        results: 2,
      });
      expect(read?.files.map((one) => one.name))
        .toEqual([
          'career.json', 'state.json', 'saves/quicksave.json',
          'results/2027-03-07T10-00-00.json', 'results/2027-04-04T10-00-00.json',
        ]);
    });

    it("carries on from its newest save that reads when its state.json does not, as a career's folder is read", () => {
      const read = readBackup([
        entry('career.json', profileOf(career)),
        entry('state.json', { version: 2 }),
        entry('saves/autosave-1.json', save('2027-01-02T00:00:00.000Z', '2027-01-02')),
        entry('saves/autosave-2.json', save('2027-03-02T00:00:00.000Z', '2027-03-02')),
        entry('saves/quicksave.json', { version: 1 }),
      ]);

      expect(read?.state.date).toBe('2027-03-02');
      expect(read?.saves).toBe(2);
    });

    it('says nothing of when it was backed up when the backup does not', () => {
      expect(readBackup([entry('career.json', profileOf(career)), entry('state.json', stateOf(career))])?.backedUpAt)
        .toBeNull();
    });

    it('refuses a backup with no profile that reads, or nothing of its state', () => {
      expect(readBackup([entry('state.json', stateOf(career))])).toBeNull();
      expect(readBackup([entry('career.json', { version: 2 }), entry('state.json', stateOf(career))])).toBeNull();
      expect(readBackup([entry('career.json', profileOf(career))])).toBeNull();
      expect(readBackup([{ name: 'career.json', data: Buffer.from('{ not json') }])).toBeNull();
    });
  });

  describe('backupName', () => {
    const summary = summarise(makeCareer({
      date: '2028-06-14', driver: { name: 'Eterry', nation: 'GBR' }, seasons: [makeSeason({ entries: [makeEntry()] })],
    }));

    it("names a backup after its driver and the day the career's clock stands at", () => {
      expect(backupName(summary)).toBe('eterry-career-2028-06-14.zip');
    });

    it('keeps letters of any script and runs everything else together into one hyphen', () => {
      expect(backupName({ ...summary, driver: { name: " Оксана  O'Brien / Мельник! ", nation: null } }))
        .toBe('оксана-o-brien-мельник-career-2028-06-14.zip');
    });

    it('leaves the driver out of a name with nothing in it a file name could keep', () => {
      expect(backupName({ ...summary, driver: { name: '?!', nation: null } })).toBe('career-2028-06-14.zip');
    });

    it("names a standalone championship's backup after its championship and its year", () => {
      expect(backupName({ ...summary, kind: 'championship', year: 2028 })).toBe('test-cup-2028.zip');
    });

    it("falls back to a word when the championship's name holds nothing a file name could keep", () => {
      const championships = [{ ...summary.championships[0], name: '?!' }];

      expect(backupName({
        ...summary, kind: 'championship', year: 2028, championships,
      })).toBe('championship-2028.zip');
    });
  });

  describe('sendSponsorOffers', () => {
    it('offers a sponsor for a round the player drove, open a month from its day', () => {
      const sent = sendSponsorOffers(inForm());

      expect(sent.inbox).toEqual([expect.objectContaining({
        id: sponsorMailId('test-cup/one'),
        kind: 'sponsor',
        season: 0,
        arrived: '2026-03-01',
        opened: false,
        deadline: addDays('2026-03-01', OFFER_DAYS),
        // Free, and in form, so the main sponsor's slot.
        sponsor: expect.objectContaining({ slot: 'main' }),
      })]);
      expect(sent.inbox[0].sponsor?.replaces).toBeUndefined();
      expect(sent.seasons[0].sponsorDraws).toEqual(['test-cup/one']);
    });

    it('draws each round once, whatever came of it', () => {
      const once = sendSponsorOffers(inForm());

      expect(sendSponsorOffers(once)).toBe(once);
    });

    it('draws nothing for a round the player did not drive, nor one still to race', () => {
      const career = inForm('2026-03-08', {
        seasons: [makeSeason({
          entries: [makeEntry({
            events: [racedRound('one', '2026-03-01', true, true), makeEvent('two', '2026-03-08')],
            standings: LEADING,
          })],
        })],
      });

      expect(sendSponsorOffers(career)).toBe(career);
    });

    it('marks a round too long ago for its offer still to be open as drawn, sending nothing', () => {
      const sent = sendSponsorOffers(inForm(addDays('2026-03-01', OFFER_DAYS + 1)));

      expect(sent.inbox).toEqual([]);
      expect(sent.seasons[0].sponsorDraws).toEqual(['test-cup/one']);
    });

    it('sends nothing outside a career', () => {
      const career = inForm('2026-03-01', { kind: 'championship' });

      expect(sendSponsorOffers(career)).toBe(career);
    });

    it('offers to replace the deal of its slot whose year runs out first, every slot being filled', () => {
      const dates = Array.from({ length: 10 }, (unused, at) => addDays('2026-03-01', at));
      const main = makeDeal({ id: 'main', sponsor: { name: 'Vantor Tyres', trade: 'tyres', nation: 'DEU' } });
      const late = makeDeal({
        id: 'late', slot: 'partner', until: '2027-02-01', sponsor: { name: 'Lumen Data', trade: 'tech', nation: 'USA' },
      });
      const early = makeDeal({
        id: 'early', slot: 'partner', until: '2026-12-01', sponsor: { name: 'Alder Springs', trade: 'drinks', nation: 'CAN' },
      });
      const career = makeCareer({
        date: dates[dates.length - 1],
        ratingLog: dates.map(promotion),
        sponsors: [main, late, early],
        seasons: [makeSeason({
          entries: [makeEntry({ events: dates.map((date, at) => racedRound(`r${at}`, date)), standings: LEADING })],
        })],
      });
      const offers = sendSponsorOffers(career).inbox.map((mail) => mail.sponsor);

      expect(offers.length).toBeGreaterThan(0);
      for (const offer of offers) {
        expect(offer?.replaces).toBe(offer?.slot === 'main' ? 'main' : 'early');
      }
    });
  });

  describe('isListed', () => {
    const series = makeChampionship();
    const shown = { ...DEFAULT_SETTINGS };

    it('lists a championship the install can race and nothing hides', () => {
      expect(isListed(makeListing(series), shown)).toBe(true);
    });

    it('leaves out one that cannot be raced, is switched off, or is a filler hidden', () => {
      expect(isListed(makeListing(series, { availability: makeAvailability(series, { available: false }) }), shown))
        .toBe(false);
      expect(isListed(makeListing(series), { ...shown, seriesActive: { [series.id]: false } })).toBe(false);
      expect(isListed(makeListing(series, { filler: true }), { ...shown, showFillerSeries: false })).toBe(false);
    });
  });

  describe('classCars', () => {
    it("lists what a class may field off its championship's opener", () => {
      const series = makeChampionship();

      expect(classCars(makeListing(series), series.entries[0])).toEqual(['test_car']);
    });
  });

  describe('wantsRewards', () => {
    it('wants them for a round whose sponsor draw is still to make', () => {
      expect(wantsRewards(inForm())).toBe(true);
      expect(wantsRewards(sendSponsorOffers(inForm()))).toBe(false);
    });

    it("wants them for a deal whose year has run out, and not for one's still running", () => {
      const seasons = [makeSeason()];

      expect(wantsRewards(makeCareer({ seasons, date: '2027-01-04', sponsors: [makeDeal()] }))).toBe(true);
      expect(wantsRewards(makeCareer({ seasons, date: '2026-06-01', sponsors: [makeDeal()] }))).toBe(false);
    });

    it('wants nothing outside a career', () => {
      expect(wantsRewards(inForm('2026-03-01', { kind: 'championship' }))).toBe(false);
    });
  });

  describe('goalsDue', () => {
    /**
     * A career that raced in March, holding the deal.
     * @param deal The deal
     * @param over Whatever the test wants said differently
     * @returns The career
     */
    const holding = (deal: SponsorDeal, over: Partial<Career> = {}): Career => inForm('2026-03-02', { sponsors: [deal], ...over });

    it('lists a live deal whose goal has just been settled', () => {
      const deal = makeDeal();

      expect(goalsDue(holding(deal))).toEqual([deal]);
    });

    it('leaves out a goal already marked, one short of it, and a deal ended', () => {
      expect(goalsDue(holding(makeDeal({ goalMet: '2026-03-01' })))).toEqual([]);
      expect(goalsDue(holding(makeDeal({ goal: { kind: 'racesStarted', count: 5 } })))).toEqual([]);
      expect(goalsDue(holding(makeDeal({ ended: { on: '2026-06-01', why: 'mine' } })))).toEqual([]);
    });

    it('lists nothing outside a career', () => {
      expect(goalsDue(holding(makeDeal(), { kind: 'championship' }))).toEqual([]);
    });
  });

  describe('withGoalMet', () => {
    const car = {
      model: 'prize_car', name: 'Prize Car', price: 100_000, skin: 'red',
    };
    const deal = makeDeal({ perks: [{ kind: 'carReward', car }, { kind: 'goalBonus', amount: 5000 }] });

    /**
     * A career that raced in March, holding the deal.
     * @param over Whatever the test wants said differently
     * @returns The career
     */
    const holding = (over: Partial<Career> = {}): Career => inForm('2026-03-02', { sponsors: [deal], ...over });

    it('marks the day the goal is met', () => {
      expect(withGoalMet(holding(), deal, 'red').sponsors[0].goalMet).toBe('2026-03-02');
    });

    it('dates a goal found met after the year ran out on the anniversary', () => {
      const met = withGoalMet(holding({ date: '2027-02-01' }), deal, 'red');

      expect(met.sponsors[0].goalMet).toBe('2027-01-04');
      expect(met.garage[0].bought).toBe('2027-01-04');
    });

    it("puts the car in the garage at three goal bonuses, saying whose it was", () => {
      expect(withGoalMet(holding(), deal, 'red').garage).toEqual([{
        model: 'prize_car', skin: 'red', paid: 15_000, listed: 100_000, bought: '2026-03-02', reward: 'Halden Lubricants',
      }]);
    });

    it('takes a car with no liveries as it comes', () => {
      expect(withGoalMet(holding(), deal, undefined).garage[0]).not.toHaveProperty('skin');
    });

    it('races the car owned wherever it is rented', () => {
      const rented = makeEntry({
        car: { model: 'prize_car', source: 'rented' }, events: [makeEvent('two', '2026-06-01')],
      });
      const met = withGoalMet(holding({ seasons: [makeSeason({ entries: [rented] })] }), deal, 'red');

      expect(met.seasons[0].entries[0].car).toEqual({ model: 'prize_car', skin: 'red', source: 'owned' });
    });

    it('sends news of the car and the bonus', () => {
      expect(withGoalMet(holding(), deal, 'red').inbox).toEqual([expect.objectContaining({
        id: goalNewsId(deal.id),
        kind: 'sponsorNews',
        arrived: '2026-03-02',
        opened: false,
        sponsorNews: expect.objectContaining({
          kind: 'goalMet', deal: deal.id, reached: 1, bonus: 5000, car,
        }),
      })]);
    });

    it('pays what the car would sell for when the install has no such car', () => {
      const met = withGoalMet(holding(), deal, null);

      expect(met.garage).toEqual([]);
      expect(met.money).toBe(115_000);
      expect(met.ledger).toEqual([expect.objectContaining({
        key: `sponsor:${deal.id}:reward`, kind: 'sponsorBonus', amount: 15_000,
      })]);
      expect(met.inbox[0].sponsorNews).toMatchObject({ car, carPaid: 15_000 });
    });

    it('pays what the car would sell for when the career already owns one', () => {
      const garage = [{
        model: 'prize_car', paid: 1, listed: 1, bought: '2026-01-04',
      }];
      const met = withGoalMet(holding({ garage }), deal, 'red');

      expect(met.garage).toEqual(garage);
      expect(met.inbox[0].sponsorNews?.carPaid).toBe(15_000);
    });

    it('sends no news of a goal that brought nothing, a partner keeping its renewal alone', () => {
      const partner = makeDeal({ slot: 'partner' });
      const met = withGoalMet(holding({ sponsors: [partner] }), partner, null);

      expect(met.inbox).toEqual([]);
      expect(met.sponsors[0].goalMet).toBe('2026-03-02');
    });
  });

  describe('sendClimbNews', () => {
    const climbing = makeDeal({
      perks: [{ kind: 'climbs' }, { kind: 'racePay', amount: 600 }, { kind: 'signing', amount: 3000 }],
    });
    const rungs = (rung: number): Career['level'] => ({
      [Discipline.SINGLE_SEATER]: rung,
      [Discipline.SPORTSCAR]: rung,
      [Discipline.TOURING]: rung,
      [Discipline.ROAD]: rung,
    });

    /**
     * A career holding the deal, on a rung.
     * @param rung The rung
     * @param over Whatever the test wants said differently
     * @returns The career
     */
    const onRung = (rung: number, over: Partial<Career> = {}): Career => makeCareer({
      date: '2026-06-01', seasons: [makeSeason()], level: rungs(rung), sponsors: [climbing], ...over,
    });

    it('says a deal has climbed to a new rung, each figure beside what it paid', () => {
      expect(sendClimbNews(onRung(3)).inbox).toEqual([expect.objectContaining({
        id: climbNewsId(climbing.id, 3),
        kind: 'sponsorNews',
        arrived: '2026-06-01',
        opened: false,
        sponsorNews: expect.objectContaining({
          kind: 'climbed', rung: 3, rises: [{ kind: 'racePay', amount: 1000, was: 600 }],
        }),
      })]);
    });

    // Guards a fix: a signing bonus was listed as rising, though it is paid once.
    it('leaves a signing bonus out, which has already been paid', () => {
      const rises = sendClimbNews(onRung(3)).inbox[0].sponsorNews?.rises ?? [];

      expect(rises.map((rise) => rise.kind)).toEqual(['racePay']);
    });

    // Guards a fix: every climb said what the deal was drawn at, not what it
    // had last paid.
    it('says what a second climb paid on the rung before', () => {
      const first = sendClimbNews(onRung(3));
      const second = sendClimbNews({ ...first, level: rungs(2) });

      expect(second.inbox[1].sponsorNews?.rises).toEqual([{ kind: 'racePay', amount: 2000, was: 1000 }]);
    });

    it('says each rung once', () => {
      const sent = sendClimbNews(onRung(3));

      expect(sendClimbNews(sent)).toBe(sent);
    });

    // Guards a fix: it read the career's best, so a deal covering a discipline
    // below it "climbed" the day it was signed and never said so again.
    it('reads a deal covering a discipline on that rung alone', () => {
      const road = { ...climbing, covers: Discipline.ROAD };
      const best = onRung(4, { sponsors: [road], level: { ...rungs(4), [Discipline.TOURING]: 1 } });
      const raised = { ...best, level: { ...best.level, [Discipline.ROAD]: 3 } };

      expect(sendClimbNews(best)).toBe(best);
      expect(sendClimbNews(raised).inbox[0].id).toBe(climbNewsId(road.id, 3));
    });

    it('says nothing of a deal that does not climb, one on its own rung, or outside a career', () => {
      const still = onRung(3, { sponsors: [makeDeal()] });
      const level = onRung(4);
      const standalone = onRung(3, { kind: 'championship' });

      expect(sendClimbNews(still)).toBe(still);
      expect(sendClimbNews(level)).toBe(level);
      expect(sendClimbNews(standalone)).toBe(standalone);
    });
  });

  describe('endSponsorYears', () => {
    /**
     * A career on a deal's anniversary, a race of it driven in March.
     * @param deal The deal
     * @returns The career
     */
    const anniversary = (deal: SponsorDeal): Career => makeCareer({
      date: deal.until,
      sponsors: [deal],
      seasons: [makeSeason({ entries: [makeEntry({ events: [racedRound('one', '2026-03-01')] })] })],
    });

    it('ends a deal on its anniversary with its goal met, its sponsor asking for another year', () => {
      const ended = endSponsorYears(anniversary(makeDeal({ goalMet: '2026-03-01' })));

      expect(ended.sponsors[0].ended).toEqual({ on: '2027-01-04', why: 'goalMet' });
      expect(ended.inbox).toEqual([expect.objectContaining({
        kind: 'sponsor', arrived: '2027-01-04', deadline: '2027-02-03', sponsor: expect.objectContaining({ renews: ended.sponsors[0].id }),
      })]);
    });

    it('asks for another year with the cars a reward may name, its figures read off the career now', () => {
      const old = {
        model: 'old_car', name: 'Old Car', price: 30_000,
      };
      const deal = makeDeal({ goalMet: '2026-03-01', perks: [{ kind: 'carReward', car: old }] });
      const rewards = [{
        model: 'new_car', name: 'New Car', price: 60_000, discipline: Discipline.ROAD, tier: 4,
      }];
      const ended = endSponsorYears(anniversary(deal), rewards);

      expect(ended.inbox[0]).toMatchObject({
        id: sponsorRenewalId(deal.id),
        sponsor: {
          renews: deal.id,
          perks: [{
            kind: 'carReward',
            car: {
              model: 'new_car', name: 'New Car', price: 60_000,
            },
            wasCar: 'Old Car',
          }],
        },
      });
    });

    it('pays a goal bonus for a goal marked met as the deal ends', () => {
      const deal = makeDeal({ goalMet: '2026-03-01', perks: [{ kind: 'goalBonus', amount: 5000 }] });

      expect(endSponsorYears(anniversary(deal)).ledger).toContainEqual(expect.objectContaining({
        key: `sponsor:${deal.id}:goal`, amount: 5000, date: '2026-03-01',
      }));
    });

    // The paid career used to be worked out for the news alone and thrown away.
    it('pays the career up as it ends a deal', () => {
      const ended = endSponsorYears(anniversary(makeDeal()));

      expect(ended.ledger).toContainEqual(expect.objectContaining({
        key: 'sponsor:sponsor:test-cup/zero:pay:test-cup/one:2', kind: 'sponsor', amount: 500,
      }));
      expect(ended.money).toBe(100_500);
    });

    it('ends a deal with its goal missed, and sends news of what it paid and how far the goal got', () => {
      const deal = makeDeal({ goal: { kind: 'racesStarted', count: 5 } });
      const ended = endSponsorYears(anniversary(deal));

      expect(ended.sponsors[0].ended).toEqual({ on: '2027-01-04', why: 'goalMissed' });
      expect(ended.inbox).toEqual([{
        id: sponsorNewsId(deal.id),
        kind: 'sponsorNews',
        season: 0,
        arrived: '2027-01-04',
        opened: false,
        sponsorNews: {
          deal: deal.id, sponsor: deal.sponsor, slot: 'main', goal: deal.goal, reached: 1, paid: 500,
        },
      }]);
    });

    it('leaves a career alone while no deal has reached its anniversary', () => {
      const career = { ...anniversary(makeDeal()), date: '2027-01-03' };

      expect(endSponsorYears(career)).toBe(career);
    });

    it('leaves a deal already ended alone', () => {
      const career = anniversary(makeDeal({ ended: { on: '2026-06-01', why: 'mine' } }));

      expect(endSponsorYears(career)).toBe(career);
    });
  });

  describe('endSponsor', () => {
    const signing = makeDeal({ perks: [{ kind: 'racePay', amount: 500 }, { kind: 'signing', amount: 3650 }] });

    it("repays the share of the signing bonus the deal's year has left", () => {
      // 183 of its 365 days are left.
      const ended = endSponsor(makeCareer({ date: '2026-07-05', sponsors: [signing] }), signing, 'mine');

      expect(ended.ledger).toEqual([expect.objectContaining({
        key: 'sponsor:sponsor:test-cup/zero:repay', kind: 'sponsor', amount: -1830, date: '2026-07-05',
      })]);
      expect(ended.money).toBe(98_170);
      expect(ended.sponsors[0].ended).toEqual({ on: '2026-07-05', why: 'mine' });
    });

    it('ends a deal with no signing bonus for nothing, saying why it ended', () => {
      const deal = makeDeal();
      const ended = endSponsor(makeCareer({ date: '2026-07-05', sponsors: [deal] }), deal, 'replaced');

      expect(ended.ledger).toEqual([]);
      expect(ended.money).toBe(100_000);
      expect(ended.sponsors[0].ended).toEqual({ on: '2026-07-05', why: 'replaced' });
    });
  });

  describe('signSponsor', () => {
    const offer = makeSponsorOffer({ perks: [{ kind: 'racePay', amount: 500 }, { kind: 'signing', amount: 2000 }] });

    /**
     * A career on 10 March holding the offer's mail.
     * @param over Whatever the test wants said differently
     * @returns The career
     */
    const offered = (over: Partial<Career> = {}): Career => makeCareer({
      date: '2026-03-10', seasons: [makeSeason()], inbox: [makeSponsorMail(offer)], ...over,
    });

    it('signs a deal for a year from today, pays its signing bonus and accepts the mail', () => {
      const career = offered();
      const signed = signSponsor(career, career.inbox[0]);

      expect(signed.sponsors).toEqual([{
        ...offer, id: sponsorMailId('test-cup/one'), signed: '2026-03-10', until: '2027-03-10',
      }]);
      expect(signed.ledger).toEqual([expect.objectContaining({
        key: 'sponsor:sponsor:test-cup/one:signing', kind: 'sponsor', amount: 2000, date: '2026-03-10',
      })]);
      expect(signed.money).toBe(102_000);
      expect(signed.inbox[0]).toMatchObject({ opened: true, reply: { answer: 'accepted', on: '2026-03-10' } });
    });

    it('keeps what a renewal renews on the deal it signs', () => {
      const career = offered({ inbox: [makeSponsorMail({ ...offer, renews: 'old-deal' })] });

      expect(signSponsor(career, career.inbox[0]).sponsors[0].renews).toBe('old-deal');
    });

    it('refuses a renewal once its slot has gone', () => {
      const tyres = { name: 'Vantor Tyres', trade: 'tyres', nation: 'DEU' } as const;
      const career = offered({
        inbox: [makeSponsorMail({ ...offer, renews: 'old-deal' })], sponsors: [makeDeal({ sponsor: tyres })],
      });

      expect(() => signSponsor(career, career.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.slotFull' }));
    });

    it('refuses a mail that is no longer open', () => {
      const lapsed = offered({ date: '2026-04-01' });
      const declined = offered({ inbox: [makeSponsorMail(offer, { reply: { answer: 'declined', on: '2026-03-05' } })] });

      expect(() => signSponsor(lapsed, lapsed.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.closed' }));
      expect(() => signSponsor(declined, declined.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.closed' }));
    });

    it('refuses a sponsor of a trade another backing the player is in', () => {
      const career = offered({ sponsors: [makeDeal({ slot: 'partner' })] });

      expect(() => signSponsor(career, career.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.trade' }));
    });

    it('refuses a slot already filled', () => {
      const tyres = { name: 'Vantor Tyres', trade: 'tyres', nation: 'DEU' } as const;
      const tech = { name: 'Lumen Data', trade: 'tech', nation: 'USA' } as const;
      const main = offered({ sponsors: [makeDeal({ sponsor: tyres })] });
      const partner = offered({
        inbox: [makeSponsorMail({ ...offer, slot: 'partner' })],
        sponsors: [
          makeDeal({ id: 'a', slot: 'partner', sponsor: tyres }),
          makeDeal({ id: 'b', slot: 'partner', sponsor: tech }),
        ],
      });

      expect(() => signSponsor(main, main.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.slotFull' }));
      expect(() => signSponsor(partner, partner.inbox[0])).toThrow(expect.objectContaining({ code: 'sponsor.slotFull' }));
    });

    describe('replacing a deal', () => {
      // Signed in January with 3,650 on signing, so 1,830 is repaid on 5 July.
      const old = makeDeal({ perks: [{ kind: 'racePay', amount: 500 }, { kind: 'signing', amount: 3650 }] });

      /**
       * A career on 5 July holding the old deal and an offer to replace it.
       * @param money What the career holds
       * @param bonus The new deal's signing bonus
       * @returns The career
       */
      const replacing = (money: number, bonus: number): Career => offered({
        date: '2026-07-05',
        money,
        sponsors: [old],
        inbox: [makeSponsorMail(
          { ...offer, perks: [{ kind: 'signing', amount: bonus }], replaces: old.id },
          { deadline: '2026-07-31' },
        )],
      });

      it('ends the deal it replaces, of its own trade or not, repaying what that owes', () => {
        const career = replacing(100_000, 2000);
        const signed = signSponsor(career, career.inbox[0]);

        expect(signed.sponsors[0].ended).toEqual({ on: '2026-07-05', why: 'replaced' });
        expect(signed.sponsors[1]).toMatchObject({ id: sponsorMailId('test-cup/one'), signed: '2026-07-05' });
        expect(signed.ledger.map((line) => line.amount)).toEqual([-1830, 2000]);
        expect(signed.money).toBe(100_170);
      });

      // Guards a fix: the repayment was once checked against the money before
      // the new signing bonus was paid in.
      it('signs when the new signing bonus covers what the money alone would not', () => {
        const career = replacing(500, 5000);

        expect(signSponsor(career, career.inbox[0]).money).toBe(3670);
      });

      it('refuses a replacement the career cannot repay, even with the new bonus', () => {
        const career = replacing(500, 1000);

        expect(() => signSponsor(career, career.inbox[0]))
          .toThrow(expect.objectContaining({ code: 'sponsor.repay.short', params: { repay: 1830, money: 500 } }));
      });
    });
  });
});
