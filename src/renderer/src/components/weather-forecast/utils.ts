import type { SessionForecast } from '../../../../shared/types';

/**
 * A forecast's sessions gathered under the day each runs on.
 * @param sessions The sessions, in format order
 * @returns One group per day that holds a session, in day order
 */
export const forecastDays = (
  sessions: readonly SessionForecast[],
): { day: number; sessions: SessionForecast[] }[] => {
  const days = new Map<number, SessionForecast[]>();
  sessions.forEach((session) => {
    days.set(session.day, [...(days.get(session.day) ?? []), session]);
  });

  return [...days]
    .sort(([a], [b]) => a - b)
    .map(([day, held]) => ({ day, sessions: held }));
};
