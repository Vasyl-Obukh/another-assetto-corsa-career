# Roadmap

Living TODO. Phases are ordered by dependency - each should leave the app in a
usable state. Tick items as they land; add notes inline when reality differs
from the plan.

Status: **Phases 0, 1 and 2 complete.** The integration spike proves the full
round trip, the Electron shell sits on top of it - setup, diagnostics, theming,
i18n, settings and a tested core - the content library is cached, incremental,
spec-aware and honest about broken mods, and the car and track browsers consume
it behind real navigation. Provenance says which car or track is base game, DLC
or a mod, the class catalogue says which grid each named car races in, and the
ladder names the disciplines a championship can sit on. Liveries carry their
name, driver, team, number and country, and a car opens onto a page of them.

**Phase 3 is most of the way there.** The spikes settled what AC will and will
not do, and the app now drives the result: a race is set up, launched, watched
and classified without a terminal, and the window steps aside while the game
runs. Weather selection has been rebuilt on how CSP actually works, after the
first attempt modelled a controller and a weather as two independent things.

**Sessions now run one per launch** rather than being bundled, which reverses an
early decision and is worth reading in *Weekends and sessions* before touching
the weekend code. It made the grid unconditionally ours and gave every session
its own weather, wind, temperature, track state and start time.

**Every item in the phase is done.** Dynamic weather as generated plans landed,
along with the weather system setting that goes with it; road temperature is
Kunos' own curve rather than a stand-in; Content Manager's `Arguments.txt` is
written, from the settings screen for the two flags a career wants and from
`npm run testmode` for the one that stops CM racing; and assists reach CM in its own serialized
format - **measured, not inferred**, since `races/spikes/assists.json` came back
in `cfg/assists.ini` with all eight of its values intact - with driving aids in
settings and regulations on the race. **Tyre blankets moved across in Phase 4**:
they read as a driving aid but are a rule a championship writes down, so they
sit with damage, fuel use, tyre wear and slipstream rather than with ABS.

One row of the runbook is still open, and it corroborates rather than blocks:
the road-temperature diff against CM's own `race.ini` at 22:00, which is the
only hour where the curve we ship and the one Kunos wrote disagree.

## Decisions taken

| Question                        | Decision                                                                                                                                                                                                                                  |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Career depth                    | **Championship manager with a full economy.** Series, calendars, standings, progression, money, contracts, ratings, sponsors and an inbox. The Zero to Apex "living world" of ~1300 simulated drivers with their own careers comes later. |
| Results fidelity                | **Inferred now, CSP Lua recorder later.** Positions derived from laps-then-time until an in-game recorder replaces them.                                                                                                                  |
| Series authoring                | **In-app editor.**                                                                                                                                                                                                                        |
| In-game UI                      | **Desktop only for now.**                                                                                                                                                                                                                 |
| Race weekends                   | **User-defined session lists, one session per launch.** Each session is started from the app and run on its own. Reversed from bundling - see *Weekends and sessions*.                                                            |
| Weather system                  | **One choice in settings: PURE, Sol, or none.** Not a per-race question - it decides who renders, which is a look rather than a simulation. "None" is CSP's own `base` controller: **it still rains** - RainFX is core CSP - but the strength comes from the weather type rather than a preset's `[RAINFX]`, and weather cannot change mid-session. |
| Dynamic weather                 | **Generated plans handed to PURE Planner or Sol Planner.** Both read plan files we can write, and both have a "CM" slot meaning "take it from `race.ini`", so an authored plan can start from the session's own weather and evolve. |
| Live weather                    | **Dropped.** A career should not depend on the internet, so the `base-live` controller is not offered.                                                                                                                       |
| Grid when qualifying is skipped | **The race says where the player starts** - last unless it names pole, a slot or a seeded random one, always among their own class. The AI stand on pace class by class with slight seeded randomness, so skipped sessions don't produce identical grids. |
| Simulating rounds               | **Every round nobody drove.** A missed round, one run before the player entered and every round of a championship they are not in are raced by the field off each driver's pace and a seeded draw, with a stand-in in the player's seat. A weekend left part-way keeps what was driven and simulates the rest. |
| DNS                             | No points, **no fee** and **rating untouched**. An entry fee is paid as a round's first session launches, so a round skipped or missed costs nothing; a fine for missing one belongs to a contract that pays per championship (Phase 9). |
| Car pricing                     | **Real-world for the whole catalogue, suggested for what the user adds.** Every catalogued car, Kunos' and mods alike, at what the real car costs, pulled towards its class's median; a car the user adds starts on a suggestion they can change in Your content, and nothing else is adjustable. |
| Running out of money            | **Forced down the ladder.** Recoverable, never a hard fail.                                                                                                                                                                               |
| Rating                          | **Global + per-discipline**, with cross-discipline entry one tier below your best.                                                                                                                                                        |
| AI economy                      | **None.** Teams have budget tiers that shape their offers; AI drivers have no wallet.                                                                                                                                                     |
| Currency                        | **Real currency, $ by default.** € and £ as display only - no conversion. An app setting a career may override.                                                                                                                          |
| Progression speed               | **0.5x-4x multiplier on money and rating**, separate from AI difficulty. A career's own, changeable any time; the ledger records each change.                                                                                            |
| AI difficulty                   | **The player's to set, never learned.** One strength in settings, and a step of their own for a season or a round of the career. Adaptive difficulty was dropped: pace against the AI moves with the car and the track, which a learned figure would chase rather than answer. |
| Career clock                    | **Advances when you start a session dated later than the current day**, plus an explicit *advance to date* action so a career that isn't racing still moves.                                                                              |
| Multiple championships          | **Calendar clashes plus contract exclusivity.** You cannot be at two events on one day, and contracts state whether outside racing is allowed.                                                                                            |
| Saves                           | **Elder Scrolls style.** Named saves, overwrite, load any older save, plus rolling autosaves after every session (3 by default, configurable later). **Loading is free and silent**: any save, any time, and the career records no rollback. |
| Where career state lives        | **Main owns it, in memory.** One live career object, written through continuously so a crash costs nothing - its profile to `career.json`, its state to `state.json` - and saves are snapshots of the state alone. The renderer holds a read-only projection - no client-side store.        |
| Changing career state           | **Validated commands, never patches.** The renderer sends intent (`career:buyCar`); main checks the rules, applies, persists and pushes the result back.                                                                                  |
| Presentation                    | **Light and dark themes; English and Ukrainian.** Both foundational, not retrofitted.                                                                                                                                                     |
| Content provenance              | **A shipped catalogue, not inference.** Every car and track layout carries a source (base, DLC or mod), the DLC pack where there is one, the mod maker where we recognise one, and any redistributor.                                     |
| Car classes                     | **Class and spec, both shipped, and both plural per car.** A *spec* is a grid - the cars that can sensibly race each other - and a *class* is the family that spec belongs to across eras. Cars are assigned to specs; classes are derived. |
| Disciplines                     | **Single-seater, sportscar, touring and road.** Not historic - that is an era, and it cuts across all four. A championship names its own, so a road-car or one-make series has somewhere to sit.                          |
| Where a tier lives              | **On the championship, and per class entry.** Never on a car: one-make cars carry no spec to hang one off, and the same GT3 car races a world championship and a club series. WEC's LMGT3 entry sits a tier under its Hypercar one. |
| Series eligibility              | **A spec or a car list on the championship, overridable per round.** Most series declare it once. A round overrides where the car changes with the track - IndyCar swaps road, short-oval and superspeedway kits mid-season. Never a class. |
| A car in several grids          | **Normal, and modelled as a list of specs.** A Lotus 2-Eleven runs in Lotus Cup and as a track special. What a car may never hold is two specs of one class - that would claim it is two eras of a category at once.                      |
| One-make series                 | **Configured by naming its cars, not by a class.** A class names a category a car belongs to; it never exists to name one championship's entrants. A car that exists only for one-make racing carries no class or spec at all.            |
| What earns a class              | **A real series behind it, and a spec its cars could actually share.** Judged on the install's own figures and on era, with fantasy mods checked against their real counterparts. Groupings that are merely tidy - road cars by pace, track-day cars - do not qualify.                                    |
| Cars with no class              | **About a third of the library, on purpose.** They are not second-class content: a championship reaches them by naming cars. Only a car that belongs on a shared grid needs a spec.                                                                                                                       |
| Base-only career                | **Guaranteed.** A complete ladder is always playable on vanilla content alone. DLC and mods extend the ladder; they never fill holes in it.                                                                                               |
| Editing a shipped championship  | **Forking copies.** The fork diverges from that moment, and a later update to the original does not flow into it.                                                                                                                         |
| Missing content                 | **Report, block, offer to fix.** A championship missing anything is listed with what it needs, named down to the pack or the mod, and cannot be entered until it is forked or the content installed.                                      |
| What the library shows          | **The content the catalogue names, and nothing else until the user says so.** A car or track layout in no provenance record is an anonymous mod - no class, no spec, no price, no championship that can reach it - so the browsers and pickers leave it out, and a settings page lets the user add their own back. |
| Content source toggles          | **They govern which championships are offered, nothing else.**                                                                                                                                                                           |

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

**That answer now decides what the library offers.** `isCatalogued` is the six
records read as one question, and an ID in none of them is left out of the car
and track browsers and the pickers built from them until the user adds it - see
*Shipped championships*. So a missing row is no longer only a missing badge; it
is a car nobody can pick, which is what makes *Keeping the catalogue current*
under Open questions sharper than it was.

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

Only cars the provenance catalogue already names get a spec **in the shipped
layer**. Anything else is a mod we cannot identify, and leaving it unclassified
is the honest answer - the same stance provenance takes on an anonymous mod. The
user's own layer is where the rest gets classified: once a mod is added to the
library, its page offers Classify, and a class or spec the app does not ship can
be made in Settings.

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
and one per mod maker. They govern that list and nothing else.

**The library itself shows what the catalogue names**, which reverses an earlier
rule that it always shows everything installed. That rule was argued from "what
have I got" and "what do I want to race" being different questions, and from a
library that hides your own mods reading as a bug - and the first half is still
true, which is what the diagnostics card is for. What it missed is that
everything else in the app is keyed on the catalogue: an uncatalogued mod carries
no provenance to badge, no class or spec to filter by, no price when Phase 7
lands, and no championship that can reach it. Six hundred cars of which a third
are folder names is not a library, and a career should open on a curated one.

**The user adds their own back**, one at a time, in settings - the
same base-layer-over-user-layer shape the class and spec catalogue takes. The
diagnostics card still says how much is being left out, rather than letting a
third of an install disappear quietly, and links to that page.

### Disciplines and tiers

A **discipline** is a kind of racing - single-seater, sportscar, touring, road,
and whatever else users define. Each is a ladder of numbered **tiers**, tier 1
being the top. A championship names its own discipline, and a tier for each way
into it; content carries neither.

That last part is load-bearing, and it was got wrong once. **A tier cannot live
on a car.** A championship is configured by a spec or by an explicit list of
cars, and the car list is what one-make series use - so those cars carry no spec
to hang a tier off at all. Even for a car the catalogue does name, one number
could not hold the answer: a GT3 car races in a world championship and in a
national club series, and a Porsche Cup 992 runs in Supercup and in a regional
Carrera Cup. Those are different rungs.

**Tier is held per class entry rather than per championship**, because a
multi-class series is entered at a different level depending on the class you
enter it in. A *class entry* is one way into a championship - not to be confused
with the entry list, which is the grid. WEC is one series with one calendar,
entered as Hypercar, LMP2 or LMGT3, and the GT3 entry sits a tier below the
prototype ones: it occupies two rungs of the sportscar ladder at once, with its
own standings table per class.

**Road is a discipline like any other**, and it is why there is no map from
classes to disciplines. Road cars carry no class on purpose, so a class-keyed map
could never reach them - and "a catalogued car with no class is a road car" is
inference, and wrong: the MX-5 Cup, the TT Cup and the Abarth 500 Assetto Corse
are race cars with no class. A road championship names its cars, exactly as a
one-make one does. Cars carry specs and classes; nothing else.

**Historic is not a discipline.** It is an era, and it cuts across every one of
them - a 1967 Lotus 49 is a single-seater. Era is what a spec already carries.

The player holds a level per discipline, and:

- You may enter any series at or below your level in that discipline.
- **Entering a new discipline, you start one tier below your best level
  elsewhere.** An IndyCar driver can step into Formula 2, not straight into F1.

### Events and sessions

An event is an **ordered list of sessions**, authored per series - three
practices and two qualifyings if that is the format, or practice, sprint
qualifying, sprint, grand prix qualifying, grand prix. It was called a weekend
until the calendar stopped putting every race on one.

Sessions carry a **day offset**, up to three days of the event's own. They are
never dates: on the calendar an event takes only its race day, and the day
offset decides the time of day and how the weather carries over. A championship
races on a day of the week of its own - tier 1 on Sunday, tier 2 on Saturday,
everything lower on a weekday - so the rungs a career climbs through spread
across the week instead of queueing for one day. Historic events fall on
weekdays too, and on a day the career races nothing else where they can.

**Each session is its own launch, started from the app one at a time.** This
reverses the original decision to bundle sessions into as few launches as AC
allows, and it was reversed on purpose. **Built**: `planWeekend()` maps one
session to one launch, and `splitSessions()` is gone.

Bundling was chosen to save alt-tabbing: practice, qualifying and a race could
run back to back inside one start of the game. What it cost was clarity and
control. A weekend still had to split after every race, so a sprint-plus-feature
format was two launches anyway and the user had to understand why; and because
`race.ini` writes `[LIGHTING] SUN_ANGLE`, `[TEMPERATURE]`, `[WEATHER]`,
`[WIND]` and `[DYNAMIC_TRACK]` once per launch, every session inside a bundle
was forced to share one set of conditions.

One session per launch buys three things:

- **Conditions per session.** Weather, wind, temperature, track state and start
  time all become session-level, because a session is now a whole `race.ini`.
- **The grid is always ours.** Qualifying can never share a launch with a race,
  so `STARTING_POSITION` is always honoured and the grid is always ours to
  write. That replaces the old two-case rule - "qualifying owns the grid, except
  when the race runs alone" - with one invariant, and it was the trickiest
  conditional in the system.
- **A format is what it says it is.** No bundling rules to explain, and no
  weekend that silently splits somewhere the user did not ask for.

What it costs is a full AC load per session - thirty to sixty seconds on a large
mod track - and a return to the app between each one. Nothing is lost on tyres or
fuel, which AC resets between sessions in either arrangement.

The grid is carried across every seam with `STARTING_POSITION` and `[CAR_n]`
ordering, derived from the previous session's own lap times.

### Weather, and how dynamic weather is actually driven

Four layers, and confusing any two of them produces a race that silently runs in
the wrong weather - which is this area's characteristic failure, because nothing
reports it.

1. **The weather** is what the race asks for: a CSP weather type
   (`ac.WeatherType`, 33 values) or a named `content/weather/` preset. It
   reaches AC as `[WEATHER] NAME` plus `[LIGHTING] __CM_WEATHER_TYPE`.
2. **The controller** is a Lua script under `extension/weather-controllers/`
   that renders it. One is always running, named by the user's
   `cfg/extension/weather_fx.ini`, and `__CM_WEATHER_CONTROLLER` overrides that
   for one race without restoring it afterwards.
3. **Whether the weather is read at all** is the controller's own decision,
   declared as `FOLLOWS_SELECTED_WEATHER` in its `manifest.ini`. Set to 0 it
   ignores the race and drives the weather itself; absent or 1 it renders what
   was asked. That flag is the only thing separating *dynamic weather* from a
   *controller*, and it is why the two were merged into one menu.
4. **A planner app** is where a dynamic controller gets its weather. PURE
   Planner and Sol Planner are separate apps with their own plan files, and a
   plan is a sequence of weather states with durations.

**PURE ships no weather presets.** It renders the type, so choosing "Rain" *is*
choosing PURE's rain. Its own `Default_WeatherPresets.json` holds 37 entries
whose first 31 are `ac.WeatherType` one for one. Sol ships one `content/weather/`
folder per type instead, which is where a library's `sol_*` presets come from.

#### Plan files, which we can generate

Both planners read plans we can write. Both also have a **"CM" weather slot**
that looked like it meant "take it from `race.ini`" - it does not, see below -
so a generated plan states its own weather in every step, which the generator
knows anyway.

**Sol Planner** (`apps/python/sol_planner/`) uses INI, which we already read and
write. A plan is slot-indexed keys - `<n>-weather`, `-rain`, `-rainprobability`,
`-rainvariance`, `-wetness`, `-wetfine`, `-puddles`, `-humidity`, `-fog`,
`-tempambient`, `-temproad`, `-wind`, `-winddirection`, `-playseconds`,
`-stamphour`, `-stampminute` - over **nine** slots, then `timemode`,
`timemultiplier`, `repeat`, `playing`. `repeat` and `playing` are compared as
Python booleans, so they are written `True` and `False`, capitalised.

**The autoload hook is `presets/presets.ini`**: `[general] loadWithStart = <n>`
plus sections `[0]`-`[4]`. `sol_planner.py` imports that file at startup and
presses the flagged preset, so a plan written there runs without the user
touching anything.

**Two spellings in that file are traps, and both were found by reading the
installed source rather than the files.** `sol_planner.py` sets
`presets_ini.optionxform = str`, which makes ConfigParser options
case-sensitive, and then only ever asks for `loadWithStart` - while the file it
ships writes `loadwithstart`. So autoload is doing nothing on a stock install,
and a plan written with the lowercase key would silently never load. Write
camelCase. `usefullday` is dead for the same reason: only `useFullDay` is read,
the writer deletes it, and every file on disk carries the unmatched lowercase
form - use `timemode` instead (`0` day cycle, `1` timespan, `2` timestamp).

**PURE Planner** (`extension/config-ext/PurePlanner/`) uses JSON:
`{ control: { timemulti, loop, type }, container: [ { data: { duration,
timestamp, weather: {...} } } ] }`, `duration` in seconds and the `weather`
object carrying **all 35 keys** - we write every one, since a partial object has
never been tested against their loader. It loads `Plans/last_used.json` by
default (`LAST_USED=1` in `pureCtrl/settings.ini`), or a named plan from
`Plans/{Daycycle,Timed,Stamp}/` - **`Daycycle` is one word** - when
`PLAN = <mode>/<name>` is set with `LAST_USED=0`. The name carries **no `.json`
extension** and uses a forward slash. `AUTOSTART=1` starts it with the race.

**`control.type` is the mode, and the folder a plan sits in does not set it.**
`PLANNER_Plan_TYPE` in `apps/lua/PurePlanner/plan/plan_manager.lua` is daycycle
1, timed 2, stamp 3, live 4, database 5. A **daycycle** plan ignores every
step's `duration` and spreads the steps evenly across 24 hours - a three-step
plan becomes three eight-hour blocks - while only **timed** honours them,
multiplying each by `timemulti`. Writing a plan into `Plans/Timed/` with
`type: 1` was driven and came back as a day cycle, which is how this was found.

**The timestamps are not decoration either.** PURE builds its sun table from the
first step's timestamp to the last one's plus its duration, so they decide what
time of day the session runs at - a plan chained from midnight races in the
dark. They have to be set from the session's own start time.

**PURE shows plan times in local time while ours are UTC**, so a plan written for
midday appears in its UI as 14:00 at UTC+2. Worth knowing before reading that as
a bug. Whether the *sun* is placed from the timestamp as UTC or as local is a
separate question and is not yet answered - it only starts to matter when a plan
is generated for a real session and has to agree with race.ini's own SUN_ANGLE.

**The weather numbering is shared but written two ways.** `weather_params` in
`sol_planner.py` is the table both use: a row per weather, carrying a name and
an `id`. Sol's plans store the **row index**; PURE's store the **id**. They
differ past row 32 - row 33 is No Clouds with id 100, and row 38 is `"CM"` with
**id 50**, which is the `index: 50` PURE writes into its own plans. The table
also carries `Random Dry`, `Random Rainy` and `Random Bad`, which both
controllers expose through their settings - worth knowing, because randomly
generated weather may need no plan authoring at all.

**But below that they all agree, which is what makes the writers small.** For
values 0 to 32 our own `WeatherType`, PURE's id and Sol's row index are the
same number, checked row by row against both tables: `LIGHT_THUNDERSTORM = 0`
through `HAIL = 32` line up exactly. So the mapping is the identity plus the
handful of specials above it, and a weather Sol numbers differently is refused
rather than silently written as a random-weather row. A third scheme exists and
is not ours to write: `CM_WEATHER` in the controllers' own `settings.ini` is a
1-based list where No Clouds is 1.

**Both mean writing into the user's mod folders**, the same intrusion the career
weather presets already make. Rather than stomping what they read by default, we
**claim a slot of our own**: a named plan at `Plans/Timed/career.json` for PURE,
and Sol preset `[4]`. `Plans/last_used.json` and Sol slots `[0]`-`[3]` are never
written.

Two changes to files we are guests in are unavoidable - PURE ignores a named
plan unless `LAST_USED` is off, and Sol needs its autoload flag - so **what was
there is recorded first and put back by `npm run weather -- plan remove`**,
including anything the user already had in slot `[4]`. That is done with
`patchIni`, a line-level edit added for the purpose: `pureCtrl/settings.ini`
documents every weather value in inline comments, and a `parseIni`/`writeIni`
round trip would delete all of them. Verified on the real install - installing
both plans and removing them again leaves all three files byte-identical.

**One thing we cannot give back, and it is worth warning about: PURE overwrites
`Plans/last_used.json` with whatever plan it just ran.** So driving a generated
plan destroys whatever the user last had loaded, even though our writer never
touches that file. Nothing in our remove can restore it, because the damage is
done by their app during the race rather than by us before it. If a career ever
installs plans routinely, it should copy that file aside the first time and say
so, or accept that the slot is ours in practice whatever the folder layout says.

What still wants driving is whether either planner actually *reads* what we
wrote; see the two runbook rows.

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
budget tier. Series entry lists are lists of seats.

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

Rating moves on results, weighted by the **tier being raced** and by the
**strength of who you beat and who beat you**. We set `AI_LEVEL` per entry, so
the field has a known strength spread and every finish carries an
expected-versus-actual signal; an Elo-style update fits naturally. The
player's own steps must feed in honestly - gains reflect the level actually
raced against, which every launch records, not the nominal one.

### Sponsors

A **main sponsor and partners** filling **slots** that grow with your rung. Each
deal is drawn from a pool of perks and conditions: it pays race by race for a
target met, on results and for a goal over its year, and a main sponsor brings a
signature perk - a championship's fees, pay that climbs with you, half a car.
Offers come to a driver racing well. No sponsor opens a rung above: the ladder
stays the only way up. Phase 10 holds the detail.

### Progression speed

Two multipliers, independent of AI difficulty and of each other: one on prize
money, one on every change of rating, up and down alike. 0.5x for a hard, slow
career; 2x for a fast one. Each is changeable mid-career, with the career
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

- **The working state** (`state.json`) is written through continuously, debounced.
  Accepting a contract or buying a car must survive a crash; none of that is worth
  replaying.
- **Saves** are snapshots copied from the working state at deliberate moments -
  rolling autosaves at session boundaries and as a season opens, the first as the
  career is made, plus named saves. These are restore points, not durability - but
  a `state.json` that is missing or does not read is replaced by the newest save
  that does, which is why a career always has one.
- **The profile** (`career.json`) is what every save shares - who races the career,
  when it started, and its own settings - so loading a save never changes it.

```
%APPDATA%/ac-career-mode/careers/<career-id>/
  career.json          the profile: identity, driver, start date, the slot's settings
  state.json           live working state, written debounced after every change
  saves/
    autosave-1.json    snapshots of the state, rolling
    quicksave.json     the one quick save
    <uuid>.json        named saves; the name lives inside
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

Two questions this left open for Phase 6, one now settled:

- ~~**Save-scumming.**~~ Settled: **free and silent.** Any save loads at any
  time and the career keeps no note of it - how the player plays is theirs to
  decide. One-way autosaves and a recorded rollback were both considered and
  dropped.
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
- [x] **Disciplines and tiers** - the ladder structure. Four disciplines, and a
      tier that belongs to a championship's class entry rather than to a car.
      Mapping classes to disciplines was planned alongside it and dropped: with
      tier gone it was a second table saying what the class already says, and it
      could never reach road cars or one-make cars, which carry no class by
      design. See *Disciplines and tiers*
- [x] **Skin browser** - `ui_skin.json` is read, so a livery carries its display
      name, driver, team, number and country rather than a bare folder name, and
      a car card opens onto a page listing them with previews and a search. The
      fingerprint had to grow a stamp per livery to go with it: the skins
      folder's own mtime moves when a livery is added or removed and sees
      nothing at all when one is edited in place. **Pinning liveries to drivers
      is deliberately not here** - there is no driver, team or seat until Phase
      4, so a pin would have nowhere to persist. Reading the data was the
      blocker, and that is what has gone. **The player's own livery is picked**,
      though: the car picker asks for it as a second step, exactly as the track
      picker asks for a layout, and skips the step for a car shipping fewer than
      two. That reaches `race.ini`'s `SKIN` for `[CAR_0]`; the AI field is still
      `buildGrid`'s automatic assignment
- [x] **Translate `ContentIssueReason` in the renderer** - the broken-content
      count on the content card is now a popover listing every broken entry
      grouped by reason, off the `content:issues` channel that had been wired end
      to end and never called. The English wording moved to
      `src/shared/constants/`, so the CLI and the app read one table rather than
      two
- [x] **The library is what the catalogue names, not everything installed** - the
      browsers and the race screen's pickers now answer from the catalogued half
      of the scan. `isCatalogued` in `src/core/content-catalogue/` is the whole
      rule - base or DLC by source, a named mod by its maker, an LFM car or
      layout by its distributor - so nothing new is scanned and
      `CONTENT_CACHE_VERSION` did not have to move. On the install it was written
      against that is **418 cars of 622 and 66 circuits of 96**, and the 204
      cars and 90 layouts left out are exactly the anonymous mods the catalogue
      already declines to attribute. Reverses "the library always shows
      everything installed"; see *Shipped championships*.
      **Tracks are judged per layout**, as every other track filter already is,
      so a circuit whose folder nobody claims but which LFM ships layouts into
      narrows to those rather than disappearing - seven of them do.
      **Narrowed in `src/main/content-store/` and nowhere else**, which is what
      keeps the blast radius to browsing: `content()` still hands out the whole
      scan, so a race already set up still runs, `seriesAvailability` still
      judges a championship against what is installed - naming a car is itself
      an act of choosing it - and `npm run scan` still counts all 622. The
      diagnostics card says how much is being left out, because hiding a third
      of someone's library with nothing said is the failure mode this project
      complains about everywhere else

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
brand, folder ID and tags alike, so it cannot resolve one car. Half of that has
landed: the car detail page wanted the same thing, so `content:car { id }` is on
the contract, the handler and the content store already. `content:track { key }`
is still to come, and is the same three lines. Neither touches `src/core/`.

## Phase 3 - Race weekends and sessions

Spikes first - they decide what weekend formats are expressible.

- [x] **Spike `[SESSION_n] STARTING_POSITION`** - **it works, and it counts from
      one.** `STARTING_POSITION=4` in an eight-car field put the player fourth.
      AI grid order follows `[CAR_n]` order exactly, and the player is
      *inserted* at their slot rather than swapped with whoever held it: Car 1,
      Car 2 and Car 3 lined up ahead, Car 4 through Car 7 shuffled back behind.
      So the grid is ours to write - any player slot, any AI order - which is
      what split weekends and grid reconstruction were waiting on
- [x] **Spike repeated session types** - **no: a launch ends at its first race.**
      AC accepts two `TYPE=3` sessions in the INI and lists all four in the
      in-game weekend structure, so it looks like it will work - but when the
      sprint finished the only options were restart, replay and close. There is
      no advancing to the feature, and `race_out.json` came back with three
      session entries and no fourth. **So the bundler's rule is: at most one
      race per launch, and it must be the last session in it.** Practice and
      qualifying ahead of it are fine - all three ran in one launch, which is
      the multi-session weekend proven working
- [x] **Verify `[SESSION_n] LAPS` vs `[RACE] RACE_LAPS`** - **dissolved rather
      than answered.** The sprint ran its 2 laps, but `RACE_LAPS` also carried 2,
      so the run could not tell which key AC read, and the feature that would
      have discriminated never started. It no longer matters: with one race per
      launch, `RACE_LAPS` is always taken from the only race session present, so
      the two keys cannot disagree. The bundler's split makes it correct by
      construction
- [x] **Spike early exit** - **the file is always written, and quitting a race
      does not abort it.** Two runs, and the second corrected the first.
      A four-session weekend stopped after the third wrote one entry per session
      that ran and nothing for the one that never started, while
      `number_of_sessions` kept saying 4 - it is the *configured* count, not the
      run count. **But that only catches sessions that never started.** Quitting
      out of a race mid-way still reported 3 of 3: AC carried on and ran the race
      to completion with the AI at normal pace, wrote a full result, and recorded
      the departed player on the single lap they had done. So a launch is never
      lost partway and there is no remainder to resume inside one - the state
      machine only has to track which *launches* of a weekend have been run.
      The cost is that **a mid-race quit is indistinguishable from being lapped**,
      both being nothing but a lower lap count, which is the retirement problem
      again. For a career that is a workable DNF proxy: you are classified on the
      laps you completed. Practice and qualifying carry no `raceResult`.
      Untested, and deliberately: killing the process outright, which presumably
      writes nothing and simply costs that launch
- [x] **`event` is not a session index** - AC writes `event: 0` on every session,
      including all three of a weekend, so sessions are told apart by array
      position or by type and name. Typed and commented; nothing depends on it
      yet, but it would have been a silent wrong assumption
- [x] **Adopt `raceResult` for race sessions, keeping inference as the fallback**
      - not for new information, since it has never disagreed with our inferred
      order, but because it is AC's own classification and therefore immune to
      bugs in ours. One such bug is already known and parked: `summarise()` sums
      only valid laps into `totalTime` while counting invalidated ones in `laps`,
      so a driver with a cut lap gets an artificially low total and can sort
      ahead unfairly. `raceResult` cannot get that wrong. Practice and qualifying
      carry none, so inference stays and that bug still needs fixing for them.
      **Done**: `summarise()` takes AC's order whenever the session carries a
      `raceResult` that is a genuine permutation of the field, and falls back to
      the laps-then-time sort otherwise. `SessionSummary.order` records which of
      the two produced the table, because two classifications that have never
      yet disagreed are exactly the ones nobody would notice diverging
- [x] **A race ends at the leader's distance** - the lapped car was classified on
      four laps rather than being sent out to complete a fifth, so the session
      ends when the leader takes the flag and everyone else is classified where
      they are. The weekend state machine can assume a race session terminates
      on its own rather than waiting for the field
- [x] **Spike `raceResult`** - **it holds up, and it is a finishing order**:
      `raceResult[n]` is the car index that finished `n`-th, counting positions
      from zero. Confirmed against a driven three-lap race at Magione, checked
      against elapsed times summed from the raw lap data rather than against
      `summarise()`, so the two are genuinely independent: `[3,2,0,1,5,6,7,4]`
      matched the elapsed-time order exactly. The rival reading - position per
      car - is ruled out, since it would have put car 2 first on a 292.7s race
      to car 3's 289.2s. It is written on race sessions and absent from
      practice, so it is now modelled as optional.
      **Lapped cars settled too, and the answer is that it tells us nothing
      new.** A car crippled with 500kg of ballast and a 60% restrictor was
      lapped over five laps; it appears in `raceResult` normally, the array
      stays the full length of the entry list so it can be indexed safely, and
      it is placed **last** - exactly where laps-then-time inference already
      puts it. Across four independent races `raceResult` and our inferred
      order have agreed every single time.
      **Retirement proper cannot be produced at all**, so it is not a probe
      that was skipped: AC has no retirement flag, and a car that stops is
      indistinguishable from one never classified. Being lapped is the only
      under-distance case that can be created on purpose.
      So `raceResult` is corroboration rather than new information, and real
      positions still wait on Phase 12. It is worth adopting anyway - see below
- [x] **Weekend model** - a weekend is a `RaceDefinition` whose `sessions`
      cover the whole event, rather than a second format beside it. Sessions
      gained `day` and `timeOfDay`: the day is what Phase 5's calendar will
      schedule against and is a hard bundling boundary here, and the time is
      per launch rather than per session because `[LIGHTING] SUN_ANGLE` is
      written once per INI. Per-series formats belong to Phase 4's series
      schema, so only the shape they will be expressed in landed here
- [x] **Launch bundler** - `planWeekend()` in `src/core/weekend/`, applying
      the four rules below. It also **materialises the entry list once** and
      freezes it into every launch: left as a bulk description, liveries and AI
      levels would be resolved afresh each launch and the feature would be run
      by a different field than the sprint
- [x] **Weekend state machine** - `nextLaunch()` and `advanceWeekend()`, both
      pure functions over a `WeekendState`; the timestamp and archive path are
      passed in rather than read. Rule 4 is why it is so small: a launch never
      half-runs, so a record is only ever pending or done. The CLI keeps the
      value in `data/weekends/`; Phase 6's career store adopts the same reducer
- [x] **Grid reconstruction** across launch seams from qualifying results -
      **and it has to be derived, because AC will not hand it over.** A
      qualifying session carries no `raceResult`, confirmed on a properly run
      session where every car set a time and the player took pole by five
      seconds. Only race sessions write one. So the grid for the next launch
      comes from sorting `bestLaps` ourselves, which also means deciding what
      to do with a car that set no time at all - it has no best lap to sort on
      and cannot simply be dropped, since it still occupies a grid slot.
      **The derivation is known to be right, though**: on the qualifying spike
      the order `summarise()` derived from best laps matched the grid AC itself
      built from that session, confirmed at both ends - pole and last. So
      sorting on best lap reproduces AC's own qualifying classification, and
      reconstruction is a matter of writing that order into `[CAR_n]` rather
      than of guessing at what AC would have done.
      **Done.** The order is derived from the session's raw laps rather than
      from `bestLaps`, so an invalidated lap's -1 can never become a pole time,
      and a car that set no time at all sorts behind every car that did while
      keeping its slot. Two details only showed up in the writing. A result's
      car indices are positions in *that launch's* `[CAR_n]` order, not in the
      weekend's, so an inherited order has to be mapped back through the order
      the launch was run with - otherwise the second reconstruction of a
      weekend silently permutes the field. And `[CAR_0]` stays the player in
      every launch, because AC *inserts* them at `STARTING_POSITION` rather
      than swapping, so only the AI are reordered in the INI
- [x] **Spike qualifying versus `STARTING_POSITION`** - **qualifying wins, and
      completely.** The race asked for position 8; the player qualified on pole
      and started on pole, while Car 6 - slowest in qualifying - started 8th.
      The whole grid was the qualifying order, both ends confirmed, and the key
      was disregarded. Whether AC ignores it or the qualifying result overwrites
      it cannot be told apart from outside, and does not matter.
      **So `STARTING_POSITION` only bites in a launch with no qualifying in it**,
      which is exactly the case `spikes/grid` proved it working in. The two
      results are consistent rather than contradictory
- [x] **Player last when qualifying is skipped; AI by rating with randomness** -
      unblocked by the above: "skipped" means no qualifying session in that
      launch, which is precisely when `STARTING_POSITION` is honoured. The
      randomness is a seeded Park-Miller generator keyed on the weekend id and
      launch index, not `Math.random`: a career has to be able to re-plan a
      launch it has already shown the player and get the same grid back
- [x] **Track grip continuity across separate launches** - AC resets grip to
      `[DYNAMIC_TRACK] SESSION_START` every time the game starts, so a Sunday
      race would otherwise open on the same green track Friday practice did.
      `Conditions.startGrip` overrides the preset and the bundler raises it per
      launch from the sessions already run. **This one is an approximation, not
      a measurement** - AC's grip accumulation curve is not published and we
      have not probed it, so it sits in the same class as the road-temperature
      stand-in. Worth a spike: run practice twice on a green track and read the
      grip figure back.
      **It is also monotone and weather-blind**, which is the sharper
      limitation: every completed session raises the figure, when a wet session
      washes rubber off the track and should lower it well below where the
      weekend started. That cannot be expressed today - `Conditions` sits on the
      weekend, so every launch of one shares its weather - so the model becomes
      reachable and wrong at the same moment. Filed against Phase 4, where a
      session first gets a weather of its own
- [x] **Race setup screen** - track, car, grid, sessions and conditions, with
      the launch plan and everything blocking it beneath. The pickers are the
      existing browsers rather than new screens: `CarCard` and `TrackCard` gained
      an optional `onSelect`, which is the whole of the selection semantics Phase
      2 said they lacked, and `content:track { key }` is the single-entity lookup
      that was still missing.
      **Picking a track is two steps, and it has to be**: a layout is what
      `race.ini` runs on, and a layout's *name* says nothing about its shape -
      "Endurance" and "Sprint" are both the Nordschleife. So the circuit is
      picked first and its layouts second, as tiles showing each one's own
      `outline.png`, which is the only thing that tells them apart; every layout
      of a circuit shares the same pit-straight photograph. A one-layout circuit
      picks straight through and never shows the step.
      That is also why the scan now reads `length` and `width` from
      `ui_track.json` - a tile reading "20.8 km" beside a map is identifiable in
      a way a folder name never was. The unit is the whole difficulty: authors
      write "5793", "5.793", "20,832", "4.5 km" and "13.626km" for the same kind
      of field, and an explicit unit has to override the thousands-separator rule
      or Le Mans reads as thirteen thousand kilometres. Checked against the
      install: all 315 layouts parse, and every circuit whose length everyone
      knows comes out right.
      **Every launch goes through `planWeekend()`, including a single race**,
      which is simply a one-launch weekend. Routing single races around the
      bundler would have meant two code paths where AC allows one, and it is why
      a sprint plus a feature splits correctly from the first day the screen
      exists rather than from whenever someone wired the weekend path in
- [x] **Results screen per session** - the archive list, and one page per result
      with a table per session. The order badge says whether the classification
      is AC's own `raceResult` or ours, which is what `SessionSummary.order`
      exists for: two orders that have never yet disagreed are exactly the ones
      nobody would notice diverging. `formatLapTime` moved from `src/core/results/`
      to `src/shared/utils/lap-time/`, since the renderer may not import core,
      and it stays outside the `Intl` formatters on purpose - `1:32.451` is a
      timing-screen convention rather than a locale decision
- [x] **Throttle or hide the renderer while a race is live** - main minimises the
      window when a launch starts and restores it when the result lands.
      Minimised rather than hidden: Windows stops painting either way, but hiding
      also takes the taskbar entry, and a window the user cannot find while a
      race runs reads as a crash rather than as tact
- [x] **The race path in main** - none of the above was reachable before,
      because nothing under `src/main/` imported `core/launch`, `core/results`,
      `core/race-ini` or `core/weekend`: a race was launchable only from the CLI.
      `src/main/race-store/` now owns the draft, the weekend progress and the
      launch in flight, running the same steps in the same order as
      `cmdWeekend`. The one thing that does not fit request/response is waiting
      for a result - a launch resolves as soon as CM has the URI and the result
      lands hours later - so the wait is detached and everything it changes
      arrives as a `race:changed` push. That also gave `waitForResults` an
      `AbortSignal`: the CLI ends the wait with Ctrl+C, and the app has to stop
      watching without stopping anything else
- [x] **Weather is chosen the way CSP actually works** - the picker was built on
      the wrong model and offered a weather preset and a "controller" as two
      independent dropdowns. A controller declaring `FOLLOWS_SELECTED_WEATHER = 0`
      in its `manifest.ini` ignores the race's weather entirely and drives it
      from its own planner app, and PURE's manifest says so beside the flag:
      *"this parameter is static and moves weather controller into a different
      section"*. So Pure, Sol 2.5 dynamic and Live are **dynamic weather**, and
      Default, Pure Static, Sol and Sol 2.5 static are **controllers**. The scan
      reads that flag, plus `TIME_DIAPASON`, `[CLOUDS] COVER`, `[RAINFX]` and
      `[CAR_LIGHTS] FORCE_ON`, and one merged menu offers dynamic weather, the
      33 `ac.WeatherType` values and the installed presets grouped by author.
      **PURE ships no weather folders at all** - it renders the type - which is
      why asking for a type had to become expressible at all (`Conditions.weatherType`);
      a preset is still resolved behind it because `[WEATHER] NAME` needs a
      folder, preferring our `career_*` presets for their `[RAINFX]` block.
      `__CM_WEATHER_CONTROLLER` is now written only when a race names one, and
      the user's own `weather_fx.ini` is read back so the screen can warn when a
      static weather is about to be ignored
- [x] **Run each session as its own launch** - see *Weekends and sessions*.
      `splitSessions()` is deleted and `planWeekend()` maps sessions to launches
      one for one; `WeekendLaunch` carries the `session` it runs in place of the
      `hasQualifying` / `hasRace` pair those rules needed. `Conditions` moved
      down onto `SessionDefinition` with the weekend holding defaults, merged by
      a new `src/shared/utils/conditions/` - shared rather than in core because
      the renderer shows a session its inherited values. **Weather merges as a
      group**: `weather`, `weatherType` and `weatherController` answer one
      question, so a session naming any of them replaces all three, or a session
      asking for a CSP type would keep the weekend's preset beside it and the
      two would disagree silently.
      **The conditional this existed to remove is gone**: `startingGrid()` was
      `if (!launch?.hasRace || launch.hasQualifying) return null`, and is now
      `if (launch?.session.type !== 'race')`. Grid reconstruction went from a
      special case to the only case, and `spikes/qualifying` now runs its race in
      a launch of its own where `STARTING_POSITION` is actually honoured.
      Proven not to have moved anything else: a one-session weekend comes out of
      the bundler byte-for-byte identical to what `buildRaceIni` produces from
      the definition directly, checked for `demo` and `spikes/grid`.
      **Driven end to end through the app**: a qualifying session, then a race in
      a launch of its own, with the field ordered on the qualifying times. That
      is the first time a result from one launch has set the grid of another,
      and it is the whole point of the change
- [x] **Practice and qualifying start from the pit box** - `DEFAULT_SPAWN_SET`
      was `START` for every session type, and every spike file had been naming
      `"spawnSet": "PIT"` by hand, so the default was never exercised until the
      app created a session that named none. A qualifying session was put on the
      grid: wrong in a way that is obvious in game and invisible in the INI. The
      default is now per type, and guarded by a test
- [x] **Plain Custom Shaders Patch rains** - driven, after source-reading had
      already been wrong twice on this mod stack. The `base` controller with
      weather type 7 produced water on the road and spray off the car, so
      "none" is a real option rather than a dry one. The gate is CSP itself -
      its preview builds are what carry WeatherFX and RainFX - and not the
      choice of controller.
      **A caveat worth keeping**: the type filter this justified is honest but
      near-vacuous. PURE lacks only Cold and Hot, and on a library with Sol
      installed no preset declares either, so all three systems offer the same
      31 types. The visible difference a system makes is whether weather can
      change at all
- [x] **Weather system setting** - PURE, Sol or none, chosen once rather than per
      race, mapping to `pureCtrl static` / `sol2static` / `base` for static
      weather and to `pureCtrl` / `sol2` / nothing for dynamic. The per-race
      controller field is gone from the race screen, though `Conditions.weatherController`
      survives as a hand-authored override, because the weather-plan spikes name
      a controller explicitly and have to keep working. `base-live` is not
      offered, since a career should not depend on the internet.
      It needed **a settings screen**, which the app did not have: theme and
      language were two selects in the header, and "which weather system" needs
      a paragraph a header cannot carry. They moved into it.
- [x] **Weather that changes during a session** - the weather picker is slots.
      One slot is static weather and behaves exactly as before; adding a second
      turns it into a plan, and the last slot **holds until the session ends**,
      which is the only way a plan is expressible for a race measured in laps
      rather than minutes. Removing back down to one slot collapses to a plain
      static choice. The race store installs the plan before handing over and
      removes it in `settle()`, the one path every ending goes through - so a
      cancelled or failed launch gives the planner its settings back too.
      **Offered weather is filtered three ways**: to types an installed preset
      declares, to what the chosen planner numbers (PURE has no Cold or Hot),
      and - with RainFX off - away from anything wet, since asking for rain that
      cannot be drawn produces a dry race and reports nothing
- [x] **The weather picker offers types only** - installed presets are no longer
      listed. It had shown all 45 of them grouped by author beside the 31 types,
      which asked the same question twice and made the redundancy visible rather
      than fixing it. **A preset is not owned by a weather system**, which is why
      "filter the presets by system" has no answer: it is a `content/weather/`
      folder carrying a type, and PURE renders Sol's presets perfectly well by
      reading that type. Nothing is lost by dropping them, because
      `presetForType` already resolves a type to the best preset behind it,
      preferring one carrying `[RAINFX]` - which is what the `career_*` presets
      exist for. Picking "Rain" gets `career_rain` without anyone knowing.
      `Conditions.weather` survives for hand-written race files, which the
      spikes use
- [x] **Conditions moved into a dialog**, having first been squeezed into a grid
      cell. A slot row - weather, length, remove - wants about 400px; the first
      cell of the three-column conditions grid inside a session row offers about
      270, so every slot wrapped onto two lines and adding one grew a single
      cell while the five fields beside it stayed short. **Conditions are the
      part of a session that does not fit beside anything**, so they left the
      grid rather than being squeezed further: the weekend card and each session
      row now open the same dialog, two columns, the weather list growing down
      one of them. It also collapsed a duplication - the weekend defaults and a
      session's overrides were two copies of the same fields, and are now one
      `ConditionsBody` taking three props for the three ways they differ
- [x] **Every field in a session row is a fixed width**, the name included. It
      was given the slack the others left, which made it the one field whose
      right edge moved with the window - and so the one field that put every
      field after it out of line with the row above. A list of rows wants
      columns; the widths were narrowed instead, which is what got the badge and
      the move buttons back onto the same line
- [x] **The dialog is one column of weather over a grid of everything else.**
      Two columns put the weather list beside the single values, which meant the
      widest thing in the dialog and the narrowest sat in the same row: the wind
      fields ended up about 115px each, too narrow to read their own "Same as
      weekend" placeholder. Weather now sits in a panel of its own above the
      rest, which also stops a three-slot plan reading as part of the fields
      under it, and the six single values share a three-column grid where every
      one of them is the same width. The slot table lost its "Weather" column
      heading with it - the panel is already headed that, and the two stacked
      read as a mistake
- [x] **Your name is a setting, not a race field.** It was in the car card of the
      race screen, where it read as a property of the car and had to be retyped
      for every race. It belongs to the person playing, so it moved to
      `Settings.driverName` and `race-store` writes it into each launch, the
      same way `withWeatherSystem` fills the controller in - and, the same way,
      a race file naming its own driver keeps it, which is what lets a spike
      race under a name of its own
- [x] **Weather changes belong to a session, not to the weekend** - the weekend
      defaults offer static weather only. A plan there would be inherited by
      every session, so practice, qualifying and the race would each run the
      same rain arriving at the same minute, which is not weather.
      **It also exposed a real bug in the merge**: `weatherSteps` was not part
      of the weather group in `src/shared/utils/conditions/`, so a session
      choosing a steady weather kept the weekend's plan beside it - and
      `isDynamic` would then have installed a plan for a session that asked for
      one weather. The group exists precisely to stop two answers to the weather
      question surviving together, and it was missing its newest member
- [x] **Assists reach Content Manager, and arrive.**
      `buildRaceUri` could always send an `assistsData` parameter and had never
      been given one, because `acmanager://race/config` wants CM's own
      serialization rather than the `assists.ini` `buildAssistsIni` renders.
      **That format was read off a saved Quick Drive `.cmpreset` on this
      machine**: `AssistsData` is a JSON *string* whose contents are themselves
      JSON, the same double-serialized convention its sibling
      `TrackPropertiesData` uses, and both deserialize into CM's own
      `Game.AssistsProperties` - so the parameter takes the inner object rather
      than the whole preset. **Two of their key names are traps and neither is
      guessable**: slipstream is spelt `SlipSteam`, one `s` short, and fuel rate
      is `FuelConsumption`. `assistsPresetJson` writes them, `resolveAssists`
      is the one place a default lives so the JSON and the INI can never
      disagree, and every launch sends it - omitting it would leave CM applying
      whatever its own Quick Drive last held, which is a wrong answer that
      reports nothing.
      **Aids belong to the player and regulations to the race**, the same split
      `driverName` already makes: ideal line, auto blip, auto brake, auto
      shifter, auto clutch, ABS, traction control, stability control, tyre
      blankets and visual damage are `Settings.drivingAids`; damage, fuel rate,
      tyre wear and slipstream sit on the race, where Phase 4's series will set
      them. A race naming a field wins, field by field - which is why the merge
      drops explicitly-undefined keys first, since the race screen writes
      `undefined` for every box the user has emptied and a bare spread would
      turn a setting off rather than defer to it.
      **That CM reads it is now measured**, and it cost no driving:
      `races/spikes/assists.json` was run with `--enable-race-ini-test-mode`
      on, and **CM writes `cfg/assists.ini` in the same preparation pass that
      writes `cfg/race.ini`** - so the answer was on disk with nothing
      launched. All eight of the spike's non-default values came back exactly
      as asked, `SLIPSTREAM=3` and `FUEL_RATE=5` among them, which is what
      settles both the inner-blob reading and the two trap spellings at once:
      had `assistsData=` wanted a whole `.cmpreset`, or had either key been
      spelt the obvious way, those two lines would have held AC's defaults
- [x] **Road temperature is Kunos' own curve now** - found twice, in
      `content/weather/readme_weather.txt` where they state the equation and in
      `launcher/themes/default/js/ui.js`, where `calctemp` implements it. The
      old stand-in was `ambient + ambient * coeff * 0.5` and **took no account
      of the time of day at all**, which is most of what the curve is for.
      **Two things came out of transcribing it that reading it did not show.**
      Kunos guard the coefficient with `if (!COEFF) COEFF = 1`, so a preset
      declaring zero and a race naming no preset both warm the road rather than
      leaving it at ambient - a real behavioural change, and the reason the
      weather-plan spikes moved from ROAD=20 to ROAD=28. And **their formula is
      only defined across the 08:00 to 18:00 slider their launcher offered**:
      run out to midnight, which our clock allows, and it returns **214C**. So
      what is implemented is CSP's restatement from
      `extension/internal/lua-shared/sim/weather.lua`, which is the same curve
      algebraically - checked hour by hour, identical to four decimals from
      07:00 to 18:00 - plus the phase cap and evening fade that keep it bounded.
      Adopting the guards is a departure from "Kunos raw", and it was made on
      the 214C rather than on taste.
      Verified as a diff: every `races/*.json` and `races/spikes/*.json` comes
      out of `npm run dry` byte-identical except `[TEMPERATURE] ROAD`, and
      `demo` is identical outright because it names a road temperature of its
      own. **What is still to measure is CM's own answer** - see the runbook row
- [x] **Content Manager's `Arguments.txt` is written, from two places on
      purpose.** The settings screen has a switch for `--skip-all-results` and
      `--hide-race-cancel-button`, which are preferences a career wants;
      `--enable-race-ini-test-mode` is set by `npm run testmode -- on|off` and
      appears in no UI at all, because it stops CM launching anything and so is
      a debugging tool rather than a setting. `SettingsCmFlag` excludes it in
      the type rather than merely omitting it from a list, which is what lets
      the screen's translations drop its wording too.
      **The file is the state; nothing is mirrored into `settings.json`.** The
      user can edit it by hand, and the CLI writes it too, so a copy of ours
      would start lying the moment either happened; both IPC channels answer
      with a fresh read.
      **And no backup, unlike `src/core/weather-plan/`.** There, an install
      overwrites `LAST_USED` and a whole preset slot with values that cannot be
      reconstructed, so `rememberOnce` records them first. Here a flag's
      presence *is* the state, turning it off is a complete undo, and every
      other line is passed through untouched - so there is nothing to record and
      no file of ours to leave in someone else's folder. A file left holding
      nothing but blank lines is removed rather than left behind empty.
      **Driven against the real install**: the file did not exist, so
      create-from-nothing is the ordinary path; a file carrying the user's own
      two arguments came back byte-identical after a flag was added and removed;
      setting a flag that is already set does nothing rather than moving it to
      the end; and a flag outside `CM_FLAGS` is refused in main before anything
      is written, so a renderer bug cannot append an arbitrary line to Content
      Manager's startup arguments

### Spike runbook

The harness is built and the probes are ready to drive. The six that are done
use base content - `bmw_m3_e30_gra` at `magione` - with no weather controller,
so nothing PURE does can explain away a surprise. The two weather-plan probes
are the exception and necessarily name one. `npm run results` reads a
result file back without interpreting it: it prints what AC wrote, and prints
**both** readings of `raceResult` side by side so a real finishing order can
pick one. Default is the newest archive; `--live` reads AC's own
`race_out.json` before anything overwrites it, and `--list` shows the archives.

| Probe | Run | Record |
| --- | --- | --- |
| ~~Starting position~~ | ~~`npm run race -- spikes/grid`~~ | **Done** - one-based, and AI follow `[CAR_n]` order with the player inserted. See the ticked item above |
| ~~Repeated sessions~~ | ~~`npm run race -- spikes/sprint-feature`~~ | **Done** - the launch ends at its first race. At most one race per launch, last in it |
| ~~Early exit~~ | ~~`npm run race -- spikes/weekend`, quit mid-race~~ | **Done** - the result is written either way, and quitting a race does not abort it: AC finishes it without you and classifies you on the laps you did |
| ~~Qualifying vs the grid~~ | ~~`npm run race -- spikes/qualifying`~~ | **Done** - qualifying sets the whole grid and `STARTING_POSITION` is disregarded. Qualifying carries no `raceResult` of its own |
| ~~Lapped car~~ | ~~`npm run race -- spikes/dnf`~~ | **Done** - the lapped car is present, the array stays full length, and it is placed last, which is what inference already said |
| ~~`raceResult`~~ | ~~Finish `spikes/grid` mid-pack, then `npm run results`~~ | **Done** - it is a finishing order, `raceResult[n]` being the car that finished `n`-th. See the ticked item above |
| ~~Solo qualifying~~ | ~~`npm run race -- spikes/solo-qualifying`~~ | **Done - a launch that is nothing but qualifying works, and one session per launch rests on it.** One session of type 2, all six cars classified, `raceResult` absent as it always is for qualifying, and the session ended on its own clock. **A cut lap is written as `time: -1` with `cuts: 1`**, which confirms rather than assumes the invariant `bestLapOrder()` depends on: the out-lap was invalidated and the clean 1:28.983 took pole. AC also writes `bestLaps` on a qualifying session, and sorting it gives the same order we derive from the raw laps |
| ~~Solo practice~~ | ~~`npm run race -- spikes/solo-practice`~~ | **Done - a practice-only launch is an ordinary thing.** One session of type 1, all six cars setting laps, `raceResult` absent, and the session ending on its own clock with the file written. It cannot be mistaken for a grid source either: `lastQualifying()` matches on type 2, so a practice launch records `qualifyingOrder: null` and a race behind it falls through to the seeded skill order |
| ~~PURE plan~~ | ~~`npm run weather -- plan pure evolve`, then `npm run race -- spikes/weather-plan`~~ | **Done - PURE follows a plan we generated.** Clear, heavy rain, clear, three minutes each, and `AUTOSTART` starts it with the race. Took two runs: `control.type` was first written as `1`, which is daycycle, and that ignores every step's duration and spread three steps over three eight-hour blocks. `2` is timed and honours them. **This is the result the whole approach rested on** - generated dynamic weather is expressible |
| ~~Sol plan~~ | ~~`npm run weather -- plan sol evolve`, then `npm run race -- spikes/weather-plan-sol`~~ | **Done - Sol Planner follows a plan we generated too.** It autoloads `[4]`, and writes the file back in its own ConfigParser formatting with `loadWithStart = 4` still set, which is proof the camelCase spelling is the one that works: the lowercase key sitting beside it was ignored as their source said it would be. Took two runs, for a reason worth remembering - **only one weather controller runs per race**, so the first attempt was driven against a file naming `pureCtrl` and Sol correctly reported "Sol 2.5 controller not running" while doing nothing. Each planner needs its own race file |
| ~~CM slot defers~~ | ~~`npm run weather -- plan pure defer`, then `npm run race -- spikes/weather-plan-defer`~~ | **Done, and the answer is no.** A race asking for Fog through `__CM_WEATHER_TYPE=20` alongside the dynamic `pureCtrl` still opened on scattered clouds. Their source says why: `pureCtrl/controller.lua` reads the race's type into `wid`, but only ever publishes it as `CM.initWeather.weatherID` inside `if __PURE__controller_type < 1` - the **static** branch. A plan only runs under the dynamic controller, so the slot the planner app reads is never written and it falls back. **A generated plan must state its own weather in every step.** No loss: the generator knows what the session asked for |
| Assists blob | `npm run race -- spikes/assists`, then read `cfg/assists.ini` | **Run, and it needed no driving.** CM's `AssistsData` is a JSON string inside a JSON string, read off a saved Quick Drive preset; whether `assistsData=` on the URI wanted that inner object or a whole `.cmpreset` was an inference from their file format rather than a measurement. **CM writes `cfg/assists.ini` in the same preparation pass that writes `cfg/race.ini`**, so with `--enable-race-ini-test-mode` on the answer landed on disk with nothing launched. All eight values the spike asks for came back exactly: `IDEAL_LINE=1`, `AUTO_SHIFTER=1`, `ABS=2`, `DAMAGE=0`, `FUEL_RATE=5`, `TYRE_WEAR=5`, `TYRE_BLANKETS=0`, `SLIPSTREAM=3`. The last two lines are the informative ones - they are what `SlipSteam` and `FuelConsumption` write, so a wrong spelling or a wrapped preset would have left AC's defaults there. **Keep the spike**: it is the regression test for a serialization we cannot see fail any other way |
| CM overrides the player's driver name | Same test-mode pass, with `[CAR_0] DRIVER_NAME` set to something distinctive | **Run.** The whole-file diff of our `race.ini` against the `cfg/race.ini` CM handed AC showed CM had replaced the player car's `DRIVER_NAME` with the name from its own profile. Re-run sending `Zoltan Quixbarrow` to rule out a placeholder being substituted - it came back as CM's name again. AI names in `[CAR_n]` pass through untouched, and CM's only other change to the file was adding the track geotag and timezone keys CSP needs. So `Settings.driverName` reaches the INI and stops there |
| Road temperature vs CM | `--enable-race-ini-test-mode`, one Quick Drive race at 14:00, 09:00 and 22:00 | **To drive.** Kunos' curve is transcribed from their own launcher and agrees with CSP's restatement to four decimals across 07:00 to 18:00, so 14:00 and 09:00 should simply match. **22:00 is the one that discriminates**: raw Kunos declines through the evening and runs away after midnight, while CSP caps the phase and fades it, which walks back over the afternoon peak and reads about 1.5C *warmer* at 20:00 than at 18:00. Neither is obviously right and CM is what we hand the INI to, so whatever CM writes is the answer to adopt. **What the assists pass already settled** is that this is a question of agreement rather than effect: CM handed AC our INI with `[TEMPERATURE] ROAD` untouched, so whatever we compute is what races - the diff only says whether we agree with CM's own Quick Drive |

**The results file cannot answer the grid probe** - only watching the race can.
This was tried on the `spikes/grid` capture and both proxies failed: lap-0
sector times are dominated by pace, not by the metre or so of grid spacing, and
subtracting each car's own best sector to isolate the standing-start penalty
just swaps one confound for another, since a car in traffic loses more than a
car in clean air. It produced an order in which the race winner started
seventh and the last-placed car started first. Grid slot has to be read off the
screen on the formation lap.

Answers land here, and the weekend model, bundler and grid reconstruction are
written against them.

### What the bundler now knows

Four rules, all of them measured rather than assumed:

1. **A launch holds any run of practice and qualifying, then at most one race,
   which ends it.** A second race is listed in the weekend structure and is
   unreachable, so a sprint plus a feature is two launches and every weekend
   splits after each race.
2. **Qualifying in the launch owns the grid.** `STARTING_POSITION` is
   disregarded whenever a qualifying session precedes the race.
3. **Without qualifying in the launch, the grid is entirely ours** - a
   one-based `STARTING_POSITION` for the player, `[CAR_n]` order for the AI.
4. **A launch either runs or it does not - it cannot half-run.** Whatever
   sessions started are written, and quitting a race only removes you from it
   rather than ending it, so there is no partial state to resume inside a
   launch. `number_of_sessions` holds the configured count against `sessions`
   for what ran, which spots a session that never *started* but not one that was
   abandoned partway; `event` is useless for telling sessions apart.

**What one-session-per-launch did to these rules, now that it is built.** Rule 1
is moot: no launch holds a run of anything, so there is nothing to bundle and
nothing to split. Rule 2 can never fire, because qualifying and a race are never
in the same launch - which means **rule 3 is the only case there is, and the
grid is unconditionally ours**. Rule 4 stands unchanged and is what makes the
state machine small.

The measurements themselves keep their value: they are why we know the grid can
be written at all, and rule 2 is why a bundled qualifying could never have been
overridden. A series wanting a grid that is *not* the qualifying order - a
reverse-grid sprint, or a fixed grid - simply gets one, with no special case.

The `LAPS` versus `RACE_LAPS` question stays dissolved: one race per launch
means the two keys always carry the same number.

### Running an event

`npm run event -- <name>` runs the next launch that has not been run, waits
for it, archives the result and remembers what it produced, so the launch after
it inherits the grid. `--status` prints the plan without launching anything and
`--reset` forgets the progress. Progress lives in `data/events/`, which is the
CLI's own business: the state machine itself is pure, and Phase 6's career store
will persist the same value its own way.

A weekend is an ordinary race definition whose `sessions` cover the whole event,
so everything that already worked on a race - `npm run dry`, validation against
installed content, the spike files - keeps working unchanged.

**One session, one launch**, so `--status` lists the weekend's sessions and each
run of the command plays exactly one of them. The state machine, the grid
reconstruction and the archive-per-launch shape came through the change
untouched, since none of them ever depended on a launch holding more than one
session; archives are now named after the session rather than the launch number.

**The app runs the same reducer over its own storage.** `src/main/race-store/`
keeps the draft, the progress and the archives under
`%APPDATA%/ac-career-mode/race/`, deliberately apart from the CLI's `out/`,
`data/results/` and `data/events/`: the state machine is pure, and each caller
persists it its own way. Editing a weekend that has already started discards its
progress, because a launch inherits its grid from the one before and that
inheritance means nothing once the sessions have changed underneath it - so the
setup screen locks itself once a launch has run and offers to start again.

## Phase 4 - Series, teams and the editor

**The series backbone has landed.** A championship is a type, a shipped library,
a validator, an availability report and a lowering into an ordinary
`RaceDefinition` - so a round is picked from a screen and runs through the whole
Phase 3 path with no series-aware code anywhere in `src/core/weekend`,
`src/core/race-ini` or `src/main/race-store`. Four exemplars ship, chosen to
prove different axes rather than to fill a ladder.

**A championship is now a document the app can write, not only read.** The
library gained its disk half - customise, revert, duplicate, delete, import and
export - and the validation problems `seriesAvailability` had been computing
since the beginning finally reach the screen. Two things learned building it are
worth carrying into the editor. **A file's name and the id inside it are allowed
to disagree**, because `readSeriesDir` keys on the id, so every delete and every
overwrite goes through `LoadedSeries.file` and only a *new* file's name is
derived from the id. And **an id that cannot safely be a file name is refused
rather than repaired**: the id is what the library keys on, what `forkedFrom`
points at and what a career will file results under, so quietly rewriting it
would leave the file and the document disagreeing about which championship this
is.

**The document is now finished.** Teams and seats replaced the entrant count -
a format change carried by a migration at the time, and since reverted to the
one revision this build reads; prize money and entry fees are checked and shown;
and per-round conditions turned out to have landed with the round schema. That was done before the editor rather
than after it on purpose - building the editor's screens against a shape about
to gain a seat list is the mistake Phase 2 avoided when it landed the content
data layer before the browsers.

**And the editor is now built**, in three stages: the document's own details,
rules and AI field; then teams, classes, seats, liveries, balance of performance
and the calendar; then weekend formats with their session lists, points systems
and prize tables. **Anonymous mods can now be let back into the library** from
settings, which is the precondition for classifying them - **and classifying them
has now landed too**: a user layer over the class catalogue, Classify on a car's
page, and a Classes tab for classes and specs of the user's own. **Generated
weather has landed with its forecast and a weather-aware track**, along with a
setting for which weather the sim may use at all. **The championship
configuration page and content source toggles have landed**, as one
Championships tab in settings. What is still open in this phase is the rest of
the shipped library - **a championship for every car the catalogue names**, see
*The championship catalogue* below - and the install links that wait on the
catalogue.

- [x] Series schema: discipline, rounds, weekend format, regulations, points,
      BoP - the tier sits on the class entry below, not here.
      `src/shared/types/series.ts`, and four decisions worth recording.
      **A weekend format was `SessionDefinition[]` and nothing more**, on the
      grounds that the type already carries the day offset, the length and its
      own conditions - and that was wrong as soon as a championship needed two
      of them. It is now a named `WeekendFormat` in `weekendFormats`, with
      `defaultWeekendFormat` naming the one a round gets and `Round.weekendFormat`
      picking another; `Round.format` is gone, since a one-off format is just an
      entry only one round references. Format version 2. **`Regulations` is
      nested rather than flat**, because `fixedSetup`, `penalties`, `jumpStartPenalty` and
      `allowedTyresOut` live on `RaceDefinition` rather than on `Assists`: a flat
      shape could not have been a `Pick` of anything and would have needed a
      hand-written list of assist keys to separate them again. `RegulationKey`
      moved here out of the race screen, where it had been living. **`version` is
      on the championship from the first shipped file**, since a series is a
      document users will fork, export and import, and one with no format version
      is a migration that cannot be written - even though the migration itself
      waits for Phase 14 and the number stays at 1 until then. **Points are carried and not
      applied** - Phase 5 owns scoring, but a series file is shareable from the
      moment it ships, so adding the field later would invalidate every file
      authored before then. Scoring is a named list too: `pointsSystems` with
      `defaultPointsSystem`, and a race session naming one through
      `SeriesSession.pointsSystem`, the same shape the weekend formats take.
      **`drops` was moved onto the championship and has since been dropped
      altogether** - how many results a season throws away is a standings rule
      rather than a way of scoring a race, which is why it never belonged on a
      points system; it turned out not to be wanted at all, and a field carried
      but never applied is worse than no field. Removed alongside `notes`
      becoming `description`, both at version 1 rather than as a fourth revision
- [x] **Weekend formats** with day offsets and day-of-week rules - validation
      over `day` rather than new data. Days start at 0, run contiguously, never
      go backwards down the list and span at most three; a race may not sit on
      day 0 of a three-day format, which is "races fall on Saturday or Sunday and
      never Friday" as far as it can be said before Phase 5 gives a round a date.
      One rule only validation would ever have caught: **a session may not author
      its own `startingPosition`**, because `prepareLaunch` writes the grid from
      qualifying or from the ladder and an authored one is overwritten with
      nothing said
- [x] **Several formats per championship**, because real ones have several: this
      year's Formula 1 runs a regular weekend and a sprint weekend, and GT World
      Challenge's sprint rounds carry two qualifyings and two races. A format is
      named, so a calendar row can say which of them it runs. **The sessions of a
      sprint weekend interleave** - qualifying 1, race 1, qualifying 2, race 2 -
      because a race inherits the last qualifying run before it, so pairing the
      two qualifyings at the front would give both races the same grid. GT3
      Sprint Series ships one and runs it at two rounds. **A race session names
      its own points system**, which is the other half of why a sprint weekend is
      a separate format at all; nothing reads it until Phase 5, but a shipped
      sprint format that cannot say what its sprint pays is not the format. A
      reference rather than a table written out at the session, so the sprint of
      every sprint weekend pays one scale instead of several copies that drift
- [x] **Knockout qualifying**, and with it the relations a format could not
      express. One field says both: `SessionDefinition.inherit` is
      `{ from, top }`, where `top` restricts the field and the chain always
      orders it - so `{ from: 'q1', top: 15 }` is "the fastest fifteen of Q1 run
      this one" and `{ from: 'q3' }` is "the grid comes from Q3, and from Q2 and
      Q1 behind it". A race simply never sets `top`, which is why one concept
      covers what reads as two rules. **It had to be stated rather than
      inferred**: an F1 sprint weekend runs two independent chains, SQ1 to SQ3
      into the sprint and Q1 to Q3 into the grand prix, and "the last qualifying
      before this race" only happens to be right while sessions interleave. The
      old rule survives as the fallback for a format that names no link, which
      is what keeps every weekend authored before this working - the GT3 sprint
      format was given explicit links and composes exactly the grid the
      positional rule did, checked rather than assumed. The links live on
      `SessionDefinition` rather than on `SeriesSession`, so `src/core/weekend/`
      implements them without learning what a series is and a hand-authored
      `races/spikes/knockout-qualifying.json` can use them
- [x] **A segment the player is eliminated from is simulated.** Assetto Corsa
      has no session without them, so it cannot be launched: the advancing field
      is re-ordered off its previous segment with seeded jitter and recorded as
      `skipped`, and the weekend skips forward to the next launch the player is
      in. Position rather than AI skill is the rating, because the segment
      before it was actually driven and its order already carries what those
      cars did on the day. The one invented classification in the project, and
      said to be - the CLI prints those launches as simulated and the race
      screen badges them
- [x] **Refuse to edit a championship, a weekend format or a session while a
      weekend of it is in progress**, with text saying the weekend has to be
      finished first. It landed in the editor rather than in settings, which is
      where this item guessed it would live, and it is gated in both halves:
      `series-store` throws `series.weekendInProgress` on every write, and the
      editor reads `SeriesWeekendState` off the listing, disables every control
      on the page and heads it with `EditorLockNotice`. The document is locked
      **whole** rather than section by section, because a launch inherits its
      grid from the one before it and everything the editor can change - the
      entry list, the balance of performance, a round's track, a format's
      sessions - decides what that grid holds
- [x] **Teams and seats** - a class entry's `entrants` count became its seat
      list, which is the format version bump the count was always a placeholder
      for. A **seat** is one place on the grid for a whole season, carrying a
      team, a driver with a nationality, an optional car and livery, and an
      optional AI level of its own; a **team** sits on the championship rather
      than on a class entry, because a team fields cars in more than one class
      of a multi-class series and would otherwise be two teams sharing a name.
      It was a format version bump with a migration behind it at the time, and
      **both the bump and the migration have since been reverted**: every
      persisted format sits at version 1 until the app is released, because the
      only files in existence are the author's own and deleting an out-of-date
      one is cheaper than a step that reads it. See *No schema migrations before
      the first release* in CLAUDE.md. The `version` field stays on the
      championship - a document that cannot say what shape it is in is one no
      later migration could read - and Phase 14 is when it starts earning that.
      **The player takes the last seat of the class they enter**, which is the
      smallest thing that could replace `entrants - 1` and keeps a
      championship's named front-runners rather than its tail-ender.
      **Almost everything on a seat is optional**, so a championship with
      nothing to say about who is racing lists seats with ids and the grid is
      filled with generated names exactly as before.
      All four shipped championships now carry an entry list: Formula 1 2023 the
      real ten teams and twenty drivers of that season, and the other three
      plausible invented fields, since those series' real entry lists do not
      exist. **No shipped seat names a car or a livery**, and that is a rule
      rather than an omission - see the editor item below
- [x] Eligibility: a **spec**, or an **explicit list of cars** - never a class, so
      an era cannot leak onto a grid it does not belong on. The car list is what
      makes one-make championships work without a class per model, and it is needed
      for one-offs and invitationals anyway.
      **The two are satisfied differently, and that asymmetry is the whole of the
      availability rule**: an explicit car list is a requirement and every car in
      it must be installed, because a one-make series' cars *are* the series and a
      missing one changes what you are racing; a spec is satisfied by whichever of
      its grid you own, because demanding all fourteen GT3 cars would make every
      spec-based series unavailable to everybody. A spec carries a `minModels`
      floor so that owning one car of it reads as unavailable rather than as a
      grid of clones
- [x] **Per-round eligibility override.** The championship declares eligibility
      once; a round may override it, because some fields change car with the track.
      IndyCar is the case that forces it - road, short-oval and superspeedway kits
      are separate car folders and separate specs, yet one championship with one
      entry list and one standings table. Group C's 962C longtail at Le Mans and
      Monza, and URD's sprint versus endurance EGT cars, are the same shape. The
      entry list and standings stay at series level; only the car resolves per round.
      **Built - schema, validation and lowering all honour it - and deliberately
      used by nothing we ship.** Every real case is DLC or mod content: the
      IndyCar kits, the 962C longtail, URD's sprint against endurance EGT cars.
      Inventing a base-content one would be tidiness over truth, which is the
      mistake the class catalogue audit already had to undo once. Its first
      shipped user is the Group C championship, when DLC championships land.
      **Now has a user interface**: a round's Cars dialog carries a toggle per
      class entry, seeded from that class's own rule rather than from nothing -
      a round that swaps cars usually swaps a few of them - and turning it off
      drops the override rather than leaving an empty block behind. Narrowing
      one clears up after itself: a seat pinned to a car the class can no longer
      field is unpinned and a balance-of-performance row balancing it is
      dropped, because validateSeries reports both and neither is visible from
      where the change was made. Driven through the app against a two-class
      championship, saved, and read back off disk
- [x] **Multi-class entries** - one championship, one calendar, and one *class
      entry* per class it runs, each carrying its own tier, its own eligibility
      and its own standings table. WEC is the case: Hypercar, LMP2 and LMGT3
      entered separately, the GT3 entry a tier below the prototypes. A different
      axis from the per-round override above - that varies the car across the
      calendar, this varies it across the grid.
      **Base content cannot express WEC's own shape**, which is worth stating
      rather than working around: vanilla Assetto Corsa ships no prototype class,
      so the Hypercar-over-LMGT3 example the ladder is described with is not
      buildable base-only. Lotus Cup is - a real multi-class one-make
      championship, every car base - and it exercises the same three things: two
      class entries on one shared grid, a tier per class entry, and balance of
      performance applied to the AI and the player alike.
      One simplification is in the code rather than hidden: **AI strength is
      stated per class, not across the field**. One ramp over a multi-class grid
      would make the slower class's drivers weak as well as their cars, which is
      not what a class difference is. (The linear ramp down each class's seat
      list has since gone too - see the persistent AI field in Phase 5.)
- [x] **Class and spec management UI**: create classes and specs, classify mods the
      shipped catalogue does not name, and override what we ship. The shipped
      catalogue is the base layer; the user layer is resolved over it at runtime.
      **Landed as the Classes tab of Settings** - `/settings/classes`, beside
      Your content - over a user layer in `%APPDATA%/ac-career-mode/car-classes.json`
      that `src/main/class-store/` owns. Four things worth knowing.
      **The catalogue is now a value rather than module state**:
      `resolveCatalogue(layer)` builds a `ClassCatalogue`, every lookup is handed
      one, and main and the renderer each resolve the same layer with the same
      function - main pushes the layer, never the maps. `SHIPPED_CATALOGUE` is the
      default only at the entry points the CLI calls, so `npm run dry` and
      `npm run series` still see the shipped half alone and came out
      byte-identical. **The enums stay**: `CarSpec.GT3_2010S` in a shipped
      championship is still a compile error when renamed, and `Eligibility.spec`
      simply widened to a `SpecId` string. **So a spec stopped being a closed
      set**: `parseSeries` checks only its shape, and `validateSeries` reports
      `series.spec.unknown` against the catalogue it is handed - which also
      fixed a latent crash, since a bogus spec on a *round* override was never
      parsed at all and indexed `SPEC_CARS` to undefined. **Overrides are car
      assignments only**: the app's own classes and specs cannot be renamed or
      deleted, because shipped championships name them. A user class or spec
      gets a UUID, since a slug could collide with one we ship later; deleting a
      spec is refused while a championship races in it, and a class while it
      holds specs. One consequence accepted rather than guarded: restating a
      shipped car can empty a shipped spec, and the championship on it then
      reads as unavailable, which is the truth. A championship naming a spec of
      the user's does not travel to another machine - it arrives reporting the
      spec as unknown. A file that is not JSON is quarantined as settings.json is.
      Driven end to end on a scratch profile: a class and a spec made, a car put
      in it, a championship pointed at it, the delete refused naming that
      championship, a move that would clash refused, both deleted again, and a
      corrupt file moved aside at startup
- [x] **Adding or editing a car picks classes first, then specs.** A car holds a
      list of specs, so the spec options are **filtered by the classes chosen for
      that car** - you cannot reach a GT3 spec from a car you have put in GT4 and
      Track Special. Within one class only a single spec may be picked, since two
      would claim the car is two eras of that category at once.
      **Landed as Classify on the car's own page**: a dialog whose first step is
      a toggle per class and whose second is one select per chosen class, which
      is what makes two specs of a class unpickable rather than refused. A class
      with a single spec has it chosen at once. The car's list replaces the
      shipped one outright; picking no class leaves it deliberately
      unclassified, and a list that matches what we ship drops the override, so
      Revert only appears where it would change something. **The spec chips are
      coloured by whose classification it is** rather than by spec, since specs
      are an open set: neutral as shipped, Modified where the user restated a car
      we classify, Custom where only they do - the origin hues a championship
      already wears, moved into `ORIGIN_ACCENT`. Driven: adding DTM 2025 (LFM) to
      the Audi R8 LMS's GT3 spec put it in that spec's filter and facet count in
      main at once, the header chips turned Modified, and Revert put it back
- [x] **Add your own content to the library**, in settings. The browsers and
      pickers show what the provenance catalogue names; anything in no record is
      an anonymous mod and is left out, so this page is the way back in. It lists
      exactly those entries - the same browser shell with a toggle per card
      rather than a screen of its own - and stores what the user ticked as a list
      of folder IDs in `settings.json`, resolved over the catalogue at runtime
      rather than baked into the content cache, so adding one never means a
      rescan. It **widens `isCatalogued` rather than replacing it**: the
      predicate becomes "catalogued, or one the user named", and the six store
      methods behind it do not change. Adding a track adds every layout of it,
      since recognition is per layout and a part-catalogued circuit is what LFM's
      layouts inside a folder nobody claims produce.
      **Landed as the Your content tab of Settings** - `/settings/content`,
      beside General - and linked from the diagnostics card's hidden count.
      **A bulk "add everything matching" was built and taken back out**: one card
      at a time is the intended way in, since what goes into the library is a
      choice made per mod. **Only an anonymous circuit is ever added here, never
      a layout on its own**: source, pack and maker are keyed by the circuit's
      folder, so a mod that drops an extra layout into a circuit the catalogue
      names is already in the library under that circuit's provenance - nothing
      hides it, which also means nothing badges it as a mod. Four things worth
      knowing. **`isCatalogued` moved to `src/shared/utils/library/`**, beside
      `isInLibrary` and `isUserAdded`, because the renderer needs the same answer
      to badge what the user added - `content-catalogue` re-exports it, so
      nothing that asked it before had to change. **The page browses a second
      collection rather than a filter**: `anonymous: true` on `CarQuery` or
      `TrackQuery` makes the content store answer over every uncatalogued entry,
      added or not, so a switch turned on stays on the page to be turned off
      again; content-query never sees the flag. **The store is told the list
      rather than reading settings**: `ContentStore.include()` is called at
      startup and on every settings change, and deliberately pushes nothing,
      since the screens that browse the library are not the one editing it. And
      **an added mod says so everywhere**: `ProvenanceBadges` takes the entry's
      folder ID and swaps the Mod chip for Custom, in the custom-origin hue that
      already means "yours" on a championship - everywhere but the tab itself,
      where the switch already says it. Driven end to end: switching two cars on
      put them in the Cars library wearing the chip, and adding circuits took
      the diagnostics hidden count down by their layouts.
      **It found a race in settings while being driven**: main pushes
      `settings:changed` on every patch as well as answering it, so two switches
      flipped in quick succession could have the first answer put the second
      back, and a third built on top of that lose it for good. The provider now
      ignores what main says while a patch of its own is in flight, and adopts
      the answer to the last one
- [x] Prize money tables (per finishing position, per final standing) - the
      schema and the shipped figures were already there; what was missing is
      that nothing checked or showed them. `parseSeries` reads both tables as
      numbers, `validateSeries` refuses a negative one, and the championship
      page has a Money card. **Bounded from below only**: what a series is worth
      is the author's business, and a table that does not descend is a series
      paying a flat rate rather than a mistake
- [x] Entry fees per round - the same, for `Championship.entryFee` and the
      `Round.entryFee` that overrides it. A round only badges its fee when it
      states one, since the same figure down every row of a calendar says
      nothing. **A fee of zero is not an absent fee**, so Formula 1 reads "Free
      to enter" rather than showing nothing
- [x] **Availability against installed content** - what a championship is missing,
      named down to the DLC pack or the mod. Missing anything blocks entry rather
      than adapting silently: the round's own button is disabled rather than the
      field quietly shrinking, because two users' "same" championship differing is
      how results stop comparing.
      **A round's pit boxes are checked here rather than left to fail at launch.**
      `buildGrid` throws `race.grid.exceedsPitboxes`, which is the right answer at
      the wrong moment - a 24-car series at an 18-box circuit is a fact about the
      calendar, so it is reported beside the round.
      **`acmanager://install` is not offered**, and the catalogue change that
      looked like the way to it turned out to be the wrong question - see the
      content manifest item below, which is where the link ended up instead
- [x] **Series editor UI**: cars, tracks, calendar, rules, teams, money - the
      content pickers are Phase 2's browser shell with selection added, not new
      screens; see *Where the browsers end up*.
      The pickers cost nothing in the end: `CarQuery` gained an `ids` filter and
      `CarBrowserBody` a `baseQuery`, so a picker restricted to an arbitrary set
      of cars is what the round-entry dialog uses - three cars out of six
      hundred, with the search, facets and paging intact.
      One trap to carry forward: `isOneOf` treats an empty array as no filter at
      all, so `ids: []` offers the whole library. Never send one.
      **Every list in it is one pattern**, arrived at after the first pass of
      dialogs proved too many clicks for the thing done most - filling in a
      calendar. A row reads as text until it is clicked, then becomes its own
      form in place with Confirm and Cancel; `ListRow`, `RowForm` and
      `ConfirmActions` are that shape, `useRowEdit` holds which single row is
      open **for the whole page** - so opening one quietens every other list,
      a class's seats included - and `useRowDrag` is the mouse affordance for
      reordering, with the chevrons kept as the keyboard one. Nothing reaches
      the draft until Confirm and nothing reaches disk until Save.
      A container gets a panel instead: `PanelRow` is a tinted heading with the
      list's contents below it, which is how a class entry holds its cars,
      performance and seats, and how a weekend format holds its sessions.
      **Two things the editor repairs rather than reports.** Removing a weekend
      format re-points `defaultWeekendFormat` and drops the rounds' references
      to it; removing a points system does the same for `defaultPointsSystem`
      and the races that paid it. validateSeries would report both, but the row
      that explained the reference is the row that has just been removed.
      **A session link is minted where it is made**: `inherit.from` names a
      session by id and a session only carries one when something names it, so
      the form offers earlier qualifyings by *position* and `withSession` gives
      the source an id at the moment the link is committed
- [x] **Assign a livery per driver in the editor.** `Seat.car` carries a model
      and a skin from the day seats landed, and no shipped championship sets
      either - a shipped file cannot know which liveries a user's copy of a mod
      installs, so pinning one would resolve to nothing on half the libraries
      that have the car. The editor is where a user who owns the real Formula 1
      liveries puts each driver in theirs, against the skin browser Phase 2
      built. The lowering already honours it, and already falls back to
      automatic assignment when the named skin is not installed.
      **Landed**, and the whole two-step picker came for free: a seat's Car and
      livery button opens the car picker restricted to what the class may field,
      the livery step follows, and Clear unpins. Driven end to end - pinning
      `kunos_racing_41` to one seat of the Lotus Cup put that driver in the
      grid wearing it while the other 2-Eleven was assigned a livery
      automatically, and pointing the same seat at a livery that is not
      installed dropped the SKIN key rather than writing one AC could not
      resolve. The empty-`ids` trap is guarded by disabling the button: a class
      that names no cars would otherwise open a picker onto the whole library
- [x] **Customise should open the editor, not just write a copy.** Found already
      done when Phase 4 was next picked up: the menu's Edit item on a shipped
      championship confirms, takes the copy through `series:customise` and
      navigates to `/championships/:id/edit`, so the item had simply never been
      ticked. What it said at the time follows. Today it
      writes the shipped championship into the user's folder and lands them on
      the championship page, which is half an answer: taking a copy is the
      *precondition* for editing one, not a thing anyone wants on its own, and
      with no editor behind it the action reads as doing nothing. Once the
      editor exists, Customise should copy and then open that page **in edit
      mode** - switching into it in place when the user is already there. The
      write half is built and is exactly what the editor's save will call, so
      this is a navigation change rather than a new command
- [x] **Per-session conditions** - landed early with one session per launch, in
      Phase 3. A session is a whole `race.ini`, so it carries its own weather,
      wind, temperature, track state and start time, overriding the weekend's
      defaults field by field
- [x] Per-round conditions - the round owning the conditions rather than the
      weekend. Landed with the round schema rather than as work of its own:
      `Round.conditions` is lowered into `RaceDefinition.conditions`, which is
      the weekend's defaults, and a session still overrides it field by field
      through `src/shared/utils/conditions/`. The calendar badges a round that
      carries its own
- [x] **Generated weather for shipped championships.** Hand-authored weekends use
      weekend defaults plus per-session overrides, which is what keeps building a
      deliberate weekend easy. The championships we ship do the opposite: they
      generate a weather per session and write it as a full override on each.
      **Generated by our own rules and probabilities, not by PURE's or Sol's own
      randomisation**, which produces too many extremes for a career - a series
      wants a wet round now and again, not a tornado.
      **Landed as an opt-in on any championship**, not only the shipped four:
      `Championship.generatedWeather` names a default `Climate` - arid,
      Mediterranean, temperate, oceanic - and `Round.climate` overrides it. The
      editor has the toggle and both selects, and all four shipped championships
      turn it on, with Spa and Silverstone oceanic and the Red Bull Ring,
      the Nurburgring and Zandvoort temperate. `src/core/weather-forecast/` is the
      generator, and what it does in order matters. **The climate draws first**:
      a weekend's temperature and wind, each day wet or dry off a two-state chain
      whose long-run share is the climate's own, then each session - carrying on
      from the one before it on the same day more often than not, and on a wet
      day sometimes changing mid-session. **Then it is swapped for what can be
      raced**: the offer is the installed presets, less what the user switched
      off, less wet weather when RainFX is off, less PURE's two unnumbered types,
      and a type not in it becomes the nearest one that is - wet stays wet.
      **Then it collapses** to its opening stretch when the weather system has no
      planner. The draws never depend on the last two steps, so switching
      drizzle off swaps drizzle out rather than re-rolling the season.
      **What a round or a session authors still wins**, a group at a time -
      weather, air temperature, wind - and `roundRace` writes the rest onto the
      sessions, where a dynamic one states rain, temperature and wind in every
      step because a planner reads nothing from race.ini and Sol's step rain
      defaults to none. **Seeded on the round first**: `seedFrom` is a running
      hash, so round ids differing in their last character seeded within a hair
      of each other and every such round came out wet together; putting the
      varying ids first and discarding four draws spreads them.
      **A new setting came with it**: Weather in the sim, one grouped multi-select in the Weather card - a switch per type was built first and took up most of the settings screen -
      racing weather on and the extremes off. It governs generation and the race
      screen's weather menu alike, through one shared `offerableTypes`, while a
      hand-written race file may still name anything - and race.ini still fails
      loudly on a type nothing installed declares, since substitution is
      generation's alone. **A latent gap closed on the way**: a plan run under
      plain CSP used to reach race.ini naming no weather at all, and now names its
      opening step. Nothing in the AC install is written by any of it
- [x] **A weather forecast.** The whole event's weather is generated once, when
      the calendar first reaches the event's opening day, and shown to the player
      before they run anything. That is what makes generated weather a feature
      rather than a surprise, and it constrains the generator: it has to be
      deterministic and stored on the event, not rolled per launch, or the
      forecast and the race would disagree.
      **Landed derived rather than stored**, since there is no calendar or career
      to store it on yet: generation is a pure function of the championship, the
      round and the offer, so `series:forecast` and `roundRace` are the same draw
      by construction. Shown in three places - a strip of icons and temperatures
      under every calendar row, the whole weekend in words in the Enter round
      dialog, and a Forecast marker on every race-screen session still running
      what it was given, which disappears when the session is edited or the
      offer moves. **What is left for Phases 5 and 6** is exactly the stored
      half: the forecast pinned on the career event when the calendar reaches
      it, with a career's own salt in the seed so two careers do not share a
      season's weather. Until then a settings change after a round is set up
      changes the forecast but not the race already written, which the race
      screen shows by dropping the marker
- [x] **Make track grip weather-aware**, alongside the above - and **now
      reachable**, because per-session conditions were the thing it waited on.
      `gripAfter()` in
      `src/core/weekend/` adds a flat `GRIP_GAIN_PER_SESSION` for every session
      already run, which only holds while a weekend has one weather throughout.
      A dry, wet, dry weekend breaks it in the obvious direction: the wet
      session scrubs the rubber off, so the Sunday race should start on a
      *greener* track than Saturday left, not a faster one. It lands here rather
      than in Phase 3 because a session cannot carry its own weather until this
      phase gives it one - the day the format becomes expressible is the day the
      model becomes wrong. A wet session needs to subtract rather than add, and
      the result wants either the same "approximation, clearly labelled"
      honesty it has now or a spike to measure what AC actually does to grip
      across a wet session.
      **Landed as the labelled approximation.** A session still rubbers the
      track in, then gives back a share of what the weekend laid down - never
      what the track started with - scaled by how hard it rained against
      `RAIN_FOR_FULL_WASH`, the career preset's own Rain. Rain is weighted by
      how long each stretch of a plan lasted rather than taken at its peak, so a
      sprinkle at the end of an hour's dry practice does not wash the hour away.
      On a green track, dry-dry starts the next session at 86, dry-rain at 80 and
      dry-light-rain at 83. An all-dry weekend comes out exactly as before, so
      `npm run dry` is byte-identical. Still unmeasured, and a plan run under
      plain CSP races only its opening stretch while grip weighs every stretch
- [x] **The library is the app's own championships and the user's, as one list.**
      The two halves are stored differently on purpose: shipped ones stay
      TypeScript constants, so a renamed `CarSpec` is a compile error, and a
      user's is JSON under `%APPDATA%/ac-career-mode/series/`, because those are
      written outside the build. `parseSeries` is what does for a user's file
      what the compiler does for a shipped one - every spec, discipline, session
      type and weather type checked against its own catalogue at load. Both come
      out as the same `Championship`, and everything above the library is blind
      to which was which except for the `SeriesOrigin` that says so. **The
      alternative was shipping JSON too**, which reads better - one document
      format, dogfooded - and was built and then reverted: it cost the compile
      check on the four championships most likely to be edited, and bought only
      the dogfooding, since `writeSeries` round-trips a constant to a file and
      back and a test pins that
- [x] **A user file carrying a shipped id replaces it**, and reads as
      `adjusted`. The override is the file's existence and nothing else, which
      is what makes reverting a deletion
- [x] **Revert an adjusted championship to the app's own** - delete the user's
      file and the shipped one is simply there again. Landed with Customise, the
      action that creates the copy: `Customise` writes a shipped championship
      into `%APPDATA%/ac-career-mode/series/` under **its own id**, so the
      library's existing override rule turns it into `adjusted` and reverting is
      nothing but deleting that file. That is also the roadmap's "copy, disable
      the original" in full - the user's file *is* the disable - so no
      disabled-series list was needed anywhere, and `SeriesOrigin: 'adjusted'`
      stopped being a state only a hand-edit could reach
- [x] **Say when a championship could not be read.** `series:list` answers with
      an envelope rather than a bare list, so a file that failed to parse
      travels beside the ones that loaded and the championships screen names it
      - an empty list and a directory of broken files looked identical before
- [x] **Say on the card when a championship is misconfigured.** The card's
      badge went from two states to three - `Misconfigured` beats
      `Available`/`Unavailable` outright - and the detail page lists every
      problem above the calendar, which is why its Race buttons are dead.
      **Problems win over missing content on purpose**: a championship that does
      not validate cannot be raced whatever you install, so pointing the user at
      a shopping list sends them after a fix that does not exist - and
      `availability.entries` and `.rounds` are derived from a document already
      declared incoherent, so the missing-content card is suppressed rather than
      shown from data that cannot be trusted.
      **It found a real bug while being driven**: `roundRaceable` never consulted
      `problems` at all, so a misconfigured championship offered a live Race
      button and `roundRace` threw on the click. Failing at validation time
      rather than at launch time is the stance everywhere else here, so it now
      refuses up front
- [x] **Clone a series** - `Duplicate` writes a copy under a fresh id with
      `forkedFrom` recording where it came from, so the copy sits beside the
      original rather than replacing it. **The id is main's to derive, not the
      renderer's**, which is what stopped this being one general "save this
      championship" command: the set of taken ids is not the loaded library, it
      is the loaded library *plus the directory's own file stems*, because a file
      that failed to parse owns its name without appearing in the library at all
      - and picking a "free" id from what loaded would overwrite the very file
      the user is trying to fix. The dialog asks for a name and nothing else.
      Extending an existing series with extra rounds is still the editor's job
- [x] **Export / import series files.** Export writes `writeSeries` output
      wherever the user points; import reads, parses and writes in one step,
      because neither outcome of an id collision destroys anything and so neither
      is worth stopping to ask about. **The collision rule is the interesting
      part**: a file naming a *shipped* id is written under it and reads as
      `adjusted`, which is how "here is my adjusted Formula 1, try it" arrives
      and is undone by one click of Revert; a file naming one of the *user's own*
      is renamed instead, because a file they wrote is never written over. A file
      that does not parse is refused with its reasons and nothing is written -
      it must not become a permanent entry in the library's problems that they
      then have to delete by hand.
      Driven end to end with the native dialogs stubbed and everything behind
      them real: export, import-as-adjusted, import-renamed, and a junk file
      refused with five problems and nothing written
- [x] **Content manifest per series, and where to get what it is missing.** The
      manifest half was already built and unticked: the championship's card in
      settings lists every missing car and every missing track layout by folder
      ID with its provenance chip, which is the manifest this item asked for.
      What was absent is the link, and **it is a page and never an
      `acmanager://install`** - that was checked before it was written rather
      than assumed. The URI wants a *direct download*, and no source the
      catalogue names has one: DLC is a Steam entitlement rather than a file,
      RSS, VRC and URD sell their cars behind a login, Guerilla and Yezhrod
      release through Patreon, and LFM installs its pack with its own launcher.
      Handed a store page, Content Manager would download the HTML, find nothing
      to install and say nothing - this area's characteristic failure. So the
      mechanism was not built at all: `buildInstallUri`, an IPC channel and a
      per-content URL table would have shipped with no row that could ever fill
      them, and a field carried but never applied is worse than no field.
      **Landed as a Where to get it card on the Content sources tab**, which is
      the tab that already asks which sources a career wants: one row per DLC
      pack, per mod team and per redistributor, each a provenance chip in its own
      hue beside the host it links to. LFM is on it although it has no switch -
      a redistributor ships other teams' work, so the makers' own switches
      answer for it, but it is still somewhere content comes from. The table is
      `src/shared/constants/content-links.ts` rather than the provenance
      catalogue: the renderer is the only caller and may not import core, and
      nothing in it is baked into a scanned `Car`, so it bumps no version. A
      plain `target="_blank"` anchor is the whole of the mechanism, since
      `createWindow`'s `setWindowOpenHandler` already sends one to the real
      browser.
      **It found a real error in the catalogue on the way.** The Steam app ids
      were read out of Kunos' own `ui/dlc_ui_car.json` markers, cross-read
      against the packs the catalogue assigns those cars to, and then confirmed
      one at a time against Steam's `appdetails` API - and **the Red Pack and
      the Tripl3 Pack were swapped**, and had been from the beginning. App
      493190 is the Red Pack and holds the seven Ferrari, Lamborghini and
      Maserati cars plus the Red Bull Ring; 509350 is the Tripl3 Pack and holds
      the 488 GTB, the FXX K and the Praga R1 - three cars, which is what the
      name says. Eleven catalogue rows, six shipped championships whose
      descriptions named the wrong pack, and two lines of this file.
      **No version was bumped**, per *No schema migrations before the first
      release*: the content cache has the old provenance baked into its `Car`
      and `Track` objects and an unchanged folder keeps its fingerprint, so
      `%APPDATA%/ac-career-mode/content-cache.json` goes on serving the wrong
      pack until it is deleted - which is the author's to do, not the app's.
      Worth one correction to the standing warning that mod authors copy that
      marker verbatim: it is untrustworthy **for a mod** and authoritative for
      Kunos' own cars, which is exactly the case it was read in here
- [x] **Championship configuration page**: every shipped championship, available or
      not, and what content it needs.
      **Landed as the Championships tab of Settings** - `/settings/championships`,
      beside Classes, together with the toggles below, since both answer "which
      championships, and what do they need". It lists every championship rather
      than only the shipped ones - the user's own included - each with its
      origin, its availability, the packs and mod teams it needs and the ones
      that only widen its field, and, when a toggle hides it, which one.
      **It has since become where the whole library is managed** - see the
      split below - so the missing content, the problems and every action that
      changes a championship moved here off the championship's own page.
      **It found that `requires` answered the wrong question**: it recorded the
      provenance of every car a spec could field, so GT3 Sprint Series read as
      needing Ready to Race, the Red Pack and Porsche Pack 3 - and gating on
      that would have hidden a base-only championship behind three DLC
      switches. `SeriesRequirements` now keeps needing and reaching apart: a
      source is needed when a track or a car list names it, or when a spec
      falls below its floor without it - which is what makes Formula 1 2023
      need VRC - and everything else a spec reaches is `widenedBy`. The spec
      grids travel along as `pools`, because two packs neither of which a spec
      needs alone can still leave it short together
- [x] **Fork a shipped championship** - and it turned out to be two actions
      rather than one, both built on the override rule the library already had.
      **Customise** takes the copy under the same id, so the app's own is
      replaced and Revert brings it back; **Duplicate** takes it under a new one,
      so both sit on the ladder. Either way the copy diverges - nothing links it
      back except `forkedFrom`, which is a record rather than a live reference.
      Substituting or dropping content within the fork waits on the editor
- [x] **Content source toggles** governing which championships are offered - base,
      DLC, and one per mod maker.
      **Base has no switch**, since a base-only ladder is always offered; the
      eleven DLC packs are one multi-select, in the shape of Weather in the sim,
      and each mod team is a toggle of its own. A championship is offered only
      while everything it needs is switched on, and **the rule covers every
      championship**, the user's own included. `settings.hiddenContentSources`
      stores what is **switched off** - the opposite of `allowedWeather` - so a
      pack or a mod team the catalogue gains later arrives switched on rather
      than quietly hiding what needs it. The gate is
      `src/shared/utils/content-sources/`, read by both the list and the tab.
      **Nothing is hidden silently**: the championships list says how many are
      hidden and links to the tab, every switch says how many championships it
      would hide, and a hidden championship's own page stays reachable
- [x] **Racing and managing are two pages.** The Championships page is the one
      a career races from, so it is read-only and lists only what can be raced
      today: a championship switched **Active**, offered by the content sources,
      and available - misconfigured and unavailable ones are left off, and one
      line says how many and links to settings. Its page keeps the calendar and
      the Race buttons and loses the actions menu, the problems and the missing
      content. **Everything that changes a championship is the settings tab's**:
      New, Import, Edit, Duplicate, Export, Revert, Delete, the Active switch,
      availability, problems and what it needs. **One card does both**:
      `ChampionshipCard` is read-only and a stretched link on the list, and given
      the screen's commands it manages the championship instead. The editor's
      Back now returns to the tab, and a duplicate opens in the editor.
      `settings.inactiveSeries` stores what is switched **off**, like the content
      sources, so anything written, imported or duplicated arrives active.
      **New championship writes nothing until the first Save.** It opens the
      editor on `/settings/championships/new` over an `emptySeries` - no class,
      no round, no format, no points system, since every one of those would be a
      choice nobody made - and `series:create` takes the whole drafted document
      and mints its id. The editor then replaces the URL with that id's own.
      `SERIES_FORMAT_VERSION` moved to `src/shared/constants/` for it, since the
      renderer now drafts a document of its own.
      **The editor moved under settings** - `/settings/championships/:id/edit` -
      so the nav lights Settings rather than Championships while a championship
      is being edited. It is deliberately not nested inside the settings layout,
      which would head the editor with the settings tabs.
      **The content source switches govern the app's own championships only**:
      one of ours that needs a source switched off is not listed at all, since
      those switches are how it comes back, while a championship the user wrote
      or adjusted is their document and is never hidden by them. Settings has a
      **Content sources** tab of its own, between General and Classes.
      **Every on/off control is now one switch**: `ToggleButton` renders the
      same `Switch` the library cards use, green when on through the shared
      `SWITCH_TRACK`, so settings, the editor, the race screen and the cards no
      longer mix On/Off buttons with switches. A championship's switch sits in
      its card's bottom corner, and switching it off fades everything else on
      the card. The Championships page says nothing about what it leaves out -
      it is a page to race from, and what is missing is the settings tab's
- [x] **Reverse grids.** `SessionInheritance.reverse` turns the front of an
      inherited order round, which Formula Abarth, F2, F3, F4, BTCC, TCR and
      the Ginetta Supercup all race. It needed a race to classify: a race
      launch now records its finishing order - AC's `raceResult` when it is a
      whole permutation, laps then time otherwise - so a later race can follow
      it, and `qualifyingOrder` became `classification`. The editor offers an
      earlier race as a source to a race, and a *Cars reversed* field beside
      *Cars carried over*. `npm run dry` byte-identical
- [x] **Which championships start switched on is the library's call.** `SHIPPED`
      registers each shipped championship with `active` and, for a filler rung,
      `filler`; the listing carries both as `activeByDefault` and `filler`, and
      `settings.seriesActive` stores only the switches the user actually
      flipped, either way - `inactiveSeries` is gone. **There is no historic
      championship in the app**: every championship is the same kind of thing,
      and which of ours start off is the authoring rule below and nothing more.
      "Historic" names historic events, single events of their own, which is a
      different thing again
      A switch on the Content sources tab hides every filler championship at
      once
- [x] **A race is laps or a distance, never the clock.** Assetto Corsa runs a
      timed race on a server alone - measured, not assumed, and both halves of
      it were driven. A race sent as minutes alone writes `RACE_LAPS=0`, and the
      AI read that as nothing to race and drove to the pits while the player's
      own clock ran the race out; a race sent as minutes *and* a lap count
      nothing could reach ran on past the clock, counting laps everywhere. CM's
      Quick Drive has no timed race to copy either, so test mode had nothing to
      show. **Eighty-two shipped championships were racing on the clock**, from
      Formula Abarth's 28 minutes to every 24-hour race in the library, and all
      of them had to say their races another way, and there are two answers.
      **A race under four hours is a distance** - the kilometres that duration
      covers at the fastest class's pace, which each file's header states - and
      becomes laps off each round's own layout. **A race of four hours or more
      states its laps per round**, from the real event's winning distance,
      because one distance over a calendar runs hours long at a slow circuit:
      Le Mans is the real 311 laps of 2024, the Rolex 24 781, the Spa 24 Hours
      564 in 2013 and 478 in the wet 2024 edition. `championship-review.md`
      carries every pace, every lap count and the half-dozen rounds whose real
      race was rained off and had a normal edition stand in. The engine refuses the shape rather than trusting
      the library: `validateSeries` reports `series.race.timed`, `buildRaceIni`
      throws `race.session.raceNotInLaps`, and neither the editor nor the race
      screen offers minutes on a race any more. **The calendar says both** -
      a round badges its race as "1150 km - 235 laps", since the distance is
      what the championship races and the lap count is what this track makes of
      it
- [ ] **Ship a championship for every car the catalogue names** - see *The
      championship catalogue*. It replaces "a complete base-only ladder", which
      is now the first batch of it
- [x] **Formula UK** - was held for Brands Hatch on the belief it was a real
      series. **It never raced**: Rodin Cars and Chadwick Motorsport announced a
      one-make T125 series in 2016, pitched as the UK's Super Formula, for a
      winter 2017 start, and nothing came of it - no calendar was ever
      published. The Exos's honest home is **BOSS GP Open**, whose rules name
      the Lotus T125 by name, and that is where it races on base content. Formula
      UK still ships, in the DLC batch, labelled as the series that was proposed
      rather than one that ran
- [x] **Formula Abarth** - the championship the Tatuus FA01 exists for. A real
      junior ladder rung, but a single-chassis one with a single car installed,
      so its class, its spec and its car were the same thing three times over.
      The class and spec are gone; the series names the car - `tatuusfa1`, which
      appears in no spec at all, so a car list is the only way to reach it.
      Five Italian base circuits, and **a three-day format with two races**,
      which is what proves a weekend can hold more than one race now that a
      session is a launch of its own: it plans into four launches, one per
      session, across three days
- [x] **Lotus Cup** - the multi-class exemplar, and a real championship rather
      than a shape invented to exercise the schema. Lotus Cup Europe runs its own
      classes on one entry list with separate standings, and every car it needs is
      base content: Open is the 2-Eleven, the Exige V6 Cup and the Evora GX, with
      the GX ballasted and restricted because a Grand-Am car against a track-day
      special is only a grid once the quick one is slowed down; Production is the
      Elise SC, the Exige S and the Exige 240. Sixteen cars over two classes and
      two tiers. It is also **the only shipped championship on the road
      discipline**, which nothing else would reach - road cars carry no spec on
      purpose, so a series gets at them by naming them
- [x] **GT3 Sprint Series** - the spec exemplar, and what "a spec is satisfied by
      whatever you own" looks like on a real install: five of `GT3_2010S` are base
      content, and Ready to Race, the Red Pack or Porsche Pack 3 simply widen
      the field rather than unlocking the series.
      **Deliberately not named for a real season.** The spec spans 2011 to 2016
      machinery, so a 2013 Blancpain field would not have held an AMG GT3 - naming
      a year would make the series claim something its own grid contradicts
- [x] **Formula 1 2023** - the knockout exemplar, and the only shipped
      championship that needs content Assetto Corsa does not ship. There is no
      base-game F1 car, so the format that motivated knockout qualifying could
      not be built honestly on one; it runs on VRC's Formula Alpha 2023 instead,
      and anyone without the mod sees it unavailable with VRC named, which is
      what the provenance catalogue is for. Twenty cars, `minModels: 1` because
      the mod is one chassis in twenty liveries rather than ten distinct ones,
      and both formats: a regular weekend of three practices, Q1/Q2/Q3 and the
      grand prix, and a sprint weekend that runs SQ1/SQ2/SQ3 into the sprint and
      Q1/Q2/Q3 into the grand prix - **two chains on one weekend, which is the
      thing no earlier format could say**. Austria and Belgium run the sprint.
      **Zandvoort is missing from an otherwise real calendar** because Assetto
      Corsa's has eighteen pit boxes against a twenty-car field, so
      `seriesAvailability` would report it rather than race it
- [x] **American Le Mans Series (ALMS)** - folded into the catalogue as ALMS
      2001, in the Guerilla batch: the E46 GTR's own GT class with RSS's 996
      and 360 as its rivals, the Viper and the Saleen in GTS, and the 333 SP in
      LMP900. The 911 GT1-98 was suggested as a grid-mate and does not fit - it
      is a 1998 car of a class 2001 no longer ran

### The championship catalogue

A championship for every car the catalogue names - base, every DLC pack and every
mod maker - researched against the real championships those cars raced in, on
the install the catalogue was authored against: 418 cars, 231 layouts, pit boxes
read off the content cache. Five rules decide how they are written.

- **Real where there is a real one.** The season a car fits, its calendar where
  we have the circuits - substitutes named in the description - its session
  structure, qualifying format, reverse grids, points and **its real race
  lengths**: a 24-hour race is twenty-four hours. Scaling one before its start is
  Phase 5's.
- **Invented where there is none, and saying so.** Road supercars and hypercars,
  one-off race cars and fictional mods get championships too, each description
  saying it has no real counterpart. Some may be removed on review.
- **One championship per spec**, so every Formula 1 season we have a car for is
  a championship of its own.
- **Every race is laps or a distance, because Assetto Corsa has no timed race
  offline.** Driven, twice: a race sent as minutes alone leaves `RACE_LAPS` at 0,
  which the AI read as nothing to race and drove to the pits, while the player's
  own clock ran the race out; and a race sent as three minutes *and* 999 laps,
  a count nothing could reach, simply carried on past the clock with every
  screen counting laps. Content Manager's own Quick Drive offers no timed race
  either. So a series states what its real races ran in its description, and
  races it another way, split at four hours. **A shorter race is a distance** -
  the kilometres that duration covers at the fastest class's pace, so Formula
  Abarth's 28 minutes and a lap become 65 km. **A race of four hours or more is
  a lap count per round**, taken from the real event's own winning distance,
  because one distance across a calendar runs six hours over at a slow circuit
  and under at a fast one. Every pace and every lap count is listed in
  `championship-review.md`.
- **True tiers, and filler for the gaps.** A tier is where a series really
  stands. Where a discipline's base rungs skip tiers, the rung below is repeated
  in the gap with `+` and `++` in its name and longer races each step - Formula
  Abarth + and ++ between Formula Abarth and BOSS GP Open - and one setting hides
  them all.
- **A real season before 2006 ships switched off.** That is the whole of what
  "historic" means for a championship: an authoring rule for our defaults,
  never a field, a chip or a label. Occasionally racing an old car is what
  historic events are for - single events of their own, see Phase 5.

Grids are capped at the fewest pit boxes on the calendar - plain Kunos layouts
have 24, Zandvoort and Magione 18, Silverstone 1967 20 - and mod calendars use
the large-box layouts (`spa/2022`, `monza/lfm`, `ks_red_bull_ring/layout_gp_lfm`,
Le Mans at 70). VRC cars shipped twice are raced in their `_csp` folder.

**Calendars take tracks from every source we support; entries take cars from
exactly what they name.** A championship races its real venues wherever anyone
has built them, so a round may need a mod circuit even when every car is base
game. What is missing weighs differently: a missing track blocks only its own
round, so a championship is available once one round can be run, while a missing
car would leave a seat empty, so every car an entry names is a requirement. The
library test keeps the base ladder honest under that: a base-only championship
switched on has at least three rounds on layouts Kunos ship, and one switched off
at least one - the list lives in the test, because base provenance is keyed by
circuit and the OSRW, LFM and VRC layouts inside base folders read as base.
Batches 1 and 2 were revised to their real calendars once the rule was settled.

**Deliberately without one**: the drift variants, since drifting is judged rather
than raced; the two rally cars, deferred under *Open questions*; and
`ks_lamborghini_gallardo_sl_s3`, whose data claims 1200 bhp.

**Batch 1 - the base ladder**, every one switched on. **Landed**, and the library
test now holds the guarantee: the base-only championships that start switched on
climb every discipline from tier 5 without a gap - single-seater to 2, sportscar
to 2, road to 1, touring at 5 until its older rungs are switched on. Every round
was lowered through `npm run series`, including the Spa 24 Hours - written as
1440 minutes at the time, and 3850 km since - and the Spa 1000 km at 143 laps;
none has been driven in the game yet. Where no
source gave a points table - Super Trofeo, GT4 European Cup, BOSS GP, the
Mk1 MX-5 - the file says which scale stands in. **Invented fields never borrow a
real name**: a first pass had several real GT drivers and three real Lamborghini
teams in made-up entry lists, and they were replaced; only a real entry list, like
the ILMC's, names real people.

- [x] Formula Abarth, brought to its real 2010 format - 28-minute races, the second
      from the first's result with the top eight reversed, and the 20-15-12 and
      13-11-9 tables (single-seater 5)
- [x] Formula Abarth + and ++, filler, built by `filler()` from Formula Abarth with
      races a quarter longer per step (single-seater 4 and 3)
- [x] BOSS GP Open - Exos 125 and Stage 1, the upgrade balanced to the standard
      car (single-seater 2)
- [x] GT4 European Cup 2010 - SuperSport for the 2-Eleven GT4 and X-Bow R, GT4 for
      the restricted Evora GTC (sportscar 5 and 4)
- [x] Lamborghini Super Trofeo Europe 2016 (sportscar 4)
- [x] GT3 Sprint Series, re-based on the Blancpain Sprint weekend - a qualifying
      race setting the main race's grid (sportscar 3)
- [x] Blancpain Endurance Series 2013 - three-hour races, the Spa 24 Hours and the
      Nurburgring 1000 km, on the four base GT3 cars of 2013 (sportscar 3)
- [x] Intercontinental Le Mans Cup 2011 GTE - the real GTE Pro entry, which is
      exactly the M3 GT2, the 458 GT2 and the Evora GTE (sportscar 2)
- [x] Trofeo Abarth 500 Italia 2009 (touring 5)
- [x] Hot Hatch Trophy (invented), Mk1 MX-5 Championship, GT86 Cup (road 5)
- [x] Lotus Cup, with Lotus Cup Europe's classes - V6, Open and Production (road
      5 and 4)
- [x] Production Car Endurance, on the Bathurst 6 Hour's class rules (road 4 and 3)
- [x] Supercar Series, invented (road 2)
- [x] Hypercar Invitational, invented (road 1)

**Batch 2 - base, seasons before 2006**, every one switched off. **Landed.** A
grand prix is a distance, so every round of a real season runs its real one:
`withRaceLaps` copies a weekend format with the race's laps changed, one per
round. (Since replaced: a race is a `distance` now, or laps, and a round keeps
its own count as a `sessionLengths` override, so a season holds its real
formats and nothing more.) Where the circuit is the period one - Monza's 1966 road course and its
banked full course, Silverstone 1967, Zandvoort - the laps are the real ones;
where it is a later layout, they cover the same distance. **The historic Formula
1 seasons race their real entry lists**, every driver in whatever of the spec is
installed, the way Formula 1 2023 does; the sportscar and touring seasons crew
two or three drivers a car and assign cars from a spec, so their fields are
invented rather than putting real crews in the wrong cars. **DTM 1993 moved here
from the DLC batch**: its spec needs one model and the base game's M3 Sport
Evolution is one, so it runs base-only and the Dream Pack 1 Alfa and Mercedes
only widen it. Seasons that counted only a driver's best results, and the Spa
24 Hours' points at six and twelve hours, cannot be said by a points system yet.

- [x] Formula 1 1962, 1967, 1971, 1975 and 1986 - Lotus 25, Lotus 49 (+312/67),
      Lotus 72D, Ferrari 312T, Lotus 98T (+RSS 1986), real entry lists and real
      distances
- [x] Masters Racing Legends - the Stewart class (Lotus 49, 72D) and the
      Fittipaldi class (312T)
- [x] World Touring Car Championship 1987 - the M3's Division 2, the Spa 24 Hours
      and three 500 km races at real length; Youngtimer Trophy - the Group A M3
      and the Escort RS1600 as two classes
- [x] DTM 1993 - on the base M3 Sport Evolution, widened by Dream Pack 1
- [x] World Sportscar Championship 1969 (GT40, +330 P4, 908, 917 K) and World
      Sports-Prototype Championship 1990 (787B, +C9, 962 C)
- [x] Supercar Classic, invented - the Eighties (F40, Yellowbird) and Classic
      (Miura, Countach, 33 Stradale, Sport quattro) classes
- [x] Masters Gentlemen Drivers with Pre-66 Touring - the Cobra in GT, the Abarth
      595 SS in Touring

**Batch 3 - DLC**. **Landed.** Twelve start switched off, fifteen on. Several
moved in or changed on the way: WEC, Can-Am, IROC and the MX-5 Cup were always
here; **FIA GT 1997 replaced 1998**, since the 911 GT1 and the F1 GTR are that
season's cars and the 1998 Porsche is not in the catalogue; the one-make for the
718 RS 60 is the Porsche RS60 Spyder Cup; and **Tuner Invitational replaced Time
Attack Invitational**, because time attack is not wheel-to-wheel and the base
game's stage-tuned cars wanted a home too. LMP2 is absent from both WEC seasons,
the catalogue having no car of either. Every invented field was checked for real
and near-real names, and several were replaced.

- [x] Formula 1 1954, 1957, 2004 (off), 2013, 2015, 2017 - real entry lists and
      real distances
- [x] Formula UK, labelled as proposed and never raced
- [x] WEC 2014 - LMP1 (R18, TS040) and GTE (458 GT2, C7.R); WEC 2016 - LMP1
      (919) and GTE on the 2017 spec; Le Mans at double points in both
- [x] BPR Global GT 1996 and FIA GT 1997 (off)
- [x] GT Manufacturers 1962, Can-Am 1973, World Championship for Makes 1978,
      IROC 1974, Porsche RS60 Spyder Cup (off)
- [x] Porsche Supercup 2017
- [x] Nurburgring Langstrecken-Serie - SP9, SP-X, Cup2, Cup3, BMW Cup, TT
- [x] Audi Sport TT Cup 2016, MX-5 Cup
- [x] Porsche Club Race (PCA's S4 and S6), JDM Production (invented), Roadster
      Party Race
- [x] XX Programme Invitational and Tuner Invitational, invented
- [x] Tour Auto and Classic Endurance Racing 2 (off)

**Batches 4 to 9 - mods, one maker at a time**, a championship needing several
landing with the last of them:

- [x] **RSS** - landed as twenty-nine championships:
      - Formula 1 1970, 1979, 1990 and 2000 (off), 2010 and 2018 to 2021, with
        real entry lists and real distances; the 2022 to 2026 seasons on RSS's
        cars as `(RSS)` championships of their own, since VRC's car of the same
        year is a separate spec - Formula 1 2023 becomes `(VRC)` in that batch.
        Sprint weekends run in each year's shape: the sprint setting the grand
        prix grid in 2021 and 2022, a shootout of its own from 2023, sprint
        qualifying on Friday from 2024. `withSessionLaps` gives a weekend's
        two races their own distances. The 2025 field is listed by team and
        2026 is the season as announced, still under way when written
      - FIA Formula 2 2017, 2020 and 2024, FIA Formula 3 2024, the Italian F4
        Championship, Super Formula 2019 and 2023, IndyCar 2020 - its oval
        opener runs at Daytona with the oval kit through `Round.eligibility`,
        and COTA and Laguna Seca come from the calendar as first published
      - FIA GT 2004 (off), a GT-M Championship, DTM 2021 and DTM 2025 (RSS),
        WEC 2025's Hypercar class on the MP-H cars
      - Formula X Invitational and Unlimited Invitational, invented - the
        latter also takes the Hyperion 2020, which the plan had no home for
      - Every feeder and sportscar field is invented, and several near-real
        names were replaced. Super Formula is thin: 2019 has two rounds and
        2023 three, all at Fuji or Okayama, because nothing else Japanese it
        races is in Assetto Corsa. Points tables and lengths that were not
        checked say so in each file's header
- [x] **VRC** - landed as nineteen championships and a rebuilt one:
      - Formula 1 1988, 1991, 1997 and 2005 (off), 2007 and 2009, real entry
        lists and real distances; 2022 to 2026 on VRC's Formula Alpha as `(VRC)`
        championships, the same seasons as RSS's. **Formula 1 2023 is now
        `Formula 1 2023 (VRC)`**, rebuilt as the real season - thirteen rounds
        at their real distances and four sprint weekends - under the id it
        always had
      - FIA Formula 2 2024 split in two, `(RSS)` and `(VRC)`, the same invented
        field on both; the RSS one's id became `formula-2-2024-rss`
      - Formula E 2020-21 on the Gen2 car and 2023-24 on the Gen3; IndyCar 2012,
        2018 and 2021, each fielding the oval kit at a Daytona round that stands
        in for the season's speedway race - the short-oval kits have no short
        oval to race on
      - British Touring Car Championship 1998 (off), Trans-Am TA2, and WEC 2024
        (VRC) on the Prototype H cars
      - Formula E and IndyCar are thin: one to three real venues a season.
        Everything unverified is in `championship-review.md`
- [x] **LFM** - landed as eight championships: WEC 2024 (LFM), Hypercar and
      an LMGT3 class that is LFM's GT3s car for car; GT World Challenge Europe
      Sprint Cup and Endurance Cup 2024; Intercontinental GT Challenge; ADAC GT
      Masters; DTM 2025 (LFM), the same invented field as the RSS one; TCR
      Europe; Porsche Supercup 2025. Sprint Cup, ADAC GT Masters, TCR Europe and
      the IGTC are not tied to a season, their calendars being the circuits each
      races rather than one year's. Grids use LFM's large-box layouts where the
      real fields run past twenty-four. LFM's two LMP2s go to the Yezhrod batch
      with ELMS and WEC 2017, its Supra GT4 to Guerilla's GT4 series and the
      Radical it distributes to URD's Radical Cup
- [x] **URD** - landed as three championships: the EGT Championship,
      invented, mixing hour-long sprints with six and ten-hour races, each
      sprint round fielding the sprint Darche 9SRs through `Round.eligibility`;
      Porsche Supercup 2021 on URD's Darche 992 Cup, the first 992 season, with
      the 2025 season's invented paddock; and Radical Cup UK, SR10 and SR3 as
      two classes, not tied to a season. URD's Loire 07 LMP2 goes to the
      Yezhrod batch's ELMS; its Mercedes CLR is already in the GT1 (1990s) spec
      FIA GT 1997 races
- [x] **Guerilla** - landed as nine championships: GT4 European Series; GT2
      European Series, which names Guerilla's imagined GT2s and its Cayman RSR
      alongside the real ones; Porsche Supercup 2023 on Guerilla's 992; BMW M2
      CS Racing Cup Italy; Ginetta GT4 Supercup; S-FR Cup and Liana GT Cup,
      invented, the latter for the Liana GT V6 Cup the plan had no home for;
      American Le Mans Series 2001 (off), the E46 GTR's GT class with RSS's
      333 SP and GT cars; and **VLN 2004 (off) in place of a Nurburgring 24
      Hours 2004** - one race on its own would be a historic event, which is
      not a championship, so the 24 Hours sits inside the season that builds to
      it.
      GT4 and GT2 European Series, the M2 Cup and the Ginetta Supercup are not
      tied to a season
- [x] **Yezhrod** - landed as seven championships: WEC 2012 (LMP1 on the R18
      e-tron, GTE on the base GT2s), WEC 2017 (LMP2 and GTE) and WEC 2023
      (Hypercar, LMP2, GTE Am), each with every round of its season; IMSA 2017
      and 2025; ELMS 2025; and the FIA GT1 World Championship 2010, the MC12 and
      Yezhrod's GT-R with RSS's DBR9 and Murcielago. Three cars have no home:
      Yezhrod's 2014 Ligier JSP2, which would put a mod on WEC 2014's
      requirements, and the GT-R's 2009, 2011 and Endurance versions

**All nine batches have landed**: 133 championships. Everything unverified, every
stand-in and every candidate for removal is in `championship-review.md`, and
`missing-tracks.md` lists the tracks each real calendar still lacks. What
remains of the checklist is the review, driving a round of each batch, and the
tests the batches' core changes are owed.

## Phase 5 - Championship engine and calendar

**The calendar, the career and the standings have landed**, as one slice: a
career is a clock and the championships it has entered, rounds are dated by
spreading them evenly across a season, and the points 131 shipped championships
have been carrying since Phase 4 are finally applied. What made it possible was
one small change to the lowering - `roundRace` now stamps the seat, the class
entry and the team onto every `CarEntry`, inert, the way `SeriesSession.pointsSystem`
already rode into a session. Before that a result could only be joined back to a
driver by name, and an unnamed field is all `AI Driver N`. **`npm run dry` was
diffed either side and `out/race.ini` is byte-identical**, which is the whole
proof that no layer below learned what a series is.

- [x] Configurable points systems - `src/core/season-scoring/` applies
      `positions`, `fastestLap` and `qualifying`. **Points are paid on class
      position, not overall**: a multi-class grid runs one race and settles
      several championships in it, so an LMGT3 car winning its class scores a
      win from twenty-fifth. **Qualifying points pay the grid the race actually
      started on**, composed by the weekend engine's own
      `composeOrder(chainOf(...))` rather than by a second rule - which is what
      makes knockout qualifying come out right for free, and what makes a
      reverse-grid race pay on the qualifying order rather than on the reversal.
      Fastest lap is read from the raw `race_out.json` rather than from a
      summary, because a summary names a driver and scoring needs the car index,
      and remapped through `LaunchRecord.gridOrder` - a result's indices are
      positions in that launch's own `[CAR_n]` list, not in the weekend's
- [x] Driver and team standings - one table per class entry and no overall one,
      because a multi-class championship genuinely has none. **Every seat starts
      in its table on nothing**, so a table is the field rather than only the
      drivers who have scored, and the player's own name replaces the AI name
      the document wrote in the seat they took
- [x] **Career calendar with dates** - `src/core/season-calendar/`, pure
      arithmetic on UTC day numbers. A career season is a calendar year - it was
      52 weeks from the day it opened until season end landed, below;
      `Championship.seasonLength` says how much of that one championship
      fills - a year, half a year or a quarter - so a series that really runs
      twice a year says so instead of being written out twice. Rounds are spread
      evenly and **every race lands on a Sunday**, with the weekend's opening day
      counted back from it through `SessionDefinition.day`, which is what finally
      makes that field mean something on a calendar. `validateSeries` reports
      `series.season.tooManyRounds` rather than crowding two rounds onto one
      weekend
- [x] **Advance to date**, stopping at the first weekend you are entered in
      rather than skipping past it - or going past it, once the rounds that
      costs are confirmed
- [ ] Fire dated events on arrival: offer deadlines, transfer windows, sponsors.
      **Waits on Phases 9 to 11**, which is what would have anything to fire
- [x] **Clash detection** - overlapping weekends rather than a shared race day,
      since a weekend is several sessions over several days and the player is one
      person. Reported and badged, never refused: real calendars clash, and which
      of two to give up is the player's call
- [x] **Events take one day, spread across the week.** Every race on a Sunday,
      each round blocking Friday to Sunday, made running two championships at
      once a clash every other week. An event now sits on its race day alone -
      a format's days are the event's own, for the time of day and the weather -
      and `raceWeekdayOf` puts a championship on the day of its highest class's
      tier: tier 1 Sunday, tier 2 Saturday, the rest a weekday seeded off the id,
      unless the championship states its own `raceWeekday`. Formula E and the
      Nordschleife series ship as Saturday races. **A clash is now a shared day
      and it costs the other round**: launching one event gives up any other on
      that day, confirmed in `SkipDialog` like every other lost round - which
      closes the hole where both of a clashing pair could be driven while the
      page said only one could. `settings.allowSameDayEvents`, a switch in
      General settings, turns clashes off altogether. The rule that a race may
      not open a three-day format went with it, having only ever stood in for
      "never on a Friday". "Weekend" became "event" throughout, code and
      document fields included
- [x] Season state machine: next round, results and standings
- [x] **Season end: a season is a calendar year, and it closes.** Moving the
      clock past 31 December - by advancing, or with *Finish the year* on Home
      once nothing entered is left - gives up whatever the year still had to
      run (confirmed in `SkipDialog` like every other lost round), races it with
      the field, and opens the next season **empty**. `closeSeason` in
      `src/main/career-store/` is where prize money for a final standing
      (Phase 7) and the ladder moving (Phase 8) land; `openSeason` is the one
      place a commitment carries over, and there are none until Phase 9's
      contracts. **Entering stays the championship page's**: nothing re-enters
      itself, and the reviews link to the page with the class and car pre-picked
      rather than offering an *Enter again* of their own - so when Phase 9 decides
      how a career gets into a championship, none of this changes. A closed
      season reads back read-only: its championship and round pages take
      `?season=&edition=`, and a launch refuses anything but the current season.
      **A career's race id now names its run** - `runRaceId` appends
      `@<season>.<edition>` - so last year's round, still in the race store's slot,
      can never pass for this year's. `advanceTo` also refuses to move while a
      launch is out, and no longer loses a round on the clock's own day unasked
- [x] **Editions.** `seasonLength` says how often a championship runs, too: a
      half-year one twice a year and a quarter-length one four times, each run an
      *edition* - a season entry of its own, with its own field, forecasts,
      standings and review, entered separately. Each edition has its own share of
      the year's 52 weeks, its rounds placed by the same seeded offset. Named
      `2027`, `H2 2027` or `Q3 2027`; the championship page switches between a
      year's editions. Nothing shipped sets a length, so this serves the user's
      own championships
- [x] **Rounds nobody drove are simulated** - `src/core/round-simulation/`.
      A round the player missed, one run before they entered the championship,
      and every round of a championship they are not in is raced by the field
      off each driver's pace and a seeded draw, then scored by `scoreRound`, so
      qualifying points, fastest laps and reverse grids pay exactly as a driven
      round does. **Calculated where it is needed and stored once it matters**:
      a championship the career is not in is simulated on every read and
      nothing is kept, since the same round always comes out the same; entering
      one mid-season stores its rounds already behind the clock, and a missed
      round of the career's is stored once its race day passes - so a later edit
      to the championship cannot rewrite a round that has been run. **The draw
      is seeded per seat**, which is what makes a round stored on entering the
      one shown the day before. **The player's seat is raced by the driver it
      names** whenever the player is not in it - one stand-in, the same driver
      every time - whose places are marked `substitute` and stand in a row of
      their own, while the team keeps every point either way. A weekend left
      part-way keeps what was driven and simulates the rest: **a stand-in put
      in after the player qualified starts from the back**, having set no time,
      and any qualifying points stay with the player as a `bonusOnly` place -
      points of theirs that count as no race
- [x] **Results and standings screens** - the championship page in tabs, with
      the standings as a table or as a grid of every race of the season, on
      points with what qualifying and the fastest lap added, or on positions;
      a round's results on its own page; the Results page as one card per
      weekend; a result page with its podium and the championship after it.
      One set of pieces under `src/renderer/src/components/results/` draws all
      of them, so a P3 looks the same wherever it is listed
- [x] DNS handling: no points, and the entry fee **recorded rather than
      debited**, because there is no money anywhere until Phase 7. Rating is
      untouched because there is no rating until Phase 8. **Phase 7 dropped
      the fee altogether**: a fee is paid only for a round launched
- [x] **A season races its own copy of the championship.** Entering one copies
      the whole document into the season, and everything about that season -
      its dates, setting a round up, scoring, standings - reads the copy. The
      library's championship is a rulebook a career never touches, so an edit
      reaches the next season rather than the one being raced, and deleting it
      cannot break a season already run. Chosen over three alternatives: reading
      the library live (an edit changes the rules mid-season and a removed seat
      or round orphans its results), versioned championships (a store of
      revisions to keep and clean, for shipped constants that have no history
      anyway), and forking into the library (which fills it with copies)
- [x] **The event page** at `/calendar/:series/:round` - where a round is
      entered and every session of it is run. A calendar card opens it. Your
      entry and the weekend's sessions down the left, each with its weather;
      the selected session on the right, as a briefing with Launch when it is
      next and as its full classification, with points, once it has run.
      **Each launch is copied onto the event as soon as it lands**, not when
      the weekend ends, so practice and qualifying results are there at once
      and a race's points reach the standings mid-weekend. Racing a weekend
      ahead of the clock moves the clock to it, allowed only once nothing
      entered before it is unraced; the calendar cannot move on while a weekend
      is part-way. A weekend is put back in the race store's slot together
      with the launches the event holds, so a race weekend of the player's own
      raced in between costs a round nothing - which is what retired the old
      flag for a weekend changed on the Race screen part-way
- [x] **Persistent AI field** - a driver is the same driver all season: the
      same car, the same livery and the same pace against the rest. Before this
      the car a seat drove was drawn afresh every round, so in a multi-car class
      a driver swapped marque between weekends, and skill was a linear ramp down
      the seat list - it belonged to a place in the entry list, not to anyone.
      Names and nationalities were already stable, since every shipped seat names
      its driver.
      **Strength became the player's, and a championship states an offset.**
      `settings.opponents` holds the one absolute pair, strength and aggression,
      defaulting to 88 and 30 - 88 being the middle of the 92-to-84 spread every
      championship used to fall back on, so a field averages what it did. A
      championship's `grid`, a class's and now a **round's** are offsets, each
      added to the one below; a seat's `strength` and `aggression` are offsets
      too, and replace that driver's drawn spread rather than adding to it. So the
      difficulty setting moves every grid at once, a season already under way
      included - levels are resolved at lowering, never frozen. **An event
      part-way through takes its AI levels afresh at every launch** since the
      per-round step below, while the rest of the race the slot holds stays as
      it started, so a change reaches its next session and each launch records
      what it raced at. `aiLevel`, `aiLevelMin` and `aiAggression` are gone from the
      format rather than reinterpreted, and `parseSeries` reports them, so an old
      file is refused rather than read as a +95. The shipped library was
      converted mechanically: a championship's offset is its old spread's
      midpoint less 88, a class's is its midpoint less the championship's.
      **Every driver draws a small spread once a season** - within 2 of their
      class for strength and 5 for aggression - seeded on the seat, the
      championship and the season's salt, which is the career and the season
      exactly as the forecasts spell it. `validateSeries` reports any offset
      beyond 30 as `series.grid.offsetOutOfRange`.
      **The field is frozen on entering**, as `SeasonEntry.field`: `drawField`
      deals every AI seat a car over the championship's own eligibility, a
      livery the way `buildGrid` would - pinned ones and the player's reserved
      first - and its offsets. `roundRace` takes it as `request.field`, beside
      `draw`, and a round that runs other cars (the IndyCar kits) or a car since
      uninstalled draws its own for that round alone. Outside a career the field
      is drawn unsalted on every lowering, which is the same answer every time,
      so the championship page and `npm run series` show a stable field too.
      Checked with `npm run series`: Monza and Spa of GT3 Sprint Series field the
      same twelve cars in the same liveries at the same levels, and
      `npm run dry` is byte-identical.
      **Ratings in the Phase 8 sense are not this.** A driver's offset is fixed
      for a season and does not move on results; a career-wide roster, where a
      driver is one person across championships and seasons, is still to come
- [x] **Generate a weekend's weather one week out, not a season ahead.** It used
      to be derived on every read and seeded on the championship and the round
      alone, so every season of a championship raced identical weather and the
      calendar showed a forecast for a weekend half a year away. Now it is drawn
      once, a week before the weekend, and stored.
      **The split is the whole of it, and it is the seam that was already
      there.** `drawRound` is the climate's draw and knows nothing of what is
      installed; `offerForecast` swaps that draw for what this install and these
      settings can actually race and collapses a plan with no planner behind it;
      `forecastRound` is the two composed, which is what the CLI and a round
      raced outside a career still call. So **the draw is stored and the
      substitution is not** - switching a weather off in settings reaches a
      forecast issued a week ago, while the draw behind it never moves. Checked
      by construction rather than by eye: `drawRound` then `offerForecast` is
      deep-equal to `forecastRound`.
      **The salt is the career and the season**, and the empty one is spelled
      exactly as the seed always was, so a round outside a career draws what it
      has always drawn - `npm run series` is unchanged for a generated
      championship, which is the proof. Two careers now race different years, and
      a second season of a championship rolls its own.
      **Issued from the clock, not from a page load.** `issueForecasts` is pure
      over the career - storing the draw rather than the forecast is what lets it
      need neither the installed content nor the settings - and every path that
      moves the clock calls it: *advance to date*, launching a weekend still
      ahead of the clock, and a weekend finishing. `enrol` calls it too, or a
      championship entered the week before its opener would have a blank round
      until the clock next happened to move.
      **Two ways to have no forecast, and they mean opposite things.** A
      generated weekend the clock has not reached has one coming; an authored one
      never will. `EventSession.pending` says which, rather than the renderer
      inferring it from a climate threaded down through three components into a
      briefing that has no other interest in climates.
      **One thing nearly broke silently**: the race screen's Forecast marker
      compares the conditions a session is running against the forecast, and
      `series:raceForecast` answers from the library - which after this would
      draw an unsalted forecast for a round racing a salted one, and the marker
      would have vanished from every career race. The career is asked first,
      joined on `SeasonEvent.raceId`, and the library answers only for a round
      raced outside one. The strips under the championship page's rounds are
      gone, and that page now loads a forecast only while the Enter round dialog
      is open
- [x] **Give a round's climate a season.** A climate states the year as a whole
      and a round now has a date, so `seasonalProfile` shifts it to the month it
      is actually raced in: the temperature band moves, and the share of wet days
      moves against it, every climate we ship being drier in its own summer. A
      cosine rather than a season per quarter, so two rounds a week apart are a
      week apart in the weather rather than falling either side of a boundary,
      and peaked in mid-July rather than at the solstice because the warmest part
      of the year lags the longest day.
      **Hemisphere had to become real data**, not a northern assumption:
      Interlagos and Silverstone in the same February are opposite seasons.
      `GeneratedWeather.hemisphere` with a `Round.hemisphere` override, the same
      shape `climate` already had, defaulting to north - which is both where all
      but two of the circuits we ship sit and what every championship written
      before this meant. Thirty-six rounds carry it, all of them Interlagos or
      Bathurst.
      **Only the odds move, never the draw sequence**, which is the same
      discipline substitution follows: the same round in July and in January
      walks the same random numbers and differs only where the shifted
      threshold is crossed. So giving a climate a season re-weighted the
      calendar without re-rolling it
- [x] **Historic events.** Single events of racing's past, for racing an old
      car now and again rather than a season of it - which is why the
      championships of seasons before 2006 ship switched off. **Each is an event
      of its own**, with its own classes, teams, track, format and prizes, and
      no connection to any championship: it is written as a one-round
      championship document, which is what lets it reuse everything a
      championship has, and kept in a library of its own -
      `src/core/historic-library/`, the user's under
      `%APPDATA%/ac-career-mode/historic/` -
      that main serves through a second series store, as `historic:*`.
      `historicProblems` holds a document to one round, a points table that
      pays nothing and no calendar of its own. **A season draws them**: once a
      month by default, or as `settings.historicFrequency` says, each on a
      weekday, preferring a day the career races nothing else, seeded on the
      career and the season - `src/core/historic-draw/`. Read once, when the
      season opens, so a change to the frequency, the switches or the content
      sources reaches the next season and never re-draws this one. **For now
      the player is invited to every one and has accepted**, in a seat the draw
      picks: a historic event is a season entry marked `historic`, its copy's
      drawn seat moved to the end of its class, so the clock, clashes,
      SkipDialog, launching, scoring and simulation treat it as any round.
      Declining is withdrawing; not racing one is a missed round, raced by the
      field with the seat's own driver back in it. **No points**, a
      classification and prize money. The pool ships 46 events, seeded once
      from rounds of the switched-off championships and owned independently
      since; Settings › Historic events lists it as cards or a table, switches
      events off and edits them with the championship editor's pieces. Agreed
      in `mockups/historic-events.html`
- [ ] **Review the historic event pool.** Keep, drop and add: the 46 shipped
      were seeded mechanically and their descriptions written in one pass
- [x] **Scale a race's length before its start.** Shipped championships race
      their real lengths, so a 24-hour race is twenty-four hours; the player
      shortens one at the moment they start it, on a slider in a popover off
      the round page's Length tile - shortest on the left to the full race on
      the right, the steps 1/48, 1/24, 1/16, 1/12, 1/8, 1/6, 1/4, 1/3, 1/2,
      named in a tooltip on hover - and **never below five laps**, so a step
      that would go under is not offered. Career rounds' races only; a race
      event of the player's own sets its own laps. **Picked per launch**, Full
      every time, and kept nowhere until the launch records it as
      `LaunchRecord.scale`. **The clock runs at the same step**, so 1/48 still
      takes Daytona through the night; **fuel and tyre wear are left alone**,
      so a shortened race simply stops less; and **points pay in full**, Le
      Mans' double included. `scaleLaunch` in `src/core/event/` is the whole
      of it, over `src/shared/utils/race-scale/`. Found on the way: **both
      weather planners set the game's clock to their plan's own multiplier**,
      PURE on every update and Sol on loading its preset, so a plan written at
      1 - which every plan was - took any faster clock back to real time. The
      plan now carries the race's `TIME_MULT`, step lengths staying in session
      time. Read out of their source; `races/spikes/time-multiplier` and
      `time-multiplier-plan` are what driving it confirms, and
      `MAX_TIME_MULTIPLIER` stays a provisional 48 until the first one has
      found where AC itself stops. Agreed in `mockups/race-length.html`
- [x] **Set the AI's strength per round, without editing the championship -
      and record the level actually raced against.** Replaces adaptive
      difficulty, which was dropped: the player chooses, since pace against the
      AI moves with the car and the track. A career takes two steps of its own,
      offsets over the difficulty in settings like every other layer -
      `SeasonEntry.strength` for an edition, set on the championship page, and
      `SeasonEvent.strength` for one round, set on its page - and a race event of
      the Race tab keeps its own race offset open once a session has run, the one
      thing its setup no longer holds still. Strength only; aggression stays the
      championship's. **A step reaches the next session launched**, never one
      already run: an event part-way through keeps the race the slot holds and
      takes only its AI levels afresh, matched by seat through `withLevelsOf`,
      so its weather, its grip and its field stay what it started with; and
      `roundRace` stamps the figure of each class with AI in it on the race as
      `classStrength`, which every `LaunchRecord` carries. So a session's
      result says what it raced at, a finished round lists it per session, and
      Phase 8 has the level an Elo update needs. **A launch from before this
      records nothing**, and shows nothing, rather than guessing. Agreed in
      `mockups/ai-strength.html`, layout B
- [x] **Season summary and history.** A *championship review* once an edition's
      last round has run - the place, the champions per class, the edition in
      figures, the position round by round, the teammate head to head, the final
      tables and the way into the next run - and a *year review* of every edition
      a season entered, which is where a season is finished from while it is
      open. **History** lists every season, newest first. All three are derived
      from the season's own copy of each championship, never stored. **History
      and Results left the navigation**: both are reached from two cards on
      Home, which preview what each holds and live under `/home/`, so Home stays
      lit while either is open. Agreed in `mockups/season-review.html`. The
      boxes the mockup kept for prize money, rating and contract are left for
      the phases that fill them
- [x] **Race weekends of your own, as many as you like.** The Race tab lists
      every weekend set up outside a championship, each kept with its own
      sessions, progress and results, so starting another means adding one
      rather than resetting the last. Opening one shows it the way a round's
      page shows a round - built from the event page's and the championship
      editor's own pieces. Only one launch is ever in flight across all of
      them and the career, since Assetto Corsa runs one game at a time: the
      race store became a slot that a weekend is `load`ed into with what of it
      has run. **A field is one class or several**, each a catalogued grid or
      a list of cars with its own count and AI offsets, laid over the race's
      own offset from the player's difficulty - the step a championship
      states. A quick race is lowered as a one-round championship, so all of
      that is `roundRace`'s. **Picking a car with no classes makes a one-make
      class of it**, and while the race's only class races one car it follows
      whatever car is picked next, its size and strength kept; otherwise the
      car is picked from the player's class and one that stops fitting is
      flagged, never swapped. **A driven session reads back as a
      round's does** - strip, podium, classification - and a multi-class one
      is filtered and placed by class, which multi-class championships get
      too
- [x] **Link a quick race's archives on the Results page back to its race**,
      as a round's link back to its round. Every archive a race event still
      lists is one card however many days its sessions took, its sessions
      named by the race's own, ending in a footer that opens the race on the
      Race tab and says how far it has got; a result's breadcrumb leads back
      the same way. **Only what a race lists now**: one deleted, or started
      over, no longer holds those results, so its archives stay a card of their
      own with no way back rather than opening a race showing other results
- [x] **A race with nothing to line it up says where you start.** Behind a
      qualifying or an earlier race a race session follows it, as a
      championship's does - which session, how many carry over, how many of
      the front are reversed. With nothing before it, `SessionDefinition.start`
      says the player's grid slot - last, pole, a given place or a seeded
      random one - and the championship editor offers it too

## Phase 6 - Career saves

- [x] Career = a folder: `career.json` is the profile every save shares -
      identity, driver, start date and, from slice 3, the slot's settings - and
      `state.json` is the game. Saves are snapshots of the state alone, a file
      each under `careers/<id>/saves/`, kept by `src/main/save-files/`, so
      loading one never touches the profile
- [x] **Career store in main**, following `createSettingsStore`: one live object,
      `career.json` written through debounced, `career:changed` pushed to the
      renderer. **Landed in Phase 5**, because the calendar had to live
      somewhere; what is left here is saves on top of it. It subscribes to the
      race store itself rather than being wired in `main.ts`, because deciding a
      weekend has finished means reading the plan, the progress and the phase
      together - `progressOf` returns null for a finished weekend, so the push
      alone cannot tell one from a weekend that never began - and
      `recordWeekend` is idempotent, since that push arrives again and again
- [x] **Command handlers** rather than patches, each validating before it
      applies. Landed with the store
- [x] Create, name, overwrite and delete saves. **Only named saves**: an
      autosave or the quick save is never written over by hand nor renamed
- [x] Load any older save
- [x] Rolling autosaves after every session **and as each season opens**, the
      first season included, so a career has a save from the moment it is made -
      3 deep by default, snapshots copied from the working state. How many to
      keep is an app setting
- [x] **A career is never hidden.** One whose `state.json` is missing or does not
      read carries on from its newest save; one with nothing left to read - or a
      `career.json` that does not - stays in the Careers list as unreadable, with
      its folder and Delete
- [x] **Unsaved changes ask first.** Loading a save or going to the main menu
      from a page holding unsaved changes - the championship editor - asks before
      anything is loaded or closed
- [x] **One quick save slot**: F5 writes it, F9 loads it - the quick save
      itself, not the latest save of any kind. Ctrl+S is Save as, Ctrl+L Load
- [x] **Loading asks nothing** about the career. A notification says what was
      loaded and where the clock now stands - no warning, no undo. A launch in flight blocks
      loading and Main menu until its result is in
- [x] **Save-scumming policy: neither.** Loading is free and silent - any save,
      any time, nothing recorded
- [x] **Save format with a version field** - the field only. Writing a step that
      reads an older save waits for Phase 14, like every other format here: until
      the app is released an out-of-date save is deleted rather than carried
      forward. See *No schema migrations before the first release* in CLAUDE.md
- [x] Multiple concurrent careers, a folder each under `careers/<id>/`
- [x] **New career setup.** Asks for the driver's name and nation, which move
      from settings onto the career; the year the first season opens; **one
      starting level for every discipline**, rather than a level each; and the
      starting money. The level reaches `Career.level` now. The money and the
      rating that level implies have nothing to land in until Phases 7 and 8,
      so their controls ship working and are stored but **drive nothing yet**
- [x] **A start screen, and three modes.** The app always opens on it:
      **Career**, **Quick race** and **Championship**, beside Settings and
      Exit, with Continue, New and Load under Career. Quick race and
      Championship are for anyone who likes how quickly the app sets an event
      or a season up but does not want the career around it - no economy and
      no ladder to climb. **The Race tab leaves the career**: race events of the
      player's own become the Quick race mode, one list shared by everything.
      A standalone championship is a *slot* like a career, with somewhere of its
      own to keep its season; it waits on saves. It offers only switched-on
      championships and **runs one season, then it is over** - read-only on its
      review, which is also what Continue opens, though its saves still load. A tile per mode on the start screen;
      Load opens **Careers** or **Championships**, two pages alike, with the one
      played last picked. **Inside a slot** the slot's name heads the window and
      opens its menu - quick save, save as, quick load, load, Main menu, Exit -
      and the nav is the career's less the Race tab, or Championship, Results,
      Settings for a championship and Races, Results, Settings for quick races.
      Main menu and Exit never ask
      **A standalone championship is a career of its own kind** -
      `CareerProfile.kind` - kept under `championships/<id>/` rather than
      `careers/<id>/`, so it saves, autosaves, backs up and races exactly as a
      career does. Made by `createChampionship`, it holds one season with the
      year's **first edition** of the championship entered and nothing else on
      its calendar: no historic events, no ladder (it stands on the top rung
      everywhere), no money. Entering, withdrawing and moving the clock are
      refused; launching a later round skips the earlier ones through
      `SkipDialog`, as in a career, and a stand-in races them. A backup restores
      only from the list of its own kind. **A round the install cannot race is
      skipped** from its page, in a career as in a standalone championship, and
      the banner points past it to the next round that can be raced - or, with
      none left, offers to skip the rest and finish
- [x] **Settings on two levels.** Settings keeps a global driver name and
      nation, which pre-fills New career and a new championship and is what a
      quick race races under; inside a slot the same fields edit that slot's own
      pair. **Opponents and driving aids** follow the app unless a career sets
      its own - a switch heading each section, the figures shown dimmed while it
      follows and saying where they part from the app's once it does not - and
      **the calendar is the career's alone**: same-day events and how often a
      season draws historic events left App settings, and a new career starts
      them on the defaults. Inside a slot, Settings switches between the slot's
      own and the app's. A career's settings live in its `career.json`, **beside
      its saves and never in them**, so loading a save changes none of them; a
      standalone championship takes the same opponents and aids switch when it
      lands
- [x] **A career's results live in its folder**, `careers/<id>/results/`, so
      deleting a career takes its results with it. **Results are part of the
      save**: after loading an older one, Results, the standings and History show
      only what was raced up to then. A save copies no results: Results lists
      only the archives the loaded state's launches name, and the abandoned
      timeline's archives stay in the folder, unlisted, until the career goes. Load and Continue tell
      careers apart by the driver's name and flag, the season, the date and what
      was raced last - a career has no name of its own
- [x] **Backup and restore**, a career at a time. Back up writes its folder
      as one zip - profile, state, saves and archived results, which Explorer
      opens - offered from the Careers page and from Delete. Restore is on the
      Careers page - in its header, and in its empty state on a first run,
      which the start screen's Load still reaches with no career to load. It reads the
      backup first and shows what it holds, and asks only when that career is
      here already: keep both, and it comes back as a career of its own, or
      replace what is here. Written whole beside the careers before it moves
      into place, so a restore that fails leaves nothing half done. The zip is
      our own, over `node:zlib`, in `src/main/zip-archive/`
- [x] Archived results linked to career, season and round: a career's archives
      live in its folder, each launch of a round records the archive it wrote,
      and a career's race ids name their season and edition

## Phase 7 - Economy

- [x] Money and a transaction ledger, so every change is explainable.
      `CareerState.ledger`, a line per change, each keyed by what it settles
      so nothing is paid twice, and `money` its sum. **Prizes are owed rather
      than paid by a command**: `payOut` in `src/core/career-money/` works out
      afresh whatever the career has earned and not been paid, and the career
      store's `settle` - which every change ends in - posts it. Read on
      Finances, a Home door at `/home/finances`, with the balance at the
      right of the header on every page of a career
- [x] Currency display: `$` default, `€` and `£` as alternatives, no conversion.
      An app setting in General that a career may override, the way it does
      opponents and driving aids; `useFormat` formats money in whichever is
      in force, so every amount follows it
- [x] **Real-world price list for the whole catalogue**. `CAR_PRICES` in
      `src/shared/utils/car-prices/`, all 419 cars the catalogue names - the
      Kunos cars and every catalogued mod, a renamed replica priced as the
      real car it copies - at what one costs to acquire today: new while it
      is built, what a typical example sells for once it is not, and the cost
      of building one for a works car never sold. Researched car by car, then
      every price pulled to within a quarter of the median of its class and
      generation, so one GT3 generation cannot span $200k to $700k. Each
      figure and its sources are in `car-price-review.md`. Looked up at
      runtime, never cached, and not adjustable
- [x] **Prices for the cars the user adds**: a car switched on in Your
      content goes in at a suggestion - the median of the listed cars sharing
      a spec, else power to weight and age - and a notification offers to set
      its own. Edit price, in Your content alone, shows the rent and repaint a
      price comes to, the suggestion and the listed cars nearest it. Kept in
      `settings.carPrices`; a car already bought sells and repaints on what
      was paid
- [x] **Store page**: the car browser with every card closing on its price
      and its rent a round, Purchase on the card and the row, a price sort,
      a logarithmic price range and switches for what the career owns and
      can afford. The livery is picked, then the purchase confirmed. Tracks
      left a career's navigation: the track browser is only ever a picker
- [x] Buy, sell and own cars. One per model, in a livery the player picks;
      **the Garage** is the car browser over them. A repaint costs 1.5% of the
      price and reaches every round still to come at once. Selling pays the
      price on the day it was bought, 7.5% a year less, a day at a time, never
      under 70%; it is refused while a round is under way in the car, and
      otherwise the rounds left are raced rented. The AI field's liveries no
      longer depend on the player's
- [x] **Rent a car for an event**: entering a championship is owning or renting
      an eligible car. Rent is 2% of the price a round, charged at launch beside
      the entry fee under the same rule - refused when short, nothing for a
      round skipped. Buying the car being rented ends the rent from its next
      round
- [x] Entry fees charged per round, **as its first session launches** and
      only then: a round skipped or missed costs nothing. A launch the career
      cannot pay for is refused, so the balance never goes below zero. A
      historic event costs nothing while the player is invited, which every
      one is until the inbox (Phase 11) brings uninvited entries. Contract
      coverage waits for Phase 9
- [x] Prize money per event and per final championship standing - a
      historic event's purse included. A race pays the player's place in their
      class's purse, a line per race; an edition pays its standing once it has
      run its course; a race the player did not drive pays them nothing
- [x] Progression speed multiplier applied to all earnings. ×0.5 to ×4, a
      career's own - picked in New career, changed in its settings - and
      never applied to fees. Amounts are shown as paid; only the ledger's
      line for a change of speed names the speed
- [x] **Down the ladder when you can't afford to race** - chosen, never
      forced: nothing throws a career out of a championship, and with no
      levels until Phase 8 any cheaper championship is already open to it.
      The Championships page's rail ends in **Can afford next round**, which
      keeps every rung whose next round the career can pay for - its fee and
      the cheapest rent its class allows, nothing for the car when the garage
      holds one it may race - off `career:roundCosts`. Per rung, since rent
      follows the class's cars. A championship with nothing left this year is
      priced on its opening round, which is its next one
- [x] Sell owned cars to recover - the Garage's Sell, which slice 2 already
      allows at any time but while a round is under way in the car. Nothing
      more was wanted: a link to it from a refused launch was built and
      dropped as redundant
- [x] **Start a career on the money New career picked.** The ledger's first
      line

## Phase 8 - Rating and the ladder

Designed in `mockups/rating.html` and agreed with the user before any code.

- [x] **Global rating plus per-discipline ratings** - `src/core/career-rating/`.
      Every race and qualifying driven moves its discipline's rating and a
      global one of its own, each against the same field. Only the player's
      own classmates count, and only sessions the player drove: a stand-in's,
      a simulated round's and a knockout segment invented after elimination
      never move it
- [x] **Elo against a rung-rated field.** A rung's field is rated at the middle
      of its band, and each classmate 75 a point over or under it for the
      strength they raced at **over the player's own Opponents setting** - the
      setting itself never counts, so a comfortable difficulty is not a
      handicap. Each launch records that offset per car as `strengthOver`,
      what was actually raced. K is 300 a race and a qualifying counts a
      quarter, a knockout once, on the order it ends in. **No session takes
      more than a third of what it could give** - 100 a race at ×1 - so a crash
      costs an afternoon rather than a season. A rating never falls below 1 and
      has no ceiling
- [x] **Who a historic event invites.** Anyone, as before - 36 of the 46 events
      are Tier 1, so gating on level would leave a new career none - but its
      race is rated as one on the player's own rung in its discipline, in full,
      so a guest seat is a treat rather than a shortcut, and lifts nothing
- [x] **Weigh a shortened race.** It counts in full: race length moves neither
      the money nor the rating. The log still says a race ran short
- [x] Rating from both who you beat and who beat you
- [x] **Progression speed split in two.** `prizeSpeed` and `ratingSpeed` are
      separate career settings, each ×0.5 to ×4; the rating speed scales every
      change both ways, and each change of it is a line in the rating log
- [x] **Discipline levels derived from rating.** The ladder's floors are
      1,000, 2,000, 3,500, 5,500 and 8,000, each rung 500 wider than the one
      below, so leaving Rookie takes months and Platinum years. A rung opens the
      moment its floor is passed; it is lost only as a season closes below the
      middle of the rung beneath, and an entry already made stands
- [x] **Cross-discipline entry at best level minus one** - `openLevels`,
      derived and never stored. Entering a championship through it lifts that
      discipline's rating to the rung's floor, once, as a line in the log
- [x] **Rating history with a readable explanation of every change** - the
      Rating page at `/home/rating`, Home's fourth door, the header beside the
      balance, a round's own Rating panel with the working behind each line,
      the ladder's row heads and its *Open to you* switch, locked cards greyed
      with what opens them in a tooltip, and a toast when a race opens a rung
- [x] **Start a career on the rating its starting level implies.** New career
      picks one level for every discipline, and each discipline's rating opens
      at the minimum of that level
- [x] **Steel is Rookie**, and a deep green rather than a slate that read as a
      second silver

## Phase 11a - Inbox base

Brought forward from Phase 11, because a contract offer needs somewhere to
arrive and something to answer it from. Built with one real kind of mail behind
it - the historic event invitation - so the model is proven before Phase 9 leans
on it. Designed in `mockups/inbox.html`, agreed on 2026-10-25.

- [x] **Mail is stored in the career's state** and saved and loaded with it:
      when each arrived, whether it has been opened, and for anything that
      wants an answer, the answer and its deadline
- [x] **Inbox is its own entry in the career's navigation**, with an unread
      count on it
- [x] **Every historic event drawn is on the calendar and open to enter**,
      paying its entry fee and bringing a car of its class, rented or bought,
      through the championship round's own Enter panel. It takes the last seat
      of its class, and an event the player is not in is raced without them
- [x] **Historic events gain an entry fee**: a tenth of the winner's purse for
      the ones we ship, and a figure the author enters for their own
- [x] **A class may charge its own fee** over its championship's, as it may pay
      its own purse - a round's own fee still wins over both. The historic
      events we ship charge each class a tenth of its own winner's purse; the
      championships we ship charge each class with a purse of its own the
      championship's fee scaled by that purse's winner against its own, to the
      nearest hundred, so every championship keeps the ratio it was set at
- [x] **An invitation is the free way in**: a team's seat with no fee and no
      rent. It arrives four weeks before the event's day - at once, as the
      year opens, for one falling sooner - and comes with a chance by rung:
      20% at Rookie, 20 more a rung, 100% at Platinum. It offers one car in
      one class, in whichever of the event's disciplines the player holds the
      highest rung, and that rung sets the chance. Classes tied on that rung
      go to the one whose own tier is nearest it, then to the seeded seat draw.
      Entering before invitations go out means paying, and no invitation comes
      after
- [x] **Answering it**: accepting enters it, and so does launching it;
      an accepted one can still be declined until its first session runs. A
      declined or lapsed invitation leaves the event open to enter at full
      cost
- [x] **An unanswered invitation is listed by `SkipDialog`** when moving on
      would pass its day. A declined one stops nothing
- [x] **Mark as unread** is the one action besides answering
- [x] **Every season's mail in one list**, newest first, thirty to a page
- [x] **New mail raises a toast on any page**, one for however many arrived

## Phase 9 - Contracts, teams and the market

Designed in `mockups/contracts.html`, every decision agreed on 2026-10-26, and
the offers' volume and grouping reworked in `mockups/offer-groups.html` on
2026-10-27. In two slices: the first is the whole loop from an offer arriving to a season's
last round, the second what only matters once contracts exist - designed in
`mockups/market.html` and agreed on 2026-10-28.

### Slice 1 - Seats and contracts

- [x] **Contract model: a basis and extras.** The basis is a salary, a free
      seat or a seat the player pays for; a prize share and a standings bonus
      on the player's final class place are terms any contract may carry. One
      season of one championship's edition. Kept on the career as
      `CareerState.contracts`, a season entry raced under one naming it
- [x] **Prize money under contract is the team's, less the player's share** -
      0-100%, posted as the share alone, saying what the whole purse was.
      Racing on your own keeps every dollar
- [x] **Team budgets shaping offers**: each offer's terms are drawn inside its
      budget's ranges. Works teams pay a salary and 20-30% of prizes, often
      with a standings bonus; independents give a free seat, fees covered in
      full or half, 40-60%; privateers sell the seat and leave every prize to
      the player. Amounts scale off the class's own fee and purse; a salary
      follows the prize speed, a seat's price does not
- [x] **Entry fee coverage: full or half.** A fee the team covers moves no
      money and is no line on the ledger
- [x] **Car source per seat: always the team's under contract**, in the seat's
      own livery. The garage stays for racing on your own and historic events
- [x] **Offer generation driven by rating, level and experience**, only from
      classes the ladder already opens - never a rung above:
      - works teams: the top half of the rung and a full edition finished at it,
        15% rising to 45% across that half; 5% short of either
      - independents: from a quarter of the way into the rung, 25% to 50%; 5%
        in the bottom quarter
      - privateers: anyone, 50%
      - a rung below, while the player is in the bottom half of their own rung:
        works 45%, independent 50%, privateer 30%; from halfway up, none
      **How many seats a class has going is drawn first** - 0 to 3 in a
      single-class championship (30/35/25/10%), 0 to 2 in each class of a
      multi-class one (40/40/20%) - then every team draws once at its chance,
      and the best funded of those that call fill them, a seeded draw between
      two of one budget. Seeded on the career and the edition
- [x] **Offer deadlines and a decision window**: offers arrive eight weeks
      before an edition's opener as mail of a new kind, with a fortnight to
      answer; a new career or year gets every offer already due at once.
      **One mail per edition holds all of its offers**, across its classes;
      accepting one declines the rest, and Decline all declines the mail. **Contracts never
      exclude each other** - one in a championship stops no offer in another,
      and several may run at once
- [x] **Paying it**: the salary a round at a time, once the round's last race
      finishes, and nothing for a round not raced; race prizes still land race
      by race. A paid seat is paid in full on signing, refused when short
- [x] **A round not raced under contract** pays no salary and costs a fine of
      its entry fee, listed by `SkipDialog` before moving on. A pay driver is
      never fined, and neither is a round that cannot be raced with what is
      installed
- [x] **Which seat the player takes comes from their contract**: the team's
      slower driver's - the lower season strength of its two, seeded on a tie -
      who stands in for any round the player misses. **Never shown as anyone's
      seat**: to the player it is the team's car
- [x] **Terminate contract**, in place of Withdraw: a release fee of a quarter
      of the fine for each round left, never less than one whole fine, and no
      more salary. A pay driver pays none and gets back half of what the rounds
      left were worth: the seat x rounds left / rounds x 0.5
- [x] **How you are entered decides your car and your rounds.** Through a
      team: its car, every round, fined for missing one. On your own - open in
      every championship, as today through its Enter panel: your car, owned or
      rented, every fee yours, every prize yours, a skipped round free. Entering
      on your own before offers go out means none come for that edition, and
      declines any waiting
- [x] **On your own you race for a team drawn for you**: one of the class's
      teams with two or more cars, drawn per edition and seeded on the career,
      so the Enter panel names it first. The player takes its slower driver's
      seat, and that driver stands in for a round the player misses. A team of
      the player's own was weighed and dropped: its points would be theirs
      alone, and a second car means a driver and a car to pay for
- [x] **A way back from bankruptcy**: whenever offers go out and the player can
      afford no round and owns no car to race, one team at the lowest rung open
      to them offers a free seat with its fees covered
- [x] **No championship is free to enter**: Formula 1, every season, and IROC
      1974 charge a quarter of their race winner's prize a round, as the rest of
      the top rung roughly does
- [x] **Screens**: an edition's seat offers in the inbox side by side - a
      column per team and a row per term, with Before prizes and a last column
      for racing it on your own, one table per class - under a strip opening
      the championship's page; once signed, the signed column tinted and the
      rest muted. Seats on offer heading a championship's sidebar, and the
      contract in place of its Enter panel; who pays the fee and the round's
      salary on a round's page; a banner on Home counting the championships
      with offers waiting, and a contract's team chip on its championship row; Salary, Standings bonus, Seat bought, Seat
      refund, Fine and Release fee as ledger lines of their own, the contract's
      in a violet of their own and the fine in red
- [x] **Budget chips explain themselves** in a tooltip, wherever a team's
      budget shows
- [x] **A historic invitation names the team alone**, never whose seat it is

### Slice 2 - The market

Every contract stays one season - a championship's run, which the screens call
a season and the code an edition. Contracts over several seasons were weighed
and dropped: renewal carries a good partnership on without locking the player
in when a better team calls.

- [x] **What keeps you on, stated as signed**: a works team wants the top
      third of the class or a finish ahead of the teammate, an independent the
      top half or ahead of the teammate, a privateer nothing - fixed as a place
      off the class's size when the offer is drawn, and shown on the contract
      card all season with where the player and their teammate stand, On course
      or Short of it
- [x] **Renewal comes with the next season's offers**: judged on the day they
      are drawn, on the class table as it stands - final for a yearly
      championship, part-way for one that runs more often. Met, the team's
      offer leads the season's offer mail as Your team, beside whoever else
      calls and taking no seat from them; terminated, withdrawn or out of the
      class, or the class no longer open to the player, no renewal. A team that
      has not yet seen the player race in a run still under way keeps them on.
      The clock jumped past the next season's opener skips
      the decision, as it skips that season's offers: the contract simply reads
      as completed
- [x] **Renewal terms move with the result**: works teams' salary up 25% for
      the class title and 10% for a podium, the bonus following it; an
      independent on a podium covers every fee rather than half and leaves 5
      points more of the prizes, to 60%; a privateer asks what the seat cost.
      Otherwise the terms are the contract's own; a seat bought part-way
      through renews for a whole season at what it cost a round. Declined or
      lapsed, the partnership ends
- [x] **Team news**: a mail kind with no reply, telling the player their team
      is not keeping them on - what it asked and where they finished
- [x] **Buying a seat**: a tab in a championship's Enter panel beside "Your
      car", listing every privateer fielding two or more cars in the class, its
      slower seat at 1.3-1.5x the season's fees, seeded on the career and the
      season, priced on the rounds left once the season has begun. Works teams
      and independents never sell. A pay driver's contract - fees covered, every
      prize the player's, no fine - signed at once through a mail written
      already accepted, so Read the offer opens it. A team whose offer waits
      shows the offer instead
- [x] **A Contracts page** at `/home/contracts`, a fifth door on Home: what
      the contract came to and cost, every contract held now with what keeps
      the player on, and every contract signed, season by season, with how it
      ended - Completed, Renewed, Not kept on or Terminated
- [ ] Left for later: another team buying the player out of a contract

## Phase 10 - Sponsors

Designed in `mockups/sponsors.html`, every decision agreed on 2026-10-31. A
contract is a seat; a sponsor backs the driver, across every championship,
whether racing for a team or on their own. In two slices: the first the whole
loop from an offer to a deal's year running out, the second the perks that
reach into other systems, and renewal.

### Slice 1 - Sponsors

- [x] **Slots by rung**: a main sponsor and a partner at Rookie, a partner more
      each rung - a main sponsor and five partners at Platinum - counted on the
      career's best rung in any discipline. A slot lost on a drop of rung keeps
      its deal until that deal's year runs out
- [x] **No sponsor opens a rung above**: the ladder stays the only way up, so
      nothing reconciles a sponsor with it
- [x] **Offers come from racing well**, never on a date: after every round
      raced, one seeded draw at the chance the player's form sets - their
      average class finish over the last three rounds: 5% in the bottom
      quarter, 12% the lower half, 22% the upper half, 35% the top quarter,
      and 15% more for a class win, 25% for a class title or a new rung. A main
      sponsor writes only from the upper half. An offer is for a free slot where
      there is one; a full slot never stops one, but an offer to replace comes at
      half the chance
- [x] **The rating sets how good an offer is**, read in the discipline it
      covers as it is drawn: the bottom quarter of a rung draws x0.8 and the
      basic perks, the middle x1.0 and the whole pool, the top quarter x1.3, a
      perk more and the strongest likelier
- [x] **Every deal is drawn from a pool**, leaning on a trade - oil, tyres,
      technology, drinks, watches, insurance and finance, motor parts, car
      dealers, clothing - and named off that trade's book, seeded on the career.
      No two sponsors of one trade at once. Nothing is ever paid to a sponsor
- [x] **What a deal covers**: a discipline, or any racing - every race started
      in it, any championship, historic events included
- [x] **Its target, judged on every race** - or every qualifying, for a
      qualifying target: a class place (top half to top quarter), a qualifying
      place, beating the teammate, clean racing (2 to 4 cut laps at most), or
      just racing. Short of it, that race pays nothing - a main sponsor half -
      and nothing else follows. No strikes
- [x] **Its goal, one a deal for its year**: a championship place, a count of
      class podiums, wins or poles, on target in a share of its races, or races
      started. Met, the sponsor offers to renew; missed, the deal ends on its
      anniversary. Nothing ends a deal early
- [x] **The money perks**, every figure scaled by the rung's typical entry fee
      ($700 a round at Rookie to $25,000 at Platinum) and the prize speed: race
      pay; a signing bonus and a goal bonus, a main sponsor's alone; win, podium,
      points and pole bonuses; a prize match on every prize paid. Each figure is
      drawn inside its perk's range for the slot, nearer the top for a better
      rating and a harder target and goal
- [x] **A main sponsor is better and rarer**: several times a partner's money,
      and one **signature perk** on every offer, on top of its budget -
      **Championship covered** (every entry fee of one championship it names),
      **Climbs with you** (its figures rise to a new rung's), or **Car purchase
      backing** (half of one car bought that races on the player's rung or
      below - in the discipline the deal covers, on its own rung, for a deal
      covering one - once a deal year)
- [x] **A deal runs a year** from the day it is signed. Ending one yourself, or
      replacing it, is free but repays the share of a signing bonus its year has
      left
- [x] **One mail per offer**, open a month, then it lapses: its terms, and for
      a filled slot the deal it would replace beside it. **Sponsor news** when a
      deal ends with its goal missed. A sponsor's mail opens the Sponsors page
- [x] **Paying it**: `payOut` works out every line owed, as prizes are - race
      pay and results bonuses race by race, a goal bonus on the anniversary -
      keyed by deal, perk and session. Ledger kinds Sponsor and Sponsor bonus
- [x] **Screens**: a Sponsors page at `/home/sponsors`, a sixth door on Home,
      three by two - compact cards, a price and its condition to a line, each
      goal On course or Short of it, locked slots a slim row, History on a tab of
      its own; a round's page lists each sponsor's prices and conditions, and
      what each session paid once run. Main sponsors wear the sponsor pink,
      partners a cyan of their own

### Slice 2 - More perks, and renewal

Designed in `mockups/sponsor-perks.html`, every decision agreed on 2026-11-07.

- [x] **Backing is the player's to use**: seat and car purchase backing are never
      spent on their own. Buying asks, with a switch that starts off, in the
      purchase dialog, in Buy a seat and on a privateer's offer. A car only backing
      puts in reach stays open to buy; the dialog says how short the player is
      until the switch is on. A sparkle beside a price says what backing can pay,
      in a tooltip, on a car and on a seat for sale, and a sponsor's card says
      whether it is Available or Used
- [x] **Seat backing**: half of one seat at a time, in a championship of the
      discipline it covers, on the player's rung or below. It frees up as that
      championship's season finishes, terminated or not, so a quarter-length
      championship can use it several times a year. A refund is on what the
      player paid
- [x] **Car reward**: named on the offer, a car racing on the highest rung open
      to the player in what the deal covers, its picture and a link to its page
      on the offer and the renewal. It arrives the day the goal is met, in its
      first livery, with a mail, and sells for three goal bonuses. A goal only
      settled at the end - on target in a share of races - is met on the
      anniversary. A car the install no longer has, or one already owned, pays
      what it would sell for
- [x] **The goal bonus** pays the day the goal is met, with the car
- [x] **Seat offer perks**, on either slot: Team interest (seat offers likelier, a
      fifth, a partner's a tenth), Works team interest (works teams likelier, a
      third, a partner's a sixth - and a works seat before the player is ready
      rises from 5% to 10%, a partner's to 7.5%), Better terms (a works salary up a
      fifth, a partner's a tenth; an independent's fee cover a step up, a main
      sponsor's alone; a privateer's seat a fifth cheaper, a partner's a tenth -
      renewals included, seats for sale not). Nothing on a seat offer says so
- [x] **Partners' perks**: entry fee share and rent share, taken off the cost,
      the launch note, the Enter panel's figure and the Finances line saying why,
      and free repaints. Historic
      invitations likelier, on either slot, the chance simply reading higher
- [x] **Everything adds**: shares, chances and terms, a share stopping at what the
      player pays and a chance at certain
- [x] **An It helps row** on an offer and under a card's prices, for what pays
      nothing
- [x] **Renewal**: a deal ends on its anniversary, and with its goal met its
      sponsor asks to renew, open a month, nothing paying meanwhile. The same perks,
      target and goal; each figure drawn again at the rating and rung then, never
      down, each changed one saying what it was; a signing bonus again, Climbs with
      you from the new rung, a new car. Its slot stands free and says who is
      asking. Renew is held, the mail saying why, while no slot is free. **A Renewal
      tag** on a renewal's mail, a sponsor's and a team's alike
- [x] **A deal that climbs says so**, on its card and in a mail

### Slice 3 - Real sponsors

Designed in `mockups/sponsor-logos.html`, agreed on 2026-11-10. Every brand and
where its logo came from is in `sponsor-review.md`.

- [x] **A book of real companies**: 314 brands that have backed motorsport, in
      place of the invented names, each with its nation
- [x] **A tenth trade, Travel and logistics**: airlines, hotels, ferries, freight
      and couriers, offering championship cover or seat backing, invitations,
      points and wins, for starting races or a championship place. Tobacco stays
      out
- [x] **Size decides the rung**: a global brand writes only at Gold and
      Platinum, a major one from Bronze to Platinum, a specialist from Rookie to
      Silver. Every trade has at least ten brands open at every rung
- [x] **Logos**: 170 of them, public domain or CC0, shown on a light plate ringed
      in the slot's colour, wider than tall and with no trade icon. A brand with
      none keeps its initials and its trade icon, widened to the same size

## Phase 11 - Inbox

The message model, the screen and event invitations moved ahead of Phase 9 as
*Phase 11a - Inbox base*. What is left builds on it.

Designed in `mockups/inbox-news.html`, every decision agreed on 2026-11-12.
Nothing here wants an answer: each new kind is read, linked to where it
happened, and filed.

- [x] **People write mail**: a team's race engineer and its boss are drawn once
      off the name books, seeded on the career, the championship and the team, so
      a team keeps the same people season after season. The boss is a works
      team's team principal, an independent's team manager and a privateer's team
      owner. Each mail copies in who wrote it
- [x] **A debrief after every round you drive**, from the engineer of the team
      you race for - under contract, the drawn team on your own, the team whose
      seat a historic event gives you. One mail once the round's last session has
      run, or once its day has passed for one left part-way. Qualifying and races
      only, never practice, and no cut laps: each session's grid, finish in the
      class, best lap and its gap to the class's best, the teammate by name and the
      points; the championship after it, and the next round. No money
- [x] **Team news as a contract runs**: a welcome as it is signed - the car, the
      engineer, the teammate and what keeps the player on - a halfway word where a
      place keeps them on, On course or Short of it, and a round missed with its
      fine and how the reserve driver did. Terminating sends nothing. Not kept on
      stays as it is
- [x] **A championship's result** as each edition raced in has run its course:
      from the team's boss under contract, with the teammate and the teams'
      table, from the organisers on the player's own. The final place, the top of
      the table, what it paid and the review. A historic event has its debrief alone
- [x] **Categorisation**: a rung opened and a rung lost, by mail too, worded as
      Home's banner, which stays with its toast
- [x] **Market news**: every privateer seat for sale on the player's rungs as each
      season opens, cheapest first. No mail about works teams watching - the first
      works offer is the news - and no paddock digest
- [x] **Days left on an answer's chip**: Awaiting reads how long is left from a
      fortnight out
- [x] **The rail** gains a folder a kind - Debriefs, Results, Categorisation and
      Market - and new mail raises the one toast any mail does
- [x] **Colours**: a debrief on teal 175 and a championship's result on laurel 110,
      touring's and sportscar's hues, which the inbox never shows; team and market
      news on the contract violet; a rung by its tier's metal
- [x] **Earlier phases into the inbox through one door**: `deliver` in the career
      store, which drops an id the inbox holds and keeps it ordered by arrival.
      News is sent only for what happens from the day a career first reads it
- [x] **Reserve driver, never stand-in**, wherever the app says who raced a round
      the player missed

## Phase 12 - Real results (CSP Lua recorder)

- [ ] CSP Lua app in `assettocorsa/apps/lua` recording live session state
- [ ] Authoritative results to a handoff JSON the desktop app reads
- [ ] Finishing positions, retirements, incidents, pit stops, compounds, damage
- [ ] Reconcile with `race_out.json`; prefer the recorder when both exist
- [ ] Keep inference working for users without the plugin
- [ ] Unlocks repair costs as an economic sink

## Phase 13 - Customization and settings

- [ ] Settings UI: paths, CM flags, units (`USE_MPH`), theme, language, currency
- [x] **A table view for the Championships tab in settings**, beside its cards,
      through the same `ViewToggle` the car and track browsers have - a
      library of 130-odd championships is easier to manage a row at a time.
      What is missing or misconfigured is a tooltip on the row's state chip,
      and the Championship and Ladder headings sort as the sort menu does
- [ ] Progression speed, with the career flagged when it changes
- [ ] Autosave count and save behaviour
- [ ] Difficulty profiles (AI level, assists, damage, tyre wear, fuel rate).
      **AI strength and aggression landed in Phase 5** as `settings.opponents`,
      the base every championship's offsets are laid over, with a step of the
      player's own per season or round of the career on top
- [ ] Economy tuning: prize and fee multipliers, starting money, price overrides
- [ ] **Weather system**: PURE, Sol or none, chosen once. Decides who renders
      static weather and which planner a dynamic race drives. "None" is CSP's
      `base` controller, which has no rain FX and so means no rain ever
- [ ] **Generated weather plans** for PURE Planner and Sol Planner, so dynamic
      weather is ours rather than whatever the user last set. See *Weather, and
      how dynamic weather is actually driven* for both file formats and both
      autoload hooks. Wants a spike per system first, and has to be honest that
      it writes into the user's mod folders and overwrites a plan slot of theirs
- [ ] Weather preset management; surface that installing touches the AC folder
- [ ] Warn that `__CM_WEATHER_CONTROLLER` overrides the user's `weather_fx.ini`
- [ ] Uninstall/cleanup: remove career weathers, restore CM arguments

## Phase 14 - Distribution

- [ ] `electron-builder` packaging, Windows installer
- [ ] **Code signing certificate** - an unsigned Electron app that reads game
      folders and spawns processes gets flagged constantly
- [ ] Auto-update, crash reporting
- [ ] **Decide whether real sponsors ship.** A logo's free licence covers the
      file, not the trademark, and an offer from a real company implies an
      endorsement it never gave. Every logo is in
      `src/renderer/src/assets/sponsors/`, and a sponsor without one shows its
      initials, so taking them out is deleting that folder; the names are
      `SPONSOR_BOOK` in `src/core/sponsor-offers/sponsor-book.ts`
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
- ~~**Sponsors, in detail.**~~ Settled in Phase 10: a main sponsor and one to
  five partners by rung, nothing above the ladder, a target judged race by race
  and a goal for each deal's year, and deals a year long from signing.
- **Default exclusivity.** Are most contracts permissive, with only top teams
  locking you in? This sets how much multi-series racing feels normal.
- ~~**Event scheduling.**~~ Settled: historic events are placed by the
  career, on weekdays and on a day it races nothing else where it can; a clash
  that remains is a clash like any other.
- **Car condition and maintenance.** Needs damage data from Phase 12, and risks
  feeling like admin.
- **Reputation as a separate axis from rating** - covering reliability and
  behaviour rather than pace?
