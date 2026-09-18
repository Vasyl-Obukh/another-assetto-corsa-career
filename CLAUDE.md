# Assetto Corsa Career Mode

## What this is

A career mode application for Assetto Corsa, in the spirit of *Zero to Apex* for
Automobilista 2: structured championships with progression, standings and
persistent results, wrapped around races the user actually drives.

The defining feature is **user-authored racing series**. Users create their own
championships from any installed content - including car and track mods - or
extend existing series with extra rounds and entrants. Series data is our own
JSON format; AC's native `content/career/<SERIES>/series.ini` is deliberately
not used, being rigid and tied to the vanilla launcher's progression.

Races launch through **Content Manager**, never by running `acs.exe` directly.
That is what keeps CSP, PURE, rain FX and other mods working: CM's `GameWrapper`
runs a preparation pass (CSP configs, weather controllers, track properties,
car-specific controls, starter selection) before the game starts. Bypassing it
breaks all of that.

Planned work lives in [ROADMAP.md](ROADMAP.md), which doubles as the TODO list -
check it before starting anything, and tick items off as they land.

**If you are building a screen, read *Colour is not optional* in Conventions
first.** It is the rule this project has had to restate most often, and a screen
of grey chips has been shipped and sent back three times.

## Stack

- **Node.js 24+** for all integration logic - the entire surface is file I/O and
  process launches.
- **TypeScript**, run directly by Node. Nothing is compiled, and `tsc` is
  typecheck-only (`noEmit`), so relative imports keep their `.ts` extension.
  Node's default strip-only mode cannot express enums, so the CLI scripts pass
  `--experimental-transform-types` and run the full transform instead. **Use the
  npm scripts, not `node spike.ts` directly** - bare invocation fails on the
  first enum it meets. `main`, `preload` and `renderer` are bundled by
  electron-vite and never see this.
- **Electron** for the desktop UI, built by **electron-vite**. Windows-only,
  since AC and CM are.
- **React 19** in the renderer, with **shadcn/ui** on Radix primitives and
  **Tailwind v4**. shadcn components are *vendored* - `src/renderer/src/components/ui/`
  holds copied source we own and edit, not an imported library.
- **react-i18next** for translations, `Intl` for dates, numbers and money.
- **ESLint** with the Airbnb config (`eslint-config-airbnb-extended`, the flat-config
  continuation of `eslint-config-airbnb-base`) plus typescript-eslint, and the
  React/hooks/jsx-a11y configs scoped to the renderer.
- Zero *runtime* dependencies, still true in the shipped app: everything the
  renderer imports is bundled into it, and Electron provides its own runtime, so
  it all lives in `devDependencies`. `src/core/` is held to a stricter line - the
  lint config deliberately leaves it off the `devDependencies` allowlist, so the
  core stays dependency-free and runnable by bare Node.

Node 24 is a hard floor, not a preference - native `.ts` execution and
`import.meta.dirname` both require it.

Electron's idle cost matters here: the app sits alongside a running game. Hide
the window or drop to a tray process while a race is live rather than leaving a
renderer burning frames in the background.

```
npm run dev       # electron-vite dev server
npm run build     # -> dist/{main,preload,renderer}
npm run start     # run the built app

npm run scan   npm run dry   npm run race   npm run weekend
npm run series   npm run watch   npm run results
npm run weather   npm run testmode
npm run check     # typecheck (both projects) + lint
npm run lint:fix

npm test          # jest
npm run test:watch
npm run test:coverage
```

Both `npm run check` and `npm test` must pass before committing.

The CLI is the regression harness for the core: after touching anything under
`src/core/`, `npm run dry` must reproduce the same `out/race.ini` as before.

## How the integration works

```
races/*.json  ->  race.ini  ->  acmanager://race/config  ->  CM  ->  AC
                                                                     |
data/results/*.json  <-  summarise()  <-  out/race_out.json  <--------+
```

1. `src/core/content/` scans installed cars, tracks, weathers and CSP weather
   controllers. IDs are folder names, so mods are first-class.
2. `src/core/race-ini/` turns a race definition into AC's `race.ini`.
3. `src/core/launch/` base64-encodes it and spawns CM with an `acmanager://` URI.
4. `src/core/results/` watches `Documents\Assetto Corsa\out\race_out.json`, which
   is overwritten every session, and archives it before the next race.

## Layout

Four layers, and the boundaries between them are load-bearing. Imports run one
way only:

```
shared  ->  core  ->  cli
                  ->  main
        ->  renderer
```

- **`src/shared/`** is the bottom layer: types, constants and pure helpers that
  both processes need. It imports nothing of ours, and may touch neither `node:`
  nor the DOM, because it is compiled by both tsconfigs.
- **`src/core/`** is the Assetto Corsa integration: file I/O and process
  launches, no Electron. Still runnable by bare Node, which is what keeps the CLI
  working as a regression harness.
- **`src/main/`**, **`src/preload/`**, **`src/renderer/`** are the Electron
  process model, described above.
- **`src/cli/`** is the `spike.ts` command implementations.

There is no project-references setup - `composite` conflicts with the `noEmit`
that native type stripping needs - so `npm run typecheck` runs `tsc` twice, once
per project.

| Path | Purpose |
| --- | --- |
| `spike.ts` | Thin CLI entry point over `src/cli/` |
| `src/cli/` | `scan`, `dry`, `run`, `weekend`, `series`, `watch`, `results`, `weather`, `testmode`, one per file - or a folder, where a command needs helpers of its own. All reached through npm scripts, which carry the transform flag |
| `src/shared/types/` | Every domain type: content, classes, ladder, series, paths, race, results, weekend, settings, IPC |
| `src/shared/constants/` | Time units, settings defaults, the assists Assetto Corsa itself ships, the Content Manager flags we offer, the `accontent://` scheme, the English wording for every content issue reason. `Assists` is split in two by `Pick`, never by a second list: `DrivingAids` is what the player chooses and `RegulationKey` is whatever that leaves over, so an assist moves side by side simply by moving in the `Pick` - which is how tyre blankets became a rule a series states rather than a switch in settings |
| `src/shared/errors/` | `AppError`, the `ErrorCode` union and its English templates |
| `src/shared/utils/settings/` | `readSettings`, the tolerant reader behind `settings.json` - every field coerced, nothing thrown - plus `applyPatch`, which is a merge put back through it. Shared by main and renderer. Deliberately not a migration: nothing branches on the version. `allowedWeather` is a list rather than a record of switches, so the file stays readable by hand, and a missing one reads as the default rather than as nothing allowed. `hiddenContentSources` and `inactiveSeries` go the other way and store what is switched *off*, so anything the catalogue or the library gains later arrives switched on |
| `src/shared/utils/content-url/` | The `accontent://` URL grammar, built and parsed in one place |
| `src/shared/utils/search/` | Folding and term matching for every search box, shared because the browsers query in main and the livery list filters in the renderer |
| `src/shared/utils/weather-system/` | Which controller each weather system runs, and whether it can change the weather at all. Shared because main writes the controller into `race.ini` and the renderer decides whether to offer a second slot |
| `src/shared/utils/weather-types/` | Which weather an install and the user's settings can race in - `offerableTypes` and the `WeatherOffer` it builds - what stands in for a type that is not on offer, and the single type a plan collapses to without a planner. Shared because main generates a championship's weather over exactly the set the race screen's menu offers. **`nearestOffered` keeps wet wet and dry dry**, walking `WEATHER_POSITION` and crossing over only when nothing of a weather's own kind is left. Substitution is generation's alone: race.ini still refuses a type no installed preset declares |
| `src/shared/utils/conditions/` | Merging a session's own conditions over the weekend's defaults. Shared because both the bundler and the race screen need the same answer, and the renderer may not import core. Weather merges as a group, since its three fields answer one question |
| `src/shared/utils/content-sources/` | Which championships the content source toggles offer: `isOffered` over a championship's `SeriesRequirements`, with `poolHolds` for one spec's floor - which `requirementsOf` in core also asks, to find the sources a spec cannot do without - and the sources switched off in settings, and `hiddenCount`, which is what switching one off would cost. Shared because the championships list filters on it and the settings tab that holds the switches shows the same answer. **The switches govern the app's own championships alone** - `hiddenBySources` is false for anything of the user's, since hiding a file they wrote is not ours to do. **Needing is not reaching**: a spec is satisfied by whatever of its grid is left, so switching a pack off hides a spec championship only once its grid falls below `minModels` |
| `src/shared/utils/eligibility/` | Which cars an eligibility rule names, and every car a class entry may field across the calendar. Shared because the validator and the championship editor need the same answer, and the renderer may not import core |
| `src/shared/utils/lap-time/` | `m:ss.mmm`, shared by the CLI's timing sheet and the results screen. Deliberately outside the `Intl` formatters: a lap time is a motorsport convention, not a locale decision |
| `src/shared/utils/library/` | Whether content belongs in the library: `isCatalogued`, `isUserAdded` and `isInLibrary`, which is the two read as one question, plus `isUserAddedCircuit`, which leaves the per-layout redistributor out because the user's list names circuits. Shared because main narrows the browsers on it and the renderer badges what the user added. `src/core/content-catalogue/` re-exports `isCatalogued`, since it is that catalogue's question |
| `src/shared/utils/car-classes/` | The class catalogue as a value: the shipped tables, and `resolveCatalogue` laying the user's layer over them into a `ClassCatalogue`. Which grids a car races on and which family each grid belongs to - a car may hold several, so both lookups return lists. **Every lookup is handed the catalogue it answers from**, so main and the renderer each resolve the same layer and nothing quietly answers from the shipped half; `SHIPPED_CATALOGUE` is the default only at the core's entry points, which is what keeps the CLI seeing the shipped half alone. Resolved at runtime, so it is deliberately not in the content cache |
| `src/shared/utils/class-layer/` | The user's layer over the class catalogue: `readClassLayer`, the tolerant reader behind `car-classes.json`, and the pure edits the class store makes - restating a car's specs, and adding, renaming, moving and deleting classes and specs of the user's. Every edit takes the resolved catalogue beside the layer, because a spec may sit in a shipped class and a car may drop a spec we ship. A car list equal to what we ship drops the override, which is what keeps Revert honest |
| `src/core/series/` | Reading a championship: validating it, saying what it needs against the installed library, and lowering one round into an ordinary `RaceDefinition`. That last part is the point - a round runs through `planWeekend`, `buildGrid` and `buildRaceIni` exactly as a hand-authored weekend does, so nothing under `src/core/weekend/`, `src/core/race-ini/` or `src/main/race-store/` knows what a series is. A championship that generates its weather has the forecast written onto the round's sessions here too, which is why `roundRace` takes a `WeatherOffer` - defaulting, like the class catalogue, to what a core entry point sees alone |
| `src/core/weather-forecast/` | Generated weather. A round's weekend drawn from its `Climate` in three steps whose order is load-bearing: the climate draws, the draw is swapped for what the offer holds, and a plan collapses to its opening stretch without a planner - and the draws never depend on the last two, so switching a weather off swaps it out rather than re-rolling the season. **Deterministic by construction**, seeded on the round and then the championship, so the forecast shown and the race run are one draw; the round id leads because `seedFrom` is a running hash, and ids differing in their last character otherwise seed within a hair of each other. What a round or a session authors wins, a group at a time |
| `src/core/series-file/` | A championship as a document: `unknown` off disk to a typed `Championship`, and back. Every string that indexes a closed catalogue - a discipline, a session type, a weather type - is checked against that catalogue's own members, because a user's file has no compiler behind it. **A spec is checked for shape only**: the user may have made it, so whether it resolves is `validateSeries`' question against the catalogue it is handed. Structural only; whether the championship is coherent is `validateSeries`. `writeSeries` is the other direction, and everything that writes a championship goes through it. **There is no migration**, and that is the policy rather than an omission - see *No schema migrations before the first release*. A championship written against another revision is refused by `validateSeries` and the answer is to delete the file. **Note that `parseSeries` casts the record it read rather than rebuilding it**, which is what makes a rename or a removal a real format change rather than something a tolerant reader could absorb: a key nobody checks still round-trips straight back out through `writeSeries` |
| `src/core/series-library/` | The championships the app ships - TypeScript constants under `shipped/`, one file per championship, so a renamed spec is a compile error and adding a series is adding a file - with `shipped/utils.ts` holding the `team` and `seat` constructors, because an entry list is a table and twenty drivers written out as object literals is not one anybody can read down - merged with whatever the user wrote as JSON. A user's file carrying a shipped id replaces it and reads as `adjusted` rather than clashing with it; deleting that file puts the original back, because the override is the file's existence and nothing else. Ladder order is derived from the tiers, so adding a championship never means renumbering one. **It writes as well as reads**: `saveUserSeries` and `deleteUserSeries` are the disk side, and both are addressed by the *file* rather than by the id, because the two are allowed to disagree - `readSeriesDir` keys a championship on the id inside the document, so `weird.json` may perfectly well hold `lotus-cup` and a name computed from that id would hit the wrong file. A new file's name is derived from the id but only once nothing else has spent it - `lotus-cup.json` may hold something else entirely, and writing over it would destroy a file of the user's - and an id that could not safely be a name at all is refused rather than repaired. **Only the championships the app ships carry an authored id**; every other one gets a UUID from `newSeriesId`, because an id is not a thing anyone reads - the library keys on it, `forkedFrom` points at it and results are filed under it, and it can never change. A canonical UUID satisfies `SERIES_ID_PATTERN` as it stands, so the safety layer takes no exception for it. Customise is the one write that keeps the id it was given, which is the whole of how `adjusted` and Revert work. `create` is the other end of that rule: the editor drafts a new championship in full and main replaces whatever id the draft carried |
| `src/core/seeded-random/` | The Park-Miller generator and the string hash that seeds it. Its own module because two callers need the same answer twice - the weekend shuffling a grid with no qualifying to order it, and a series composing a round's field |
| `src/core/paths/` | Probes for CM's exe, the AC root and AC's Documents folder |
| `src/core/content/` | Scans installed content, liveries and their `ui_skin.json` included; lenient about malformed mod JSON; fingerprints so a rescan re-reads only what moved |
| `src/core/loose-number/` | Reading a number out of the free text a mod author wrote - separators, units, "N/A". Shared by the car and track readers, because a car's weight and a circuit's length are the same parsing problem |
| `src/core/car-performance/` | `ui_car.json` specs -> numbers, tolerant of free text |
| `src/core/content-catalogue/` | Which folder ID is base game, which DLC pack, whose mod, who redistributes it; every ID listed, nothing inferred |
| `src/core/content-query/` | Pure filter, sort, page and facet counting over a scan; tracks filter per layout and come back grouped one per folder |
| `src/core/race-ini/` | Race definition -> `race.ini` |
| `src/core/launch/` | Cut-base64, URI construction, spawning CM, and rendering assists both ways - Content Manager's serialized JSON for the URI, AC's `assists.ini` layout for reading back what arrived |
| `src/core/results/` | Watching, stable-reading and summarising results |
| `src/core/weekend/` | Lowering a weekend into launches, one per session, and carrying the grid and the track across the seams between them. Pure: no I/O, so the state machine is a reducer over a value rather than a store. A launch's field is its own: `SessionDefinition.inherit` names which session a launch follows and how many of it carry over, so a knockout qualifying segment goes out with a short `[CAR_n]` list and a race composes its grid back along the whole chain |
| `src/core/weather/` | Career weather presets installed into AC's content folder |
| `src/core/weather-plan/` | Weather plans for the PURE and Sol planner apps: our own step model, a writer per format, and installing them into a slot we own without disturbing the user's. Dynamic weather is driven by those apps, not by `race.ini` |
| `src/core/ini/` | Minimal INI reader/writer for AC's flavour |
| `src/core/cm-arguments/` | Content Manager's own `Arguments.txt`, one flag per line. Line-level and backup-free, unlike `weather-plan`: a flag's presence is the state, so turning it off is a complete undo. The settings screen writes two of the flags; race INI test mode is set through `npm run testmode` alone |
| `src/main/` | App lifecycle, window, settings store, content store, race store, theme, IPC handlers |
| `src/main/content-store/` | The scan, cached to `%APPDATA%`, watched and revalidated. Queries answer over the library - catalogued, or added by the user through `settings.addedContent`, which main hands over with `include()` - unless they set `anonymous`, which answers over every uncatalogued entry instead. Resolved at query time, never baked into the cache |
| `src/main/race-store/` | The race being set up, its weekend progress and the launch in flight, all under `%APPDATA%/ac-career-mode/race/`. The same steps `npm run weekend` runs, in the same order; the wait for a result is detached and reaches the renderer as a push |
| `src/main/class-store/` | The user's layer over the class catalogue, read once from `%APPDATA%/ac-career-mode/car-classes.json` and written back whole after every command. The edits are `src/shared/utils/class-layer/`'s, so this is only the disk half: commands run one after another so two never share the `.tmp`, a file that is not JSON is quarantined as `settings.json` is, and every command pushes the layer as `classes:changed` - the layer rather than the catalogue, which is maps. Main hands the catalogue to the content store with `classify()` and the series store reads it per call, then `refresh()`es the library, because what a spec holds decides what a championship can race |
| `src/main/series-store/` | The championship library, loaded once at startup and answered from memory. Only the user's half is read from disk, out of `%APPDATA%/ac-career-mode/series/`. Every command that writes - customise, duplicate, revert, delete, import - lives here, ends by calling `reload()` and pushes the whole library back as `series:changed`, because two screens read it at once and a duplicate made on the detail screen has to reach the list behind it. The native file dialogs deliberately stay in `src/main/ipc/`, so this store keeps its path-in, value-out shape and imports no Electron. `series:list` answers with an envelope rather than a bare list, so a file that would not load travels with the ones that did |
| `src/main/content-protocol/` | Serves preview images out of the AC install |
| `src/preload/` | The single `contextBridge` surface (`window.api`) |
| `src/renderer/` | React UI; `src/renderer/src/components/ui/` is vendored shadcn source |
| `src/renderer/src/screens/` | One folder per route-level screen. `car-browser` and `track-browser` each expose a `*BrowserBody`, which is the whole browser with an optional `onSelect` - that is what the race screen's pickers are, rather than screens of their own. A body given a `memoryId` comes back to the filters it was left with; a picker passes none, so its restricted library never inherits or leaks the page's filters. A body given a `toggle` puts a switch on every card instead, which is all `your-content` is: both bodies over `anonymous: true`, adding anonymous mods to the library. `settings` is a layout with six tabs as nested routes - General at `/settings`, `diagnostics` at `/settings/diagnostics`, `your-content` at `/settings/content`, `car-classes` at `/settings/classes`, `content-sources` at `/settings/sources` and `championship-library` at `/settings/championships`, which manages the championship library - the Championships page itself is read-only and lists only what a career can race, through one `ChampionshipCard` that manages a championship when it is handed the screen's commands and is a plain link when it is not. `championship-editor` is at `/settings/championships/:id/edit`, and at `/settings/championships/new` for one that has not been written yet - under settings so the nav lights Settings, but outside the settings layout, which would head it with the tabs. A car is classified from `car-detail`, one car at a time |
| `src/renderer/src/lib/routes/` | Every route pattern, the builders that turn one into a URL, and which destinations navigation offers. `ROUTE.x` is the pattern, `path.x()` is the URL |
| `src/renderer/src/lib/layout.ts` | The measurements more than one screen shares: the content width, the settings control width, the two-column field grid |
| `src/renderer/src/lib/accents.ts` | The colour a chip wears when what it says is one of a closed set, for the sets more than one screen shows: which kind of session, which podium place, whose a championship or a car's classification is. Class strings rather than tokens, so a caller hands one to a `Badge` and tailwind-merge drops the variant's own fill for it - and a value the map does not cover keeps that variant untouched, which is how fourth place comes out unfilled |
| `src/renderer/src/lib/browser-memory/` | The filters and the search a browser was left with, held per browser id for as long as the window lives, so leaving a browser page and coming back does not mean setting them again. Module state rather than a provider, because nothing renders from it and the only reader is the next mount. Deliberately not the scroll offset: restoring one means paging every entry under it back in first |
| `races/*.json` | Race definitions in our own format. A weekend is one of these too - its `sessions` cover the whole event and `src/core/weekend/` splits it into launches |
| `races/spikes/` | Probes that pin down AC behaviour we depend on, one per question, each carrying its procedure in its `notes`. Run with `npm run race -- spikes/<name>`; read the result back with `npm run results` |

### Paths, probing and overrides

`probePaths()` never throws and reports per-item status, which is what the
diagnostics UI renders; `resolvePaths()` insists on all three and throws, which
is what the CLI uses. Precedence is override, then env var, then registry, then
Steam, then the default location. **An override is authoritative**: if the user
points at a folder that fails its check, the probe reports that failure rather
than quietly falling back to auto-detection and reporting a path they did not
choose.

### Theme and IPC

Main owns the resolved theme (`nativeTheme`) and pushes it to the renderer, so
the native title bar and file dialogs stay in step with the UI; the renderer only
stamps `data-theme` on `<html>`. IPC handlers never throw across the boundary -
Electron flattens `Error` into something unreadable - so each resolves an
`IpcResult` envelope that the renderer unwraps back into a real rejection.

## Verifying changes to race.ini

Content Manager can write `race.ini` without launching the game, which gives an
authoritative reference:

1. `npm run testmode -- on`, which writes `--enable-race-ini-test-mode` into
   `%LOCALAPPDATA%\AcTools Content Manager\Arguments.txt`.
2. Restart CM, set the same race up in its Quick Drive and hit Go - nothing
   launches.
3. Diff `out\race.ini` against `Documents\Assetto Corsa\cfg\race.ini`.
4. `npm run testmode -- off` afterwards, or CM will never launch a race again.

`npm run testmode` with no argument prints that procedure with the paths filled
in, and says which of our flags the file currently holds. **The flag is
deliberately CLI-only**: it stops CM launching anything, so it is a debugging
tool rather than something to leave switchable in the app. The settings screen
offers the other two flags, neither of which can stop a race.

CM writes `cfg\assists.ini` in the same preparation pass, so the same procedure
checks the assists blob without driving.

When a launch misbehaves, `cfg\race.ini` immediately afterwards is the fastest
diagnostic - it is what CM actually handed AC, rather than what we intended.

## Conventions

**Style.** Airbnb via ESLint; run `npm run check` before committing. The only
deliberate departures are in `eslint.config.js`, each with a reason next to it.

**Names are kebab-case,** files and folders alike - `race-ini/race-ini.ts`,
`use-installation/use-installation.ts`. React components are the one exception
and stay PascalCase, inside a kebab-case folder: `paths-card/PathsCard.tsx`.
Identifiers stay camelCase as usual; only the names on disk change.

**Enum members are SCREAMING_SNAKE_CASE**, like the constants they are, and an
initialism in a type name keeps its case - `DLCPack`, not `DlcPack`:

```ts
export enum DLCPack {
  DREAM_PACK_1 = 'dream-pack-1',
  READY_TO_RACE = 'ready-to-race',
}
```

The values stay kebab-case: they are what reaches disk, the content cache and the
i18n keys, so renaming a member never changes what has already been written.

**One kind of thing per file.** Types, constants and functions live in
`types.ts`, `constants.ts` and `utils.ts` rather than piling into one module. A
module that needs more than one of them becomes a folder, and **the module's own
file is named after the folder**:

```
src/core/results/
  results.ts     the module - waitForResults, summarise, archiveResults
  types.ts       WaitOptions
  constants.ts   POLL_INTERVAL, SETTLE_READS, DEFAULT_TIMEOUT
  utils.ts       mtimeOf, sleepUntilEvent
  index.ts       export * from './results.ts';
```

**`index.ts` may only re-export. No implementation, ever.** That is what keeps a
list of changed files readable: a one-line barrel never changes, so `index.ts`
stops appearing in diffs and every entry names the thing it actually is. It also
means callers still reach for the folder, so moving a file inside a module
touches nobody.

`utils.ts` is for genuinely internal helpers supporting the module. Where a
folder exists only to hold a set of functions, they go in the folder-named file
and there is no `utils.ts` at all - `src/shared/utils/settings/settings.ts` is
the whole module, coercion helpers included.

A genuinely small, self-contained file may stay whole - `src/renderer/src/lib/utils.ts`
is one function and stays that way. A React component may keep its props
interface beside it.

**Tests are named after the file they test,** so `race-ini/__tests__/race-ini.test.ts`
tests `race-ini.ts`. Never `index.test.ts`, for the same reason as above.

**Import the folder, not the file inside it.** Reach for `../results/index.ts`,
never `../results/utils.ts`.

**Whether you write `/index.ts` depends on who runs the code**, and this is not
a style choice:

- **`src/renderer/` omits it** - `import { useSettings } from '@/app'`. It is
  compiled with `moduleResolution: bundler` and only ever loaded by Vite.
- **`src/core/`, `src/cli/`, `src/shared/` and `spike.ts` spell it out** -
  `import { scanContent } from '../core/content/index.ts'`. These are executed by
  bare Node through `node spike.ts`, and Node's ESM resolver has no directory
  index resolution at all: `import './sub'` throws `ERR_UNSUPPORTED_DIR_IMPORT`.
  The root tsconfig stays on `moduleResolution: nodenext` so TypeScript catches
  the mistake rather than letting it through to a runtime failure.
- **`src/main/` and `src/preload/` spell it out too**, because they share that
  tsconfig. They are bundled and could omit it, but only if given their own
  bundler-resolution projects.

A directory may not share a name with a sibling file. `App.tsx` next to `app/`
resolved to the wrong one on Windows, which is why the root component now lives
at `src/renderer/src/app/App.tsx`.

**Import order is enforced and auto-fixable** by `import-x/order`, which ships
with the Airbnb config. Libraries first, then everything of ours, one blank line
between, each group alphabetised:

```ts
import { RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ContentSummary } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
```

Run `npm run lint:fix` rather than sorting by hand.

**One component per file.** Components are arrow consts, named for the file.

**Where types and constants live.** Anything two layers share goes in
`src/shared/types/` or `src/shared/constants/`. Anything bound to a single util
lives beside it, in that util's own folder. Time units in particular
(`MS_PER_SECOND`, `MINUTES_PER_HOUR`) come from `src/shared/constants/time.ts` -
never spelled out inline. Constants that merely share a number with those are a
different thing and stay local: `ARCMINUTES_PER_DEGREE` in
`src/core/content/constants.ts` is 60 for unrelated reasons.

**Arrow functions,** except where a declaration is genuinely required.

**Named React imports:** `useEffect(...)`, not `React.useEffect(...)`.

**JSDoc on everything** except function components: every function, and every
property on an interface or type. Always the multi-line form, always listing
`@param` for each parameter and `@returns` when there is one. **Multi-line means
multi-line even for a one-sentence property** - there is no short form.

```ts
/**
 * Scans all installed cars.
 * @param contentDir The AC content directory
 * @returns Every installed car, sorted by display name
 */
export const scanCars = async (contentDir: string): Promise<Car[]> => { … };

export interface Car {
  /**
   * Folder name under content/cars, and the ID race.ini refers to.
   */
  id: string;
}
```

Not `/** Folder name under content/cars. */` on one line.

**Comments are `//`, and short** - a line or two. Write a longer explanation only
where the implementation is genuinely non-obvious: a protocol quirk, a value
derived from another program's source, a workaround whose reason is invisible
from the code. Do not narrate what the code already says.

**Hyphens, not dashes.** Use `-`, never `-` or `--`, in comments, JSDoc, UI
strings and these docs alike.

## Tests

Jest, with the tests for a module in a `__tests__/` folder inside it:

```
src/core/race-ini/
  race-ini.ts  types.ts  constants.ts  utils.ts  index.ts
  __tests__/
    race-ini.test.ts     tests race-ini.ts
    utils.test.ts        tests utils.ts
    fixtures.ts          shared fixtures; not a suite, so not named *.test.ts
```

**When to write them - this is a workflow rule, not a style one.**

While making a change, do **not** write new tests. Update only the tests the
change actually breaks, so the suite stays green and the diff stays about the
change. Once the change has been reviewed and approved, cover the new and
updated functions in a follow-up pass. Writing tests against unreviewed
behaviour just means rewriting them.

**Structure: one root `describe` per file, one nested `describe` per function.**
The root is named for the module path, the nested ones for the function exactly
as exported.

```ts
describe('core/race-ini/utils', () => {
  describe('parseClock', () => {
    it('reads HH:MM into decimal hours', () => { … });
    it('throws on anything that is not HH:MM', () => { … });
  });

  describe('sunAngleFromTime', () => { … });
});
```

**Conventions.**

- Import the globals explicitly: `import { describe, expect, it, jest } from '@jest/globals'`.
  Nothing relies on ambient globals.
- Name the `it` for the behaviour, not the mechanism: "reports a bad override
  rather than falling back", not "returns exists false".
- Mock the filesystem with `jest.mock('node:fs/promises')`. Jest compiles to
  CommonJS (see `jest.config.js` for why), so plain `jest.mock` hoisting works.
- Where a bug has been fixed, say so in a comment above the test that guards it,
  so nobody deletes it as redundant.
- **Nothing testable may import `react-router`.** It ships ESM only, Jest runs
  CommonJS, and its module graph reaches an `import.meta.hot` that cannot be
  expressed in CommonJS at all - so transforming the package rather than
  excluding it does not help either, and both have been tried. This is why
  `src/renderer/src/lib/routes/` builds paths itself instead of calling
  react-router's own `generatePath`, and imports `PathParam` as a type only.
- **`src/cli/constants.ts` cannot be imported by a test** for the same reason:
  it derives `PROJECT_ROOT` from `import.meta.dirname`, so a suite that reaches
  it fails to parse rather than failing an assertion. Mock it -
  `jest.mock('../../../constants.ts', () => ({ RESULTS_DIR: 'results-dir' }))` -
  which also keeps the test off the real results folder.

**What is covered, and what is deliberately not.** `src/shared`, `src/core`, the
CLI's pure helpers, the renderer's pure helpers, the settings store, and the
handful of main-process functions with real logic behind them
(`isOnSomeDisplay`, `toIpcError`) - those two need a small `electron` fake,
since outside Electron the module resolves to a path string rather than the API.

Out of scope for now: React components, `createWindow` and the app lifecycle, and
`registerHandlers`. They are mostly orchestration, where the test asserts on its
own mock rather than on behaviour. Running the app covers them better.

**The vendored exception.** `src/renderer/src/components/ui/` is shadcn source
generated by `npx shadcn@latest add`. There is no `components.json`, so that
command needs an `init` before it will add anything, and `init` rewrites
`globals.css` - so a new component is copied from upstream by hand instead, with
its Radix package added to `devDependencies` and pinned exactly, the way its six
siblings are. It is kept exactly as upstream ships it -
several components per file, function declarations, no JSDoc, and upstream's own
import order - so the CLI keeps working and upstream fixes stay diffable.
`eslint.config.js` exempts it explicitly, import ordering included. Nothing else
in the repo gets that latitude.

**Failure modes.** Prefer failing loudly at validation time over letting AC or
CSP fail confusingly later. Several of this project's integration points fail
*silently* - the wrong weather controller just produces the wrong weather, with
no error anywhere - so validate against installed content before launching.

**Mod tolerance.** Anything reading content files must assume malformed input.
Skip the entry, never throw. The same applies to the settings file: a corrupted
or hand-edited `settings.json` is quarantined and replaced with defaults rather
than blocking startup.

**No schema migrations before the first release.** Every persisted format is at
version 1 and stays there. Changing one is not an occasion to write a migration
step - it is an occasion to **delete the out-of-date file**, because the only
files that exist anywhere are the author's own and there is nobody a broken one
could affect. Migrations start to matter when the app has users whose files are
not ours to throw away, which is **Phase 14 - Distribution**: that is when a
version bump has to come with a step that reads the old shape, and when this
paragraph stops being true.

So a format change is three things and not four: change the type, change
whatever reads it, and leave the version alone. The refusal already in place is
the whole story - `validateSeries` reports `series.version.unsupported` for a
championship written against another revision, and the content cache throws
itself away and rescans - and the answer to either is to delete the file.

Two things this is not about. `readSettings` is a **tolerant reader**, not a
migration: it coerces `settings.json` field by field and never throws, because
that is a file a user may reasonably hand-edit. `assertStateMatches` is a
**staleness check** on derived weekend progress, comparing launch counts rather
than versions. Both stay whatever the migration policy says.

**Deleting an out-of-date file is the user's to do, not the agent's.** Say which
file is stale and why, then let them delete it. Anything **outside the repo** -
`%APPDATA%/ac-career-mode/`, the AC install, Content Manager's own folders -
**must be asked for rather than deleted**, every time, even when it is obviously
regenerable. Files inside the repo still get named rather than removed unasked.

**Errors we raise carry a code.** Anything the app decides is wrong throws
`AppError` from `src/shared/errors/`, with a stable `ErrorCode` and typed params:

```ts
throw new AppError('race.track.notInstalled', { track: 'spa/gp' });
```

`AppError.message` is the English rendering from `ERROR_MESSAGES`, so the CLI and
logs read exactly as they did before codes existed. The IPC envelope forwards the
code and params, and the renderer resolves `errors.<code>` through `useAppError()`,
falling back to that English message. English error copy lives in
`src/shared/errors/constants.ts` and is merged into the i18next resources at init
rather than duplicated in `en.json`; `uk.json` carries its own `errors` subtree.

Errors that come from outside - an errno from `fs`, a spawn failure from Content
Manager - have no code and travel as their raw message. Do not invent codes for
them until there is a user-facing reason to.

A message that only makes sense in one surface does not belong in the shared
template. `Run \`npm run scan\`` means nothing in the desktop app, so the CLI
appends it (`describeProblems` in `src/cli/utils.ts`) rather than baking it in.

**No bare strings in the UI.** Every user-visible string goes through `t()`, and
`react/jsx-no-literals` enforces it. Dates, numbers and money go through
`src/renderer/src/i18n/format.ts` - nothing calls `Intl` directly.

**Colours live in one file.** `src/renderer/src/globals.css` defines the token
layer for both themes. A hardcoded colour anywhere else is a bug.

### Colour is not optional, and this is the rule that keeps being broken

**Read this before writing a screen, and again before reporting one finished.**
Three separate passes over the championship editor shipped screens where every
chip was `variant="outline"` or `variant="secondary"`, and each time the author
had read the paragraphs below and decided the grey was acceptable for now. It is
not. `outline` and `secondary` are the path of least resistance, not a default -
reaching for them on a value that is one of a closed set is the bug, not the
starting point.

So, concretely, and in this order:

1. **List every chip on the screen you just built.** For each one ask: is what
   it says one of a *closed set*? A discipline, a session type, a provenance, a
   budget tier, a podium place, an origin - yes. A car count, a lap count, a
   catalogue name, free text - no.
2. **Every closed-set chip gets a colour family.** If one does not exist, add it
   to `globals.css` with the note the section below demands. "There was no token
   for it" is a description of the work, not a reason to skip it.
3. **Everything else stays neutral on purpose**, and the *reason* goes in a
   comment at the call site. Neutral has to be a decision that was made, not one
   that was defaulted into.
4. **Look at it.** If a screenshot of the finished screen is grey, the work is
   not done, whatever the checklist says.

**The palette is full, and that is not an excuse - it is a constraint to
design within.** Hues in use, so a new family can be placed without re-cutting
an existing one: budget independent 18, destructive 27, podium bronze 52, DLC
75, warning 80, podium gold 88, sportscar 112, budget privateer 132, race 150,
success and base provenance 155, touring 175, modified origin 195, single-seater
212, redistribution 235, practice 250, primary 262, road 270, mod provenance
295, qualify 310, budget works 320, custom origin 340. The budget chips spent
the last two gaps, so a new family has to share a hue with one that never
appears on the same screen, and say so in `globals.css`. **The climate chips
are the exception that proves the technique**: sand 70, olive 108, moss 150 and
slate 232 sit on hues already spent, and are told apart from those families by
chroma at about half theirs - an ordered scale of earth tones rather than four
more categories.

**If a set needs more hues than there is room for, the answer is never flat
grey.** Two techniques, in the order to reach for them, and one that looks
like a technique and is not:

- **An ordered scale of named materials**, for anything ordinal. The tier chips
  run platinum, gold, silver, bronze, steel, which reads as a rank without a
  legend and spends two nearly-neutral hues instead of five categorical ones.
  The podium metals are the same idea.
- **Depth within one hue is not one of them.** A team's budget was one hue at
  three lightnesses, on the argument that it is an order, and at chip size the
  three read as the same colour - grey by another route. Depth is fine as a
  *second* cue over distinct hues, which is what the budget chips keep.
- **Leave a genuine catch-all neutral**, the way the four exotic session types
  are. Be strict about what a catch-all is: `road` was made grey on that
  argument and it was wrong, because road racing is a rung of the ladder rather
  than the leftovers of the other three.

Merging two chips into one is a last resort and was tried here first: the
discipline and the tier were briefly one chip reading "Road · Tier 4", which
bought a hue at the cost of saying two things in one place. An ordinal scale was
the better answer and cost the palette almost nothing.

**And the app is meant to carry colour.** A career mode is not an admin panel,
and a screen where everything is the same white-on-grey makes the reader work
out what matters from the words alone. So a chip standing for one of a closed
set gets a colour of its own - content provenance, whose championship this is,
which discipline and rung a class enters at, how well funded a team is, what
kind of session a format runs, which podium place a row pays - and a state
worth noticing gets the traffic light it deserves, amber included. Three rules
keep that off the rainbow:

- **A colour has to mean something.** Decoration is what makes an interface
  noisy; a colour nobody can name the rule for is decoration. Where a set is
  genuinely "everything else", it stays neutral on purpose - that is why the
  four exotic session types share one grey.
- **Mid-tone, both ways.** A tinted chip is a pale background with a saturated
  foreground - about `0.93` lightness over `0.4` in light, inverted to about
  `0.33` over `0.86` in dark; a solid status badge is a mid-lightness fill with
  its own contrasting text. Nothing is a pure hue and nothing is near-black or
  near-white, which is what keeps a screenful of them calm.
- **Hues clear of each other where they meet.** Two families that can be on one
  screen may not sit next to each other on the wheel. The note beside each set
  in `globals.css` says which others it had to avoid and why.

Light mode carries its own version of the same point: the page is a cool grey
and a card is white, so a card is a card rather than a hairline border. Reach
for a new token family rather than a one-off class, and put the reasoning in
`globals.css` next to it. `src/renderer/src/lib/accents.ts` is where a colour
map lives once more than one screen reads it, the way `layout.ts` holds the
measurements more than one screen shares.

**So does the cursor.** Tailwind v4's preflight gives a `<button>`
`cursor: default` and shadcn ships `cursor-default` on menu and select options,
so nothing in the app looked clickable until one rule at the end of
`globals.css` said otherwise. It is deliberately **outside `@layer base`**,
because those `cursor-default` classes are utilities and no base rule can
outrank a utility - unlayered CSS can. Disabled controls are excluded so they
keep their own `disabled:cursor-not-allowed`.

**So do the shared measurements.** `src/renderer/src/lib/layout.ts` holds the
content width every screen shares, the width every settings control shares, and
the two-column field grid. Each was a per-screen literal before and each had
drifted - seven screens held five different widths, and a select sized itself to
its own longest option, so theme and language came out different widths side by
side.

**A picker's second step is laid over its browser, never swapped for it.**
Both pickers ask two questions - a circuit then its layout, a car then its
livery - and the second step is an absolutely positioned overlay while the
browser stays mounted underneath. Rendering one *or* the other unmounts the
browser, which throws away the filters the user set and the scroll offset they
were at, so Back lands them at the top of the whole library. The overlay carries
its own `z-20`: the browser's toolbar is sticky at `z-10`, and being later in the
DOM is not enough to cover it.

**Reach all three through components, never by pasting the classes.**
`<ScreenBody>` owns the scrolling element and the content column, so a screen
writes only its own gap and padding; `<FieldGrid>` and `<FieldRow>` own the
settings layout, so every control in every card shares two left edges and one
width. That this is a component rather than a class is load-bearing: putting the
grid classes on a `CardContent` looks identical but is not, because
`CardContent` carries `px-6` for the width cap to land on, and that card's
columns come out 48px narrower than the rest.

**A long page keeps its way out in reach, one of two ways.** A screen reached
from another heads itself with `<ScreenHeader>`, which pins Back and the title
row to the top of the scroller - Back is always `<BackLink>`, so every one looks
and sits alike - and passes `ScreenBody` no top padding. The header is `z-20`
rather than the browser toolbar's `z-10`, because editor rows lift their menus
and badges to `z-10` and would otherwise draw over it. A screen with no Back of
its own sets `backToTop` on `ScreenBody` instead, which floats an arrow beside the
content column once the page has scrolled past a screen's height. A browser body
sets it only when it is the page, never inside a picker, where `fixed` would
anchor to the dialog.

## Known gaps

- **Generated weather is derived, not stored.** A forecast is a pure function
  of the championship, the round and what the install and settings offer, so
  the forecast shown and the race set up are one draw - but only at the moment
  the round is set up. Change the allowed weather or install a preset afterwards
  and the forecast moves while the race already written does not; the race
  screen says so by dropping its Forecast marker. Two careers would also race the
  same season's weather. Pinning the forecast on a career event, with the career
  in the seed, is Phase 5's.
- **A wet session washing the rubber off is an approximation.**
  `RAIN_FOR_FULL_WASH` is the career preset's own Rain, not a measurement of
  what AC does to grip across a wet session, and nobody has driven one to check.
  It sits beside `GRIP_GAIN_PER_SESSION`, which was never measured either. A plan
  run under plain CSP races only its opening stretch while grip weighs every
  stretch of it.
- **A race session is classified by AC's own `raceResult`; everything else is
  inferred.** `raceResult[n]` is the car index that finished `n`-th, and across
  four driven races - including one with a deliberately lapped car - it has
  matched our laps-then-time inference every time, so adopting it bought no new
  information. It was adopted anyway, because it is AC's answer and therefore
  cannot inherit a bug in ours. Practice and qualifying carry none, so those
  stay inferred, and `SessionSummary.order` says which of the two produced any
  given table. It is still corroboration rather than the route to real
  positions, which wait on Phase 12.
- **A qualifying segment the player is eliminated from is simulated, not
  driven.** Knockout qualifying runs each segment with only the cars still in
  it, so a segment the player is out of has no field they are in - and Assetto
  Corsa has no session without them. It cannot be launched at all, so there is
  no AC answer to prefer over ours: the advancing field is re-ordered off its
  previous segment with seeded jitter, recorded with `skipped: true` and an
  empty archive, and the race composes its grid across the chain as if it had
  been driven. **It is the one place in the project where a classification is
  invented rather than read back from AC**, which is why it is seeded - the same
  weekend always invents the same order, and reloading never reshuffles a grid.
  Leaving those segments unrun was the alternative and is worse: the front of
  the grid would stand in the order the last driven segment left it, which is to
  say the segments never happened. The persistent AI field Phase 5 introduces is
  what would let them be simulated on driver ratings rather than on order alone.
- **Retirements genuinely cannot be observed.** AC writes no retirement flag,
  so a car that stops is indistinguishable from one never classified, and
  being lapped is the only under-distance case that can be produced on purpose.
  Positions with retirements and penalties still wait on Phase 12.
- **Closing the app while a race is running loses that launch.** The wait for
  `race_out.json` is a watcher in main, and it dies with the process, so a result
  written meanwhile is never adopted: the launch simply reads as still pending
  and has to be run again. The CLI has the same hole and an answer for it -
  `npm run watch` reads whatever AC last wrote - and the app wants the same
  "adopt the last result" action rather than a longer-lived watcher.
- **Quitting a race does not abort it.** AC runs it to completion without the
  player, at normal AI pace, and writes a full result recording them on the
  laps they managed. So a launch never half-runs and there is nothing to resume
  inside one - only which launches of a weekend have been run needs tracking.
  It also means a mid-race quit reads exactly like being lapped, which is the
  retirement problem again, and serves as a workable DNF proxy for a career.
- `summarise()` sums only valid laps into `totalTime` while counting
  invalidated ones in `laps`, so a driver with a cut lap gets an artificially
  low total and can sort ahead unfairly. **Observed rather than merely feared**:
  the solo-qualifying spike has a driver on two laps whose `totalTime` counts
  one. It is harmless in practice and qualifying, which sort on best lap, and
  bites only a race - where `raceResult` is now preferred anyway. It also presents grid order as a
  result for a zero-lap session rather than saying "unclassified". Both unfixed.
- **Assists are sent and arrive** - measured, not inferred. `race/config` wants
  CM's own serialization rather than an `assists.ini`, and that format was read
  off a saved Quick Drive `.cmpreset`: `AssistsData` is a JSON *string* whose
  contents are themselves JSON, the same convention its sibling
  `TrackPropertiesData` uses, and both deserialize into CM's
  `Game.AssistsProperties`. So `assistsData=` takes the *inner* object, not a
  whole preset. **Two key names are traps**: slipstream is `SlipSteam`, one `s`
  short, and fuel rate is `FuelConsumption`. `races/spikes/assists.json` proved
  all of it at once by reading `cfg/assists.ini` back - CM writes that file in
  the same preparation pass as `cfg/race.ini`, so
  `--enable-race-ini-test-mode` gets the answer without launching. Keep the
  spike: a wrong key here fails silently, with the assist simply left at AC's
  default and nothing said anywhere.
- **Content Manager overwrites the player car's `DRIVER_NAME` with its own
  profile name.** Measured through the test-mode pass: a race sending
  `DRIVER_NAME=Zoltan Quixbarrow` for `[CAR_0]` came back as CM's own name in
  `cfg/race.ini`, so it is not a placeholder being substituted - the key is
  simply not ours to set. AI names in `[CAR_n]` pass through untouched. So the
  `driverName` setting reaches the INI and no further, and its hint - "leave
  this empty to race under whatever name Assetto Corsa picks" - describes what
  actually happens either way. Changing it means changing CM's own player name,
  which we do not own.
- **CM otherwise hands AC the INI we wrote, verbatim.** Same pass, diffed whole:
  the only additions were the track geotag and timezone keys CSP needs, which
  CM derives itself. `[TEMPERATURE] ROAD` in particular is passed through
  untouched, so whatever curve we compute is the one that races - the open
  question about Kunos' curve versus CSP's is about agreeing with CM's Quick
  Drive, not about whether our answer takes effect.
- **Sending assists rewrites the user's own `cfg/assists.ini` and does not put
  it back** - the same intrusion `__CM_WEATHER_CONTROLLER` makes on
  `weather_fx.ini`. CM does it from its own Quick Drive too, so it is not new
  behaviour, but it is ours to own now.
- **A launch ends at its first race**, and **qualifying in a launch owns its
  grid** - both measured, and both now routed around rather than worked within.
  AC offers no way past the chequered flag, so a second race in the same INI is
  listed in the weekend structure and never reachable; and a race asking for
  `STARTING_POSITION` 8 behind a qualifying session started the pole-sitter on
  pole, the key disregarded entirely. **Sessions now run one per launch**, so
  neither can arise: no launch holds a run of anything, qualifying and a race are
  never in the same INI, and `STARTING_POSITION` is always honoured - confirmed
  by driving a qualifying session and then a race through the app, with the
  field ordered on the qualifying times. They are kept here because they are why
  we know the grid can be written at all, and why a bundled qualifying could
  never have been overridden.
- **A qualifying session runs perfectly well on its own** - driven, and the
  first time a qualifying result set the grid of a *separate* launch. Six cars
  classified, the session ended on its own clock, and `raceResult` is absent as
  it always is for qualifying. **An invalidated lap is written as `time: -1`
  with its `cuts` count**, so the `time > 0` filter in `bestLapOrder()` is doing
  real work: a cut out-lap was excluded and the clean lap took pole. AC also
  writes `bestLaps` on a qualifying session, and it sorts to the same order we
  derive from the raw laps. **A practice-only launch behaves the same way** -
  driven, one session of type 1, and it cannot be mistaken for a grid source,
  since `lastQualifying()` matches on type 2 and so a race behind it falls
  through to the seeded skill order.
- **Road temperature is Kunos' curve, with CSP's guards.** The equation is
  stated by Kunos in `content/weather/readme_weather.txt` and implemented as
  `calctemp` in `launcher/themes/default/js/ui.js`; what we run is CSP's
  restatement of it from `extension/internal/lua-shared/sim/weather.lua`, which
  is the same curve algebraically and identical to four decimals from 07:00 to
  18:00. The guards are not decoration: Kunos' launcher only ever offered an
  08:00 to 18:00 slider, our clock offers the whole day, and raw it returns
  214C at midnight. Their `if (!COEFF) COEFF = 1` is reproduced too, so a
  preset declaring zero and a race naming no preset both warm the road.
  **Two things are still unmeasured**: what CM itself writes at 22:00, where the
  two variants disagree, and CSP's evening fade reads about 1.5C warmer at 20:00
  than at 18:00, because winding the phase back down walks over the curve's own
  afternoon peak.
- **A weather controller is either a renderer or a weather in its own right**,
  and `manifest.ini`'s `FOLLOWS_SELECTED_WEATHER` is the only thing that says
  which. Set to 0 the controller drives the weather from its own planner app
  and ignores the race entirely, so Pure, Sol 2.5 dynamic and Live are offered
  as *dynamic weather*; Default, Pure Static, Sol and Sol 2.5 static render
  what the race asked for and are offered as *controllers*. The flags for
  temperature and wind are sometimes a query into the controller's own
  settings rather than a literal, which is reported as "may override" rather
  than guessed at.
- **PURE ships no weather presets.** It renders the CSP weather type, so a
  race asks for one of `ac.WeatherType`'s 33 values and a preset is resolved
  behind it only because `[WEATHER] NAME` needs a folder. Our own `career_*`
  presets win that resolution where one declares the type, since they carry
  the `[RAINFX]` section that makes rain deterministic.
- `__CM_WEATHER_CONTROLLER` overrides the user's own `weather_fx.ini` for the
  race and does not restore it, so it is now written only when the race names
  a controller. What would otherwise render is read back out of
  `weather_fx.ini` and shown, which is what lets the setup screen warn when a
  static weather is about to be ignored by a dynamic controller.
- Career weather presets are written into the AC install (`content/weather/`)
  and stay until `npm run weather -- remove`.
- **Rain works under any controller, including plain CSP** - driven, not just
  read. `races/spikes/plain-rain.json` with the `base` controller and weather
  type 7 put water on the road and spray off the car. **The gate is Custom
  Shaders Patch itself**, whose preview builds carry WeatherFX and RainFX; the
  controller only decides the numbers. So the weather system setting is a
  choice about look and about whether weather can change mid-session, not
  about whether it can rain.
- **Only PURE and Sol read a preset's `[RAINFX]`.** A grep of the whole
  `extension/` tree finds that section in `pureCtrl` and `sol2` and nowhere
  else, so it is their convention rather than a CSP one. Plain CSP still rains -
  RainFX is a core module and `base/controller.lua` sets an intensity
  unconditionally - but from a hardcoded per-type table, so `career_rain` runs
  at CSP's 0.1 rather than the 0.125 it asks for. Three things are involved and
  confusing them is easy: **RainFX** draws the rain, the **implementation**
  (`extension/weather/`) draws sky and clouds, and the **controller** only
  decides the numbers.
- **`weather_fx.ini` has two axes and we own only one.** `CONTROLLER` is set per
  race through `__CM_WEATHER_CONTROLLER`; `IMPLEMENTATION` - the weather style -
  has no per-race equivalent, so the weather system setting deliberately does not
  claim it. A user on PURE's controller with the `base` implementation gets
  PURE's conditions and CSP's sky, and nothing reports that.
- **PURE overwrites its own `Plans/last_used.json` with whatever plan it just
  ran.** So driving a generated plan replaces whatever the user had loaded
  there. Our writer never touches that file and `removePlans` cannot undo it,
  because the damage is done by their app during the race rather than by us
  before it. The settings screen warns about it; nothing else can.
- Errors raised in `src/core/` reach the UI in English. They are diagnostic
  strings, not catalogue keys, so the localisation stops at the boundary.
- **A field larger than a car's livery count used to collapse onto one livery,
  and now cycles.** `nextSkin` handed back `skins[0]` to every entry past the
  last free one, so Formula Abarth's fourteen Tatuus entries over five liveries
  came out as ten identical cars. It now takes how many of that model are
  already placed and wraps - `skins[placed % skins.length]` - so the field runs
  back through the liveries instead. Fixed alongside seats, which is what made
  it visible: eleven identically liveried cars carrying eleven different
  drivers' names is a different order of wrong. **Pinned liveries are also
  reserved before any are handed out**, or an automatically assigned car early
  in the field takes the skin an entry further down asked for by name.
  `npm run dry` was diffed either side and `races/demo.json` is byte-identical,
  its eight cars fitting inside the mod's own eight liveries.
- Liveries are read from `ui_skin.json`, browsable per car, and the player picks
  their own as a second step of the car picker - the same shape as picking a
  layout after a circuit, skipped for a car that ships fewer than two. **A seat
  can now pin one to an AI driver** - `Seat.car` carries a model and a skin -
  but nothing the app ships does: a shipped championship cannot know which
  liveries a user's copy of a mod installs, so assigning them is the editor's
  job and the lowering falls back to automatic assignment for a skin that is not
  there. About a twelfth of liveries ship no `ui_skin.json` at all and a
  handful ship it broken; those wear their folder name and raise no issue, since
  a livery with no metadata still races perfectly.
- The content cache has no migration, by design - and unlike the series format
  it is a counter that genuinely keeps climbing, because what it invalidates is
  derived data nobody authored: `CONTENT_CACHE_VERSION` is
  bumped and the library is scanned again. Bump it whenever `Car`, `Track`,
  `Skin`, `CarPerformance` or the fingerprint encoding changes, and whenever a
  scan starts finding content it used to miss - an unchanged folder keeps its
  fingerprint and would otherwise be served exactly as it was read before.
  Amending the provenance catalogue is the same problem with its own switch: bump
  `CONTENT_CATALOGUE_VERSION` in `src/core/content-catalogue/`, which the cache
  gate checks alongside its own version, so a core-only data edit does not need
  main to know. Forgetting it serves stale provenance from the cache and looks
  exactly like the code not working.
- **The library is stored two ways, and the split is deliberate.** A shipped
  championship is a TypeScript constant, so `CarSpec.GT3_2010S` and
  `Discipline.SPORTSCAR` are real references and a renamed spec is a compile
  error. A user's is JSON under `%APPDATA%/ac-career-mode/series/`, because it
  has to be - those are written outside the build - so what the compiler does
  for the shipped half, `parseSeries` does for theirs at load: every value with
  a closed set behind it is checked and reported. **The compiler still only
  checks half of what matters.** Whether a format's days run in order, whether a
  session that inherits names one that exists, whether two rounds share an id
  are all `validateSeries`, and nothing calls it on the shipped library at build
  time - which is what `src/core/series-library/__tests__/` is for, asserting
  every shipped championship validates clean. **The two catalogues are a
  different case again.** `src/shared/utils/car-classes/` is
  `Record<CarSpec, ...>`, exhaustive over the enum, so adding a spec breaks the
  build until every table is filled in - a guarantee no runtime check recovers;
  and `src/core/content-catalogue/` is not a user document at all, with edits
  that have to invalidate the content cache.
- The **class catalogue is the exception to that**, on purpose. Nothing in
  `src/shared/utils/car-classes/` is baked into a scanned `Car`; class and spec
  are looked up at runtime by both `src/core/content-query/` and the renderer. So
  correcting a row takes effect on next launch with no version to bump - which
  matters, because that data is meant to be iterated on. It is also what lets the
  user's own layer sit over it, which could never live in a cache shared by every
  career. **That layer makes a spec an open set**: a championship may name one the
  user made, and one exported to another machine arrives reporting the spec as
  unknown rather than carrying its definition with it.
