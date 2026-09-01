import path from 'node:path';

import { readCmArguments, setCmArgument } from '../../core/cm-arguments/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { RACE_INI_TEST_MODE } from '../../shared/constants/index.ts';

/**
 * Turns race INI test mode on or off, and says what changed.
 *
 * Deliberately the only way to set it: the flag stops Content Manager launching
 * anything at all, so it is a debugging tool rather than something the app
 * should offer while somebody is trying to race.
 * @param enabled Whether the flag should be in Arguments.txt
 * @returns Resolves once the file has been written and the result printed
 */
const toggle = async (enabled: boolean): Promise<void> => {
  const before = await readCmArguments();
  const after = await setCmArgument(RACE_INI_TEST_MODE, enabled);

  const was = before.enabled.includes(RACE_INI_TEST_MODE);

  console.log(`\n  ${RACE_INI_TEST_MODE} is ${enabled ? 'on' : 'off'}${was === enabled ? ' already' : ''}.`);
  console.log(`  ${after.exists ? after.file : `${after.file} (removed - it would have been empty)`}\n`);

  if (enabled) {
    console.log('  Restart Content Manager for it to read this. Nothing will launch');
    console.log('  until you run `npm run testmode -- off`.\n');
  } else {
    console.log('  Restart Content Manager and it will launch races again.\n');
  }
};

/**
 * Explains how to diff our race.ini against Content Manager's own output.
 * @returns Resolves once the instructions have been printed
 */
const explain = async (): Promise<void> => {
  const paths = await resolvePaths();
  const args = await readCmArguments();

  console.log(`
Ground-truth diffing
--------------------
Content Manager can write race.ini without launching the game, which gives an
authoritative reference to diff ours against.

  1. Turn the flag on:

       npm run testmode -- on

     It writes ${RACE_INI_TEST_MODE} to:

       ${args.file}

  2. Restart Content Manager, set up the same race in Quick Drive, hit Go.
     Nothing launches; it just writes the INI.

  3. Diff:

       npm run dry
       fc out/race.ini "${path.join(paths.cfg, 'race.ini')}"

  4. Turn it off again, or CM will never launch a race:

       npm run testmode -- off

Content Manager also writes cfg/assists.ini in that same pass, which is how
the assists blob we send is checked without driving.

Two more flags are worth having, and the settings screen offers both:

  --skip-all-results          skip CM's results screen between races
  --hide-race-cancel-button   stop accidental cancels mid-series
`);

  if (args.exists) {
    console.log(`Arguments.txt sets: ${args.enabled.join(', ') || 'none of ours'}\n`);
  } else {
    console.log('Arguments.txt does not exist yet. `npm run testmode -- on` creates it.\n');
  }
};

/**
 * Prints the diffing procedure, or turns the flag on or off.
 * @param args The arguments after "testmode"
 * @returns Resolves once the command has run
 * @throws When given an argument that is neither "on" nor "off"
 */
export const cmdTestMode = async (args: string[]): Promise<void> => {
  const [action] = args;

  if (action === undefined) return explain();
  if (action === 'on') return toggle(true);
  if (action === 'off') return toggle(false);

  throw new Error(`Unknown argument "${action}". Use "on", "off", or nothing at all.`);
};
