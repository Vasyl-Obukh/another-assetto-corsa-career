// Integration spike: race definition -> race.ini -> acmanager://race/config ->
// Content Manager -> AC (with CSP/PURE intact) -> race_out.json -> results.

import {
  cmdDry, cmdRun, cmdScan, cmdTestMode, cmdWatch, cmdWeather,
} from './commands/index.ts';

export { DEFAULT_COMMAND } from './constants.ts';

/**
 * Dispatches a CLI command.
 * @param command Which command to run
 * @param args Everything after the command name
 * @returns Resolves once the command has finished
 * @throws When the command is not one we know
 */
export const main = async (command: string, args: string[]): Promise<void> => {
  switch (command) {
    case 'scan': return cmdScan();
    case 'dry': return cmdDry(args);
    case 'run': return cmdRun(args);
    case 'watch': return cmdWatch();
    case 'weather': return cmdWeather(args);
    case 'testmode': return cmdTestMode();
    default:
      throw new Error(`Unknown command: ${command}. Try scan, dry, run, watch, weather or testmode.`);
  }
};
