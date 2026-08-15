# Roadmap

Living TODO. Phases are ordered by dependency — each one should leave the app in
a usable state. Tick items as they land; add notes inline when reality differs
from the plan.

Status: **Phase 0 complete.** The integration spike proves the full round trip.

## Decisions taken

| Question         | Decision                                                                                                                                                                                |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Career depth     | **Championship manager first.** Series, calendars, standings, points, tier progression, and a persistent AI field with stable identities. Contracts and the transfer market come later. |
| Results fidelity | **Inferred now, CSP Lua recorder later.** Positions derived from laps-then-time until an in-game recorder replaces them.                                                                |
| Series authoring | **In-app editor.** The visual builder is the feature that sells the app, so it gets first-class effort.                                                                                 |
| In-game UI       | **Desktop only for now.** The CSP Lua companion is a later phase.                                                                                                                       |

---

## What does not port from Zero to Apex

Zero to Apex is built on Automobilista 2, which ships structured series data and
a fuller race director. These are real gaps, not oversights:

- **No finishing positions, DNFs or penalties in results.** `race_out.json`
  gives laps and lap times only. Standings are inferred until Phase 7. A car
  that retires on lap 1 is indistinguishable from one that was never classified.
- **No safety car or full-course yellow.** AC has neither.
- **No formation or rolling starts** in vanilla AC.
- **No structured penalty system.** AC reports a `cuts` count per lap; there is
  no drive-through, no time penalty, no disqualification in the results.
- **No car class taxonomy.** AMS2 knows what a GT3 is; AC does not.
  `ui_car.json` has an optional `class` and free-text `tags` that mod authors
  fill in inconsistently. We define our own classes (Phase 2).
- **Regulations cannot be enforced yet.** Damage, tyre wear and fuel multipliers
  live in assists, and `race/config` wants CM's serialized preset format rather
  than an `assists.ini`. Unresolved — see Phase 3.
- **No mandatory pit windows or tyre compound rules.**
- **No mid-race save and no driver swaps**, so endurance rounds are limited to
  what one sitting allows.

## What is uniquely ours

Things this app can do that a career mode for AMS2 structurally cannot:

- **Mods are first-class.** Any car, any track, any combination. Series are not
  limited to what a publisher licensed.
- **Content can install itself.** `acmanager://install?url=…` inside a `batch`
  command means a series can ship a content manifest and pull down what the user
  is missing before a round.
- **Per-entry BoP.** `BALLAST` and `RESTRICTOR` are per car in `race.ini`, so
  mixed fields and unbalanced mods can be evened out per round.
- **True per-driver skill.** `AI_LEVEL` and `AI_AGGRESSION` are per entry, so a
  driver rating maps directly onto the grid rather than one field-wide slider.
- **Persistent liveries.** Pinning a skin per driver makes a season's grid
  visually consistent — the same car looks like the same driver every round.
- **Deterministic CSP weather per round**, including rain, via our `[RAINFX]`
  presets and `pureCtrl static`.
- **Track layouts as distinct venues** — one track can host several rounds.
- **Shareable series files.** A series is data; users can trade championships.

---

## Phase 0 — Integration spike ✅

- [x] Discover CM, AC root and Documents paths
- [x] Scan cars, tracks, weathers, weather controllers
- [x] Generate `race.ini` from a race definition
- [x] Launch via `acmanager://race/config`
- [x] Read, stabilise and archive `race_out.json`
- [x] Career weather presets with deterministic rain
- [x] TypeScript + ESLint (Airbnb)

## Phase 1 — Electron shell

Goal: the existing CLI capabilities, behind a window.

- [ ] Decide the renderer stack (see Open questions) and scaffold it
- [ ] `electron-vite` project layout: `main/`, `preload/`, `renderer/`
- [ ] Move `src/` to `src/core/` — pure, no Electron imports, still CLI-usable
- [ ] Typed IPC surface over the core (`contextIsolation: true`, no `nodeIntegration`)
- [ ] App settings store on disk (paths, overrides, first-run detection)
- [ ] First-run flow: detect AC/CM, show what was found, let the user correct it
- [ ] Window state persistence; single-instance lock
- [ ] Throttle or hide the renderer while a race is live — the app sits next to a
      running game and reviewers noticed AMS2 companion apps eating GPU
- [ ] `npm run dev` / `npm run build`; keep `npm run check` green

## Phase 2 — Content library

Goal: browse everything installed, and classify it.

- [ ] Persist scan results with a cache keyed on folder mtimes
- [ ] Background rescan; detect content added while the app is open
- [ ] Car browser: previews from skin folders, brand/tag filters, search
- [ ] Track browser: layouts, length, pit box count, country
- [ ] User-defined **car classes** — the taxonomy AC lacks
- [ ] Class inference from `ui_car.json` tags and performance data as a starting point
- [ ] Skin browser per car, for pinning liveries to drivers
- [ ] Report broken content (unparseable JSON, missing skins) rather than hiding it

## Phase 3 — Racing from the UI

Goal: one-off races, end to end, without the CLI.

- [ ] Race setup screen: car, track, grid size, AI level, weather, time, sessions
- [ ] Launch and show progress; detect that CM/AC actually started
- [ ] Results screen from the archived `race_out.json`
- [ ] Verify multi-session weekends (practice → qualify → race)
- [ ] **Confirm qualifying sets the race grid**, or find what does
- [ ] Resolve the assists question: find CM's serialized preset format so damage,
      tyre wear and fuel rate can be set per race
- [ ] Verify `[SESSION_n] LAPS` vs `[RACE] RACE_LAPS` against test mode
- [ ] Replace the road-temperature approximation with Kunos' actual curve
- [ ] Recommend CM flags for a seamless loop (`--skip-all-results`,
      `--hide-race-cancel-button`) and offer to write `Arguments.txt`

## Phase 4 — Series and the editor

Goal: the defining feature.

- [ ] Series schema: rounds, entry list, regulations, points, BoP, per-round conditions
- [ ] Validation against installed content, with actionable errors
- [ ] **Series editor UI**: pick cars and tracks, build a calendar, set rules
- [ ] Entry list editor: drivers, teams, liveries, per-entry BoP and AI level
- [ ] Per-round conditions: weather, time of day, track state, session structure
- [ ] Clone and edit a series; extend an existing one with extra rounds
- [ ] Export / import series as files
- [ ] Content manifest per series, with `acmanager://install` for missing content
- [ ] Ship a few reference series built from common content

## Phase 5 — Championship engine

Goal: a season that means something.

- [ ] Configurable points systems (F1-style, custom, fastest lap, pole, drops)
- [ ] Driver and team standings
- [ ] Season state machine: next round, results, standings, season end
- [ ] Persistent AI field — stable names, nationalities, liveries, ratings
- [ ] Driver ratings that move with results
- [ ] Tier progression: promotion and relegation between series
- [ ] Adaptive difficulty from the player's recent finishing record
- [ ] Season summary and history

## Phase 6 — Save data

- [ ] Career save format with a version field and migrations
- [ ] Multiple concurrent careers
- [ ] Backup and restore; never lose a season to a bad write
- [ ] Archive results per round, linked to the series and season

## Phase 7 — Real results (CSP Lua recorder)

Goal: replace inference with truth.

- [ ] CSP Lua app in `assettocorsa/apps/lua` that records live session state
- [ ] Write authoritative results to a handoff JSON the desktop app reads
- [ ] Capture finishing positions, retirements, incidents, pit stops, compounds
- [ ] Reconcile with `race_out.json`; prefer the recorder when both exist
- [ ] Backfill: keep inference working for users without the plugin

## Phase 8 — Customization and settings

- [ ] Settings UI: paths, CM flags, units (`USE_MPH`), theme
- [ ] Difficulty profiles (AI level, assists, damage, tyre wear, fuel rate)
- [ ] Weather preset management — extend the built-in career weathers, let users
      author their own, and surface that installing them touches the AC folder
- [ ] Warn that `__CM_WEATHER_CONTROLLER` overrides the user's own
      `weather_fx.ini` for the race; offer to respect their controller instead
- [ ] Session defaults per series and globally
- [ ] Uninstall/cleanup: remove career weathers, restore CM arguments

## Phase 9 — Distribution

- [ ] `electron-builder` packaging, Windows installer
- [ ] **Code signing certificate** — an unsigned Electron app that reads game
      folders and spawns processes gets flagged by SmartScreen and AV constantly
- [ ] Auto-update
- [ ] Crash and error reporting
- [ ] Docs: getting started, series authoring guide

---

## Later

Not scheduled, deliberately.

- **Living world** (full Zero to Apex parity): teams, dated contracts, transfer
  windows with a decision week, reputation, academy promotions, tryouts, seat
  disputes, retirements and rookie intakes.
- **In-game career panel** as a CSP Lua app, solving the alt-tab and VR problem.
- **Series generator**: "build me a championship from these cars" with automatic
  track selection and BoP.
- Endurance features: driver swaps, mid-race saves — both blocked by AC.
- Community series repository.

## Open questions

- **Renderer stack.** React + Vite is the default recommendation; the alternative
  is something lighter given the UI is mostly lists and forms. Decide in Phase 1.
- **Car class taxonomy.** Fully user-defined, or ship a starter set (GT3, GT4,
  formula tiers, historic groups) that users extend?
- **Where do career saves live?** `%APPDATA%` is conventional; a visible folder
  is easier to back up and share.
- **Does the player always drive?** Or can rounds be simulated to skip ahead?
