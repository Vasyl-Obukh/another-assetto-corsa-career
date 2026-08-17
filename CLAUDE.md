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
- **TypeScript**, run directly by Node's native type stripping. Nothing is
  compiled: `node spike.ts` just works, and `tsc` is typecheck-only
  (`noEmit`). Relative imports therefore keep their `.ts` extension, and
  `erasableSyntaxOnly` blocks syntax stripping cannot handle (enums, namespaces,
  parameter properties) - use unions and plain objects instead.
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
| `src/cli/` | `scan`, `dry`, `run`, `watch`, `weather`, `testmode`, one per file |
| `src/shared/types/` | Every domain type: content, paths, race, results, settings, IPC |
| `src/shared/constants/` | Time units, settings defaults |
| `src/shared/errors/` | `AppError`, the `ErrorCode` union and its English templates |
| `src/shared/utils/settings/` | Tolerant settings migration, shared by main and renderer |
| `src/core/paths/` | Probes for CM's exe, the AC root and AC's Documents folder |
| `src/core/content/` | Scans installed content; lenient about malformed mod JSON |
| `src/core/race-ini/` | Race definition -> `race.ini` |
| `src/core/launch/` | Cut-base64, URI construction, spawning CM |
| `src/core/results/` | Watching, stable-reading and summarising results |
| `src/core/weather/` | Career weather presets installed into AC's content folder |
| `src/core/ini/` | Minimal INI reader/writer for AC's flavour |
| `src/main/` | App lifecycle, window, settings store, theme, IPC handlers |
| `src/preload/` | The single `contextBridge` surface (`window.api`) |
| `src/renderer/` | React UI; `src/renderer/src/components/ui/` is vendored shadcn source |
| `races/*.json` | Race definitions in our own format |

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

`node spike.ts testmode` prints this with the paths filled in.

When a launch misbehaves, `cfg\race.ini` immediately afterwards is the fastest
diagnostic - it is what CM actually handed AC, rather than what we intended.

## Conventions

**Style.** Airbnb via ESLint; run `npm run check` before committing. The only
deliberate departures are in `eslint.config.js`, each with a reason next to it.

**Names are kebab-case,** files and folders alike - `race-ini/race-ini.ts`,
`use-installation/use-installation.ts`. React components are the one exception
and stay PascalCase, inside a kebab-case folder: `paths-card/PathsCard.tsx`.
Identifiers stay camelCase as usual; only the names on disk change.

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

**What is covered, and what is deliberately not.** `src/shared`, `src/core`, the
renderer's pure helpers, the settings store, and the handful of main-process
functions with real logic behind them (`isOnSomeDisplay`, `toIpcError`) - those
two need a small `electron` fake, since outside Electron the module resolves to a
path string rather than the API.

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

- Results carry no positions or DNFs; standings are derived by sorting on
  laps-then-total-time and are untested against retirements or lapped cars.
  **But**: archived `race_out.json` files carry a `raceResult` array of car
  indices that looks like AC's real finishing order, and neither `types.ts` nor
  `summarise()` reads it. Worth a spike before assuming Phase 12 is the only
  route to positions.
- Assists cannot be set through `race/config` yet - CM wants its own serialized
  preset format there, not an `assists.ini`.
- Only single-session races are proven. Multi-session practice/qualify/race is
  generated but unverified, including whether qualifying sets the grid.
- Road temperature is an approximation of Kunos' curve.
- `__CM_WEATHER_CONTROLLER` overrides the user's own `weather_fx.ini` for the
  race and does not restore it. Correct for a career, but should be surfaced in
  the UI rather than done silently.
- Career weather presets are written into the AC install (`content/weather/`)
  and stay until `node spike.ts weather remove`.
- Errors raised in `src/core/` reach the UI in English. They are diagnostic
  strings, not catalogue keys, so the localisation stops at the boundary.
- `content:scan` returns counts only and re-scans from scratch each time; the
  cache and the paged/filtered channels the browsers need are Phase 2.
