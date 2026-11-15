// Filtering, sorting and paging over scanned content. The queries cross the IPC
// boundary, so a browser screen asks main for one page rather than holding a
// copy of a mod library that runs to thousands of entries.

import type { ClassId, SpecId } from './car-classes.ts';
import type { PriceOrigin } from './car-prices.ts';
import type {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from './content.ts';

/**
 * A page of results, plus how many matched before paging.
 */
export interface Page<T> {
  /**
   * The entries on this page.
   */
  items: T[];
  /**
   * How many entries matched the query in total, ignoring offset and limit.
   */
  total: number;
  /**
   * Where this page started.
   */
  offset: number;
  /**
   * How many were returned at most; clamped by the handler, not by the caller.
   */
  limit: number;
}

/**
 * Which direction a sort runs in.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * One value of a facet, and how many entries carry it.
 */
export interface Facet {
  /**
   * The value itself, as written in the mod's metadata.
   */
  value: string;
  /**
   * How many entries carry it.
   */
  count: number;
}

/**
 * How a number is spread across the library, for the bars a range filter draws
 * under its slider.
 */
export interface Spread {
  /**
   * The lowest value anything installed has, which is where the slider starts.
   */
  min: number;
  /**
   * The highest value anything installed has, which is where the slider ends.
   */
  max: number;
  /**
   * How many entries fall in each of SPREAD_BINS equal slices of min to max,
   * counted against every other filter but the range's own.
   */
  counts: number[];
}

/**
 * What a car list can be sorted by.
 */
export type CarSortKey = 'name' | 'brand' | 'year' | 'bhp' | 'weight' | 'powerToWeight' | 'price' | 'discount';

/**
 * A filtered, searched, sorted and paged request for cars.
 *
 * Values within one filter are OR'd; separate filters are AND'd. The four
 * provenance lists - sources, packs, makers, distributors - count as one filter
 * between them, and so do classes and specs, since the browser shows each set
 * as one tree. Every field is
 * optional, so an empty object means "everything, default sort, first page".
 */
/**
 * What a career can pay for a car: what it holds, and what a sponsor's backing
 * takes off the cars it covers.
 */
export interface CarPayable {
  /**
   * What the career holds.
   */
  money: number;
  /**
   * The share a sponsor can pay, as a percentage.
   */
  share: number;
  /**
   * The cars it can pay that share of, by folder ID.
   */
  models: readonly string[];
}

export interface CarQuery {
  /**
   * Ask about the anonymous mods the catalogue does not name, instead of the
   * library.
   *
   * A choice of collection rather than a filter, so the content store answers it
   * and content-query never sees it. Covers every uncatalogued car whether or
   * not the user has added it, which is what lets the page that adds them take
   * one back out again.
   */
  anonymous?: boolean;
  /**
   * Free text. Every whitespace-separated term must match the name, brand or
   * folder ID. Deliberately not the mod author's own tags: they are free text
   * nothing else reads, so matching them surfaced cars for words never shown.
   */
  search?: string;
  /**
   * Keep only these exact cars, by folder ID.
   *
   * What a championship's car picker restricts itself to, where `specs` covers
   * the other half of the same question. An empty array is deliberately not a
   * filter, matching every other list here - so never send one derived from an
   * eligibility rule that resolved to nothing, or the picker offers the whole
   * library instead of nothing.
   */
  ids?: string[];
  /**
   * Keep only cars of these brands.
   */
  brands?: string[];
  /**
   * Keep only cars from these countries of origin, as nation codes - the
   * country a mod writes is free text, so it is read through nationOfCountry
   * and a car whose country names no nation matches none of them.
   */
  countries?: string[];
  /**
   * Keep only cars in these classes - the coarse family, across every era of it.
   */
  classes?: ClassId[];
  /**
   * Keep only cars racing in these specs.
   */
  specs?: SpecId[];
  /**
   * Earliest model year, inclusive. Cars with no year are excluded when set.
   */
  yearFrom?: number;
  /**
   * Latest model year, inclusive. Cars with no year are excluded when set.
   */
  yearTo?: number;
  /**
   * Minimum power in bhp, inclusive. Cars with no parsed power are excluded
   * when set.
   */
  bhpFrom?: number;
  /**
   * Maximum power in bhp, inclusive. Cars with no parsed power are excluded
   * when set.
   */
  bhpTo?: number;
  /**
   * Lowest price, inclusive.
   */
  priceFrom?: number;
  /**
   * Highest price, inclusive.
   */
  priceTo?: number;
  /**
   * Keep only cars a career can pay for.
   */
  payable?: CarPayable;
  /**
   * What a career's sale takes off each car this week, as a whole percentage,
   * by folder ID. Every price the query reads - its sort, its filter, what a
   * career can pay - is the price after it.
   */
  sale?: Record<string, number>;
  /**
   * Keep only cars on sale, as `sale` names them.
   */
  onSale?: boolean;
  /**
   * Leave these cars out, by folder ID - the Deal of the week while the Store
   * shows it above the list.
   */
  except?: string[];
  /**
   * Keep only cars priced this way. Only a car the user added is ever priced
   * by them or suggested; one they have not added is neither.
   */
  priceOrigins?: PriceOrigin[];
  /**
   * Keep only cars from these sources - base game, DLC or mod.
   */
  sources?: ContentSource[];
  /**
   * Keep only cars from these DLC packs.
   */
  packs?: DLCPack[];
  /**
   * Keep only cars from these mod makers.
   */
  makers?: ModMaker[];
  /**
   * Keep only cars redistributed by one of these.
   */
  distributors?: ModDistributor[];
  /**
   * What to sort by. Defaults to name.
   */
  sort?: CarSortKey;
  /**
   * Which way to sort. Defaults to ascending.
   */
  direction?: SortDirection;
  /**
   * Where to start. Defaults to 0.
   */
  offset?: number;
  /**
   * How many to return. Defaults to 50 and is clamped to 500.
   */
  limit?: number;
}

/**
 * What a track list can be sorted by.
 */
export type TrackSortKey = 'name' | 'country' | 'length' | 'pitboxes';

/**
 * A filtered, searched, sorted and paged request for tracks.
 *
 * Every filter is tested against a layout, and a track matches when any of its
 * layouts does - so this reads as a layout query and answers with tracks.
 */
export interface TrackQuery {
  /**
   * Ask about the anonymous mods the catalogue does not name, instead of the
   * library. Judged per layout, like every other track filter, so a circuit
   * holding LFM layouts comes back with only the layouts nobody claims.
   */
  anonymous?: boolean;
  /**
   * Ask about every track installed, in the library or not - what a
   * recommended layout is chosen from.
   */
  everything?: boolean;
  /**
   * Free text. Every whitespace-separated term must match the name, folder ID
   * or country.
   */
  search?: string;
  /**
   * Keep only these tracks, by folder ID. An empty array is not a filter, as
   * with CarQuery's.
   */
  ids?: string[];
  /**
   * Keep only tracks in these countries, as nation codes read the way
   * CarQuery's are.
   */
  countries?: string[];
  /**
   * Shortest lap, in metres, inclusive. Layouts with no stated length are
   * excluded when set.
   */
  lengthFrom?: number;
  /**
   * Longest lap, in metres, inclusive. Layouts with no stated length are
   * excluded when set.
   */
  lengthTo?: number;
  /**
   * Minimum grid capacity, inclusive. Tracks with no pitbox count are excluded
   * when set.
   */
  pitboxesFrom?: number;
  /**
   * Maximum grid capacity, inclusive. Tracks with no pitbox count are excluded
   * when set.
   */
  pitboxesTo?: number;
  /**
   * Keep only tracks from these sources - base game, DLC or mod.
   */
  sources?: ContentSource[];
  /**
   * Keep only tracks from these DLC packs.
   */
  packs?: DLCPack[];
  /**
   * Keep only tracks from these mod makers.
   */
  makers?: ModMaker[];
  /**
   * Keep only tracks redistributed by one of these.
   */
  distributors?: ModDistributor[];
  /**
   * Keep only tracks whose real-world position is known.
   */
  hasGeotags?: boolean;
  /**
   * What to sort by. Defaults to name.
   */
  sort?: TrackSortKey;
  /**
   * Which way to sort. Defaults to ascending.
   */
  direction?: SortDirection;
  /**
   * Where to start. Defaults to 0.
   */
  offset?: number;
  /**
   * How many to return. Defaults to 50 and is clamped to 500.
   */
  limit?: number;
}

/**
 * Every facet a car browser offers, with counts.
 *
 * Counts drill down: each dimension is counted against the search and every
 * other filter but not its own, so ticking a brand does not empty the brand
 * list. Null values are absent rather than collected into a synthetic bucket -
 * naming one would be a UI decision made in the wrong layer.
 */
export interface CarFacets {
  /**
   * Manufacturers, by descending count then name.
   */
  brands: Facet[];
  /**
   * Countries of origin as nation codes, by descending count then code.
   */
  countries: Facet[];
  /**
   * Classes, by descending count then name. Cars the catalogue does not name
   * are absent rather than collected into a bucket, the same as any null value.
   */
  classes: Facet[];
  /**
   * Specs, by descending count then name.
   */
  specs: Facet[];
  /**
   * Where the car came from, by descending count then name.
   */
  sources: Facet[];
  /**
   * DLC packs, by descending count then name. Empty when nothing is DLC.
   */
  packs: Facet[];
  /**
   * Mod makers, by descending count then name. Anonymous mods are absent
   * rather than collected into a bucket, the same as any other null value.
   */
  makers: Facet[];
  /**
   * Redistributors, by descending count then name.
   */
  distributors: Facet[];
  /**
   * How model years are spread, or null when no car states one.
   */
  years: Spread | null;
  /**
   * How power in bhp is spread, or null when no car states it.
   */
  power: Spread | null;
  /**
   * How many of the cars the user added carry a price of theirs and how many
   * a suggestion.
   */
  priceOrigins: Facet[];
  /**
   * How prices are spread, over their base-10 logarithm, or null when there
   * are no cars - prices run from thousands to tens of millions, which only a
   * logarithmic slider can take.
   */
  prices: Spread | null;
}

/**
 * Every facet a track browser offers, with counts.
 */
export interface TrackFacets {
  /**
   * Countries as nation codes, by descending count then code.
   */
  countries: Facet[];
  /**
   * Where the track came from, by descending count then name.
   */
  sources: Facet[];
  /**
   * DLC packs, by descending count then name. Empty when nothing is DLC.
   */
  packs: Facet[];
  /**
   * Mod makers, by descending count then name. Anonymous mods are absent
   * rather than collected into a bucket, the same as any other null value.
   */
  makers: Facet[];
  /**
   * Redistributors, by descending count then name.
   */
  distributors: Facet[];
  /**
   * How lap lengths in metres are spread over layouts, or null when none
   * states one.
   */
  length: Spread | null;
  /**
   * How pit box counts are spread over layouts, or null when none states one.
   */
  pitboxes: Spread | null;
}
