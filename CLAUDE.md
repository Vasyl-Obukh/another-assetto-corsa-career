# Assetto Corsa Career Mode

## What this is

A career mode application for Assetto Corsa, in the spirit of *Zero to Apex* for
Automobilista 2: structured championships with progression, standings and
persistent results, wrapped around races the user actually drives.

The defining feature is **user-authored racing series**. Users create their own
championships from any installed content — including car and track mods — or
extend existing series with extra rounds and entrants. Series data is our own
JSON format; AC's native `content/career/<SERIES>/series.ini` is deliberately
not used, being rigid and tied to the vanilla launcher's progression.

Races launch through **Content Manager**, never by running `acs.exe` directly.
That is what keeps CSP, PURE, rain FX and other mods working: CM's `GameWrapper`
runs a preparation pass (CSP configs, weather controllers, track properties,
car-specific controls, starter selection) before the game starts. Bypassing it
breaks all of that.

## Stack

- **Node.js 24+** for all integration logic — the entire surface is file I/O and
  process launches.
- **TypeScript**, run directly by Node's native type stripping. Nothing is
  compiled: `node spike.ts` just works, and `tsc` is typecheck-only
  (`noEmit`). Relative imports therefore keep their `.ts` extension, and
  `erasableSyntaxOnly` blocks syntax stripping cannot handle (enums, namespaces,
  parameter properties) — use unions and plain objects instead.
- **Electron** for the desktop UI. Windows-only, since AC and CM are.
- **ESLint** with the Airbnb config (`eslint-config-airbnb-extended`, the flat-config
  continuation of `eslint-config-airbnb-base`) plus typescript-eslint.
- Zero *runtime* dependencies so far; keep it that way unless something earns
  its place.

Node 24 is a hard floor, not a preference — native `.ts` execution and
`import.meta.dirname` both require it.

Electron's idle cost matters here: the app sits alongside a running game. Hide
the window or drop to a tray process while a race is live rather than leaving a
renderer burning frames in the background.

```
npm run scan   npm run dry   npm run race   npm run watch
npm run check     # typecheck + lint
npm run lint:fix
```

## How the integration works

```
races/*.json  ->  race.ini  ->  acmanager://race/config  ->  CM  ->  AC
                                                                     |
data/results/*.json  <-  summarise()  <-  out/race_out.json  <--------+
```

1. `src/content.js` scans installed cars, tracks, weathers and CSP weather
   controllers. IDs are folder names, so mods are first-class.
2. `src/raceIni.js` turns a race definition into AC's `race.ini`.
3. `src/launch.js` base64-encodes it and spawns CM with an `acmanager://` URI.
4. `src/results.js` watches `Documents\Assetto Corsa\out\race_out.json`, which
   is overwritten every session, and archives it before the next race.

## Layout

| Path | Purpose |
| --- | --- |
| `spike.ts` | CLI proving the round trip: `scan`, `dry`, `run`, `watch`, `weather`, `testmode` |
| `src/types.ts` | Shared domain types: content, race definitions, `race_out.json` |
| `src/paths.ts` | Discovers CM's exe, the AC root and AC's Documents folder |
| `src/content.ts` | Scans installed content; lenient about malformed mod JSON |
| `src/raceIni.ts` | Race definition -> `race.ini` |
| `src/launch.ts` | Cut-base64, URI construction, spawning CM |
| `src/results.ts` | Watching, stable-reading and summarising results |
| `src/weather.ts` | Career weather presets installed into AC's content folder |
| `src/ini.ts` | Minimal INI reader/writer for AC's flavour |
| `races/*.json` | Race definitions in our own format |

## Verifying changes to race.ini

Content Manager can write `race.ini` without launching the game, which gives an
authoritative reference:

1. Put `--enable-race-ini-test-mode` in CM's `Arguments.txt`
   (`%LOCALAPPDATA%\AcTools Content Manager\Arguments.txt`), one flag per line.
2. Set the same race up in CM's Quick Drive and hit Go — nothing launches.
3. Diff `out\race.ini` against `Documents\Assetto Corsa\cfg\race.ini`.
4. Remove the flag afterwards or CM will never launch a race again.

`node spike.ts testmode` prints this with the paths filled in.

When a launch misbehaves, `cfg\race.ini` immediately afterwards is the fastest
diagnostic — it is what CM actually handed AC, rather than what we intended.

## Conventions

**Style.** Airbnb via ESLint; run `npm run check` before committing. The only
deliberate departures are in `eslint.config.js`, each with a reason next to it.

**Comments.** Keep them short — a line or two. Write a longer explanation only
where the implementation is genuinely non-obvious: a protocol quirk, a value
derived from another program's source, a workaround whose reason is invisible
from the code. Do not narrate what the code already says, and do not leave
tutorial-style block comments on ordinary functions.

**Failure modes.** Prefer failing loudly at validation time over letting AC or
CSP fail confusingly later. Several of this project's integration points fail
*silently* — the wrong weather controller just produces the wrong weather, with
no error anywhere — so validate against installed content before launching.

**Mod tolerance.** Anything reading content files must assume malformed input.
Skip the entry, never throw.

## Known gaps

- Results carry no positions or DNFs; standings are derived by sorting on
  laps-then-total-time and are untested against retirements or lapped cars.
- Assists cannot be set through `race/config` yet — CM wants its own serialized
  preset format there, not an `assists.ini`.
- Only single-session races are proven. Multi-session practice/qualify/race is
  generated but unverified, including whether qualifying sets the grid.
- Road temperature is an approximation of Kunos' curve.
- `__CM_WEATHER_CONTROLLER` overrides the user's own `weather_fx.ini` for the
  race and does not restore it. Correct for a career, but should be surfaced in
  the UI rather than done silently.
- Career weather presets are written into the AC install (`content/weather/`)
  and stay until `node spike.ts weather remove`.
