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

  'weekend.complete': 'Every launch of {{race}} has already been run.',
  'weekend.launch.outOfRange': 'Launch {{index}} does not exist: {{race}} plans {{count}}.',
  'weekend.state.stale':
    'Saved progress for {{race}} covers {{saved}} launches, but it now plans {{planned}}. '
    + 'Reset the weekend to run it again.',

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
