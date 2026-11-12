import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type {
  EventSession, EventSessionStatus, LaunchRecord, SkippedRound,
} from '../../../../../shared/types';
import {
  defaultSession, dotted, launchNote, moneyNote, playerPosition, racedStrength, scaleName, sessionDay,
  sessionLength, shareOf, sharesText, shortLaps,
} from '../utils.ts';

/**
 * One session of an event, carrying only what these helpers read.
 * @param overrides What to change about it
 * @returns The session
 */
const session = (overrides: Partial<EventSession> = {}): EventSession => ({
  index: 0,
  type: 'practice',
  name: null,
  day: 0,
  startsAt: null,
  forecast: null,
  pending: false,
  inherit: null,
  apart: false,
  status: 'later',
  record: null,
  startSlot: null,
  place: null,
  points: [],
  startOrder: null,
  score: null,
  ...overrides,
});

/**
 * An event's sessions, one per status given, numbered in the order they run.
 * @param statuses Where each session of the event stands
 * @returns The sessions
 */
const event = (statuses: readonly EventSessionStatus[]): EventSession[] => (
  statuses.map((status, index) => session({ index, status }))
);

/**
 * What a launch left, for a test to say who it classified.
 * @param classification The car indices in the order it classified them
 * @returns The record
 */
const record = (classification: number[] | null): LaunchRecord => ({
  index: 0,
  completedAt: '2026-03-08T14:00:00.000Z',
  archive: 'results/magione.json',
  gridOrder: [0, 1, 2],
  classification,
});

/**
 * A translator that hands back its key and whatever it was passed, so a test
 * can read which key was asked for and what was interpolated into it.
 * @returns The key, with its parameters spelled out after it
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

/**
 * A number formatter that marks what it touched, standing in for the locale's.
 * @param value The number to format
 * @returns The number, marked
 */
const formatNumber = (value: number): string => `#${value}`;

describe('renderer/screens/event/utils', () => {
  describe('sharesText', () => {
    const t = ((key: string, params?: { sponsor: string; share: number }) => (
      params ? `${params.share}% ${params.sponsor}` : ' and '
    )) as unknown as TFunction;

    it("says one sponsor's share", () => {
      expect(sharesText([{ sponsor: 'Halden', amount: 300, share: 20 }], t)).toBe('20% Halden');
    });

    it('joins several', () => {
      expect(sharesText([
        { sponsor: 'Halden', amount: 300, share: 20 }, { sponsor: 'Vantor', amount: 150, share: 10 },
      ], t)).toBe('20% Halden and 10% Vantor');
    });
  });

  describe('defaultSession', () => {
    it('opens on the session that runs next', () => {
      expect(defaultSession(event(['done', 'next', 'later']))).toBe(1);
    });

    it('opens on the last session already run when none runs next', () => {
      expect(defaultSession(event(['done', 'done', 'later']))).toBe(1);
    });

    it('opens on the first session when none has run', () => {
      expect(defaultSession(event(['later', 'later']))).toBe(0);
    });

    it('opens on nothing for an event with no sessions', () => {
      expect(defaultSession([])).toBe(0);
    });
  });

  describe('playerPosition', () => {
    // The player is always car 0 of the event's grid, whatever Content
    // Manager called them in the archive.
    it('counts from one, wherever the player sits in the classification', () => {
      expect(playerPosition(record([3, 0, 1]))).toBe(2);
      expect(playerPosition(record([0, 3, 1]))).toBe(1);
    });

    // A fixed bug: a qualifying of several classes read the player's place
    // overall, where a race reads it in class.
    it('counts among the player\'s own class where the grid held several', () => {
      const raced = { ...record([1, 3, 0, 2]), carClasses: ['am', 'am', 'pro', 'pro'] };

      expect(playerPosition(raced)).toBe(2);
    });

    it('is nothing for a session that left no record', () => {
      expect(playerPosition(null)).toBeNull();
    });

    it('is nothing for a session that classified nobody', () => {
      expect(playerPosition(record(null))).toBeNull();
    });

    it('is nothing for a classification the player is not in', () => {
      expect(playerPosition(record([3, 1, 2]))).toBeNull();
    });
  });

  describe('sessionLength', () => {
    it('states a session measured in laps as laps', () => {
      expect(sessionLength(session({ laps: 12 }), translate, formatNumber))
        .toBe('championships.format.laps(count=12)');
    });

    it('states a session as minutes only when it has no laps', () => {
      expect(sessionLength(session({ minutes: 20 }), translate, formatNumber))
        .toBe('championships.format.minutes(count=20)');
      expect(sessionLength(session({ laps: 12, minutes: 20 }), translate, formatNumber))
        .toBe('championships.format.laps(count=12)');
    });

    it('states nothing for a session that states neither', () => {
      expect(sessionLength(session(), translate, formatNumber)).toBeNull();
    });

    it('shows a race\'s distance beside the laps it comes to', () => {
      expect(sessionLength(session({ type: 'race', laps: 44, distance: 305 }), translate, formatNumber))
        .toBe('championships.detail.lengthDistance('
          + 'distance=championships.format.distance(value=#305),'
          + 'laps=championships.format.laps(count=44))');
    });

    it('states a race its launch ran short as the laps it ran, of the full length', () => {
      const shortened = session({
        type: 'race', laps: 781, distance: 4500, record: { ...record([0]), scale: 48 },
      });

      expect(sessionLength(shortened, translate, formatNumber))
        .toBe('championships.format.laps(count=16) · event.length.of(share=event.length.share(scale=48),full=#781)');
    });
  });

  describe('scaleName', () => {
    it('names the full race as such, and any other step as its share', () => {
      expect(scaleName(1, translate)).toBe('event.length.full');
      expect(scaleName(48, translate)).toBe('event.length.share(scale=48)');
    });
  });

  describe('shortLaps', () => {
    it('states the laps a shortened race comes to', () => {
      expect(shortLaps(781, 48, translate)).toBe('championships.format.laps(count=16)');
    });
  });

  describe('shareOf', () => {
    it('states the step beside the race\'s full length', () => {
      expect(shareOf(781, 48, translate, formatNumber))
        .toBe('event.length.of(share=event.length.share(scale=48),full=#781)');
    });
  });

  describe('launchNote', () => {
    /**
     * A round launching would cost, carrying only what the note reads.
     * @param reason Why it is lost
     * @returns The round
     */
    const lost = (reason: SkippedRound['reason']): SkippedRound => ({ reason } as SkippedRound);

    it('says a round is part-way through above anything else', () => {
      expect(launchNote([lost('skipped'), lost('partway'), lost('clash')])).toBe('skip.launchNotePartway');
    });

    it('says the rounds come before this one when every one does', () => {
      expect(launchNote([lost('skipped'), lost('skipped')])).toBe('skip.launchNote');
    });

    it('says the rounds share this one\'s day when every one does', () => {
      expect(launchNote([lost('clash')])).toBe('skip.launchNoteClash');
    });

    // Found in review: an earlier round and a same-day one were counted
    // together as rounds coming before this one.
    it('says neither when earlier rounds and same-day ones are both lost', () => {
      expect(launchNote([lost('skipped'), lost('clash')])).toBe('skip.launchNoteMixed');
    });
  });

  describe('moneyNote', () => {
    it('names the fee alone where nothing is rented', () => {
      expect(moneyNote(1500, 0)).toBe('event.money.feeNote');
    });

    it('names the rent alone once the fee is paid', () => {
      expect(moneyNote(0, 800)).toBe('event.money.rentNote');
    });

    it('names both where both are still to pay', () => {
      expect(moneyNote(1500, 800)).toBe('event.money.bothNote');
    });
  });

  describe('sessionDay', () => {
    it('names the day of the event a session runs on', () => {
      const sessions = [session({ index: 0, day: 0 }), session({ index: 1, day: 1 })];

      expect(sessionDay(sessions[0], sessions, translate)).toBe('championships.format.day(number=1)');
      expect(sessionDay(sessions[1], sessions, translate)).toBe('championships.format.day(number=2)');
    });

    it('says nothing for an event that runs in a single day', () => {
      const sessions = [session({ index: 0 }), session({ index: 1 })];

      expect(sessionDay(sessions[1], sessions, translate)).toBeNull();
    });
  });

  describe('dotted', () => {
    it('joins the parts of a line with the dot the app separates them with', () => {
      expect(dotted(['Magione', 'Round 1'])).toBe('Magione · Round 1');
    });

    it('leaves out the parts that are not there', () => {
      expect(dotted(['Magione', null, undefined, '', 'Round 1'])).toBe('Magione · Round 1');
    });

    it('is empty when nothing is there at all', () => {
      expect(dotted([null, undefined])).toBe('');
    });
  });

  describe('racedStrength', () => {
    /**
     * A session that has run, recording the strength each class raced at.
     * @param index Which launch it was
     * @param classStrength What it recorded, if anything
     * @returns The session
     */
    const ran = (index: number, classStrength?: Record<string, number>): EventSession => session({
      index,
      status: 'done',
      record: { ...record(null), index, ...(classStrength ? { classStrength } : {}) },
    });

    it('lists every session with what it raced the player\'s class at, in order', () => {
      const sessions = [ran(0, { gt3: 86, gt4: 80 }), ran(1, { gt3: 84, gt4: 78 })];

      expect(racedStrength(sessions, 'gt3').map(({ session: one, figure }) => [one.index, figure]))
        .toEqual([[0, 86], [1, 84]]);
    });

    it('leaves out a session still to run', () => {
      expect(racedStrength([ran(0, { gt3: 86 }), session({ index: 1, status: 'next' })], 'gt3')).toHaveLength(1);
    });

    it('leaves out a session that recorded nothing, as one simulated or run before strength was', () => {
      expect(racedStrength([ran(0), ran(1, { gt3: 84 })], 'gt3').map(({ figure }) => figure)).toEqual([84]);
    });

    it('leaves out a session that recorded no figure for the player\'s class', () => {
      expect(racedStrength([ran(0, { gt4: 80 })], 'gt3')).toEqual([]);
    });
  });
});
