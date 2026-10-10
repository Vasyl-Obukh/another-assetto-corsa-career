import type { SkipGroup } from './types.ts';
import type { SkippedRound } from '../../../../shared/types';

/**
 * Groups a confirmation's rounds under their championships, in the order each
 * first appears, with the events on the same day gathered last under a heading
 * of their own - they are lost for a different reason, and say so.
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
