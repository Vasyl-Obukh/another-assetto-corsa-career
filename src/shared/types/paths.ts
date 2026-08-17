// Where Content Manager and Assetto Corsa live, and how confident we are about
// each answer. The probe types exist so the UI can show a half-configured
// install rather than only "it worked" or an exception.

import type { AppErrorInfo } from '../errors/types.ts';

/**
 * Every path the app needs, once all three have been located.
 */
export interface AcPaths {
  /**
   * Full path to Content Manager.exe.
   */
  contentManager: string;
  /**
   * The Assetto Corsa install root, the folder containing content/.
   */
  acRoot: string;
  /**
   * Documents\Assetto Corsa, where cfg/ and out/ live.
   */
  documents: string;
  /**
   * acRoot/content.
   */
  content: string;
  /**
   * documents/cfg, where AC reads race.ini from.
   */
  cfg: string;
  /**
   * documents/out, where AC writes results to.
   */
  out: string;
  /**
   * documents/out/race_out.json, overwritten by AC every session.
   */
  raceOut: string;
}

/**
 * Where a path candidate came from, in descending precedence.
 */
export type PathOrigin = 'override' | 'env' | 'registry' | 'steam' | 'default';

/**
 * One candidate location considered while probing.
 */
export interface PathCandidate {
  /**
   * The path that was tried.
   */
  value: string;
  /**
   * Which source suggested it.
   */
  origin: PathOrigin;
}

/**
 * The outcome of probing for one path.
 */
export interface PathProbe {
  /**
   * The chosen path, or the best candidate when none passed. Null if nothing was even a candidate.
   */
  value: string | null;
  /**
   * Where the chosen value came from, or null when there was no candidate.
   */
  origin: PathOrigin | null;
  /**
   * Passed its validity check - an AC root is judged by content/cars, not by merely existing.
   */
  exists: boolean;
  /**
   * Every candidate considered, so the UI can explain what was looked at.
   */
  tried: PathCandidate[];
  /**
   * Why the probe failed, absent when it succeeded. Carries a code so the UI can
   * translate it rather than printing the English rendering.
   */
  error?: AppErrorInfo;
}

/**
 * User-supplied paths, taking precedence over anything auto-detected.
 */
export interface PathOverrides {
  /**
   * Explicit path to Content Manager.exe.
   */
  contentManager?: string;
  /**
   * Explicit Assetto Corsa install root.
   */
  acRoot?: string;
  /**
   * Explicit Documents\Assetto Corsa folder.
   */
  documents?: string;
}

/**
 * The result of probing for all three paths at once.
 */
export interface PathsReport {
  /**
   * Probe result for Content Manager.exe.
   */
  contentManager: PathProbe;
  /**
   * Probe result for the Assetto Corsa install root.
   */
  acRoot: PathProbe;
  /**
   * Probe result for the Documents folder.
   */
  documents: PathProbe;
  /**
   * Populated only when all three probes passed.
   */
  derived: AcPaths | null;
}
