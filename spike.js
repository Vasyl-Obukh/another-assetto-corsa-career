#!/usr/bin/env node
// Integration spike: prove the full round trip.
//
//   race definition JSON -> race.ini -> acmanager://race/config -> Content
//   Manager -> Assetto Corsa (with CSP/PURE intact) -> race_out.json -> results
//
// If this works, the rest of a career mode is application code rather than
// reverse engineering.
//
//   node spike.js scan            list installed content, check the race is runnable
//   node spike.js dry [race]      generate race.ini to out/, launch nothing
//   node spike.js run [race]      launch the race and wait for results
//   node spike.js watch           wait for the next race_out.json on its own
//   node spike.js weather install install career weather presets into AC
//   node spike.js weather remove  take them out again
//   node spike.js testmode        how to diff our INI against Content Manager's

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolvePaths } from './src/paths.js';
import { scanContent } from './src/content.js';
import { buildRaceIni, validateRace, sunAngleFromTime } from './src/raceIni.js';
import { buildRaceUri, launchUri, buildAssistsIni, toCutBase64 } from './src/launch.js';
import { waitForResults, archiveResults, summarise, formatLapTime } from './src/results.js';
import { installCareerWeathers, removeCareerWeathers, CAREER_WEATHERS } from './src/weather.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(projectRoot, 'out');
const resultsDir = path.join(projectRoot, 'data', 'results');

const [, , command = 'scan', ...rest] = process.argv;

try {
  await main(command, rest);
} catch (error) {
  console.error(`\n  ${error.message}\n`);
  process.exitCode = 1;
}

async function main(command, args) {
  switch (command) {
    case 'scan': return cmdScan(args);
    case 'dry': return cmdDry(args);
    case 'run': return cmdRun(args);
    case 'watch': return cmdWatch(args);
    case 'testmode': return cmdTestMode();
    case 'weather': return cmdWeather(args);
    default:
      throw new Error(`Unknown command: ${command}. Try scan, dry, run, watch, weather or testmode.`);
  }
}

async function loadRace(args) {
  const name = args[0] ?? 'demo';
  const file = name.endsWith('.json') ? name : path.join(projectRoot, 'races', `${name}.json`);
  return { file, race: JSON.parse(await readFile(file, 'utf8')) };
}

async function cmdScan() {
  const paths = await resolvePaths();
  console.log('\nPaths');
  console.log(`  Content Manager  ${paths.contentManager}`);
  console.log(`  AC root          ${paths.acRoot}`);
  console.log(`  Documents        ${paths.documents}`);

  const content = await scanContent(paths.content);
  console.log('\nInstalled content');
  console.log(`  ${content.cars.length} cars, ${content.tracks.length} track layouts, ${content.weather.length} weathers`);

  const typed = content.weather.filter((w) => w.type != null);
  console.log(`  ${typed.length} weathers carry a CSP weather type; ${content.weather.length - typed.length} rely on CM inferring it`);

  const { race, file } = await loadRace([]);
  const problems = validateRace(race, content);
  console.log(`\nRace: ${race.name}  (${path.relative(projectRoot, file)})`);
  if (problems.length) {
    console.log('  NOT RUNNABLE:');
    for (const p of problems) console.log(`    - ${p}`);
  } else {
    const track = content.tracks.find((t) => t.id === race.track.id && t.layout === (race.track.layout ?? ''));
    const car = content.cars.find((c) => c.id === race.playerCar.model);
    const weather = content.weather.find((w) => w.id === race.conditions.weather);
    console.log(`  Track    ${track.name} (${track.pitboxes ?? '?'} pit boxes)`);
    console.log(`  Car      ${car.name} (${car.skins.length} skins)`);
    const controller = content.controllers.find((c) => c.id === race.conditions.weatherController);
    console.log(`  Weather  ${weather.name} -> __CM_WEATHER_TYPE=${weather.type}`);
    console.log(`  Control  ${controller ? `${controller.id} (${controller.name})` : 'CSP default from weather_fx.ini'}`);
    console.log(`  Grid     ${race.grid.size} cars, AI ${race.grid.aiLevelMin ?? race.grid.aiLevel}-${race.grid.aiLevel}%`);
    console.log('  Runnable.');
  }
  console.log();
}

async function cmdDry(args) {
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);
  const { race, file } = await loadRace(args);

  const problems = validateRace(race, content);
  if (problems.length) throw new Error(`Race is not runnable:\n    - ${problems.join('\n    - ')}`);

  const raceIni = buildRaceIni(race, content);
  // Written for reference/diffing only -- assists are not sent through the URI,
  // which needs CM's serialized preset format rather than an assists.ini.
  const assistsIni = buildAssistsIni(race.assists);
  const uri = buildRaceUri(raceIni);

  await mkdir(outDir, { recursive: true });
  const iniPath = path.join(outDir, 'race.ini');
  await writeFile(iniPath, raceIni);
  await writeFile(path.join(outDir, 'assists.ini'), assistsIni);
  await writeFile(path.join(outDir, 'launch-uri.txt'), uri);

  console.log(`\n${race.name}  (${path.relative(projectRoot, file)})`);
  console.log(`\n  Wrote ${path.relative(projectRoot, iniPath)} (${raceIni.length} bytes)`);
  console.log(`  URI is ${uri.length} chars, config payload ${toCutBase64(raceIni).length} chars`);
  console.log(`  Sun angle for ${race.conditions.timeOfDay}: ${sunAngleFromTime(race.conditions.timeOfDay).toFixed(2)}`);
  console.log('\n--- race.ini ---\n');
  console.log(raceIni.replace(/\r/g, ''));
  console.log('Compare against CM\'s own output: node spike.js testmode\n');
}

async function cmdRun(args) {
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);
  const { race } = await loadRace(args);

  const problems = validateRace(race, content);
  if (problems.length) throw new Error(`Race is not runnable:\n    - ${problems.join('\n    - ')}`);

  const raceIni = buildRaceIni(race, content);
  const uri = buildRaceUri(raceIni);

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'race.ini'), raceIni);

  // Anything written at or before this point is a previous session's result.
  const launchedAt = Date.now();

  console.log(`\nLaunching: ${race.name}`);
  console.log(`  via ${paths.contentManager}`);
  await launchUri(paths.contentManager, uri);
  console.log('  Handed off to Content Manager.\n');
  console.log('Waiting for the session to finish (Ctrl+C to stop watching)...');

  let ticks = 0;
  const raceOut = await waitForResults(paths.raceOut, {
    since: launchedAt,
    onWait: () => {
      if (++ticks % 60 === 0) process.stdout.write('.');
    },
  });

  if (!raceOut) throw new Error('Timed out waiting for race_out.json.');

  const archived = await archiveResults(raceOut, resultsDir, { raceId: race.id, raceName: race.name });
  console.log(`\n\nResults archived to ${path.relative(projectRoot, archived)}\n`);
  printResults(summarise(raceOut));
}

async function cmdWatch() {
  const paths = await resolvePaths();
  console.log(`\nWatching ${paths.raceOut}`);
  console.log('Run a race in Content Manager however you like; results appear here.\n');

  const raceOut = await waitForResults(paths.raceOut, { since: Date.now() });
  if (!raceOut) throw new Error('Timed out.');

  const archived = await archiveResults(raceOut, resultsDir, { source: 'watch' });
  console.log(`Archived to ${path.relative(projectRoot, archived)}\n`);
  printResults(summarise(raceOut));
}

function printResults(summary) {
  console.log(`Track: ${summary.track}`);
  for (const session of summary.sessions) {
    console.log(`\n  ${session.name}`);
    for (const entry of session.standings) {
      const position = String(entry.position).padStart(2);
      const driver = entry.driver.padEnd(18);
      const best = formatLapTime(entry.bestLap);
      const cuts = entry.cuts ? `  ${entry.cuts} cuts` : '';
      console.log(`    ${position}  ${driver}  ${String(entry.laps).padStart(2)} laps   best ${best}${cuts}`);
    }
  }
  console.log();
}

async function cmdWeather(args) {
  const paths = await resolvePaths();
  const action = args[0] ?? 'install';

  if (action === 'remove') {
    const removed = await removeCareerWeathers(paths.content);
    console.log(`\nRemoved ${removed.length} career weathers from ${path.join(paths.content, 'weather')}\n`);
    return;
  }

  if (action !== 'install') throw new Error('Usage: node spike.js weather [install|remove]');

  const installed = await installCareerWeathers(paths.content);
  console.log(`\nInstalled ${installed.length} career weathers into ${path.join(paths.content, 'weather')}:`);
  for (const preset of CAREER_WEATHERS) {
    const rain = preset.intensity > 0
      ? `rain ${preset.intensity}, wetness ${preset.wetness}, water ${preset.water}`
      : 'dry';
    console.log(`  ${preset.id.padEnd(22)} type ${String(preset.type).padStart(2)}  ${rain}`);
  }
  console.log('\nEach carries a [RAINFX] section, which PURE reads directly instead of');
  console.log('resolving the weather type. Undo at any time with: node spike.js weather remove\n');
}

async function cmdTestMode() {
  const paths = await resolvePaths();
  const argumentsFile = path.join(
    process.env.LOCALAPPDATA ?? '', 'AcTools Content Manager', 'Arguments.txt'
  );

  console.log(`
Ground-truth diffing
--------------------
Content Manager can write race.ini without launching the game, which gives an
authoritative reference to diff ours against.

  1. Add this line to Content Manager's Arguments.txt (one flag per line):

       --enable-race-ini-test-mode

     File: ${argumentsFile}

  2. Restart Content Manager, set up the same race in Quick Drive, hit Go.
     Nothing launches; it just writes the INI.

  3. Diff:

       node spike.js dry
       fc out\\race.ini "${path.join(paths.cfg, 'race.ini')}"

  4. Remove the flag when you are done, or CM will never launch a race again.

Also worth adding once the spike works, for a seamless career loop:

  --skip-all-results          skip CM's results screen between races
  --hide-race-cancel-button   stop accidental cancels mid-series
`);

  const existing = await readFile(argumentsFile, 'utf8').catch(() => null);
  if (existing) {
    console.log(`Arguments.txt currently contains:\n${existing.replace(/^/gm, '    ')}\n`);
  } else {
    console.log('Arguments.txt does not exist yet -- create it with just that one line.\n');
  }
}
