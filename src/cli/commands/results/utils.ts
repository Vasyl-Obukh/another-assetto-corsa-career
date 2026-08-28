// Reading result files and rendering them for the terminal. This is a probe
// rather than a feature: it prints the raw shape rather than an interpretation,
// which is what settled the Phase 3 questions about what AC actually writes and
// is what any future surprise will be diagnosed with.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import type { LoadedResult } from './types.ts';
import { SESSION_TYPE } from '../../../core/race-ini/index.ts';
import type { RaceOut, RaceOutSession, SessionType } from '../../../shared/types/index.ts';
import { RESULTS_DIR } from '../../constants.ts';

/**
 * AC's numeric session types, mapped back to the names our race format uses.
 */
const SESSION_TYPE_NAME = new Map<number, SessionType>(
  Object.entries(SESSION_TYPE).map(([name, code]) => [code, name as SessionType]),
);

/**
 * Names a session type code.
 * @param type AC's numeric session type
 * @returns The name our race format uses, or the bare code when it is unknown
 */
export const sessionTypeName = (type: number): string => SESSION_TYPE_NAME.get(type) ?? `type ${type}`;

/**
 * Lists archived results, newest first.
 * @returns Absolute paths to every archive, or an empty list when there are none
 */
export const listArchives = async (): Promise<string[]> => {
  const names = await readdir(RESULTS_DIR).catch(() => [] as string[]);
  const files = names.filter((name) => name.endsWith('.json')).map((name) => path.join(RESULTS_DIR, name));
  const stamped = await Promise.all(
    files.map(async (file) => ({ file, at: (await stat(file)).mtimeMs })),
  );

  return stamped.sort((a, b) => b.at - a.at).map((entry) => entry.file);
};

/**
 * Reads a result file, unwrapping the archive envelope when there is one.
 *
 * An archive is `{ recordedAt, raceId, raceName, result }`; AC's own
 * race_out.json is the bare payload, so the shape decides how to read it.
 * @param file Path to the file to read
 * @returns The payload and whatever metadata came with it
 */
export const loadResult = async (file: string): Promise<LoadedResult> => {
  const parsed = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>;
  const wrapped = parsed.result as RaceOut | undefined;

  return {
    file,
    meta: wrapped ? {
      recordedAt: parsed.recordedAt as string | undefined,
      raceId: parsed.raceId as string | undefined,
      raceName: parsed.raceName as string | undefined,
      source: parsed.source as string | undefined,
    } : {},
    result: wrapped ?? (parsed as unknown as RaceOut),
  };
};

/**
 * Names a car by its index into the result's entry list.
 * @param result The result being read
 * @param index Index into the players array
 * @returns The driver's name, or a placeholder when the index is out of range
 */
export const driverAt = (result: RaceOut, index: number): string => (
  result.players?.[index]?.name ?? `car ${index}?`
);

/**
 * Renders raceResult read as a finishing order - the nth entry is the car that
 * finished nth. This is the confirmed reading.
 * @param result The result being read
 * @param order The session's raceResult array
 * @returns One line per position
 */
export const asFinishingOrder = (result: RaceOut, order: readonly number[]): string[] => order.map(
  (car, index) => `      P${String(index + 1).padStart(2)}  ${driverAt(result, car)}  (car ${car})`,
);

/**
 * Renders raceResult read as a position per car - the nth entry is where car n
 * finished, counting from zero. Ruled out as the real reading, and kept only as
 * a cross-check: some orders are self-inverse and read the same either way, so
 * seeing both is what stops a coincidence being mistaken for a confirmation.
 * @param result The result being read
 * @param order The session's raceResult array
 * @returns One line per car, sorted by the position it claims
 */
export const asPositionPerCar = (result: RaceOut, order: readonly number[]): string[] => order
  .map((position, car) => ({ position, car }))
  .sort((a, b) => a.position - b.position)
  .map(({ position, car }) => `      P${String(position + 1).padStart(2)}  ${driverAt(result, car)}  (car ${car})`);

/**
 * Renders one session's raw shape, plus both readings of its raceResult.
 * @param result The result being read
 * @param session The session to render
 * @param index Where the session sits in the array, which is the only reliable
 * way to tell sessions apart - AC writes `event` as 0 on every one of them
 * @returns The lines to print
 */
export const describeSession = (
  result: RaceOut,
  session: RaceOutSession,
  index: number,
): string[] => {
  const lines = [
    `  [${index}] ${session.name}  (${sessionTypeName(session.type)})`,
    `      scheduled  ${session.lapsCount} laps, ${session.duration} min`,
    `      recorded   ${session.laps?.length ?? 0} laps, lapstotal ${JSON.stringify(session.lapstotal ?? [])}`,
  ];

  if (!session.raceResult) {
    lines.push('      raceResult absent');

    return lines;
  }

  lines.push(`      raceResult ${JSON.stringify(session.raceResult)}`);
  lines.push('', '    read as finishing order (raceResult[n] is the car that finished nth):');
  lines.push(...asFinishingOrder(result, session.raceResult));
  lines.push('', '    read as position per car (raceResult[car] is that car\'s position, from zero):');
  lines.push(...asPositionPerCar(result, session.raceResult));

  return lines;
};
