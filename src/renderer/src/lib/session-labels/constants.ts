import type { ParseKeys } from 'i18next';

import type { SessionType } from '../../../../shared/types';

/**
 * The label for every session type, including the ones not offered - a draft
 * written by hand can still name one, and it should read as itself.
 */
export const SESSION_TYPE_LABEL: Record<SessionType, ParseKeys> = {
  practice: 'race.sessionType.practice',
  qualify: 'race.sessionType.qualify',
  race: 'race.sessionType.race',
  hotlap: 'race.sessionType.hotlap',
  timeAttack: 'race.sessionType.timeAttack',
  drift: 'race.sessionType.drift',
  drag: 'race.sessionType.drag',
};
