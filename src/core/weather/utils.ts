import { readFile } from 'node:fs/promises';

import { parseIni } from '../ini/index.ts';

/**
 * Reads one key out of an INI file, treating anything unreadable as absent.
 *
 * These are CSP's own config files, which may not exist on an install that has
 * never opened the settings for that module.
 * @param file The file to read
 * @param section The section to look in
 * @param key The key to read
 * @returns Its raw value, or null when the file or the key is not there
 */
export const readIniValue = async (
  file: string,
  section: string,
  key: string,
): Promise<string | null> => {
  try {
    const text = await readFile(file, 'utf8');

    return parseIni(text)[section]?.[key]?.trim() ?? null;
  } catch {
    return null;
  }
};
