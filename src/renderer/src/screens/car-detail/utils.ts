import { CHART_DIVISIONS, NICE_STEPS, RPM_LABEL_STEP } from './constants.ts';
import type { CarChampionship, ChartAxis } from './types.ts';
import type {
  ClassCatalogue, CurvePoint, SeriesListing,
} from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';

/**
 * Every championship that races a car, with the classes of it the car may
 * enter.
 * @param carId Folder name of the car
 * @param listings The championships to look through, in the order to list them
 * @param catalogue The class catalogue a spec's cars are read from
 * @returns One entry per championship fielding the car
 */
export const carChampionships = (
  carId: string,
  listings: readonly SeriesListing[],
  catalogue: ClassCatalogue,
): CarChampionship[] => listings.flatMap(({ series }) => {
  const entries = series.entries.filter((entry) => fieldableCars(series, entry, catalogue).has(carId));

  return entries.length === 0 ? [] : [{ id: series.id, name: series.name, entries }];
});

/**
 * An axis for a curve, topped at the next round figure above its peak.
 * @param points The curve
 * @returns Its axis, or null for an empty curve
 */
export const curveAxis = (points: readonly CurvePoint[]): ChartAxis | null => {
  const peak = Math.max(0, ...points.map(([, value]) => value));
  if (peak === 0) return null;

  const scale = 10 ** Math.floor(Math.log10(peak / CHART_DIVISIONS));
  const step = (NICE_STEPS.find((nice) => nice * scale * CHART_DIVISIONS >= peak) ?? NICE_STEPS[NICE_STEPS.length - 1])
    * scale;

  return {
    max: step * CHART_DIVISIONS,
    ticks: Array.from({ length: CHART_DIVISIONS + 1 }, (unused, index) => step * index),
  };
};

/**
 * The engine speeds the chart labels, every thousand rpm across the range.
 * @param from The lowest engine speed drawn
 * @param to The highest
 * @returns The labelled speeds, in order
 */
export const rpmTicks = (from: number, to: number): number[] => {
  const ticks: number[] = [];
  for (let rpm = Math.ceil(from / RPM_LABEL_STEP) * RPM_LABEL_STEP; rpm <= to; rpm += RPM_LABEL_STEP) {
    ticks.push(rpm);
  }

  return ticks;
};

/**
 * The SVG path through a curve.
 * @param points The curve
 * @param x Where an engine speed lands across the chart
 * @param y Where a value lands down it
 * @returns The path's `d` attribute
 */
export const curvePath = (
  points: readonly CurvePoint[],
  x: (rpm: number) => number,
  y: (value: number) => number,
): string => points
  .map(([rpm, value], index) => `${index === 0 ? 'M' : 'L'}${x(rpm).toFixed(1)},${y(value).toFixed(1)}`)
  .join('');
