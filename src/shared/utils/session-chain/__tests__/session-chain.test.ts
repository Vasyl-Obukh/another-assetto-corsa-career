import { describe, expect, it } from '@jest/globals';

import type { SessionDefinition } from '../../../types/index.ts';
import { mixesClasses, runsApart, sessionChain } from '../session-chain.ts';

/**
 * A knockout run apart, then a race on its finalists: Q1, Q2 keeping ten, the race.
 * @param race What the race says beyond its link
 * @returns The sessions
 */
const knockout = (race: Partial<SessionDefinition> = {}): SessionDefinition[] => [
  { type: 'practice' },
  { id: 'q1', type: 'qualify', classes: 'apart' },
  {
    id: 'q2', type: 'qualify', classes: 'apart', inherit: { from: 'q1', top: 10 },
  },
  { type: 'race', inherit: { from: 'q2' }, ...race },
];

describe('shared/utils/session-chain', () => {
  describe('sessionChain', () => {
    it('follows the links a session names back, latest first', () => {
      expect(sessionChain(knockout(), 3)).toEqual([2, 1]);
    });

    it('falls back to every qualifying before a session that names none, latest first', () => {
      const sessions: SessionDefinition[] = [
        { type: 'qualify' }, { type: 'practice' }, { type: 'qualify' }, { type: 'race' },
      ];

      expect(sessionChain(sessions, 3)).toEqual([2, 0]);
    });

    it('drops a link that names nothing before it', () => {
      const sessions: SessionDefinition[] = [
        { type: 'race', inherit: { from: 'later' } }, { id: 'later', type: 'qualify' },
      ];

      expect(sessionChain(sessions, 0)).toEqual([]);
    });

    it('stops at a cycle a hand-edited event can hold', () => {
      const sessions: SessionDefinition[] = [
        { id: 'a', type: 'qualify', inherit: { from: 'b' } },
        { id: 'b', type: 'qualify', inherit: { from: 'a' } },
        { type: 'race', inherit: { from: 'b' } },
      ];

      expect(sessionChain(sessions, 2)).toEqual([1, 0]);
    });
  });

  describe('runsApart', () => {
    it('is true for a qualifying run apart', () => {
      expect(runsApart({ type: 'qualify', classes: 'apart' })).toBe(true);
    });

    it('is false for a qualifying run together, or one that does not say', () => {
      expect(runsApart({ type: 'qualify', classes: 'together' })).toBe(false);
      expect(runsApart({ type: 'qualify' })).toBe(false);
    });

    it('ignores the setting on anything but a qualifying', () => {
      expect(runsApart({ type: 'race', classes: 'apart' })).toBe(false);
      expect(runsApart(undefined)).toBe(false);
    });
  });

  describe('mixesClasses', () => {
    it('mixes a race that says so behind a qualifying run together', () => {
      const sessions: SessionDefinition[] = [
        { id: 'q', type: 'qualify' }, { type: 'race', inherit: { from: 'q' }, classGrid: 'mixed' },
      ];

      expect(mixesClasses(sessions, 1)).toBe(true);
    });

    it('lines a race up by class when it does not say', () => {
      const sessions: SessionDefinition[] = [{ id: 'q', type: 'qualify' }, { type: 'race', inherit: { from: 'q' } }];

      expect(mixesClasses(sessions, 1)).toBe(false);
    });

    it('lines a race up by class behind a qualifying run apart, whatever it says', () => {
      expect(mixesClasses(knockout({ classGrid: 'mixed' }), 3)).toBe(false);
    });
  });
});
