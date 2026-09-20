import { describe, expect, it } from '@jest/globals';

import { ContentSource, DLCPack } from '../../../shared/types/index.ts';
import {
  BASE_CARS,
  BASE_TRACKS,
  carProvenance,
  DISTRIBUTOR_CARS,
  DISTRIBUTOR_TRACKS,
  DLC_CARS,
  DLC_TRACKS,
  MOD_CARS,
  MOD_TRACKS,
  trackProvenance,
} from '../content-catalogue.ts';

// Anchors are taken from the records rather than written out, because the
// records are hand-edited data and these tests are about the lookup rules. A
// test naming ks_mazda_787b would fail the day that row moved, which would say
// nothing about the code.
const [firstBaseCar] = BASE_CARS;
const [firstBaseTrack] = BASE_TRACKS;
const [dlcCar, dlcCarPack] = Object.entries(DLC_CARS)[0];
const [dlcTrack, dlcTrackPack] = Object.entries(DLC_TRACKS)[0];
const [modCar, modCarMaker] = Object.entries(MOD_CARS)[0];
const [modTrack, modTrackMaker] = Object.entries(MOD_TRACKS)[0];
const [distributedCar, carDistributor] = Object.entries(DISTRIBUTOR_CARS)[0];

// The one track record keyed by layout rather than by track, which is the whole
// reason redistribution is a separate field.
const [distributedLayout, layoutDistributor] = Object.entries(DISTRIBUTOR_TRACKS)
  .find(([key]) => key.includes('/')) ?? [];

describe('core/content-catalogue', () => {
  describe('carProvenance', () => {
    it('reads a base car off the base list', () => {
      expect(carProvenance(firstBaseCar)).toEqual({
        source: ContentSource.BASE, pack: null, maker: null, distributor: null,
      });
    });

    it('names the pack a DLC car came from', () => {
      expect(carProvenance(dlcCar)).toMatchObject({
        source: ContentSource.DLC, pack: dlcCarPack,
      });
    });

    it('names the team behind a mod car', () => {
      expect(carProvenance(modCar)).toMatchObject({
        source: ContentSource.MOD, pack: null, maker: modCarMaker,
      });
    });

    it('reports a redistributor whatever the source is', () => {
      expect(carProvenance(distributedCar).distributor).toBe(carDistributor);
    });

    // The point of dropping folder-prefix inference: an ID in no record is a
    // mod whose author we do not know, and saying so is better than guessing.
    it('calls anything in no record a mod with nothing else known', () => {
      expect(carProvenance('who_made_this')).toEqual({
        source: ContentSource.MOD, pack: null, maker: null, distributor: null,
      });
    });

    it('does not mistake a track ID for a car', () => {
      expect(carProvenance(firstBaseTrack).source).toBe(ContentSource.MOD);
    });
  });

  describe('trackProvenance', () => {
    it('reads a base track off the base list', () => {
      expect(trackProvenance(firstBaseTrack, '')).toMatchObject({
        source: ContentSource.BASE, pack: null,
      });
    });

    // Base, DLC and maker are keyed by the track, because a pack ships a circuit
    // and every layout of it comes along.
    it('gives every layout of a DLC track the same pack', () => {
      expect(trackProvenance(dlcTrack, '').pack).toBe(dlcTrackPack);
      expect(trackProvenance(dlcTrack, 'layout_gp').pack).toBe(dlcTrackPack);
      expect(trackProvenance(dlcTrack, 'anything_at_all').pack).toBe(dlcTrackPack);
    });

    it('names the team behind a mod track, whatever the layout', () => {
      expect(trackProvenance(modTrack, 'gp').maker).toBe(modTrackMaker);
    });

    it('calls anything in no record a mod with nothing else known', () => {
      expect(trackProvenance('someones_circuit', 'gp')).toEqual({
        source: ContentSource.MOD, pack: null, maker: null, distributor: null,
      });
    });

    // LFM adds layouts to circuits it did not ship, so the redistributor is the
    // one field keyed per layout. Marking the whole track would credit LFM with
    // Kunos' Nordschleife.
    it('reports a redistributor for the layout it shipped, not its siblings', () => {
      const [id, layout] = (distributedLayout ?? '').split('/');

      expect(trackProvenance(id, layout).distributor).toBe(layoutDistributor);
      expect(trackProvenance(id, 'a_layout_nobody_redistributes').distributor).toBeNull();
    });

    it('looks a single-layout track up under its bare ID', () => {
      const bare = Object.keys(DISTRIBUTOR_TRACKS).find((key) => !key.includes('/'));

      if (bare !== undefined) {
        expect(trackProvenance(bare, '').distributor).toBe(DISTRIBUTOR_TRACKS[bare]);
      }
    });
  });

  // The one place this file names rows on purpose, against its own header. The
  // Red Pack and the Tripl3 Pack were swapped here from the first commit, and
  // the swap is invisible from the code - both are valid DLCPack members, so
  // nothing but the content tells them apart. Kunos' own dlc_ui_car.json and
  // Steam's appdetails agree: 493190 is the Red Pack and holds the Ferrari,
  // Lamborghini and Maserati cars plus the Red Bull Ring, while 509350 is the
  // Tripl3 Pack and holds three cars, which is what the name says.
  describe('DLC_CARS and DLC_TRACKS, on the two packs that were swapped', () => {
    const carsIn = (pack: DLCPack): string[] => Object.entries(DLC_CARS)
      .filter(([, value]) => value === pack)
      .map(([id]) => id)
      .sort();

    it('gives the Tripl3 Pack exactly the three cars it is named for', () => {
      expect(carsIn(DLCPack.TRIPL3_PACK))
        .toEqual(['ks_ferrari_488_gtb', 'ks_ferrari_fxx_k', 'ks_praga_r1']);
    });

    it('leaves the Ferrari, Lamborghini and Maserati cars on the Red Pack', () => {
      expect(carsIn(DLCPack.RED_PACK)).toContain('ks_ferrari_f138');
      expect(carsIn(DLCPack.RED_PACK)).toContain('ks_lamborghini_aventador_sv');
      expect(carsIn(DLCPack.RED_PACK)).toContain('ks_maserati_250f_6cyl');
    });

    it('ships the Red Bull Ring with the Red Pack, as that pack did', () => {
      expect(DLC_TRACKS.ks_red_bull_ring).toBe(DLCPack.RED_PACK);
    });
  });
});
