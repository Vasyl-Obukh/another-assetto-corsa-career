import { M_PER_KM } from '../../../../shared/constants';
import type { Track, TrackGroup } from '../../../../shared/types';
import { isServableLayout, trackOutlineUrl, trackPreviewUrl } from '../../../../shared/utils/content-url';
import type { Units } from '@/hooks';

/**
 * Preview URLs for one layout, best first.
 * @param track The layout to illustrate - only its folder and layout are read,
 * so a round naming one serves as well as a scanned layout
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const layoutImageSources = (track: Pick<Track, 'id' | 'layout'>): string[] => (
  isServableLayout(track.id, track.layout)
    ? [trackPreviewUrl(track.id, track.layout), trackOutlineUrl(track.id, track.layout)]
    : []
);

/**
 * Map URLs for one layout, outline first.
 *
 * The reverse of layoutImageSources, and the difference is the question being
 * asked. A card illustrating a circuit wants the photograph; someone choosing
 * between seven layouts of the Nordschleife wants the shape, which is the only
 * thing that tells them apart - the photograph is the same pit straight either
 * way.
 * @param track The layout to draw
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const layoutMapSources = (track: Pick<Track, 'id' | 'layout'>): string[] => (
  [...layoutImageSources(track)].reverse()
);

/**
 * Preview URLs for a track, best first.
 *
 * Illustrated by its first layout, since AC keeps the photo per layout and any
 * of them shows the circuit.
 * @param group The track to illustrate
 * @returns Zero or more accontent:// URLs, in the order they should be tried
 */
export const trackImageSources = (group: TrackGroup): string[] => {
  const [track] = group.layouts;

  return track === undefined ? [] : layoutImageSources(track);
};

/**
 * Where a circuit is, from the first layout that knows both coordinates.
 *
 * Any located layout locates the circuit: they are the same place, and mods fill
 * the geotags in per layout, so one of them knowing is enough.
 * @param layouts The layouts to look through
 * @returns Its coordinates, or null when none is located
 */
export const coordinatesOf = (layouts: readonly Pick<Track, 'geotags'>[]): { lat: number; lon: number } | null => {
  for (const { geotags: { lat, lon } } of layouts) {
    if (lat !== null && lon !== null) return { lat, lon };
  }

  return null;
};

/**
 * Whether a track's real-world position is known, which is what CSP places the
 * sun and the weather against.
 * @param group The track to check
 * @returns True when some layout knows both coordinates
 */
export const isLocated = (group: TrackGroup): boolean => coordinatesOf(group.layouts) !== null;

/**
 * The smallest and largest of the figures a set of layouts states for one
 * field.
 *
 * A span rather than one figure because the Nordschleife ships a 3.8 km sprint
 * and a 25.4 km endurance layout under one folder, and picking either of them
 * to stand for the circuit would be a lie.
 * @param layouts The layouts to measure
 * @param read Reads the figure off one layout
 * @returns The span, or null when none states it
 */
export const spanOf = (
  layouts: readonly Track[],
  read: (layout: Track) => number | null,
): { from: number; to: number } | null => {
  const known = layouts.map(read).filter((value): value is number => value !== null);

  return known.length === 0 ? null : { from: Math.min(...known), to: Math.max(...known) };
};

/**
 * Where a layout's outline is served from.
 * @param track The layout to draw
 * @returns The outline's accontent:// URL, or null when its folder names could
 * only ever answer 400
 */
export const layoutOutline = (track: Pick<Track, 'id' | 'layout'>): string | null => (
  isServableLayout(track.id, track.layout) ? trackOutlineUrl(track.id, track.layout) : null
);

/**
 * Writes a span of figures out, as one figure when both ends read the same.
 * @param span The smallest and largest, or null when nothing is stated
 * @param format Writes one figure out
 * @returns The span as text, or null when there is none
 */
export const spanText = (
  span: { from: number; to: number } | null,
  format: (figure: number) => string,
): string | null => {
  if (span === null) return null;

  // Compared as written, so two lengths that round to the same figure read as one.
  const [from, to] = [format(span.from), format(span.to)];

  return from === to ? from : `${from}-${to}`;
};

/**
 * Writes a lap length out in the units the player reads, to one decimal place
 * and without a unit, for a figure whose unit is written beside it.
 * @param metres The distance
 * @param units The unit formatters
 * @returns The length as text
 */
export const lapLength = (metres: number, units: Pick<Units, 'figure'>): string => units.figure('distance', metres / M_PER_KM);

/**
 * A set of layouts' lap lengths in the units the player reads, without a unit:
 * one figure, or the span from the shortest to the longest.
 * @param layouts The layouts
 * @param units The unit formatters
 * @returns The lengths as text, or null when none is stated
 */
export const lengthText = (layouts: readonly Track[], units: Pick<Units, 'figure'>): string | null => (
  spanText(spanOf(layouts, (layout) => layout.lengthM), (metres) => lapLength(metres, units))
);
