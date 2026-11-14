import type { TFunction } from 'i18next';

import { SESSION_TYPE_LABEL } from './constants.ts';
import type { SessionType } from '../../../../shared/types';
import type { Units } from '@/hooks';

/**
 * What a session is called: the name it was given, or its kind's.
 * @param session The session, or anything carrying its name and type
 * @param session.name The name it was given, when it was given one
 * @param session.type What kind of session it is
 * @param t The translator
 * @returns The name to show
 */
export const sessionName = (
  session: { name?: string | null; type: SessionType },
  t: TFunction,
): string => session.name ?? t(SESSION_TYPE_LABEL[session.type]);

/**
 * Says how long a race runs: its laps, and the distance they cover where it
 * was stated as one.
 * @param race The race's length
 * @param race.laps Its laps, or null for a distance the track cannot turn into laps
 * @param race.distance The distance it was stated as, in kilometres
 * @param t The translator
 * @param units The unit formatters, which write the distance
 * @returns The length, already translated
 */
export const raceLength = (
  race: { laps?: number | null; distance?: number },
  t: TFunction,
  units: Pick<Units, 'format'>,
): string => {
  const laps = t('championships.format.laps', { count: race.laps ?? 0 });

  return race.distance === undefined ? laps : t('championships.detail.lengthDistance', {
    distance: units.format('distance', race.distance),
    laps,
  });
};
