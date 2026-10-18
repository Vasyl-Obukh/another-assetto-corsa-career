// A career's own settings: read tolerantly out of career.json, and laid over
// the app's. Shared because main lowers and launches a career's events on them
// and the renderer shows the figures they come to.

import { DEFAULT_CAREER_SETTINGS, HISTORIC_FREQUENCIES } from '../../constants/index.ts';
import type {
  AiBase, CareerSettings, DrivingAids, Settings,
} from '../../types/index.ts';
import { isRecord } from '../coerce/index.ts';
import { oneOf, readDrivingAids, readOpponents } from '../settings/index.ts';

/**
 * Reads a career's settings, field by field, the way settings.json is read: a
 * career's settings are settings, and one that does not read falls back to the
 * default rather than taking the career with it.
 * @param raw The value read from career.json, or a patch merged over it
 * @returns The settings, every field valid
 */
export const readCareerSettings = (raw: unknown): CareerSettings => {
  if (!isRecord(raw)) return { ...DEFAULT_CAREER_SETTINGS };

  return {
    opponents: isRecord(raw.opponents) ? readOpponents(raw.opponents) : null,
    drivingAids: isRecord(raw.drivingAids) ? readDrivingAids(raw.drivingAids) : null,
    allowSameDayEvents: typeof raw.allowSameDayEvents === 'boolean'
      ? raw.allowSameDayEvents
      : DEFAULT_CAREER_SETTINGS.allowSameDayEvents,
    historicFrequency: oneOf(raw.historicFrequency, HISTORIC_FREQUENCIES, DEFAULT_CAREER_SETTINGS.historicFrequency),
  };
};

/**
 * The opponents a career races: its own, or the app's while it follows them.
 * @param settings The app's settings
 * @param career The career's own settings, or null outside a career
 * @returns The AI's strength and aggression before any championship moves them
 */
export const careerOpponents = (settings: Settings, career: CareerSettings | null): AiBase => (
  career?.opponents ?? settings.opponents
);

/**
 * The driving aids a career races with: its own, or the app's while it follows
 * them.
 * @param settings The app's settings
 * @param career The career's own settings, or null outside a career
 * @returns The aids
 */
export const careerDrivingAids = (settings: Settings, career: CareerSettings | null): DrivingAids => (
  career?.drivingAids ?? settings.drivingAids
);
