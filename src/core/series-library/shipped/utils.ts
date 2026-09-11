// Constructors for the two things every shipped entry list is made of.
//
// An entry list is a table, and these keep each row to a line: written out as
// object literals, twenty drivers are a hundred and forty lines nobody can scan
// for a missing nationality.

import { TeamBudget } from '../../../shared/types/index.ts';
import type { Seat, Team } from '../../../shared/types/index.ts';

/**
 * Builds one team of a shipped championship.
 * @param id Stable identifier, unique within the championship
 * @param name Display name
 * @param nationality Full nationality name
 * @param nationCode Three-letter nation code
 * @param budget How well funded the team is
 * @returns The team
 */
export const team = (
  id: string,
  name: string,
  nationality: string,
  nationCode: string,
  budget: TeamBudget = TeamBudget.INDEPENDENT,
): Team => ({
  id, name, nationality, nationCode, budget,
});

/**
 * Builds one seat of a shipped championship.
 *
 * No car and no livery, which is true of everything the app ships: a shipped
 * championship cannot know which liveries a user's copy of a mod installs, so
 * pinning one is left to the editor.
 * @param id Stable identifier, unique across the championship
 * @param teamId Which team fields it
 * @param name Driver name
 * @param nationality Full nationality name
 * @param nationCode Three-letter nation code
 * @param aiLevel AI skill, where the class's own spread gets this seat wrong
 * @returns The seat
 */
export const seat = (
  id: string,
  teamId: string,
  name: string,
  nationality: string,
  nationCode: string,
  aiLevel?: number,
): Seat => ({
  id,
  team: teamId,
  driver: { name, nationality, nationCode },
  aiLevel,
});
