// Launching a race through Content Manager: acmanager://race/config?configData=<cut-base64 race.ini>
//
// Handing the INI to CM rather than writing cfg/race.ini and running acs.exe
// ourselves is the point - CM's GameWrapper prepares CSP configs, weather
// controllers and track properties first. Bypassing it breaks PURE and rain FX.
//
// Parameter naming is a trap. CM's GetSettings() reads `<key>Data` as base64,
// `<key>File` as a path, and plain `<key>` as literal text. Sending base64 as
// `config` does not error: IniFile.Parse() parses it as INI, yields nothing,
// and CSP dies later with "invalid race configuration".

import { execFile } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';

import {
  DEFAULT_ABS,
  DEFAULT_DAMAGE,
  DEFAULT_FUEL_RATE,
  DEFAULT_SLIPSTREAM,
  DEFAULT_STABILITY_CONTROL,
  DEFAULT_TRACTION_CONTROL,
  DEFAULT_TYRE_WEAR,
  LAUNCH_MAX_BUFFER,
} from './constants.ts';
import type { LaunchOptions, RaceUriOptions } from './types.ts';
import { assistFlag, toCutBase64 } from './utils.ts';
import type { Assists } from '../../shared/types/index.ts';

export type { LaunchOptions, RaceUriOptions } from './types.ts';
export { fromCutBase64, toCutBase64 } from './utils.ts';

/**
 * Builds the URI that hands a race configuration to Content Manager inline.
 * @param raceIni The generated race.ini text
 * @param options Extra data to send alongside it
 * @returns An acmanager:// URI
 */
export const buildRaceUri = (raceIni: string, { assistsPreset }: RaceUriOptions = {}): string => {
  const params = [`configData=${encodeURIComponent(toCutBase64(raceIni))}`];
  if (assistsPreset) {
    params.push(`assistsData=${encodeURIComponent(toCutBase64(assistsPreset))}`);
  }

  return `acmanager://race/config?${params.join('&')}`;
};

/**
 * Builds the URI that passes the INI by path instead of inline.
 *
 * The file must still exist when CM handles the request.
 * @param iniPath Absolute path to a race.ini
 * @returns An acmanager:// URI
 */
export const buildRaceUriFromFile = (iniPath: string): string => (
  `acmanager://race/config?configFile=${encodeURIComponent(iniPath)}`
);

/**
 * Chains several acmanager commands into one batch call.
 * @param commands The commands to run in order
 * @returns An acmanager:// URI
 */
export const buildBatchUri = (commands: string[]): string => (
  `acmanager://batch?cmds=${encodeURIComponent(toCutBase64(commands.join('\n')))}`
);

/**
 * Spawns Content Manager with the URI as a single argv entry.
 *
 * Not via `cmd /c start` or shell.openExternal, where '&' would split the query
 * string. CM is single-instance and forwards to an already-running copy.
 * @param cmPath Full path to Content Manager.exe
 * @param uri The acmanager:// URI to hand over
 * @param options Extra command line arguments
 * @returns The spawned process, once it has started
 */
export const launchUri = (
  cmPath: string,
  uri: string,
  { extraArgs = [] }: LaunchOptions = {},
): Promise<ChildProcess> => new Promise((resolve, reject) => {
  const child = execFile(
    cmPath,
    [...extraArgs, uri],
    { windowsHide: false, maxBuffer: LAUNCH_MAX_BUFFER },
    (error) => {
      // CM exits immediately after forwarding, so an error here is a real
      // failure rather than a race that ended badly.
      if (error && !error.killed) reject(error);
    },
  );

  child.on('spawn', () => resolve(child));
  child.on('error', reject);
});

/**
 * Renders assists in the layout AC writes to cfg/assists.ini.
 *
 * Not yet usable at launch: acmanager://race/config wants Content Manager's own
 * serialized preset format rather than this.
 * @param assists The assists to render, defaulting to AC's own defaults
 * @returns INI text with CRLF line endings
 */
export const buildAssistsIni = (assists: Assists = {}): string => [
  '[ASSISTS]',
  `IDEAL_LINE=${assistFlag(assists.idealLine, 0)}`,
  `AUTO_BLIP=${assistFlag(assists.autoBlip, 0)}`,
  `STABILITY_CONTROL=${assists.stabilityControl ?? DEFAULT_STABILITY_CONTROL}`,
  `AUTO_BRAKE=${assistFlag(assists.autoBrake, 0)}`,
  `AUTO_SHIFTER=${assistFlag(assists.autoShifter, 0)}`,
  `ABS=${assists.abs ?? DEFAULT_ABS}`,
  `TRACTION_CONTROL=${assists.tractionControl ?? DEFAULT_TRACTION_CONTROL}`,
  `AUTO_CLUTCH=${assistFlag(assists.autoClutch, 0)}`,
  `VISUALDAMAGE=${assistFlag(assists.visualDamage, 1)}`,
  `DAMAGE=${assists.damage ?? DEFAULT_DAMAGE}`,
  `FUEL_RATE=${assists.fuelRate ?? DEFAULT_FUEL_RATE}`,
  `TYRE_WEAR=${assists.tyreWear ?? DEFAULT_TYRE_WEAR}`,
  `TYRE_BLANKETS=${assistFlag(assists.tyreBlankets, 1)}`,
  `SLIPSTREAM=${assists.slipstream ?? DEFAULT_SLIPSTREAM}`,
  '',
].join('\r\n');
