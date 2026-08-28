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

npm run scan   npm run dry   npm run race   npm run watch
npm run results   npm run weather   npm run testmode
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
| `src/cli/` | `scan`, `dry`, `run`, `watch`, `results`, `weather`, `testmode`, one per file - or a folder, where a command needs helpers of its own. All reached through npm scripts, which carry the transform flag |
| `src/shared/types/` | Every domain type: content, classes, ladder, paths, race, results, settings, IPC |
| `src/shared/constants/` | Time units, settings defaults, the `accontent://` scheme, the English wording for every content issue reason |
| `src/shared/errors/` | `AppError`, the `ErrorCode` union and its English templates |
| `src/shared/utils/settings/` | Tolerant settings migration, shared by main and renderer |
| `src/shared/utils/content-url/` | The `accontent://` URL grammar, built and parsed in one place |
| `src/shared/utils/search/` | Folding and term matching for every search box, shared because the browsers query in main and the livery list filters in the renderer |
| `src/shared/utils/car-classes/` | The shipped class catalogue: which grids each catalogued car races on, and which family each grid belongs to. A car may hold several, so both lookups return lists. Resolved at runtime, so it is deliberately not in the content cache |
| `src/core/paths/` | Probes for CM's exe, the AC root and AC's Documents folder |
| `src/core/content/` | Scans installed content, liveries and their `ui_skin.json` included; lenient about malformed mod JSON; fingerprints so a rescan re-reads only what moved |
| `src/core/car-performance/` | `ui_car.json` specs -> numbers, tolerant of free text |
| `src/core/content-catalogue/` | Which folder ID is base game, which DLC pack, whose mod, who redistributes it; every ID listed, nothing inferred |
| `src/core/content-query/` | Pure filter, sort, page and facet counting over a scan; tracks filter per layout and come back grouped one per folder |
| `src/core/race-ini/` | Race definition -> `race.ini` |
| `src/core/launch/` | Cut-base64, URI construction, spawning CM |
| `src/core/results/` | Watching, stable-reading and summarising results |
| `src/core/weather/` | Career weather presets installed into AC's content folder |
| `src/core/ini/` | Minimal INI reader/writer for AC's flavour |
| `src/main/` | App lifecycle, window, settings store, content store, theme, IPC handlers |
| `src/main/content-store/` | The scan, cached to `%APPDATA%`, watched and revalidated |
| `src/main/content-protocol/` | Serves preview images out of the AC install |
| `src/preload/` | The single `contextBridge` surface (`window.api`) |
| `src/renderer/` | React UI; `src/renderer/src/components/ui/` is vendored shadcn source |
| `src/renderer/src/lib/routes/` | Every route pattern, the builders that turn one into a URL, and which destinations navigation offers. `ROUTE.x` is the pattern, `path.x()` is the URL |
| `races/*.json` | Race definitions in our own format |
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

1. Put `--enable-race-ini-test-mode` in CM's `Arguments.txt`
   (`%LOCALAPPDATA%\AcTools Content Manager\Arguments.txt`), one flag per line.
2. Set the same race up in CM's Quick Drive and hit Go - nothing launches.
3. Diff `out\race.ini` against `Documents\Assetto Corsa\cfg\race.ini`.
4. Remove the flag afterwards or CM will never launch a race again.

`npm run testmode` prints this with the paths filled in.

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
generated by `npx shadcn@latest add`. It is kept exactly as upstream ships it -
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

## Known gaps

- Standings are derived by sorting on laps-then-total-time. **`raceResult` is
  real but adds nothing to that**: race sessions carry an array where
  `raceResult[n]` is the car index that finished `n`-th, and across four driven
  races - including one with a deliberately lapped car - it has matched our
  inferred order every time. The array is always the full length of the entry
  list, so it is safe to index. It is modelled on `RaceOutSession` and printed
  by `npm run results`; `summarise()` does not read it yet. Worth adopting for
  race sessions regardless, since it is AC's own answer and cannot inherit our
  sorting bugs - but it is corroboration, not the route to real positions.
- **Retirements genuinely cannot be observed.** AC writes no retirement flag,
  so a car that stops is indistinguishable from one never classified, and
  being lapped is the only under-distance case that can be produced on purpose.
  Positions with retirements and penalties still wait on Phase 12.
- **Quitting a race does not abort it.** AC runs it to completion without the
  player, at normal AI pace, and writes a full result recording them on the
  laps they managed. So a launch never half-runs and there is nothing to resume
  inside one - only which launches of a weekend have been run needs tracking.
  It also means a mid-race quit reads exactly like being lapped, which is the
  retirement problem again, and serves as a workable DNF proxy for a career.
- `summarise()` sums only valid laps into `totalTime` while counting
  invalidated ones in `laps`, so a driver with a cut lap gets an artificially
  low total and can sort ahead unfairly. It also presents grid order as a
  result for a zero-lap session rather than saying "unclassified". Both unfixed.
- Assists cannot be set through `race/config` yet - CM wants its own serialized
  preset format there, not an `assists.ini`.
- **A launch ends at its first race.** Practice and qualifying ahead of a race
  all run in one launch - proven - but AC offers no way past the chequered
  flag, so a second race in the same INI is listed in the weekend structure and
  never reachable. At most one race per launch, last in it; a sprint plus a
  feature is two launches.
- **Qualifying sets the grid, and `STARTING_POSITION` cannot override it.** A
  race asking for position 8 started the pole-sitter on pole and the slowest
  qualifier last - the key was disregarded entirely. It is honoured only in a
  launch containing no qualifying session. So we own the grid exactly when we
  run the race on its own, which is also the case where we need to: a race
  bundled with its own qualifying needs no reconstruction, because AC has
  already done it.
- Road temperature is an approximation of Kunos' curve.
- `__CM_WEATHER_CONTROLLER` overrides the user's own `weather_fx.ini` for the
  race and does not restore it. Correct for a career, but should be surfaced in
  the UI rather than done silently.
- Career weather presets are written into the AC install (`content/weather/`)
  and stay until `npm run weather -- remove`.
- Errors raised in `src/core/` reach the UI in English. They are diagnostic
  strings, not catalogue keys, so the localisation stops at the boundary.
- Liveries are read from `ui_skin.json` and browsable per car, but nothing pins
  one to a driver yet - that needs the driver, team and seat entities Phase 4
  introduces. About a twelfth of liveries ship no `ui_skin.json` at all and a
  handful ship it broken; those wear their folder name and raise no issue, since
  a livery with no metadata still races perfectly.
- The content cache has no migration, by design: `CONTENT_CACHE_VERSION` is
  bumped and the library is scanned again. Bump it whenever `Car`, `Track`,
  `Skin`, `CarPerformance` or the fingerprint encoding changes, and whenever a
  scan starts finding content it used to miss - an unchanged folder keeps its
  fingerprint and would otherwise be served exactly as it was read before.
  Amending the provenance catalogue is the same problem with its own switch: bump
  `CONTENT_CATALOGUE_VERSION` in `src/core/content-catalogue/`, which the cache
  gate checks alongside its own version, so a core-only data edit does not need
  main to know. Forgetting it serves stale provenance from the cache and looks
  exactly like the code not working.
- The **class catalogue is the exception to that**, on purpose. Nothing in
  `src/shared/utils/car-classes/` is baked into a scanned `Car`; class and spec
  are looked up at runtime by both `src/core/content-query/` and the renderer. So
  correcting a row takes effect on next launch with no version to bump - which
  matters, because that data is meant to be iterated on. It also survives the
  user-override layer a later phase adds, which could never live in a cache
  shared by every career.
