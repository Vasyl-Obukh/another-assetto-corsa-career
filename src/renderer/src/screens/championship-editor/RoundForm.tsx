import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_REF, MIN_MONEY } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { RowForm } from './RowForm.tsx';
import type { Championship, Round, Track } from '../../../../shared/types';
import { TrackPicker } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { trackKeyOf } from '@/screens/championships';
import { Field } from '@/screens/race';

interface RoundFormProps {
  /**
   * The championship, for the formats a round may run.
   */
  series: Championship;
  /**
   * The round as it stands, which seeds the draft. Read once, on mount.
   */
  round: Round;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the round to commit.
   * @param next The round as edited
   */
  onConfirm: (next: Round) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const RoundForm = ({
  series, round, locked, onConfirm, onCancel,
}: RoundFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(round);
  const [picking, setPicking] = useState(false);
  // Only a pick brings a circuit's name back - no channel resolves a list of
  // track keys - so an unpicked track shows its key.
  const [picked, setPicked] = useState<Track | null>(null);
  const name = useFocusOnMount<HTMLInputElement>();

  const trackKey = trackKeyOf(draft);
  const trackName = picked?.key === trackKey ? picked.name : trackKey;
  const idPrefix = `round-${round.id}`;

  return (
    // Name, circuit, format and fee - short enough to be one line.
    <RowForm columns={4} locked={locked} onConfirm={() => onConfirm(draft)} onCancel={onCancel}>
      <Field id={`${idPrefix}-name`} label={t('editor.calendar.name')}>
        <Input
          id={`${idPrefix}-name`}
          ref={name}
          value={draft.name}
          disabled={locked}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>

      <Field id={`${idPrefix}-track`} label={t('editor.calendar.track')}>
        <Button
          id={`${idPrefix}-track`}
          type="button"
          variant="outline"
          className="justify-start font-normal"
          disabled={locked}
          onClick={() => setPicking(true)}
        >
          <span className="truncate">
            {trackKey === '' ? t('editor.calendar.noTrack') : trackName}
          </span>
        </Button>
      </Field>

      <Field id={`${idPrefix}-format`} label={t('editor.calendar.format')}>
        <Select
          value={draft.weekendFormat ?? DEFAULT_REF}
          disabled={locked}
          onValueChange={(value) => setDraft({
            ...draft,
            weekendFormat: value === DEFAULT_REF ? undefined : value,
          })}
        >
          <SelectTrigger id={`${idPrefix}-format`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_REF}>{t('editor.calendar.defaultFormat')}</SelectItem>
            {series.weekendFormats.map((format) => (
              <SelectItem key={format.id} value={format.id}>{format.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <NumberField
        id={`${idPrefix}-fee`}
        label={t('editor.calendar.entryFee')}
        hint={t('editor.calendar.entryFeeHint')}
        value={draft.entryFee}
        min={MIN_MONEY}
        disabled={locked}
        onChange={(entryFee) => setDraft({ ...draft, entryFee })}
      />

      <TrackPicker
        open={picking}
        selectedKey={trackKey === '' ? undefined : trackKey}
        onOpenChange={setPicking}
        onPick={(layout) => {
          setPicked(layout);
          setDraft({
            ...draft,
            track: layout.layout ? { id: layout.id, layout: layout.layout } : { id: layout.id },
          });
        }}
      />
    </RowForm>
  );
};
