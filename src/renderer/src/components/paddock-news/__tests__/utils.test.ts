import { describe, expect, it, jest } from '@jest/globals';
import type { TFunction } from 'i18next';

import { Discipline } from '../../../../../shared/types';
import type { Debrief, DebriefSession, Mail } from '../../../../../shared/types';
import {
  debriefLines, debriefSubject, gapText, initials, isPerson, listOf, newsAccent, newsSubject, paddockName, placeText,
} from '../utils.ts';
import { CONTRACT_ACCENT, DEBRIEF_ACCENT, RESULTS_ACCENT } from '@/lib/accents';

// The championships screen's folder reaches react-router; its helpers do not.
jest.mock('@/screens/championships', () => jest.requireActual('@/screens/championships/utils.ts'));

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const t = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

/**
 * Writes a day back the way a test can read it.
 * @param value The ISO date
 * @returns It, marked
 */
const day = (value: string): string => `<${value}>`;

/**
 * One session of a debrief, a race the player won from pole unless said.
 * @param over Whatever the test wants said differently
 * @returns The session
 */
const session = (over: Partial<DebriefSession> = {}): DebriefSession => ({
  index: 1, type: 'race', name: 'Race', grid: 1, place: 1, of: 10, best: 90_000, gap: 0, mate: 4, points: 25, ...over,
});

/**
 * A debrief of the round at Monza.
 * @param over Whatever the test wants said differently
 * @returns The debrief
 */
const debrief = (over: Partial<Debrief> = {}): Debrief => ({
  series: 'gt-cup',
  seriesName: 'GT Cup',
  season: 0,
  edition: 0,
  editions: 1,
  raceId: 'gt-cup/one@0.0',
  round: 'one',
  roundName: 'Monza',
  number: 1,
  rounds: 3,
  entryName: 'GT',
  car: 'gt_car',
  sessions: [session()],
  standing: { place: 1, was: null, points: 25 },
  ...over,
});

/**
 * A mail of the paddock's.
 * @param over What it holds
 * @returns The mail
 */
const mail = (over: Partial<Mail>): Mail => ({
  id: 'x', kind: 'debrief', season: 0, arrived: '2026-03-01', opened: false, ...over,
});

describe('renderer/components/paddock-news/utils', () => {
  describe('paddockName', () => {
    it('names a person, and the organisers by their championship', () => {
      expect(paddockName({ role: 'engineer', name: 'Ann Lee' }, t)).toBe('Ann Lee');
      expect(paddockName({ role: 'organisers', name: 'GT Cup' }, t)).toBe('GT Cup');
    });

    it('calls the panel and the paddock\'s news what they are', () => {
      expect(paddockName({ role: 'categorisation' }, t)).toBe('inbox.news.from.categorisation');
      expect(paddockName({ role: 'paddock' }, t)).toBe('inbox.news.from.paddock');
    });

    it('falls back to the organisers where nobody is named', () => {
      expect(paddockName({ role: 'organisers' }, t)).toBe('inbox.organisers');
    });
  });

  describe('initials', () => {
    it('takes the first two names\' first letters', () => {
      expect(initials('Ann Lee')).toBe('AL');
      expect(initials('maria de la cruz')).toBe('MD');
    });

    it('leaves out what is not a letter', () => {
      expect(initials('Ann 2 Lee')).toBe('AL');
      expect(initials('Lee')).toBe('L');
    });
  });

  describe('gapText', () => {
    // Fixed: a gap under ten seconds read "00.336".
    it('writes a gap under ten seconds without its leading zero', () => {
      expect(gapText(336)).toBe('0.336');
      expect(gapText(1_234)).toBe('1.234');
    });

    it('writes longer gaps as a timing screen does', () => {
      expect(gapText(12_345)).toBe('12.345');
      expect(gapText(62_003)).toBe('1:02.003');
    });
  });

  describe('placeText', () => {
    it('writes a place, and that there was none', () => {
      expect(placeText(3, t)).toBe('inbox.news.place(place=3)');
      expect(placeText(null, t)).toBe('inbox.news.debrief.unclassified');
    });
  });

  describe('listOf', () => {
    it('says one thing as it is, and several with the last joined on', () => {
      expect(listOf([], t)).toBe('');
      expect(listOf(['a'], t)).toBe('a');
      expect(listOf(['a', 'b', 'c'], t)).toBe('inbox.news.and(first=a, b,last=c)');
    });
  });

  describe('debriefSubject', () => {
    it('titles a round with where each race finished', () => {
      expect(debriefSubject(debrief({ sessions: [session(), session({ index: 2, place: 4 })] }), t))
        .toBe('inbox.news.debrief.subject(round=Monza,places=inbox.news.and(first=inbox.news.place(place=1),last=inbox.news.place(place=4)))');
    });

    it('titles a round with no race by where the player qualified', () => {
      expect(debriefSubject(debrief({ sessions: [session({ type: 'qualify', place: 5, points: undefined })] }), t))
        .toBe('inbox.news.debrief.subjectQualifying(round=Monza,place=inbox.news.place(place=5))');
    });
  });

  describe('newsSubject', () => {
    const notice = {
      series: 'gt-cup',
      seriesName: 'GT Cup',
      season: 0,
      edition: 0,
      editions: 1,
      team: 'aster',
      teamName: 'Aster Racing',
      entryName: 'GT',
      keep: 2,
      standing: {
        place: 1, mate: 2, size: 4, kept: true,
      },
    };
    const results = {
      series: 'gt-cup',
      seriesName: 'GT Cup',
      season: 0,
      edition: 0,
      editions: 1,
      entryName: 'GT',
      of: 4,
      points: 40,
      wins: 1,
      podiums: 2,
      top: [],
      paid: 0,
    };

    it('titles a championship\'s result by the place, the title and no place at all', () => {
      expect(newsSubject(mail({ results: { ...results, place: 3 } }), '2026', t))
        .toBe('inbox.news.results.subject(series=GT Cup,edition=2026,place=3,entry=GT)');
      expect(newsSubject(mail({ results: { ...results, place: 1 } }), '2026', t))
        .toBe('inbox.news.results.subjectChampion(series=GT Cup,edition=2026)');
      expect(newsSubject(mail({ results: { ...results, place: null } }), '2026', t))
        .toBe('inbox.news.results.subjectNone(series=GT Cup,edition=2026)');
    });

    it('titles a rung as Home\'s banner does', () => {
      const up = mail({
        rung: {
          discipline: Discipline.SPORTSCAR, tier: 3, rating: 3_510, dir: 'up',
        },
      });

      expect(newsSubject(up, '', t)).toMatch(/^home\.rating\.promoted\(tier=3,discipline=/);
      expect(newsSubject({ ...up, rung: { ...up.rung!, dir: 'down' } }, '', t)).toMatch(/^home\.rating\.dropped/);
    });

    it('titles market news by its year, and each kind of team news', () => {
      expect(newsSubject(mail({ market: { seats: [] } }), '2026', t)).toBe('inbox.news.market.subject(year=2026)');
      expect(newsSubject(mail({ notice: { ...notice, kind: 'welcome' } }), '2026', t))
        .toBe('inbox.news.welcome.subject(team=Aster Racing)');
      expect(newsSubject(mail({ notice: { ...notice, kind: 'welcome', renewal: true } }), '2026', t))
        .toBe('inbox.news.welcome.subjectBack(team=Aster Racing)');
      expect(newsSubject(mail({ notice: { ...notice, kind: 'halfway' } }), '2026', t))
        .toBe('inbox.news.halfway.subject(series=GT Cup,edition=2026)');
      expect(newsSubject(mail({ notice: { ...notice, kind: 'missed', round: { raceId: 'r', name: 'Spa', number: 2 } } }), '', t))
        .toBe('inbox.news.missed.subject(round=Spa)');
    });

    it('has nothing to say of a team not keeping the player on, or any other mail', () => {
      expect(newsSubject(mail({ notice }), '2026', t)).toBeNull();
      expect(newsSubject(mail({}), '2026', t)).toBeNull();
    });
  });

  describe('debriefLines', () => {
    it('leads with the best race and says each session, then the teammate and the table', () => {
      const lines = debriefLines(debrief({
        sessions: [
          session({ index: 0, type: 'qualify', place: 2, grid: null, gap: 300, mate: 1, points: undefined }),
          session({ grid: 2, place: 1, mate: 3 }),
        ],
        mate: {
          name: 'Ann Mate', place: 4, was: null, points: 15,
        },
        standing: { place: 2, was: 5, points: 25 },
        next: { name: 'Spa', date: '2026-04-01' },
      }), t, day);

      expect(lines).toEqual([
        [
          'inbox.news.debrief.lede.win(round=Monza)',
          'inbox.news.debrief.qualify.gap(session=race.sessionType.qualify,place=2,gap=0.300)',
          'inbox.news.debrief.race.win(session=race.sessionType.race,place=1,grid=2)',
        ].join(' '),
        'inbox.news.debrief.mate.some(name=Ann Mate,count=1,of=2)',
        'inbox.news.debrief.standing.up(place=2,count=3) inbox.news.debrief.next(round=Spa,day=<2026-04-01>)',
      ]);
    });

    it('goes by a session\'s own name where its kind runs more than once', () => {
      const [lede] = debriefLines(debrief({
        sessions: [session({ name: 'Race 1', place: 4 }), session({ index: 2, name: 'Race 2', place: 6, points: 0 })],
      }), t, day);

      expect(lede).toContain('inbox.news.debrief.lede.points');
      expect(lede).toContain('race.down(session=Race 1,place=4,grid=1)');
    });

    it('says a hard day, a win from pole, a held place and a car not classified', () => {
      const [lede] = debriefLines(debrief({
        sessions: [
          session({ index: 0, type: 'qualify', place: 1, gap: 0, points: undefined }),
          session({ place: null, points: 0 }),
        ],
      }), t, day);

      expect(lede).toBe([
        'inbox.news.debrief.lede.none(round=Monza)',
        'inbox.news.debrief.qualify.pole(session=race.sessionType.qualify)',
        'inbox.news.debrief.race.out(session=race.sessionType.race)',
      ].join(' '));
      expect(debriefLines(debrief(), t, day)[0]).toContain('race.winPole');
      expect(debriefLines(debrief({ sessions: [session({ place: 3, grid: 3 })] }), t, day)[0]).toContain('race.held');
    });

    it('says the last round, and nothing of the table for a historic event', () => {
      expect(debriefLines(debrief({ standing: { place: 1, was: 1, points: 50 } }), t, day).at(-1))
        .toBe('inbox.news.debrief.standing.held(place=1) inbox.news.debrief.last');
      expect(debriefLines(debrief({ historic: true }), t, day)).toHaveLength(1);
    });

    it('compares the teammate only over sessions both were classified in', () => {
      const lines = debriefLines(debrief({
        sessions: [session({ mate: 2 }), session({ index: 2, place: null, mate: 1 })],
        mate: {
          name: 'Ann Mate', place: 3, was: null, points: 18,
        },
      }), t, day);

      expect(lines[1]).toBe('inbox.news.debrief.mate.all(name=Ann Mate,count=1,of=1)');
    });
  });

  describe('isPerson', () => {
    it('tells an engineer or a team\'s boss from a body', () => {
      expect(['engineer', 'principal', 'manager', 'owner'].every((role) => isPerson({ role } as never))).toBe(true);
      expect(['organisers', 'categorisation', 'paddock'].some((role) => isPerson({ role } as never))).toBe(false);
    });
  });

  describe('newsAccent', () => {
    it('colours each kind of the paddock\'s mail by its kind', () => {
      expect(newsAccent(mail({ debrief: debrief() }))).toBe(DEBRIEF_ACCENT);
      expect(newsAccent(mail({ results: {} as never }))).toBe(RESULTS_ACCENT);
      expect(newsAccent(mail({ market: { seats: [] } }))).toBe(CONTRACT_ACCENT);
      expect(newsAccent(mail({
        rung: {
          discipline: Discipline.ROAD, tier: 3, rating: 0, dir: 'up',
        },
      }))).toMatch(/tier-silver/);
    });

    it('has no colour for mail of another kind', () => {
      expect(newsAccent(mail({}))).toBeNull();
    });
  });
});
