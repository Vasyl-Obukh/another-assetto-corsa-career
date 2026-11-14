// CLI entry point. The commands themselves live in src/cli/.
//
//   npm run scan          list installed content, check the race is runnable
//   npm run dry           generate race.ini to out/, launch nothing
//   npm run race          launch the race and wait for results
//   npm run watch         wait for the next race_out.json on its own
//   npm run weather --    install or remove a probe weather plan
//   npm run testmode --   turn CM's race INI test mode on or off, or explain it
//
// Through npm, not `node spike.ts` directly: the scripts pass
// --experimental-transform-types, without which Node cannot run our enums.

import { DEFAULT_COMMAND, main } from './src/cli/index.ts';

const [, , command = DEFAULT_COMMAND, ...rest] = process.argv;

try {
  await main(command, rest);
} catch (error) {
  console.error(`\n  ${(error as Error).message}\n`);
  process.exitCode = 1;
}
