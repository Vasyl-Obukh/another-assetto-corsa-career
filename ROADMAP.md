# Roadmap

Living TODO. Phases are ordered by dependency - each should leave the app in a
usable state. Tick items as they land; add notes inline when reality differs
from the plan.

Status: **Phases 0 and 1 complete; Phase 2 is down to its last classification
items.** The integration spike proves the full round trip, the Electron shell
sits on top of it - setup, diagnostics, theming, i18n, settings and a tested
core - the content library is cached, incremental, spec-aware and honest about
broken mods, and the car and track browsers consume it behind real navigation.
Provenance says which car or track is base game, DLC or a mod, and the class
catalogue says which grid each named car races in. Next up is disciplines and
tiers - the ladder those classes hang off - after which Phase 3 can start on
race weekends.

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
| Content provenance              | **A shipped catalogue, not inference.** Every car and track layout carries a source (base, DLC or mod), the DLC pack where there is one, the mod maker where we recognise one, and any redistributor.                                     |
| Car classes                     | **Class and spec, both shipped, and both plural per car.** A *spec* is a grid - the cars that can sensibly race each other - and a *class* is the family that spec belongs to across eras. Cars are assigned to specs; classes are derived. |
| Series eligibility              | **A spec or a car list on the championship, overridable per round.** Most series declare it once. A round overrides where the car changes with the track - IndyCar swaps road, short-oval and superspeedway kits mid-season. Never a class. |
| A car in several grids          | **Normal, and modelled as a list of specs.** A Lotus 2-Eleven runs in Lotus Cup and as a track special. What a car may never hold is two specs of one class - that would claim it is two eras of a category at once.                      |
| One-make series                 | **Configured by naming its cars, not by a class.** A class names a category a car belongs to; it never exists to name one championship's entrants. A car that exists only for one-make racing carries no class or spec at all.            |
| What earns a class              | **A real series behind it, and a spec its cars could actually share.** Judged on the install's own figures and on era, with fantasy mods checked against their real counterparts. Groupings that are merely tidy - road cars by pace, track-day cars - do not qualify.                                    |
| Cars with no class              | **About a third of the library, on purpose.** They are not second-class content: a championship reaches them by naming cars. Only a car that belongs on a shared grid needs a spec.                                                                                                                       |
| Base-only career                | **Guaranteed.** A complete ladder is always playable on vanilla content alone. DLC and mods extend the ladder; they never fill holes in it.                                                                                               |
| Editing a shipped championship  | **Forking copies.** The fork diverges from that moment, and a later update to the original does not flow into it.                                                                                                                         |
| Missing content                 | **Report, block, offer to fix.** A championship missing anything is listed with what it needs, named down to the pack or the mod, and cannot be entered until it is forked or the content installed.                                      |
| Content source toggles          | **They govern which championships are offered, nothing else.** The library always shows everything installed.                                                                                                                             |

---

## Core concepts

The economy and calendar need several things the earlier plan had no model for.
These are the load-bearing ones.

### Content provenance

Users own three tiers of content: the **base game** everyone has, **DLC packs**
some own, and **mods** a few own - RSS, VRC, URD, Guerilla and Yezhrod among the
popular makers, plus whatever else is installed. Every car and every track
layout carries where it came from:

| Field | Meaning |
| --- | --- |
| `source` | `base`, `dlc` or `mod` |
| `pack` | which DLC, when the source is `dlc` |
| `maker` | which mod team, when the catalogue names one |
| `distributor` | who redistributed it - currently LFM |

`maker` and `distributor` are separate because they answer different questions.
LFM redistributes other teams' work rather than authoring its own, and it ships
*layouts into a Kunos track* - `ks_nordschleife/nordschleife-lfm`. One field could
not say "DLC track, LFM layout", and folding LFM into `maker` would misattribute
an RSS car to it. It is why `DISTRIBUTOR_TRACKS` is the one track record keyed by
layout rather than by track.

**Every folder ID is listed explicitly, and nothing is inferred.** There is a
record per question - `BASE_CARS`, `DLC_CARS`, `MOD_CARS`, `DISTRIBUTOR_CARS` and
the same four for tracks - and an ID in none of them is a mod whose author we do
not know, which is the honest answer.

Inference was tried and dropped. Folder prefixes read plausibly and are wrong in
both directions: a mod that predates its team's naming convention reads as
anonymous, LFM content without `lfm` in the name is missed, and mods take
Kunos-looking names outright - `ks_ferrari_296_gt3` is by First Studio Race, and
Kunos never made a 296 GT3. Prefixes also cannot split base from DLC in the first
place, since vanilla cars are a mix of `ks_*` and unprefixed names like
`bmw_m3_e30`.

AC's own `ui/dlc_ui_car.json` marker has the same problem from the other end. It
carries a Steam app ID, which is exactly what we want, except mods copy the file
verbatim: `fsr_ford_mustang_gt3` ships Audi's and calls itself an Audi R8 LMS.
Tracks barely carry the marker at all. It was worth reading once, while the
records were being written, and never at runtime.

The records are now complete for the library they were authored against, and the
tooling that built them has been deleted: it drafted DLC rows from those markers
and listed what had no row yet, and both questions are answered. Content installed
later simply reads as a mod with no maker until someone adds a row, which is the
honest answer and needs no tool to arrive at.

**Bonus packs are base.** Steam has no bonus depot - that content arrives in the
base depot alongside the game - so it can never be missing, which is what keeps
the base-only ladder honest.

**`--verify` is what finds the rows worth correcting.** It reports what an
install disagrees with rather than deciding anything itself:

- Rows claiming base or DLC content whose `ui_car.json` names an author. Kunos
  write none, so this is a mod wearing an official-looking folder name.
- Base rows with no folder, since everyone owns the base game. This is what caught
  `ks_mclaren_p1_HC1200`, a tuner's name Kunos would never use.
- Installed content in no record at all - the list still to be classified, and the
  only one that runs long.
- Drift between `DISTRIBUTOR_CARS` and the tag LFM's own pack writes, which is a
  hint about new LFM content rather than an authority over it.

### Car classes and specs

Two levels, and the split is load-bearing.

A **spec** is a grid: the cars that can sensibly race each other. A **class** is
the family that spec belongs to across eras - GT3, Formula 1, LMP2.

| | Example | What it answers |
| --- | --- | --- |
| Class | `gt3` | Is this a GT3 car? |
| Spec | `gt3-2020s` | Which grid does it belong on? |

One level cannot carry both questions. A 2007 GT3 car and a 2023 GT3 car follow
the same ruleset and are nothing alike on track, so they cannot be one spec; a
2019 and a 2021 F1 car share a regulation generation and are seconds apart, so
neither *generation* nor *year* is the axis. But splitting into era-specific
classes alone (`gt3-00s`, `gt3-20s`) throws the family away, leaving "is this a
GT3 car" answerable only by parsing an ID - which provenance already rejected.

**Cars are assigned to specs, and classes are derived**, so there is one table to
review rather than two, and the two can never disagree.

**Both are lists.** A car races on as many grids as it has, and belongs to a
class for each. A Lotus 2-Eleven runs in Lotus Cup and again as a track special -
two specs, two classes. The one thing a car may never hold is two specs of a
single class, which would claim it is 2010s-spec and 2020s-spec GT3 at once.

**Most of the library has no class, and that is the intended state.** A class has
to name a real series, and a spec has to be a grid its cars could share - judged on
the install's own power-to-weight figures and on era, not on what groups tidily.
Road cars by pace band, track-day specials and drift cars all failed that test and
were removed: the first catalogue grouped them because they *could* be grouped,
which is not the same thing. Around a third of catalogued cars now carry nothing,
and a championship reaches them by naming cars.

**Fantasy mods are checked against their real counterparts, not their folder
names.** RSS ships invented marques, and two whole packs were filed wrongly by a
generation or more before anyone looked them up: the `rss_gt_*` cars are FIA GT1
of the early 2000s - Ferrari 550 Maranello, Viper GTS-R, Lister Storm - and had
been sitting beside the 1960s Ford GT40, while `rss_gtn_*` is the N-GT class of
the same era and had been beside a 1974 Porsche.

**A one-make championship names its cars instead.** A championship is configured
either by a spec or by an explicit list of cars, so the Ginetta G55 Supercup is an
entry list rather than a class - and the Ginetta itself is simply a GT4 car. This
was learned the hard way: a fifth of the first catalogue turned out to be classes
that existed only to name one model, and every mod with a real-world one-make
series would have earned another.

A class survives where it names a **category** with a real grid behind it rather
than one model's entrants. Porsche Carrera Cup stays on those grounds, the same
ones that keep Formula 2 and IndyCar - single-chassis series, but rungs of a
ladder. A handful of cars that exist purely for one-make racing - the MX-5 Cup,
the TT Cup, the Abarth 500 Assetto Corse, the Huracan Super Trofeo - carry no class
or spec at all, and a championship reaches them by name.

**A championship may change spec between rounds.** IndyCar runs road, short-oval
and superspeedway kits - separate car folders, separate physics, separate specs -
across one season with one entry list and one standings table. So eligibility is
declared on the championship and overridden per round, rather than fixed for the
season. The 962C longtail at Le Mans and Monza is the same shape, and so are URD's
sprint and endurance EGT cars. What never varies is the seat: the driver, team and
livery are season-long, and only the car resolves per round.

**Spec sizes run from about thirty down to one, and that is correct.** A one-car
spec is what a season of a single-chassis series *is* - one year of an F1 mod, or
one generation of Porsche Cup car.
Specs split on pace rather than on the calendar, so two mods of the same season
stay apart where their figures say they cannot share a grid: RSS and VRC both
ship a 2024 F1 car, and they are 41% apart on power-to-weight.

**Road cars carry no class or spec.** They were classified once, into hot
hatches, sports road cars, road GTs, supercars and hypercars, and the audit
removed every one of those: they cluster tidily by power-to-weight and name no
series at all. A base-only career that wants them reaches them by car list, the
same way a one-make does.

Only cars the provenance catalogue already names get a spec. Anything else is a
mod we cannot identify, and leaving it unclassified is the honest answer -
the same stance provenance takes on an anonymous mod.

### Shipped championships

The app ships a championship library, not an empty editor. Provenance is what
makes that possible: we can say what a championship needs and whether you have it.

**A complete ladder is always playable on base content alone.** Someone who owns
nothing but the game gets a full career across disciplines and tiers. DLC and mod
championships extend the ladder sideways and upwards; they never fill a hole in
it. That constrains authoring rather than describing it - a base-only tier that
only works if you own Dream Pack 1 is a bug.

**Missing content is reported, not worked around.** A championship you cannot run
is listed as unavailable with exactly what it needs, named down to the DLC pack or
the mod, with an `acmanager://install` link where the mod offers one. It cannot be
entered as-is. Silently dropping rounds you have no track for would mean two
users' "same" championship quietly differ, and their results stop comparing.

**Forking is the way out.** Copy a shipped championship, disable the original, and
substitute or drop what you do not own. The copy is a full series file from that
moment and **diverges** - a later update to the original does not flow into it, and
the user is told so rather than discovering it.

**Content source toggles** say which championships you want offered: base, DLC,
and one per mod maker. They govern that list and nothing else. The car and track
browsers always show everything installed, because "what have I got" and "what do
I want to race" are different questions, and a library that hides your own mods
reads as a bug.

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

## Phase 1 - Electron shell ✅

Complete. A first run opens on a setup screen that must locate Assetto Corsa
before it lets you past; after that the app opens on diagnostics, with live theme
and language switching and errors translated all the way down from `src/core/`.

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
- [x] First-run flow: a gated setup screen shown until `setupCompletedAt` is
      stamped, reusing the same cards as diagnostics; Continue stays disabled
      until all three paths resolve
- [x] Localise errors raised in `src/core/` - every error the app raises itself
      now carries a stable code and params, translated in the renderer and still
      rendered in English for the CLI
- [x] Unit tests - Jest rather than `node:test`, 299 tests across `src/shared`,
      `src/core`, the settings store and the renderer's pure helpers

## Phase 2 - Content library and classification

The data layer landed first, deliberately: classes need specs to infer from, and
the browsers need paged channels and a way to show images out of the AC install.
Building the screens first would have meant building them against a shape nothing
had exercised.

- [x] Persist scan results with a cache keyed on folder mtimes - `content-cache.json`
      in `%APPDATA%`, with a fingerprint per car and per track layout. The rule is
      **stat every file the scan would have read and every directory it would have
      listed**: a folder's mtime does not move when a nested `ui_car.json` is saved
      over, which is the commonest update of all
- [x] Background rescan; detect content added while the app is open - non-recursive
      `fs.watch` on the four collection folders, plus a fingerprint pass on window
      focus for the in-place edits those watchers cannot see
- [x] Extract car specs (bhp, weight, top speed, power-to-weight) from
      `ui_car.json` - the basis for pricing and class inference. `src/core/car-performance/`,
      tolerant of the free text mod authors write; the author's own strings are kept
      alongside the numbers
- [x] Paged, filtered and searched IPC channels for cars and tracks, with
      drill-down facet counts - the surface the browsers land on
- [x] An `accontent://` protocol for preview images, path-validated so it cannot
      reach outside the content folder and limited to four fixed image names
- [x] Report broken content rather than hiding it - every skipped or degraded
      entry is now a `ContentIssue`, counted on the content card and listed by
      `npm run scan`
- [x] Car and track browsers with previews, filters and search - hash routing,
      card grids with infinite scroll, drill-down facet filters and debounced search
- [x] One card per **track**, not per layout - filters still run per layout, so a
      track matches when any of its layouts does and the card narrows to those.
      Picking a layout belongs to race setup, where it is the question being asked
- [x] **Content provenance** - base, DLC pack, mod maker and redistributor, per car
      and per track layout, from a shipped catalogue, every ID listed explicitly
- [x] Source, pack and maker filters and facets in both browsers, badged on the card
- [x] **Car classes** - a shipped catalogue of classes and specs, every catalogued
      car placed in exactly one grid, with Class and Spec filters and a spec badge
      in the car browser. Authored against the install's own `ui_car.json` figures,
      not folder names. Assignment UI is deliberately deferred to Phase 4
- [ ] **Disciplines and tiers** - the ladder structure
- [ ] Map classes to disciplines and tiers
- [ ] Skin browser, for pinning liveries to drivers - needs `ui_skin.json`, which
      the scanner still ignores in favour of bare folder names
- [ ] Translate `ContentIssueReason` in the renderer; only the count is shown so
      far, and the CLI keeps its own English

**Where the browsers end up.** They are the substrate, not the destination. The
two route-level pages are about a hundred lines of wiring; everything beneath
them is collection-agnostic - paging, infinite scroll, the toolbar, drill-down
facet filters, `ContentImage`, the cards - and it is what Phase 7's store page
and Phase 4's series content pickers are built from. Car classes needed nothing
new from them: Class and Spec are two more drill-down facets, and the drill-down
counting already narrows the spec list to the class you ticked. Phase 4's
assignment UI is what wants the car browser with a selection and an assign
action rather than a new screen.

Expect them to **demote out of primary nav** once career destinations exist, into
a content area beside diagnostics and the issue list, where the job is "what have
I got installed, and is any of it broken". A career app's top-level destinations
are the calendar, the championship, the garage and the store, not the library.

Turning them into pickers needs two things they do not have: selection semantics,
and a **single-entity lookup**. `content:cars` with `search: <id>` matches name,
brand, folder ID and tags alike, so it cannot resolve one car; a picker restoring
a saved selection needs `content:car { id }` and `content:track { key }` added to
the contract, the handler and the content store. None of that touches `src/core/`.

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
- [ ] **Throttle or hide the renderer while a race is live** - the app sits
      alongside a running game, so it should not burn frames in the background.
      Lands here because this is where the launch path first exists to trigger it:
      main hides or backgrounds the window on launch and restores it when
      `race_out.json` arrives
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
- [ ] Eligibility: a **spec**, or an **explicit list of cars** - never a class, so
      an era cannot leak onto a grid it does not belong on. The car list is what
      makes one-make championships work without a class per model, and it is needed
      for one-offs and invitationals anyway
- [ ] **Per-round eligibility override.** The championship declares eligibility
      once; a round may override it, because some fields change car with the track.
      IndyCar is the case that forces it - road, short-oval and superspeedway kits
      are separate car folders and separate specs, yet one championship with one
      entry list and one standings table. Group C's 962C longtail at Le Mans and
      Monza, and URD's sprint versus endurance EGT cars, are the same shape. The
      entry list and standings stay at series level; only the car resolves per round
- [ ] **Class and spec management UI**: create classes and specs, classify mods the
      shipped catalogue does not name, and override what we ship. The shipped
      catalogue is the base layer; the user layer is resolved over it at runtime
- [ ] **Adding or editing a car picks classes first, then specs.** A car holds a
      list of specs, so the spec options are **filtered by the classes chosen for
      that car** - you cannot reach a GT3 spec from a car you have put in GT4 and
      Track Special. Within one class only a single spec may be picked, since two
      would claim the car is two eras of that category at once
- [ ] Prize money tables (per finishing position, per final standing)
- [ ] Entry fees per round
- [ ] **Availability against installed content** - what a championship is missing,
      named down to the DLC pack or the mod, with `acmanager://install` where the
      mod offers one. Missing anything blocks entry rather than adapting silently
- [ ] **Series editor UI**: cars, tracks, calendar, rules, teams, money - the
      content pickers are Phase 2's browser shell with selection added, not new
      screens; see *Where the browsers end up*
- [ ] Per-round conditions: weather, time, track state, sessions
- [ ] Clone a series; extend an existing one with extra rounds
- [ ] Export / import series files
- [ ] Content manifest per series with `acmanager://install` for missing content
- [ ] **Championship configuration page**: every shipped championship, available or
      not, and what content it needs
- [ ] **Fork a shipped championship** - copy, disable the original, substitute or
      drop content. The copy diverges; a later update to the original never reaches it
- [ ] **Content source toggles** governing which championships are offered - base,
      DLC, and one per mod maker
- [ ] Ship the championship library, with a **complete base-only ladder** across
      several disciplines and tiers
- [ ] **Formula UK** - the championship the Lotus Exos 125 exists for. Both it
      and the S1 upgrade carry no spec, so the series names the two cars
      directly. They had a spec each until the customer-F1 pair was dropped:
      a customer chassis sold as an experience is not a category, and two specs
      of one car were never a grid
- [ ] **Formula Abarth** - the championship the Tatuus FA01 exists for. A real
      junior ladder rung, but a single-chassis one with a single car installed,
      so its class, its spec and its car were the same thing three times over.
      The class and spec are gone; the series names the car
- [ ] **American Le Mans Series (ALMS)** - the championship the BMW M3 E46 GTR
      exists for. Built for ALMS GT in 2001, it won the class and was legislated
      out a year later, so it has no grid to sit on: it carries no spec and the
      series names it directly. ALMS itself was multi-class, so this is an entry
      list that can grow if more 2001-era GT cars turn up, not a one-car rule

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
- [ ] **Store page**: every car, its price, and the championships it can enter -
      the car browser with a price on the card and a buy action; see *Where the
      browsers end up*
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
- ~~**Rally and rallycross.**~~ Deferred, and the class removed. The library holds
  two rally cars (`ks_audi_sport_quattro_rally`, `ks_toyota_celica_st185`) and one
  special stage, so there is no ladder in it. **Both are blocked on format rather
  than content**: stage rally is timed solo runs with times accumulated across
  stages, and rallycross is heats into semi-finals into a final with transfer
  positions, plus a mandatory joker lap that cannot be enforced or even detected
  from `race_out.json`. Everything here assumes a grid race scored on finishing
  order. Stage-rally *content* is plentiful - Kronos Simracing, N&F, RallyWorld and
  Verdes Garage for cars, hundreds of stages catalogued by AC Rally Central - so if
  this returns it returns on the weekend model, not on the car list. Rallycross is
  the better fit for the race model but its content is thin and close to
  single-source. Note that **a mod cannot be catalogued before it is installed**:
  the folder ID is the key, so any future class has to be authored against real
  folders.
- ~~**Where do career saves live?**~~ Settled: `app.getPath('userData')`
  (`%APPDATA%`), same as settings. Phase 6 adds an "open save folder" action and
  backup/export to cover the shareability the visible-folder option would have given.
- ~~**Localisation depth.**~~ Settled: strings *and* dates, numbers and currency,
  via `Intl` from the start, and errors raised in `src/core/` too - they carry a
  code the renderer translates, while the CLI keeps printing English.
- **Keeping the catalogue current.** Kunos still ships content and the mod teams
  ship constantly, so a catalogue authored once goes stale. Does it update with the
  app, or does something fetch it? LFM's pack in particular turns over every
  season, which may make its list unmaintainable at our end.
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
