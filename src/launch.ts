// Launching a race through Content Manager: acmanager://race/config?configData=<cut-base64 race.ini>
//
// Handing the INI to CM rather than writing cfg/race.ini and running acs.exe
// ourselves is the point -- CM's GameWrapper prepares CSP configs, weather
// controllers and track properties first. Bypassing it breaks PURE and rain FX.
//
// Parameter naming is a trap. CM's GetSettings() reads `<key>Data` as base64,
// `<key>File` as a path, and plain `<key>` as literal text. Sending base64 as
// `config` does not error: IniFile.Parse() parses it as INI, yields nothing,
// and CSP dies later with "invalid race configuration".

import { execFile, type ChildProcess } from 'node:child_process';
import type { Assists } from './types.ts';

/**
 * CM's "cut base64": standard base64 with '=' stripped.
 * Not the URL-safe alphabet -- FromCutBase64() re-pads and calls
 * Convert.FromBase64String(), which rejects '-' and '_'. So '+' and '/' survive
 * and must be percent-encoded in the query string.
 */
export function toCutBase64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64').replace(/=+$/, '');
}

export function fromCutBase64(encoded: string): string {
  const padding = encoded.length % 4;
  const padded = padding ? encoded + '='.repeat(4 - padding) : encoded;
  return Buffer.from(padded, 'base64').toString('utf8');
}

export interface RaceUriOptions {
  /** CM serialized assists preset -- not an assists.ini. */
  assistsPreset?: string;
}

export function buildRaceUri(raceIni: string, { assistsPreset }: RaceUriOptions = {}): string {
  const params = [`configData=${encodeURIComponent(toCutBase64(raceIni))}`];
  if (assistsPreset) {
    params.push(`assistsData=${encodeURIComponent(toCutBase64(assistsPreset))}`);
  }
  return `acmanager://race/config?${params.join('&')}`;
}

/** Passes the INI by path instead of inline. The file must still exist when CM handles the request. */
export function buildRaceUriFromFile(iniPath: string): string {
  return `acmanager://race/config?configFile=${encodeURIComponent(iniPath)}`;
}

/** Chain several acmanager commands into one batch call. */
export function buildBatchUri(commands: string[]): string {
  return `acmanager://batch?cmds=${encodeURIComponent(toCutBase64(commands.join('\n')))}`;
}

/**
 * Spawn CM with the URI as a single argv entry -- not via `cmd /c start` or
 * shell.openExternal, where '&' would split the query string. CM is
 * single-instance and forwards to an already-running copy.
 */
export function launchUri(
  cmPath: string,
  uri: string,
  { extraArgs = [] }: { extraArgs?: string[] } = {},
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      cmPath,
      [...extraArgs, uri],
      { windowsHide: false, maxBuffer: 1024 * 1024 },
      (error) => {
        // CM exits immediately after forwarding, so an error here is a real
        // failure rather than a race that ended badly.
        if (error && !error.killed) reject(error);
      },
    );
    child.on('spawn', () => resolve(child));
    child.on('error', reject);
  });
}

/** Default assists, matching the layout AC writes to cfg/assists.ini. */
export function buildAssistsIni(assists: Assists = {}): string {
  const flag = (value: boolean | undefined, fallback: number): number => {
    if (value === undefined) return fallback;
    return value ? 1 : 0;
  };

  return [
    '[ASSISTS]',
    `IDEAL_LINE=${flag(assists.idealLine, 0)}`,
    `AUTO_BLIP=${flag(assists.autoBlip, 0)}`,
    `STABILITY_CONTROL=${assists.stabilityControl ?? 0}`,
    `AUTO_BRAKE=${flag(assists.autoBrake, 0)}`,
    `AUTO_SHIFTER=${flag(assists.autoShifter, 0)}`,
    `ABS=${assists.abs ?? 1}`,
    `TRACTION_CONTROL=${assists.tractionControl ?? 1}`,
    `AUTO_CLUTCH=${flag(assists.autoClutch, 0)}`,
    `VISUALDAMAGE=${flag(assists.visualDamage, 1)}`,
    `DAMAGE=${assists.damage ?? 100}`,
    `FUEL_RATE=${assists.fuelRate ?? 1}`,
    `TYRE_WEAR=${assists.tyreWear ?? 1}`,
    `TYRE_BLANKETS=${flag(assists.tyreBlankets, 1)}`,
    `SLIPSTREAM=${assists.slipstream ?? 1}`,
    '',
  ].join('\r\n');
}
