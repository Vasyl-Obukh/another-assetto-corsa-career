// The two read screens and the championship card the settings tab manages
// the library through, plus the helpers the series editor shares with them -
// a discipline's translation key, a round's track key, and the resolution of a
// round's format and a session's points system against the championship's
// defaults. Deliberate copies of what src/core/series/ does, since the renderer
// may not import core, so the editor reuses these rather than copying again.

export { ChampionshipCard } from './ChampionshipCard.tsx';
export { ChampionshipDetail } from './ChampionshipDetail.tsx';
export { Championships } from './Championships.tsx';
export { OriginBadge } from './OriginBadge.tsx';

export {
  availabilityState, disciplineKey, formatOf, pointsOf, tierAccent, trackKeyOf,
} from './utils.ts';
