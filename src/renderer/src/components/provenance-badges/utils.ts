import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../shared/types';

// Two labels for the same thing, deliberately. A badge on a card has room for
// "RSS" and has to stay a chip; a filter list has room for "Race Sim Studio" and
// has to be unambiguous to someone who does not know the abbreviation.
//
// Every map is keyed by enum member, so adding a pack or a maker is a typecheck
// failure here until it has both labels.

/**
 * The i18n key for each content source, as a filter option.
 */
const SOURCE_KEYS = {
  [ContentSource.BASE]: 'content.source.base',
  [ContentSource.DLC]: 'content.source.dlc',
  [ContentSource.MOD]: 'content.source.mod',
} as const satisfies Record<ContentSource, string>;

/**
 * The i18n key for each content source, as a badge.
 */
const SOURCE_TAG_KEYS = {
  [ContentSource.BASE]: 'content.sourceTag.base',
  [ContentSource.DLC]: 'content.sourceTag.dlc',
  [ContentSource.MOD]: 'content.sourceTag.mod',
} as const satisfies Record<ContentSource, string>;

/**
 * The i18n key for each DLC pack. Badges reuse these through PACK_TAG_KEY.
 */
const PACK_KEYS = {
  [DLCPack.DREAM_PACK_1]: 'content.pack.dream-pack-1',
  [DLCPack.DREAM_PACK_2]: 'content.pack.dream-pack-2',
  [DLCPack.DREAM_PACK_3]: 'content.pack.dream-pack-3',
  [DLCPack.JAPANESE_PACK]: 'content.pack.japanese-pack',
  [DLCPack.TRIPL3_PACK]: 'content.pack.tripl3-pack',
  [DLCPack.RED_PACK]: 'content.pack.red-pack',
  [DLCPack.PORSCHE_PACK_1]: 'content.pack.porsche-pack-1',
  [DLCPack.PORSCHE_PACK_2]: 'content.pack.porsche-pack-2',
  [DLCPack.PORSCHE_PACK_3]: 'content.pack.porsche-pack-3',
  [DLCPack.READY_TO_RACE]: 'content.pack.ready-to-race',
  [DLCPack.FERRARI_70TH]: 'content.pack.ferrari-70th',
} as const satisfies Record<DLCPack, string>;

/**
 * The i18n key for each mod maker, as a filter option.
 */
const MAKER_KEYS = {
  [ModMaker.GUERILLA]: 'content.maker.guerilla',
  [ModMaker.RSS]: 'content.maker.rss',
  [ModMaker.URD]: 'content.maker.urd',
  [ModMaker.VRC]: 'content.maker.vrc',
  [ModMaker.YEZHROD]: 'content.maker.yezhrod',
} as const satisfies Record<ModMaker, string>;

/**
 * The i18n key for each mod maker, as a badge.
 */
const MAKER_TAG_KEYS = {
  [ModMaker.GUERILLA]: 'content.makerTag.guerilla',
  [ModMaker.RSS]: 'content.makerTag.rss',
  [ModMaker.URD]: 'content.makerTag.urd',
  [ModMaker.VRC]: 'content.makerTag.vrc',
  [ModMaker.YEZHROD]: 'content.makerTag.yezhrod',
} as const satisfies Record<ModMaker, string>;

/**
 * The i18n key for each redistributor, as a filter option.
 */
const DISTRIBUTOR_KEYS = {
  [ModDistributor.LFM]: 'content.distributor.lfm',
} as const satisfies Record<ModDistributor, string>;

/**
 * The i18n key for each redistributor, as a badge.
 */
const DISTRIBUTOR_TAG_KEYS = {
  [ModDistributor.LFM]: 'content.distributorTag.lfm',
} as const satisfies Record<ModDistributor, string>;

/**
 * The badge template for DLC, which names the pack inside it: "DLC - Dream Pack 1".
 *
 * A template rather than a second key per pack, so adding a pack means adding
 * one name and not two.
 */
export const PACK_TAG_KEY = 'content.packTag';

/**
 * Any key naming a value in a filter list.
 */
export type ProvenanceLabelKey =
  | (typeof SOURCE_KEYS)[ContentSource]
  | (typeof PACK_KEYS)[DLCPack]
  | (typeof MAKER_KEYS)[ModMaker]
  | (typeof DISTRIBUTOR_KEYS)[ModDistributor];

/**
 * Any key naming a value on a badge.
 */
export type ProvenanceTagKey =
  | (typeof SOURCE_TAG_KEYS)[ContentSource]
  | (typeof MAKER_TAG_KEYS)[ModMaker]
  | (typeof DISTRIBUTOR_TAG_KEYS)[ModDistributor];

/**
 * Looks a value up in one of the key maps.
 *
 * Tolerant on purpose: facet values arrive as plain strings from main, and the
 * catalogue can name a pack this build has no key for yet. An unknown value is
 * shown as it came rather than as a missing translation.
 * @param keys The map to look in
 * @param value The value to translate
 * @returns The key, or null when nothing matches
 */
const lookUp = <T extends string>(
  keys: Readonly<Record<string, T>>,
  value: string,
): T | null => keys[value] ?? null;

/**
 * The filter-list key for a source value.
 * @param value A ContentSource, or anything main sent
 * @returns Its key, or null when unrecognised
 */
export const sourceKey = (value: string): ProvenanceLabelKey | null => lookUp(SOURCE_KEYS, value);

/**
 * The filter-list key for a DLC pack value.
 * @param value A DLCPack, or anything main sent
 * @returns Its key, or null when unrecognised
 */
export const packKey = (value: string): ProvenanceLabelKey | null => lookUp(PACK_KEYS, value);

/**
 * The filter-list key for a mod maker value.
 * @param value A ModMaker, or anything main sent
 * @returns Its key, or null when unrecognised
 */
export const makerKey = (value: string): ProvenanceLabelKey | null => lookUp(MAKER_KEYS, value);

/**
 * The filter-list key for a redistributor value.
 * @param value A ModDistributor, or anything main sent
 * @returns Its key, or null when unrecognised
 */
export const distributorKey = (value: string): ProvenanceLabelKey | null => (
  lookUp(DISTRIBUTOR_KEYS, value)
);

/**
 * The badge key for a source.
 * @param source Base, DLC or mod
 * @returns Its badge key
 */
export const sourceTagKey = (source: ContentSource): ProvenanceTagKey => SOURCE_TAG_KEYS[source];

/**
 * The badge key for a mod maker.
 * @param maker The mod maker
 * @returns Its badge key
 */
export const makerTagKey = (maker: ModMaker): ProvenanceTagKey => MAKER_TAG_KEYS[maker];

/**
 * The badge key for a redistributor.
 * @param distributor The redistributor
 * @returns Its badge key
 */
export const distributorTagKey = (
  distributor: ModDistributor,
): ProvenanceTagKey => DISTRIBUTOR_TAG_KEYS[distributor];

/**
 * The pack's own name, for naming it inside the DLC badge.
 * @param pack The DLC pack
 * @returns Its key
 */
export const packNameKey = (pack: DLCPack): ProvenanceLabelKey => PACK_KEYS[pack];

/**
 * The mod team's full name, for somewhere with room for it.
 * @param maker The mod maker
 * @returns Its key
 */
export const makerNameKey = (maker: ModMaker): ProvenanceLabelKey => MAKER_KEYS[maker];

/**
 * The redistributor's full name, for somewhere with room for it.
 * @param distributor The redistributor
 * @returns Its key
 */
export const distributorNameKey = (
  distributor: ModDistributor,
): ProvenanceLabelKey => DISTRIBUTOR_KEYS[distributor];

/**
 * The colour a badge takes, per source.
 *
 * Tokens from globals.css, never literals. A hue each is what tells the reader
 * these came from the app rather than from whatever the mod author typed.
 */
export const SOURCE_TAG_CLASS = {
  [ContentSource.BASE]: 'border-transparent bg-provenance-base text-provenance-base-foreground',
  [ContentSource.DLC]: 'border-transparent bg-provenance-dlc text-provenance-dlc-foreground',
  [ContentSource.MOD]: 'border-transparent bg-provenance-mod text-provenance-mod-foreground',
} as const satisfies Record<ContentSource, string>;

/**
 * The colour of the Custom badge an anonymous mod wears once the user has added
 * it to the library.
 *
 * Takes the place of the Mod badge rather than joining it, and borrows the hue
 * that already says "yours" on a championship, since it means the same thing.
 */
export const CUSTOM_TAG_CLASS = 'border-transparent bg-origin-custom text-origin-custom-foreground';

/**
 * The colour a redistributor's badge takes - its own hue again, because who
 * shipped it to you is a different question from who made it.
 */
export const DISTRIBUTOR_TAG_CLASS = [
  'border-transparent bg-provenance-distribution',
  'text-provenance-distribution-foreground',
].join(' ');
