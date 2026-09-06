// The shipped championships, one per file, and the list of them.
//
// One file each because a championship is a document rather than a row: they
// run to a hundred lines apiece and are edited one at a time. Adding one is
// adding a file and a line here.
//
// Authored as TypeScript rather than JSON, unlike the user's own, and that
// asymmetry is the point: CarSpec.GT3_2010S and Discipline.SPORTSCAR are real
// references here, so a renamed spec is a compile error rather than a
// load-time report. Every value is still a JSON primitive, array or plain
// object, so writeSeries of any of these is a valid series file - which is
// what forking one produces.
//
// The first three run on base content alone, which is the rule the shipped
// ladder is held to: DLC and mods extend it sideways and upwards rather than
// filling a hole in it. Formula 1 2023 is the exception that proves it -
// Assetto Corsa ships no Formula 1 car at all, so the alternative was not
// shipping the format that knockout qualifying exists for.
//
// Round.eligibility - a round replacing a class's cars - is exercised by
// nothing here, deliberately: every real case is DLC or mod content, and
// inventing a base-content one would be tidiness over truth. Its first shipped
// user is the Group C championship, when DLC championships land.

import { FORMULA_1_2023 } from './formula-1-2023.ts';
import { FORMULA_ABARTH } from './formula-abarth.ts';
import { GT3_SPRINT_SERIES } from './gt3-sprint-series.ts';
import { LOTUS_CUP } from './lotus-cup.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * Every championship the app ships.
 *
 * Listed easiest first for readability alone: the order a career climbs them in
 * is derived from their tiers by loadSeriesLibrary, so adding one here never
 * means renumbering anything.
 */
export const SHIPPED_SERIES: readonly Championship[] = [
  FORMULA_ABARTH,
  LOTUS_CUP,
  GT3_SPRINT_SERIES,
  FORMULA_1_2023,
];
