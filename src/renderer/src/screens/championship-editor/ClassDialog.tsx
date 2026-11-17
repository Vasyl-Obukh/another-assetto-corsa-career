import { LibraryIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';


import { ChoiceChips } from './ChoiceChips.tsx';
import {
  DEFAULT_CLASS_SEATS, MAX_CLASS_SEATS, TEAMS_ELSEWHERE, TEAMS_PICK,
} from './constants.ts';
import { EditorDialog } from './EditorDialog.tsx';
import { EligibilityField } from './EligibilityField.tsx';
import { OffsetStepper } from './OffsetStepper.tsx';
import { RuleHeading } from './RuleHeading.tsx';
import { RungPicker } from './RungPicker.tsx';
import { TeamSourcePicker } from './TeamSourcePicker.tsx';
import type { TeamSource } from './types.ts';
import { adoptedSeats, pitboxShort, startingSeats } from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type {
  Championship, ClassEntry, Discipline, Eligibility, SeriesAvailability, Team,
} from '../../../../shared/types';
import { fieldSize } from '../../../../shared/utils/field-size';
import { useClasses } from '@/app';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { disciplineKey } from '@/screens/championships';
import { Field, NOT_SET } from '@/screens/race';

interface ClassDialogProps {
  /**
   * The championship, for the classes a new one may take its teams from.
   */
  series: Championship;
  /**
   * The draft checked against what is installed, or null before the first
   * answer comes back.
   */
  checked: SeriesAvailability | null;
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
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
  /**
   * Called with the class as edited.
   * @param next The class entry
   * @param teams The teams that join the championship with it, taken from
   * another championship's class - none unless one was
   */
  onConfirm: (next: ClassEntry, teams: readonly Team[]) => void;
  /**
   * Called to close without keeping anything.
   */
  onCancel: () => void;
}

/**
 * A class's name, discipline and rung - and, for a new one, what it starts
 * with: its cars, a spec or a list, and a number of seats, so it is never born
 * with nothing to race.
 */
export const ClassDialog = ({
  series, checked, entry, adding, locked, nameOf, onConfirm, onCancel,
}: ClassDialogProps) => {
  const { t } = useKindTranslation();
  const { catalogue } = useClasses();
  const [draft, setDraft] = useState(entry);
  const [eligibility, setEligibility] = useState<Eligibility>(() => {
    const first = catalogue.specById.keys().next().value;
    return first === undefined ? entry.eligibility : { kind: 'spec', spec: first };
  });
  const [seats, setSeats] = useState(DEFAULT_CLASS_SEATS);
  // The field once the new class's seats join it.
  const grown = fieldSize(series) + seats;
  const short = pitboxShort(checked, grown);
  const [teamsFrom, setTeamsFrom] = useState<TeamSource | null>(null);
  const [picking, setPicking] = useState(false);
  const sourceEntry = teamsFrom?.series.entries.find((one) => one.id === teamsFrom.entry);
  const adopted = teamsFrom && !teamsFrom.own && sourceEntry
    ? adoptedSeats(series, teamsFrom.series, sourceEntry, seats)
    : null;
  const ownSources = series.entries.filter((one) => one.seats.some((seat) => seat.team !== undefined));
  let teamsValue = NOT_SET;
  if (teamsFrom) teamsValue = teamsFrom.own ? teamsFrom.entry : TEAMS_ELSEWHERE;
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `entry-${entry.id}`;
  // A list with nothing on it would start the class with nothing to race.
  const incomplete = adding && eligibility.kind === 'cars' && eligibility.cars.length === 0;

  /**
   * Takes a class's teams, and its number of seats with them.
   * @param source The class and where it is from
   */
  const takeFrom = (source: TeamSource): void => {
    setTeamsFrom(source);
    const count = source.series.entries.find((one) => one.id === source.entry)?.seats.length ?? 0;
    setSeats(Math.min(Math.max(count, 1), MAX_CLASS_SEATS));
  };

  /**
   * Answers the Teams from select: a class of this championship, none, or the
   * picker for another championship's.
   * @param value What was chosen
   */
  const chooseTeams = (value: string): void => {
    if (value === TEAMS_PICK) setPicking(true);
    else if (value === NOT_SET) setTeamsFrom(null);
    // Only a class this select lists: inside a form, Radix also answers with
    // an empty value when the class picked elsewhere arrives before its item.
    else if (ownSources.some((one) => one.id === value)) {
      takeFrom({ series, entry: value, own: true });
    }
  };

  /**
   * The class as it will be written - a new one given its cars and its seats -
   * and the teams that join the championship with it.
   * @returns The class entry and the teams
   */
  const confirmed = (): { entry: ClassEntry; teams: readonly Team[] } => {
    if (!adding) return { entry: draft, teams: [] };
    // From this championship a seat brings its team alone: its driver stays
    // where they are rather than racing two seats.
    const from = adopted?.seats
      ?? sourceEntry?.seats.map((seat) => (seat.team === undefined ? {} : { team: seat.team }))
      ?? [];

    return {
      entry: {
        ...draft,
        eligibility,
        seats: startingSeats(series, draft.id, seats, from),
      },
      teams: adopted?.teams ?? [],
    };
  };

  const teamsFact = adopted ? [
    ...(adopted.teams.length > 0 ? [t('editor.entries.teamsAdded', { count: adopted.teams.length })] : []),
    ...(adopted.reused > 0 ? [t('editor.entries.teamsHere', { count: adopted.reused })] : []),
  ].join(', ') : '';

  return (
    <EditorDialog
      caption={adding ? t('editor.entries.new') : undefined}
      title={adding ? t('editor.entries.adding', { name: series.name }) : draft.name}
      description={adding ? undefined : t('editor.entries.formHint')}
      note={incomplete ? t('editor.entries.needsCar') : undefined}
      confirmLabel={adding ? t('editor.entries.add') : t('editor.save')}
      locked={locked}
      incomplete={incomplete}
      className="sm:max-w-3xl"
      onConfirm={() => {
        const next = confirmed();
        onConfirm(next.entry, next.teams);
      }}
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
          tier={draft.ladder.tier}
          disabled={locked}
          onChange={(tier) => setDraft({ ...draft, ladder: { ...draft.ladder, tier } })}
        />
        <span className="text-xs text-muted-foreground">{t('editor.entries.tierHint')}</span>
      </div>

      {adding ? (
        <>
          <RuleHeading>{t('editor.entries.startWith')}</RuleHeading>
          <EligibilityField
            idPrefix={idPrefix}
            eligibility={eligibility}
            locked={locked}
            nameOf={nameOf}
            pictureSpec={false}
            onChange={setEligibility}
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
              {short.rounds > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-warning-foreground dark:text-warning">
                  <TriangleAlertIcon className="size-3.5 shrink-0" />
                  {t('editor.entries.tooFew', { count: short.rounds, field: grown })}
                </span>
              ) : null}
            </Field>
            <Field
              id={`${idPrefix}-teams-from`}
              label={t('editor.entries.teamsFrom')}
              hint={adopted ? undefined : t('editor.entries.teamsFromHint')}
            >
              <Select value={teamsValue} disabled={locked} onValueChange={chooseTeams}>
                <SelectTrigger id={`${idPrefix}-teams-from`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_SET}>{t('editor.entries.teamsFromNothing')}</SelectItem>
                  {ownSources.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>{t('editor.entries.teamsFromOwn')}</SelectLabel>
                      {ownSources.map((one) => (
                        <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                  {/* The class picked from another championship, beside where it is from. */}
                  {adopted && sourceEntry && teamsFrom ? (
                    <SelectItem value={TEAMS_ELSEWHERE}>
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0">{sourceEntry.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{teamsFrom.series.name}</span>
                      </span>
                    </SelectItem>
                  ) : null}
                  <SelectSeparator />
                  <SelectItem value={TEAMS_PICK}>
                    <span className="flex items-center gap-2">
                      <LibraryIcon />
                      {t('editor.entries.teamsFromPick')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {teamsFact === '' ? null : <span className="text-xs text-muted-foreground">{teamsFact}</span>}
            </Field>
          </div>
          <TeamSourcePicker open={picking} series={series} onOpenChange={setPicking} onPick={takeFrom} />
        </>
      ) : null}
    </EditorDialog>
  );
};
