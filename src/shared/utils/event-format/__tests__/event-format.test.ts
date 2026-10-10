import { describe, expect, it } from '@jest/globals';

import type { Championship, EventFormat, Round } from '../../../types/index.ts';
import { defaultFormatOf, formatOf } from '../event-format.ts';

const sprint = { id: 'sprint', name: 'Sprint', sessions: [] } as unknown as EventFormat;
const feature = { id: 'feature', name: 'Feature', sessions: [] } as unknown as EventFormat;

/**
 * A championship holding the two formats, with the default given.
 * @param defaultEventFormat The id it runs unless a round says otherwise
 * @returns The championship
 */
const series = (defaultEventFormat: string): Championship => ({
  eventFormats: [sprint, feature], defaultEventFormat,
}) as unknown as Championship;

describe('shared/utils/event-format', () => {
  describe('formatOf', () => {
    it('runs a round over the format it names', () => {
      expect(formatOf(series('sprint'), { eventFormat: 'feature' } as Round)).toBe(feature);
    });

    it('falls back to the championship\'s default for a round naming none', () => {
      expect(formatOf(series('sprint'), {} as Round)).toBe(sprint);
    });

    it('is null for a round naming a format that does not exist, rather than the default', () => {
      expect(formatOf(series('sprint'), { eventFormat: 'gone' } as Round)).toBeNull();
    });

    it('is null when a round names none and the default does not resolve', () => {
      expect(formatOf(series('gone'), {} as Round)).toBeNull();
    });
  });

  describe('defaultFormatOf', () => {
    it('is the format the championship names as its default', () => {
      expect(defaultFormatOf(series('feature'))).toBe(feature);
    });

    it('is null when the default does not resolve', () => {
      expect(defaultFormatOf(series('gone'))).toBeNull();
    });
  });
});
