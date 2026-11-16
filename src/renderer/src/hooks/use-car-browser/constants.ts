import type { CarCriteria, StoredCarCriteria } from './types.ts';
import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../shared/types';
import type { CarSortKey } from '../../../../shared/types';
import { stringEnumValues } from '../../../../shared/utils/coerce';
import { BROWSER_VIEWS } from '@/lib/browser-memory';
import { SORT_DIRECTIONS } from '@/lib/stored-preference';
import type { FieldShape } from '@/lib/stored-preference';

/**
 * No filters, default sort - what the browser opens on and what Clear restores.
 */
export const EMPTY_CRITERIA: CarCriteria = {};

/**
 * How long the search box has to stay still before it costs an IPC call.
 */
export const SEARCH_DEBOUNCE_MS = 250;

/**
 * Every order the car list can be sorted in, listed as a record so a new one
 * does not compile until it is named here.
 */
const CAR_SORT_KEYS = Object.keys({
  name: true, brand: true, year: true, bhp: true, weight: true, powerToWeight: true, price: true, discount: true,
} satisfies Record<CarSortKey, true>) as CarSortKey[];

/**
 * What each filter a car browser saves has to be to be read back.
 */
export const CAR_CRITERIA_SHAPE: FieldShape<StoredCarCriteria> = {
  brands: 'strings',
  countries: 'strings',
  classes: 'strings',
  specs: 'strings',
  yearFrom: 'number',
  yearTo: 'number',
  bhpFrom: 'number',
  bhpTo: 'number',
  priceFrom: 'number',
  priceTo: 'number',
  onSale: 'boolean',
  priceOrigins: { members: ['catalogue', 'yours', 'suggested'] },
  sources: { members: stringEnumValues(ContentSource) },
  packs: { members: stringEnumValues(DLCPack) },
  makers: { members: stringEnumValues(ModMaker) },
  distributors: { members: stringEnumValues(ModDistributor) },
  sort: CAR_SORT_KEYS,
  direction: SORT_DIRECTIONS,
  raced: 'boolean',
  view: BROWSER_VIEWS,
};

/**
 * Where every car picker keeps the one thing pickers share, the layout.
 */
export const CAR_PICKER_MEMORY = 'car-picker';
