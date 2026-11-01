import type { TFunction } from 'i18next';

import type {
  SponsorGoal, SponsorPerk, SponsorTarget, SponsorTerms,
} from '../../../../shared/types';
import { sponsorFigure } from '../../../../shared/utils/sponsors';
import type { GoalStanding } from '../../../../shared/utils/sponsors';

/**
 * What a share of a class or of a deal's races is called.
 * @param share The share, from 0 to 1
 * @returns The wording key under `sponsors.share`
 */
export const shareKey = (share: number): 'half' | 'third' | 'quarter' | 'threeQuarters' => {
  if (share > 0.6) return 'threeQuarters';
  if (share > 0.4) return 'half';
  if (share > 0.3) return 'third';

  return 'quarter';
};

/**
 * What a deal's race pay is paid for, off its target.
 * @param target The target
 * @param t The translator
 * @returns The condition, as a phrase
 */
const raceCondition = (target: SponsorTarget, t: TFunction): string => t(`sponsors.perk.race.${target.kind}`, {
  share: t(`sponsors.share.${shareKey(target.share ?? 1)}`),
  count: target.cuts ?? 0,
});

/**
 * One perk as a price and its condition, or as a signature's one line.
 * @param terms The deal or offer it belongs to
 * @param perk The perk
 * @param scale What its figures are multiplied by now
 * @param t The translator
 * @param formatMoney Formats an amount
 * @returns The price, empty for a signature, and the condition
 */
export const perkPair = (
  terms: Pick<SponsorTerms, 'target'>,
  perk: SponsorPerk,
  scale: number,
  t: TFunction,
  formatMoney: (amount: number) => string,
): { price: string; condition: string; signature: boolean } => {
  const money = (amount: number | undefined): string => formatMoney(sponsorFigure(amount ?? 0, scale));
  switch (perk.kind) {
    case 'championship':
      return { price: '', condition: t('sponsors.perk.championship', { series: perk.seriesName ?? '' }), signature: true };
    case 'climbs':
      return { price: '', condition: t('sponsors.perk.climbs'), signature: true };
    case 'carBacking':
      return { price: '', condition: t('sponsors.perk.carBacking'), signature: true };
    case 'racePay':
      return { price: money(perk.amount), condition: raceCondition(terms.target, t), signature: false };
    case 'prizeMatch':
      return { price: `${perk.share ?? 0}%`, condition: t('sponsors.perk.prizeMatch'), signature: false };
    default:
      return { price: money(perk.amount), condition: t(`sponsors.perk.${perk.kind}`), signature: false };
  }
};

/**
 * What a deal's goal asks.
 * @param goal The goal
 * @param t The translator
 * @returns It, as a line
 */
export const goalText = (goal: SponsorGoal, t: TFunction): string => {
  switch (goal.kind) {
    case 'championshipPlace':
      return goal.count === undefined
        ? t('sponsors.goal.placeShare', { share: t(`sponsors.share.${shareKey(goal.share ?? 1)}`) })
        : t('sponsors.goal.place', { count: goal.count });
    case 'resultCount':
      return t(`sponsors.goal.${goal.result ?? 'podium'}`, { count: goal.count ?? 1 });
    case 'onTarget':
      return t('sponsors.goal.onTarget', { share: t(`sponsors.share.${shareKey(goal.share ?? 1)}`) });
    default:
      return t('sponsors.goal.races', { count: goal.count ?? 1 });
  }
};

/**
 * How far a deal's goal has got, as a line.
 * @param goal The goal
 * @param standing Where it stands
 * @param t The translator
 * @returns It, as a line
 */
export const goalProgress = (goal: SponsorGoal, standing: GoalStanding, t: TFunction): string => {
  if (standing.onCourse === null) return t('sponsors.progress.none');
  if (goal.kind === 'championshipPlace') return t('sponsors.progress.place', { place: standing.reached });
  if (goal.kind === 'onTarget') return t('sponsors.progress.share', { percent: Math.round(standing.reached * 100) });

  return t('sponsors.progress.count', { reached: standing.reached, needed: standing.needed });
};
