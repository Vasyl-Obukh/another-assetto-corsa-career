import { describe, expect, it } from '@jest/globals';

import { path } from '../../routes/index.ts';
import { SERIES_CHANNELS } from '../constants.ts';
import { editorPath, managePath, newPath } from '../series-kind.ts';

describe('renderer/lib/series-kind/series-kind', () => {
  describe('managePath', () => {
    it('opens a championship on the settings tab that manages championships', () => {
      expect(managePath('series', 'lotus-cup')).toBe(path.settingsChampionship({ id: 'lotus-cup' }));
    });

    it('opens a historic event on the settings tab that manages historic events', () => {
      expect(managePath('historic', 'british-gp-1967')).toBe(path.settingsHistoricEvent({ id: 'british-gp-1967' }));
    });
  });

  describe('editorPath', () => {
    it('edits a championship in the championship editor', () => {
      expect(editorPath('series', 'lotus-cup')).toBe(path.championshipEdit({ id: 'lotus-cup' }));
    });

    it('edits a historic event at its own editor route', () => {
      expect(editorPath('historic', 'british-gp-1967')).toBe(path.historicEdit({ id: 'british-gp-1967' }));
    });
  });

  describe('newPath', () => {
    it('starts a new championship or a new historic event, each at its own route', () => {
      expect(newPath('series')).toBe(path.championshipNew());
      expect(newPath('historic')).toBe(path.historicNew());
    });
  });

  describe('SERIES_CHANNELS', () => {
    // A historic event read or written over a series channel would land in the
    // championship library, so every channel has to carry its own library's prefix.
    it('reads and writes each library over channels of its own', () => {
      Object.values(SERIES_CHANNELS.series).forEach((channel) => expect(channel.startsWith('series:')).toBe(true));
      Object.values(SERIES_CHANNELS.historic).forEach((channel) => expect(channel.startsWith('historic:')).toBe(true));
    });

    it('offers the historic events every command the championships have', () => {
      expect(Object.keys(SERIES_CHANNELS.historic).sort()).toEqual(Object.keys(SERIES_CHANNELS.series).sort());
    });

    it('names each command alike in both libraries', () => {
      (Object.keys(SERIES_CHANNELS.series) as (keyof typeof SERIES_CHANNELS.series)[]).forEach((command) => {
        expect(SERIES_CHANNELS.historic[command].replace(/^historic:/, ''))
          .toBe(SERIES_CHANNELS.series[command].replace(/^series:/, ''));
      });
    });
  });
});
