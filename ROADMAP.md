# Roadmap

Living TODO. Phases are ordered by dependency - each should leave the app in a
usable state. Tick items as they land; add notes inline when reality differs
from the plan.

Status: **Phase 0 complete; Phase 1 foundation slice complete.** The integration
spike proves the full round trip, and the Electron shell now sits on top of it.

## Decisions taken

| Question                        | Decision                                                                                                                                                                                                                                  |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Career depth                    | **Championship manager with a full economy.** Series, calendars, standings, progression, money, contracts, ratings, sponsors and an inbox. The Zero to Apex "living world" of ~1300 simulated drivers with their own careers comes later. |
| Results fidelity                | **Inferred now, CSP Lua recorder later.** Positions derived from laps-then-time until an in-game recorder replaces them.                                                                                                                  |
| Series authoring                | **In-app editor.**                                                                                                                                                                                                                        |
| In-game UI                      | **Desktop only for now.**                                                                                                                                                                                                                 |
| Race weekends                   | **User-defined session lists, bundled into as few launches as AC allows.** Jump between sessions in-game where AC permits; split into separate launches only where it doesn't.                                                            |
| Grid when qualifying is skipped | **Player starts last.** AI ordered by rating with slight randomness so skipped sessions don't produce identical grids.                                                                                                                    |
| Simulating rounds               | **Never.** Skip practice or qualifying and you are last on the timing sheet; skip the race and it is a DNS.                                                                                                                               |
| DNS                             | Entry fee lost, no points, **rating untouched**.                                                                                                                                                                                          |
| Car pricing                     | **Curated for Kunos + DLC, derived for everything else.** Real-world-ish values for official content; specs-derived suggestions for mods; user override on any car.                                                                       |
| Running out of money            | **Forced down the ladder.** Recoverable, never a hard fail.                                                                                                                                                                               |
| Rating                          | **Global + per-discipline**, with cross-discipline entry one tier below your best.                                                                                                                                                        |
| AI economy                      | **None.** Teams have budget tiers that shape their offers; AI drivers have no wallet.                                                                                                                                                     |
| Currency                        | **Real currency, $ by default.** € and £ selectable later as display only - no conversion.                                                                                                                                                |
| Progression speed               | **0.5x-2x multiplier on money and rating**, separate from AI difficulty. Changeable any time; the career records that it changed.                                                                                                         |
| Career clock                    | **Advances when you start a session dated later than the current day**, plus an explicit *advance to date* action so a career that isn't racing still moves.                                                                              |
| Multiple championships          | **Calendar clashes plus contract exclusivity.** You cannot be at two events on one day, and contracts state whether outside racing is allowed.                                                                                            |
| Saves                           | **Elder Scrolls style.** Named saves, overwrite, load any older save, plus rolling autosaves after every session (3 by default, configurable later).                                                                                      |
| Where career state lives        | **Main owns it, in memory.** One live career object, written through to `career.json` continuously so a crash costs nothing; saves are snapshots copied from it. The renderer holds a read-only projection - no client-side store.        |
| Changing career state           | **Validated commands, never patches.** The renderer sends intent (`career:buyCar`); main checks the rules, applies, persists and pushes the result back.                                                                                  |
| Presentation                    | **Light and dark themes; English and Ukrainian.** Both foundational, not retrofitted.                                                                                                                                                     |

---

## Core concepts

The economy and calendar need several things the earlier plan had no model for.
These are the load-bearing ones.

### Disciplines and tiers

Content is grouped into **disciplines** (single-seater, sportscar/GT, touring,
historic, and whatever else users define). Each is a **ladder of numbered
tiers**, tier 1 being the top. Every series belongs to a `(discipline, tier)`
pair. The player holds a level per discipline, and:

- You may enter any series at or below your level in that discipline.
- **Entering a new discipline, you start one tier below your best level
  elsewhere.** An IndyCar driver can step into Formula 2, not straight into F1.

### Weekends and sessions

A weekend is an **ordered list of sessions**, authored per series - three
practices and two qualifyings if that is the format, or practice, sprint
qualifying, sprint, grand prix qualifying, grand prix.

Sessions carry a **day offset**. Weekends run up to three days (Friday to
Sunday); races fall on Saturday or Sunday and never Friday. One-off and historic
events should prefer weekdays so they don't collide with championship rounds.

The app **bundles consecutive sessions into as few AC launches as possible**, so
you advance session-to-session inside the game rather than alt-tabbing back.
Where AC cannot express a format in one launch, the weekend splits and we
reconstruct the grid across the seam using `STARTING_POSITION` and `[CAR_n]`
ordering. Quitting mid-weekend is detected and the remainder resumes later.

### The calendar

Rounds occupy dates. The clock advances when you start a session dated after the
current day, and otherwise only through an explicit **advance to date** action -
time never passes on its own, but a career between races can still move forward
so offers expire, deadlines arrive and the market turns.

Advancing must never silently cost you a race: skipping past a round you have
entered is a DNS, so the action warns and stops at the next event you are
committed to rather than stepping over it.

Two events on the same day **clash**: you pick one, the other becomes a DNS or is
declined beforehand. This is the primary limit on how much you can race.

### Teams, seats and contracts

A **team** fields **seats** in a series, supplies or withholds cars, and has a
budget tier and reputation. Series entry lists are lists of seats.

A contract binds you to a seat and sets who pays:

- **Pay driver** - you pay the team.
- **Free** - nobody pays anyone.
- **Salary** - flat, per season or per event.
- **Prize share** - a cut of event prize money.
- **Standings bonus** - paid on final driver or team championship position.

Independently it states **entry fee coverage** (full, partial, none), a **car
source** (team-supplied, your own, rented), and **exclusivity** - whether you may
race elsewhere, need permission, or are locked in.

### Cars: owned, rented, supplied

Owned cars are capital: bought from the store, usable in any series they're
eligible for, sellable when broke. Rentals are per event. Team-supplied cars come
with the seat.

### Rating

Rating moves on results, weighted by the **tier of the series** and by the
**strength of who you beat and who beat you**. We set `AI_LEVEL` per entry, so
the field has a known strength spread and every finish carries an
expected-versus-actual signal; an Elo-style update fits naturally. Adaptive
difficulty must feed in honestly - gains reflect the level actually raced
against, not the nominal one.

### Sponsors

Sponsor **cards** filling a number of **slots** that grows with your level. Rather
than flat bonuses, they do things a real sponsor does: cover the entry fee for a
series you can't yet afford or access, pay out per event or on results, and drop
you or penalise you for poor performance.

Design is deliberately open - see Open questions. One tension to resolve before
building: a sponsor covering entry to a series above your level is a **bypass of
the discipline ladder**, so the two systems need to agree on how far that goes.

### Progression speed

A multiplier on money and rating earned, independent of AI difficulty. 0.5x for a
hard, slow career; 2x for a fast one. Changeable mid-career, with the career
recording that it happened so a finished run is honest about it.

### Career state, and where it lives

The career is **one live object in the main process**, loaded when a career is
opened. Main is the only place it can be: it is persisted to disk, and `src/core/`
reads it to build `race.ini`. The renderer holds a read-only projection and
re-renders when main pushes a change, the same arrangement settings already use.
That is why there is no Redux or equivalent in the renderer - the process
boundary already provides the single source of truth.

**Durability and save slots are different things**, and conflating them gives the
bad version of both:

- **The working state** (`career.json`) is written through continuously, debounced.
  Accepting a contract or buying a car must survive a crash; none of that is worth
  replaying.
- **Saves** are snapshots copied from the working state at deliberate moments -
  rolling autosaves at session boundaries, plus named saves. These are restore
  points, not durability.

```
%APPDATA%/ac-career-mode/careers/<career-id>/
  career.json          live working state, written debounced after every change
  saves/
    autosave-1.json    snapshots taken at session boundaries, rolling
    my-f2-run.json     named saves
  results/             archived race_out.json per round
```

**State changes are commands, not patches.** The renderer sends intent -
`career:buyCar { carId }`, `career:acceptOffer { offerId }` - and main validates
against the rules (can you afford it, is the seat still open, does exclusivity
allow it) before applying. The rules live next to the data, the sandboxed
renderer is never trusted with authoritative writes, and Phase 7's transaction
ledger falls out of it: each command is what writes the ledger entry.

`createSettingsStore` in `src/main/settings-store/` is the shape to follow -
`get` / `patch` / `flush` / `onChange`, atomic temp-file-and-rename, debounced,
tolerant of a corrupt file. A career store is that plus command handlers and
snapshot/restore.

Two questions this leaves open, to settle in Phase 6:

- **Save-scumming.** Continuous writes do not prevent reloading an autosave after
  a bad race; only the save-slot policy does. Given that skipping a race is a DNS
  and rounds are never simulated, one-way autosaves or a recorded rollback would
  be more consistent - the way a progression-speed change is recorded.
- **What loading an autosave costs.** It discards contracts and purchases made
  since that session boundary. Correct, but it belongs in the confirmation dialog
  rather than being discovered.

### Presentation

Light and dark themes, and localisation with English as default and Ukrainian
alongside it. Both belong in Phase 1 - retrofitting either across a finished UI
is far more expensive than starting with them.

---

## What does not port from Zero to Apex

Real AC limitations, not scope cuts:

- **No finishing positions, DNFs or penalties in results.** `race_out.json` has
  laps and lap times only. A car that retires on lap 1 is indistinguishable from
  one never classified. Inferred until Phase 12.
- **No damage data**, so repair costs cannot be a money sink until the CSP
  recorder lands.
- **No safety car, full-course yellow, formation or rolling starts.**
- **No structured penalty system** - a `cuts` count per lap and nothing else.
- **No car class taxonomy.** AMS2 knows what a GT3 is; AC has an optional `class`
  field and free-text tags filled in inconsistently by mod authors.
- **Regulations cannot be enforced yet.** Damage, tyre wear and fuel multipliers
  live in assists, and `race/config` wants CM's serialized preset format rather
  than an `assists.ini`. Unresolved - Phase 3.
- **No mandatory pit windows or tyre compound rules.**
- **No mid-race save, no driver swaps.**

## What is uniquely ours

- **Mods are first-class.** Series aren't limited to licensed content.
- **Content can install itself** via `acmanager://install?url=…` in a `batch`
  command.
- **Per-entry BoP** (`BALLAST`, `RESTRICTOR`) and **true per-driver skill**
  (`AI_LEVEL`, `AI_AGGRESSION` per car).
- **We own the grid.** `[SESSION_n] STARTING_POSITION` plus `[CAR_n]` ordering is
  what makes split weekends and custom formats possible at all.
- **Persistent liveries** - a driver looks like the same driver all season.
- **Deterministic CSP weather per round**, rain included.
- **Shareable series files.**

---

## Phase 0 - Integration spike ✅

- [x] Discover CM, AC root and Documents paths
- [x] Scan cars, tracks, weathers, weather controllers
- [x] Generate `race.ini`; launch via `acmanager://race/config`
- [x] Read, stabilise and archive `race_out.json`
- [x] Career weather presets with deterministic rain
- [x] TypeScript + ESLint (Airbnb)

## Phase 1 - Electron shell

Foundation slice landed. The app opens on a diagnostics screen showing the
detected install and content counts, with live theme and language switching.

- [x] Decide the renderer stack and scaffold it - **React 19 + electron-vite**,
      with **shadcn/ui** (vendored) on Radix and Tailwind v4
- [x] `electron-vite` layout: `main/`, `preload/`, `renderer/`
- [x] Move `src/` to `src/core/` - pure, no Electron imports, still CLI-usable
- [x] Typed IPC over the core (`contextIsolation: true`, no `nodeIntegration`,
      `sandbox: true`), with an error envelope so failures cross the boundary intact
- [x] **Theming from the start**: light and dark, tokens not hardcoded colours;
      main owns the resolved theme so native chrome follows
- [x] **i18n from the start**: English and Ukrainian, enforced by
      `react/jsx-no-literals`; dates, numbers and money through `Intl`
- [x] App settings store (paths, theme, language, overrides) in `%APPDATA%`,
      atomic writes, tolerant of a corrupted file
- [x] Window state persistence, clamped to an attached display; single-instance lock
- [x] `npm run dev` / `npm run build`; `npm run check` green across both projects
- [ ] First-run flow: detect AC/CM, show findings, let the user correct them -
      the diagnostics screen is the read/correct half; the first-run *flow*
      (detecting that this is a first run, walking the user through it) is not built
- [ ] Throttle or hide the renderer while a race is live - needs the launch path
      wired into the UI first, so it lands with Phase 3
- [ ] Localise errors raised in `src/core/`, which currently reach the UI in English
- [ ] Wire up `node:test` and start with `migrateSettings`, which is pure and
      tolerant by design

## Phase 2 - Content library and classification

- [ ] Persist scan results with a cache keyed on folder mtimes
- [ ] Background rescan; detect content added while the app is open
- [ ] Extract car specs (bhp, weight, top speed, power-to-weight) from
      `ui_car.json` - the basis for pricing and class inference
- [ ] Car and track browsers with previews, filters and search
- [ ] **Car classes**, user-defined, with inference from tags and specs
- [ ] **Disciplines and tiers** - the ladder structure
- [ ] Map classes to disciplines and tiers
- [ ] Skin browser, for pinning liveries to drivers
- [ ] Report broken content rather than hiding it

## Phase 3 - Race weekends and sessions

Spikes first - they decide what weekend formats are expressible.

- [ ] **Spike `[SESSION_n] STARTING_POSITION`** - confirm indexing and that AI
      grid order follows `[CAR_n]` order
- [ ] **Spike repeated session types** - will AC accept two `TYPE=3` races, or
      qualifying between two races, in one launch? Decides whether sprint plus
      feature can share a launch
- [ ] **Spike early exit** - is `race_out.json` written when quitting a weekend
      partway, and does it accumulate one entry per session?
- [ ] **Spike `raceResult`** - archived `race_out.json` files carry a `raceResult`
      array of car indices that looks like AC's actual finishing order, currently
      neither modelled in `types.ts` nor read by `summarise()`. If it holds up,
      positions and DNFs stop waiting on the Phase 12 recorder
- [ ] Weekend model: ordered sessions with day offsets and per-series formats
- [ ] Launch bundler: group consecutive sessions into the fewest launches AC allows
- [ ] Weekend state machine - resumable, each bundle independently launchable
- [ ] **Grid reconstruction** across launch seams from qualifying results
- [ ] Player last when qualifying is skipped; AI by rating with randomness
- [ ] Track grip continuity across separate launches
- [ ] Race setup screen: weather, start time, AI difficulty, session lengths
- [ ] Results screen per session
- [ ] Resolve the assists question so regulations can be enforced
- [ ] Verify `[SESSION_n] LAPS` vs `[RACE] RACE_LAPS`
- [ ] Replace the road-temperature approximation with Kunos' curve
- [ ] Offer to write CM's `Arguments.txt` (`--skip-all-results`,
      `--hide-race-cancel-button`)

## Phase 4 - Series, teams and the editor

- [ ] Series schema: discipline, tier, rounds, weekend format, regulations,
      points, BoP
- [ ] **Weekend formats** with day offsets and day-of-week rules
- [ ] **Teams and seats**; entry lists as seats
- [ ] Eligibility: which classes may enter which series
- [ ] Prize money tables (per finishing position, per final standing)
- [ ] Entry fees per round
- [ ] Validation against installed content, with actionable errors
- [ ] **Series editor UI**: cars, tracks, calendar, rules, teams, money
- [ ] Per-round conditions: weather, time, track state, sessions
- [ ] Clone a series; extend an existing one with extra rounds
- [ ] Export / import series files
- [ ] Content manifest per series with `acmanager://install` for missing content
- [ ] Ship reference series across several disciplines and tiers

## Phase 5 - Championship engine and calendar

- [ ] Configurable points systems (custom tables, fastest lap, pole, drops)
- [ ] Driver and team standings
- [ ] **Career calendar with dates**; clock advances on starting a later session
- [ ] **Advance to date** action, stopping at events you are entered in rather
      than skipping past them into a DNS
- [ ] Fire dated events on arrival: offer deadlines, transfer windows, sponsors
- [ ] **Clash detection** between events on the same day
- [ ] Season state machine: next round, results, standings, season end
- [ ] DNS handling: fee lost, no points, rating untouched
- [ ] Persistent AI field - stable names, nationalities, liveries, ratings
- [ ] One-off and historic events, preferring weekdays
- [ ] Adaptive difficulty, recording the level actually raced against
- [ ] Season summary and history

## Phase 6 - Career saves

- [ ] Career = a folder; saves = named snapshots of full career state
- [ ] **Career store in main**, following `createSettingsStore`: one live object,
      `career.json` written through debounced, `career:changed` pushed to the renderer
- [ ] **Command handlers** rather than patches, each validating before it applies
- [ ] Create, name, overwrite and delete saves
- [ ] Load any older save
- [ ] Rolling autosaves after every session, 3 deep by default - snapshots copied
      from the working state, not a second durability mechanism
- [ ] Warn on load that anything done since that session boundary is discarded
- [ ] Decide the save-scumming policy: one-way autosaves, a recorded rollback, or
      neither
- [ ] Save format with a version field and migrations
- [ ] Multiple concurrent careers
- [ ] Backup and restore
- [ ] Archived results linked to career, season and round

## Phase 7 - Economy

- [ ] Money and a transaction ledger, so every change is explainable
- [ ] Currency display: `$` default, `€` and `£` as alternatives, no conversion
- [ ] **Curated price list for Kunos base and DLC cars**
- [ ] **Derived price suggestions for mod cars**, overridable
- [ ] **Store page**: every car, its price, and the championships it can enter
- [ ] Buy, sell and own cars
- [ ] **Rent a car for an event**, from the event screen
- [ ] Entry fees charged per round, with contract coverage applied
- [ ] Prize money per event and per final championship standing
- [ ] Progression speed multiplier applied to all earnings
- [ ] Forced down the ladder when you can't afford to race
- [ ] Sell owned cars to recover

## Phase 8 - Rating and the ladder

- [ ] Global rating plus per-discipline ratings
- [ ] Elo-style update weighted by series tier and per-entry `AI_LEVEL` spread
- [ ] Rating from both who you beat and who beat you
- [ ] Progression speed multiplier applied to rating gains
- [ ] Discipline levels derived from rating
- [ ] **Cross-discipline entry at best level minus one**
- [ ] Rating history with a readable explanation of every change

## Phase 9 - Contracts, teams and the market

- [ ] Contract model: pay driver, free, salary, prize share, standings bonus
- [ ] Entry fee coverage: full, partial, none
- [ ] Car source per seat: team-supplied, owned, rented
- [ ] **Exclusivity**: forbidden, permission required, or free to race elsewhere
- [ ] Offer generation driven by rating, discipline level and reputation
- [ ] Offer deadlines and a decision window
- [ ] Contract expiry and renewal
- [ ] Buying a seat as a pay driver
- [ ] Team budgets and reputation shaping offers

## Phase 10 - Sponsors

Design to be settled before building - see Open questions.

- [ ] Sponsor cards and slots that grow with level
- [ ] Effects: cover entry fees (including series above your level), pay per
      event, pay on results
- [ ] Performance expectations, penalties and being dropped
- [ ] Reconcile fee coverage with the discipline ladder
- [ ] Sponsor offers arriving through the inbox

## Phase 11 - Inbox

- [ ] Message model with read/unread, categories and expiry
- [ ] Seat and sponsor offers with accept/decline and deadlines
- [ ] Event invitations
- [ ] Session, race and championship results from engineer and team owner
- [ ] Contract and market news
- [ ] Earlier phases emit events into this bus as they land

## Phase 12 - Real results (CSP Lua recorder)

- [ ] CSP Lua app in `assettocorsa/apps/lua` recording live session state
- [ ] Authoritative results to a handoff JSON the desktop app reads
- [ ] Finishing positions, retirements, incidents, pit stops, compounds, damage
- [ ] Reconcile with `race_out.json`; prefer the recorder when both exist
- [ ] Keep inference working for users without the plugin
- [ ] Unlocks repair costs as an economic sink

## Phase 13 - Customization and settings

- [ ] Settings UI: paths, CM flags, units (`USE_MPH`), theme, language, currency
- [ ] Progression speed, with the career flagged when it changes
- [ ] Autosave count and save behaviour
- [ ] Difficulty profiles (AI level, assists, damage, tyre wear, fuel rate)
- [ ] Economy tuning: prize and fee multipliers, starting money, price overrides
- [ ] Weather preset management; surface that installing touches the AC folder
- [ ] Warn that `__CM_WEATHER_CONTROLLER` overrides the user's `weather_fx.ini`
- [ ] Uninstall/cleanup: remove career weathers, restore CM arguments

## Phase 14 - Distribution

- [ ] `electron-builder` packaging, Windows installer
- [ ] **Code signing certificate** - an unsigned Electron app that reads game
      folders and spawns processes gets flagged constantly
- [ ] Auto-update, crash reporting
- [ ] Docs: getting started, series authoring guide
- [ ] Translation contribution workflow

---

## Later

- **Living world**: ~1300 simulated drivers with their own careers, retirements,
  rookie intakes, seat disputes and rival arcs.
- **In-game career panel** as a CSP Lua app, solving alt-tab and VR.
- **Series generator**: "build me a championship from these cars".
- **Community series repository.**
- Endurance features: driver swaps, mid-race saves - both blocked by AC.

## Open questions

- ~~**Renderer stack.**~~ Settled: React 19 + electron-vite, shadcn/ui on Radix,
  Tailwind v4. Vendored components, so the project keeps owning its UI code.
- ~~**Where do career saves live?**~~ Settled: `app.getPath('userData')`
  (`%APPDATA%`), same as settings. Phase 6 adds an "open save folder" action and
  backup/export to cover the shareability the visible-folder option would have given.
- ~~**Localisation depth.**~~ Settled: strings *and* dates, numbers and currency,
  via `Intl` from the start. Remaining question is only whether `src/core/` error
  strings should be localised too.
- **Sponsors, in detail.** How many slots per level; whether sponsor-funded entry
  bypasses the ladder or only softens the cost; what "poor performance" means
  numerically; whether sponsors are per-season or per-championship.
- **Default exclusivity.** Are most contracts permissive, with only top teams
  locking you in? This sets how much multi-series racing feels normal.
- **Event scheduling.** Do one-off and historic events auto-place on free
  weekdays, or does the series author fix their dates and accept clashes?
- **Car condition and maintenance.** Needs damage data from Phase 12, and risks
  feeling like admin.
- **Reputation as a separate axis from rating** - covering reliability and
  behaviour rather than pace?
