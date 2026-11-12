import { describe, expect, it } from '@jest/globals';

import {
  CAREER_ID, makeCareer, makeChampionship, makeContract, makeEntry, makeEvent, makePlan, makeRace, makeRecord,
  makeResult, makeSeason, QUALIFY, RACE,
} from './fixtures.ts';
import { Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type {
  LedgerLine, MarketSeat, RatingLine, SeasonEntry, SeasonEvent,
} from '../../../shared/types/index.ts';
import { SESSION_TYPE } from '../../race-ini/index.ts';
import { MARKET_SEATS } from '../constants.ts';
import {
  debriefMail, debriefOf, marketMail, paddocker, paddockNews, teamNotice, teamPeople,
} from '../paddock-news.ts';

/**
 * The opening round, driven: the player second in qualifying behind their
 * teammate, then winning the race from that grid.
 * @param over Whatever the test wants said differently of the event
 * @returns The event, raced and scored
 */
const drivenRound = (over: Partial<SeasonEvent> = {}): SeasonEvent => makeEvent('one', '2026-03-01', {
  status: 'raced',
  sessions: [makeRecord(0, [1, 0, 2, 3]), makeRecord(1, [0, 2, 1, 3])],
  score: { round: 'one', recordedAt: '', races: [makeRace(1, ['s2', 's3', 's1', 's4'])] },
  ...over,
});

/**
 * What the round archived: the player's qualifying lap 0.3s off their
 * teammate's pole, an invalidated one beside it, and their race lap 0.1s off
 * the class's best.
 */
const RESULTS = [
  makeResult(0, SESSION_TYPE.qualify, [[90_500, -1], [90_200], [91_000], [92_000]]),
  makeResult(1, SESSION_TYPE.race, [[91_000], [91_400], [90_900], [92_500]]),
];

/**
 * The entry with the opening round driven.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
const drivenEntry = (over: Partial<SeasonEntry> = {}): SeasonEntry => makeEntry({
  events: [drivenRound(), makeEvent('two', '2026-04-01'), makeEvent('three', '2026-05-01')],
  ...over,
});

/**
 * One line of the ledger.
 * @param key What it settles
 * @param over Whatever the test wants said differently
 * @returns The line
 */
const line = (key: string, over: Partial<LedgerLine> = {}): LedgerLine => ({
  key, kind: 'fine', date: '2026-04-01', season: 0, amount: -1_000, ...over,
});

/**
 * Every round of the entry run, the player third in the class.
 * @returns The events
 */
const seasonDone = (): SeasonEvent[] => ['one', 'two', 'three'].map((round, at) => makeEvent(round, `2026-0${at + 3}-01`, {
  status: 'raced',
  score: { round, recordedAt: '', races: [makeRace(0, ['s3', 's1', 's2', 's4'])] },
}));

describe('core/paddock-news/paddock-news', () => {
  describe('paddocker', () => {
    const team = makeChampionship().teams?.[0] ?? null;

    it('draws the same person for the same team and role every time', () => {
      expect(paddocker(CAREER_ID, { id: 'gt-cup' }, team, 'engineer'))
        .toEqual(paddocker(CAREER_ID, { id: 'gt-cup' }, team, 'engineer'));
    });

    it('draws a different person for another career', () => {
      expect(paddocker('career-2', { id: 'gt-cup' }, team, 'engineer').name)
        .not.toBe(paddocker(CAREER_ID, { id: 'gt-cup' }, team, 'engineer').name);
    });

    it('draws them from the team\'s nation and names the team', () => {
      expect(paddocker(CAREER_ID, { id: 'gt-cup' }, team, 'principal')).toMatchObject({
        role: 'principal', nation: 'GBR', teamName: 'Aster Racing',
      });
    });

    it('names no team where the seat has none', () => {
      expect(paddocker(CAREER_ID, { id: 'gt-cup' }, null, 'engineer').teamName).toBeUndefined();
    });
  });

  describe('teamPeople', () => {
    it('names the boss by the team\'s budget', () => {
      expect(teamPeople(CAREER_ID, makeEntry()).boss.role).toBe('principal');
      expect(teamPeople(CAREER_ID, makeEntry({ playerSeat: 's4' })).boss.role).toBe('owner');
    });

    // Fixed: a contract's seat filed under another team in the season's copy
    // credited that team's people.
    it('takes the contract\'s team over the seat\'s', () => {
      const people = teamPeople(CAREER_ID, makeEntry({ playerSeat: 's4', contract: makeContract() }));

      expect(people.team?.id).toBe('aster');
      expect(people.engineer.teamName).toBe('Aster Racing');
    });

    it('falls back to a team manager where the team states no budget', () => {
      const championship = makeChampionship({ teams: [{ id: 'aster', name: 'Aster Racing' }] });

      expect(teamPeople(CAREER_ID, makeEntry({ championship })).boss.role).toBe('manager');
    });
  });

  describe('debriefOf', () => {
    it('reports each qualifying and race as places in the class', () => {
      const entry = drivenEntry();
      const debrief = debriefOf({
        season: 0, entry, event: entry.events[0], plan: makePlan(), results: RESULTS,
      });

      expect(debrief?.sessions).toEqual([
        {
          index: 0, type: 'qualify', name: 'Qualifying', grid: null, place: 2, of: 4, best: 90_500, gap: 300, mate: 1,
        },
        {
          index: 1, type: 'race', name: 'Race', grid: 2, place: 1, of: 4, best: 91_000, gap: 100, mate: 3, points: 25,
        },
      ]);
    });

    it('names the run, the round, the teammate and the next round', () => {
      const entry = drivenEntry();

      expect(debriefOf({
        season: 0, entry, event: entry.events[0], plan: makePlan(), results: RESULTS,
      })).toMatchObject({
        series: 'gt-cup',
        seriesName: 'GT Cup',
        raceId: 'gt-cup/one@0.0',
        roundName: 'Monza',
        number: 1,
        rounds: 3,
        entryName: 'GT',
        car: 'gt_car',
        standing: { place: 1, was: null, points: 25 },
        mate: {
          name: 'Ann Mate', nation: 'GBR', place: 3, was: null, points: 15,
        },
        next: { name: 'Spa', date: '2026-04-01' },
      });
    });

    // Fixed: the grid was composed off the qualifying alone, so a reverse-grid
    // race said the player started where they qualified.
    it('starts a reverse-grid race where the reversal put the player', () => {
      const entry = drivenEntry();
      const plan = makePlan([QUALIFY, { ...RACE, inherit: { from: 'q', reverse: 2 } }]);

      expect(debriefOf({
        season: 0, entry, event: entry.events[0], plan, results: RESULTS,
      })?.sessions[1].grid).toBe(1);
    });

    // Fixed: the standings before the round were read part-way through it, so
    // a sprint's points counted as where the player stood before.
    it('measures the championship against every round but this one', () => {
      const earlier = makeEvent('one', '2026-03-01', {
        status: 'raced', score: { round: 'one', recordedAt: '', races: [makeRace(0, ['s3', 's4', 's1', 's2'])] },
      });
      const sprintAndFeature = makeEvent('two', '2026-04-01', {
        status: 'raced',
        sessions: [makeRecord(0, [0, 1, 2, 3]), makeRecord(1, [0, 1, 2, 3])],
        score: { round: 'two', recordedAt: '', races: [makeRace(0, ['s2', 's1', 's3', 's4']), makeRace(1, ['s2', 's1', 's3', 's4'])] },
      });
      const entry = makeEntry({ events: [earlier, sprintAndFeature, makeEvent('three', '2026-05-01')] });
      const plan = makePlan([{ ...RACE, inherit: undefined }, { ...RACE, inherit: undefined }]);

      expect(debriefOf({
        season: 0, entry, event: sprintAndFeature, plan, results: [],
      })?.standing).toEqual({ place: 1, was: 4, points: 62 });
    });

    it('leaves out practice and a knockout segment the player was out of', () => {
      const event = drivenRound({
        sessions: [makeRecord(0, [0, 1, 2, 3]), makeRecord(1, [1, 2], { skipped: true }), makeRecord(2, [0, 2, 1, 3])],
      });
      const plan = makePlan([{ type: 'practice', minutes: 30 }, QUALIFY, RACE]);
      const entry = makeEntry({ events: [event] });

      expect(debriefOf({
        season: 0, entry, event, plan, results: [],
      })?.sessions.map((one) => one.index)).toEqual([2]);
    });

    it('writes nothing for a round with no qualifying or race driven', () => {
      const event = drivenRound({ sessions: [makeRecord(0, [0, 1, 2, 3])] });

      expect(debriefOf({
        season: 0, entry: makeEntry({ events: [event] }), event, plan: makePlan([{ type: 'practice', minutes: 30 }]), results: [],
      })).toBeNull();
    });

    it('has no gap or best lap where the archive is missing', () => {
      const entry = drivenEntry();
      const [qualifying] = debriefOf({
        season: 0, entry, event: entry.events[0], plan: makePlan(), results: [],
      })?.sessions ?? [];

      expect(qualifying).toMatchObject({ best: null, gap: null });
    });

    it('marks a historic event and names no next round past the last', () => {
      const entry = drivenEntry({ historic: true, events: [drivenRound()] });

      const debrief = debriefOf({
        season: 0, entry, event: entry.events[0], plan: makePlan(), results: RESULTS,
      });

      expect(debrief?.historic).toBe(true);
      expect(debrief?.next).toBeUndefined();
    });
  });

  describe('debriefMail', () => {
    it('sends the debrief from the team\'s engineer, keyed by its race', () => {
      const entry = drivenEntry();
      const debrief = debriefOf({
        season: 0, entry, event: entry.events[0], plan: makePlan(), results: RESULTS,
      });
      if (!debrief) throw new Error('no debrief');

      expect(debriefMail(CAREER_ID, entry, debrief, '2026-03-01', 0)).toMatchObject({
        id: 'debrief:gt-cup/one@0.0',
        kind: 'debrief',
        season: 0,
        arrived: '2026-03-01',
        opened: false,
        from: { role: 'engineer', teamName: 'Aster Racing' },
        debrief,
      });
    });
  });

  describe('teamNotice', () => {
    it('says the run, the team, the class and what keeps the player on', () => {
      const entry = { ...makeEntry(), contract: makeContract() };
      const standing = {
        place: 3, mate: 1, size: 4, kept: false,
      };

      expect(teamNotice(entry, 0, standing)).toEqual({
        series: 'gt-cup',
        seriesName: 'GT Cup',
        season: 0,
        edition: 0,
        editions: 1,
        team: 'aster',
        teamName: 'Aster Racing',
        nation: 'GBR',
        entryName: 'GT',
        keep: 2,
        standing,
      });
    });

    it('keeps the whole class for a privateer, which asks no place', () => {
      const entry = { ...makeEntry(), contract: makeContract({ keep: undefined }) };

      expect(teamNotice(entry, 0, {
        place: null, mate: null, size: 4, kept: true,
      }).keep).toBe(4);
    });
  });

  describe('paddockNews', () => {
    /**
     * A career holding one entry in its one season.
     * @param entry The entry
     * @param over Whatever the test wants said differently of the career
     * @returns The career
     */
    const careerWith = (entry: SeasonEntry, over: Parameters<typeof makeCareer>[0] = {}) => makeCareer({
      seasons: [makeSeason({ entries: [entry] })], ...over,
    });
    const ids = (career: ReturnType<typeof makeCareer>): string[] => paddockNews(career).map((mail) => mail.id);

    it('sends nothing outside a career, or before news has started', () => {
      const entry = makeEntry({ contract: makeContract() });

      expect(paddockNews(careerWith(entry, { kind: 'championship' }))).toEqual([]);
      expect(paddockNews(careerWith(entry, { newsFrom: undefined }))).toEqual([]);
    });

    it('welcomes the player as a contract is signed, from the team\'s boss', () => {
      const [mail] = paddockNews(careerWith(makeEntry({ contract: makeContract() })));

      expect(mail).toMatchObject({
        id: 'welcome:gt-cup:0.0',
        kind: 'notice',
        arrived: '2026-01-10',
        from: { role: 'principal', teamName: 'Aster Racing' },
        notice: {
          kind: 'welcome',
          car: { model: 'gt_car', skin: 'aster' },
          mate: { name: 'Ann Mate', nation: 'GBR' },
          engineer: { role: 'engineer' },
          opener: { name: 'Monza', date: '2026-03-01' },
        },
      });
    });

    it('welcomes a renewal back', () => {
      const contract = makeContract({ renews: { season: 0, edition: 0 } as never });

      expect(paddockNews(careerWith(makeEntry({ contract })))[0].notice?.renewal).toBe(true);
    });

    it('sends nothing for a contract signed before news started', () => {
      expect(ids(careerWith(makeEntry({ contract: makeContract() }), { newsFrom: '2026-02-01' }))).toEqual([]);
    });

    it('sends a halfway word once half the rounds have run', () => {
      const events = drivenEntry().events.map((event, at) => (at < 2 ? { ...event, status: 'raced' as const } : event));
      const halfway = paddockNews(careerWith(makeEntry({ contract: makeContract(), events })))
        .find((mail) => mail.id === 'halfway:gt-cup:0.0');

      expect(halfway).toMatchObject({ arrived: '2026-04-01', notice: { kind: 'halfway', rounds: { done: 2, of: 3 } } });
    });

    it('sends no halfway word before halfway, once the run is over, or to a privateer', () => {
      const raced = (count: number) => drivenEntry().events.map((event, at) => (
        at < count ? { ...event, status: 'raced' as const } : event
      ));

      expect(ids(careerWith(makeEntry({ contract: makeContract(), events: raced(1) })))).not.toContain('halfway:gt-cup:0.0');
      expect(ids(careerWith(makeEntry({ contract: makeContract(), events: raced(3) })))).not.toContain('halfway:gt-cup:0.0');
      expect(ids(careerWith(makeEntry({ contract: makeContract({ keep: undefined }), events: raced(2) }))))
        .not.toContain('halfway:gt-cup:0.0');
    });

    // Fixed: a contract signed past its halfway round sent a halfway word dated
    // before the contract, ahead of its own welcome.
    it('sends no halfway word for a contract signed after its halfway round', () => {
      const events = drivenEntry().events.map((event, at) => (at < 2 ? { ...event, status: 'raced' as const } : event));
      const contract = makeContract({ signed: '2026-04-15' });

      expect(ids(careerWith(makeEntry({ contract, events })))).not.toContain('halfway:gt-cup:0.0');
    });

    it('tells of a round missed with its fine and how the reserve driver did', () => {
      const missed = makeEvent('two', '2026-04-01', {
        status: 'missed',
        score: {
          round: 'two', recordedAt: '', races: [makeRace(0, ['s3', 's2', 's1', 's4'], { s2: { substitute: true } })],
        },
      });
      const entry = makeEntry({ contract: makeContract(), events: [makeEvent('one', '2026-03-01'), missed] });
      const mail = paddockNews(careerWith(entry, { ledger: [line('fine:gt-cup/two@0.0', { amount: -1_500 })] }))
        .find((one) => one.id === 'missed:gt-cup/two@0.0');

      expect(mail?.notice).toMatchObject({
        kind: 'missed', round: { raceId: 'gt-cup/two@0.0', name: 'Spa', number: 2 }, fine: 1_500, places: [2],
      });
    });

    it('sends an edition\'s result from the team\'s boss under contract', () => {
      const entry = makeEntry({ contract: makeContract(), events: seasonDone() });
      const ledger = [
        line('standings:0:gt-cup:0', {
          kind: 'standings', date: '2026-05-02', amount: 2_500, share: { percent: 25, purse: 10_000 },
        }),
        line('bonus:0:gt-cup:0', { kind: 'bonus', date: '2026-05-02', amount: 1_000 }),
      ];
      const mail = paddockNews(careerWith(entry, { ledger })).find((one) => one.kind === 'results');

      expect(mail).toMatchObject({
        id: 'results:gt-cup:0.0',
        arrived: '2026-05-02',
        from: { role: 'principal' },
        results: {
          place: 3,
          of: 4,
          points: 45,
          podiums: 3,
          mate: { name: 'Ann Mate', place: 2, points: 54 },
          team: { name: 'Aster Racing', place: 2, of: 2 },
          paid: 2_500,
          purse: 10_000,
          bonus: 1_000,
        },
      });
    });

    it('sends it from the organisers on the player\'s own, the player\'s row marked', () => {
      const entry = makeEntry({ events: seasonDone() });
      const mail = paddockNews(careerWith(entry)).find((one) => one.kind === 'results');

      expect(mail?.from).toEqual({ role: 'organisers', name: 'GT Cup' });
      expect(mail?.results?.team).toBeUndefined();
      expect(mail?.results?.top.find((row) => row.player)).toMatchObject({ position: 3, team: 'Aster Racing' });
    });

    it('lists the top of the table and the player\'s row beneath it', () => {
      const championship = makeChampionship();
      const [classEntry] = championship.entries;
      const seats = Array.from({ length: 7 }, (unused, at) => ({ id: `x${at}`, team: 'bolt', driver: { name: `X ${at}` } }));
      const wide = { ...championship, entries: [{ ...classEntry, seats: [...seats, ...classEntry.seats] }] };
      const events = seasonDone().map((event) => ({
        ...event,
        score: {
          round: event.round, recordedAt: '', races: [makeRace(0, [...seats.map((seat) => seat.id), 's1', 's2'])],
        },
      }));
      const mail = paddockNews(careerWith(makeEntry({ championship: wide, events }))).find((one) => one.kind === 'results');

      expect(mail?.results?.top.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 9]);
    });

    it('sends no result while the edition runs, nor for one withdrawn from or a historic event', () => {
      const running = drivenEntry();

      expect(ids(careerWith(running))).not.toContain('results:gt-cup:0.0');
      expect(ids(careerWith(makeEntry({ events: seasonDone(), withdrawn: true })))).toEqual([]);
      expect(ids(careerWith(makeEntry({ events: seasonDone(), historic: true })))).toEqual([]);
    });

    it('tells of every rung opened and lost since news started', () => {
      const rating = (key: string, kind: RatingLine['kind'], date: string): RatingLine => ({
        key,
        kind,
        date,
        season: 0,
        discipline: Discipline.SPORTSCAR,
        change: 0,
        globalChange: 0,
        rating: 3_510,
        global: 3_000,
        tier: 3,
      });
      const news = paddockNews(makeCareer({
        ratingLog: [
          rating('promotion:a', 'promotion', '2026-03-01'),
          rating('drop:0:sportscar', 'drop', '2026-12-31'),
          rating('promotion:old', 'promotion', '2025-12-01'),
          rating('race:a', 'race', '2026-03-01'),
        ],
      }));

      expect(news.map((mail) => [mail.id, mail.rung?.dir])).toEqual([
        ['rung:promotion:a', 'up'],
        ['rung:drop:0:sportscar', 'down'],
      ]);
      expect(news[0]).toMatchObject({
        kind: 'rung', from: { role: 'categorisation' }, rung: { discipline: Discipline.SPORTSCAR, tier: 3, rating: 3_510 },
      });
    });

    it('looks only at the two latest seasons', () => {
      const old = makeSeason({ index: 0, entries: [makeEntry({ contract: makeContract() })] });
      const career = makeCareer({ seasons: [old, makeSeason({ index: 1 }), makeSeason({ index: 2 })] });

      expect(paddockNews(career)).toEqual([]);
    });
  });

  describe('marketMail', () => {
    /**
     * A seat for sale at a price.
     * @param price What it costs
     * @returns The seat
     */
    const seat = (price: number): MarketSeat => ({
      series: 'gt-cup',
      seriesName: 'GT Cup',
      season: 0,
      edition: 0,
      editions: 1,
      entry: 'gt',
      entryName: 'GT',
      team: `team-${price}`,
      teamName: `Team ${price}`,
      budget: TeamBudget.PRIVATEER,
      car: { model: 'gt_car' },
      price,
    });

    it('sends nothing with no seat for sale', () => {
      expect(marketMail(makeSeason(), [], '2026-01-01')).toBeNull();
    });

    it('lists the seats cheapest first, from the paddock\'s news', () => {
      expect(marketMail(makeSeason(), [seat(300), seat(100), seat(200)], '2026-01-01')).toMatchObject({
        id: 'market:0',
        kind: 'market',
        arrived: '2026-01-01',
        from: { role: 'paddock' },
        market: { seats: [{ price: 100 }, { price: 200 }, { price: 300 }] },
      });
    });

    it('lists no more than its share', () => {
      const seats = Array.from({ length: MARKET_SEATS + 3 }, (unused, at) => seat(at));

      expect(marketMail(makeSeason(), seats, '2026-01-01')?.market?.seats).toHaveLength(MARKET_SEATS);
    });
  });
});
