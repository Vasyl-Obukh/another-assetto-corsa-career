# Another Assetto Corsa Career

## What this is

A career mode application for Assetto Corsa, in the spirit of *Zero to Apex* for
Automobilista 2: structured championships with progression, standings and
persistent results, wrapped around races the user actually drives.

The defining feature is **user-authored racing series**: championships built from
any installed content, mods included, in our own JSON format. AC's native
`content/career/<SERIES>/series.ini` is deliberately not used.

Races launch through **Content Manager**, never by running `acs.exe` directly.
CM's `GameWrapper` runs a preparation pass (CSP configs, weather controllers,
track properties, car-specific controls) before the game starts, and bypassing
it breaks CSP, PURE, rain FX and the rest.

Planned work lives in [ROADMAP.md](ROADMAP.md), which doubles as the TODO list -
check it before starting anything, and tick items off as they land.

**If you are building a screen, read *Colour is not optional* below first.** A
screen of grey chips has been shipped and sent back three times.

## Stack

- **Node.js 24+** - a hard floor: native `.ts` execution and `import.meta.dirname`.
- **TypeScript**, run directly by Node; `tsc` is typecheck-only (`noEmit`), so
  relative imports keep their `.ts` extension. The CLI scripts pass
  `--experimental-transform-types` for enums - **use the npm scripts, never
  `node spike.ts` directly**. `main`, `preload` and `renderer` are bundled by
  electron-vite and never see this.
- **Electron** (Windows-only), built by **electron-vite**. Hide the window or
  drop to the tray while a race is live - the app sits beside a running game.
- **React 19**, **shadcn/ui** on Radix, **Tailwind v4**. shadcn components are
  vendored in `src/renderer/src/components/ui/`.
- **react-i18next** for translations, `Intl` for dates, numbers and money.
- **ESLint**: Airbnb (`eslint-config-airbnb-extended`) plus typescript-eslint,
  with React/hooks/jsx-a11y scoped to the renderer.
- **Zero runtime dependencies**: everything lives in `devDependencies`, bundled
  or provided by Electron. `src/core/` is stricter still - dependency-free and
  runnable by bare Node, which the lint config enforces.

```
npm run dev       # electron-vite dev server
npm run build     # -> dist/{main,preload,renderer}
npm run start     # run the built app
npm run package   # build, then a Windows installer in release/ (electron-builder.yml)
npm run release   # the same, uploaded to a draft GitHub release (needs GH_TOKEN)

npm run scan   npm run dry   npm run race   npm run event
npm run series   npm run watch   npm run results
npm run weather   npm run testmode
npm run check     # typecheck (both projects) + lint
npm run lint:fix

npm test          # jest
npm run test:watch
npm run test:coverage
```

Both `npm run check` and `npm test` must pass before committing. After touching
anything under `src/core/`, `npm run dry` must reproduce the same `out/race.ini`
as before - the CLI is the core's regression harness.

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

**A championship round lowers into an ordinary `RaceDefinition`**
(`src/core/series/`) and runs through `planEvent`, `buildGrid` and
`buildRaceIni` exactly as a hand-authored event does - nothing under `event/`,
`race-ini/` or the race store knows what a series is. Quick races and historic
events are one-round championships for the same reason. **Sessions run one per
launch** (see *AC and CM behaviour*), so `src/core/event/` splits an event into
launches and carries the grid across them.

## Layout

Four layers, and imports run one way only:

```
shared  ->  core  ->  cli
                  ->  main
        ->  renderer
```

- **`src/shared/`** - types, constants and pure helpers both processes need.
  Imports nothing of ours and touches neither `node:` nor the DOM, since both
  tsconfigs compile it. Anything main and the renderer must answer identically
  lives here - the renderer may not import core.
- **`src/core/`** - the AC integration: file I/O and process launches, no
  Electron, runnable by bare Node.
- **`src/main/`**, **`src/preload/`**, **`src/renderer/`** - the Electron process
  model. The preload exposes a single `contextBridge` surface, `window.api`.
- **`src/cli/`** - the `spike.ts` command implementations, one per file or folder.

There is no project-references setup (`composite` conflicts with `noEmit`), so
`npm run typecheck` runs `tsc` twice.

Each module documents itself in JSDoc - read it before changing the module. What
follows is the map, plus the rules that are easy to break from outside.

### `src/shared/`

- `types/` - every domain type. `constants/` - time units, settings defaults,
  `DISCIPLINES`, assists, CM flags, content-source pages, rating figures and the
  like. `errors/` - `AppError` and the `ErrorCode` union.
- `utils/` - one folder per question both processes answer: `settings`,
  `career-settings`, `career-eligibility`, `content-sources`, `recommended-tracks`,
  `series-toggles`, `inbox`, `contracts`, `sponsors`, `prizes`, `entry-fees`,
  `car-prices`, `car-sale`, `garage`, `editions`, `standings`, `historic`,
  `standalone`, `weather-types`, `wet-weather`, `conditions`, `units`, `nations`,
  `localized-text`, `car-classes`, `class-layer` and so on.

Rules that live here:

- **Settings readers are tolerant**: `readSettings` and `readCareerSettings`
  coerce field by field and never throw. A career's opponents, aids and currency
  are **null while it follows the app's**; its calendar settings are its own.
  `settings.seriesActive` and `historicActive` hold only deviations from the default.
- **The class catalogue is always passed in**: every lookup takes a
  `ClassCatalogue` (`resolveCatalogue` lays the user's `car-classes.json` over
  the shipped tables). `SHIPPED_CATALOGUE` is the default only at core entry
  points. Class, spec and car price are resolved at runtime, never baked into
  the content cache.
- **Every shipped round names a recommended layout**
  (`Round.track.recommended`), never a folder, Kunos' circuits included, so a
  track chosen for a layout races every round there; `withRecommendedTracks`
  resolves it before anything lists, judges or lowers a championship. `guessTrack`
  is only ever offered, never raced unasked. A track standing in for a layout
  with too few pit boxes leaves the round unraceable; the grid is never cut.
- **Content-source switches govern the app's own championships only**, start
  off, and hide a spec championship only once nothing of its grid is left.
- **Not allowing rain draws nothing**: the stored weather draw is untouched and
  wet types are swapped on read. `nearestOffered` keeps wet wet and dry dry.
- **Nation codes are AC's own** (`NATION_CODES`, the flags in
  `content/gui/NationFlags`), stored as codes and named when shown.
- **Units**: everything stays metric on disk; only what is shown and typed converts.
- **Money**: a car already bought sells and repaints on what was paid and listed
  then (`OwnedCar.listed`); a sale discounts only the purchase; sponsor backing
  is never spent unasked. A purse is paid at its class's share (`paidTable`):
  in proportion to a field under 12 cars, and for a historic event scaled to
  the rung it is raced from - always `purseRung`'s answer, so what is shown is
  what is paid. Read it through `paidTable` or `prizeFor`, never `prizeTable`,
  wherever an amount is paid or shown. Rent is capped by the rung it is raced
  on (`rentOf(price, rentRung(...))`).
- **The player's seat raced without them is a row of its own** in the standings.
  In copy it is a reserve driver - never write "stand-in".

### `src/core/`

| Path | Purpose |
| --- | --- |
| `content/`, `car-performance/`, `loose-number/` | Scanning installed content and reading mod free text. Lenient: skip, never throw |
| `content-catalogue/` | Which folder is base, DLC, whose mod, who redistributes it. Every id listed, nothing inferred |
| `content-query/` | Filter, sort, page and facet counts over a scan |
| `paths/`, `home-region/` | Probing CM, the AC root and Documents; the Windows country for default units |
| `race-ini/`, `ini/`, `launch/` | `race.ini`, AC's INI flavour, the CM URI and assists serialization |
| `results/` | Watching, stable-reading and summarising `race_out.json` |
| `event/` | Lowering an event into launches and carrying grids across them. A pure reducer |
| `series/`, `series-file/` | Validating, reading and writing, and lowering a championship |
| `series-library/`, `historic-library/` | Shipped championships and historic events - TypeScript under `shipped/`, one per file - merged with the user's JSON |
| `weather/`, `weather-forecast/`, `weather-plan/` | The user's CSP weather settings (read-only), generated forecasts, PURE and Sol planner plans |
| `season-calendar/`, `historic-draw/`, `round-simulation/`, `season-scoring/` | Dating a season, drawing historic events, simulating rounds nobody drove, scoring |
| `career-money/`, `career-rating/`, `seat-offers/`, `sponsor-offers/`, `paddock-news/`, `car-sale/` | A career's money, rating, contracts, sponsors, inbox news and weekly sale. Pure and seeded |
| `quick-race/` | A Race tab event as a one-round championship |
| `seeded-random/` | Park-Miller and the string hash that seeds it |
| `cm-arguments/` | CM's `Arguments.txt`, one flag per line |

Rules that live here:

- **A race is laps or a distance, never the clock** - offline AC has no timed
  race. `validateSeries` reports `series.race.timed` and `buildRaceIni` throws
  `race.session.raceNotInLaps`.
- **AI strength is offsets over the player's own** `AiBase`: championship,
  class, round, seat and the career's own steps. Each class's figure is stamped
  on the `LaunchRecord`, so a result says what it raced at.
- **A career stores the weather draw, never the substitution**: what the
  install and the allow-list can race is applied on read.
- **Everything seeded leads with what varies**, because `seedFrom` is a running hash.
- **Every ledger and rating line is keyed by what it settles**
  (`fee:<raceId>`, `race:<raceId>:<launch>`, ...), so `settle` reruns after any
  change and pays nothing twice. Ratings apply in the order sessions landed.
- **Career race ids carry their run**: `runRaceId` appends `@<season>.<edition>`.
- **Only shipped championships carry an authored id**; every other gets a UUID
  from `newSeriesId`, and no id ever changes. A user's series file is addressed
  by file, not id. A user file with a shipped id overrides it (`adjusted`), and
  deleting the file reverts it.
- **`parseSeries` casts rather than rebuilds**, so unknown keys round-trip
  through `writeSeries`. The shipped library is validated by the
  `series-library` tests, not by the compiler.
- **Moving on never costs a round unasked**: anything that would lose rounds
  lists them in `SkipDialog`, and main refuses unless the request says `skip`.

### `src/main/`

| Path | Purpose |
| --- | --- |
| `career-store/` | Careers and standalone championships: state, clock, money, rating, inbox, saves |
| `race-store/` | The single launch slot, its progress and every archived result. Holds one event at a time and owns none |
| `quick-race-store/` | The Race tab's events, a file each under `race/quick/` |
| `series-store/` | The championship library in memory; a second instance serves historic events over `historic:*` |
| `class-store/` | The user's layer over the class catalogue, `car-classes.json` |
| `content-store/` | The scan, cached to `%APPDATA%`, watched and revalidated |
| `settings-store/`, `theme/`, `window/` | Settings, the resolved theme, the window |
| `save-files/`, `zip-archive/` | A slot's saves - `quicksave`, `autosave-<n>`, a UUID per named save - and career backups |
| `content-protocol/` | `accontent://`: preview images and nation flags out of the AC install |
| `ipc/` | Handlers and native dialogs, so the stores stay free of Electron |

- **A career is never hidden**: an unreadable `state.json` is replaced by the
  newest save that reads, else listed as an `UnreadableCareer`. A save snapshots
  state, never the profile, and copies no results.
- **Writes push**: a command that changes a library pushes it whole
  (`series:changed`, `classes:changed`), since several screens read it at once.
- **IPC handlers never throw across the boundary**: each resolves an
  `IpcResult` envelope that the renderer unwraps into a real rejection.
- **Main owns the theme** (`nativeTheme`) and pushes it; the renderer only
  stamps `data-theme`.
- **Paths**: `probePaths()` never throws (diagnostics); `resolvePaths()` throws
  (the CLI). Precedence is override, env var, registry, Steam, default, and **an
  override is authoritative** - a bad one is reported, never bypassed.

### `src/renderer/`

- `screens/` - one folder per route-level screen. `lib/routes/` holds every
  route pattern (`ROUTE.x`), URL builder (`path.x()`) and `BACK_LABEL`.
  Results, History, Finances, Rating and Contracts live under `/home/` and are
  not in `NAV`.
- `components/` - shared pieces; `ui/` is vendored shadcn. The logo is
  `app-logo/` (`AppMark`, `AppWordmark`); `resources/icon.ico` is the window
  icon, the same mark on the welcome gradient.
- `lib/` - pure read-side helpers per screen family (`finances`, `rating`,
  `inbox`, `contracts`, `season-review`, `classification`, ...), plus
  `accents.ts` (colour maps several screens share), `layout.ts` (shared
  widths), `nav-history/`, `stored-preference/` and `browser-memory/`.
- `lib/series-kind/` - one set of screens serves both the championship and the
  historic libraries, and wording follows the kind through `useKindTranslation`.
- `car-browser` and `track-browser` expose a `*BrowserBody`, which is also every
  picker, the Store, the Garage and Your content.

## Verifying changes to race.ini

Content Manager can write `race.ini` without launching the game:

1. `npm run testmode -- on` (writes `--enable-race-ini-test-mode` into CM's `Arguments.txt`).
2. Restart CM, set the same race up in Quick Drive and hit Go - nothing launches.
3. Diff `out\race.ini` against `Documents\Assetto Corsa\cfg\race.ini`.
4. `npm run testmode -- off` afterwards, or CM will never launch a race again.

`npm run testmode` alone prints the procedure with the paths filled in. The flag
is deliberately CLI-only. The same pass writes `cfg\assists.ini`. When a launch
misbehaves, `cfg\race.ini` straight afterwards is what CM actually handed AC.

## Conventions

**Style.** Airbnb via ESLint; the deliberate departures are in `eslint.config.js`
with reasons. **Names on disk are kebab-case**, except React components, which
are PascalCase inside a kebab-case folder (`paths-card/PathsCard.tsx`).
**Enum members are SCREAMING_SNAKE_CASE** with kebab-case values, since the
values reach disk and i18n keys; an initialism keeps its case (`DLCPack`).

**One kind of thing per file**: `types.ts`, `constants.ts`, `utils.ts`, and the
module's own file named after its folder (`results/results.ts`). A folder that
only holds a set of functions puts them in the folder-named file, with no
`utils.ts`. A small self-contained file may stay whole, and a component may keep
its props interface beside it. **`index.ts` only re-exports, never implements.**

**Import the folder, not the file inside it.** Whether you write `/index.ts`
depends on who runs the code:

- `src/renderer/` omits it (`moduleResolution: bundler`).
- `src/core/`, `src/cli/`, `src/shared/`, `spike.ts`, `src/main/` and
  `src/preload/` spell it out - bare Node has no directory index resolution, and
  the root tsconfig stays on `nodenext` to catch the mistake.

A directory may not share a name with a sibling file (it resolved wrongly on
Windows). Import order is enforced by `import-x/order` - run `npm run lint:fix`.

**Code.** One component per file, an arrow const named for the file. Arrow
functions unless a declaration is required. Named React imports. Time units come
from `src/shared/constants/time.ts`. Types and constants two layers share go in
`src/shared/`; anything bound to one util lives beside it.

**JSDoc on everything** except function components: every function and every
property, always the multi-line form, with `@param` for each parameter and
`@returns` where there is one - even for a one-sentence property:

```ts
/**
 * Scans all installed cars.
 * @param contentDir The AC content directory
 * @returns Every installed car, sorted by display name
 */
export const scanCars = async (contentDir: string): Promise<Car[]> => { … };
```

**Comments are `//`, and short.** Explain only what is genuinely non-obvious: a
protocol quirk, a value from another program's source, an invisible reason.

**Hyphens, never en or em dashes**, in comments, JSDoc, UI strings and docs.

**Errors we raise carry a code**: `throw new AppError('race.track.notInstalled', { track })`.
English templates live in `src/shared/errors/constants.ts`, merged into i18next
at init; `uk.json` carries its own `errors` subtree; the renderer resolves them
with `useAppError()`. Errors from outside (errno, spawn failures) travel raw. A
message meaningful in one surface only is appended there (`describeProblems` in
`src/cli/utils.ts`).

**Fail loudly at validation.** Several integration points fail silently - the
wrong weather controller just gives the wrong weather - so validate against
installed content before launching. **Mod tolerance**: content readers skip
malformed input and never throw; a corrupt `settings.json` is quarantined and
replaced with defaults.

**No schema migrations before the first release (Phase 14).** Every persisted
format, `CONTENT_CACHE_VERSION` and `CONTENT_CATALOGUE_VERSION` included, stays
at version 1. A format change is: change the type, change the reader, leave the
version alone, and say which file is now stale. The content cache
(`%APPDATA%/another-assetto-corsa-career/content-cache.json`) goes stale whenever `Car`,
`Track`, `Skin`, `CarPerformance`, the fingerprint, what a scan finds or the
provenance catalogue changes - unchanged folders are otherwise served as before.

**Deleting files is the user's to do.** Name the stale file and why. Anything
outside the repo (`%APPDATA%/another-assetto-corsa-career/`, the AC install, CM's folders) is
always asked for, never deleted; files inside the repo are named, not removed unasked.

### UI

**No bare strings**: everything goes through `t()`, enforced by
`react/jsx-no-literals`. Dates, numbers and money go through
`src/renderer/src/i18n/format.ts` - nothing calls `Intl` directly.

**Screens say what is, not how it is worked out.** Copy states the facts the
player acts on and stops - no hints explaining formulas, rules or odds. A hint is
one short line for something the screen cannot otherwise show, and never
restates the page's context. Mockups follow the same rule; the reasoning goes in
their notes.

**Colours live in `src/renderer/src/globals.css`.** A hardcoded colour anywhere
else is a bug. A colour map read by more than one screen lives in `lib/accents.ts`.

**Components, not pasted classes.** `<ScreenBody>` owns the scroller and the
content column. A settings card is `<SettingsSection>`; a one-switch setting is
`<SwitchTile>`. A menu button is always `MoreVerticalIcon`, mockups included.

**Navigation.** A screen reached from another heads itself with `<ScreenHeader>`
(Back is always `<BackLink>`; the header is `z-20`). Back steps through the
window's history and names that page; `back` is only the fallback. A screen
showing one thing names itself with `usePageName` once loaded, and a new route
needs a `BACK_LABEL` entry. A screen with no Back sets `backToTop` on
`ScreenBody` - never inside a picker.

**A picker's second step is laid over its browser (`z-20`), never swapped for
it** - unmounting the browser loses its filters and scroll.

**Configuration is changed in Settings only.** A screen showing a problem a
setting fixes links there (`TrackSettingsLink`), never hosts the control. The
one exception is the header's light/dark switch (`ThemeToggle`); "System" is
still picked in Settings alone.

**Every list remembers how it was left.** Filters, sort and cards-or-table are
`usePreference` (localStorage, survives a restart), read back through a
tolerant reader (`readOneOf`, `readFields`) since what is stored may predate
the screen. Search text (`useRememberedSearch`) and scroll (`browser-memory`)
last only as long as the window. A picker keeps only its cards-or-table, shared by every
picker of its kind; its filters start fresh. A season or round being looked
at is not a filter and opens on the current one.

**A loading page is the page with its data still to come.** Everything not
data-dependent renders for real - titles, tabs, headings, closed sets in their
colours - and data is `<Shimmer>` blocks of the right size and place, rooted in
`<Loading>`, repeated with `slots()`. A control awaiting its value takes `null`.
Each skeleton is a `*Skeleton.tsx` beside its component, and **a layout change
carries its skeleton with it** - check both in both themes. A temporary delay in
`handle()` in `src/main/ipc/utils.ts` holds a loading state to look at; revert it.

**Cursor.** One unlayered rule at the end of `globals.css` gives clickables a
pointer, outranking shadcn's `cursor-default` utilities; disabled controls are excluded.

### Colour is not optional, and this is the rule that keeps being broken

**Read this before writing a screen, and again before reporting one finished.**
`outline` and `secondary` chips are the path of least resistance, not a default.

1. **List every chip on the screen.** Is what it says one of a *closed set* - a
   discipline, session type, provenance, budget tier, podium place, origin? Yes.
   A car count, lap count, catalogue name, free text? No.
2. **Every closed-set chip gets a colour family.** If none exists, add one to
   `globals.css` with a note saying which hues it avoids and why.
3. **Everything else is neutral on purpose**, with the reason in a comment at the
   call site.
4. **Look at it.** If a screenshot of the screen is grey, the work is not done.

The colours themselves:

- **A colour has to mean something.** A genuine catch-all stays neutral - the
  four exotic session types share one grey - but be strict: `road` was once made
  grey as a catch-all, wrongly, because it is a rung of the ladder.
- **Mid-tone both ways**: a tinted chip is about `0.93` lightness over `0.4` in
  light, `0.33` over `0.86` in dark. Nothing pure, nothing near-black or near-white.
- **Hues clear of each other** wherever two families share a screen.
- **When hues run out, never grey.** Use an ordered scale of named materials for
  anything ordinal (tiers platinum, gold, silver, bronze, with Rookie a deep
  green; the podium metals), or share a hue with a family that never appears on
  the same screen and say so in `globals.css`. Lower chroma can carry an ordered
  scale on spent hues (the climate chips). **Depth within one hue is not a
  technique** - three lightnesses of one hue read as one colour at chip size.

Hues in use - read the notes in `globals.css` before placing a new one: budget
independent 18, destructive and the logo red 27, sale tag 45, podium bronze 52, Sell amber 62,
DLC 75, warning 80, podium gold 88, sportscar 112, budget privateer 132, Rookie
142, race 150, success / base provenance / points finish 155, touring 175,
modified origin 195, single-seater 212, redistribution 235, practice 250,
primary 262, road 270, mod provenance 295, qualify 310, budget works 320, custom
origin 340. Shared on purpose: the climate chips (70, 108, 150, 232 at half
chroma), class slots (195, 18, 340, 128), save kinds (340, 18, 232), storm 300
and snow 210, contracts 295, sponsor 350 and partner 200, renewal 250, debrief
175, championship result 110, and the invitation states on 80, 155, 232 and the
missed rose.

Light mode: the page is a cool grey and a card is white.

## Tests

Jest, in a `__tests__/` folder inside the module, named after the file tested
(`race-ini/__tests__/race-ini.test.ts`, never `index.test.ts`). Shared fixtures
go in `fixtures.ts`.

**Workflow rule: no new tests while making a change.** Update only the tests the
change breaks. Once the change is reviewed and approved, cover the new and
updated functions in a follow-up pass.

- One root `describe` per file, named for the module path
  (`core/race-ini/utils`), and one nested `describe` per exported function.
- Import the globals explicitly from `@jest/globals`.
- Name each `it` for the behaviour, not the mechanism.
- Mock the filesystem with `jest.mock('node:fs/promises')` - Jest runs CommonJS.
- Above a test guarding a fixed bug, say so in a comment.
- **Nothing testable may import `react-router`** (ESM-only, and it reaches
  `import.meta.hot`) - which is why `lib/routes/` builds paths itself.
- **`src/cli/constants.ts` cannot be imported by a test** (`import.meta.dirname`);
  mock it.
- **Stores are tested through their commands** over the fakes in
  `src/main/__tests__/fakes/`, built with `fake()`, which throws on any member a
  test did not give it. Assert on what the store answers and writes, never on
  which fake it called; the career store's suite is the model. A store that
  dates anything runs under fake timers that fake the clock alone.

Covered: `src/shared`, `src/core`, the CLI's and the renderer's pure helpers,
the stores in `src/main/`, and main functions with real logic (`isOnSomeDisplay`,
`toIpcError`, over a small `electron` fake). Out of scope: React components, the
window and app lifecycle, `registerHandlers`.

**Vendored shadcn** (`components/ui/`) is kept exactly as upstream ships it and
exempted in `eslint.config.js`. There is no `components.json` - `init` would
rewrite `globals.css` - so a new component is copied from upstream by hand, its
Radix package pinned exactly in `devDependencies`.

## AC and CM behaviour we depend on

Measured unless marked otherwise. `races/spikes/` holds one probe per question,
its procedure in its `notes` - `npm run race -- spikes/<name>`, then `npm run results`.

**Launching**

- **One session per launch.** A launch ends at its first race, and qualifying in
  the same launch ignores the race's `STARTING_POSITION`. Separate launches honour it.
- **Quitting a race does not abort it**: AC runs it to the end and writes a full
  result, which reads like being lapped - a workable DNF proxy. Retirements and
  penalties cannot be observed at all.
- **Closing the app mid-race loses that launch** - the watcher dies with main,
  and the launch reads as pending. `npm run watch` adopts the last result in the
  CLI; the app still wants the same action.
- **CM overwrites the player's `DRIVER_NAME`** with its own profile name; AI
  names pass through. Otherwise CM hands AC our INI verbatim, adding only the
  geotag and timezone keys CSP needs.
- **`[OPTIONS] USE_MPH` does nothing** - AC reads `cfg/gameplay.ini`, which we
  leave alone.
- **Assists**: `assistsData=` takes CM's own `AssistsProperties` as the inner
  object of a JSON string inside JSON. Traps: slipstream is `SlipSteam`, fuel
  rate is `FuelConsumption`. A wrong key fails silently - keep
  `spikes/assists.json`. Sending assists rewrites the user's `cfg/assists.ini`
  and never puts it back.

**Results**

- A race is classified by AC's `raceResult`; practice and qualifying are
  inferred, and `SessionSummary.order` says which.
- An invalidated lap is `time: -1` with its `cuts`, so the `time > 0` filter in
  `bestLapOrder()` matters.
- `summarise()` sums only valid laps into `totalTime` but counts every lap in
  `laps`, and shows grid order for a zero-lap session. Known and unfixed;
  harmless outside races.
- **A knockout segment the player is out of is simulated** - seeded, recorded
  `skipped: true` - the one invented classification inside a driven event.
  Whole rounds nobody drove are simulated by `round-simulation/`.

**Weather**

- **Rain works under any controller, plain CSP included** - CSP itself is the
  gate. Only PURE and Sol read a preset's `[RAINFX]`; plain CSP uses its own
  per-type intensities.
- A controller with `FOLLOWS_SELECTED_WEATHER=0` (Pure, Sol 2.5 dynamic, Live)
  is dynamic weather and ignores the race; the rest render what the race asks for.
- `__CM_WEATHER_CONTROLLER` overrides the controller for one race without
  touching `weather_fx.ini`. We own `CONTROLLER`, never `IMPLEMENTATION`.
- **PURE ships no presets**, and the app installs none: a type nothing installed
  declares is simply not on offer.
- **PURE overwrites its `Plans/last_used.json`** with the plan it ran. We cannot
  undo that, only warn.
- Road temperature is Kunos' curve with CSP's guards - raw, it gives 214C at
  midnight. Unmeasured: what CM itself writes at 22:00.
- **Not yet driven**: `MAX_TIME_MULTIPLIER` is a provisional 48 until
  `spikes/time-multiplier` is, and that both planners set the clock to the
  plan's multiplier is read from source. `RAIN_FOR_FULL_WASH` and
  `GRIP_GAIN_PER_SESSION` were never measured.

**Known gaps**

- A mod's layout inside a base circuit (`spa/2022`, `*_osrw`, ...) reads as base
  content. Shipped championships avoid it through recommended tracks.
- Outside a career a forecast is recomputed on every read, so installing a preset
  between setting a round up and racing it can move it. Inside a career the
  draw is stored.
- A championship exported to another machine reports the user's own specs as unknown.
