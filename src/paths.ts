// Locating Content Manager's exe, the AC install root, and AC's Documents
// folder. All discovered rather than hardcoded -- CM's acmanager:// protocol
// registration is both the launch mechanism and the way to find where it lives.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, constants } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { AcPaths } from './types.ts';

const exec = promisify(execFile);

async function exists(target: string): Promise<boolean> {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function regQuery(key: string, value?: string): Promise<string | null> {
  const args = ['query', key, ...(value ? ['/v', value] : ['/ve'])];
  try {
    const { stdout } = await exec('reg.exe', args, { windowsHide: true });
    // Lines look like:  (Default)    REG_SZ    "C:\path\Content Manager.exe" "%1"
    const match = /REG_(?:SZ|EXPAND_SZ)\s+(.*)$/m.exec(stdout);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Path to Content Manager.exe, from the acmanager:// protocol registration.
 * Override with the CM_PATH environment variable.
 */
export async function findContentManager(): Promise<string> {
  if (process.env.CM_PATH) return process.env.CM_PATH;

  const command = await regQuery('HKEY_CLASSES_ROOT\\acmanager\\shell\\open\\command');
  if (!command) {
    throw new Error(
      'acmanager:// is not registered. Open Content Manager once (Settings > '
      + 'Content Manager > Integration) so it registers the protocol, or set CM_PATH.',
    );
  }

  // The command is `"<exe>" "%1"` -- take the first quoted token.
  const quoted = /"([^"]+)"/.exec(command);
  const exe = quoted?.[1] ?? command.split(' ')[0] ?? '';
  if (!await exists(exe)) {
    throw new Error(`acmanager:// points at a missing file: ${exe}`);
  }
  return exe;
}

/** AC's install root. CM normally sits inside it; Steam's registry entry is the fallback. */
export async function findAcRoot(cmPath?: string): Promise<string> {
  const candidates: string[] = [];
  if (process.env.AC_ROOT) candidates.push(process.env.AC_ROOT);
  if (cmPath) candidates.push(path.dirname(cmPath));

  const steam = await regQuery('HKEY_CURRENT_USER\\Software\\Valve\\Steam', 'SteamPath');
  if (steam) {
    candidates.push(path.join(steam.replace(/\//g, '\\'), 'steamapps', 'common', 'assettocorsa'));
  }

  for (const dir of candidates) {
    if (await exists(path.join(dir, 'content', 'cars'))) return dir;
  }

  throw new Error(
    `Could not find the Assetto Corsa install root. Tried: ${candidates.join(', ') || '(nothing)'}. `
    + 'Set AC_ROOT to point at it.',
  );
}

/**
 * `Documents\Assetto Corsa`, where cfg/ and out/ live. OneDrive relocates
 * Documents routinely, so the registry value wins over the naive guess.
 */
export async function findAcDocuments(): Promise<string> {
  if (process.env.AC_DOCUMENTS) return process.env.AC_DOCUMENTS;

  const candidates: string[] = [];
  const personal = await regQuery(
    'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders',
    'Personal',
  );
  if (personal) {
    const expanded = personal.replace(/%([^%]+)%/g, (_, name: string) => process.env[name] ?? `%${name}%`);
    candidates.push(path.join(expanded, 'Assetto Corsa'));
  }
  candidates.push(path.join(os.homedir(), 'Documents', 'Assetto Corsa'));
  candidates.push(path.join(os.homedir(), 'OneDrive', 'Documents', 'Assetto Corsa'));

  for (const dir of candidates) {
    if (await exists(dir)) return dir;
  }

  throw new Error(
    `Could not find the Assetto Corsa Documents folder. Tried: ${candidates.join(', ')}. `
    + 'Set AC_DOCUMENTS to point at it.',
  );
}

/** Resolve everything at once. Every command starts by calling this. */
export async function resolvePaths(): Promise<AcPaths> {
  const contentManager = await findContentManager();
  const acRoot = await findAcRoot(contentManager);
  const documents = await findAcDocuments();

  return {
    contentManager,
    acRoot,
    documents,
    content: path.join(acRoot, 'content'),
    cfg: path.join(documents, 'cfg'),
    out: path.join(documents, 'out'),
    raceOut: path.join(documents, 'out', 'race_out.json'),
  };
}
