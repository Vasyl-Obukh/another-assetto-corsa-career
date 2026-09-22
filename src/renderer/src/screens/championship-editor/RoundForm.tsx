import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CLIMATES,
  DEFAULT_HEMISPHERE,
  DEFAULT_REF,
  HEMISPHERES,
  LENGTH_LABEL,
  MIN_MONEY,
  MIN_SESSION_LENGTH,
} from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { RowForm } from './RowForm.tsx';
import type { LengthUnit } from './types.ts';
import {
  lengthUnit, withLengthUnit, withRoundLength, withRoundLengthsPruned,
} from './utils.ts';
import type {
  Championship, Climate, Hemisphere, Round, Track,
} from '../../../../shared/types';
import { TrackPicker } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { formatOf, raceLabels, trackKeyOf } from '@/screens/championships';
import {
  Field, fromNumber, SESSION_TYPE_LABEL, toNumber,
} from '@/screens/race';

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
  // The races of the format the round runs, which it may give lengths of its
  // own. Only one with an id: an override names its session by id.
  const races = (formatOf(series, draft)?.sessions ?? [])
    .filter((session) => session.type === 'race' && session.id !== undefined);
  // Named as the calendar names them, so an unnamed race reads "Race" rather
  // than its id, and two of them are told apart.
  const labels = raceLabels(races.map((race) => race.name ?? null), t(SESSION_TYPE_LABEL.race));

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
          onValueChange={(value) => {
            const weekendFormat = value === DEFAULT_REF ? undefined : value;

            setDraft(withRoundLengthsPruned(series, { ...draft, weekendFormat }));
          }}
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

      {/* A race's own length at this round, over the format's: Monaco's shorter
          grand prix, or the real lap count where the distance comes to another
          on this track. Empty runs what the format says. */}
      {races.map((race, index) => {
        const id = race.id ?? '';
        const own = draft.sessionLengths?.find((length) => length.session === id);
        const unit = lengthUnit({ type: 'race', ...(own ?? race) });
        const fieldId = `${idPrefix}-length-${id}`;

        return (
          <Field
            key={id}
            id={fieldId}
            label={t('editor.calendar.raceLength', { name: labels[index] })}
            hint={own ? undefined : t('editor.calendar.raceLengthHint')}
          >
            <div className="flex items-center gap-2">
              <Select
                value={unit}
                disabled={locked}
                onValueChange={(value) => setDraft(withRoundLength(
                  draft,
                  id,
                  withLengthUnit({ ...own }, value as LengthUnit),
                ))}
              >
                <SelectTrigger aria-label={t('editor.sessions.lengthUnit')} className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laps">{t(LENGTH_LABEL.laps)}</SelectItem>
                  <SelectItem value="distance">{t(LENGTH_LABEL.distance)}</SelectItem>
                </SelectContent>
              </Select>

              <Input
                id={fieldId}
                type="number"
                className="min-w-0 flex-1"
                min={MIN_SESSION_LENGTH}
                value={fromNumber(own?.[unit])}
                placeholder={fromNumber(race[unit])}
                disabled={locked}
                onChange={(event) => {
                  const value = toNumber(event.target.value);

                  setDraft(withRoundLength(draft, id, value === undefined ? null : { [unit]: value }));
                }}
              />
            </div>
          </Field>
        );
      })}

      <NumberField
        id={`${idPrefix}-fee`}
        label={t('editor.calendar.entryFee')}
        hint={t('editor.calendar.entryFeeHint')}
        value={draft.entryFee}
        min={MIN_MONEY}
        disabled={locked}
        onChange={(entryFee) => setDraft({ ...draft, entryFee })}
      />

      {/* Only while the championship generates its weather: a climate means
          nothing to a calendar whose conditions are authored. */}
      {series.generatedWeather ? (
        <Field id={`${idPrefix}-climate`} label={t('editor.calendar.climate')}>
          <Select
            value={draft.climate ?? DEFAULT_REF}
            disabled={locked}
            onValueChange={(value) => setDraft({
              ...draft,
              climate: value === DEFAULT_REF ? undefined : value as Climate,
            })}
          >
            <SelectTrigger id={`${idPrefix}-climate`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_REF}>
                {t('editor.calendar.defaultClimate', {
                  climate: t(`climate.${series.generatedWeather.climate}`),
                })}
              </SelectItem>
              {CLIMATES.map((climate) => (
                <SelectItem key={climate} value={climate}>{t(`climate.${climate}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      {series.generatedWeather ? (
        <Field id={`${idPrefix}-hemisphere`} label={t('editor.calendar.hemisphere')}>
          <Select
            value={draft.hemisphere ?? DEFAULT_REF}
            disabled={locked}
            onValueChange={(value) => setDraft({
              ...draft,
              hemisphere: value === DEFAULT_REF ? undefined : value as Hemisphere,
            })}
          >
            <SelectTrigger id={`${idPrefix}-hemisphere`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_REF}>
                {t('editor.calendar.defaultHemisphere', {
                  hemisphere: t(`hemisphere.${series.generatedWeather.hemisphere ?? DEFAULT_HEMISPHERE}`),
                })}
              </SelectItem>
              {HEMISPHERES.map((hemisphere) => (
                <SelectItem key={hemisphere} value={hemisphere}>
                  {t(`hemisphere.${hemisphere}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

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
