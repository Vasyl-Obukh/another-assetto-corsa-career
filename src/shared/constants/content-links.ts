// Where each source of content is got from: one page per DLC pack, per mod team
// and per redistributor.
//
// Deliberately a page rather than an `acmanager://install?url=` link. That URI
// wants a *direct download*, and no source the catalogue names has one: the DLC
// is a Steam entitlement, RSS, VRC and URD sell their cars behind a login,
// Guerilla and Yezhrod release through Patreon, and LFM installs its pack with
// its own launcher. Handed a store page instead, Content Manager downloads the
// HTML and finds nothing to install, with nothing said anywhere - so the honest
// answer is to open the page in the user's browser and let them get it.
//
// Not in src/core/content-catalogue/ although it is provenance-shaped, because
// the renderer is the only caller and may not import core - the same reason
// isCatalogued sits in src/shared/utils/library/. Nothing here is baked into a
// scanned Car or Track either, so amending it leaves the content cache alone; it
// is looked up at render time, the way the class catalogue is.
//
// The Steam app ids were read from Kunos' own content/cars/<id>/ui/dlc_ui_car.json
// markers, cross-checked against the catalogue's own pack assignments and then
// confirmed one by one against Steam's appdetails API, which is what caught the
// Red Pack and the Tripl3 Pack being swapped in the catalogue. The six mod pages
// were each opened and confirmed to be selling or hosting the content we
// attribute to that team; they are third-party sites and will rot, so the date
// is recorded here: checked 2026-09-20.

import { DLCPack, ModDistributor, ModMaker } from '../types/index.ts';

/**
 * The Steam store page for each DLC pack.
 *
 * Keyed by enum member, so a pack added to DLCPack is a typecheck failure here
 * until it has a page. `/app/<id>/` rather than the `/dlc/<id>` form one marker
 * writes: that route lists the DLC *of* an app, which is a different page.
 */
export const PACK_PAGES = {
  [DLCPack.DREAM_PACK_1]: 'https://store.steampowered.com/app/347990/',
  [DLCPack.DREAM_PACK_2]: 'https://store.steampowered.com/app/404430/',
  [DLCPack.DREAM_PACK_3]: 'https://store.steampowered.com/app/423630/',
  [DLCPack.JAPANESE_PACK]: 'https://store.steampowered.com/app/467980/',
  [DLCPack.TRIPL3_PACK]: 'https://store.steampowered.com/app/509350/',
  [DLCPack.RED_PACK]: 'https://store.steampowered.com/app/493190/',
  [DLCPack.PORSCHE_PACK_1]: 'https://store.steampowered.com/app/526060/',
  [DLCPack.PORSCHE_PACK_2]: 'https://store.steampowered.com/app/540710/',
  [DLCPack.PORSCHE_PACK_3]: 'https://store.steampowered.com/app/540711/',
  [DLCPack.READY_TO_RACE]: 'https://store.steampowered.com/app/619680/',
  [DLCPack.FERRARI_70TH]: 'https://store.steampowered.com/app/675590/',
} as const satisfies Record<DLCPack, string>;

/**
 * Where each mod team's cars are got from.
 *
 * The shop where there is one, and the Patreon where that is how the team
 * releases. guerilla-mods.de is the team's own domain and redirects here, so the
 * destination is named rather than the hop.
 */
export const MAKER_PAGES = {
  [ModMaker.RSS]: 'https://store.racesimstudio.com/',
  [ModMaker.VRC]: 'https://www.virtual-racing-cars.com/assetto-corsa/',
  [ModMaker.URD]: 'https://shop.unitedracingdesign.com/assetto-corsa/',
  [ModMaker.GUERILLA]: 'https://www.patreon.com/c/guerilla',
  [ModMaker.YEZHROD]: 'https://www.patreon.com/yezhrod',
} as const satisfies Record<ModMaker, string>;

/**
 * Where each redistributor's content is got from.
 *
 * LFM ships its pack through its own launcher rather than as a download, so the
 * link is the platform itself and the user goes on from there.
 */
export const DISTRIBUTOR_PAGES = {
  [ModDistributor.LFM]: 'https://lowfuelmotorsport.com/',
} as const satisfies Record<ModDistributor, string>;
