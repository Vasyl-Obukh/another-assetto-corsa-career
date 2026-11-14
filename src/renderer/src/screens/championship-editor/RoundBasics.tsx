import { useState } from 'react';


import { ChoiceChips } from './ChoiceChips.tsx';
import {
  CLIMATES, DEFAULT_HEMISPHERE, DEFAULT_REF, HEMISPHERES, LENGTH_LABEL, MIN_MONEY, MIN_SESSION_LENGTH,
} from './constants.ts';
import { GridFields } from './GridFields.tsx';
import { NumberField } from './NumberField.tsx';
import type { LengthUnit } from './types.ts';
import {
  lengthUnit, shownLength, storedLength, withLengthUnit, withRoundLength, withRoundLengthsPruned,
} from './utils.ts';
import { M_PER_KM } from '../../../../shared/constants';
import type {
  Championship, Climate, Hemisphere, Round, RoundAvailability, Track,
} from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { TrackPicker } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount, useUnits } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { CLIMATE_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { FormatStrip, raceLabels, trackKeyOf } from '@/screens/championships';
import { Field, fromNumber, toNumber } from '@/screens/race';
import { LayoutMap } from '@/screens/track-browser';

interface RoundBasicsProps {
  /**
   * The championship, for its formats, its fee and its climate.
   */
  series: Championship;
  /**
   * The round being edited.
   */
  round: Round;
  /**
   * What the round is missing on this install, or undefined before it has
   * been checked.
   */
  availability: RoundAvailability | undefined;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the round is a historic event's only one, which leaves out what
   * only a calendar of rounds has: a name of its own, a choice of format, an
   * entry fee and a step on the field's strength.
   */
  single?: boolean;
  /**
   * Called with the round whenever any of it changes.
   * @param next The round
   */
  onChange: (next: Round) => void;
}

/**
 * What a round is: its name and circuit, the event it runs and how long its
 * races are, what it costs, how strong its field is and what weather it
 * expects.
 */
export const RoundBasics = ({
  series, round, availability, locked, single = false, onChange,
}: RoundBasicsProps) => {
  const { t } = useKindTranslation();
  const { formatMoney } = useFormat();
  const units = useUnits();
  const [picking, setPicking] = useState(false);
  // Only a pick brings a circuit's name back - no channel resolves a list of
  // track keys - so an unpicked track shows its key.
  const [picked, setPicked] = useState<Track | null>(null);
  const name = useFocusOnMount<HTMLInputElement>();

  const trackKey = trackKeyOf(round);
  const fresh = picked?.key === trackKey ? picked : null;
  const idPrefix = `round-${round.id}`;
  const format = formatOf(series, round);
  // The races of the format the round runs, which it may give lengths of its
  // own. Only one with an id: an override names its session by id.
  const allRaces = (format?.sessions ?? []).filter((session) => session.type === 'race');
  const races = allRaces.filter((session) => session.id !== undefined);
  const labels = raceLabels(races.map((race) => race.name ?? null), t(SESSION_TYPE_LABEL.race));
  const weather = series.generatedWeather;

  return (
    <div className="flex flex-col gap-4">
      {single ? null : (
        <Field id={`${idPrefix}-name`} label={t('editor.calendar.name')}>
          <Input
            id={`${idPrefix}-name`}
            ref={name}
            value={round.name}
            disabled={locked}
            onChange={(event) => onChange({ ...round, name: event.target.value })}
          />
        </Field>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t('editor.calendar.track')}</span>
        <div className="grid gap-3 rounded-lg border p-2.5 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-muted">
            {trackKey === '' ? null : (
              <LayoutMap track={round.track} alt={round.name} className="p-2" iconClassName="size-6" />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <b className="block truncate">{trackKey === '' ? t('editor.calendar.noTrack') : fresh?.name ?? trackKey}</b>
              {fresh ? <span className="block truncate text-xs text-muted-foreground">{trackKey}</span> : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {fresh?.lengthM ? (
                <span>{units.format('distance', fresh.lengthM / M_PER_KM)}</span>
              ) : null}
              {fresh?.pitboxes ? <span>{t('editor.calendar.pitboxes', { count: fresh.pitboxes })}</span> : null}
              {availability?.track ? <Badge variant="destructive">{t('editor.calendar.missingTrack')}</Badge> : null}
              {availability?.pitboxes ? (
                <Badge variant="destructive">
                  {t('editor.calendar.tooFewPitboxes', {
                    available: availability.pitboxes.available, needed: availability.pitboxes.needed,
                  })}
                </Badge>
              ) : null}
            </div>
            <div>
              <Button type="button" size="sm" variant="outline" disabled={locked} onClick={() => setPicking(true)}>
                {t('editor.calendar.changeTrack')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {single ? null : (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Field id={`${idPrefix}-format`} label={t('editor.calendar.format')} hint={t('editor.calendar.formatHint')}>
            <Select
              value={round.eventFormat ?? DEFAULT_REF}
              disabled={locked}
              onValueChange={(value) => onChange(withRoundLengthsPruned(series, {
                ...round, eventFormat: value === DEFAULT_REF ? undefined : value,
              }))}
            >
              <SelectTrigger id={`${idPrefix}-format`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {series.eventFormats.map((one) => {
                  const value = one.id === series.defaultEventFormat ? DEFAULT_REF : one.id;

                  return (
                    <SelectItem key={one.id} value={value}>
                      <span className="flex items-center gap-2">
                        <FormatStrip sessions={one.sessions} />
                        {value === DEFAULT_REF ? t('editor.calendar.defaultNamed', { name: one.name }) : one.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>

          <NumberField
            id={`${idPrefix}-fee`}
            label={t('editor.calendar.entryFee')}
            hint={t('editor.calendar.entryFeeHint')}
            value={round.entryFee}
            min={MIN_MONEY}
            placeholder={t('editor.calendar.feeDefault', { fee: formatMoney(series.entryFee ?? 0) })}
            disabled={locked}
            onChange={(entryFee) => onChange({ ...round, entryFee })}
          />
        </div>
      )}

      {races.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('editor.calendar.raceLengths')}</span>
          {races.map((race, index) => {
            const id = race.id ?? '';
            const own = round.sessionLengths?.find((length) => length.session === id);
            const unit = lengthUnit({ type: 'race', ...(own ?? race) });
            // In the format's order of races, whichever carry an id.
            const laps = availability?.races[allRaces.indexOf(race)]?.laps;

            return (
              <div key={id} className="grid items-center gap-2 sm:grid-cols-[8rem_7rem_8rem_minmax(0,1fr)]">
                <Badge className={cn('w-fit', SESSION_ACCENT.race)}>{labels[index]}</Badge>
                <Input
                  type="number"
                  aria-label={t('editor.calendar.raceLength', { name: labels[index] })}
                  className="text-right tabular-nums"
                  min={MIN_SESSION_LENGTH}
                  value={fromNumber(shownLength(own?.[unit], unit, units))}
                  placeholder={fromNumber(shownLength(race[unit], unit, units))}
                  disabled={locked}
                  onChange={(event) => {
                    const value = toNumber(event.target.value);
                    const kept = storedLength(value, unit, units);
                    onChange(withRoundLength(round, id, kept === undefined ? null : { [unit]: kept }));
                  }}
                />
                <Select
                  value={unit}
                  disabled={locked}
                  onValueChange={(value) => onChange(
                    withRoundLength(round, id, withLengthUnit({ ...own }, value as LengthUnit)),
                  )}
                >
                  <SelectTrigger aria-label={t('editor.sessions.lengthUnit')} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laps">{t(LENGTH_LABEL.laps)}</SelectItem>
                    <SelectItem value="distance">{t(LENGTH_LABEL.distance, { unit: units.unit('distance') })}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  {laps ? t('editor.calendar.lapsHere', { count: laps }) : t('editor.calendar.raceLengthHint')}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* The field's two figures side by side; the climate's five choices get
            a row of their own rather than wrapping beside them. */}
        {single ? null : (
          <div className="max-w-3xl">
            <GridFields
              grid={round.grid ?? {}}
              above={[{ label: t('race.ai.championship'), grid: series.grid }]}
              own={t('race.ai.round')}
              idPrefix={`${idPrefix}-grid`}
              locked={locked}
              // Kept off the document once both are cleared, so a round that says
              // nothing about its field writes nothing.
              onChange={(grid) => onChange({
                ...round,
                grid: grid.strength === undefined && grid.aggression === undefined ? undefined : grid,
              })}
            />
          </div>
        )}

        {/* Only while the championship generates its weather: a climate means
            nothing to a calendar whose conditions are authored. */}
        {weather ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('editor.calendar.climate')}</span>
              <ChoiceChips<Climate | typeof DEFAULT_REF>
                label={t('editor.calendar.climate')}
                options={[DEFAULT_REF, ...CLIMATES]}
                value={round.climate ?? DEFAULT_REF}
                labelOf={(one) => {
                  if (one !== DEFAULT_REF) return t(`climate.${one}`);

                  return single ? t('historicEditor.eventClimate') : t('editor.calendar.championships');
                }}
                accentOf={(one) => (one === DEFAULT_REF ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : CLIMATE_ACCENT[one])}
                disabled={locked}
                onChange={(one) => onChange({ ...round, climate: one === DEFAULT_REF ? undefined : one })}
              />
              <span className="text-xs text-muted-foreground">
                {t('editor.calendar.climateHint', { climate: t(`climate.${weather.climate}`) })}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('editor.calendar.hemisphere')}</span>
              {/* Neutral on purpose: a setting, not a set with a colour. */}
              <ChoiceChips<Hemisphere | typeof DEFAULT_REF>
                label={t('editor.calendar.hemisphere')}
                options={[DEFAULT_REF, ...HEMISPHERES]}
                value={round.hemisphere ?? DEFAULT_REF}
                labelOf={(one) => (one === DEFAULT_REF
                  ? t('editor.calendar.defaultHemisphere', { hemisphere: t(`hemisphere.${weather.hemisphere ?? DEFAULT_HEMISPHERE}`) })
                  : t(`hemisphere.${one}`))}
                disabled={locked}
                onChange={(one) => onChange({ ...round, hemisphere: one === DEFAULT_REF ? undefined : one })}
              />
            </div>
          </div>
        ) : null}
      </div>

      <TrackPicker
        open={picking}
        selectedKey={trackKey === '' ? undefined : trackKey}
        gridSize={series.entries.reduce((total, entry) => total + entry.seats.length, 0)}
        onOpenChange={setPicking}
        onPick={(layout) => {
          setPicked(layout);
          onChange({ ...round, track: layout.layout ? { id: layout.id, layout: layout.layout } : { id: layout.id } });
        }}
      />
    </div>
  );
};
