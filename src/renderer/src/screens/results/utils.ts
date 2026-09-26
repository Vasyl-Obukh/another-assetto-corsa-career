import { ALL_CHAMPIONSHIPS, NO_CHAMPIONSHIP } from './constants.ts';
import type { ResultsCriteria } from './types.ts';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import type { ResultWeekend } from '@/lib/result-weekends';

/**
 * The weekends the Results page shows, each with only the sessions of the kind
 * asked for - and none left with nothing to show.
 * @param weekends Every weekend, newest first
 * @param criteria What the page narrows by
 * @returns The weekends kept, in the same order
 */
export const filterWeekends = (
  weekends: readonly ResultWeekend[],
  criteria: ResultsCriteria,
): ResultWeekend[] => {
  const terms = searchTerms(criteria.search);

  return weekends.flatMap((weekend) => {
    const series = weekend.origin?.entry.series ?? NO_CHAMPIONSHIP;
    if (criteria.championship !== ALL_CHAMPIONSHIPS && criteria.championship !== series) return [];

    const round = weekend.origin?.entry.championship.rounds.find((one) => one.id === weekend.origin?.round);
    const haystacks = [
      weekend.origin?.entry.championship.name ?? null,
      round?.name ?? null,
      weekend.title,
      weekend.sessions[0]?.record.layout?.name ?? null,
      weekend.sessions[0]?.record.summary.track ?? null,
    ];
    if (!matchesTerms(terms, haystacks)) return [];

    const sessions = criteria.kind === 'all'
      ? weekend.sessions
      : weekend.sessions.filter((one) => one.type === criteria.kind);

    return sessions.length === 0 ? [] : [{ ...weekend, sessions }];
  });
};
