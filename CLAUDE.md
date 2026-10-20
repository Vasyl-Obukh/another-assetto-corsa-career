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

npm run scan   npm run dry   npm run race   npm run event
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
| `src/cli/` | `scan`, `dry`, `run`, `event`, `series`, `watch`, `results`, `weather`, `testmode`, one per file - or a folder, where a command needs helpers of its own. All reached through npm scripts, which carry the transform flag |
| `src/shared/types/` | Every domain type: content, classes, ladder, series, paths, race, results, event, settings, IPC |
| `src/shared/constants/` | Time units, settings defaults, `DISCIPLINES` in the order the ladder lists them, the assists Assetto Corsa itself ships, the Content Manager flags we offer, the `accontent://` scheme, the English wording for every content issue reason, and the page each DLC pack, mod team and redistributor is got from - a page and never an `acmanager://install`, since that URI wants a direct download and no source we name has one, and here rather than in the provenance catalogue because the renderer is its only caller and nothing in it reaches a scanned `Car`. `Assists` is split in two by `Pick`, never by a second list: `DrivingAids` is what the player chooses and `RegulationKey` is whatever that leaves over, so an assist moves side by side simply by moving in the `Pick` - which is how tyre blankets became a rule a series states rather than a switch in settings |
| `src/shared/errors/` | `AppError`, the `ErrorCode` union and its English templates |
| `src/shared/utils/settings/` | `readSettings`, the tolerant reader behind `settings.json` - every field coerced, nothing thrown - plus `applyPatch`, which is a merge put back through it. Shared by main and renderer. Deliberately not a migration: nothing branches on the version. `allowedWeather` is a list rather than a record of switches, so the file stays readable by hand, and a missing one reads as the default rather than as nothing allowed. `hiddenContentSources` goes the other way and stores what is switched *off* - packs, mod teams and redistributors - so anything the catalogue gains later arrives switched on. `seriesActive` stores neither: it holds only the championships the user actually flipped, either way, over whatever the library says each starts as, and `historicActive` does the same for historic events. The calendar settings are not here: same-day events and how often a season draws historic events are a career's own, in its `career.json` |
| `src/shared/utils/career-settings/` | A career's own settings: `readCareerSettings`, the tolerant reader for the `settings` its `career.json` holds - read field by field like `settings.json`, so a setting that does not read falls back rather than taking the career with it - and `careerOpponents`, `careerDrivingAids` and `careerCurrency`, the career's own where it sets them and the app's while it follows them. **Null is following**: a career's opponents, driving aids and currency are null until it sets its own. Its progression speed is its own alone, with no app setting behind it. The calendar - same-day events and the historic frequency - is the career's alone and has no app setting behind it. Shared because main lowers and launches a career's events on them and the renderer shows the figures they come to |
| `src/shared/utils/content-url/` | The `accontent://` URL grammar, built and parsed in one place, and `isServableLayout`, whether a layout's images can be asked for at all |
| `src/shared/utils/search/` | Folding and term matching for every search box, shared because the browsers query in main and the livery list filters in the renderer |
| `src/shared/utils/weather-system/` | Which controller each weather system runs, and whether it can change the weather at all. Shared because main writes the controller into `race.ini` and the renderer decides whether to offer a second slot |
| `src/shared/utils/weather-types/` | Which weather an install and the user's settings can race in - `offerableTypes` and the `WeatherOffer` it builds - what stands in for a type that is not on offer, and the single type a plan collapses to without a planner. Shared because main generates a championship's weather over exactly the set the race screen's menu offers. **`nearestOffered` keeps wet wet and dry dry**, walking `WEATHER_POSITION` and crossing over only when nothing of a weather's own kind is left. Substitution is generation's alone: race.ini still refuses a type no installed preset declares |
| `src/shared/utils/conditions/` | Merging a session's own conditions over the event's defaults. Shared because both the bundler and the race screen need the same answer, and the renderer may not import core. Weather merges as a group, since its three fields answer one question |
| `src/shared/utils/content-sources/` | Which championships the content source toggles offer: `isOffered` over a championship's `SeriesRequirements`, with `poolHolds` for one spec's floor - which `requirementsOf` in core also asks, to find the sources a spec cannot do without - and the sources switched off in settings, and `hiddenCount`, which is what switching one off would cost. Shared because the championships list filters on it and the settings tab that holds the switches shows the same answer. **The switches govern the app's own championships alone** - `hiddenBySources` is false for anything of the user's, since hiding a file they wrote is not ours to do. **Needing is not reaching**: a spec is satisfied by whatever of its grid is left, so switching a pack off hides a spec championship only once its grid falls below `minModels`. **A redistributor counts for cars and not for circuits**: LFM's cars credit no mod team, so `requirementsOf` records who redistributes them and switching LFM off hides what needs them, while a round at one of its layouts is only skipped |
| `src/shared/utils/series-toggles/` | Whether a championship is switched on: `isSeriesActive` is the user's own switch where they flipped one and the listing's `activeByDefault` everywhere else, and `withSeriesActive` drops the key when a switch goes back to that default, so `settings.seriesActive` only ever holds deviations. `hiddenAsFiller` answers the one switch that hides every filler championship. **Starting switched off is the library's call, not the document's** - `SHIPPED` in `src/core/series-library/shipped/` says it per championship, and a user's own always starts on. No championship is "historic": which of ours start off is an authoring rule in ROADMAP.md and nothing more. "Historic" names historic events, single events of their own, whose switches are read through the same two functions over `settings.historicActive` |
| `src/shared/utils/historic/` | Telling a season's championships from its historic events: `isHistoric`, `championshipEntries` and `historicEntries`. Both are season entries, which is what lets the clock, clashes and launches treat them alike; shared because main flags a historic event on the calendar and the renderer keeps them out of every list of championships |
| `src/shared/utils/standalone/` | A standalone championship read off the career it is kept as: `standaloneEntry`, the one edition its one season entered, and `standaloneStanding`, how far through it is, the player's place and points, and whether it is over. **A standalone championship is a career of kind `championship`** - `CareerProfile.kind`, a profile without one reading as a career - kept under `championships/<id>/` by the same career store, which finds an id's folder by probing both roots. Shared because main lists them and refuses what they cannot do (entering, withdrawing, moving the clock), and the renderer heads the window and the championship's page with the same answer |
| `src/shared/utils/eligibility/` | Which cars an eligibility rule names, and every car a class entry may field across the calendar. Shared because the validator and the championship editor need the same answer, and the renderer may not import core |
| `src/shared/utils/nations/` | What a nation code is called: `nationName` over `Intl.DisplayNames`, and `isNationCode`, and `nationOfCountry`, which reads the free-text country a mod writes - "GERMANY", "U.S.A.", "Italy /USA" - as a code, so the browsers can filter on it and draw its flag. **The codes are Assetto Corsa's own** - `NATION_CODES` is exactly the flags in `content/gui/NationFlags`, which is ISO 3166-1 alpha-3 plus ENG, SCT, WLS and NIR, and not the sports codes a race programme prints; a code AC has no flag for races flagless with nothing said, which is why the championship reader refuses one. A seat or a team stores the code alone and its name is looked up when shown - in English for `race.ini`'s `NATIONALITY`, in the user's language in the renderer, which translates the four home nations itself since Intl names no subdivisions. Shared because main writes the one and the renderer shows the other |
| `src/shared/utils/road-temperature/` | Kunos' road temperature curve with CSP's guards, `roadTempCurve`, and `followedRoad`, the road it gives a session that sets none; `parseClock`, which reads a time of day, and `clockOf`, which writes one. Shared because `race.ini` writes the road and the conditions editor shows what following the air comes to before anything is set; the long note on why the curve is guarded sits beside it |
| `src/shared/utils/lap-time/` | `m:ss.mmm`, and `formatGap` for a gap behind the leader, shared by the CLI's timing sheet and the results screen. Deliberately outside the `Intl` formatters: a lap time is a motorsport convention, not a locale decision |
| `src/shared/utils/library/` | Whether content belongs in the library: `isCatalogued`, `isUserAdded` and `isInLibrary`, which is the two read as one question, plus `isUserAddedCircuit`, which leaves the per-layout redistributor out because the user's list names circuits. Shared because main narrows the browsers on it and the renderer badges what the user added. `src/core/content-catalogue/` re-exports `isCatalogued`, since it is that catalogue's question |
| `src/shared/utils/standings/` | `buildStandings`: a season's tables off the rounds scored so far, and `entryResults`, a season entry read as the rounds those tables are built from. Shared because main keeps the career's standings current and the renderer rebuilds them as they stood after any earlier round, which is how a table says who moved. `src/core/season-scoring/` re-exports it. **The player's seat raced without them is a row of its own**: places marked `substitute` belong to the driver the seat names, the seat's own row counts only what the player drove, and the team keeps both |
| `src/shared/utils/prizes/` | What a class place pays: `prizeTable`, one of a class's two tables - its own where it states that table, the championship's otherwise, **each table standing alone** as `ClassEntry.prizes` says - `scaledPrize`, a purse at a progression speed, and `prizeSpeed`, the speed a career is paid at, which is 1 in a standalone championship. Shared because main pays the money and every screen showing a prize - a round's header, a classification, a historic event's row in the year review - shows the amount the career is paid |
| `src/shared/utils/editions/` | How often a championship runs in a career's season - `editionsOf`, one edition for a year-long championship, two for a half-year one, four for a quarter-length one - and `seasonYear`, which year a season is; `enteredEdition`, the edition a page or a command means when it names none, `editionEntry`, which entry of a season an edition is read back from, and `editionOver`, whether every round of one has run and the last is behind the clock. Shared because main dates and reads each edition and the renderer names and shows the same one: `2027`, `H2 2027`, `Q3 2027` |
| `src/shared/utils/event-format/` | `formatOf` and `defaultFormatOf`: which event format a round runs, its own or the championship's default. Shared because core lowers a round on it and the renderer lists a round's sessions off it |
| `src/shared/utils/ai-figure/` | `aiFigure`: an AI strength or aggression as the player's own plus every offset over it, held inside 0-100, `keptStep`, which checks a step the player takes on the AI's strength - a whole number within `MAX_GRID_OFFSET` - before the career or a race event keeps it, and `withStrength`, which writes one onto whatever carries it. Shared because core lowers a field on it and the renderer shows the figure a seat will race at |
| `src/shared/utils/race-scale/` | Shortening a race at its launch: `RACE_SCALES`, the steps a race is divided by from the full race to 1/48, `scalesFor`, the ones a race of so many laps offers - never under `MIN_SCALED_LAPS` - `scaledLaps`, and `scaledClock`, the race's own time multiplier sped up by the step and held to `MAX_TIME_MULTIPLIER`. Shared because core lowers a launch on it and the round page offers the same steps |
| `src/shared/utils/calendar-days/` | Day numbers off ISO dates - `toDayNumber`, `fromDayNumber`, `addDays`, `daysBetween` - throwing `season.date.invalid` on anything that is not a date. Shared because the season calendar in core and the calendar screen do the same arithmetic |
| `src/shared/utils/quick-race/` | Editing a race event of the player's own: a new one, a class added, moved, edited or taken out, and `withCar`. **Picking a car with no classes makes a class of it** - a field of that car alone, the player's own, named after it and marked `fromCar` - and **while the race's only class races a list of one car, it follows the car rather than limiting it**: `followingClassOf` is that class, the car picker is not narrowed for it, and the next car picked replaces its one car, keeping its size and strength. Its name follows too until the player types one of their own, which is all `fromCar` still marks. `carFits` is whether the car is in the player's class, which the page and main both ask |
| `src/shared/utils/driver-names/` | Names for empty seats off per-nation name books: `fillDrivers`. Shared because the championship editor names a class's empty seats when asked and a quick race names every seat of its field, seeded on the race |
| `src/shared/utils/car-classes/` | The class catalogue as a value: the shipped tables, and `resolveCatalogue` laying the user's layer over them into a `ClassCatalogue`. Which grids a car races on and which family each grid belongs to - a car may hold several, so both lookups return lists. **Every lookup is handed the catalogue it answers from**, so main and the renderer each resolve the same layer and nothing quietly answers from the shipped half; `SHIPPED_CATALOGUE` is the default only at the core's entry points, which is what keeps the CLI seeing the shipped half alone. Resolved at runtime, so it is deliberately not in the content cache |
| `src/shared/utils/class-layer/` | The user's layer over the class catalogue: `readClassLayer`, the tolerant reader behind `car-classes.json`, and the pure edits the class store makes - restating a car's specs, and adding, renaming, moving and deleting classes and specs of the user's. Every edit takes the resolved catalogue beside the layer, because a spec may sit in a shipped class and a car may drop a spec we ship. A car list equal to what we ship drops the override, which is what keeps Revert honest |
| `src/core/series/` | Reading a championship: validating it, saying what it needs against the installed library, and lowering one round into an ordinary `RaceDefinition`. That last part is the point - a round runs through `planEvent`, `buildGrid` and `buildRaceIni` exactly as a hand-authored event does, so nothing under `src/core/event/`, `src/core/race-ini/` or `src/main/race-store/` knows what a series is. **What is missing weighs differently**: every car an entry names is required, since a missing one would empty a seat, while a missing track blocks only its own round - a championship is available once one round can be run, and `requires.rounds` says what the rest need. **A race is laps or a distance and never the clock** - Assetto Corsa times a race on a server alone, so `validateSeries` reports `series.race.timed` for one written in minutes. A distance is in kilometres and becomes laps here - the fewest that cover it, off the installed layout's own length - after the round's `sessionLengths` are laid over its format; a round whose track says nothing of its length cannot run such a race, and its availability says so through `races`, which is also where the calendar reads the lap count a distance comes to. A championship that generates its weather has the forecast written onto the round's sessions here too, which is why `roundRace` takes a `WeatherOffer` - defaulting, like the class catalogue, to what a core entry point sees alone - and an optional `draw`, which is the weather a career already issued for that round: given one it is substituted rather than redrawn, so the event races the forecast the player was shown a week before. **AI strength is offsets over the player's own**: `roundRace` takes an `AiBase` - the career's own opponents where it sets them, else `settings.opponents`, defaulting to `DEFAULT_OPPONENTS` - and adds the championship's, the class's and the round's `grid`, then the driver's own. That driver comes from `request.field`, the `FieldSeat`s `drawField` dealt when a career entered the championship - each AI seat's car, livery and small seeded offsets, frozen for the season - and outside a career the field is drawn unsalted on every lowering, which is the same answer every time. A round that runs other cars than its season does draws its own for that round alone. **A career's own steps on strength fold into that base** - the season's and the round's, through `lowerRound`'s `step` - and `roundRace` stamps each class's figure on the race as `classStrength`, inert, which every launch records on its `LaunchRecord`, so a result says what it raced at whatever the difficulty says now |
| `src/core/weather-forecast/` | Generated weather, in two halves that are stored differently. `drawRound` is the climate's draw - a round's event off its `Climate`, offer-free - and `offerForecast` swaps that draw for what the install and the allow-list can race, then collapses a plan with no planner behind it; `forecastRound` is the two composed, for every caller with nowhere to keep a draw. **The draw is what a career stores**, never the substitution, so switching a weather off in settings reaches a forecast issued a week ago while the draw behind it never moves. **Deterministic by construction**, seeded on the round, then the championship, then a salt naming the career and season - so two careers race different years, and an empty salt is spelled exactly as the seed always was, leaving a round raced outside a career drawing what it always drew. The round id leads because `seedFrom` is a running hash, and ids differing in their last character otherwise seed within a hair of each other. `seasonalProfile` shifts the climate to the month the round falls in, on a cosine peaked in mid-July and mirrored by `Hemisphere` - it moves the odds only, never the draw sequence, so giving a climate a season re-weighted the calendar without re-rolling it. What a round or a session authors wins, a group at a time |
| `src/core/series-file/` | A championship as a document: `unknown` off disk to a typed `Championship`, and back. Every string that indexes a closed catalogue - a discipline, a session type, a weather type - is checked against that catalogue's own members, because a user's file has no compiler behind it. **A spec is checked for shape only**: the user may have made it, so whether it resolves is `validateSeries`' question against the catalogue it is handed. Structural only; whether the championship is coherent is `validateSeries`. `writeSeries` is the other direction, and everything that writes a championship goes through it. **There is no migration**, and that is the policy rather than an omission - see *No schema migrations before the first release*. A championship written against another revision is refused by `validateSeries` and the answer is to delete the file. **Note that `parseSeries` casts the record it read rather than rebuilding it**, which is what makes a rename or a removal a real format change rather than something a tolerant reader could absorb: a key nobody checks still round-trips straight back out through `writeSeries` |
| `src/core/series-library/` | The championships the app ships - TypeScript constants under `shipped/`, one file per championship, so a renamed spec is a compile error and adding a series is adding a file - with `shipped/utils.ts` holding the `team` and `seat` constructors, because an entry list is a table and twenty drivers written out as object literals is not one anybody can read down, `filler()`, which derives a filler championship from the rung below it so the two can never drift apart. **A season holds its real formats and nothing more**: a race whose series states it as a distance is a `distance`, and one stated in laps is laps; a round that runs longer or shorter than its format says keeps its real count as a `sessionLengths` override, never a format of its own. The shipped constants are merged with whatever the user wrote as JSON. `SHIPPED` registers each one with how it starts out - `active`, and `filler` for a championship that only repeats the rung below it in an empty rung of the ladder - and `loadSeriesLibrary` carries both onto the listing; an adjusted one keeps the defaults of the shipped id it replaces. `SHIPPED_SERIES` is the same list without them. A user's file carrying a shipped id replaces it and reads as `adjusted` rather than clashing with it; deleting that file puts the original back, because the override is the file's existence and nothing else. Ladder order is derived from the tiers, so adding a championship never means renumbering one. **It writes as well as reads**: `saveUserSeries` and `deleteUserSeries` are the disk side, and both are addressed by the *file* rather than by the id, because the two are allowed to disagree - `readSeriesDir` keys a championship on the id inside the document, so `weird.json` may perfectly well hold `lotus-cup` and a name computed from that id would hit the wrong file. A new file's name is derived from the id but only once nothing else has spent it - `lotus-cup.json` may hold something else entirely, and writing over it would destroy a file of the user's - and an id that could not safely be a name at all is refused rather than repaired. **Only the championships the app ships carry an authored id**; every other one gets a UUID from `newSeriesId`, because an id is not a thing anyone reads - the library keys on it, `forkedFrom` points at it and results are filed under it, and it can never change. A canonical UUID satisfies `SERIES_ID_PATTERN` as it stands, so the safety layer takes no exception for it. Customise is the one write that keeps the id it was given, which is the whole of how `adjusted` and Revert work. `create` is the other end of that rule: the editor drafts a new championship in full and main replaces whatever id the draft carried |
| `src/core/historic-library/` | The historic events: single events of racing's past a career draws onto its calendar. **Each is an event of its own** - its own classes, teams, track, format and prizes, and no connection to any championship - written as a one-round `Championship`, which is what lets it reuse reading, writing, validating, lowering, field draws, simulation and scoring whole. Kept as the championship library is kept: `SHIPPED_HISTORIC` under `shipped/`, one file per event, and the user's JSON under `%APPDATA%/ac-career-mode/historic/`, through `loadSeriesLibrary` handed that shipped list. `historicProblems` is what a historic event adds to `validateSeries`: one round, a points table that pays nothing, no `seasonLength` or `raceWeekday`. The shipped pool was seeded once from rounds of the switched-off championships and is owned independently since - nothing reads a championship to build one |
| `src/core/historic-draw/` | Drawing a season's historic events, pure and seeded. `historicSlots` cuts the season into quarters, months, fortnights or weeks; `planHistoric` draws one event per stretch on a weekday, preferring a day the career races nothing else, never twice in a season, each stretch seeded on its own place rather than on the draws before it; `historicSeat` picks the seat the player is invited to and its car, and `withPlayerSeat` moves that seat to the end of its class - which is where every lowering, field draw and simulation already takes the player's seat from |
| `src/core/seeded-random/` | The Park-Miller generator and the string hash that seeds it. Its own module because two callers need the same answer twice - the event shuffling a grid with no qualifying to order it, and a series composing a round's field |
| `src/core/season-calendar/` | Dating a career season: `seasonCalendar` spreads a championship's rounds a whole number of weeks apart over its `SeasonLength`, on the one day of the week it races, and `clashes` says which events share a day. **An event takes one day of the calendar**, its race day, however many days its format runs over - a format's `day` is the event's own day one to three, which decides the time of day and how the weather carries over, and never a date that blocks another event out. The day of the week is `raceWeekdayOf` in `src/core/series/`: the championship's own `raceWeekday` where it states one, and otherwise the tier of its highest class - tier 1 on Sunday, tier 2 on Saturday, everything lower on a weekday seeded off its id - which is what spreads a career's championships across the week. **Two entered events on one day clash**: launching one gives the other up, through the same `SkipDialog` as any other lost round, unless the career's own `settings.allowSameDayEvents` is on, when nothing clashes at all. **A career season is a calendar year**, and a championship runs in it as many *editions* as its `SeasonLength` fits - a half-year one twice, a quarter-length one four times - each a season entry of its own; `materialiseEvents` in the career store gives each edition its share of the year's 52 weeks and hands that share to `seasonCalendar`. **A season draws its historic events once**, when it opens - `drawHistoric` in the career store, over the historic events switched on that the install can race and the content sources leave in, at the career's own `settings.historicFrequency` - and a season that has not, such as one begun before the install was located, draws from tomorrow on its next calendar read; `CareerSeason.historicDrawn` says it has. Each is a season entry marked `historic`, the player invited and entered, so it stops the clock, clashes and is missed like any round, and declining one is withdrawing. **The year closes** when the clock crosses 31 December: `closeSeason` gives up what was left and `openSeason` opens the next one empty, which is where prize money and the ladder (Phases 7 and 8) and a contract carrying over (Phase 9) will hang. A career's race ids name their run - `runRaceId` in `src/core/series/` appends `@<season>.<edition>`, `baseRaceId` strips it - so a round of last year still in the race store's slot is never taken for this year's |
| `src/core/career-money/` | A career's money, pure: `feeOf` and `feeOwed`, what a round costs and whether it is still to pay - nothing for a historic event the player is invited to, nor in a standalone championship - `owedPrizes`, every prize earned and not yet on the ledger, and `post` and `payOut`, which write lines into the ledger and the money. **Every line is keyed by what it settles** - `fee:<raceId>`, `race:<raceId>:<launch>`, `standings:<season>:<series>:<edition>` - so working out what is owed again pays nothing twice, which is what lets the career store's `settle` pay out after every change whatever caused it. A race pays the player's own class place, never a stand-in's; an edition pays once it has run its course, and nothing to a championship the player withdrew from; a prize is scaled by the career's progression speed as it is posted, a fee never |
| `src/core/round-simulation/` | Racing a round nobody drove - one the player missed, one run before they entered, every round of a championship they are not in. `simulateRound` walks the event launch by launch through the event's own helpers - `fieldFor` for a knockout, `composeOrder` and `reverseFront` for a grid - inventing each classification off a driver's pace (`seatDraw`, the same offsets `drawField` freezes) and a seeded draw, and scores the round with `scoreRound`, so bonuses and reverse grids pay as they do when driven. **Seeded per seat, with what varies leading the seed**, since `seedFrom` is a running hash: that is what makes a round the same whether the player's seat leads the grid or not. The grid is the one a real lowering builds - the player's seat first - so the event page reads a simulated launch with the plan it already has. **Calculated where needed, stored once it matters**: the career store stores a missed round of its own once its race day passes, and the rounds behind the clock on entering; a championship it is not in is simulated on every read of `career:results` and nothing is kept. An event the player left part-way simulates on from what they drove: the stand-in starts from the back of any grid the player's own qualifying set, and the qualifying points stay the player's, as a `bonusOnly` place that pays and counts as no race |
| `src/core/quick-race/` | A race event of the player's own as the one-round championship it lowers through: `quickChampionship` writes each class as a class entry of seats, named off the race's own id from the shared name books, one round at its track and one event format of its sessions, scored by a points table that pays nothing; `lowerQuickRace` hands that to `roundRace`, so a quick race's multi-class field, AI offsets over the player's difficulty, liveries and class positions are a championship round's. `quickProblems` says what stops it before it can lower - a track, a car, classes the install can field, the car in its class |
| `src/core/paths/` | Probes for CM's exe, the AC root and AC's Documents folder |
| `src/core/content/` | Scans installed content, liveries and their `ui_skin.json` included; lenient about malformed mod JSON; fingerprints so a rescan re-reads only what moved |
| `src/core/loose-number/` | Reading a number out of the free text a mod author wrote - separators, units, "N/A". Shared by the car and track readers, because a car's weight and a circuit's length are the same parsing problem |
| `src/core/car-performance/` | `ui_car.json` specs -> numbers, tolerant of free text |
| `src/core/content-catalogue/` | Which folder ID is base game, which DLC pack, whose mod, who redistributes it; every ID listed, nothing inferred |
| `src/core/content-query/` | Pure filter, sort, page and facet counting over a scan; tracks filter per layout and come back grouped one per folder. **Two sets of lists are one filter each, OR'd**: source, pack, maker and distributor, and class and spec - the browsers show each as one tree, so ticking a branch beside a leaf of another means either. A country is filtered and counted as a nation code through `nationOfCountry`, and a range filter comes with the `Spread` its rail draws under the slider |
| `src/core/race-ini/` | Race definition -> `race.ini` |
| `src/core/launch/` | Cut-base64, URI construction, spawning CM, and rendering assists both ways - Content Manager's serialized JSON for the URI, AC's `assists.ini` layout for reading back what arrived |
| `src/core/results/` | Watching, stable-reading and summarising results |
| `src/core/event/` | Lowering an event into launches, one per session, and carrying the grid and the track across the seams between them. Pure: no I/O, so the state machine is a reducer over a value rather than a store. A launch's field is its own: `SessionDefinition.inherit` names which session a launch follows and how many of it carry over, so a knockout qualifying segment goes out with a short `[CAR_n]` list and a race composes its grid back along the whole chain. A race records its finishing order as its `classification`, so a later race may follow it, and `inherit.reverse` turns the front of an inherited order round for a reverse-grid race. A grid nothing lines up stands on pace **class by class**, in the order the classes first appear, and a race nothing lines up says where the player joins it - last, pole, a slot, or a seeded random one - through `SessionDefinition.start`, which `placePlayer` honours **among the player's own class**: a slot is a place among classmates, never an overall one. `scaleLaunch` shortens a launch's race by one of the steps `src/shared/utils/race-scale/` offers and speeds its clock up by as much - fuel and tyre wear are left alone, so it simply stops less - and `advanceEvent` keeps the step on the launch's `LaunchRecord` as `scale`, only where it ran short. **Every launch of a grid of several classes records each car's class** as `carClasses`, by car index - driven, skipped or simulated alike - which is what places the player in their class wherever only a record and an archive are to hand: the Results page, Home's preview, a round's session list and the Race tab's cards |
| `src/core/weather/` | Career weather presets installed into AC's content folder |
| `src/core/weather-plan/` | Weather plans for the PURE and Sol planner apps: our own step model, a writer per format, and installing them into a slot we own without disturbing the user's. Dynamic weather is driven by those apps, not by `race.ini` |
| `src/core/ini/` | Minimal INI reader/writer for AC's flavour |
| `src/core/cm-arguments/` | Content Manager's own `Arguments.txt`, one flag per line. Line-level and backup-free, unlike `weather-plan`: a flag's presence is the state, so turning it off is a complete undo. The settings screen writes two of the flags; race INI test mode is set through `npm run testmode` alone |
| `src/main/` | App lifecycle, window, settings store, content store, race store, theme, IPC handlers |
| `src/main/content-store/` | The scan, cached to `%APPDATA%`, watched and revalidated. Queries answer over the library - catalogued, or added by the user through `settings.addedContent`, which main hands over with `include()` - unless they set `anonymous`, which answers over every uncatalogued entry instead. Resolved at query time, never baked into the cache |
| `src/main/race-store/` | The launch slot: whichever event raced last, its progress and the launch in flight, all under `%APPDATA%/ac-career-mode/race/`, and every archived result. The same steps `npm run event` runs, in the same order; the wait for a result is detached and reaches the renderer as a push. **It holds one event at a time and owns none of them** - the career's rounds and the Race tab's events each keep their own launches, and `load` puts an event in the slot together with what of it has run, so racing one never costs another anything. **An event part-way through carries on from the race the slot holds** - `slotHolds` - with only its AI levels taken from a fresh lowering, matched by seat through `withLevelsOf`: that is how the difficulty and the player's own steps on strength reach its next session while its weather, its grip and its field stay what it started with. `launch` takes the step a race is shortened by, for that launch alone, and hands it to `scaleLaunch` before anything is written; a plan it installs carries the race's own time multiplier, since both planners set the game's clock to their plan's. `launchResults` is the one reader of an archive's raw race_out.json, which scoring needs. `latest` is Home's preview: it reads archives newest first and stops at the first of another event, so opening the app never reads the whole folder - `sameEvent` is that line - a run-qualified career id or a race event of the player's own whatever the day, else the race and the day - as the Results page gathers them |
| `src/main/quick-race-store/` | The Race tab's events, a file each under `race/quick/`: the `QuickRace` and the launches of it run so far. Launching one lowers it through `src/core/quick-race/` and `load`s it into the race store's slot; each launch that lands is copied back off the race store's push, as the career copies its rounds. A view of one is planned, scored with `scoreRound` and listed with the career's own `eventSessions`, which is what lets the round page's components show it. `archives` is the cheap read beside it - which archives each race's launches wrote, off the files alone and planning nothing - which is what Results, a result's breadcrumb and Home's preview link a session back to its race through |
| `src/main/save-files/` | A slot's saves on disk, each a snapshot of the slot's state and never of its profile - a career's `career.json` holds who races it and how it is set up, `state.json` where it has got to, and only the second is saved, so loading a save keeps the driver and settings as they are: a file each under its `saves/` folder - `quicksave`, `autosave-<n>` and a UUID per named save - written whole and atomically, and read through a reader the slot hands over, so it knows nothing of what a save holds. **The id decides the kind**, so a file edited to call itself named cannot be written over as one, and only a named save is ever renamed, written over or deleted. `autosaveSlot` keeps the newest autosaves up to one short of `settings.autosaves` and gives the new one a number none of those holds. The career store takes an autosave after every session that lands and as each season opens - the first as the career is made, so every career has a save - and **a career is never hidden**: a `state.json` that is missing or does not read is replaced by the newest save that does, and one with nothing left to read stays in the Careers list as an `UnreadableCareer`, to be deleted. And **a save copies no results**: the race store's `scope` is handed which archives Results may list, and a career lists only those its launches name, so loading an older save hides the races of the timeline it left without deleting them. Loading also empties the race store's slot of the career's event when the save holds that event at another point, or its next push would copy the abandoned sessions back |
| `src/main/zip-archive/` | `packZip` and `unpackZip`, the zip format over `node:zlib` alone - deflated entries with UTF-8 names, no zip64 and no encryption - which is all a career's backup needs. Every entry is checked against the directory before anything is unpacked, each inflates no further than the size it declares, and the whole archive stops at `MAX_UNPACKED`. **A career's backup is its folder as it stands** - `career.json`, `state.json`, its saves and its archived results, with a `backup.json` saying when - so Explorer opens one. Restoring writes the whole career beside the others first and only then moves it into place, under a new id when the copy already here is kept |
| `src/main/class-store/` | The user's layer over the class catalogue, read once from `%APPDATA%/ac-career-mode/car-classes.json` and written back whole after every command. The edits are `src/shared/utils/class-layer/`'s, so this is only the disk half: commands run one after another so two never share the `.tmp`, a file that is not JSON is quarantined as `settings.json` is, and every command pushes the layer as `classes:changed` - the layer rather than the catalogue, which is maps. Main hands the catalogue to the content store with `classify()` and the series store reads it per call, then `refresh()`es the library, because what a spec holds decides what a championship can race |
| `src/main/series-store/` | The championship library, loaded once at startup and answered from memory. **The historic events are a second store of the same kind** - `createSeriesStore` handed `SeriesStoreOptions` naming their folder, their shipped list and `historicProblems` as extra `rules` - served over `historic:*` channels that mirror `series:*` one for one. Only the user's half is read from disk, out of `%APPDATA%/ac-career-mode/series/`. Every command that writes - customise, duplicate, revert, delete, import - lives here, ends by calling `reload()` and pushes the whole library back as `series:changed`, because two screens read it at once and a duplicate made on the detail screen has to reach the list behind it. The native file dialogs deliberately stay in `src/main/ipc/`, so this store keeps its path-in, value-out shape and imports no Electron. `series:list` answers with an envelope rather than a bare list, so a file that would not load travels with the ones that did |
| `src/main/content-protocol/` | Serves preview images out of the AC install - a track's loading-screen photographs and logo among them, the photographs typed by their kind since their names are a numbered set - and the nation flags AC shows beside a driver - `accontent://flag/<code>`, answering only for a code in `NATION_CODES` |
| `src/preload/` | The single `contextBridge` surface (`window.api`) |
| `src/renderer/` | React UI; `src/renderer/src/components/ui/` is vendored shadcn source |
| `src/renderer/src/screens/` | One folder per route-level screen. `home` at `/home` is where the app opens and the first tab: the next event the career is entered in - its sessions read off the event page's own view, so the two never disagree - and every championship entered this season with a segment per round. Where no event is left it shows the year done - review it, finish it, or find something still to run - and, at the start of a season with nothing entered, last season's championships, each opening its page with the class and car it was raced in picked through `EnterHint` router state. A championship that has just finished says so in a gold banner, and **three cards under the season are the way into Results, History and Finances**, which the navigation does not list: each previews what it holds. `finances` at `/home/finances` is the career's money - the balance and a season's figures, the ledger a line per change of it, and what each kind of line and each championship came to - where the page holds still and only the ledger scrolls; the balance also sits at the right of the header on every page of a career, and a round's page says what it costs to enter, before Launch, and refuses a launch it cannot pay for. `history` at `/home/history` lists every season, newest first; `year-review` at `/home/history/:season` is a season in numbers and every edition it entered, and where an open season is finished from; `championship-review` at `/home/history/:season/:series/:edition` is one edition looked back on. A championship that runs more than once a year gets an edition switcher on its page, and every page of a season gone by reads back without anything to race or enter. **Moving on never costs a round unasked**: launching an event while earlier ones are unraced or another is part-way, jumping the clock past rounds of the career's, and entering a championship whose opening rounds are already behind the clock all list what they lose in `SkipDialog` first - the round page's view carries `skips` and `behind`, `career:skips` answers for a date, and main refuses a launch or a jump that would lose rounds unless the request says `skip`. **A round the install cannot race is skipped from its own page** - one missing what it needs, or no longer running the player's own car, which `seatRaceableIn` in `src/shared/utils/round-availability/` asks: its sessions cannot be planned, so `SkipPanel` stands where they would, `career:skipping` lists what skipping costs - the round itself, as `unraceable`, and everything launching it would - and `career:skip` moves the clock to its day, a stand-in racing each round lost. It is the one way a standalone championship's clock moves besides racing, and its banner points at the next round that can be raced, offering to skip the rest and finish when none can. `race` at `/race` is the Race tab: every race event of the player's own as a card - the Results page's card head over its sessions - with a new one first, each opening `/race/:id`. That page heads itself as a round's, with Launch in the pinned header; the track and car pickers are pinned down the left, and the classes, the sessions and the rules - the championship editor's own class pieces, `SessionsSplit` and `RulesCard` - fill the right until a session has run, when it becomes the round page's event list beside each session's briefing or result, and the race's own AI strength stays open under it, the one thing the setup no longer holds still. **The car is picked from the player's class**: with several classes the car card asks which, `CarPicker` is narrowed to its cars, and a car that no longer fits is kept and said so in amber rather than swapped. A class is one panel - its name, its cars and its drivers, the drivers' strength and aggression shown as the figure they race at, the sum that makes it and the band they spread across, with the step held inside 0-100. The sessions are one list without days, and a race's start slot is a slider bounded by the player's class. A card hands the page it opens how far the event has got, as router state read by `phaseOf`, which is how the page's skeleton takes the setup, the under-way or the finished shape before the event is read; opened any other way it falls back to the setup one. **No field the app offers takes a free number where the range is known**: AI offsets are steppers held so the figure stays inside 0-100 and say what the field races at, regulations are bounded sliders with named stops, race control is chips, and the road temperature follows the air unless set on a slider. `calendar` heads itself with the month, the clock and where Go to moves it, a strip of the season's months ticked per race day, and the app's own filters, then shows either a timeline of race days as cards or a month at a time as a grid sized to exactly the window, each day listing as many events as its height holds; a day of the grid lists its events beside it where the window is 2xl and in a sheet where it is not, which is why it asks `useMediaQuery` rather than a breakpoint class. `car-browser` and `track-browser` each expose a `*BrowserBody`, which is the whole browser with an optional `onSelect` - that is what the race screen's pickers are, rather than screens of their own. A body given a `memoryId` comes back to the filters it was left with; a picker passes none, so its restricted library never inherits or leaks the page's filters. A body given a `toggle` puts a switch on every card instead, which is all `your-content` is: both bodies over `anonymous: true`, adding anonymous mods to the library. `settings` is a layout with six tabs as nested routes, each with an icon - General at `/settings`, `diagnostics` at `/settings/diagnostics`, `your-content` at `/settings/content`, `car-classes` at `/settings/classes`, `content-sources` at `/settings/sources` and `championship-library` at `/settings/championships`, which manages the championship library - the Championships page itself is read-only and lists only what a career can race, laid out as the career ladder - a row per discipline, a column per tier from the bottom rung up, and a championship on every rung one of its classes enters at, with a crowded rung folding after three - while the settings tab lists the same library as a grid of `SeasonCard`s or, through `ViewToggle`, as `LibraryTable`, a row each - each carrying a switch, what is wrong with it and the whole menu, from its button or a right-click anywhere on the card or row. The table says what is missing or misconfigured in a tooltip on the row's state chip rather than underneath, and its Championship and Ladder headings set the same sort as the sort menu. Each list opens its own read-only page: `/championships/:id` opens each round's own page - it sets nothing up itself, and its sidebar points at the career's next round, or the next still to come in a championship not yet entered - and `/settings/championships/:id` is the same `ChampionshipDetail` with `manage` set, which races nothing and carries the whole menu. Both lists search, filter and sort in the renderer through `useChampionshipBrowser`, since the whole library is already there, beside the browsers' filter rail as `ChampionshipRail` - what a championship needs is the browsers' `SourceTree`, carried as one dimension of prefixed values so the tree's lists stay OR'd - and each remembers where it was left under its own browser-memory id. `championship-editor` is at `/settings/championships/:id/edit`, and at `/settings/championships/new` for one that has not been written yet - under settings so the nav lights Settings, but outside the settings layout, which would head it with the tabs. The editor is a set of tabs of its own - Overview, Teams, Classes, Calendar, Formats, and Points & money - each marking what is unsaved on it and what is wrong with it; Classes lists the classes beside the one open, and a class's seats, its balance of performance and every points table are typed into directly rather than opened a row at a time. A team, a class and a round each open in a dialog - a round's in three tabs, its conditions a group at a time - a format's sessions are edited beside its list of days, and a purse is generated from what it pays in all and the shape of its curve, then adjusted by hand. Cars are classified from `car-classes`, a spec at a time: a spec card opens a side sheet holding its name and every car in it, saved together through `classes:saveSpecCars`, and Add spec opens the same sheet empty so a spec is never made without cars. Its Add cars is `CarSetPicker`, the car browser with a switch on every card. **A championship's page is tabs** - Rounds, Standings, Classes, and Points, prizes and rules - kept in the URL as `?tab=`, so Back from a round returns to the tab it left. **An edition the career entered is shown off the season's own copy** - `useSeasonListing`, validated against the install through `series:validate` - so its rounds number as its events do and the page stays whole once the library's championship is edited or deleted. Its standings are a table or a grid of every race of the season, on points or on positions, and every results table is drawn from `src/renderer/src/components/results/`, so a finish reads the same on the grid, the round table, an event card and a classification. A round's page heads its event list with **Round results** once anything of it has run, and under the list, for a round the career is in, holds the player's own step on the AI's strength for that round - open between sessions, and once the round is over a list of what each session ran at - while the season's step sits in the championship page's sidebar. The Results page is a card per event, each session opening the result page; a round's card ends in a footer opening the round, and a race event's in one opening the race. A round's race that runs next carries **Shorten** on its Length tile, a popover holding a slider of the steps the race offers - shortest on the left, Full on the right, each named in a tooltip on hover - picked for that launch alone and recorded on it. `car-detail` is read-only - a carousel of the car's liveries, its figures, description and curves, the championships racing it and where it comes from - and the searchable livery list belongs to the car picker's second step, not to the car page. Both it and `track-detail` look over everything installed rather than the library, since Your content opens mods the library does not hold yet, and a mod the catalogue does not know carries Your content's switch beside Back as `LibrarySwitch`; a card opened from Your content keeps Settings lit through the `NavState` its link carries. `track-detail` is a circuit's page at `/tracks/:id`, which a track card, a round's map and the round page's map all open - a carousel of the circuit's loading-screen photographs, its layouts as cards that double as the page's filter, the figures, the championships racing there grouped by discipline, where it is and where it comes from. **The chosen layout lives in the URL** as `?layout=`, so a round opens the page on its own layout and Back returns to it; the track picker's second step is the same layout cards' kin, `LayoutTile`, with the shape large, the layout's photograph inset and a warning where it has fewer pit boxes than the race has cars. **Historic events are a second library served by the same pieces**, told apart by a `SeriesKind`: `historic-library` at `/settings/historic` is the pool as cards or a table, the switch first in the table and the switches writing `settings.historicActive`; `historic-detail` at `/settings/historic/:id` is one event read-only in tabs - Event, Classes and Prizes - and `ChampionshipEditor` with `kind="historic"` at `/settings/historic/:id/edit` and `/settings/historic/new` narrows to Overview, Teams, Classes, Event and Prizes, the Event tab being one round's track, conditions and format with no date. **The rules a race is run under read back as `RulesSheet`** - the editor's own sliders and choices drawn read-only, what is left unset saying it is Assetto Corsa's default - on a championship's fourth tab, a historic event's Event tab and its *About this event*. In a career a historic event wears `HistoricChip` wherever a round shows its number, its page opens on *About this event* - `HistoricAbout`, the same panel the settings page shows - with *Your seat* and Decline in place of the entry panel, and the calendar's *Events* filter, Home's strip and the year review's own section keep it apart from the championships, which every championship list filters through `championshipEntries` |
| `src/renderer/src/components/spec-picker/`, `weather-picker/` | The two pickers the championship editor and the Race tab share. `SpecField` is a spec as a field the height of any other, opening `SpecPicker` - a search over spec names and the cars in them, the classes down the side, each spec a tile saying how much of it is installed; its body remounts on every opening, which is how it starts afresh. `WeatherPicker` picks a weather by kind and then by weight, off `WEATHER_KINDS`, which the settings' allowed weather reads too, so the six kinds and their colours are one list; a type nothing offers stays in its strip struck through rather than vanishing |
| `src/renderer/src/lib/series-kind/` | Which library a championship document belongs to - `SeriesKind`, the championships or the historic events - and what that decides: `SERIES_CHANNELS`, the IPC channels each is read and written through, and `managePath`, `editorPath` and `newPath`. The list, detail, command and editor hooks take a kind, so one set of screens and components serves both libraries. **Their wording follows the kind too**: a historic event's screens provide `WordingKind`, and `useKindTranslation` - which the editor's components and `useAppError` read through - looks every key up under `historicEditor.wording` first, so shared copy says "event" there and "championship" everywhere else, error codes included |
| `src/renderer/src/lib/routes/` | Every route pattern, the builders that turn one into a URL, and which destinations navigation offers. `ROUTE.x` is the pattern, `path.x()` is the URL. A championship's page and a round's page carry the run they show as `?season=&edition=` - `path.championship` and `path.event` take it, `runOf` reads it back, and `linkRun` is what a link names: the season only where it is not the current one, the edition only for a championship that runs more than once a year. **Results, History and Finances are not in `NAV`**: all three are reached from Home and live under `/home/`, which is what keeps Home lit while any is open |
| `src/renderer/src/lib/layout.ts` | The measurements more than one screen shares: the content width, wide and narrow, where Back to top floats beside each, and the settings control width |
| `src/renderer/src/lib/accents.ts` | The colour a chip wears when what it says is one of a closed set, for the sets more than one screen shows: which kind of session, which podium place, whose a championship or a car's classification is, how well funded a team is, how a championship edition stands and what a round's segment of a progress bar says. Class strings rather than tokens, so a caller hands one to a `Badge` and tailwind-merge drops the variant's own fill for it - and a value the map does not cover keeps that variant untouched, which is how fourth place comes out unfilled |
| `src/renderer/src/lib/nav-history/` | The window's own history, entry by entry, so Back can name the page it returns to. `recordVisit` is fed by `useNavHistory`, mounted once in `App`, off the router's `history.state.idx`; a push drops whatever lay ahead, as the browser does. `nameVisit` is what `usePageName` writes - a page showing one thing names itself once it has loaded - and `previousVisit` is what `useBack` reads, falling back to the route's own name in `BACK_LABEL`, which `routeOf` in `lib/routes` finds from a path. Module state like browser memory, so a reload starts it empty |
| `src/renderer/src/lib/browser-memory/` | The filters and the search a browser was left with, held per browser id for as long as the window lives - the two championship lists included - so leaving a browser page and coming back does not mean setting them again. Module state rather than a provider, because nothing renders from it and the only reader is the next mount. Deliberately not the scroll offset: restoring one means paging every entry under it back in first |
| `src/renderer/src/lib/finances/` | A career's ledger read for Finances: each line with the money held once it landed, a season's figures, and what each kind of line and each championship came to. Derived on every read; the ledger is all that is stored |
| `src/renderer/src/lib/season-review/` | A championship edition and a whole season looked back on: `championshipReview` - the final tables, every class's champions, the player's figures, their position after each round and their record against their teammate - `editionSummary` for a list's row, `yearReview` for a season in numbers, and `nextRun`. Derived on every read from the season's own copy of each championship, never stored, so a review cannot change once its edition is over |
| `src/renderer/src/lib/standalone-wording/` | How a standalone championship's progress and standing read - `progressLine`, `standingLine`, `isChampion` - wherever one is listed or headed: the start screen, the Championships list, the slot menu and its own page |
| `src/renderer/src/lib/edition-names/` | `editionName`: what an edition is called - its year alone for a championship that runs once a year, `H1`/`H2` or `Q1`-`Q4` before it otherwise |
| `src/renderer/src/lib/season-results/` | A championship's season read into what its tables draw: a column per race of every round, a row per driver and per team, and how far each moved since the round before, as they stood after any round. `standingKey` is a row's identity - a seat, or the substitute in it |
| `src/renderer/src/lib/classification/` | One session's classification as rows, whatever it was read from: an archive, the order the career recorded, or both. **Joined by place, never by name** - a driven session through the launch's own `[CAR_n]` order, which `Standing.slot` carries, a simulated one through its recorded order - so seats, teams and points line up with the archive's laps |
| `src/renderer/src/lib/result-events/` | The Results page's events: every archive gathered by the round the career filed it under, by the race event of the player's own that still lists it - `quickOrigins`, one event however many days it took - or else by its race and its day |
| `src/renderer/src/lib/session-labels/` | What a session is called and how long a race runs, as every screen words them: `SESSION_TYPE_LABEL`, `sessionName` - a session's own name, else its kind's - and `raceLength`, a distance with the laps it comes to. Here rather than in a screen, so nothing imports the race screen for a label |
| `races/*.json` | Race definitions in our own format. An event is one of these too - its `sessions` cover the whole event and `src/core/event/` splits it into launches |
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
CLI's pure helpers, the renderer's pure helpers, the stores in `src/main/`, and the
handful of other main-process functions with real logic behind them
(`isOnSomeDisplay`, `toIpcError`) - those two need a small `electron` fake,
since outside Electron the module resolves to a path string rather than the API.

**A store is tested through its commands, over fakes of the stores it is
handed.** Those live once, in `src/main/__tests__/fakes/` - a series store over
listings held in memory, a race store a test pushes results through, empty
content and plain settings - each built with `fake()`, which throws on any member
the test did not give it, so a store reaching for something unexpected fails
loudly. The file system is `jest.mock('node:fs/promises')` as everywhere else,
and a store that dates anything runs under fake timers that fake the clock alone,
leaving its own write debounce real. Assert on what the store answers and writes,
never on which fake it called: the career store's suite is the model, and the
race, series and quick race stores are still to follow it.

Out of scope for now: React components, `createWindow` and the app lifecycle, and
`registerHandlers`. They are mostly orchestration, where the test asserts on its
own mock rather than on behaviour. Running the app covers them better.

**The vendored exception.** `src/renderer/src/components/ui/` is shadcn source
generated by `npx shadcn@latest add`. There is no `components.json`, so that
command needs an `init` before it will add anything, and `init` rewrites
`globals.css` - so a new component is copied from upstream by hand instead, with
its Radix package added to `devDependencies` and pinned exactly, the way its
siblings' are. It is kept exactly as upstream ships it -
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
itself away and rescans - and the answer to either is to delete the file. That
holds for derived files too: `CONTENT_CACHE_VERSION` stays 1, and a change that
leaves the content cache stale means saying it has to be deleted.

Two things this is not about. `readSettings` is a **tolerant reader**, not a
migration: it coerces `settings.json` field by field and never throws, because
that is a file a user may reasonably hand-edit. `assertStateMatches` is a
**staleness check** on derived event progress, comparing launch counts rather
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
success, base provenance and a points finish 155, touring 175, modified origin 195, single-seater
212, redistribution 235, practice 250, primary 262, road 270, mod provenance
295, qualify 310, budget works 320, custom origin 340. The budget chips spent
the last two gaps, so a new family has to share a hue with one that never
appears on the same screen, and say so in `globals.css`. **The climate chips
are the exception that proves the technique**: sand 70, olive 108, moss 150 and
slate 232 sit on hues already spent, and are told apart from those families by
chroma at about half theirs - an ordered scale of earth tones rather than four
more categories. A race's classes are coloured by slot on 195, 18, 340 and 128, the first three on modified origin, budget independent and custom origin, none of which a result shows. A save's kind wears 340 and 18 the same way, the named and the quick save, and an autosave a slate 232 at half chroma, since no list of saves sits beside a result. The allowed-weather picker's storm violet 300 and snow 210 sit
on qualifying and the platinum tier the same way, on the strength of the General
settings tab showing neither.

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
content width every screen shares - 100rem, which is what three championship
cards need beside a filter rail - and the width a lone settings control takes.
Each was a per-screen literal before and each had drifted - seven screens held
five different widths. A form inside that column caps itself again, kept to the
column's left edge: the settings tabs cap at `max-w-6xl` or `max-w-7xl`, since
controls spread across 100rem drift apart from their labels.

**A picker's second step is laid over its browser, never swapped for it.**
Both pickers ask two questions - a circuit then its layout, a car then its
livery - and the second step is an absolutely positioned overlay while the
browser stays mounted underneath. Rendering one *or* the other unmounts the
browser, which throws away the filters the user set and the scroll offset they
were at, so Back lands them at the top of the whole library. The overlay carries
its own `z-20`: the browser's toolbar is sticky at `z-10`, and being later in the
DOM is not enough to cover it.

**Reach them through components, never by pasting the classes.**
`<ScreenBody>` owns the scrolling element and the content column, so a screen
writes only its own gap and padding. A settings card is `<SettingsSection>` - an
icon in a well coloured by `SECTION_ACCENT`, so a long settings page reads as
landmarks - and a setting that is one switch is `<SwitchTile>`, whose whole tile
is the switch's label.

**A long page keeps its way out in reach, one of two ways.** A screen reached
from another heads itself with `<ScreenHeader>`, which pins Back and the title
row to the top of the scroller - Back is always `<BackLink>`, so every one looks
and sits alike - and passes `ScreenBody` no top padding. **Back goes where the
user came from, not to a fixed parent**: it steps back through the window's
history and says which page that is, so a car opened from a round returns to
the round, named. `ScreenHeader`'s `back` is only the fallback for a window
that has been nowhere earlier, right after launch. A screen showing one thing
names itself with `usePageName` once its data has loaded, or Back on the page
after it can only say what kind of page it was; a list needs nothing, since
`BACK_LABEL` names every route, and a new route needs its entry there. The
mouse's side buttons and Alt+Left / Alt+Right move through the same history. The header is `z-20`
rather than the browser toolbar's `z-10`, because editor rows lift their menus
and badges to `z-10` and would otherwise draw over it. A screen with no Back of
its own sets `backToTop` on `ScreenBody` instead, which floats an arrow beside the
content column once the page has scrolled past a screen's height. A browser body
sets it only when it is the page, never inside a picker, where `fixed` would
anchor to the dialog.

**A loading page is the page, with its data still to come.** Nothing waits
behind one grey bar. Whatever does not depend on the data renders for real
straight away: titles, Back, tabs, search, sort, a rail's group names, table
headings, form labels and hints, and any closed set in its colours, such as the
ladder's tiers and disciplines or a rail's sources. Everything the data fills
is a `<Shimmer>` block of the size and in the place of what replaces it, so
nothing moves when the data lands. A skeleton is rooted in `<Loading>`, which
tells assistive technology the region is busy. A screen's skeleton is a
`*Skeleton.tsx` beside the component it stands for. It reuses that component's
own layout classes, and its repeated rows come from `slots()` in
`@/lib/slots.ts`, with their counts in the screen's `constants.ts`. A control
whose value is still being read takes `null` for it rather than a made-up
value: `SwitchTile`'s `checked`, `RailOption`'s and `Segments`' `count`, and a
`SourceTree` with no facets. The sweep and the short fade-in that keeps a fast
load from flashing are the `shimmer` utility in `globals.css`; the vendored
`ui/skeleton.tsx` is not used.

**So a layout change carries its skeleton with it.** When you add, move,
resize or remove anything on a screen that has a loading state, update its
`*Skeleton.tsx` in the same change: add placeholders for new data, follow moved
or resized ones, and delete the ones for what was removed. A new screen that
loads anything ships with its skeleton, and a screen that stops loading loses
it. Check it the same way as the loaded page, in both themes. A temporary delay
in `handle()` in `src/main/ipc/utils.ts` holds a screen in its loading state
long enough to look at, and it is reverted before committing.

## Known gaps

- **A mod's layout inside a base circuit reads as base.** Track provenance is
  keyed by circuit, so `spa/2022`, `monza/lfm`, every `*_osrw` and every
  `*_fa_2026` layout counts as base game content although nobody on the base
  game alone has it. `DISTRIBUTOR_TRACKS` names a few of them, as LFM's, and
  most go unrecorded. A championship naming one is reported as needing the base
  game, and a base-only user finds that round unavailable. The library test
  keeps its own list of the layouts Kunos ship, so every base-only championship
  still has rounds a base-only user can race; fixing it properly means
  provenance per layout rather than per circuit.
- **A forecast outside a career is still derived on every read.** Inside one it
  is drawn once, a week out, and stored on the event; outside one - a
  round of a championship the career has not entered, the CLI - there is nowhere
  to store a draw, so it is recomputed and only the seed keeps the answer stable. That is
  sound as far as it goes, but it means installing a preset or changing the
  allowed weather between setting a round up and racing it moves the forecast
  while the race already written stays put. Inside a career that cannot happen: the draw is
  stored, and only the substitution over it follows the install.
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
  event always invents the same order, and reloading never reshuffles a grid.
  Leaving those segments unrun was the alternative and is worse: the front of
  the grid would stand in the order the last driven segment left it, which is to
  say the segments never happened. The persistent AI field Phase 5 introduces is
  what would let them be simulated on driver ratings rather than on order alone.
  **Whole rounds are now invented too**, by `src/core/round-simulation/`, for
  every round nobody drove - but those are rounds the player was not in, and
  each of their sessions says so on the round's page.
- **A timed race is a server's, and offline there is no such thing.** Driven
  both ways. A race sent as minutes alone writes `RACE_LAPS=0`, and the AI read
  that as nothing to race and drove to the pits while the player's own clock ran
  the race out; a race sent as three minutes *and* 999 laps, a count nothing
  could reach, ran straight past the clock with every screen counting laps.
  Content Manager's Quick Drive offers no timed race either, so test mode had
  nothing to show. `DURATION_MINUTES` therefore belongs to practice and
  qualifying, and a race is laps or a distance; both halves refuse it -
  `validateSeries` reports `series.race.timed` and `buildRaceIni` throws
  `race.session.raceNotInLaps` rather than writing a race AC would not run. The
  eighty-two shipped championships that raced on the clock were converted in
  two ways: a race under four hours is the distance its duration covers at the
  fastest class's pace, and a race of four hours or more states its laps per
  round, from the real event's own winning distance. Both are listed in
  `championship-review.md`, an approximation per championship in the first case
  and a real result in the second.
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
  inside one - only which launches of an event have been run needs tracking.
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
  listed in the event structure and never reachable; and a race asking for
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
- **A shortened race's clock is read out of source, not yet driven.** Shortening
  a race speeds `TIME_MULT` up by the same step, up to 48. Whether offline AC
  honours 48, where it stops honouring a multiplier, and whether the clock runs
  on past midnight are all `races/spikes/time-multiplier`'s to answer;
  `MAX_TIME_MULTIPLIER` is a provisional 48 until it has. Under a plan, **both
  planners set the game's clock to the plan's own multiplier** - PURE calls
  `ac.setWeatherTimeMultiplier` with `timemulti` on every update, Sol sets
  `timemultiplier` as it loads its preset - so a plan is now written with the
  race's multiplier and its step lengths left in session time, which PURE
  stretches itself (`CONTAINER_adapted_duration`) and Sol counts in real
  seconds. Read in `apps/lua/PurePlanner/plan/` and `apps/python/sol_planner`;
  `races/spikes/time-multiplier-plan` with the `clock` probe plan is the drive
  that confirms it. Before this, every plan was written at 1, so any race with
  a faster clock ran it in real time under PURE or Sol.
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
- **The content cache has no migration either**, and its versions stay at 1
  like every other format's: `CONTENT_CACHE_VERSION` and
  `CONTENT_CATALOGUE_VERSION` never move before the first release. Whenever
  `Car`, `Track`, `Skin`, `CarPerformance` or the fingerprint encoding changes,
  whenever a scan starts finding content it used to miss, and whenever the
  provenance catalogue is amended, `%APPDATA%/ac-career-mode/content-cache.json`
  has to be deleted - an unchanged folder keeps its fingerprint and would
  otherwise be served exactly as it was read before, which looks exactly like
  the code not working. Say so when a change needs it; deleting it is the
  user's to do.
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
