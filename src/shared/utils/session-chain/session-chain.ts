// Which sessions of an event a session takes its order from, and what that
// chain says about how a field of several classes lines up. Shared because the
// event engine composes grids on it and the championship editor shows the same
// answer before anything has run.

import type { SessionDefinition } from '../../types/index.ts';

/**
 * The sessions whose classifications order a session, latest first.
 *
 * Two ways of producing one chain rather than two rules: a session naming an
 * `inherit.from` is followed back link by link, and one naming none falls back
 * to every qualifying before it, newest first - which is exactly what an event
 * did before links existed. A link that does not resolve is dropped, so an
 * event edited into an inconsistent shape still runs.
 * @param sessions The event's sessions, in the order they run
 * @param index Which session the chain leads into
 * @returns Positions in the list, the most recent first
 */
export const sessionChain = (sessions: readonly SessionDefinition[], index: number): number[] => {
  /**
   * Finds the session an id names among those before a position.
   * @param id The id
   * @param before The position it must come before
   * @returns Its position, or -1
   */
  const earlier = (id: string | undefined, before: number): number => (
    id === undefined ? -1 : sessions.findIndex((one, at) => at < before && one.id === id)
  );

  const declared = sessions[index]?.inherit?.from;
  if (declared === undefined) {
    return sessions.flatMap((one, at) => (at < index && one.type === 'qualify' ? [at] : [])).reverse();
  }

  const chain: number[] = [];
  // A cycle cannot be authored past validation, but a hand-edited event is not
  // validated - so the seen check is what stops this spinning.
  let at = earlier(declared, index);
  while (at >= 0 && !chain.includes(at)) {
    chain.push(at);
    at = earlier(sessions[at]?.inherit?.from, at);
  }

  return chain;
};

/**
 * Whether a session is a qualifying whose classes each run on their own.
 * @param session The session
 * @returns True for a qualifying run apart
 */
export const runsApart = (session: SessionDefinition | undefined): boolean => (
  session?.type === 'qualify' && session.classes === 'apart'
);

/**
 * Whether a race lines its classes up mixed on the order it follows rather
 * than one behind another.
 *
 * Behind a qualifying run apart no two classes set times against each other,
 * so they stand apart whatever the race says.
 * @param sessions The event's sessions, in the order they run
 * @param index Which session
 * @returns True for a race that mixes them
 */
export const mixesClasses = (sessions: readonly SessionDefinition[], index: number): boolean => (
  sessions[index]?.classGrid === 'mixed'
  && !sessionChain(sessions, index).some((at) => runsApart(sessions[at]))
);
