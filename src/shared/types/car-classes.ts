// Racing classes and specs. A spec is a grid - the set of cars that can sensibly
// race each other - and a class is the family a spec belongs to across eras.
//
// The split is load-bearing. A 2007 GT3 car and a 2023 GT3 car follow the same
// ruleset and are nothing like each other on track, so they cannot be one spec;
// but they are both GT3, and collapsing that into era-specific classes alone
// would leave "is this a GT3 car" answerable only by parsing an ID.
//
// A championship is configured by a spec or by an explicit list of cars, never by
// a class: every spec belongs to exactly one class, so a spec already implies its
// class, and there is deliberately no way to write one that lets a 2007 car onto a
// 2023 grid.
//
// A car holds as many specs as it has grids to race on, and so belongs to as many
// classes. Modern DTM is a GT3 championship, so a BMW M4 GT3 holds a GT3 spec and
// a DTM spec at once; what it can never hold is two specs of one class, since that
// would claim it is both 2021-spec and 2025-spec DTM at the same time.
//
// A car may hold none at all. Cars that exist only for one-make racing are left
// out of the taxonomy on purpose - a championship names them directly rather than
// earning a class per model - so an empty list is a real answer here, not a gap.

/**
 * The family a spec belongs to, across every era of it.
 *
 * Grouping only - a class is never an eligibility key. It is what the browser
 * filters by at the coarse level, what the store groups cars under, and what
 * disciplines are mapped from. A car belongs to one class per spec it holds.
 */
export enum CarClass {
  FORMULA_1 = 'formula-1',
  SUPER_FORMULA = 'super-formula',
  FORMULA_2 = 'formula-2',
  FORMULA_3 = 'formula-3',
  FORMULA_4 = 'formula-4',
  FORMULA_E = 'formula-e',
  INDYCAR = 'indycar',
  LMH = 'lmh',
  LMP1 = 'lmp1',
  LMP2 = 'lmp2',
  GROUP_C = 'group-c',
  GT1 = 'gt1',
  GT2 = 'gt2',
  GT3 = 'gt3',
  GT4 = 'gt4',
  GTE = 'gte',
  N_GT = 'n-gt',
  DTM = 'dtm',
  TCR = 'tcr',
  SUPER_TOURING = 'super-touring',
  TRANS_AM = 'trans-am',
  PORSCHE_CUP = 'porsche-cup',
  SPORTS_PROTOTYPE = 'sports-prototype',
}

/**
 * One grid: the cars that can sensibly race each other.
 *
 * Sizes run from around thirty down to one, and a single-car spec is not a
 * modelling failure - it is what a season of a single-chassis series is. Specs
 * split on pace rather than on the calendar, so two mods of the same season stay
 * separate where their figures say they cannot share a grid.
 */
export enum CarSpec {
  FORMULA_1_1954 = 'formula-1-1954',
  FORMULA_1_1957 = 'formula-1-1957',
  FORMULA_1_1962 = 'formula-1-1962',
  FORMULA_1_1967 = 'formula-1-1967',
  FORMULA_1_1970 = 'formula-1-1970',
  FORMULA_1_1971 = 'formula-1-1971',
  FORMULA_1_1975 = 'formula-1-1975',
  FORMULA_1_1979 = 'formula-1-1979',
  FORMULA_1_1986 = 'formula-1-1986',
  FORMULA_1_1988 = 'formula-1-1988',
  FORMULA_1_1990 = 'formula-1-1990',
  FORMULA_1_1991 = 'formula-1-1991',
  FORMULA_1_1997 = 'formula-1-1997',
  FORMULA_1_2000 = 'formula-1-2000',
  FORMULA_1_2004 = 'formula-1-2004',
  FORMULA_1_2005 = 'formula-1-2005',
  FORMULA_1_2007 = 'formula-1-2007',
  FORMULA_1_2009 = 'formula-1-2009',
  FORMULA_1_2010 = 'formula-1-2010',
  FORMULA_1_2013 = 'formula-1-2013',
  FORMULA_1_2015 = 'formula-1-2015',
  FORMULA_1_2017 = 'formula-1-2017',
  FORMULA_1_2018 = 'formula-1-2018',
  FORMULA_1_2019 = 'formula-1-2019',
  FORMULA_1_2020 = 'formula-1-2020',
  FORMULA_1_2021 = 'formula-1-2021',
  FORMULA_1_2022_RSS = 'formula-1-2022-rss',
  FORMULA_1_2022_VRC = 'formula-1-2022-vrc',
  FORMULA_1_2023_RSS = 'formula-1-2023-rss',
  FORMULA_1_2023_VRC = 'formula-1-2023-vrc',
  FORMULA_1_2024_RSS = 'formula-1-2024-rss',
  FORMULA_1_2024_VRC = 'formula-1-2024-vrc',
  FORMULA_1_2025_RSS = 'formula-1-2025-rss',
  FORMULA_1_2025_VRC = 'formula-1-2025-vrc',
  FORMULA_1_2026_RSS = 'formula-1-2026-rss',
  FORMULA_1_2026_VRC = 'formula-1-2026-vrc',
  SUPER_FORMULA_2019 = 'super-formula-2019',
  SUPER_FORMULA_2023 = 'super-formula-2023',
  FORMULA_2_2017 = 'formula-2-2017',
  FORMULA_2_2020 = 'formula-2-2020',
  FORMULA_2_2024 = 'formula-2-2024',
  FORMULA_2_2024_VRC = 'formula-2-2024-vrc',
  FORMULA_3 = 'formula-3',
  FORMULA_4 = 'formula-4',
  FORMULA_E_GEN_2 = 'formula-e-gen-2',
  FORMULA_E_GEN_3 = 'formula-e-gen-3',
  INDYCAR_2012_ROAD = 'indycar-2012-road',
  INDYCAR_2012_OVAL = 'indycar-2012-oval',
  INDYCAR_2018_ROAD = 'indycar-2018-road',
  INDYCAR_2018_SHORT = 'indycar-2018-short',
  INDYCAR_2018_OVAL = 'indycar-2018-oval',
  INDYCAR_2020_ROAD = 'indycar-2020-road',
  INDYCAR_2020_OVAL = 'indycar-2020-oval',
  INDYCAR_2021_ROAD = 'indycar-2021-road',
  INDYCAR_2021_SHORT = 'indycar-2021-short',
  INDYCAR_2021_OVAL = 'indycar-2021-oval',
  LMH_LFM = 'lmh-lfm',
  LMH_VRC = 'lmh-vrc',
  LMH_RSS = 'lmh-rss',
  LMH_YZD = 'lmh-yzd',
  LMP1_2012 = 'lmp1-2012',
  LMP1_2014 = 'lmp1-2014',
  LMP1_2016 = 'lmp1-2016',
  LMP2_2017 = 'lmp2-2017',
  LMP2_2021 = 'lmp2-2021',
  GROUP_C = 'group-c',
  GT1_1990S = 'gt1-1990s',
  GT1_2000S = 'gt1-2000s',
  GT2 = 'gt2',
  GT3_2010S = 'gt3-2010s',
  GT3_2010S_PLUS = 'gt3-2010s-plus',
  GT3_LFM = 'gt3-lfm',
  GT3_RSS = 'gt3-rss',
  E1_XP2 = 'e1-xp2',
  SPX = 'spx',
  GT4 = 'gt4',
  GTE_2011 = 'gte-2011',
  GTE_2017 = 'gte-2017',
  GTE_2020S = 'gte-2020s',
  GTE_LOTUS = 'gte-lotus',
  N_GT = 'n-gt',
  PORSCHE_CUP_991 = 'porsche-cup-991',
  PORSCHE_CUP_992_LFM = 'porsche-cup-992-lfm',
  PORSCHE_CUP_992_URD = 'porsche-cup-992-urd',
  PORSCHE_CUP_992_GUERILLA = 'porsche-cup-992-guerilla',
  DTM_1992 = 'dtm-1992',
  DTM_2021_RSS = 'dtm-2021-rss',
  DTM_2025_LFM = 'dtm-2025-lfm',
  DTM_2025_RSS = 'dtm-2025-rss',
  TCR_2024 = 'tcr-2024',
  SUPER_TOURING_1990S = 'super-touring-1990s',
  TRANS_AM_TA2 = 'trans-am-ta2',
  SPORTS_PROTOTYPE_60S = 'sports-prototype-60s',
}

// The catalogue above is the shipped layer. The user's own sits over it,
// resolved at runtime: classes and specs of their own beside ours, and a car's
// specs restated wherever they disagree with what we ship. So a class or spec
// is addressed by a string rather than by the enum - a CarClass value, or the
// id main minted for one the user made.

/**
 * A class, addressed by id: a CarClass value, or a user class's own id.
 */
export type ClassId = string;

/**
 * A spec, addressed by id: a CarSpec value, or a user spec's own id.
 */
export type SpecId = string;

/**
 * Whether a class or spec is one the app ships or one the user made.
 */
export type ClassOrigin = 'shipped' | 'user';

/**
 * Where a car's specs came from.
 *
 * `adjusted` is a car the shipped catalogue classifies and the user restated,
 * `user` one only the user classifies - the same three words a championship's
 * origin uses, because they answer the same question about a different thing.
 */
export type ClassificationOrigin = 'shipped' | 'adjusted' | 'user';

/**
 * A class the user made.
 */
export interface UserCarClass {
  /**
   * Its id, minted by main and never changed.
   */
  id: ClassId;
  /**
   * What it is called.
   */
  name: string;
}

/**
 * A spec the user made.
 */
export interface UserCarSpec {
  /**
   * Its id, minted by main and never changed.
   */
  id: SpecId;
  /**
   * What it is called.
   */
  name: string;
  /**
   * The class it belongs to - shipped or the user's own.
   */
  class: ClassId;
}

/**
 * The user's layer over the shipped class catalogue, as written to
 * car-classes.json.
 */
export interface ClassLayer {
  /**
   * Format version. Stays 1 until the app is released.
   */
  version: number;
  /**
   * Classes the user made, in the order they were made.
   */
  classes: UserCarClass[];
  /**
   * Specs the user made, in the order they were made.
   */
  specs: UserCarSpec[];
  /**
   * Car folder ID to the specs it races in. Replaces whatever the app ships for
   * that car, and an empty list is a car deliberately left unclassified.
   */
  cars: Record<string, SpecId[]>;
}

/**
 * What a command on the user's class layer answers with.
 */
export interface ClassCommandResult {
  /**
   * The layer as it now stands.
   */
  layer: ClassLayer;
  /**
   * The class or spec the command left the user looking at, or null.
   */
  id: string | null;
}

/**
 * One class of the resolved catalogue.
 */
export interface CatalogueClass {
  /**
   * Its id.
   */
  id: ClassId;
  /**
   * What it is called.
   */
  name: string;
  /**
   * Whether the app ships it or the user made it.
   */
  origin: ClassOrigin;
  /**
   * Every spec of it, shipped ones first.
   */
  specs: readonly SpecId[];
}

/**
 * One spec of the resolved catalogue.
 */
export interface CatalogueSpec {
  /**
   * Its id.
   */
  id: SpecId;
  /**
   * What it is called.
   */
  name: string;
  /**
   * The class it belongs to.
   */
  class: ClassId;
  /**
   * Whether the app ships it or the user made it.
   */
  origin: ClassOrigin;
}

/**
 * The shipped class catalogue with the user's layer resolved over it.
 *
 * A value rather than module state, so main and the renderer each build their
 * own from the same layer and nothing reads a catalogue it was not handed.
 */
export interface ClassCatalogue {
  /**
   * Every class, the shipped ones first in catalogue order.
   */
  classes: readonly CatalogueClass[];
  /**
   * Class id to its class.
   */
  classById: ReadonlyMap<ClassId, CatalogueClass>;
  /**
   * Spec id to its spec.
   */
  specById: ReadonlyMap<SpecId, CatalogueSpec>;
  /**
   * Spec id to the car folder IDs racing in it, in the order a field draws
   * from them.
   */
  carsBySpec: ReadonlyMap<SpecId, readonly string[]>;
  /**
   * Car folder ID to the specs it races in.
   */
  specsByCar: ReadonlyMap<string, readonly SpecId[]>;
  /**
   * Car folder IDs whose specs the user restated.
   */
  overridden: ReadonlySet<string>;
}
