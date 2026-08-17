// Reading the registry and choosing between candidate paths.

import { execFile } from 'node:child_process';
import { access, constants } from 'node:fs/promises';
import { promisify } from 'node:util';

import { AppError } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { PathCandidate, PathProbe } from '../../shared/types/index.ts';

const exec = promisify(execFile);

/**
 * Checks whether a path exists.
 * @param target Absolute path to test
 * @returns True when something is there
 */
export const exists = async (target: string): Promise<boolean> => {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Reads one value out of the Windows registry.
 * @param key Full registry key path
 * @param value Value name, or omitted to read the key's default value
 * @returns The value as a string, or null when the key or value is absent
 */
export const regQuery = async (key: string, value?: string): Promise<string | null> => {
  const args = ['query', key, ...(value ? ['/v', value] : ['/ve'])];

  try {
    const { stdout } = await exec('reg.exe', args, { windowsHide: true });
    // Lines look like:  (Default)    REG_SZ    "C:\path\Content Manager.exe" "%1"
    const match = /REG_(?:SZ|EXPAND_SZ)\s+(.*)$/m.exec(stdout);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
};

/**
 * Turns a failed probe back into something throwable, keeping its code.
 *
 * `pick` always sets an error when a probe fails, but the type does not say so,
 * and a probe with neither a value nor a reason should still throw a sentence
 * rather than an empty message.
 * @param probe The probe that failed
 * @returns The error to throw
 */
export const probeError = (probe: PathProbe): AppError => (
  probe.error
    ? new AppError(probe.error.code, probe.error.params)
    : new AppError('paths.unresolved')
);

/**
 * Joins candidate paths into a readable list for an error message.
 * @param tried The candidates to list
 * @returns The paths, comma separated
 */
export const listCandidates = (tried: PathCandidate[]): string => (
  tried.map((candidate) => candidate.value).join(', ')
);

/**
 * Picks the first candidate that passes its check.
 *
 * An override is authoritative: falling through to auto-detection after one
 * fails would quietly run against a different install than the user chose, and
 * report it as found - exactly the silent failure this project avoids.
 * @param tried Candidates in descending precedence
 * @param check Decides whether a candidate is valid
 * @param emptyError Used when there were no candidates at all
 * @param failedError Builds the error when candidates existed but all failed
 * @returns The probe result, which never throws
 */
export const pick = async (
  tried: PathCandidate[],
  check: (value: string) => Promise<boolean>,
  emptyError: AppErrorInfo,
  failedError: (tried: PathCandidate[]) => AppErrorInfo,
): Promise<PathProbe> => {
  for (const candidate of tried) {
    if (await check(candidate.value)) {
      return {
        value: candidate.value, origin: candidate.origin, exists: true, tried,
      };
    }

    if (candidate.origin === 'override') {
      return {
        value: candidate.value,
        origin: 'override',
        exists: false,
        tried,
        error: failedError([candidate]),
      };
    }
  }

  const first = tried[0];
  if (!first) {
    return {
      value: null, origin: null, exists: false, tried, error: emptyError,
    };
  }

  return {
    value: first.value, origin: first.origin, exists: false, tried, error: failedError(tried),
  };
};
