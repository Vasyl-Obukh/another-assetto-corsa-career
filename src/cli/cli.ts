// The regression harness for src/core: race definition -> race.ini ->
// acmanager://race/config -> Content Manager -> AC -> race_out.json -> results.

import {
  cmdDry,
  cmdResults,
  cmdRun,
  cmdScan,
  cmdSeries,
  cmdTestMode,
  cmdWatch,
  cmdWeather,
  cmdWeekend,
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
    case 'results': return cmdResults(args);
    case 'weekend': return cmdWeekend(args);
    case 'series': return cmdSeries(args);
    case 'weather': return cmdWeather(args);
    case 'testmode': return cmdTestMode(args);
    default:
      throw new Error(
        `Unknown command: ${command}. `
        + 'Try scan, dry, run, weekend, series, watch, results, weather or testmode.',
      );
  }
};
