import type { Career } from '../../../../shared/types';
import { withStrength } from '../../../../shared/utils/ai-figure';

/**
 * A career with the player's step on the AI's strength replaced for an edition
 * of its current season, as main will keep it - for showing before it answers.
 * @param career The career
 * @param series The championship's id
 * @param edition Which of the season's editions
 * @param strength The step, zero for none
 * @returns The career with the step replaced, or as it was when it is not in
 * that edition
 */
export const withSeasonStrength = (
  career: Career,
  series: string,
  edition: number,
  strength: number,
): Career => {
  const last = career.seasons.length - 1;

  return {
    ...career,
    seasons: career.seasons.map((season, at) => (at === last ? {
      ...season,
      entries: season.entries.map((one) => (
        one.series === series && one.edition === edition && !one.withdrawn
          ? withStrength(one, strength === 0 ? undefined : strength)
          : one
      )),
    } : season)),
  };
};
