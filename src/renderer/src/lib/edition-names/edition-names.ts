import type { TFunction } from 'i18next';

/**
 * What one edition of a championship is called: its year alone for a
 * championship that runs once a year, and its half or its quarter for one that
 * runs more often - "2027", "H2 2027", "Q3 2027".
 * @param run Which edition
 * @param run.year The year its season is
 * @param run.edition Which of the season's editions, counting from zero
 * @param run.editions How many editions the championship runs a season
 * @param t The translator
 * @returns The name to show
 */
export const editionName = (
  run: { year: number; edition: number; editions: number },
  t: TFunction,
): string => {
  if (run.editions <= 1) return t('edition.year', { year: run.year });

  return t(run.editions === 2 ? 'edition.half' : 'edition.quarter', { number: run.edition + 1, year: run.year });
};
