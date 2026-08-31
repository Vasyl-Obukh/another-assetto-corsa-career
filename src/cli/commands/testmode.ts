import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { resolvePaths } from '../../core/paths/index.ts';

/**
 * Explains how to diff our race.ini against Content Manager's own output.
 * @returns Resolves once the instructions have been printed
 */
export const cmdTestMode = async (): Promise<void> => {
  const paths = await resolvePaths();
  const argumentsFile = path.join(
    process.env.LOCALAPPDATA ?? '',
    'AcTools Content Manager',
    'Arguments.txt',
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

       npm run dry
       fc out\\race.ini "${path.join(paths.cfg, 'race.ini')}"

  4. Remove the flag when you are done, or CM will never launch a race again.

Also worth adding, for a seamless career loop:

  --skip-all-results          skip CM's results screen between races
  --hide-race-cancel-button   stop accidental cancels mid-series
`);

  const existing = await readFile(argumentsFile, 'utf8').catch(() => null);
  if (existing) {
    console.log(`Arguments.txt currently contains:\n${existing.replace(/^/gm, '    ')}\n`);
  } else {
    console.log('Arguments.txt does not exist yet - create it with just that one line.\n');
  }
};
