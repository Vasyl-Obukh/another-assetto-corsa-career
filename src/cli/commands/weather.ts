import path from 'node:path';

import { resolvePaths } from '../../core/paths/index.ts';
import {
  CAREER_WEATHERS,
  installCareerWeathers,
  removeCareerWeathers,
} from '../../core/weather/index.ts';

/**
 * Installs or removes the career weather presets.
 * @param args Command arguments; the first is "install" or "remove"
 * @returns Resolves once the change has been made and reported
 * @throws When the action is neither install nor remove
 */
export const cmdWeather = async (args: string[]): Promise<void> => {
  const paths = await resolvePaths();
  const action = args[0] ?? 'install';

  if (action === 'remove') {
    const removed = await removeCareerWeathers(paths.content);
    console.log(`\nRemoved ${removed.length} career weathers from ${path.join(paths.content, 'weather')}\n`);
    return;
  }
  if (action !== 'install') {
    throw new Error('Usage: node spike.ts weather [install|remove]');
  }

  const installed = await installCareerWeathers(paths.content);
  console.log(`\nInstalled ${installed.length} career weathers into ${path.join(paths.content, 'weather')}:`);

  CAREER_WEATHERS.forEach((preset) => {
    const rain = preset.intensity > 0
      ? `rain ${preset.intensity}, wetness ${preset.wetness}, water ${preset.water}`
      : 'dry';
    console.log(`  ${preset.id.padEnd(22)} type ${String(preset.type).padStart(2)}  ${rain}`);
  });

  console.log('\nEach carries a [RAINFX] section, which PURE reads directly instead of');
  console.log('resolving the weather type. Undo with: node spike.ts weather remove\n');
};
