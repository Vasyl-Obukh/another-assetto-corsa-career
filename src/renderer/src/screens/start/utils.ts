import type { AppMode } from '@/lib/accents';

/**
 * Which mode was played last, whose photograph the start screen shows.
 * @param playedAt When each mode was last played, as an ISO timestamp, or
 * undefined for one never played
 * @returns The mode, or null when none has been
 */
export const lastPlayedMode = (playedAt: Readonly<Record<AppMode, string | undefined>>): AppMode | null => {
  let lead: AppMode | null = null;
  (Object.keys(playedAt) as AppMode[]).forEach((mode) => {
    const at = playedAt[mode];
    if (at !== undefined && (lead === null || at > (playedAt[lead] ?? ''))) lead = mode;
  });

  return lead;
};
