// The English rendering of every error code, in i18next's {{param}} syntax so
// one formatter serves both this table and the translated catalogues.
//
// This is the source the CLI prints and the fallback the UI uses when a
// catalogue has no entry for a code. src/renderer/src/i18n merges it in as the
// English `errors` namespace, so the strings are never duplicated in en.json.

import type { ErrorCode } from './types.ts';

/**
 * Every error code mapped to its English template.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  'paths.contentManager.unregistered':
    'acmanager:// is not registered. Open Content Manager once (Settings > '
    + 'Content Manager > Integration) so it registers the protocol, or set the path here.',
  'paths.contentManager.notFound': 'Content Manager was not found at: {{tried}}',
  'paths.acRoot.undetected':
    'Could not find the Assetto Corsa install root. Point at the folder containing {{marker}}.',
  'paths.acRoot.notFound': 'No {{marker}} folder under any of: {{tried}}',
  'paths.documents.undetected': 'Could not find the Assetto Corsa Documents folder.',
  'paths.documents.notFound': 'Not found at any of: {{tried}}',
  'paths.unresolved': 'Could not resolve the Assetto Corsa paths.',

  'race.timeOfDay.invalid': 'Invalid time of day: {{time}} (expected "HH:MM")',
  'race.track.required': 'race.track.id is required',
  'race.track.notInstalled': 'Track not installed: {{track}}',
  'race.weather.notInstalled': 'Weather not installed: {{weather}}',
  'race.weatherType.unavailable':
    'No installed weather declares CSP weather type {{type}}. Install a weather set '
    + 'that covers it, such as Sol, or pick an installed preset instead.',
  'race.weatherController.notInstalled':
    'Weather controller not installed: {{controller}}. Available: {{available}}',
  'race.playerCar.required': 'race.playerCar.model is required',
  'race.car.notInstalled': 'Car not installed: {{car}}',
  'race.car.noSkins': 'Car {{car}} has no skins installed',
  'race.grid.exceedsPitboxes':
    'Grid of {{cars}} cars exceeds the {{pitboxes}} pit boxes at {{track}}',
  'race.session.unknownType': 'Unknown session type: {{type}}',
  'race.session.raceNotInLaps':
    'Race session "{{session}}" states no lap count. Assetto Corsa runs a timed race on a server alone, so an offline race is measured in laps.',

  'weatherPlan.weather.unmappable':
    'Sol Planner numbers weather {{weather}} differently from Assetto Corsa, so a plan '
    + 'cannot ask for it.',
  'weatherPlan.planner.notInstalled':
    '{{planner}} is not installed: expected it at {{path}}.',
  'weatherPlan.plan.openEndedStep':
    'Only the last stretch of a weather plan may run until the session ends: '
    + 'stretch {{index}} states no length.',

  'cm.arguments.unknownFlag': '{{flag}} is not a Content Manager flag this app sets.',
  'cm.arguments.noDataDir':
    'Cannot find Content Manager\'s data folder: LOCALAPPDATA is not set.',

  'event.complete': 'Every launch of {{race}} has already been run.',
  'event.launch.outOfRange': 'Launch {{index}} does not exist: {{race}} plans {{count}}.',
  'event.launch.runnable':
    'Launch {{index}} of {{race}} is one you take part in, so it has to be driven rather than skipped.',
  'event.state.stale':
    'Saved progress for {{race}} covers {{saved}} launches, but it now plans {{planned}}. '
    + 'Reset the event to run it again.',
  'event.scale.notRace':
    'Only a race run to a number of laps can be shortened, and the next launch of {{race}} is not one.',
  'event.scale.unavailable':
    'A race of {{laps}} laps cannot run at 1/{{scale}} of its length: it would go under {{min}} laps, '
    + 'or that is not a step on offer.',

  'seriesFile.notAnObject': '{{file}} is not a championship: the file holds no object',
  'seriesFile.unparseable': '{{file}} is not valid JSON: {{reason}}',
  'seriesFile.field.invalid': '{{file}} has an unreadable {{field}}: {{value}}',
  'seriesFile.unwritable': 'Championship {{series}} holds something JSON cannot carry',
  'seriesFile.directoryUnreadable': 'Could not read the championships in {{dir}}: {{reason}}',
  'seriesFile.duplicateId': '{{file}} claims the id {{series}}, which {{taken}} already has',
  'seriesFile.idUnsafe':
    '{{series}} cannot be a championship file name. An id is lower-case letters, digits and hyphens.',
  'seriesFile.idReserved':
    '{{series}} is a name Windows reserves for a device, so no file can be called that.',
  'seriesFile.writeFailed': 'Could not save championship {{series}}: {{reason}}',
  'seriesFile.deleteFailed': 'Could not delete championship {{series}}: {{reason}}',

  'series.notFound': 'Championship not found: {{series}}',
  // Says to delete it because that is genuinely the answer: there are no
  // migrations before release, so nothing can carry an older file forward.
  'series.version.unsupported':
    'Championship {{series}} is written for series format {{version}}, and this build reads {{supported}}. Delete the file and make it again.',
  'series.entries.empty': 'Championship {{series}} has no class entries',
  'series.rounds.empty': 'Championship {{series}} has no rounds',
  'series.season.tooManyRounds':
    'Championship {{series}} runs {{rounds}} rounds, and its season is {{weeks}} weeks long, which has room for {{weeks}} at one a week',
  'season.date.invalid': '{{date}} is not a calendar date',
  'career.none': 'No career is open',
  'career.notFound': 'That career is no longer here',
  'career.unreadable': 'That career could not be read, so it has been set aside',
  'career.open': 'Go back to the main menu before deleting the career that is open',
  'career.driver.unnamed': 'A career needs a driver\'s name',
  'career.driver.nation': '{{nation}} is not a nation Assetto Corsa has a flag for',
  'career.year.invalid': 'A career\'s first season opens in a year from {{from}} to {{to}}',
  'career.level.invalid': '{{level}} is not a rung of the ladder',
  'career.money.invalid': 'A career cannot start with {{money}}',
  'career.money.short': 'This round costs {{fee}} and the career holds {{money}}',
  'career.car.unknown': '{{car}} is not a car in your library',
  'career.car.owned': 'The {{car}} is in your garage already',
  'career.car.notOwned': 'The {{car}} is not in your garage',
  'career.car.short': 'That costs {{price}} and the career holds {{money}}',
  'career.car.racing': '{{event}} is under way in the {{car}} - finish the round, then sell it',
  'career.car.livery': 'The {{car}} has no livery {{livery}}',
  'career.car.sameLivery': 'The {{car}} wears that livery already',
  'career.car.ineligible': 'The {{car}} cannot race {{entry}}',
  'standalone.garage': 'A standalone championship has no money, so no garage',
  'save.notFound': 'That save is no longer here',
  'save.unreadable': 'That save could not be read, so it has been set aside',
  'save.protected': 'Autosaves and the quick save cannot be written over, renamed or deleted',
  'save.unnamed': 'A save needs a name',
  'backup.notCareer': 'That file holds no career this build can read',
  'backup.isCareer': 'That backup holds a career - restore it from Careers',
  'backup.isChampionship': 'That backup holds a standalone championship - restore it from Championships',
  'standalone.enter': 'A standalone championship races the championship it was started with and nothing else',
  'standalone.withdraw': 'A standalone championship cannot be given up - delete it from the main menu instead',
  'standalone.clock': 'A standalone championship\'s calendar moves on only as its rounds are raced or skipped',
  'standalone.car': '{{car}} is not a car {{entry}} races',
  'career.skip.raceable': '{{round}} can be raced, so there is nothing to skip it for',
  'zip.unreadable': 'That file is not a zip this build can read ({{reason}})',
  'zip.tooLarge': 'There is too much to fit in one zip',
  'career.season.notFound': 'The career has no season {{season}}',
  'career.season.closed': 'The {{year}} season is over, and nothing in it can be raced or entered any more',
  'career.edition.unknown': '{{series}} runs {{editions}} editions a season, and has no edition {{edition}}',
  'career.edition.over': 'This edition of {{series}} is over: every one of its rounds is behind the calendar',
  'career.series.unavailable': '{{series}} cannot be raced against the installed content',
  'career.entry.ineligible': 'Your level is not high enough to enter {{entry}}',
  'career.entry.enrolled': 'You have already entered this edition of {{entry}}',
  'career.entry.notEnrolled': 'You have not entered this edition of {{entry}}',
  'career.date.backwards': 'The calendar cannot go back to {{date}} from {{from}}',
  'career.event.notFound': 'Round {{round}} is not on the calendar of {{series}}',
  'career.event.notEntered': 'Enter {{series}} before racing its rounds',
  'career.event.closed': '{{round}} is over: it has been raced or its event has passed',
  'career.event.earlierPending': 'Race {{event}} first: it comes earlier in your season and has not been raced',
  'career.event.otherInProgress': '{{event}} is part-way through. Finish its event before starting another',
  'career.event.sameDay': '{{event}} is on the same day, and only one of the two can be raced',
  'career.event.inProgress': 'The calendar cannot move on while {{event}} is part-way through',
  'career.event.complete': 'Every session of {{round}} has been run',
  'series.sessions.empty': 'Event format {{format}} of {{series}} has no sessions',
  'series.formats.empty': 'Championship {{series}} declares no event formats',
  'series.format.unknown':
    'Round {{round}} of {{series}} runs an event format it does not have: {{format}}',
  'series.format.defaultUnknown':
    'Championship {{series}} defaults to an event format it does not have: {{format}}',
  'series.points.onNonRace':
    'Session "{{session}}" of {{format}} in {{series}} names a points system, and only a race scores.',
  'series.points.empty': 'Championship {{series}} declares no points systems',
  'series.points.unknown':
    'Session "{{session}}" of {{format}} in {{series}} pays a points system it does not have: {{points}}',
  'series.points.defaultUnknown':
    'Championship {{series}} defaults to a points system it does not have: {{points}}',
  'series.inherit.unknown':
    'Session "{{session}}" of {{format}} in {{series}} follows a session that format does not have: {{from}}',
  'series.inherit.notEarlier':
    'Session "{{session}}" of {{format}} in {{series}} follows "{{from}}", which does not run before it',
  'series.inherit.notQualifying':
    'Session "{{session}}" of {{format}} in {{series}} follows "{{from}}", which leaves it no classification to follow - a race follows a qualifying or a race, anything else only a qualifying',
  'series.inherit.topInvalid':
    'Session "{{session}}" of {{format}} in {{series}} lets {{top}} cars through; it must let at least one',
  'series.inherit.reverseInvalid':
    'Session "{{session}}" of {{format}} in {{series}} reverses {{reverse}} cars; only a race reverses its grid, and it must turn round at least two',
  'series.length.conflict':
    'Session "{{session}}" of {{format}} in {{series}} states more than one of laps, minutes and distance; it may state one',
  'series.length.invalid':
    'Session "{{session}}" of {{format}} in {{series}} runs {{length}} {{unit}}; a length must be a positive number',
  'series.distance.onNonRace':
    'Session "{{session}}" of {{format}} in {{series}} is measured as a distance; only a race may be',
  'series.race.timed':
    'Session "{{session}}" of {{format}} in {{series}} is a race measured by the clock. Assetto Corsa runs a timed race on a server alone, so a race states laps or a distance.',
  'series.grid.offsetOutOfRange':
    '{{field}} of {{series}} moves the AI by {{value}}, further than the {{max}} a championship may move them from the difficulty in settings',
  'series.distance.unresolved':
    'Round {{round}} of {{series}} runs "{{session}}" over {{distance}} km, but the track does not say how long a lap is',
  'series.round.sessionUnknown':
    'Round {{round}} of {{series}} sets the length of session "{{session}}", which its event format does not have',
  'series.round.lengthMissing':
    'Round {{round}} of {{series}} replaces the length of session "{{session}}" without stating one',
  'series.id.duplicate': 'Duplicate {{kind}} id in {{series}}: {{id}}',
  'series.entry.notFound': 'Class entry not found in {{series}}: {{entry}}',
  'series.entry.unknown': 'Round {{round}} overrides a class entry {{series}} does not have: {{entry}}',
  'series.entry.noCars': 'Class entry {{entry}} names no cars',
  'series.spec.unknown': 'Class entry {{entry}} races on a spec the class catalogue does not have: {{spec}}',
  'series.round.specUnknown':
    'Round {{round}} moves class entry {{entry}} onto a spec the class catalogue does not have: {{spec}}',
  'series.seats.empty': 'Class entry {{entry}} has no seats; it must field at least one car',
  'series.seat.teamUnknown': 'Seat {{seat}} is fielded by a team {{series}} does not have: {{team}}',
  'series.seat.carNotEligible': 'Seat {{seat}} is pinned to a car its class cannot field: {{car}}',
  'series.tier.invalid': 'Class entry {{entry}} sits at tier {{tier}}; tier 1 is the top and there is nothing above it',
  'series.days.gapped': 'Event format {{format}} of {{series}} skips day {{day}}',
  'series.days.tooMany':
    'Event format {{format}} of {{series}} runs over {{days}} days; an event is at most {{max}}',
  'series.days.outOfOrder':
    'Event format {{format}} of {{series}} goes back in time at "{{session}}"',
  'series.startingPosition.authored':
    'Session "{{session}}" of {{format}} in {{series}} sets a starting position. The grid comes from qualifying or from the ladder, so an authored one would be silently overwritten.',
  'series.bop.notEligible': 'Class entry {{entry}} balances a car it cannot field: {{car}}',
  'series.prizes.invalid': 'Championship {{series}} pays {{amount}} for {{table}} position {{position}}; prize money cannot be negative',
  'series.entryFee.invalid': 'Entry fee of {{amount}} on {{scope}} in {{series}}; an entry fee cannot be negative',
  'series.round.notFound': 'Round not found in {{series}}: {{round}}',
  'series.round.unavailable': 'Round {{round}} of {{series}} cannot be raced against the installed content',
  'series.car.notEligible': 'Car {{car}} is not eligible for {{entry}} at this round',
  'series.notShipped':
    'Championship {{series}} is already yours, so there is nothing the app ships to adjust.',
  'series.notAdjusted':
    'Championship {{series}} does not replace one the app ships, so there is nothing to go back to.',
  'series.notDeletable':
    'Championship {{series}} is not one you wrote. An adjusted championship is reverted rather than deleted.',
  'series.notEditable':
    'Championship {{series}} is one the app ships. Take your own copy of it before editing.',
  'series.id.immutable':
    'Championship {{series}} cannot be renamed to {{id}}. Duplicate it instead, which gives the copy an id of its own.',
  'series.eventInProgress':
    'Round {{round}} of {{series}} is part-way through. Finish that event, or reset it, before editing the championship.',
  'series.save.unreadable': 'Championship {{series}} could not be saved: {{reason}}',

  'classes.car.specUnknown': 'There is no spec {{spec}} to put {{car}} in.',
  'classes.car.classClash': '{{car}} cannot race in two specs of {{class}} at once.',
  'classes.name.empty': 'It needs a name.',
  'classes.name.taken': 'The name {{name}} is already taken.',
  'classes.class.shipped': '{{class}} is a class the app ships, so it cannot be changed or deleted.',
  'classes.class.notFound': 'There is no class of yours with the id {{class}}.',
  'classes.spec.shipped': '{{spec}} is a spec the app ships, so it cannot be changed or deleted.',
  'classes.spec.notFound': 'There is no spec of yours with the id {{spec}}.',
  'classes.spec.classUnknown': 'There is no class {{class}} to put {{spec}} in.',
  'classes.spec.classClash':
    '{{spec}} cannot move into {{class}}: {{car}} already races in a spec of that class.',
  'classes.spec.inUse': '{{spec}} is raced by {{series}}. Change that championship first.',
  'classes.writeFailed': 'The class catalogue could not be saved: {{reason}}',

  'run.inFlight': 'A race is already running. Wait for it to finish, or cancel it first.',
  'run.notPlanned':
    'This race cannot be run yet: it does not name a track and a car that are both installed.',
  'run.notLaunched': 'No race is running.',
  'run.resultTimedOut':
    'Gave up waiting for Assetto Corsa to write a result after {{hours}} hours.',
  'run.result.notFound': 'No archived result named {{file}}.',
  'run.result.notRecorded':
    'The session finished, but its result could not be recorded: {{reason}}',

  'quick.track.none': 'Pick a track to race on.',
  'quick.car.none': 'Pick a car to drive.',
  'quick.class.noCars': '{{class}} has no cars yet. Pick a grid for it, or add cars to it.',
  'quick.car.notInClass': '{{car}} is not in {{class}}.',
  'quick.notFound': 'There is no race event with the id {{race}}.',
  'quick.started': '{{race}} has started. Start it over to change it.',

  'historic.started': '{{event}} has already begun, so it can no longer be declined.',
  'historic.invited': 'You are invited to {{event}}. Answer the invitation before entering it at your own cost.',
  'mail.notFound': 'There is no such mail in the inbox.',
  'mail.closed': 'The invitation to {{event}} can no longer be answered that way.',
  'contract.closed': 'The seat offer from {{team}} for {{series}} can no longer be answered that way.',
  'contract.short': 'The seat costs {{price}} and the career holds {{money}}.',
  'contract.gone': '{{team}} no longer fields that seat in {{series}}.',
  'contract.release.short': 'Terminating the contract costs {{fee}} and the career holds {{money}}.',
  'contract.sale.none': 'That team sells no seat in {{series}}.',
  'historic.rounds': '{{event}} is a historic event, so it runs exactly one round rather than {{count}}.',
  'historic.points':
    'Points system "{{system}}" of {{event}} pays points, but a historic event pays only its prize money.',
  'historic.calendar':
    '{{event}} states a season length or a race day, but a historic event is placed on the calendar by the career.',

  'strength.outOfRange':
    'A step of {{value}} moves the AI further than the {{max}} either way a step may move them from the difficulty in settings.',

  'ipc.noWindow': 'No window to attach the folder picker to.',
  'ipc.pathsNotLocated': 'Cannot scan content until the Assetto Corsa install has been located.',
};

/**
 * Advice the CLI appends to a missing-track error. Kept out of the shared
 * template because `npm run scan` means nothing inside the desktop app.
 */
export const SCAN_HINT = 'Run `npm run scan` to see what is available.';

/**
 * The folder that proves a directory really is the Assetto Corsa install root.
 * Interpolated rather than baked into the sentence so translators do not have to
 * reproduce a Windows path.
 */
export const AC_ROOT_MARKER = 'content\\cars';
