import { FileTextIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  CLIMATES, DEFAULT_CLIMATE, DEFAULT_HEMISPHERE, HEMISPHERES, MIN_MONEY, SEASON_LENGTHS,
} from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { NumberField } from './NumberField.tsx';
import { optionalText } from './utils.ts';
import { DEFAULT_SEASON_LENGTH } from '../../../../shared/constants';
import type {
  Championship, Climate, Hemisphere, SeasonLength,
} from '../../../../shared/types';
import { FieldGrid, ToggleButton } from '@/components';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Field } from '@/screens/race';

interface DetailsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Whether a weekend of it is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever any of these fields changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const DetailsCard = ({ series, locked, onChange }: DetailsCardProps) => {
  const { t } = useTranslation();

  return (
    <EditorSection
      icon={<FileTextIcon />}
      title={t('editor.details.title')}
      className="flex flex-col gap-4"
    >
      {/* No id field on purpose: it is minted, never read, and never changes. */}
      <FieldGrid>
        <Field id="editor-name" label={t('editor.details.name')}>
          <Input
            id="editor-name"
            value={series.name}
            disabled={locked}
            onChange={(event) => onChange({ ...series, name: event.target.value })}
          />
        </Field>

        <NumberField
          id="editor-entry-fee"
          label={t('editor.details.entryFee')}
          hint={t('editor.details.entryFeeHint')}
          value={series.entryFee}
          min={MIN_MONEY}
          disabled={locked}
          onChange={(entryFee) => onChange({ ...series, entryFee })}
        />

        <Field
          id="editor-season-length"
          label={t('editor.details.seasonLength')}
          hint={t('editor.details.seasonLengthHint')}
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
          id="editor-generated-weather"
          label={t('editor.details.generatedWeather')}
          hint={t('editor.details.generatedWeatherHint')}
        >
          <ToggleButton
            id="editor-generated-weather"
            value={series.generatedWeather !== undefined}
            disabled={locked}
            // Switched on at the middle climate, since on means "from a climate"
            // and there is no way to say which without picking one.
            onChange={(on) => onChange({
              ...series,
              generatedWeather: on ? { climate: DEFAULT_CLIMATE } : undefined,
            })}
          />
        </Field>

        {series.generatedWeather ? (
          <Field id="editor-climate" label={t('editor.details.climate')}>
            <Select
              value={series.generatedWeather.climate}
              disabled={locked}
              onValueChange={(value) => onChange({
                ...series,
                generatedWeather: { ...series.generatedWeather, climate: value as Climate },
              })}
            >
              <SelectTrigger id="editor-climate" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIMATES.map((climate) => (
                  <SelectItem key={climate} value={climate}>{t(`climate.${climate}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {series.generatedWeather ? (
          <Field id="editor-hemisphere" label={t('editor.details.hemisphere')}>
            <Select
              value={series.generatedWeather.hemisphere ?? DEFAULT_HEMISPHERE}
              disabled={locked}
              onValueChange={(value) => onChange({
                ...series,
                generatedWeather: {
                  ...series.generatedWeather,
                  climate: series.generatedWeather?.climate ?? DEFAULT_CLIMATE,
                  hemisphere: value as Hemisphere,
                },
              })}
            >
              <SelectTrigger id="editor-hemisphere" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEMISPHERES.map((hemisphere) => (
                  <SelectItem key={hemisphere} value={hemisphere}>
                    {t(`hemisphere.${hemisphere}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </FieldGrid>

      <Field id="editor-description" label={t('editor.details.description')}>
        <Textarea
          id="editor-description"
          className="max-w-4xl"
          value={series.description ?? ''}
          disabled={locked}
          onChange={(event) => onChange({
            ...series,
            description: optionalText(event.target.value),
          })}
        />
      </Field>
    </EditorSection>
  );
};
