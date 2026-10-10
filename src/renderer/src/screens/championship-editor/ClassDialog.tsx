import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceChips } from './ChoiceChips.tsx';
import {
  DEFAULT_CLASS_SEATS, MAX_CLASS_SEATS, MIN_TIER,
} from './constants.ts';
import { EditorDialog } from './EditorDialog.tsx';
import { OffsetStepper } from './OffsetStepper.tsx';
import { RuleHeading } from './RuleHeading.tsx';
import { RungPicker } from './RungPicker.tsx';
import { startingSeats } from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Championship, ClassEntry, Discipline } from '../../../../shared/types';
import { useClasses } from '@/app';
import { SpecField } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { disciplineKey } from '@/screens/championships';
import { Field, NOT_SET } from '@/screens/race';

interface ClassDialogProps {
  /**
   * The championship, for the classes a new one may take its teams from.
   */
  series: Championship;
  /**
   * The class as it stands, or the one being added.
   */
  entry: ClassEntry;
  /**
   * Whether it is a new class, which is what offers what it starts with.
   */
  adding: boolean;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the class as edited.
   * @param next The class entry
   */
  onConfirm: (next: ClassEntry) => void;
  /**
   * Called to close without keeping anything.
   */
  onCancel: () => void;
}

/**
 * A class's name, discipline and rung - and, for a new one, what it starts
 * with: a grid of cars and a number of seats, so it is never born with nothing
 * to race.
 */
export const ClassDialog = ({
  series, entry, adding, locked, onConfirm, onCancel,
}: ClassDialogProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [draft, setDraft] = useState(entry);
  const [spec, setSpec] = useState<string>(() => catalogue.specById.keys().next().value ?? '');
  const [seats, setSeats] = useState(DEFAULT_CLASS_SEATS);
  const [teamsFrom, setTeamsFrom] = useState<string>(NOT_SET);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `entry-${entry.id}`;

  /**
   * The class as it will be written: a new one given its cars and its seats.
   * @returns The class entry
   */
  const confirmed = (): ClassEntry => {
    if (!adding) return draft;
    const source = series.entries.find((one) => one.id === teamsFrom);

    return {
      ...draft,
      eligibility: spec === '' ? draft.eligibility : { kind: 'spec', spec },
      seats: startingSeats(series, draft.id, seats, source?.seats.map((seat) => seat.team) ?? []),
    };
  };

  return (
    <EditorDialog
      caption={adding ? t('editor.entries.new') : undefined}
      title={adding ? t('editor.entries.adding', { name: series.name }) : draft.name}
      description={adding ? undefined : t('editor.entries.formHint')}
      confirmLabel={adding ? t('editor.entries.add') : t('editor.save')}
      locked={locked}
      className="sm:max-w-3xl"
      onConfirm={() => onConfirm(confirmed())}
      onCancel={onCancel}
    >
      <Field id={`${idPrefix}-name`} label={t('editor.entries.name')}>
        <Input
          id={`${idPrefix}-name`}
          ref={name}
          value={draft.name}
          disabled={locked}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t('editor.entries.discipline')}</span>
        {/* Each in its own hue, as the discipline chips are everywhere. */}
        <ChoiceChips<Discipline>
          label={t('editor.entries.discipline')}
          options={DISCIPLINES}
          value={draft.ladder.discipline}
          labelOf={(discipline) => t(disciplineKey(discipline))}
          accentOf={(discipline) => DISCIPLINE_ACCENT[discipline]}
          disabled={locked}
          onChange={(discipline) => setDraft({ ...draft, ladder: { ...draft.ladder, discipline } })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t('editor.entries.rung')}</span>
        <RungPicker
          idPrefix={idPrefix}
          tier={draft.ladder.tier}
          disabled={locked}
          onChange={(tier) => setDraft({ ...draft, ladder: { ...draft.ladder, tier: Math.max(MIN_TIER, tier) } })}
        />
        <span className="text-xs text-muted-foreground">{t('editor.entries.tierHint')}</span>
      </div>

      {adding ? (
        <>
          <RuleHeading>{t('editor.entries.startWith')}</RuleHeading>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id={`${idPrefix}-spec`} label={t('editor.entries.startCars')} hint={t('editor.entries.startCarsHint')}>
              <SpecField id={`${idPrefix}-spec`} value={spec} disabled={locked} onChange={setSpec} />
            </Field>
            <Field id={`${idPrefix}-seats`} label={t('editor.entries.startSeats')} hint={t('editor.entries.startSeatsHint')}>
              <OffsetStepper
                id={`${idPrefix}-seats`}
                label={t('editor.entries.startSeats')}
                value={seats}
                min={1}
                limit={MAX_CLASS_SEATS}
                signed={false}
                disabled={locked}
                onChange={(next) => setSeats(next ?? 1)}
              />
            </Field>
            <Field id={`${idPrefix}-teams-from`} label={t('editor.entries.teamsFrom')} hint={t('editor.entries.teamsFromHint')}>
              <Select value={teamsFrom} disabled={locked} onValueChange={setTeamsFrom}>
                <SelectTrigger id={`${idPrefix}-teams-from`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_SET}>{t('editor.entries.teamsFromNothing')}</SelectItem>
                  {series.entries.map((one) => (
                    <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </>
      ) : null}
    </EditorDialog>
  );
};
