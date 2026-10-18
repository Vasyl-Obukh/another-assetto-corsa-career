import type { SkipGroup } from './types.ts';
import type { SeasonEntry, SkippedRound } from '../../../../shared/types';

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

/**
 * Whether skipping rounds leaves a standalone championship nothing to race,
 * which is when its season is over.
 * @param entry The edition it races, or null outside one
 * @param rounds The rounds being skipped
 * @returns True when every round still to run is among them
 */
export const finishesSeason = (entry: SeasonEntry | null, rounds: readonly SkippedRound[]): boolean => (
  entry !== null && entry.events.every((event) => event.status !== 'scheduled' || rounds.some((one) => (
    one.series === entry.series && one.edition === entry.edition && one.round === event.round
  )))
);
