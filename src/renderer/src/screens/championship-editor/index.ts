export { ChampionshipEditor } from './ChampionshipEditor.tsx';

// The editing surface a race event of the player's own reuses: a class's
// cars, its field's offsets, an event's sessions and the rules are the same
// questions there as in a championship, so they are exported rather than
// copied. The career's own steps on a round's strength are drawn with the same
// AI box.
export { AiResult } from './AiResult.tsx';
export { AiResultSkeleton } from './AiResultSkeleton.tsx';
export { ChoiceChips } from './ChoiceChips.tsx';
export { ConditionsEditor } from './ConditionsEditor.tsx';
export { EligibilityField } from './EligibilityField.tsx';
export { GridFields } from './GridFields.tsx';
// A nation picked from the flags Assetto Corsa ships, which New career and a
// career's own settings ask for the driver's.
export { NationPicker } from './NationPicker.tsx';
export { OffsetStepper } from './OffsetStepper.tsx';
export { RulesCard } from './RulesCard.tsx';
// The race-control choices the editor offers, which the read-only rules list
// lights the chosen one of.
export { JUMP_START_CHOICES, TRACK_DEFAULT, TYRES_OUT_CHOICES } from './constants.ts';
export { GridFieldsSkeleton } from './GridFieldsSkeleton.tsx';
export { RulesCardSkeleton } from './RulesCardSkeleton.tsx';
export { SessionsSplit } from './SessionsSplit.tsx';
