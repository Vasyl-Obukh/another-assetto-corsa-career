import type {
  Assists,
  Conditions,
  GridDefinition,
  RaceSetup,
  SessionDefinition,
  Track,
} from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * The race setup screen's whole surface.
 *
 * Every mutation sends the whole definition back to main, which owns it: the
 * renderer holds a read-only projection and sends intent, never a patch, so the
 * rules that decide whether a race is runnable live in exactly one place.
 */
export interface RaceSetupState {
  /**
   * The race, its plan, its progress and its problems, or null before the first
   * response.
   */
  setup: RaceSetup | null;
  /**
   * Whether the first load is still in flight.
   */
  loading: boolean;
  /**
   * Whether a change or a launch is being applied.
   */
  busy: boolean;
  /**
   * Whether the race can be handed over right now.
   */
  runnable: boolean;
  /**
   * Whether the weekend has started, in which case its setup is fixed until it
   * is reset - a launch inherits its grid from the one before, and that
   * inheritance means nothing once the sessions have changed underneath it.
   */
  locked: boolean;
  /**
   * Whatever the last action failed with, or null.
   */
  error: DisplayableError | null;
  /**
   * Replaces the track and layout.
   * @param layout The chosen layout
   */
  setTrack(layout: Track): void;
  /**
   * Replaces the player's car and the livery it races in.
   * @param model The chosen car's folder ID
   * @param skin The chosen livery's folder name, or undefined for none
   */
  setCar(model: string, skin?: string): void;
  /**
   * Replaces the AI field's description.
   * @param grid The grid to apply
   */
  setGrid(grid: GridDefinition): void;
  /**
   * Replaces the session list wholesale.
   * @param sessions The sessions, in the order they run
   */
  setSessions(sessions: SessionDefinition[]): void;
  /**
   * Replaces the weather, time and track state.
   * @param conditions The conditions to apply
   */
  setConditions(conditions: Conditions): void;
  /**
   * Replaces the regulations - what the rules allow, rather than the driving
   * aids, which belong to the player and live in settings.
   * @param assists The assists to apply
   */
  setAssists(assists: Assists): void;
  /**
   * Hands the next launch that has not been run to Content Manager.
   */
  launch(): void;
  /**
   * Stops waiting for a result, without advancing the weekend.
   */
  cancel(): void;
  /**
   * Forgets the weekend's progress so it starts again from its first launch.
   */
  reset(): void;
  /**
   * Clears the last error.
   */
  dismissError(): void;
}
