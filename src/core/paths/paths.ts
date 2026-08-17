// Locating Content Manager's exe, the AC install root, and AC's Documents
// folder.
//
// Two layers: probePaths reports what was found and never throws, so the UI can
// show a half-configured install; resolvePaths insists on all three.

import os from 'node:os';
import path from 'node:path';

import {
  AC_DOCUMENTS_FOLDER,
  REG_ACMANAGER_COMMAND,
  REG_PERSONAL_VALUE,
  REG_STEAM,
  REG_STEAM_PATH_VALUE,
  REG_USER_SHELL_FOLDERS,
} from './constants.ts';
import {
  exists, listCandidates, pick, probeError, regQuery,
} from './utils.ts';
import { AC_ROOT_MARKER, AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type {
  AcPaths, PathCandidate, PathOverrides, PathProbe, PathsReport,
} from '../../shared/types/index.ts';

/**
 * Probes for Content Manager.exe.
 *
 * Found from the acmanager:// protocol registration, overridden by settings and
 * then by the CM_PATH environment variable.
 * @param overrides Paths the user has set by hand
 * @returns Where CM was found, or why it was not
 */
export const probeContentManager = async (overrides: PathOverrides = {}): Promise<PathProbe> => {
  const tried: PathCandidate[] = [];
  if (overrides.contentManager) tried.push({ value: overrides.contentManager, origin: 'override' });
  if (process.env.CM_PATH) tried.push({ value: process.env.CM_PATH, origin: 'env' });

  const command = await regQuery(REG_ACMANAGER_COMMAND);
  if (command) {
    // The command is `"<exe>" "%1"` - take the first quoted token.
    const quoted = /"([^"]+)"/.exec(command);
    const exe = quoted?.[1] ?? command.split(' ')[0];
    if (exe) tried.push({ value: exe, origin: 'registry' });
  }

  return pick(
    tried,
    exists,
    appErrorInfo('paths.contentManager.unregistered'),
    (candidates) => appErrorInfo('paths.contentManager.notFound', {
      tried: listCandidates(candidates),
    }),
  );
};

/**
 * Probes for the Assetto Corsa install root.
 *
 * CM normally sits inside it; Steam's registry entry is the fallback.
 * @param overrides Paths the user has set by hand
 * @param cmPath Where CM was found, whose folder is a strong candidate
 * @returns Where AC was found, or why it was not
 */
export const probeAcRoot = async (
  overrides: PathOverrides = {},
  cmPath?: string,
): Promise<PathProbe> => {
  const tried: PathCandidate[] = [];
  if (overrides.acRoot) tried.push({ value: overrides.acRoot, origin: 'override' });
  if (process.env.AC_ROOT) tried.push({ value: process.env.AC_ROOT, origin: 'env' });
  if (cmPath) tried.push({ value: path.dirname(cmPath), origin: 'registry' });

  const steam = await regQuery(REG_STEAM, REG_STEAM_PATH_VALUE);
  if (steam) {
    const dir = path.join(steam.replace(/\//g, '\\'), 'steamapps', 'common', 'assettocorsa');
    tried.push({ value: dir, origin: 'steam' });
  }

  // A folder is only the AC root if the content it is supposed to hold is there.
  return pick(
    tried,
    (dir) => exists(path.join(dir, 'content', 'cars')),
    appErrorInfo('paths.acRoot.undetected', { marker: AC_ROOT_MARKER }),
    (candidates) => appErrorInfo('paths.acRoot.notFound', {
      marker: AC_ROOT_MARKER,
      tried: listCandidates(candidates),
    }),
  );
};

/**
 * Probes for Documents\Assetto Corsa, where cfg/ and out/ live.
 *
 * OneDrive relocates Documents routinely, so the registry value wins over the
 * naive guess.
 * @param overrides Paths the user has set by hand
 * @returns Where the folder was found, or why it was not
 */
export const probeAcDocuments = async (overrides: PathOverrides = {}): Promise<PathProbe> => {
  const tried: PathCandidate[] = [];
  if (overrides.documents) tried.push({ value: overrides.documents, origin: 'override' });
  if (process.env.AC_DOCUMENTS) tried.push({ value: process.env.AC_DOCUMENTS, origin: 'env' });

  const personal = await regQuery(REG_USER_SHELL_FOLDERS, REG_PERSONAL_VALUE);
  if (personal) {
    const expanded = personal.replace(/%([^%]+)%/g, (_, name: string) => process.env[name] ?? `%${name}%`);
    tried.push({ value: path.join(expanded, AC_DOCUMENTS_FOLDER), origin: 'registry' });
  }
  tried.push({ value: path.join(os.homedir(), 'Documents', AC_DOCUMENTS_FOLDER), origin: 'default' });
  tried.push({
    value: path.join(os.homedir(), 'OneDrive', 'Documents', AC_DOCUMENTS_FOLDER),
    origin: 'default',
  });

  return pick(
    tried,
    exists,
    appErrorInfo('paths.documents.undetected'),
    (candidates) => appErrorInfo('paths.documents.notFound', {
      tried: listCandidates(candidates),
    }),
  );
};

/**
 * Probes for everything we know about where AC lives, without insisting it is
 * all there.
 * @param overrides Paths the user has set by hand
 * @returns A per-path report, with derived populated only when all three passed
 */
export const probePaths = async (overrides: PathOverrides = {}): Promise<PathsReport> => {
  const contentManager = await probeContentManager(overrides);
  const acRoot = await probeAcRoot(
    overrides,
    contentManager.exists ? contentManager.value ?? undefined : undefined,
  );
  const documents = await probeAcDocuments(overrides);

  const complete = contentManager.exists && acRoot.exists && documents.exists;
  const derived = complete && contentManager.value && acRoot.value && documents.value
    ? {
      contentManager: contentManager.value,
      acRoot: acRoot.value,
      documents: documents.value,
      content: path.join(acRoot.value, 'content'),
      cfg: path.join(documents.value, 'cfg'),
      out: path.join(documents.value, 'out'),
      raceOut: path.join(documents.value, 'out', 'race_out.json'),
    }
    : null;

  return {
    contentManager, acRoot, documents, derived,
  };
};

/**
 * Resolves every path at once, insisting on all three. Every CLI command starts
 * here.
 * @param overrides Paths the user has set by hand
 * @returns Every path the app needs
 * @throws When any of the three could not be found
 */
export const resolvePaths = async (overrides: PathOverrides = {}): Promise<AcPaths> => {
  const report = await probePaths(overrides);

  if (!report.derived) {
    const failed = [report.contentManager, report.acRoot, report.documents]
      .find((probe) => !probe.exists);
    throw failed ? probeError(failed) : new AppError('paths.unresolved');
  }

  return report.derived;
};

/**
 * Resolves the path to Content Manager.exe.
 * @param overrides Paths the user has set by hand
 * @returns The full path to the executable
 * @throws When CM could not be found
 */
export const findContentManager = async (overrides: PathOverrides = {}): Promise<string> => {
  const probe = await probeContentManager(overrides);
  if (!probe.exists || !probe.value) throw probeError(probe);
  return probe.value;
};

/**
 * Resolves the Assetto Corsa install root.
 * @param cmPath Where CM was found, whose folder is a strong candidate
 * @param overrides Paths the user has set by hand
 * @returns The install root
 * @throws When the root could not be found
 */
export const findAcRoot = async (
  cmPath?: string,
  overrides: PathOverrides = {},
): Promise<string> => {
  const probe = await probeAcRoot(overrides, cmPath);
  if (!probe.exists || !probe.value) throw probeError(probe);
  return probe.value;
};

/**
 * Resolves the Documents\Assetto Corsa folder.
 * @param overrides Paths the user has set by hand
 * @returns The folder path
 * @throws When the folder could not be found
 */
export const findAcDocuments = async (overrides: PathOverrides = {}): Promise<string> => {
  const probe = await probeAcDocuments(overrides);
  if (!probe.exists || !probe.value) throw probeError(probe);
  return probe.value;
};
