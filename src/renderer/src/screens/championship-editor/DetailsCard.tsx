
import { ChoiceChips } from './ChoiceChips.tsx';
import {
  CLIMATES, DEFAULT_CLIMATE, DEFAULT_HEMISPHERE, DEFAULT_REF, HEMISPHERES, MIN_MONEY, SEASON_LENGTHS, WEEKDAYS,
} from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { PaneHeading } from './PaneHeading.tsx';
import { SwitchLine } from './SwitchLine.tsx';
import { optionalText } from './utils.ts';
import { DEFAULT_SEASON_LENGTH } from '../../../../shared/constants';
import type {
  Championship, Climate, Hemisphere, SeasonLength, Weekday,
} from '../../../../shared/types';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useKindTranslation } from '@/i18n';
import { CLIMATE_ACCENT } from '@/lib/accents';
import { Field } from '@/screens/race';

interface DetailsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Whether an event of it is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether it is a historic event, which has no season to run: no length and
   * no race day of its own, since a career places it - only what entering it
   * without an invitation costs, and where its weather comes from.
   */
  historic?: boolean;
  /**
   * Called with the whole championship whenever any of these fields changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const DetailsCard = ({
  series, locked, historic = false, onChange,
}: DetailsCardProps) => {
  const { t } = useKindTranslation();
  const weather = series.generatedWeather;

  return (
    // Two panes rather than one form: what the championship is called, and how
    // its season runs, are two different questions.
    <Card className="grid gap-0 py-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 p-6">
        <PaneHeading>{t('editor.details.identity')}</PaneHeading>

        {/* No id field on purpose: it is minted, never read, and never changes. */}
        <Field id="editor-name" label={t('editor.details.name')}>
          <Input
            id="editor-name"
            value={series.name}
            disabled={locked}
            onChange={(event) => onChange({ ...series, name: event.target.value })}
          />
        </Field>

        <Field id="editor-description" label={t('editor.details.description')}>
          <Textarea
            id="editor-description"
            className="min-h-28"
            value={series.description ?? ''}
            disabled={locked}
            onChange={(event) => onChange({
              ...series,
              description: optionalText(event.target.value),
            })}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-4 border-t p-6 lg:border-t-0 lg:border-l">
        <PaneHeading>{t(historic ? 'historicEditor.weather' : 'editor.details.season')}</PaneHeading>

        {/* What entering costs without an invitation, the one figure of a
            season a historic event keeps. */}
        {historic ? (
          <NumberField
            id="editor-entry-fee"
            label={t('editor.details.entryFee')}
            hint={t('historicEditor.entryFeeHint')}
            value={series.entryFee}
            min={MIN_MONEY}
            disabled={locked}
            onChange={(entryFee) => onChange({ ...series, entryFee })}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="editor-entry-fee"
              label={t('editor.details.entryFee')}
              hint={t('editor.details.entryFeeShort')}
              value={series.entryFee}
              min={MIN_MONEY}
              disabled={locked}
              onChange={(entryFee) => onChange({ ...series, entryFee })}
            />

            <Field
              id="editor-season-length"
              label={t('editor.details.seasonLength')}
              hint={t('editor.details.seasonLengthShort')}
            >
              <Select
                value={series.seasonLength ?? DEFAULT_SEASON_LENGTH}
                disabled={locked}
                onValueChange={(value) => onChange({
                  ...series,
                  seasonLength: value as SeasonLength,
                })}
              >
                <SelectTrigger id="editor-season-length" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASON_LENGTHS.map((length) => (
                    <SelectItem key={length} value={length}>{t(`seasonLength.${length}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="editor-race-weekday"
              label={t('editor.details.raceWeekday')}
              hint={t('editor.details.raceWeekdayShort')}
            >
              <Select
                value={series.raceWeekday ?? DEFAULT_REF}
                disabled={locked}
                onValueChange={(value) => onChange({
                  ...series,
                  raceWeekday: value === DEFAULT_REF ? undefined : value as Weekday,
                })}
              >
                <SelectTrigger id="editor-race-weekday" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DEFAULT_REF}>{t('weekday.byTier')}</SelectItem>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day} value={day}>{t(`weekday.${day}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}

        <SwitchLine
          id="editor-generated-weather"
          label={t('editor.details.generatedWeather')}
          hint={t('editor.details.generatedWeatherShort')}
          value={weather !== undefined}
          disabled={locked}
          // Switched on at the middle climate, since on means "from a climate"
          // and there is no way to say which without picking one.
          onChange={(on) => onChange({
            ...series,
            generatedWeather: on ? { climate: DEFAULT_CLIMATE } : undefined,
          })}
        />

        {weather ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('editor.details.climate')}</span>
            {/* In the climate's own colour, as its badge is everywhere else. */}
            <ChoiceChips<Climate>
              label={t('editor.details.climate')}
              options={CLIMATES}
              value={weather.climate}
              labelOf={(climate) => t(`climate.${climate}`)}
              accentOf={(climate) => CLIMATE_ACCENT[climate]}
              disabled={locked}
              onChange={(climate) => onChange({
                ...series,
                generatedWeather: { ...weather, climate },
              })}
            />
          </div>
        ) : null}

        {weather ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('editor.details.hemisphere')}</span>
            {/* Neutral on purpose: which half of the world is a setting, not
                something any other screen shows as a chip to match. */}
            <ChoiceChips<Hemisphere>
              label={t('editor.details.hemisphere')}
              options={HEMISPHERES}
              value={weather.hemisphere ?? DEFAULT_HEMISPHERE}
              labelOf={(hemisphere) => t(`hemisphere.${hemisphere}`)}
              disabled={locked}
              onChange={(hemisphere) => onChange({
                ...series,
                generatedWeather: { ...weather, hemisphere },
              })}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
};
