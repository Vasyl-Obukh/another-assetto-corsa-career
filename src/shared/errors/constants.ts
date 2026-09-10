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

  'weekend.complete': 'Every launch of {{race}} has already been run.',
  'weekend.launch.outOfRange': 'Launch {{index}} does not exist: {{race}} plans {{count}}.',
  'weekend.launch.runnable':
    'Launch {{index}} of {{race}} is one you take part in, so it has to be driven rather than skipped.',
  'weekend.state.stale':
    'Saved progress for {{race}} covers {{saved}} launches, but it now plans {{planned}}. '
    + 'Reset the weekend to run it again.',

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
  'series.version.unsupported':
    'Championship {{series}} is written for series format {{version}}, and this build reads {{supported}}.',
  'series.entries.empty': 'Championship {{series}} has no class entries',
  'series.rounds.empty': 'Championship {{series}} has no rounds',
  'series.sessions.empty': 'Weekend format {{format}} of {{series}} has no sessions',
  'series.formats.empty': 'Championship {{series}} declares no weekend formats',
  'series.format.unknown':
    'Round {{round}} of {{series}} runs a weekend format it does not have: {{format}}',
  'series.format.defaultUnknown':
    'Championship {{series}} defaults to a weekend format it does not have: {{format}}',
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
    'Session "{{session}}" of {{format}} in {{series}} follows "{{from}}", which is not a qualifying session and so classifies nobody',
  'series.inherit.topInvalid':
    'Session "{{session}}" of {{format}} in {{series}} lets {{top}} cars through; it must let at least one',
  'series.id.duplicate': 'Duplicate {{kind}} id in {{series}}: {{id}}',
  'series.entry.notFound': 'Class entry not found in {{series}}: {{entry}}',
  'series.entry.unknown': 'Round {{round}} overrides a class entry {{series}} does not have: {{entry}}',
  'series.entry.noCars': 'Class entry {{entry}} names no cars',
  'series.entrants.invalid': 'Class entry {{entry}} fields {{entrants}} cars; it must field at least one',
  'series.tier.invalid': 'Class entry {{entry}} sits at tier {{tier}}; tier 1 is the top and there is nothing above it',
  'series.days.gapped': 'Weekend format {{format}} of {{series}} skips day {{day}}',
  'series.days.tooMany':
    'Weekend format {{format}} of {{series}} runs over {{days}} days; a weekend is at most {{max}}',
  'series.days.outOfOrder':
    'Weekend format {{format}} of {{series}} goes back in time at "{{session}}"',
  'series.race.onOpeningDay':
    'Weekend format {{format}} of {{series}} runs a race on its opening day. A three-day weekend opens on Friday, and races fall on Saturday or Sunday.',
  'series.startingPosition.authored':
    'Session "{{session}}" of {{format}} in {{series}} sets a starting position. The grid comes from qualifying or from the ladder, so an authored one would be silently overwritten.',
  'series.bop.notEligible': 'Class entry {{entry}} balances a car it cannot field: {{car}}',
  'series.round.notFound': 'Round not found in {{series}}: {{round}}',
  'series.round.unavailable': 'Round {{round}} of {{series}} cannot be raced against the installed content',
  'series.car.notEligible': 'Car {{car}} is not eligible for {{entry}} at this round',
  'series.notShipped':
    'Championship {{series}} is already yours, so there is nothing the app ships to adjust.',
  'series.notAdjusted':
    'Championship {{series}} does not replace one the app ships, so there is nothing to go back to.',
  'series.notDeletable':
    'Championship {{series}} is not one you wrote. An adjusted championship is reverted rather than deleted.',

  'run.inFlight': 'A race is already running. Wait for it to finish, or cancel it first.',
  'run.notPlanned':
    'This race cannot be run yet: it does not name a track and a car that are both installed.',
  'run.notLaunched': 'No race is running.',
  'run.resultTimedOut':
    'Gave up waiting for Assetto Corsa to write a result after {{hours}} hours.',
  'run.result.notFound': 'No archived result named {{file}}.',
  'run.result.notRecorded':
    'The session finished, but its result could not be recorded: {{reason}}',

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
