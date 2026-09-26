import type { SkipGroup } from './types.ts';
import type { SkippedRound } from '../../../../shared/types';

/**
 * Groups a confirmation's rounds under their championships, in the order each
 * first appears, with the weekends merely clashing gathered last under a
 * heading of their own - they are not lost, and must not read as if they were.
 * @param rounds The rounds, earliest first
 * @returns The groups
 */
export const skipGroups = (rounds: readonly SkippedRound[]): SkipGroup[] => {
  const groups = new Map<string, SkipGroup>();

  rounds.filter((round) => round.reason !== 'clash').forEach((round) => {
    const held = groups.get(round.series);
    if (held) {
      groups.set(round.series, { ...held, rounds: [...held.rounds, round] });

      return;
    }

    groups.set(round.series, { key: round.series, seriesName: round.seriesName, rounds: [round] });
  });

  const clashes = rounds.filter((round) => round.reason === 'clash');

  return [
    ...groups.values(),
    ...(clashes.length > 0 ? [{ key: 'clash', seriesName: null, rounds: clashes }] : []),
  ];
};

/**
 * How many of a confirmation's rounds are actually lost, leaving out the
 * weekends that only clash.
 * @param rounds The rounds
 * @returns How many become non-starts
 */
export const lostCount = (rounds: readonly SkippedRound[]): number => (
  rounds.filter((round) => round.reason !== 'clash').length
);
