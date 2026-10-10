import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type {
  EventSession, EventSessionStatus, LaunchRecord, SkippedRound,
} from '../../../../../shared/types';
import {
  defaultSession, dotted, launchNote, playerPosition, sessionDay, sessionLength,
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
});
