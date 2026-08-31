import { useTranslation } from 'react-i18next';

import { TRACK_STATE_LABEL, WEATHER_TYPE_LABEL } from './constants.ts';
import { conditionsSummary } from './utils.ts';
import type { Conditions } from '../../../../shared/types';

interface ConditionsSummaryLineProps {
  /**
   * The conditions to describe.
   */
  conditions: Conditions;
}

/**
 * One line saying what a set of conditions runs in, for a card that no longer
 * shows the fields themselves.
 *
 * The parts come from `conditionsSummary`, which is pure and knows nothing about
 * translation; joining and naming them is this component's whole job.
 */
export const ConditionsSummaryLine = ({ conditions }: ConditionsSummaryLineProps) => {
  const { t } = useTranslation();
  const summary = conditionsSummary(conditions);

  const parts = [
    summary.slots === null ? null : t('race.conditions.summarySlots', { count: summary.slots }),
    summary.weather === null ? null : t(WEATHER_TYPE_LABEL[summary.weather]),
    summary.preset,
    summary.timeOfDay,
    summary.ambient === null
      ? null
      : t('race.conditions.summaryAmbient', { value: summary.ambient }),
    summary.trackState === null ? null : t(TRACK_STATE_LABEL[summary.trackState]),
  ].filter((part): part is string => Boolean(part));

  return (
    <p className="min-w-0 text-sm text-muted-foreground">
      {parts.length > 0 ? parts.join(' · ') : t('race.conditions.summaryNothing')}
    </p>
  );
};
