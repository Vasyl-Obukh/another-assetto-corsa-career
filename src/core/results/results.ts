// Reading race results out of Documents\Assetto Corsa\out\race_out.json.
//
// Two quirks drive the design: the file is overwritten every session, so
// results must be copied out immediately; and it is written progressively, so
// reads are retried until the content parses and stops changing size.

import { watch } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_TIMEOUT,
  POLL_INTERVAL,
  READ_ATTEMPTS,
  READ_BACKOFF_BASE_MS,
  READ_BACKOFF_STEP_MS,
  SESSION_TYPE_RACE,
  SETTLE_READS,
} from './constants.ts';
import type { WaitOptions } from './types.ts';
import {
  finishingOrder, isPermutation, mtimeOf, sleepUntilEvent,
} from './utils.ts';
import type {
  ArchiveMeta, RaceOut, RaceSummary, Standing, StandingsOrder,
} from '../../shared/types/index.ts';

export type { WaitOptions } from './types.ts';
export { finishingOrder, isDistinctSubset, isPermutation } from './utils.ts';

/**
 * Reads a file that may still be being written, until it parses and settles.
 * @param file Absolute path to the file
 * @param attempts How many times to retry before giving up
 * @returns The parsed contents, or null when the file never settled
 */
export const readStable = async <T>(
  file: string,
  attempts = READ_ATTEMPTS,
): Promise<T | null> => {
  let lastSize = -1;
  let stableCount = 0;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const text = await readFile(file, 'utf8');
      const parsed = JSON.parse(text) as T;
      if (text.length === lastSize) {
        stableCount += 1;
        if (stableCount >= SETTLE_READS) return parsed;
      } else {
        stableCount = 0;
        lastSize = text.length;
      }
    } catch {
      // Truncated or mid-write; fall through to the backoff.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, READ_BACKOFF_BASE_MS + attempt * READ_BACKOFF_STEP_MS);
    });
  }

  return null;
};

/**
 * Waits for a new race_out.json to appear, then returns its parsed contents.
 * @param raceOutPath Absolute path to race_out.json
 * @param options When to start counting from, how long to wait, progress reporting and cancellation
 * @returns The parsed results, or null when the wait timed out or was aborted
 */
export const waitForResults = async (
  raceOutPath: string,
  {
    since = Date.now(), timeoutMs = DEFAULT_TIMEOUT, onWait, signal,
  }: WaitOptions = {},
): Promise<RaceOut | null> => {
  const deadline = Date.now() + timeoutMs;
  const dir = path.dirname(raceOutPath);
  const filename = path.basename(raceOutPath).toLowerCase();

  // fs.watch only wakes the poll loop early; polling is what guarantees we notice.
  const wakeups: (() => void)[] = [];
  const wake = (): void => { while (wakeups.length) wakeups.pop()?.(); };

  let watcher;
  try {
    watcher = watch(dir, (_event, changed) => {
      if (!changed || changed.toString().toLowerCase() === filename) wake();
    });
  } catch {
    // Directory may not exist yet - polling still covers it.
  }

  // Aborting cuts the current sleep short rather than waiting out the interval.
  signal?.addEventListener('abort', wake, { once: true });

  try {
    while (Date.now() < deadline && signal?.aborted !== true) {
      const mtime = await mtimeOf(raceOutPath);
      if (mtime && mtime > since) {
        const parsed = await readStable<RaceOut>(raceOutPath);
        if (parsed) return parsed;
      }
      onWait?.();
      await sleepUntilEvent(POLL_INTERVAL, wakeups);
    }
  } finally {
    signal?.removeEventListener('abort', wake);
    watcher?.close();
  }

  return null;
};

/**
 * Copies a result into our own store so the next race cannot clobber it.
 * @param results The parsed race_out.json
 * @param storeDir Folder to archive into, created if missing
 * @param meta Extra fields recorded alongside the result
 * @returns The path the archive was written to
 */
export const archiveResults = async (
  results: RaceOut,
  storeDir: string,
  meta: ArchiveMeta = {},
): Promise<string> => {
  await mkdir(storeDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(storeDir, `${stamp}.json`);
  const payload = { recordedAt: new Date().toISOString(), ...meta, result: results };

  await writeFile(file, JSON.stringify(payload, null, 2));

  return file;
};

/**
 * Reduces race_out.json to standings.
 *
 * Times are milliseconds and -1 means an invalidated lap; `car` indexes into
 * `players`, which is [CAR_n] order.
 * @param raceOut The parsed race_out.json
 * @returns One classification per session
 */
export const summarise = (raceOut: RaceOut): RaceSummary => {
  const players = raceOut.players ?? [];

  const sessions = (raceOut.sessions ?? []).map((session) => {
    const laps = session.laps ?? [];

    const standings: Standing[] = players.map((player, index) => {
      const own = laps.filter((lap) => lap.car === index);
      const valid = own.filter((lap) => lap.time > 0);

      return {
        position: 0,
        driver: player.name,
        car: player.car,
        skin: player.skin,
        laps: own.length,
        cuts: own.reduce((sum, lap) => sum + (lap.cuts ?? 0), 0),
        bestLap: valid.length ? Math.min(...valid.map((lap) => lap.time)) : null,
        totalTime: valid.reduce((sum, lap) => sum + lap.time, 0),
      };
    });

    // A race is ordered as the weekend orders it, AC's own raceResult first.
    // Practice and qualifying carry none, so those order by best lap.
    const isRace = session.type === SESSION_TYPE_RACE;
    const official = isRace && isPermutation(session.raceResult, players.length);

    // Car indices are [CAR_n] order, which standings are still in here.
    const ordered = isRace
      ? finishingOrder(session, players.length).map((car) => standings[car])
      : [...standings].sort((a, b) => {
        if (a.bestLap == null) return 1;
        if (b.bestLap == null) return -1;
        return a.bestLap - b.bestLap;
      });
    ordered.forEach((entry, index) => {
      Object.assign(entry, { position: index + 1 });
    });
    const order: StandingsOrder = official ? 'raceResult' : 'inferred';

    return {
      name: session.name,
      type: session.type,
      lapCount: session.lapsCount ?? 0,
      durationMinutes: session.duration ?? 0,
      standings: ordered,
      order,
    };
  });

  return { track: raceOut.track, sessions };
};
