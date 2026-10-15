import type { ChampionshipCriteria, ChampionshipSortKey } from '@/hooks';

/**
 * What clicking a sortable column heading sorts by: the same column turned the
 * other way, or another column from its start.
 * @param criteria The list's filters and sort now
 * @param sort The column clicked
 * @returns The criteria with the new sort
 */
export const nextSort = (criteria: ChampionshipCriteria, sort: ChampionshipSortKey): ChampionshipCriteria => {
  if (criteria.sort !== sort) return { ...criteria, sort, direction: 'asc' };

  return { ...criteria, direction: criteria.direction === 'asc' ? 'desc' : 'asc' };
};
