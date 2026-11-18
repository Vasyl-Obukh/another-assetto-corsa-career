# Another Assetto Corsa Career

A career mode for Assetto Corsa: work your way up a ladder of real championships,
season after season, with standings, prize money, contracts, sponsors and a rating
that follow every race you drive.

Every race is launched through Content Manager, so Custom Shaders Patch, rain and
your weather mod all work just as they do in a race you set up yourself. Championships
are built from whatever you have installed, DLC and mods included, and you can write
your own.

![Career home](docs/screenshots/home.png)

## Contents

- [Requirements](#requirements)
- [Installing](#installing)
- [First run](#first-run)
- [Features](#features)
- [Good to know](#good-to-know)
- [Building from source](#building-from-source)
- [License](#license)

## Requirements

| What                                                                                            | Needed               | Notes                                                                                                  |
|-------------------------------------------------------------------------------------------------|----------------------|--------------------------------------------------------------------------------------------------------|
| Windows 10 or 11, 64-bit                                                                        | Yes                  | The app is Windows-only, like Content Manager.                                                         |
| [Assetto Corsa](https://store.steampowered.com/app/244210/)                                     | Yes                  | The Steam version. The base game alone is enough for a full career.                                    |
| [Content Manager](https://acstuff.club/app/)                                                    | Yes                  | Every race is started through it, never by running the game directly.                                  |
| [Custom Shaders Patch](https://acstuff.club/patch/)                                             | Strongly recommended | Installed from Content Manager's settings. Rain and wet roads come from CSP itself.                    |
| [PURE](http://patreon.com/cw/peterboese) or [Sol](https://www.overtake.gg/downloads/sol.24914/) | Optional             | CSP weather controllers. Either one gives you weather that changes during a session.                   |
| PURE Planner or Sol Planner                                                                     | Optional             | Only for changing weather: the app writes a plan for the planner app to play, so it has to be running. |
| DLC packs and mods                                                                              | Optional             | They add championships to the ladder; they never fill holes in it.                                     |

### Weather

Pick what renders your weather once, in **Settings > General > Weather**:

- **Custom Shaders Patch only** - rain and wet roads work, but each session keeps
  the weather it starts with.
- **PURE** or **Sol** - rain, wet roads and weather that changes mid-session,
  driven by the planner app.

Under the same heading you choose which weather types championships may draw.
Anything you leave out is swapped for the nearest type you allow, so a wet round
stays wet.

![Weather settings](docs/screenshots/settings-weather.png)

> **A car or track that cannot handle rain?** Many mods, and some older content,
> have no wet-weather support. Turn off **Allow rain** to keep them dry:
>
> - **For a championship or historic event everywhere:** in its editor, under
>   **Overview**.
> - **For one season of a career:** on the page of a championship you have
>   entered, under **Wet weather**.
> - **For a single round or historic event:** on its page once you have entered,
>   under **Wet weather**, until its first session has run.
>
> Any wet weather drawn for those rounds is raced as overcast instead. The forecast
> itself is kept, so turning rain back on brings it back.

### DLC and mods

The ladder is complete on the base game. Each Kunos DLC pack and each mod team the
app knows about adds championships of its own:

| Source                                                                                     | Where to get it                                                                   |
|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| Kunos DLC packs (Dream Packs, Japanese, Tripl3, Red, Porsche, Ready To Race, Ferrari 70th) | [Steam](https://store.steampowered.com/app/244210/)                               |
| Race Sim Studio (RSS)                                                                      | [store.racesimstudio.com](https://store.racesimstudio.com/)                       |
| Virtual Racing Cars (VRC)                                                                  | [virtual-racing-cars.com](https://www.virtual-racing-cars.com/assetto-corsa/)     |
| United Racing Design (URD)                                                                 | [shop.unitedracingdesign.com](https://shop.unitedracingdesign.com/assetto-corsa/) |
| First Studio Racing (FSR)                                                                  | [Patreon](https://www.patreon.com/firststudio)                                    |
| Guerilla Mods                                                                              | [Patreon](https://www.patreon.com/c/guerilla)                                     |
| Yezhrod                                                                                    | [Patreon](https://www.patreon.com/yezhrod)                                        |
| Low Fuel Motorsport content pack                                                           | [LFM app](https://lowfuelmotorsport.com/lfmapp)                                   |

Switch on what you own in **Settings > Content sources**. A switch only decides
which championships are offered - your cars and tracks stay in the library either
way - and every row links to where that content is sold.

![Content sources](docs/screenshots/settings-sources.png)

Any other mod is welcome too. The app lists only the cars and tracks its catalogue
recognises, and **Settings > Your content** puts the rest in the library, at a
suggested price you can change.

## Installing

1. Download `another-assetto-corsa-career-setup-<version>.exe` from the
   [latest release](https://github.com/Vasyl-Obukh/another-assetto-corsa-career/releases/latest).
2. Run it. The installer is not code-signed yet, so Windows SmartScreen may say it
   "protected your PC": choose **More info > Run anyway**.
3. Install for yourself (the default, no administrator needed) or for every user,
   and pick a folder if you like.

The app checks GitHub for new versions and asks before downloading one. Turn that
off in **Settings > General > Updates**.

Careers, settings and the content cache live in
`%APPDATA%\another-assetto-corsa-career\`. Uninstalling leaves them where they are.

## First run

A short setup walks you through five steps:

1. **Find Assetto Corsa** - where Content Manager, Assetto Corsa and its Documents
   folder are. They are found from the registry and Steam; correct anything that
   is wrong.
2. **Scan your content** - every car, track and weather you have installed, mods
   included.
3. **Make it yours** - your name, the AI's strength and the app's look.
4. **Content sources** - the DLC and mods you own.
5. **Tracks** - a track of yours for each recommended layout the app did not find.

Everything here can be changed later in Settings, and **Settings > Diagnostics**
shows what was found and what is broken.

## Features

### Three ways to play

- **Career** - start at the bottom of the ladder and climb it, racing as many
  championships at once as the calendar allows.
- **Quick race** - any cars, any track, any sessions, outside any championship.
- **Championship** - one championship from the library for one season, with the
  car you pick. No ladder and no money.

![Start screen](docs/screenshots/start.jpg)

### Championships

The app ships 190+ championships across four disciplines - single-seater,
sportscar, touring and road - laid out as a ladder of five tiers, from Rookie
to Platinum. Each has its own calendar, event formats (practice, qualifying, one
race or several, reversed grids, multi-class fields), points, prize money and
entry fees.

![Championships ladder](docs/screenshots/championships.png)

A championship's page has its rounds, the standings round by round, its classes
and teams, and its points, prizes and rules.

![A championship's rounds](docs/screenshots/championship.png)

![Standings](docs/screenshots/standings.png)

### Race weekends

A round is a weekend of sessions spread over several days. Each session is
launched on its own, with its own weather, temperature, track grip and start time,
and the grid carries from one session to the next. Rounds you do not drive are
raced by the field, with a reserve driver in your seat.

![A round](docs/screenshots/event.png)

### The calendar

Every championship and historic event of the season, day by day or as a month,
filtered by discipline and by what you can enter. Starting a session dated later
than today moves the career's clock; **Advance** moves it without racing.

![Calendar](docs/screenshots/calendar.png)

### Historic events

46 one-off races from motor racing history - the 24 Hours of Le Mans 1969, the
Italian Grand Prix 1957 and the like - drawn into each season. An invitation is
the free way in; otherwise pay the entry fee and rent or buy a car of its class.

![A historic event](docs/screenshots/historic-event.png)

### Results

Every session you drive is classified from Assetto Corsa's own results: positions,
best laps, and gaps, archived for good.

![A result](docs/screenshots/result.png)

### Inbox

Seat offers, sponsor offers, invitations, debriefs from your team and paddock news
arrive as mail, and the ones that need an answer are answered from there.

![Inbox](docs/screenshots/inbox-mail.png)

### Contracts and sponsors

Teams offer seats - salaried drives, free seats and paid seats - and judge at the
end of the season whether to keep you. Sponsors pay per start, per result
and for meeting a season goal, and more sponsor slots open as you climb.

![Contracts](docs/screenshots/contracts.png)

![Sponsors](docs/screenshots/sponsors.png)

### Money and rating

Prize money, entry fees, rentals, car purchases, contracts and sponsors all go
through one ledger. Your rating moves with every race and qualifying session, on
who you beat in your class, and opens each tier of the ladder discipline by
discipline. A career's prize and rating speed can be set anywhere from 0.5x to 4x.

![Finances](docs/screenshots/finances.png)

![Rating](docs/screenshots/rating.png)

### Store and garage

Every car in your library has a price, real-world for the catalogued ones. Buy a
car or rent one for a championship, repaint or sell what you own, and catch the
weekly sale.

![Store](docs/screenshots/store.png)

![Garage](docs/screenshots/garage.png)

### History

Each season gets a review of its championships, titles, wins and historic events,
and each championship a review of its own.

![Year review](docs/screenshots/year-review.png)

### Saves

Rolling autosaves after every session, a quick save on F5 and named saves on
Ctrl+S, with Quick load on F9. Loading any save is free, and a whole career can
be backed up to a zip.

### Quick race

Set up a field of one or more classes at any track, with any sessions, weather and
rules, and launch it. Results land in the same archive as everything else.

![Quick race](docs/screenshots/quick-race-event.png)

### Championship editor

Edit any championship - the app's own are copied first, and **Revert** brings the
original back - or build one from scratch: classes from a spec or a list of cars,
teams and drivers, the calendar, event formats, points, prize money and rules.
Championships are plain JSON files and can be exported and imported.

![Editor - classes](docs/screenshots/editor-classes.png)

![Editor - event formats](docs/screenshots/editor-formats.png)

![Editor - calendar](docs/screenshots/editor-calendar.png)

The library of championships and historic events lives in Settings, where each can
be switched on or off.

![Championship library](docs/screenshots/settings-championships.png)

![Historic events library](docs/screenshots/settings-historic.png)

### Your content

Mods the catalogue does not know are switched on here, so they appear in the
library, the pickers and the editor.

![Your content](docs/screenshots/settings-content.png)

### Everything else

- Light and dark themes, in English and Ukrainian.
- Metric, UK or US units, and money in dollars, euros or pounds.
- Your own driving aids and AI strength and aggression, with a step up or down
  per championship, round or class.
- Two Content Manager flags from Settings: skip CM's own results screen, and hide
  its cancel button.

![Settings](docs/screenshots/settings.png)

## Good to know

These come from how Assetto Corsa and Content Manager behave, not from the app:

- **Races are laps or a distance, never timed.** Offline AC has no timed race.
- **One session per launch.** Practice, qualifying and each race are started
  one at a time from the app.
- **Quitting a race does not abort it.** AC runs it to the end without you and
  writes a full result, which reads as being lapped.
- **Keep the app open while you race.** It minimises itself while the game runs
  and reads the result when the session ends. Closing it mid-race loses that
  session's result.
- **Driving aids are sent to Content Manager**, which rewrites your
  `cfg\assists.ini` and does not put the old one back.
- **PURE Planner overwrites its `last_used.json`** with the plan it last ran, so a
  plan you had loaded there is replaced.

## Building from source

You need [Node.js 24](https://nodejs.org/) or newer.

```
npm install
npm run dev        # run the app with hot reload
npm run build      # build into dist/
npm run start      # run the built app
npm run package    # build, then a Windows installer in release/
```

`npm run check` (typecheck and lint) and `npm test` must both pass before a commit.
[CLAUDE.md](CLAUDE.md) describes how the code is laid out and
[ROADMAP.md](ROADMAP.md) what is planned.

## License

[MIT](LICENSE)
