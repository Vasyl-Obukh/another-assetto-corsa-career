import { useTranslation } from 'react-i18next';

import { TRACK_STATES } from './constants.ts';
import type { TrackState } from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Discipline } from '../../../../shared/types';
import { FilterRail, RailOption, RailSection, toggledIn } from '@/components';
import { DISCIPLINE_DOT, TRACK_STATE_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface TracksRailProps {
  /**
   * The states picked; every circuit while none is.
   */
  states: readonly TrackState[];
  /**
   * The disciplines picked; every circuit while none is.
   */
  disciplines: readonly Discipline[];
  /**
   * How many circuits have a layout in each state, or null while being read.
   */
  stateCounts: Readonly<Record<TrackState, number>> | null;
  /**
   * How many circuits championships of each discipline race.
   */
  disciplineCounts: Readonly<Record<Discipline, number>>;
  /**
   * Called with the states picked.
   * @param next The states
   */
  onStates: (next: TrackState[]) => void;
  /**
   * Called with the disciplines picked.
   * @param next The disciplines
   */
  onDisciplines: (next: Discipline[]) => void;
}

/**
 * The Tracks tab's filters: where each layout stands, and which disciplines
 * race the circuit. Each list OR'd, as every rail's are.
 */
export const TracksRail = ({
  states, disciplines, stateCounts, disciplineCounts, onStates, onDisciplines,
}: TracksRailProps) => {
  const { t } = useTranslation();

  return (
    <FilterRail
      filtered={states.length > 0 || disciplines.length > 0}
      onClear={() => { onStates([]); onDisciplines([]); }}
    >
      <RailSection
        title={t('recommendedTracks.filter.state')}
        picked={states.map((state) => t(`recommendedTracks.filter.${state}`))}
      >
        {TRACK_STATES.map((state) => (
          <RailOption
            key={state}
            label={t(`recommendedTracks.filter.${state}`)}
            count={stateCounts?.[state] ?? null}
            checked={states.includes(state)}
            lead={<i aria-hidden className={cn('size-2 shrink-0 rounded-full', TRACK_STATE_DOT[state])} />}
            onToggle={() => onStates(toggledIn(states, state))}
          />
        ))}
      </RailSection>

      <RailSection
        title={t('recommendedTracks.filter.discipline')}
        picked={disciplines.map((discipline) => t(`championships.discipline.${discipline}`))}
      >
        {DISCIPLINES.map((discipline) => (
          <RailOption
            key={discipline}
            label={t(`championships.discipline.${discipline}`)}
            count={disciplineCounts[discipline]}
            checked={disciplines.includes(discipline)}
            lead={<i aria-hidden className={cn('size-2 shrink-0 rounded-full', DISCIPLINE_DOT[discipline])} />}
            onToggle={() => onDisciplines(toggledIn(disciplines, discipline))}
          />
        ))}
      </RailSection>
    </FilterRail>
  );
};
