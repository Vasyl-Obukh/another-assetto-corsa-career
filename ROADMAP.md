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

What is left of the reshaping is **dynamic weather as generated plans** handed to
PURE Planner or Sol Planner, whose file formats and autoload hooks are recorded
in *Weather, and how dynamic weather is actually driven*, and the single
**weather system setting** that goes with it. Still outstanding beyond those:
assists, the road-temperature curve, and writing Content Manager's
`Arguments.txt`.

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

### Weekends and sessions

A weekend is an **ordered list of sessions**, authored per series - three
practices and two qualifyings if that is the format, or practice, sprint
qualifying, sprint, grand prix qualifying, grand prix.

Sessions carry a **day offset**. Weekends run up to three days (Friday to
Sunday); races fall on Saturday or Sunday and never Friday. One-off and historic
events should prefer weekdays so they don't collide with championship rounds.

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

Rating moves on results, weighted by the **tier being raced** and by the
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
      blocker, and that is what has gone
- [x] **Translate `ContentIssueReason` in the renderer** - the broken-content
      count on the content card is now a popover listing every broken entry
      grouped by reason, off the `content:issues` channel that had been wired end
      to end and never called. The English wording moved to
      `src/shared/constants/`, so the CLI and the app read one table rather than
      two

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
- [ ] Resolve the assists question so regulations can be enforced. **CM's own
      preset format has since been found**: a saved Quick Drive `.cmpreset` on
      this machine carries `"AssistsData":"{\"IdealLine\":false,\"Abs\":1,\"Damage\":100.0,...}"`
      - JSON, not the `assists.ini` `buildAssistsIni` renders. That is what
      `buildRaceUri`'s unused `assistsPreset` argument wants
- [ ] Replace the road-temperature approximation with Kunos' curve
- [ ] Offer to write CM's `Arguments.txt` (`--skip-all-results`,
      `--hide-race-cancel-button`)

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

### Running a weekend

`npm run weekend -- <name>` runs the next launch that has not been run, waits
for it, archives the result and remembers what it produced, so the launch after
it inherits the grid. `--status` prints the plan without launching anything and
`--reset` forgets the progress. Progress lives in `data/weekends/`, which is the
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
`data/results/` and `data/weekends/`: the state machine is pure, and each caller
persists it its own way. Editing a weekend that has already started discards its
progress, because a launch inherits its grid from the one before and that
inheritance means nothing once the sessions have changed underneath it - so the
setup screen locks itself once a launch has run and offers to start again.

## Phase 4 - Series, teams and the editor

- [ ] Series schema: discipline, rounds, weekend format, regulations, points,
      BoP - the tier sits on the class entry below, not here
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
- [ ] **Multi-class entries** - one championship, one calendar, and one *class
      entry* per class it runs, each carrying its own tier, its own eligibility
      and its own standings table. WEC is the case: Hypercar, LMP2 and LMGT3
      entered separately, the GT3 entry a tier below the prototypes. A different
      axis from the per-round override above - that varies the car across the
      calendar, this varies it across the grid
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
- [x] **Per-session conditions** - landed early with one session per launch, in
      Phase 3. A session is a whole `race.ini`, so it carries its own weather,
      wind, temperature, track state and start time, overriding the weekend's
      defaults field by field
- [ ] Per-round conditions as part of a **series format**, which is what is left
      of the above: the round owning the conditions rather than the weekend
- [ ] **Generated weather for shipped championships.** Hand-authored weekends use
      weekend defaults plus per-session overrides, which is what keeps building a
      deliberate weekend easy. The championships we ship do the opposite: they
      generate a weather per session and write it as a full override on each.
      **Generated by our own rules and probabilities, not by PURE's or Sol's own
      randomisation**, which produces too many extremes for a career - a series
      wants a wet round now and again, not a tornado
- [ ] **A weather forecast.** The whole event's weather is generated once, when
      the calendar first reaches the event's opening day, and shown to the player
      before they run anything. That is what makes generated weather a feature
      rather than a surprise, and it constrains the generator: it has to be
      deterministic and stored on the event, not rolled per launch, or the
      forecast and the race would disagree
- [ ] **Make track grip weather-aware**, alongside the above - and **now
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
      across a wet session
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
