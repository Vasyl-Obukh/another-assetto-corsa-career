import type { TFunction } from 'i18next';

import { MIN_DESCRIPTION, NAME_SEPARATORS } from './constants.ts';
import type { CircuitChampionship, CircuitPlace, StagePhoto } from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type {
  Discipline, LadderPosition, SeriesListing, Track, TrackGroup,
} from '../../../../shared/types';
import {
  isServableLayout, trackLogoUrl, trackPhotoUrl, trackPreviewUrl,
} from '../../../../shared/utils/content-url';
import { fieldSize } from '../../../../shared/utils/field-size';
import { nationOfCountry } from '../../../../shared/utils/nations';

/**
 * What a layout is called once the circuit's own name is taken off the front,
 * since the page already says which circuit it is: "Brands Hatch - GP" is "GP",
 * "Mont Tremblant (North Loop)" is "North Loop".
 * @param layout The layout
 * @param circuit The circuit's name
 * @returns The rest of the name, or the whole of it when nothing is left
 */
export const layoutShortName = (layout: Pick<Track, 'name'>, circuit: string): string => {
  if (!layout.name.toLowerCase().startsWith(circuit.toLowerCase())) return layout.name;

  let rest = layout.name.slice(circuit.length).replace(NAME_SEPARATORS, '').trim();
  // A name left wholly in brackets reads better without them.
  if (rest.startsWith('(') && rest.endsWith(')') && rest.indexOf(')') === rest.length - 1) {
    rest = rest.slice(1, -1).trim();
  }

  return rest === '' ? layout.name : rest;
};

/**
 * The layout a circuit is best known by: its longest, which is the full lap a
 * shorter layout cuts across.
 * @param circuit The circuit
 * @returns Its longest layout, or the first when none states a length
 */
export const longestLayout = (circuit: TrackGroup): Track => circuit.layouts.reduce(
  (best, layout) => ((layout.lengthM ?? 0) > (best.lengthM ?? 0) ? layout : best),
);

/**
 * A circuit's layouts longest first: the full lap leads, and the layouts cut
 * from it follow.
 * @param layouts The layouts
 * @returns A sorted copy
 */
export const longestFirst = (layouts: readonly Track[]): Track[] => [...layouts].sort(
  (a, b) => (b.lengthM ?? 0) - (a.lengthM ?? 0),
);

/**
 * Every championship racing at a circuit, with its rounds there.
 * @param trackId The circuit's folder name
 * @param listings The championships to look through, in the order to list them
 * @returns One entry per championship with a round at the circuit
 */
export const circuitChampionships = (
  trackId: string,
  listings: readonly SeriesListing[],
): CircuitChampionship[] => listings.flatMap(({ series }) => {
  const rounds = series.rounds
    .filter((round) => round.track.id === trackId)
    .map((round) => ({ name: round.name, layout: round.track.layout ?? '' }));
  const [first] = series.entries;
  if (rounds.length === 0 || first === undefined) return [];

  const ladders = new Map<string, LadderPosition>();
  for (const entry of series.entries) {
    ladders.set(`${entry.ladder.discipline}:${entry.ladder.tier}`, entry.ladder);
  }

  return [{
    id: series.id,
    name: series.name,
    discipline: first.ladder.discipline,
    ladders: [...ladders.values()].sort((a, b) => a.tier - b.tier),
    rounds,
    field: fieldSize(series),
  }];
});

/**
 * Championships gathered by the discipline they are listed under, in ladder
 * order, each discipline's own sorted by its highest rung.
 * @param championships The championships to gather
 * @returns One group per discipline holding any, in the order of the ladder
 */
export const byDiscipline = (
  championships: readonly CircuitChampionship[],
): { discipline: Discipline; championships: CircuitChampionship[] }[] => DISCIPLINES
  .map((discipline) => ({
    discipline,
    championships: championships
      .filter((championship) => championship.discipline === discipline)
      .sort((a, b) => (a.ladders[0]?.tier ?? 0) - (b.ladders[0]?.tier ?? 0)),
  }))
  .filter((group) => group.championships.length > 0);

/**
 * The championships with a round on one layout.
 * @param championships Every championship at the circuit
 * @param layout The layout's folder name
 * @returns Those racing it
 */
export const racingOn = (
  championships: readonly CircuitChampionship[],
  layout: string,
): CircuitChampionship[] => championships.filter(
  (championship) => championship.rounds.some((round) => round.layout === layout),
);

/**
 * The pictures the stage steps through: every loading-screen photograph of the
 * layouts in view, and each layout's preview where none ships any.
 *
 * Layouts that share a length and the same set of photographs are taken to be
 * one shape redistributed - GP and GP OSRW - whose copies would only repeat.
 * @param layouts The layouts in view: one, or the whole circuit
 * @returns The pictures, photographs first
 */
export const stagePhotos = (layouts: readonly Track[]): StagePhoto[] => {
  const seen = new Set<string>();
  const photos: StagePhoto[] = [];

  for (const layout of layouts) {
    const copy = `${layout.lengthM ?? ''}|${layout.photos.join(',')}`;
    if (!isServableLayout(layout.id, layout.layout) || layout.photos.length === 0 || seen.has(copy)) continue;
    seen.add(copy);

    photos.push(...layout.photos.map((photo) => ({
      key: `${layout.key}/${photo}`,
      sources: [trackPhotoUrl(layout.id, layout.layout, photo)],
      soft: false,
    })));
  }

  if (photos.length > 0) return photos;

  return layouts.filter((layout) => isServableLayout(layout.id, layout.layout)).map((layout) => ({
    key: layout.key,
    sources: [trackPreviewUrl(layout.id, layout.layout)],
    soft: true,
  }));
};

/**
 * The circuit's logo, from the first layout that ships one.
 * @param circuit The circuit
 * @returns Its URL, or null when no layout ships one
 */
export const circuitLogo = (circuit: TrackGroup): string | null => {
  const layout = circuit.layouts.find((one) => one.logo && isServableLayout(one.id, one.layout));

  return layout === undefined ? null : trackLogoUrl(layout.id, layout.layout);
};

/**
 * The first value any layout states for a field.
 * @param layouts The layouts to look through
 * @param read Reads the field off one layout
 * @returns The first stated value, or null
 */
export const firstOf = <T>(layouts: readonly Track[], read: (layout: Track) => T | null): T | null => {
  for (const layout of layouts) {
    const value = read(layout);
    if (value !== null) return value;
  }

  return null;
};

/**
 * Where a circuit is: the nation its free-text country names, and that country
 * beside the first city any layout states.
 * @param circuit The circuit
 * @param formatNation Names a nation code in the user's language
 * @param t The translation function
 * @returns Its nation and the line naming its place
 */
export const circuitPlace = (
  circuit: Pick<TrackGroup, 'country' | 'layouts'>,
  formatNation: (code: string) => string,
  t: TFunction,
): CircuitPlace => {
  const nation = nationOfCountry(circuit.country);
  const country = nation === null ? circuit.country : formatNation(nation);
  const city = firstOf(circuit.layouts, (layout) => layout.city);

  return { nation, place: country && city ? t('tracks.detail.place', { country, city }) : country ?? city };
};

/**
 * Whether a description says anything the page does not: Kunos write "Circuit
 * of Silverstone", and a line that short or that only names the circuit is
 * not worth a panel.
 * @param description The author's description
 * @param circuit The circuit's name
 * @returns True when it is worth showing
 */
export const worthReading = (description: string, circuit: string): boolean => (
  description.replaceAll(circuit, '').trim().length >= MIN_DESCRIPTION
);
