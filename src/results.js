// Reading race results out of Documents\Assetto Corsa\out\race_out.json.
//
// Two quirks drive the design: the file is overwritten every session, so
// results must be copied out immediately; and it is written progressively, so
// reads are retried until the content parses and stops changing size.

import { watch } from 'node:fs';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const POLL_INTERVAL = 500;
const SETTLE_READS = 2;

/**
 * Wait for a new race_out.json to appear, then return its parsed contents.
 *
 * @param {string} raceOutPath  path to out/race_out.json
 * @param {object} options
 * @param {number} options.since       ignore writes at or before this mtime (ms)
 * @param {number} options.timeoutMs   give up after this long
 * @param {function} options.onWait    called periodically while waiting
 */
export async function waitForResults(raceOutPath, { since = Date.now(), timeoutMs = 4 * 60 * 60 * 1000, onWait } = {}) {
  const deadline = Date.now() + timeoutMs;
  const dir = path.dirname(raceOutPath);

  // fs.watch is only a way to wake the poll loop early; the polling itself is
  // what guarantees we notice the write.
  const wakeups = [];
  let watcher;
  try {
    watcher = watch(dir, (_event, filename) => {
      if (!filename || filename.toLowerCase() === path.basename(raceOutPath).toLowerCase()) {
        while (wakeups.length) wakeups.pop()();
      }
    });
  } catch {
    // Directory may not exist yet -- polling still covers it.
  }

  try {
    while (Date.now() < deadline) {
      const mtime = await mtimeOf(raceOutPath);
      if (mtime && mtime > since) {
        const parsed = await readStable(raceOutPath);
        if (parsed) return parsed;
      }
      onWait?.();
      await sleepUntilEvent(POLL_INTERVAL, wakeups);
    }
  } finally {
    watcher?.close();
  }
  return null;
}

/** Resolve after `ms`, or as soon as something pushes onto `wakeups`. */
function sleepUntilEvent(ms, wakeups) {
  return new Promise((resolve) => {
    const timer = setTimeout(finish, ms);
    wakeups.push(finish);

    function finish() {
      clearTimeout(timer);
      const index = wakeups.indexOf(finish);
      if (index !== -1) wakeups.splice(index, 1);
      resolve();
    }
  });
}

async function mtimeOf(file) {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return null;
  }
}

/**
 * Read a file that may still be being written: parse it repeatedly until the
 * result parses cleanly and the size has stopped moving.
 */
export async function readStable(file, attempts = 20) {
  let lastSize = -1;
  let stableCount = 0;

  for (let i = 0; i < attempts; i++) {
    try {
      const text = await readFile(file, 'utf8');
      const parsed = JSON.parse(text);
      if (text.length === lastSize) {
        if (++stableCount >= SETTLE_READS) return parsed;
      } else {
        stableCount = 0;
        lastSize = text.length;
      }
    } catch {
      // Truncated or mid-write; fall through to the backoff.
    }
    await new Promise((r) => setTimeout(r, 100 + i * 50));
  }
  return null;
}

/** Copy a result into our own store so the next race cannot clobber it. */
export async function archiveResults(results, storeDir, meta = {}) {
  await mkdir(storeDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(storeDir, `${stamp}.json`);
  await writeFile(file, JSON.stringify({ recordedAt: new Date().toISOString(), ...meta, result: results }, null, 2));
  return file;
}

/**
 * Reduce race_out.json to standings. Times are milliseconds and -1 means an
 * invalidated lap; `car` indexes into `players`, which is [CAR_n] order.
 */
export function summarise(raceOut) {
  const players = raceOut.players ?? [];
  const sessions = (raceOut.sessions ?? []).map((session) => {
    const laps = session.laps ?? [];
    const byCar = players.map((player, index) => {
      const own = laps.filter((l) => l.car === index);
      const valid = own.filter((l) => l.time > 0);
      const best = valid.length ? Math.min(...valid.map((l) => l.time)) : null;
      return {
        position: null,
        driver: player.name,
        car: player.car,
        skin: player.skin,
        laps: own.length,
        cuts: own.reduce((sum, l) => sum + (l.cuts ?? 0), 0),
        bestLap: best,
        totalTime: valid.reduce((sum, l) => sum + l.time, 0),
      };
    });

    // Race results order by laps completed then total time; everything else
    // orders by best lap.
    const isRace = session.type === 3;
    byCar.sort((a, b) => {
      if (isRace && a.laps !== b.laps) return b.laps - a.laps;
      const key = isRace ? 'totalTime' : 'bestLap';
      if (a[key] == null) return 1;
      if (b[key] == null) return -1;
      return a[key] - b[key];
    });
    byCar.forEach((entry, i) => { entry.position = i + 1; });

    return {
      name: session.name,
      type: session.type,
      lapCount: session.lapsCount ?? 0,
      durationMinutes: session.duration ?? 0,
      standings: byCar,
    };
  });

  return { track: raceOut.track, sessions };
}

export function formatLapTime(ms) {
  if (ms == null || ms <= 0) return '--:--.---';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}
